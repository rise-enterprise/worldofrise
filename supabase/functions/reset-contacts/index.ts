import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleCheck } = await supabase.rpc("admin_has_role", {
      _user_id: userId,
      _roles: ["super_admin"],
    });

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden: Super Admin required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: adminId } = await supabase.rpc("get_admin_id", { _user_id: userId });

    // Count before delete
    const { count: contactsBefore } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true });

    // Delete all
    const sentinel = "00000000-0000-0000-0000-000000000000";
    const { error: stagingErr } = await supabase
      .from("staging_contacts")
      .delete()
      .neq("id", sentinel);
    if (stagingErr) throw new Error(`staging_contacts: ${stagingErr.message}`);

    const { error: runsErr } = await supabase
      .from("import_runs")
      .delete()
      .neq("id", sentinel);
    if (runsErr) throw new Error(`import_runs: ${runsErr.message}`);

    const { error: contactsErr } = await supabase
      .from("contacts")
      .delete()
      .neq("id", sentinel);
    if (contactsErr) throw new Error(`contacts: ${contactsErr.message}`);

    await supabase.from("audit_logs").insert({
      admin_id: adminId,
      action_type: "delete",
      entity_type: "contacts",
      after_json: {
        action: "reset_imported_data",
        contacts_deleted: contactsBefore ?? 0,
      },
    });

    return new Response(
      JSON.stringify({ success: true, contactsDeleted: contactsBefore ?? 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("reset-contacts error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Reset failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
