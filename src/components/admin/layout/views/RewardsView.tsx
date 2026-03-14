import { Gift } from "lucide-react";

export default function RewardsView() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Rewards</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage loyalty rewards and redemptions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Signature Tasting", points: 500, brand: "NOIR", active: true },
          { title: "Chef's Table", points: 2000, brand: "SASSO", active: true },
          { title: "Private Event Access", points: 5000, brand: "RISE", active: true },
          { title: "Luxury Gift Set", points: 3000, brand: "NOIR", active: false },
          { title: "VIP Lounge Pass", points: 1500, brand: "RISE", active: true },
          { title: "Anniversary Dinner", points: 4000, brand: "SASSO", active: true },
        ].map((reward) => (
          <div
            key={reward.title}
            className="rounded-xl p-4 border border-border/40 bg-card transition-all duration-300 hover:border-primary/20"
          >
            <div className="flex items-center justify-between mb-3">
              <Gift className="w-5 h-5 text-primary" />
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: reward.active ? "hsl(var(--success) / 0.1)" : "hsl(var(--muted) / 0.3)",
                  color: reward.active ? "hsl(var(--success))" : "hsl(var(--muted-foreground))",
                }}
              >
                {reward.active ? "Active" : "Paused"}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{reward.title}</h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{reward.brand}</span>
              <span className="text-xs font-medium text-primary">{reward.points.toLocaleString()} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
