import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, TrendingDown, Sparkles, Info } from "lucide-react";

const severityConfig: Record<string, { icon: typeof AlertTriangle; accent: string }> = {
  critical: { icon: AlertTriangle, accent: "hsl(var(--neon-magenta))" },
  warning: { icon: TrendingDown, accent: "hsl(var(--gold))" },
  info: { icon: Info, accent: "hsl(var(--neon-blue))" },
  opportunity: { icon: Sparkles, accent: "hsl(var(--neon-purple-light))" },
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
      {insights.map((insight, idx) => {
        const config = severityConfig[insight.severity ?? "info"] ?? severityConfig.info;
        const Icon = config.icon;
        return (
          <div
            key={insight.id}
            className="shrink-0 relative flex items-start gap-2.5 rounded-xl min-w-[230px] max-w-[280px] px-4 py-3 backdrop-blur-md border border-neon-purple/10 bg-card/30 transition-all duration-300 hover:bg-neon-purple/[0.04] hover:border-neon-purple/20 animate-fade-in"
            style={{
              animationDelay: `${idx * 80}ms`,
              animationFillMode: "both",
            }}
          >
            <div
              className="absolute top-0 left-3 right-3 h-px rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)`, opacity: 0.3 }}
            />
            <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: config.accent }} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground/90 truncate">{insight.title}</p>
              <p className="text-[11px] text-muted-foreground/60 line-clamp-2 mt-0.5">{insight.summary}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
