import { Gift, Plus, Search } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function RewardsView() {
  const { data: rewards = [], isLoading } = useRewards();
  const [search, setSearch] = useState("");

  const filtered = rewards.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Rewards</h1>
          <p className="text-sm text-muted-foreground mt-1">{rewards.length} loyalty rewards configured</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-card">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search rewards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none w-48"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((reward) => (
          <div
            key={reward.id}
            className="rounded-xl p-4 border border-border/40 bg-card transition-all duration-300 hover:border-primary/20 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--gold) / 0.1)" }}>
                <Gift className="w-4 h-4 text-primary" />
              </div>
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: reward.availability !== "sold_out" ? "hsl(var(--success) / 0.1)" : "hsl(var(--muted) / 0.3)",
                  color: reward.availability !== "sold_out" ? "hsl(var(--success))" : "hsl(var(--muted-foreground))",
                }}
              >
                {reward.availability === "sold_out" ? "Sold Out" : "Active"}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{reward.title}</h3>
            {reward.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{reward.description}</p>
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
              <span className="text-xs text-muted-foreground uppercase">{reward.brand}</span>
              <span className="text-sm font-semibold text-primary">{reward.pointsCost.toLocaleString()} pts</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
            No rewards found
          </div>
        )}
      </div>
    </div>
  );
}
