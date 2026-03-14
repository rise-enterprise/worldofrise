import { Zap, Users, TrendingDown, MessageSquare, BarChart3, Search } from "lucide-react";

interface CopilotQuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

const quickActions = [
  { icon: TrendingDown, label: "Churn risks", prompt: "Show me members at high churn risk and suggest re-engagement strategies" },
  { icon: Users, label: "VIP overview", prompt: "Give me a summary of our VIP members — who are the top spenders and any at risk of leaving?" },
  { icon: Zap, label: "Quick stats", prompt: "Give me today's key metrics: total members, visits this month, brand performance, and anything that needs attention" },
  { icon: MessageSquare, label: "Draft campaign", prompt: "Help me draft a re-engagement campaign for dormant members who haven't visited in 30+ days" },
  { icon: BarChart3, label: "Brand comparison", prompt: "Compare NOIR Café vs SASSO performance — visits, member distribution, and growth trends" },
  { icon: Search, label: "Member lookup", prompt: "How do I look up a specific member and adjust their points or tier?" },
];

export default function CopilotQuickActions({ onAction, disabled }: CopilotQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {quickActions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            disabled={disabled}
            onClick={() => onAction(action.prompt)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-neon-purple/10 bg-neon-purple/[0.03] text-xs text-muted-foreground/70 transition-all duration-300 hover:text-neon-purple-light hover:bg-neon-purple/[0.08] hover:border-neon-purple/25 hover:shadow-[0_0_14px_-4px_hsl(var(--neon-purple)_/_0.2)] disabled:opacity-30 disabled:pointer-events-none animate-fade-in"
            style={{
              animationDelay: `${idx * 60}ms`,
              animationFillMode: "both",
            }}
          >
            <Icon className="w-3.5 h-3.5 transition-all duration-300 group-hover:drop-shadow-[0_0_4px_hsl(var(--neon-purple)_/_0.5)]" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
