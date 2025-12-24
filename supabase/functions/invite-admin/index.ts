import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteAdminRequest {
  email: string;
  name: string;
  role: "super_admin" | "admin" | "manager" | "viewer";
  resend?: boolean;
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
      .select("role")
      .eq("user_id", callerUser.id)
      .eq("is_active", true)
      .single();

    if (callerError || !callerAdmin || callerAdmin.role !== "super_admin") {
      throw new Error("Only super admins can invite new admins");
    }

    const { email, name, role, resend: isResend }: InviteAdminRequest = await req.json();

    console.log(`${isResend ? 'Resending invitation to' : 'Inviting admin'}: ${email} with role ${role}`);

    // Check if admin with this email already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from("admins")
      .select("id, user_id, is_active")
      .eq("email", email.toLowerCase())
      .single();

    // If resending, we need an existing inactive admin
    if (isResend) {
      if (!existingAdmin) {
        throw new Error("No admin found with this email");
      }
      if (existingAdmin.is_active) {
        throw new Error("This admin is already active");
      }
    } else {
      // If creating new, admin should not exist
      if (existingAdmin) {
        throw new Error("An admin with this email already exists");
      }
    }

    let userId: string;

    if (isResend && existingAdmin) {
      // Use existing user_id for resend
      userId = existingAdmin.user_id;
      console.log(`Resending to existing user: ${userId}`);
    } else {
      // Create auth user with a random password (they'll set their own)
      const tempPassword = crypto.randomUUID() + "Aa1!";
      const { data: authData, error: createUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          password: tempPassword,
          email_confirm: true, // Skip email verification
          user_metadata: {
            name: name,
          },
        });

      if (createUserError) {
        console.error("Error creating auth user:", createUserError);
        throw new Error(createUserError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      userId = authData.user.id;
      console.log(`Auth user created: ${userId}`);

      // Create admin record with is_active = false (pending activation)
      const { error: adminError } = await supabaseAdmin.from("admins").insert({
        user_id: userId,
        email: email.toLowerCase(),
        name: name,
        role: role,
        is_active: false, // Will be activated when they set their password
      });

      if (adminError) {
        console.error("Error creating admin record:", adminError);
        // Try to clean up the auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error(adminError.message);
      }

      console.log(`Admin record created for ${email}`);
    }

    // Generate password reset link
    const { data: resetData, error: resetError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: email.toLowerCase(),
        options: {
          redirectTo: `${req.headers.get("origin")}/admin/setup-password`,
        },
      });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw new Error("Failed to generate activation link");
    }

    const activationLink = resetData.properties?.action_link;

    console.log(`Activation link generated for ${email}`);

    // Return the activation link directly (no email sending)
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation ${isResend ? 'regenerated' : 'created'} for ${email}`,
        activationLink: activationLink,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in invite-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
