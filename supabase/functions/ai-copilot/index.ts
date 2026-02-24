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

    // Verify admin
    const { data: admin } = await serviceClient
      .from("admins")
      .select("id, name, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!admin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    // Fetch context data in parallel
    const [metricsResult, insightsResult] = await Promise.all([
      serviceClient.rpc("get_dashboard_metrics"),
      serviceClient
        .from("ai_insights")
        .select("title, summary, severity, insight_type, generated_at")
        .eq("is_dismissed", false)
        .order("generated_at", { ascending: false })
        .limit(10),
    ]);

    const metrics = metricsResult.data ?? {};
    const insights = insightsResult.data ?? [];

    const insightsContext = insights.length > 0
      ? `\n\nRecent AI Insights:\n${insights.map((i: any) => `- [${i.severity?.toUpperCase()}] ${i.title}: ${i.summary}`).join("\n")}`
      : "";

    const systemPrompt = `You are the RISE Intelligence Copilot — an AI assistant for the RISE Holding loyalty program command center. You help administrators of NOIR Café and SASSO restaurant brands manage their loyalty ecosystem.

CURRENT METRICS:
- Total Members: ${(metrics as any)?.totalMembers ?? "N/A"}
- Active Members: ${(metrics as any)?.activeMembers ?? "N/A"}
- Visits This Month: ${(metrics as any)?.totalVisitsThisMonth ?? "N/A"}
- VIP Guests: ${(metrics as any)?.vipGuestsCount ?? "N/A"}
- Churn Risk Count: ${(metrics as any)?.churnRiskCount ?? "N/A"}
- Visits by Brand: NOIR ${(metrics as any)?.visitsByBrand?.noir ?? 0}, SASSO ${(metrics as any)?.visitsByBrand?.sasso ?? 0}
- Visits by Region: Doha ${(metrics as any)?.visitsByCountry?.doha ?? 0}, Riyadh ${(metrics as any)?.visitsByCountry?.riyadh ?? 0}
- Tier Distribution: ${JSON.stringify((metrics as any)?.tierDistribution ?? {})}
${insightsContext}

BRANDS: NOIR Café (premium café), SASSO (Italian restaurant)
CITIES: Doha (Qatar), Riyadh (Saudi Arabia)
TIERS: Initiation → Connoisseur → Elite → Inner Circle → RISE Black

ADMIN: ${admin.name} (${admin.role})

GUIDELINES:
- Be concise, data-driven, and actionable
- Use markdown formatting: bold for key numbers, tables for comparisons, bullet points for lists
- When suggesting actions, be specific (e.g., "Navigate to Campaigns to create a re-engagement campaign targeting 334K dormant members")
- Reference specific admin panel sections when relevant: Loyalty Dashboard, Members Management, Points Engine, Rewards Control, Tiers System, Campaigns, Segmentation, Analytics, CRM Contacts, AI Intelligence
- Speak with authority about the luxury hospitality industry
- If asked about data you don't have, suggest running AI predictions or checking specific admin sections
- Keep responses under 300 words unless detailed analysis is requested`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
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
    console.error("ai-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
