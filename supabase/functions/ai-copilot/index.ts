import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Tool definitions ──
const TOOLS = [
  {
    type: "function",
    function: {
      name: "query_analytics",
      description: "Query analytics data: metrics, tier distribution, segment counts, brand performance, recent activity",
      parameters: {
        type: "object",
        properties: {
          query_type: { type: "string", enum: ["dashboard_metrics", "tier_distribution", "segment_distribution", "import_history", "contact_count", "recent_activity"] },
          brand_filter: { type: "string", enum: ["noir", "sasso", "all"], description: "Filter by brand" },
        },
        required: ["query_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_classification",
      description: "Rerun RFM segmentation and tier classification on all contacts.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_admin_user",
      description: "Create a new admin user with specified role and scope. REQUIRES CONFIRMATION.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string" },
          name: { type: "string" },
          role: { type: "string", enum: ["super_admin", "admin", "manager", "viewer"] },
          brand_scope: { type: "string", enum: ["noir", "sasso", "both"] },
        },
        required: ["email", "name", "role"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_contact",
      description: "Update a contact record by ID or lookup by phone/email",
      parameters: {
        type: "object",
        properties: {
          lookup: { type: "string", description: "Contact ID, phone, or email to find" },
          updates: { type: "object", description: "Fields to update" },
        },
        required: ["lookup", "updates"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "export_report",
      description: "Generate a data export/report. Returns summary data.",
      parameters: {
        type: "object",
        properties: {
          report_type: { type: "string", enum: ["dormant_vips", "churn_risk", "top_spenders", "segment_summary", "tier_mismatch", "import_health"] },
          limit: { type: "number" },
        },
        required: ["report_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_segment",
      description: "Create a custom segment based on rules",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          rules: { type: "object", description: "Segment rules: min_visits, min_spend, max_days_since_visit, tier, brand" },
        },
        required: ["name", "rules"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_image",
      description: "Generate an image based on a text prompt. Use for creating marketing visuals, campaign graphics, loyalty card designs, social media posts, etc.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Detailed description of the image to generate" },
        },
        required: ["prompt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_attachment",
      description: "Analyze an uploaded image or document using AI vision. Use when the user uploads a file and wants insights about it.",
      parameters: {
        type: "object",
        properties: {
          attachment_url: { type: "string", description: "Public URL of the attachment to analyze" },
          instruction: { type: "string", description: "What to analyze or extract from the attachment" },
        },
        required: ["attachment_url"],
      },
    },
  },
];

// ── Tool execution ──
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  serviceClient: ReturnType<typeof createClient>,
  adminId: string,
  authHeader: string,
  apiKey: string,
  supabaseUrl: string,
): Promise<{ result: unknown; requiresConfirmation: boolean }> {
  try {
    switch (toolName) {
      case "query_analytics": {
        const qt = args.query_type as string;
        if (qt === "dashboard_metrics") {
          const { data } = await serviceClient.rpc("get_dashboard_metrics", {
            brand_filter: args.brand_filter === "all" ? null : (args.brand_filter as string) ?? null,
          });
          return { result: data, requiresConfirmation: false };
        }
        if (qt === "segment_distribution") {
          const { data } = await serviceClient.from("guest_segments").select("segment_type, segment_label").limit(1000);
          const dist: Record<string, Record<string, number>> = {};
          for (const row of data ?? []) {
            const t = (row as any).segment_type, l = (row as any).segment_label;
            if (!dist[t]) dist[t] = {};
            dist[t][l] = (dist[t][l] ?? 0) + 1;
          }
          return { result: dist, requiresConfirmation: false };
        }
        if (qt === "tier_distribution") {
          const { data } = await serviceClient.from("guest_segments").select("segment_label").eq("segment_type", "computed_tier").limit(1000);
          const dist: Record<string, number> = {};
          for (const row of data ?? []) { const l = (row as any).segment_label; dist[l] = (dist[l] ?? 0) + 1; }
          return { result: dist, requiresConfirmation: false };
        }
        if (qt === "contact_count") {
          const { count } = await serviceClient.from("contacts").select("id", { count: "exact", head: true });
          return { result: { total_contacts: count }, requiresConfirmation: false };
        }
        if (qt === "import_history") {
          const { data } = await serviceClient.from("import_runs").select("*").order("created_at", { ascending: false }).limit(10);
          return { result: data, requiresConfirmation: false };
        }
        if (qt === "recent_activity") {
          const { data } = await serviceClient.from("audit_logs").select("action_type, entity_type, created_at").order("created_at", { ascending: false }).limit(20);
          return { result: data, requiresConfirmation: false };
        }
        return { result: { error: "Unknown query type" }, requiresConfirmation: false };
      }

      case "run_classification": {
        const results: unknown[] = [];
        let offset = 0;
        let done = false;
        while (!done) {
          const resp = await fetch(`${supabaseUrl}/functions/v1/classify-contacts`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: authHeader },
            body: JSON.stringify({ batchSize: 1000, offset }),
          });
          const data = await resp.json();
          results.push(data);
          done = data.done;
          offset = data.nextOffset ?? offset;
          if (data.done || !data.nextOffset) break;
        }
        return { result: { batches: results.length, lastResult: results[results.length - 1] }, requiresConfirmation: false };
      }

      case "create_admin_user": {
        return {
          result: {
            pending: true,
            message: `⚠️ CONFIRMATION REQUIRED: Create admin "${args.name}" (${args.email}) with role "${args.role}"${args.brand_scope ? ` scoped to ${args.brand_scope}` : ""}. Confirm with "Yes, create this admin."`,
          },
          requiresConfirmation: true,
        };
      }

      case "update_contact": {
        const lookup = args.lookup as string;
        let query = serviceClient.from("contacts").select("id, first_name, last_name, email, phone").limit(1);
        if (lookup.includes("@")) query = query.eq("email", lookup.toLowerCase());
        else if (/^\+?\d{5,}$/.test(lookup.replace(/[\s\-()]/g, ""))) query = query.eq("phone", lookup);
        else query = query.eq("id", lookup);
        const { data: found } = await query.maybeSingle();
        if (!found) return { result: { error: `Contact not found: ${lookup}` }, requiresConfirmation: false };
        const { error: updateErr } = await serviceClient.from("contacts").update(args.updates as Record<string, unknown>).eq("id", (found as any).id);
        if (updateErr) return { result: { error: updateErr.message }, requiresConfirmation: false };
        return { result: { updated: true, contact_id: (found as any).id, fields_updated: Object.keys(args.updates as object) }, requiresConfirmation: false };
      }

      case "export_report": {
        const rt = args.report_type as string;
        const limit = (args.limit as number) ?? 50;
        if (rt === "dormant_vips") {
          const { data } = await serviceClient.from("contacts").select("first_name, last_name, email, phone, visits, total_spend, last_visit, loyalty_tier").eq("vip", true).or("last_visit.is.null,last_visit.lt." + new Date(Date.now() - 90 * 86400000).toISOString()).limit(limit);
          return { result: { report: "dormant_vips", count: data?.length ?? 0, data }, requiresConfirmation: false };
        }
        if (rt === "top_spenders") {
          const { data } = await serviceClient.from("contacts").select("first_name, last_name, total_spend, visits, loyalty_tier, last_location").order("total_spend", { ascending: false }).limit(limit);
          return { result: { report: "top_spenders", count: data?.length ?? 0, data }, requiresConfirmation: false };
        }
        if (rt === "segment_summary") {
          const { data } = await serviceClient.from("guest_segments").select("segment_type, segment_label").limit(5000);
          const summary: Record<string, Record<string, number>> = {};
          for (const r of data ?? []) { const t = (r as any).segment_type, l = (r as any).segment_label; if (!summary[t]) summary[t] = {}; summary[t][l] = (summary[t][l] ?? 0) + 1; }
          return { result: { report: "segment_summary", summary }, requiresConfirmation: false };
        }
        if (rt === "tier_mismatch") {
          const { data } = await serviceClient.from("guest_segments").select("contact_id, segment_label, metadata_json").eq("segment_type", "computed_tier").limit(1000);
          const mismatches = (data ?? []).filter((r: any) => r.metadata_json?.matches === false);
          return { result: { report: "tier_mismatch", total_mismatches: mismatches.length, sample: mismatches.slice(0, 20) }, requiresConfirmation: false };
        }
        return { result: { error: "Unknown report type" }, requiresConfirmation: false };
      }

      case "create_segment": {
        await serviceClient.from("ai_insights").insert({
          insight_type: "custom_segment",
          title: `Custom Segment: ${args.name}`,
          summary: `Segment created with rules: ${JSON.stringify(args.rules)}`,
          severity: "info",
          details_json: { name: args.name, rules: args.rules, created_by: adminId },
        });
        return { result: { created: true, name: args.name, rules: args.rules }, requiresConfirmation: false };
      }

      case "generate_image": {
        const prompt = args.prompt as string;
        const imgResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });
        if (!imgResp.ok) {
          const errText = await imgResp.text();
          return { result: { error: `Image generation failed: ${imgResp.status} ${errText}` }, requiresConfirmation: false };
        }
        const imgData = await imgResp.json();
        const images = imgData.choices?.[0]?.message?.images;
        if (!images || images.length === 0) {
          return { result: { error: "No image generated", text: imgData.choices?.[0]?.message?.content }, requiresConfirmation: false };
        }

        const base64 = images[0].image_url.url;
        const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const fileName = `generated/${crypto.randomUUID()}.png`;
        
        await serviceClient.storage.from("chat-attachments").upload(fileName, binaryData, {
          contentType: "image/png",
          upsert: true,
        });
        
        const { data: urlData } = serviceClient.storage.from("chat-attachments").getPublicUrl(fileName);
        const publicUrl = urlData.publicUrl;
        
        return {
          result: {
            success: true,
            image_url: publicUrl,
            description: imgData.choices?.[0]?.message?.content || "Image generated successfully",
          },
          requiresConfirmation: false,
        };
      }

      case "analyze_attachment": {
        const url = args.attachment_url as string;
        const instruction = (args.instruction as string) || "Analyze this image in detail. Describe what you see and any relevant insights.";
        const visionResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{
              role: "user",
              content: [
                { type: "text", text: instruction },
                { type: "image_url", image_url: { url } },
              ],
            }],
          }),
        });
        if (!visionResp.ok) {
          return { result: { error: `Vision analysis failed: ${visionResp.status}` }, requiresConfirmation: false };
        }
        const visionData = await visionResp.json();
        return { result: { analysis: visionData.choices?.[0]?.message?.content ?? "No analysis available" }, requiresConfirmation: false };
      }

      default:
        return { result: { error: `Unknown tool: ${toolName}` }, requiresConfirmation: false };
    }
  } catch (err) {
    return { result: { error: `Tool execution failed: ${err instanceof Error ? err.message : String(err)}` }, requiresConfirmation: false };
  }
}

