import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteAdminRequest {
  adminId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the caller is a super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: callerUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callerUser) {
      throw new Error("Unauthorized");
    }

    // Check if caller is super_admin
    const { data: callerAdmin, error: callerError } = await supabaseAdmin
      .from("admins")
      .select("role, id")
      .eq("user_id", callerUser.id)
      .eq("is_active", true)
      .single();

    if (callerError || !callerAdmin || callerAdmin.role !== "super_admin") {
      throw new Error("Only super admins can delete admins");
    }

    const { adminId }: DeleteAdminRequest = await req.json();

    console.log(`Deleting admin: ${adminId}`);

    // Get the admin to be deleted
    const { data: adminToDelete, error: fetchError } = await supabaseAdmin
      .from("admins")
      .select("id, user_id, email, is_active, last_login_at")
      .eq("id", adminId)
      .single();

    if (fetchError || !adminToDelete) {
      throw new Error("Admin not found");
    }

    // Prevent self-deletion
    if (adminToDelete.id === callerAdmin.id) {
      throw new Error("Cannot delete yourself");
    }

    // Only allow deletion of inactive admins who never logged in (orphaned records)
    if (adminToDelete.is_active) {
      throw new Error("Cannot permanently delete active admins. Deactivate them first.");
    }

    if (adminToDelete.last_login_at) {
      throw new Error("Cannot permanently delete admins who have logged in. Use deactivation instead.");
    }

    console.log(`Deleting auth user: ${adminToDelete.user_id}`);

    // Delete the auth user first (this is the orphaned user)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
      adminToDelete.user_id
    );

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      // Continue with admin record deletion even if auth user doesn't exist
    }

    console.log(`Deleting admin record: ${adminId}`);

    // Delete the admin record
    const { error: deleteAdminError } = await supabaseAdmin
      .from("admins")
      .delete()
      .eq("id", adminId);

    if (deleteAdminError) {
      console.error("Error deleting admin record:", deleteAdminError);
      throw new Error("Failed to delete admin record");
    }

    console.log(`Successfully deleted admin: ${adminToDelete.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Admin ${adminToDelete.email} has been permanently deleted`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});