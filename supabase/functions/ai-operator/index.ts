import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tool definitions for the AI operator
const TOOLS = [
  {
    type: "function",
    function: {
      name: "query_analytics",
      description: "Query analytics data: metrics, tier distribution, segment counts, brand performance",
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
      description: "Rerun RFM segmentation and tier classification on all contacts. Use when asked to fix, rebuild, or reclassify segments.",
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
];

// Tool execution functions
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  adminId: string,
  authHeader: string,
): Promise<{ result: unknown; requiresConfirmation: boolean }> {
  switch (toolName) {
    case "query_analytics": {
      const qt = args.query_type as string;
      if (qt === "dashboard_metrics") {
        const { data } = await supabase.rpc("get_dashboard_metrics", {
          brand_filter: args.brand_filter === "all" ? null : (args.brand_filter as string) ?? null,
        });
        return { result: data, requiresConfirmation: false };
      }
      if (qt === "segment_distribution") {
        const { data } = await supabase
          .from("guest_segments")
          .select("segment_type, segment_label")
          .limit(1000);
        const dist: Record<string, Record<string, number>> = {};
        for (const row of data ?? []) {
          const t = (row as any).segment_type;
          const l = (row as any).segment_label;
          if (!dist[t]) dist[t] = {};
          dist[t][l] = (dist[t][l] ?? 0) + 1;
        }
        return { result: dist, requiresConfirmation: false };
      }
      if (qt === "tier_distribution") {
        const { data } = await supabase
          .from("guest_segments")
          .select("segment_label")
          .eq("segment_type", "computed_tier")
          .limit(1000);
        const dist: Record<string, number> = {};
        for (const row of data ?? []) {
          const l = (row as any).segment_label;
          dist[l] = (dist[l] ?? 0) + 1;
        }
        return { result: dist, requiresConfirmation: false };
      }
      if (qt === "contact_count") {
        const { count } = await supabase.from("contacts").select("id", { count: "exact", head: true });
        return { result: { total_contacts: count }, requiresConfirmation: false };
      }
      if (qt === "import_history") {
        const { data } = await supabase
          .from("import_runs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        return { result: data, requiresConfirmation: false };
      }
      if (qt === "recent_activity") {
        const { data } = await supabase
          .from("audit_logs")
          .select("action_type, entity_type, created_at")
          .order("created_at", { ascending: false })
          .limit(20);
        return { result: data, requiresConfirmation: false };
      }
      return { result: { error: "Unknown query type" }, requiresConfirmation: false };
    }

    case "run_classification": {
      // Call the classify-contacts function
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const results: unknown[] = [];
      let offset = 0;
      let done = false;
      while (!done) {
        const resp = await fetch(`${supabaseUrl}/functions/v1/classify-contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
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
          message: `⚠️ CONFIRMATION REQUIRED: Create admin user "${args.name}" (${args.email}) with role "${args.role}"${args.brand_scope ? ` scoped to ${args.brand_scope}` : ""}. This action requires explicit confirmation. Please confirm with "Yes, create this admin."`,
        },
        requiresConfirmation: true,
      };
    }

    case "update_contact": {
      const lookup = args.lookup as string;
      let query = supabase.from("contacts").select("id, first_name, last_name, email, phone").limit(1);
      if (lookup.includes("@")) query = query.eq("email", lookup.toLowerCase());
      else if (/^\+?\d{5,}$/.test(lookup.replace(/[\s\-()]/g, ""))) query = query.eq("phone", lookup);
      else query = query.eq("id", lookup);

      const { data: found } = await query.maybeSingle();
      if (!found) return { result: { error: `Contact not found: ${lookup}` }, requiresConfirmation: false };

      const { error: updateErr } = await supabase
        .from("contacts")
        .update(args.updates as Record<string, unknown>)
        .eq("id", (found as any).id);

      if (updateErr) return { result: { error: updateErr.message }, requiresConfirmation: false };
      return { result: { updated: true, contact_id: (found as any).id, fields_updated: Object.keys(args.updates as object) }, requiresConfirmation: false };
    }

    case "export_report": {
      const rt = args.report_type as string;
      const limit = (args.limit as number) ?? 50;

      if (rt === "dormant_vips") {
        const { data } = await supabase
          .from("contacts")
          .select("first_name, last_name, email, phone, visits, total_spend, last_visit, loyalty_tier")
          .eq("vip", true)
          .or("last_visit.is.null,last_visit.lt." + new Date(Date.now() - 90 * 86400000).toISOString())
          .limit(limit);
        return { result: { report: "dormant_vips", count: data?.length ?? 0, data }, requiresConfirmation: false };
      }

      if (rt === "top_spenders") {
        const { data } = await supabase
          .from("contacts")
          .select("first_name, last_name, total_spend, visits, loyalty_tier, last_location")
          .order("total_spend", { ascending: false })
          .limit(limit);
        return { result: { report: "top_spenders", count: data?.length ?? 0, data }, requiresConfirmation: false };
      }

      if (rt === "segment_summary") {
        const { data } = await supabase
          .from("guest_segments")
          .select("segment_type, segment_label")
          .limit(5000);
        const summary: Record<string, Record<string, number>> = {};
        for (const r of data ?? []) {
          const t = (r as any).segment_type;
          const l = (r as any).segment_label;
          if (!summary[t]) summary[t] = {};
          summary[t][l] = (summary[t][l] ?? 0) + 1;
        }
        return { result: { report: "segment_summary", summary }, requiresConfirmation: false };
      }

      if (rt === "tier_mismatch") {
        const { data } = await supabase
          .from("guest_segments")
          .select("contact_id, segment_label, metadata_json")
          .eq("segment_type", "computed_tier")
          .limit(1000);
        const mismatches = (data ?? []).filter((r: any) => r.metadata_json?.matches === false);
        return { result: { report: "tier_mismatch", total_mismatches: mismatches.length, sample: mismatches.slice(0, 20) }, requiresConfirmation: false };
      }

      return { result: { error: "Unknown report type" }, requiresConfirmation: false };
    }

    case "create_segment": {
      // Insert segment rules as an AI insight for now
      await supabase.from("ai_insights").insert({
        insight_type: "custom_segment",
        title: `Custom Segment: ${args.name}`,
        summary: `Segment created by AI operator with rules: ${JSON.stringify(args.rules)}`,
        severity: "info",
        details_json: { name: args.name, rules: args.rules, created_by: adminId },
      });
      return { result: { created: true, name: args.name, rules: args.rules }, requiresConfirmation: false };
    }

    default:
      return { result: { error: `Unknown tool: ${toolName}` }, requiresConfirmation: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
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

    const { messages } = await req.json();

    // Fetch context
    const [metricsResult, segmentResult, importResult] = await Promise.all([
      serviceClient.rpc("get_dashboard_metrics"),
      serviceClient.from("guest_segments").select("segment_type, segment_label").limit(2000),
      serviceClient.from("import_runs").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    const metrics = metricsResult.data ?? {};
    const segCounts: Record<string, Record<string, number>> = {};
    for (const r of segmentResult.data ?? []) {
      const t = (r as any).segment_type;
      const l = (r as any).segment_label;
      if (!segCounts[t]) segCounts[t] = {};
      segCounts[t][l] = (segCounts[t][l] ?? 0) + 1;
    }

    // Compute Gulf time mood (UTC+3)
    const gulfHour = (new Date().getUTCHours() + 3) % 24;
    const mood = gulfHour >= 6 && gulfHour < 12
      ? "morning — deliver morning briefings, fresh data summaries."
      : gulfHour >= 12 && gulfHour < 17
      ? "afternoon — mid-day operational focus, progress updates."
      : gulfHour >= 17 && gulfHour < 22
      ? "evening — end-of-day summaries, wrap-up tone."
      : "night — minimal, concise, late-night ops mode.";

    const systemPrompt = `You are the RISE AI Operator — an executive intelligence system with FULL operational control over the RISE Holding loyalty platform.

You can EXECUTE actions, not just describe them. You have tools to query data, run classification, create admins, update contacts, generate reports, and create segments.

CURRENT STATE:
- Metrics: ${JSON.stringify(metrics)}
- Segment Distribution: ${JSON.stringify(segCounts)}
- Recent Imports: ${JSON.stringify((importResult.data ?? []).map((i: any) => ({ file: i.file_name, status: i.status, rows: i.total_rows, imported: i.rows_imported, rejected: i.rows_rejected })))}

ADMIN: ${(admin as any).name} (${(admin as any).role})

OPERATIONAL RULES:
1. ALWAYS use tools to execute actions — never just describe what you would do
2. For destructive operations (delete, overwrite rules), ask for confirmation FIRST
3. After executing, verify results and report back clearly
4. Log your rationale for every action
5. Use markdown tables and bold numbers for data presentation
6. When asked to fix imports or reclassify, use the run_classification tool
7. For reports, use export_report tool and present results in tables

AVAILABLE TOOLS: query_analytics, run_classification, create_admin_user, update_contact, export_report, create_segment

You operate with full authority within the RISE platform. Execute commands decisively.
MOOD: It's currently ${mood} Adapt your greeting and report style accordingly.
LANGUAGE: Detect the user's language. If they write in Arabic, respond entirely in Arabic. If English, respond in English. Match their language naturally. Tool names and technical terms can remain in English.`;

    // Use tool-calling model
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools: TOOLS,
        tool_choice: "auto",
        stream: false,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error:", aiResp.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const choice = aiData.choices?.[0];

    if (!choice) {
      return new Response(JSON.stringify({ error: "No AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle tool calls
    if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];

      for (const tc of choice.message.tool_calls) {
        const startTime = Date.now();
        const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;

        const { result, requiresConfirmation } = await executeTool(
          tc.function.name,
          args,
          serviceClient,
          (admin as any).id,
          authHeader,
        );

        // Log to ai_operator_logs
        await serviceClient.from("ai_operator_logs").insert({
          admin_id: (admin as any).id,
          action_type: tc.function.name,
          intent: messages[messages.length - 1]?.content ?? "",
          input_params: args,
          output_result: typeof result === "object" ? result : { value: result },
          status: requiresConfirmation ? "pending" : "completed",
          requires_confirmation: requiresConfirmation,
          ai_rationale: `Tool ${tc.function.name} called in response to admin command`,
          execution_time_ms: Date.now() - startTime,
        });

        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }

      // Second AI call with tool results
      const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5.2",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            choice.message,
            ...toolResults,
          ],
          stream: true,
        }),
      });

      if (!followUp.ok) {
        return new Response(JSON.stringify({ error: "AI follow-up failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(followUp.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls - stream the response directly using a second streaming call
    const streamResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    return new Response(streamResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-operator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
