import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify JWT
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Use service role to check admin + run query
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin
    const { data: adminRow, error: adminErr } = await serviceClient
      .from("admins")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compute date thresholds
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    // Single aggregated query via RPC isn't available, so use raw SQL through rpc
    // We'll use the postgres function approach - but simpler: just do individual counts with service role (bypasses RLS)
    const [
      totalRes,
      vipRes,
      churnOldRes,
      churnNullRes,
      visitsMonthRes,
      noirRes,
      sassoRes,
      riyadhLocationRes,
      qatarLocationRes,
      blackRes,
      innerRes,
      eliteRes,
      connoisseurRes,
    ] = await Promise.all([
      serviceClient.from("contacts").select("*", { count: "exact", head: true }),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).eq("vip", true),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).lt("last_visit", thirtyDaysAgoISO),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).is("last_visit", null),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).gte("last_visit", monthStart),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).ilike("last_location", "%noir%"),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).ilike("last_location", "%sasso%"),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).ilike("last_location", "%Riyadh%"),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).not("last_location", "ilike", "%Riyadh%").not("last_location", "is", null),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).ilike("loyalty_tier", "%black%"),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).ilike("loyalty_tier", "%inner%"),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).ilike("loyalty_tier", "%elite%"),
      serviceClient.from("contacts").select("*", { count: "exact", head: true }).ilike("loyalty_tier", "%connoisseur%"),
    ]);

    for (const r of [totalRes, vipRes, churnOldRes, churnNullRes, visitsMonthRes, noirRes, sassoRes, riyadhLocationRes, qatarLocationRes, blackRes, innerRes, eliteRes, connoisseurRes]) {
      if (r.error) throw r.error;
    }

    const totalMembers = totalRes.count ?? 0;
    const blackCount = blackRes.count ?? 0;
    const innerCount = innerRes.count ?? 0;
    const eliteCount = eliteRes.count ?? 0;
    const connoisseurCount = connoisseurRes.count ?? 0;
    const initiationCount = totalMembers - blackCount - innerCount - eliteCount - connoisseurCount;

    const dohaCount = qatarLocationRes.count ?? 0;
    const riyadhCount = riyadhLocationRes.count ?? 0;

    const metrics = {
      totalMembers,
      activeMembers: totalMembers,
      totalVisitsThisMonth: visitsMonthRes.count ?? 0,
      visitsByBrand: { noir: noirRes.count ?? 0, sasso: sassoRes.count ?? 0 },
      visitsByCountry: { doha: dohaCount, riyadh: riyadhCount },
      tierDistribution: {
        initiation: initiationCount,
        connoisseur: connoisseurCount,
        elite: eliteCount,
        "inner-circle": innerCount,
        black: blackCount,
      },
      churnRiskCount: (churnOldRes.count ?? 0) + (churnNullRes.count ?? 0),
      vipGuestsCount: vipRes.count ?? 0,
    };

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("dashboard-metrics error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
