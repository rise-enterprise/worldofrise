import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequestData {
  requestId: string;
  fullName: string;
  email: string;
  phone?: string;
  preferredBrand?: string;
  referralSource?: string;
  message?: string;
}

async function generateToken(requestId: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback";
  const data = new TextEncoder().encode(requestId + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: InvitationRequestData = await req.json();

    // Generate action URLs
    const token = await generateToken(data.requestId);
    const baseActionUrl = `${SUPABASE_URL}/functions/v1/handle-invitation-action`;
    const confirmUrl = `${baseActionUrl}?id=${data.requestId}&action=confirm&token=${token}`;
    const rejectUrl = `${baseActionUrl}?id=${data.requestId}&action=reject&token=${token}`;

    // Email to marketing team with action buttons
    const marketingEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #fff; letter-spacing: 0.2em;">WORLD OF RISE</h1>
          <p style="margin: 10px 0 0; color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 0.15em;">NEW INVITATION REQUEST</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="color: #1a1a2e; margin: 0 0 20px; font-size: 18px;">Applicant Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; width: 140px;">Full Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1a1a2e; font-weight: 500;">${data.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1a1a2e;">${data.email}</td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Phone</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1a1a2e;">${data.phone}</td>
            </tr>
            ` : ''}
            ${data.preferredBrand ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Preferred Experience</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1a1a2e; text-transform: capitalize;">${data.preferredBrand}</td>
            </tr>
            ` : ''}
            ${data.referralSource ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Referral Source</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1a1a2e;">${data.referralSource}</td>
            </tr>
            ` : ''}
          </table>
          
          ${data.message ? `
          <div style="margin-top: 20px;">
            <p style="color: #666; margin: 0 0 10px; font-size: 14px;">Message</p>
            <p style="color: #1a1a2e; margin: 0; padding: 15px; background: #f9f9f9; border-radius: 6px; line-height: 1.6;">${data.message}</p>
          </div>
          ` : ''}
          
          <!-- Action Buttons -->
          <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #eee;">
            <p style="color: #666; margin: 0 0 15px; font-size: 13px; text-align: center;">Take action on this request:</p>
            <div style="text-align: center;">
              <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 0 8px;">
                ✓ Confirm & Add Member
              </a>
              <a href="${rejectUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 0 8px;">
                ✕ Reject Application
              </a>
            </div>
          </div>
          
          <p style="margin: 25px 0 0; color: #999; font-size: 11px; text-align: center;">
            These action links are secure and single-use. You can also manage requests from the admin panel.
          </p>
        </div>
      </div>
    `;

    // Confirmation email to applicant - luxury ceremonial tone
    const applicantEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #07080A;">
        <div style="background: linear-gradient(135deg, #0E1116 0%, #07080A 100%); padding: 40px 30px; border: 1px solid rgba(200, 162, 74, 0.2); border-radius: 12px;">
          
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; padding: 12px 24px; border: 1px solid rgba(200, 162, 74, 0.3); border-radius: 4px;">
              <h1 style="margin: 0; font-size: 20px; color: #C8A24A; letter-spacing: 0.3em; font-weight: 300;">WORLD OF RISE</h1>
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 35px;">
            <p style="color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 0.2em; margin: 0 0 20px; text-transform: uppercase;">Your Request Has Been Received</p>
            <h2 style="color: #ffffff; font-size: 24px; font-weight: 300; margin: 0; letter-spacing: 0.05em;">Dear ${data.fullName},</h2>
          </div>
          
          <div style="border-top: 1px solid rgba(200, 162, 74, 0.15); border-bottom: 1px solid rgba(200, 162, 74, 0.15); padding: 30px 0; margin: 0 20px;">
            <p style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.8; margin: 0 0 20px; text-align: center;">
              We have received your interest in joining our circle. Each application is reviewed with care and consideration.
            </p>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.8; margin: 0; text-align: center;">
              Should your request be approved, you will receive an invitation to complete your membership. We appreciate your patience as we maintain the exclusivity of our community.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 35px;">
            <p style="color: rgba(200, 162, 74, 0.7); font-size: 12px; letter-spacing: 0.15em; margin: 0;">
              NOIR &middot; SASSO
            </p>
            <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 15px 0 0; letter-spacing: 0.1em;">
              This message was sent from an unmonitored address.
            </p>
          </div>
          
        </div>
      </div>
    `;

    // Send notification to marketing
    const marketingEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "World of Rise <noreply@loyalty.rise.qa>",
        to: ["marketing@rise.qa"],
        subject: `New Invitation Request: ${data.fullName}`,
        html: marketingEmailHtml,
      }),
    });

    const marketingResult = await marketingEmailResponse.json();
    
    if (!marketingEmailResponse.ok) {
      throw new Error(marketingResult.message || "Failed to send marketing notification");
    }

    console.log("Marketing notification sent:", marketingResult);

    // Send confirmation to applicant
    const applicantEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "World of Rise <noreply@loyalty.rise.qa>",
        to: [data.email],
        subject: "Your Request Has Been Received",
        html: applicantEmailHtml,
      }),
    });

    const applicantResult = await applicantEmailResponse.json();
    
    if (!applicantEmailResponse.ok) {
      console.error("Failed to send applicant confirmation:", applicantResult);
      // Don't throw - marketing email was sent successfully
    } else {
      console.log("Applicant confirmation sent:", applicantResult);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invitation request email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
