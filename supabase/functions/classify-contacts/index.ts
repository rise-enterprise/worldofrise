import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRow {
  id: string;
  visits: number | null;
  total_spend: number | null;
  spend_per_visit: number | null;
  spend_per_cover: number | null;
  last_visit: string | null;
  created_date: string | null;
  vip: boolean;
  loyalty_tier: string | null;
  last_location: string | null;
  cancels: number | null;
  no_show: number | null;
  orders: number | null;
}

function computeRFM(contact: ContactRow, now: Date): { recency: number; frequency: number; monetary: number; rfmScore: string; rfmLabel: string } {
  const lastVisit = contact.last_visit ? new Date(contact.last_visit) : null;
  const daysSince = lastVisit ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)) : 9999;
  const visits = contact.visits ?? 0;
  const spend = contact.total_spend ?? 0;

  // Score each dimension 1-5 (5 = best)
  let rScore = 1;
  if (daysSince <= 7) rScore = 5;
  else if (daysSince <= 30) rScore = 4;
  else if (daysSince <= 90) rScore = 3;
  else if (daysSince <= 180) rScore = 2;

  let fScore = 1;
  if (visits >= 50) fScore = 5;
  else if (visits >= 20) fScore = 4;
  else if (visits >= 10) fScore = 3;
  else if (visits >= 3) fScore = 2;

  let mScore = 1;
  if (spend >= 10000) mScore = 5;
  else if (spend >= 5000) mScore = 4;
  else if (spend >= 1000) mScore = 3;
  else if (spend >= 200) mScore = 2;

  const rfmScore = `${rScore}${fScore}${mScore}`;

  // Label assignment
  let rfmLabel = "New";
  const avg = (rScore + fScore + mScore) / 3;
  if (rScore >= 4 && fScore >= 4 && mScore >= 4) rfmLabel = "Champion";
  else if (rScore >= 4 && fScore >= 3) rfmLabel = "Loyal";
  else if (rScore >= 4 && fScore <= 2) rfmLabel = "New";
  else if (rScore >= 3 && fScore >= 3) rfmLabel = "Active";
  else if (rScore <= 2 && fScore >= 3) rfmLabel = "At Risk";
  else if (rScore <= 1 && fScore >= 1) rfmLabel = "Dormant";
  else if (avg >= 3.5) rfmLabel = "Active";
  else if (avg >= 2) rfmLabel = "At Risk";
  else rfmLabel = "Dormant";

  return { recency: daysSince, frequency: visits, monetary: spend, rfmScore, rfmLabel };
}

function computeBehaviorSegments(contact: ContactRow): string[] {
  const segments: string[] = [];
  const visits = contact.visits ?? 0;
  const spend = contact.total_spend ?? 0;
  const cancels = contact.cancels ?? 0;
  const noShows = contact.no_show ?? 0;

  // VIP segments
  if (spend >= 20000) segments.push("top_spender");
  if (visits >= 50) segments.push("high_frequency");
  if (contact.vip) segments.push("vip_tagged");

  // Behavior
  if (cancels > 5 || (visits > 0 && cancels / visits > 0.3)) segments.push("high_cancellation");
  if (noShows > 3 || (visits > 0 && noShows / visits > 0.2)) segments.push("no_show_risk");

  // Spend pattern
  const avgSpend = contact.spend_per_visit ?? (visits > 0 ? spend / visits : 0);
  if (avgSpend >= 500) segments.push("premium_spender");
  if (visits >= 10 && avgSpend < 50) segments.push("budget_frequent");

  return segments;
}

function computeBranchAffinity(contact: ContactRow): string | null {
  return contact.last_location || null;
}

function computeTierFromSpend(contact: ContactRow): string {
  const spend = contact.total_spend ?? 0;
  const visits = contact.visits ?? 0;

  if (spend >= 50000 || visits >= 100) return "RISE Black";
  if (spend >= 20000 || visits >= 50) return "Inner Circle";
  if (spend >= 10000 || visits >= 25) return "Elite";
  if (spend >= 3000 || visits >= 10) return "Connoisseur";
  return "Initiation";
}

Deno.serve(async (req) => {
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const { data: roleCheck } = await supabase.rpc("admin_has_role", {
      _user_id: userId,
      _roles: ["super_admin", "admin"],
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize ?? 1000;
    const offset = body.offset ?? 0;
    const now = new Date();

    // Fetch contacts batch
    const { data: contacts, error: fetchErr } = await supabase
      .from("contacts")
      .select("id, visits, total_spend, spend_per_visit, spend_per_cover, last_visit, created_date, vip, loyalty_tier, last_location, cancels, no_show, orders")
      .range(offset, offset + batchSize - 1);

    if (fetchErr) throw new Error(fetchErr.message);
    if (!contacts || contacts.length === 0) {
      return new Response(JSON.stringify({ done: true, processed: 0, offset }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clear existing segments for this batch
    const contactIds = contacts.map((c: ContactRow) => c.id);
    await supabase.from("guest_segments").delete().in("contact_id", contactIds);

    // Compute and insert segments
    const segments: Array<{
      contact_id: string;
      segment_type: string;
      segment_label: string;
      score: number | null;
      metadata_json: Record<string, unknown>;
    }> = [];

    const tierDistribution: Record<string, number> = {};
    const rfmDistribution: Record<string, number> = {};

    for (const contact of contacts as ContactRow[]) {
      // RFM
      const rfm = computeRFM(contact, now);
      segments.push({
        contact_id: contact.id,
        segment_type: "rfm",
        segment_label: rfm.rfmLabel,
        score: parseFloat(((parseInt(rfm.rfmScore[0]) + parseInt(rfm.rfmScore[1]) + parseInt(rfm.rfmScore[2])) / 3).toFixed(2)),
        metadata_json: { rfmScore: rfm.rfmScore, recency: rfm.recency, frequency: rfm.frequency, monetary: rfm.monetary },
      });
      rfmDistribution[rfm.rfmLabel] = (rfmDistribution[rfm.rfmLabel] ?? 0) + 1;

      // Behavioral
      const behaviors = computeBehaviorSegments(contact);
      for (const behavior of behaviors) {
        segments.push({
          contact_id: contact.id,
          segment_type: "behavioral",
          segment_label: behavior,
          score: null,
          metadata_json: {},
        });
      }

      // Branch affinity
      const branch = computeBranchAffinity(contact);
      if (branch) {
        segments.push({
          contact_id: contact.id,
          segment_type: "branch_affinity",
          segment_label: branch,
          score: null,
          metadata_json: {},
        });
      }

      // Computed tier
      const computedTier = computeTierFromSpend(contact);
      segments.push({
        contact_id: contact.id,
        segment_type: "computed_tier",
        segment_label: computedTier,
        score: null,
        metadata_json: { currentTier: contact.loyalty_tier, computedTier, matches: contact.loyalty_tier === computedTier },
      });
      tierDistribution[computedTier] = (tierDistribution[computedTier] ?? 0) + 1;
    }

    // Batch insert segments (500 at a time)
    for (let i = 0; i < segments.length; i += 500) {
      const batch = segments.slice(i, i + 500);
      const { error: insertErr } = await supabase.from("guest_segments").insert(batch);
      if (insertErr) console.error("Segment insert error:", insertErr.message);
    }

    const hasMore = contacts.length === batchSize;

    return new Response(JSON.stringify({
      done: !hasMore,
      processed: contacts.length,
      offset,
      nextOffset: hasMore ? offset + batchSize : null,
      segmentsCreated: segments.length,
      tierDistribution,
      rfmDistribution,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("classify-contacts error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Classification failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
