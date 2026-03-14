import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, TrendingDown, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const severityConfig: Record<string, { icon: typeof AlertTriangle; accent: string }> = {
  critical: { icon: AlertTriangle, accent: "hsl(var(--burgundy-light))" },
  warning: { icon: TrendingDown, accent: "hsl(var(--gold))" },
  info: { icon: Info, accent: "hsl(var(--sapphire-bright))" },
  opportunity: { icon: Sparkles, accent: "hsl(var(--gold-light))" },
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
            className="shrink-0 relative flex items-start gap-2.5 rounded-xl min-w-[230px] max-w-[280px] px-4 py-3 backdrop-blur-md border border-border/20 bg-card/40 transition-all duration-300 hover:bg-card/60 hover:border-primary/15 animate-fade-in"
            style={{
              animationDelay: `${idx * 80}ms`,
              animationFillMode: "both",
            }}
          >
            {/* Top gold edge line */}
            <div
              className="absolute top-0 left-3 right-3 h-px rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)`, opacity: 0.4 }}
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
