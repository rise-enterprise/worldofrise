import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  member_id: string;
  notification_type: "event" | "tier_upgrade" | "promotion";
  subject: string;
  content: string;
  event_name?: string;
  new_tier?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { member_id, notification_type, subject, content, event_name, new_tier }: NotificationRequest = await req.json();

    console.log(`Processing ${notification_type} notification for member ${member_id}`);

    // Get member details
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("full_name, email, preferred_language")
      .eq("id", member_id)
      .single();

    if (memberError || !member) {
      console.error("Member not found:", memberError);
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!member.email) {
      console.log("Member has no email address");
      return new Response(JSON.stringify({ error: "Member has no email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check notification preferences
    const { data: preferences } = await supabase
      .from("member_notification_preferences")
      .select("*")
      .eq("member_id", member_id)
      .single();

    // Check if member wants this type of notification
    const shouldSend = !preferences || (
      (notification_type === "event" && preferences.email_events !== false) ||
      (notification_type === "tier_upgrade" && preferences.email_tier_upgrades !== false) ||
      (notification_type === "promotion" && preferences.email_promotions === true)
    );

    if (!shouldSend) {
      console.log("Member has opted out of this notification type");
      return new Response(JSON.stringify({ message: "Member has opted out" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build email content
    const isArabic = member.preferred_language === "ar";
    const greeting = isArabic ? `مرحباً ${member.full_name}` : `Hello ${member.full_name}`;
    
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">World of Rise</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1a1a2e;">${greeting},</h2>
          <p style="color: #333; line-height: 1.6;">${content}</p>
    `;

    if (notification_type === "tier_upgrade" && new_tier) {
      emailHtml += `
        <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; color: #1a1a2e; font-weight: bold;">
            ${isArabic ? "مستواك الجديد" : "Your New Tier"}
          </p>
          <h3 style="margin: 10px 0 0; color: #1a1a2e; font-size: 28px;">${new_tier}</h3>
        </div>
      `;
    }

    if (notification_type === "event" && event_name) {
      emailHtml += `
        <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; border-left: 4px solid #1a1a2e;">
          <p style="margin: 0; color: #1a1a2e; font-weight: bold;">${event_name}</p>
        </div>
      `;
    }

    emailHtml += `
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            ${isArabic ? "شكراً لكونك عضواً في برنامج الولاء لدينا" : "Thank you for being a valued member of our loyalty program"}
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>World of Rise - Noir & Sasso</p>
        </div>
      </div>
    `;

    // Send email using Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "World of Rise <onboarding@resend.dev>",
        to: [member.email],
        subject: subject,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    // Log the notification
    await supabase.from("notification_history").insert({
      member_id,
      notification_type,
      subject,
      status: "sent",
    });

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
