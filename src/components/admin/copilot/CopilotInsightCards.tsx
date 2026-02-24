import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, TrendingDown, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const severityConfig: Record<string, { icon: typeof AlertTriangle; color: string }> = {
  critical: { icon: AlertTriangle, color: "text-destructive bg-destructive/10 border-destructive/20" },
  warning: { icon: TrendingDown, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  info: { icon: Info, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  opportunity: { icon: Sparkles, color: "text-primary bg-primary/10 border-primary/20" },
};

export default function CopilotInsightCards() {
  const { data: insights } = useQuery({
    queryKey: ["ai-insights-copilot"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_insights")
        .select("id, title, summary, severity, insight_type")
        .eq("is_dismissed", false)
        .order("generated_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
    staleTime: 60000,
  });

  if (!insights?.length) return null;

  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-none">
      {insights.map((insight) => {
        const config = severityConfig[insight.severity ?? "info"] ?? severityConfig.info;
        const Icon = config.icon;
        return (
          <div
            key={insight.id}
            className={cn(
              "shrink-0 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 min-w-[220px] max-w-[280px]",
              config.color
            )}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{insight.title}</p>
              <p className="text-[11px] opacity-80 line-clamp-2 mt-0.5">{insight.summary}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
