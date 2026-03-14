import { BarChart3 } from "lucide-react";

export default function AnalyticsView() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Advanced data visualization and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Visit Trends", "Revenue by Location", "Member Growth", "Churn Analysis"].map((title) => (
          <div
            key={title}
            className="rounded-xl p-5 border border-border/40 bg-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            </div>
            <div className="h-40 flex items-center justify-center rounded-lg" style={{ background: "hsl(var(--muted) / 0.2)" }}>
              <span className="text-xs text-muted-foreground">Chart visualization</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
