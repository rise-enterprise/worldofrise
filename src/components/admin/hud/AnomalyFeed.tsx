import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, TrendingDown, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import HUDPanel from "./HUDPanel";

const severityIcon: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: TrendingDown,
  opportunity: TrendingUp,
  info: Info,
};

const severityColor: Record<string, string> = {
  critical: "text-destructive",
  warning: "text-yellow-400",
  opportunity: "text-primary",
  info: "text-sapphire-light",
};

export default function AnomalyFeed() {
  const { data: insights } = useQuery({
    queryKey: ["hud-anomalies"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_insights")
        .select("id, title, summary, severity, insight_type, generated_at")
        .eq("is_dismissed", false)
        .order("generated_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  return (
    <HUDPanel label="Anomaly Radar" className="h-full">
      <div className="pt-7 pb-3 px-3 space-y-1.5 overflow-y-auto max-h-[280px] scrollbar-hide">
        {insights?.length ? insights.map((item, i) => {
          const Icon = severityIcon[item.severity ?? "info"] ?? Info;
          const color = severityColor[item.severity ?? "info"] ?? "text-muted-foreground";
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-2 px-2.5 py-2 rounded-lg bg-muted/20 border border-border/20",
                "animate-soft-reveal",
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative mt-0.5">
                <Icon className={cn("w-3.5 h-3.5", color)} />
                {item.severity === "critical" && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-foreground/90 truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground/70 line-clamp-2 mt-0.5">{item.summary}</p>
              </div>
            </div>
          );
        }) : (
          <div className="flex items-center justify-center h-20 text-muted-foreground/40 text-xs">
            No anomalies detected
          </div>
        )}
      </div>
    </HUDPanel>
  );
}
