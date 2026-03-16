import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const requestId = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    const token = url.searchParams.get("token");

    if (!requestId || !action || !token) {
      return renderHtmlResponse("Invalid Request", "Missing required parameters.", "error");
    }

    // Validate the token (simple hash-based validation)
    const expectedToken = await generateToken(requestId);
    if (token !== expectedToken) {
      return renderHtmlResponse("Invalid Token", "This action link is invalid or has expired.", "error");
    }

    // Fetch the invitation request
    const { data: request, error: fetchError } = await supabase
      .from("invitation_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      return renderHtmlResponse("Not Found", "This invitation request could not be found.", "error");
    }

    if (request.status !== "pending") {
      return renderHtmlResponse(
        "Already Processed",
        `This request has already been ${request.status}.`,
        "info"
      );
    }

    if (action === "confirm") {
      // Create member record
      const { error: memberError } = await supabase.from("members").insert({
        full_name: request.full_name,
        email: request.email,
        phone: request.phone || "",
        brand_affinity: request.preferred_brand || "both",
        notes: request.message || undefined,
        city: "doha",
      });

      if (memberError) {
        console.error("Error creating member:", memberError);
        return renderHtmlResponse("Error", "Failed to create member record. Please try again.", "error");
      }

      // Update request status
      await supabase
        .from("invitation_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      // Send approval email to applicant
      await sendApprovalEmail(request.email, request.full_name);

      return renderHtmlResponse(
        "Member Added",
        `${request.full_name} has been approved and added as a member.`,
        "success"
      );
    } else if (action === "reject") {
      // Check if this is a form submission with rejection reason
      if (req.method === "POST") {
        const formData = await req.formData();
        const rejectionReason = formData.get("reason") as string;

        if (!rejectionReason?.trim()) {
          return renderRejectForm(requestId, token, request.full_name, "Please provide a rejection reason.");
        }

        // Insert into rejected_invitation_requests
        const { error: rejectError } = await supabase.from("rejected_invitation_requests").insert({
          original_request_id: requestId,
          full_name: request.full_name,
          email: request.email,
          phone: request.phone,
          preferred_brand: request.preferred_brand,
          referral_source: request.referral_source,
          message: request.message,
          rejection_reason: rejectionReason,
        });

        if (rejectError) {
          console.error("Error rejecting request:", rejectError);
          return renderHtmlResponse("Error", "Failed to reject request. Please try again.", "error");
        }

        // Update request status
        await supabase
          .from("invitation_requests")
          .update({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        return renderHtmlResponse(
          "Request Rejected",
          `${request.full_name}'s request has been rejected and archived.`,
          "success"
        );
      }

      // Show rejection form
      return renderRejectForm(requestId, token, request.full_name);
    }

    return renderHtmlResponse("Invalid Action", "Unknown action specified.", "error");
  } catch (error: any) {
    console.error("Error handling invitation action:", error);
    return renderHtmlResponse("Error", error.message || "An unexpected error occurred.", "error");
  }
};

async function generateToken(requestId: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback";
  const data = new TextEncoder().encode(requestId + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sendApprovalEmail(email: string, name: string) {
  if (!RESEND_API_KEY) return;

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #07080A;">
      <div style="background: linear-gradient(135deg, #0E1116 0%, #07080A 100%); padding: 40px 30px; border: 1px solid rgba(212, 168, 67, 0.2); border-radius: 12px;">
        
        <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; padding: 12px 24px; border: 1px solid rgba(212, 168, 67, 0.3); border-radius: 4px;">
              <h1 style="margin: 0; font-size: 20px; color: #D4A843; letter-spacing: 0.3em; font-weight: 300;">WORLD OF RISE</h1>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 35px;">
          <p style="color: rgba(212, 168, 67, 0.8); font-size: 11px; letter-spacing: 0.2em; margin: 0 0 20px; text-transform: uppercase;">Welcome to the Circle</p>
          <h2 style="color: #ffffff; font-size: 24px; font-weight: 300; margin: 0; letter-spacing: 0.05em;">Dear ${name},</h2>
        </div>
        
        <div style="border-top: 1px solid rgba(212, 168, 67, 0.15); border-bottom: 1px solid rgba(212, 168, 67, 0.15); padding: 30px 0; margin: 0 20px;">
          <p style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.8; margin: 0 0 20px; text-align: center;">
            Your request to join our private circle has been <span style="color: #D4A843;">approved</span>.
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.8; margin: 0; text-align: center;">
            You are now a member of World of Rise. On your next visit to any NOIR or SASSO location, simply provide your details to begin your journey with us.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 35px;">
          <p style="color: rgba(212, 168, 67, 0.7); font-size: 12px; letter-spacing: 0.15em; margin: 0;">
            NOIR &middot; SASSO
          </p>
        </div>
        
      </div>
    </div>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "World of Rise <noreply@loyalty.rise.qa>",
        to: [email],
        subject: "Welcome to World of Rise",
        html,
      }),
    });
    console.log("Approval email sent to:", email);
  } catch (e) {
    console.error("Failed to send approval email:", e);
  }
}

