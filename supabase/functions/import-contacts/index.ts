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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate JWT using anon client with user's token
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

    // Use service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is super admin
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

    const { rows, fileName, clearFirst, isLastChunk } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: "No rows to import" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin ID for audit
    const { data: adminId } = await supabase.rpc("get_admin_id", { _user_id: userId });

    // Only clear contacts on the first chunk
    if (clearFirst) {
      const { error: deleteError } = await supabase
        .from("contacts")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        throw new Error(`Failed to clear contacts: ${deleteError.message}`);
      }
    }

    // Batch insert in sub-batches of 500 rows
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    const rejected: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE).map((row: Record<string, unknown>) => ({
        ...row,
        imported_at: new Date().toISOString(),
        imported_by: adminId,
      }));

      const { error: insertError } = await supabase.from("contacts").insert(batch);

      if (insertError) {
        for (let j = 0; j < batch.length; j++) {
          rejected.push({ row: i + j + 1, reason: insertError.message });
        }
      } else {
        totalInserted += batch.length;
      }
    }

    // Only log audit on the final chunk
    if (isLastChunk) {
      await supabase.from("audit_logs").insert({
        admin_id: adminId,
        action_type: "import",
        entity_type: "contacts",
        after_json: {
          file_name: fileName,
          total_rows: rows.length,
          inserted: totalInserted,
          rejected: rejected.length,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: rows.length,
        inserted: totalInserted,
        rejected: rejected.length,
        rejectedDetails: rejected.slice(0, 100),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Import failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