const ZAPIER_REPLY_KEYS = ["reply", "message", "output", "response", "text", "content", "answer", "result"];

function isZapierMetadataPayload(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((key) => ["attempt", "id", "request_id", "status"].includes(key));
}

function extractZapierReply(payload: unknown): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      const nestedReply = extractZapierReply(parsed);
      if (nestedReply) return nestedReply;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && isZapierMetadataPayload(parsed as Record<string, unknown>)) {
        return null;
      }
    } catch {
      return trimmed;
    }

    return trimmed;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nestedReply = extractZapierReply(item);
      if (nestedReply) return nestedReply;
    }
    return null;
  }

  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  if (isZapierMetadataPayload(record)) return null;

  for (const key of ZAPIER_REPLY_KEYS) {
    const nestedReply = extractZapierReply(record[key]);
    if (nestedReply) return nestedReply;
  }

  return null;
}

// ── Zapier AI Chatbot call ──
async function callZapierAI(
  webhookUrl: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
): Promise<string> {
  // Build a single prompt from messages for Zapier
  const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content ?? "";
  const conversationContext = messages.slice(-10).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

  const resp = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: lastUserMsg,
      conversation_history: conversationContext,
      system_prompt: systemPrompt,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Zapier webhook error ${resp.status}: ${errText}`);
  }

  const rawBody = await resp.text();
  let payload: unknown = rawBody;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = rawBody;
  }

  const reply = extractZapierReply(payload);
  if (!reply) {
    throw new Error(`Zapier webhook returned metadata-only payload: ${rawBody.slice(0, 300)}`);
  }

  return reply;
}

// ── Convert text to SSE stream ──
function textToSSEStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  // Split into chunks to simulate streaming
  const words = text.split(/(\s+)/);
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    current += word;
    if (current.length >= 15) {
      chunks.push(current);
      current = "";
    }
  }
  if (current) chunks.push(current);

  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        const sseData = JSON.stringify({
          choices: [{ delta: { content: chunks[index] } }],
        });
        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        index++;
      } else {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

// ── Lovable AI gateway call with retry (fallback) ──
async function callAIWithRetry(
  body: Record<string, unknown>,
  apiKey: string,
  maxRetries = 1,
): Promise<Response> {
  let lastResp: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (resp.ok || resp.status === 429 || resp.status === 402) return resp;
    lastResp = resp;
    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return lastResp!;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ZAPIER_AI_WEBHOOK_URL = Deno.env.get("ZAPIER_AI_WEBHOOK_URL");

    if (!ZAPIER_AI_WEBHOOK_URL && !LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured. Set ZAPIER_AI_WEBHOOK_URL or LOVABLE_API_KEY." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: admin } = await serviceClient
      .from("admins")
      .select("id, name, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!admin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, attachments } = await req.json();

    // Gulf time mood
    const gulfHour = (new Date().getUTCHours() + 3) % 24;
    const mood = gulfHour >= 6 && gulfHour < 12
      ? "morning — energetic, fresh start energy. Reference breakfast/coffee at NOIR, lunch prep at SASSO."
      : gulfHour >= 12 && gulfHour < 17
      ? "afternoon — balanced, productive tone. Lunch at SASSO, afternoon coffee at NOIR."
      : gulfHour >= 17 && gulfHour < 22
      ? "evening — warm, refined tone. Dinner at SASSO, evening atmosphere at NOIR."
      : "night — calm, intimate tone. Late-night exclusivity, quieter language.";

    // Fetch context in parallel
    const [metricsResult, insightsResult, segmentResult] = await Promise.all([
      serviceClient.rpc("get_dashboard_metrics"),
      serviceClient.from("ai_insights").select("title, summary, severity, insight_type, generated_at").eq("is_dismissed", false).order("generated_at", { ascending: false }).limit(10),
      serviceClient.from("guest_segments").select("segment_type, segment_label").limit(2000),
    ]);

    const metrics = metricsResult.data ?? {};
    const insights = insightsResult.data ?? [];
    const segCounts: Record<string, Record<string, number>> = {};
    for (const r of segmentResult.data ?? []) {
      const t = (r as any).segment_type, l = (r as any).segment_label;
      if (!segCounts[t]) segCounts[t] = {};
      segCounts[t][l] = (segCounts[t][l] ?? 0) + 1;
    }

    const insightsContext = insights.length > 0
      ? `\n\nRecent AI Insights:\n${insights.map((i: any) => `- [${i.severity?.toUpperCase()}] ${i.title}: ${i.summary}`).join("\n")}`
      : "";

    const attachmentContext = attachments?.length
      ? `\n\nUser has attached ${attachments.length} file(s): ${attachments.map((a: any) => `${a.name} (${a.type}, URL: ${a.url})`).join(", ")}. Use the analyze_attachment tool if the user wants you to analyze them.`
      : "";

    const systemPrompt = `You are the RISE AI Copilot — an executive intelligence system with FULL operational authority over the RISE Holding loyalty platform (NOIR Café + SASSO restaurant).

You can EXECUTE actions, not just describe them. You have tools to query data, run classification, create admins, update contacts, generate reports, create segments, generate images, and analyze uploaded files.

CURRENT STATE:
- Metrics: ${JSON.stringify(metrics)}
- Segments: ${JSON.stringify(segCounts)}
- Admin: ${(admin as any).name} (${(admin as any).role})${insightsContext}${attachmentContext}

Tiers: Initiation → Connoisseur → Elite → Inner Circle → RISE Black. Cities: Doha, Riyadh.

OPERATIONAL RULES:
1. ALWAYS use tools to execute actions — never just describe what you would do
2. For destructive operations, ask for confirmation FIRST
3. After executing, verify results and report back clearly
4. Use markdown tables and bold numbers for data
5. For image generation, ALWAYS include the image URL in your response using the format: ![description](url)
6. When presenting generated images, include the URL so it renders in chat
7. Under 200 words unless detail requested

AVAILABLE TOOLS: query_analytics, run_classification, create_admin_user, update_contact, export_report, create_segment, generate_image, analyze_attachment

MOOD: It's currently ${mood} Adapt your energy, greetings, and suggestions accordingly.
LANGUAGE: Detect the user's language. If they write in Arabic, respond entirely in Arabic (RTL). If English, respond in English. Brand names stay in English.`;

    // ── ZAPIER AI CHATBOT PATH ──
    if (ZAPIER_AI_WEBHOOK_URL) {
      try {
        // For Zapier, we first try tool calling via Lovable AI (if available) for tool execution,
        // then use Zapier for the final conversational response
        if (LOVABLE_API_KEY) {
          // First call: non-streaming with tools via Lovable AI
          const firstResp = await callAIWithRetry({
            model: "openai/gpt-5.2",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            tools: TOOLS,
            tool_choice: "auto",
            stream: false,
          }, LOVABLE_API_KEY);

          if (firstResp.ok) {
            const firstData = await firstResp.json();
            const choice = firstData.choices?.[0];

            // Handle tool calls
            if (choice?.message?.tool_calls?.length > 0) {
              const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];

              for (const tc of choice.message.tool_calls) {
                const startTime = Date.now();
                const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
                const { result, requiresConfirmation } = await executeTool(
                  tc.function.name, args, serviceClient, (admin as any).id, authHeader, LOVABLE_API_KEY, SUPABASE_URL,
                );

                await serviceClient.from("ai_operator_logs").insert({
                  admin_id: (admin as any).id,
                  action_type: tc.function.name,
                  intent: messages[messages.length - 1]?.content ?? "",
                  input_params: args,
                  output_result: typeof result === "object" ? result : { value: result },
                  status: requiresConfirmation ? "pending" : "completed",
                  requires_confirmation: requiresConfirmation,
                  ai_rationale: `Tool ${tc.function.name} called via AI Copilot (Zapier mode)`,
                  execution_time_ms: Date.now() - startTime,
                });

                toolResults.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
              }

              // Use Zapier for the follow-up response with tool results context
              const toolContext = toolResults.map(tr => `Tool Result: ${tr.content}`).join("\n");
              const enrichedMessages = [
                ...messages,
                { role: "assistant", content: `I executed the following tools and got results:\n${toolContext}` },
                { role: "user", content: "Based on the tool results above, provide a clear summary and response." },
              ];

              const zapierReply = await callZapierAI(ZAPIER_AI_WEBHOOK_URL, enrichedMessages, systemPrompt);
              return new Response(textToSSEStream(zapierReply), {
                headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
              });
            }
          }
        }

        // No tools needed or no Lovable API key — send directly to Zapier
        const zapierReply = await callZapierAI(ZAPIER_AI_WEBHOOK_URL, messages, systemPrompt);
        return new Response(textToSSEStream(zapierReply), {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      } catch (zapierErr) {
        console.error("Zapier AI error, falling back to Lovable AI:", zapierErr);
        // Fall through to Lovable AI fallback below
      }
    }

    // ── LOVABLE AI FALLBACK PATH ──
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // First call: non-streaming with tools
    const firstResp = await callAIWithRetry({
      model: "openai/gpt-5.2",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      tools: TOOLS,
      tool_choice: "auto",
      stream: false,
    }, LOVABLE_API_KEY);

    if (!firstResp.ok) {
      if (firstResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (firstResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await firstResp.text();
      console.error("AI gateway error:", firstResp.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstData = await firstResp.json();
    const choice = firstData.choices?.[0];

    if (!choice) {
      return new Response(JSON.stringify({ error: "No AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle tool calls
    if (choice.message?.tool_calls?.length > 0) {
      const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];

      for (const tc of choice.message.tool_calls) {
        const startTime = Date.now();
        const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;

        const { result, requiresConfirmation } = await executeTool(
          tc.function.name, args, serviceClient, (admin as any).id, authHeader, LOVABLE_API_KEY, SUPABASE_URL,
        );

        await serviceClient.from("ai_operator_logs").insert({
          admin_id: (admin as any).id,
          action_type: tc.function.name,
          intent: messages[messages.length - 1]?.content ?? "",
          input_params: args,
          output_result: typeof result === "object" ? result : { value: result },
          status: requiresConfirmation ? "pending" : "completed",
          requires_confirmation: requiresConfirmation,
          ai_rationale: `Tool ${tc.function.name} called via AI Copilot`,
          execution_time_ms: Date.now() - startTime,
        });

        toolResults.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
      }

      const followUp = await callAIWithRetry({
        model: "openai/gpt-5.2",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          choice.message,
          ...toolResults,
        ],
        stream: true,
      }, LOVABLE_API_KEY);

      if (!followUp.ok) {
        return new Response(JSON.stringify({ error: "AI follow-up failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(followUp.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls — stream response
    const streamResp = await callAIWithRetry({
      model: "openai/gpt-5.2",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }, LOVABLE_API_KEY);

    if (!streamResp.ok) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(streamResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
