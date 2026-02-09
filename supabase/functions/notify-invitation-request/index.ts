import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequestData {
  fullName: string;
  email: string;
  phone?: string;
  preferredBrand?: string;
  referralSource?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: InvitationRequestData = await req.json();

    const emailHtml = `
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
          
          <p style="margin: 30px 0 0; color: #999; font-size: 12px; text-align: center;">
            This request was submitted via the World of Rise membership portal.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "World of Rise <noreply@loyalty.rise.qa>",
        to: ["marketing@rise.qa"],
        subject: `New Invitation Request: ${data.fullName}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Invitation request email sent:", emailResult);

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
