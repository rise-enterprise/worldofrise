import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteAdminRequest {
  email: string;
  name: string;
  role: "super_admin" | "admin" | "manager" | "viewer";
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

    const { email, name, role }: InviteAdminRequest = await req.json();

    console.log(`Inviting admin: ${email} with role ${role}`);

    // Check if admin with this email already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from("admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingAdmin) {
      throw new Error("An admin with this email already exists");
    }

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

    console.log(`Auth user created: ${authData.user.id}`);

    // Create admin record with is_active = false (pending activation)
    const { error: adminError } = await supabaseAdmin.from("admins").insert({
      user_id: authData.user.id,
      email: email.toLowerCase(),
      name: name,
      role: role,
      is_active: false, // Will be activated when they set their password
    });

    if (adminError) {
      console.error("Error creating admin record:", adminError);
      // Try to clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(adminError.message);
    }

    console.log(`Admin record created for ${email}`);

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

    // Send invitation email
    const { error: emailError } = await resend.emails.send({
      from: "NOIR & SASSO <noreply@resend.dev>",
      to: [email],
      subject: "You've been invited to join the Admin Dashboard",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #171717; border-radius: 12px; border: 1px solid #262626;">
                  <tr>
                    <td style="padding: 40px;">
                      <!-- Header -->
                      <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #fafafa; font-size: 24px; font-weight: 600; margin: 0;">Welcome to the Team!</h1>
                      </div>
                      
                      <!-- Content -->
                      <div style="color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                        <p style="margin: 0 0 16px;">Hello <strong style="color: #fafafa;">${name}</strong>,</p>
                        
                        <p style="margin: 0 0 16px;">You've been invited to join the NOIR & SASSO Admin Dashboard as a <strong style="color: #fafafa;">${role.replace("_", " ")}</strong>.</p>
                        
                        <p style="margin: 0 0 24px;">Click the button below to activate your account and set up your password:</p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 32px 0;">
                          <a href="${activationLink}" style="display: inline-block; background-color: #fafafa; color: #0a0a0a; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                            Activate Your Account
                          </a>
                        </div>
                        
                        <p style="margin: 0 0 16px; font-size: 14px; color: #71717a;">If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="margin: 0 0 24px; font-size: 14px; word-break: break-all; color: #71717a;">${activationLink}</p>
                        
                        <p style="margin: 0 0 8px;">This link will expire in 24 hours.</p>
                        
                        <p style="margin: 24px 0 0; color: #71717a; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
                      </div>
                      
                      <!-- Footer -->
                      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #262626; text-align: center;">
                        <p style="color: #71717a; font-size: 14px; margin: 0;">NOIR & SASSO Loyalty Platform</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("Failed to send invitation email. Please check your Resend configuration.");
    }

    console.log(`Invitation email sent to ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
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