function renderHtmlResponse(title: string, message: string, type: "success" | "error" | "info"): Response {
  const colors = {
    success: { bg: "#0d3320", border: "#22c55e", text: "#4ade80", icon: "✓" },
    error: { bg: "#3b1219", border: "#ef4444", text: "#f87171", icon: "✕" },
    info: { bg: "#1e3a5f", border: "#3b82f6", text: "#60a5fa", icon: "ℹ" },
  };
  const c = colors[type];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - World of Rise</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica Neue', Arial, sans-serif; 
      background: #07080A; 
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: linear-gradient(135deg, #0E1116 0%, #07080A 100%);
      border: 1px solid rgba(212, 168, 67, 0.2);
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      text-align: center;
    }
    .logo {
      color: #D4A843;
      font-size: 18px;
      letter-spacing: 0.3em;
      margin-bottom: 30px;
      font-weight: 300;
    }
    .icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${c.bg};
      border: 2px solid ${c.border};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 24px;
      color: ${c.text};
    }
    h1 {
      color: #fff;
      font-size: 22px;
      font-weight: 400;
      margin-bottom: 15px;
    }
    p {
      color: rgba(255,255,255,0.7);
      font-size: 15px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">WORLD OF RISE</div>
    <div class="icon">${c.icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html", ...corsHeaders },
  });
}

function renderRejectForm(requestId: string, token: string, name: string, error?: string): Response {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reject Request - World of Rise</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica Neue', Arial, sans-serif; 
      background: #07080A; 
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: linear-gradient(135deg, #0E1116 0%, #07080A 100%);
      border: 1px solid rgba(212, 168, 67, 0.2);
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
    }
    .logo {
      color: #C8A24A;
      font-size: 18px;
      letter-spacing: 0.3em;
      margin-bottom: 30px;
      font-weight: 300;
      text-align: center;
    }
    h1 {
      color: #fff;
      font-size: 20px;
      font-weight: 400;
      margin-bottom: 10px;
      text-align: center;
    }
    .subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      text-align: center;
      margin-bottom: 25px;
    }
    label {
      color: rgba(255,255,255,0.8);
      font-size: 13px;
      display: block;
      margin-bottom: 8px;
    }
    textarea {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(200, 162, 74, 0.2);
      border-radius: 8px;
      padding: 12px;
      color: #fff;
      font-size: 14px;
      min-height: 120px;
      resize: vertical;
      margin-bottom: 20px;
    }
    textarea:focus {
      outline: none;
      border-color: rgba(200, 162, 74, 0.5);
    }
    .error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 15px;
    }
    button {
      width: 100%;
      background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
      border: none;
      color: #fff;
      padding: 14px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      letter-spacing: 0.05em;
    }
    button:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }
    .note {
      color: rgba(255,255,255,0.4);
      font-size: 12px;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">WORLD OF RISE</div>
    <h1>Reject Application</h1>
    <p class="subtitle">Rejecting: <strong style="color: #fff;">${name}</strong></p>
    
    ${error ? `<div class="error">${error}</div>` : ""}
    
    <form method="POST">
      <label for="reason">Reason for Rejection *</label>
      <textarea name="reason" id="reason" placeholder="Enter the reason for rejecting this application..." required></textarea>
      <button type="submit">Confirm Rejection</button>
    </form>
    
    <p class="note">This reason is for internal records only.</p>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html", ...corsHeaders },
  });
}

serve(handler);
