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
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            disabled={disabled}
            onClick={() => onAction(action.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/40 bg-muted/30 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-primary/30 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
