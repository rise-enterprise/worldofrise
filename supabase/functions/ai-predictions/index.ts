import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MemberData {
  id: string;
  full_name: string;
  total_visits: number;
  total_points: number;
  last_visit_date: string | null;
  created_at: string;
  brand_affinity: string | null;
  city: string;
  is_vip: boolean;
  tier_name: string | null;
  visit_history: { visit_datetime: string; brand: string }[];
  redemption_count: number;
  total_points_redeemed: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    // Verify admin
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await userClient.auth.getUser();
    if (claimsErr || !claims.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: adminCheck } = await adminClient
      .from("admins")
      .select("id")
      .eq("user_id", claims.user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, member_ids, limit: batchLimit } = await req.json();

    if (action === "batch_predict") {
      // Fetch members for prediction (top N by visits or specific IDs)
      let query = adminClient
        .from("members")
        .select(`
          id, full_name, total_visits, total_points, last_visit_date, 
          created_at, brand_affinity, city, is_vip,
          member_tiers!inner(tiers(name))
        `)
        .eq("status", "active");

      if (member_ids?.length) {
        query = query.in("id", member_ids);
      } else {
        query = query.order("total_visits", { ascending: false }).limit(batchLimit || 50);
      }

      const { data: members, error: membersErr } = await query;
      if (membersErr) throw membersErr;

      const predictions: any[] = [];

      for (const member of members || []) {
        // Fetch visit history
        const { data: visits } = await adminClient
          .from("visits")
          .select("visit_datetime, brand")
          .eq("member_id", member.id)
          .eq("is_voided", false)
          .order("visit_datetime", { ascending: false })
          .limit(50);

        // Fetch redemption count
        const { count: redemptionCount } = await adminClient
          .from("redemptions")
          .select("id", { count: "exact", head: true })
          .eq("member_id", member.id);

        const { data: pointsSpent } = await adminClient
          .from("redemptions")
          .select("points_spent")
          .eq("member_id", member.id)
          .in("status", ["approved", "fulfilled"]);

        const totalRedeemed = (pointsSpent || []).reduce((s, r) => s + r.points_spent, 0);

        // Calculate predictions using heuristic model
        const churn = calculateChurnScore(member, visits || []);
        const ltv = calculateLTV(member, visits || []);
        const segment = assignSmartSegment(member, visits || [], redemptionCount || 0, totalRedeemed);

        predictions.push({
          member_id: member.id,
          churn,
          ltv,
          segment,
        });

        // Store predictions
        const predictionRows = [
          {
            member_id: member.id,
            prediction_type: "churn",
            score: churn.score,
            label: churn.label,
            confidence: churn.confidence,
            metadata_json: { factors: churn.factors },
          },
          {
            member_id: member.id,
            prediction_type: "ltv",
            score: ltv.projected12m,
            label: ltv.tier,
            confidence: ltv.confidence,
            metadata_json: { projected6m: ltv.projected6m, projected12m: ltv.projected12m, monthlyAvg: ltv.monthlyAvg },
          },
          {
            member_id: member.id,
            prediction_type: "segment",
            score: null,
            label: segment.name,
            confidence: segment.confidence,
            metadata_json: { reason: segment.reason },
          },
        ];

        await adminClient.from("ai_predictions").insert(predictionRows);
      }

      // Generate AI summary insight if we have the API key
      let aiSummary = null;
      if (lovableApiKey && predictions.length > 0) {
        aiSummary = await generateAISummary(lovableApiKey, predictions);
        if (aiSummary) {
          await adminClient.from("ai_insights").insert({
            insight_type: "general",
            title: aiSummary.title,
            summary: aiSummary.summary,
            details_json: aiSummary.details,
            severity: aiSummary.severity,
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        predictions_count: predictions.length,
        summary: aiSummary,
        predictions,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_predictions") {
      const { data, error } = await adminClient
        .from("ai_predictions")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      return new Response(JSON.stringify({ predictions: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_insights") {
      const { data, error } = await adminClient
        .from("ai_insights")
        .select("*")
        .eq("is_dismissed", false)
        .order("generated_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(JSON.stringify({ insights: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-predictions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateChurnScore(
  member: any,
  visits: { visit_datetime: string; brand: string }[]
) {
  const now = new Date();
  const factors: string[] = [];
  let score = 0;

  // Recency factor (0-40 points)
  if (member.last_visit_date) {
    const daysSinceVisit = Math.floor(
      (now.getTime() - new Date(member.last_visit_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceVisit > 90) { score += 40; factors.push(`No visit in ${daysSinceVisit} days`); }
    else if (daysSinceVisit > 60) { score += 30; factors.push(`Last visit ${daysSinceVisit} days ago`); }
    else if (daysSinceVisit > 30) { score += 20; factors.push(`Last visit ${daysSinceVisit} days ago`); }
    else if (daysSinceVisit > 14) { score += 10; factors.push(`Last visit ${daysSinceVisit} days ago`); }
  } else {
    score += 35;
    factors.push("No visit date recorded");
  }

  // Frequency factor (0-30 points)
  const totalVisits = member.total_visits || 0;
  const memberAgeDays = Math.max(1, Math.floor(
    (now.getTime() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const visitsPerMonth = (totalVisits / memberAgeDays) * 30;

  if (visitsPerMonth < 0.5) { score += 30; factors.push("Very low visit frequency"); }
  else if (visitsPerMonth < 1) { score += 20; factors.push("Low visit frequency"); }
  else if (visitsPerMonth < 2) { score += 10; factors.push("Moderate visit frequency"); }

  // Velocity factor - declining visits (0-20 points)
  if (visits.length >= 4) {
    const recentHalf = visits.slice(0, Math.floor(visits.length / 2));
    const olderHalf = visits.slice(Math.floor(visits.length / 2));
    const recentSpan = recentHalf.length > 1
      ? (new Date(recentHalf[0].visit_datetime).getTime() - new Date(recentHalf[recentHalf.length - 1].visit_datetime).getTime()) / (1000 * 60 * 60 * 24)
      : 30;
    const olderSpan = olderHalf.length > 1
      ? (new Date(olderHalf[0].visit_datetime).getTime() - new Date(olderHalf[olderHalf.length - 1].visit_datetime).getTime()) / (1000 * 60 * 60 * 24)
      : 30;
    const recentRate = recentHalf.length / Math.max(1, recentSpan) * 30;
    const olderRate = olderHalf.length / Math.max(1, olderSpan) * 30;

    if (recentRate < olderRate * 0.5) { score += 20; factors.push("Visit frequency declining sharply"); }
    else if (recentRate < olderRate * 0.75) { score += 10; factors.push("Visit frequency declining"); }
  }

  // Engagement factor (0-10 points)
  if (member.total_points > 100 && !member.is_vip) { score += 5; factors.push("Has unused points"); }
  if (totalVisits <= 1) { score += 10; factors.push("Single visit only"); }

  score = Math.min(100, Math.max(0, score));

  const label = score >= 70 ? "high_risk" : score >= 40 ? "at_risk" : "safe";
  const confidence = Math.min(0.95, 0.5 + (visits.length / 50) * 0.45);

  return { score, label, confidence: Math.round(confidence * 100) / 100, factors };
}

function calculateLTV(
  member: any,
  visits: { visit_datetime: string; brand: string }[]
) {
  const now = new Date();
  const memberAgeDays = Math.max(1, Math.floor(
    (now.getTime() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const memberAgeMonths = memberAgeDays / 30;

  // Estimate monthly visit rate
  const totalVisits = member.total_visits || 0;
  const monthlyVisitRate = totalVisits / Math.max(1, memberAgeMonths);

  // Estimate average spend per visit (using points as proxy - 1 point ≈ $1 spend)
  const avgSpendPerVisit = totalVisits > 0 ? (member.total_points || 0) / totalVisits * 10 : 25;

  const monthlyValue = monthlyVisitRate * avgSpendPerVisit;
  const projected6m = Math.round(monthlyValue * 6);
  const projected12m = Math.round(monthlyValue * 12);

  let tier: string;
  if (projected12m >= 5000) tier = "platinum";
  else if (projected12m >= 2000) tier = "gold";
  else if (projected12m >= 500) tier = "silver";
  else tier = "bronze";

  const confidence = Math.min(0.9, 0.3 + (totalVisits / 30) * 0.6);

  return {
    projected6m,
    projected12m,
    monthlyAvg: Math.round(monthlyValue),
    tier,
    confidence: Math.round(confidence * 100) / 100,
  };
}

function assignSmartSegment(
  member: any,
  visits: { visit_datetime: string; brand: string }[],
  redemptionCount: number,
  totalRedeemed: number
) {
  const now = new Date();
  const totalVisits = member.total_visits || 0;
  const daysSinceVisit = member.last_visit_date
    ? Math.floor((now.getTime() - new Date(member.last_visit_date).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const memberAgeDays = Math.floor(
    (now.getTime() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const visitsPerMonth = (totalVisits / Math.max(1, memberAgeDays)) * 30;

  // Future VIP: high frequency, not yet VIP
  if (!member.is_vip && visitsPerMonth >= 3 && totalVisits >= 8) {
    return { name: "future_vip", reason: "High visit frequency trending toward VIP status", confidence: 0.8 };
  }

  // Reward abuser: high redemption-to-visit ratio
  if (totalVisits > 5 && redemptionCount > 0 && redemptionCount / totalVisits > 0.5) {
    return { name: "reward_abuser", reason: "Unusually high redemption-to-visit ratio", confidence: 0.7 };
  }

  // Dormant likely to reactivate: was active, recently inactive, has points
  if (daysSinceVisit > 30 && daysSinceVisit < 90 && totalVisits >= 5 && (member.total_points || 0) > 50) {
    return { name: "dormant_reactivatable", reason: "Previously active with unredeemed points", confidence: 0.75 };
  }

  // High-margin buyer: high points (proxy for spend) per visit
  const avgPointsPerVisit = totalVisits > 0 ? (member.total_points || 0) / totalVisits : 0;
  if (avgPointsPerVisit > 50 && totalVisits >= 3) {
    return { name: "high_margin", reason: "High spend per visit pattern", confidence: 0.7 };
  }

  // New promising: joined recently with good early engagement
  if (memberAgeDays < 60 && totalVisits >= 3) {
    return { name: "new_promising", reason: "Strong early engagement pattern", confidence: 0.65 };
  }

  // Loyal steady: consistent visitors
  if (visitsPerMonth >= 1 && visitsPerMonth < 3 && daysSinceVisit < 30) {
    return { name: "loyal_steady", reason: "Consistent regular visitor", confidence: 0.8 };
  }

  // At risk of lapsing
  if (daysSinceVisit > 60) {
    return { name: "lapsed", reason: `No visit in ${daysSinceVisit} days`, confidence: 0.85 };
  }

  return { name: "standard", reason: "Normal engagement pattern", confidence: 0.5 };
}

async function generateAISummary(apiKey: string, predictions: any[]) {
  try {
    const churnHigh = predictions.filter(p => p.churn.label === "high_risk").length;
    const churnAtRisk = predictions.filter(p => p.churn.label === "at_risk").length;
    const churnSafe = predictions.filter(p => p.churn.label === "safe").length;
    const avgLTV = Math.round(predictions.reduce((s, p) => s + p.ltv.projected12m, 0) / predictions.length);
    const segments = predictions.reduce((acc: Record<string, number>, p) => {
      acc[p.segment.name] = (acc[p.segment.name] || 0) + 1;
      return acc;
    }, {});

    const prompt = `You are a luxury hospitality loyalty analytics AI. Analyze these prediction results and provide a brief executive summary.

Data:
- ${predictions.length} members analyzed
- Churn risk: ${churnHigh} high risk, ${churnAtRisk} at risk, ${churnSafe} safe
- Average projected 12-month LTV: $${avgLTV}
- Segments: ${JSON.stringify(segments)}

Respond with JSON only:
{
  "title": "one-line headline",
  "summary": "2-3 sentence executive summary with key actionable insight",
  "severity": "info|warning|critical|opportunity",
  "details": {
    "key_finding": "most important finding",
    "recommendation": "top recommendation",
    "risk_summary": "brief risk assessment"
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    console.error("AI summary error:", e);
    return null;
  }
}
