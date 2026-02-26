import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth check
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get member_id
    const { data: memberId } = await serviceClient.rpc("get_member_id", { _user_id: user.id });
    if (!memberId) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    // Fetch member data in parallel
    const [memberResult, visitsResult, tierResult, pointsResult, rewardsResult] = await Promise.all([
      serviceClient.from("members").select("*").eq("id", memberId).maybeSingle(),
      serviceClient
        .from("visits")
        .select("id, brand, visit_datetime, notes, locations(name, city)")
        .eq("member_id", memberId)
        .eq("is_voided", false)
        .order("visit_datetime", { ascending: false })
        .limit(20),
      serviceClient
        .from("member_tiers")
        .select("tier_id, tiers(name, min_visits, min_points, color, sort_order)")
        .eq("member_id", memberId)
        .maybeSingle(),
      serviceClient
        .from("points_ledger")
        .select("points_delta, reason, reference_type, created_at")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })
        .limit(10),
      serviceClient
        .from("rewards")
        .select("title_en, points_cost, description_en")
        .eq("is_active", true)
        .order("points_cost", { ascending: true })
        .limit(5),
    ]);

    const member = memberResult.data;
    const visits = visitsResult.data ?? [];
    const tierInfo = (tierResult.data as any)?.tiers;
    const recentPoints = pointsResult.data ?? [];
    const availableRewards = rewardsResult.data ?? [];

    // Calculate behavioral patterns
    const now = new Date();
    const lastVisit = visits[0] ? new Date(visits[0].visit_datetime) : null;
    const daysSinceLastVisit = lastVisit
      ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Visit frequency analysis
    const last30DayVisits = visits.filter((v: any) => {
      const d = new Date(v.visit_datetime);
      return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
    }).length;

    // Brand preference
    const brandCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    const dayOfWeekCounts: Record<number, number> = {};
    visits.forEach((v: any) => {
      brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1;
      const loc = (v.locations as any)?.name || "Unknown";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      const dow = new Date(v.visit_datetime).getDay();
      dayOfWeekCounts[dow] = (dayOfWeekCounts[dow] || 0) + 1;
    });

    const favBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";
    const favLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
    const favDay = Object.entries(dayOfWeekCounts).sort((a, b) => b[1] - a[1])[0];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const preferredDay = favDay ? dayNames[Number(favDay[0])] : "unknown";

    // Tier progression
    const allTiers = await serviceClient.from("tiers").select("*").eq("is_active", true).order("min_visits", { ascending: true });
    const tiers = allTiers.data ?? [];
    const currentTierIndex = tiers.findIndex((t: any) => t.id === tierInfo?.id || t.name === tierInfo?.name);
    const nextTier = tiers[currentTierIndex + 1];
    const visitsToNextTier = nextTier ? nextTier.min_visits - (member?.total_visits || 0) : 0;

    // Affordable rewards
    const affordableRewards = availableRewards.filter((r: any) => r.points_cost <= (member?.total_points || 0));

    const systemPrompt = `You are the RISE Personal Companion — an exclusive AI concierge assigned personally to ${member?.full_name || "this member"}. You serve the RISE Holding luxury loyalty ecosystem (NOIR Café and SASSO Italian Fine Dining).

YOUR PERSONALITY:
- Warm, elegant, and genuinely caring — like a trusted maître d' who remembers everything
- Never robotic, never salesy, never pushy
- Speak with understated luxury — you whisper privilege, you don't shout promotions
- Use the member's first name naturally
- Be concise but thoughtful — under 150 words unless asked for detail

MEMBER PROFILE:
- Name: ${member?.full_name || "Member"}
- First Name: ${member?.full_name?.split(" ")[0] || "there"}
- Phone: ${member?.phone || "N/A"}
- City: ${member?.city || "Doha"}
- Status: ${member?.status || "active"}
- VIP: ${member?.is_vip ? "Yes" : "No"}
- Total Visits: ${member?.total_visits || 0}
- Total Points: ${member?.total_points || 0}
- Current Tier: ${tierInfo?.name || "Initiation"}
- Member Since: ${member?.created_at ? new Date(member.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "recently"}

VISIT INTELLIGENCE:
- Last Visit: ${lastVisit ? `${daysSinceLastVisit} days ago at ${(visits[0] as any)?.locations?.name || "a RISE venue"} (${visits[0]?.brand})` : "No visits recorded yet"}
- Visits This Month: ${last30DayVisits}
- Favorite Brand: ${favBrand}
- Favorite Location: ${favLocation}
- Preferred Day: ${preferredDay}
- Recent Visits: ${visits.slice(0, 5).map((v: any) => `${v.brand} at ${(v.locations as any)?.name || "unknown"} (${new Date(v.visit_datetime).toLocaleDateString()})`).join(", ") || "none"}

TIER PROGRESSION:
- Current Tier: ${tierInfo?.name || "Initiation"}
${nextTier ? `- Next Tier: ${nextTier.name} (${visitsToNextTier} visits away)` : "- At highest tier"}
${visitsToNextTier <= 3 && visitsToNextTier > 0 ? "- ⚡ CLOSE TO UPGRADE — mention this excitedly but elegantly" : ""}

POINTS & REWARDS:
- Points Balance: ${member?.total_points || 0}
- Recent Points Activity: ${recentPoints.slice(0, 3).map((p: any) => `${p.points_delta > 0 ? "+" : ""}${p.points_delta} (${p.reason})`).join(", ") || "none"}
- Affordable Rewards: ${affordableRewards.map((r: any) => `${r.title_en} (${r.points_cost} pts)`).join(", ") || "none currently affordable"}

BEHAVIORAL INSIGHTS:
${daysSinceLastVisit !== null && daysSinceLastVisit > 14 ? `- INACTIVE for ${daysSinceLastVisit} days — gently acknowledge you've missed them` : ""}
${last30DayVisits >= 4 ? "- HIGH ENGAGEMENT — celebrate their dedication" : ""}
${last30DayVisits === 0 ? "- No visits this month — softly encourage a return" : ""}

GUIDELINES:
- Always greet warmly by first name on first message
- Reference their actual visit data — never fabricate visits
- When they ask about points/tier, give exact numbers
- Suggest visits at their preferred location and day when relevant
- If close to a tier upgrade, mention it naturally
- If they can afford a reward, mention it as an exclusive opportunity
- Never say "as an AI" or "I don't have access" — you ARE their concierge
- Use elegant markdown: **bold** for key numbers, but keep it minimal
- For tier names use: Initiation → Connoisseur → Elite → Inner Circle → RISE Black
- Brands: NOIR Café (specialty coffee) and SASSO (Italian fine dining)
- Cities: Doha (Qatar) and Riyadh (Saudi Arabia)

TONE EXAMPLES:
✓ "It's been 9 days since your last visit to NOIR Al Hazm. Shall we make it this Friday?"
✓ "You're only 2 visits away from Elite status. The momentum is yours."
✓ "With 450 points, you've unlocked the Signature Tasting Menu at SASSO."
✗ "Based on my analysis of your data patterns..." (too robotic)
✗ "Don't miss out on this limited time offer!" (too salesy)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Please wait a moment before trying again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("member-companion error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
