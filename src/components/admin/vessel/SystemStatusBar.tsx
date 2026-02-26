import { cn } from "@/lib/utils";

interface SystemStatusBarProps {
  isCrisis: boolean;
  totalMembers: number;
  activeMembers: number;
  visitsMonth: number;
  vipCount: number;
  churnRisk: number;
}

export default function SystemStatusBar({
  isCrisis,
  totalMembers,
  activeMembers,
  visitsMonth,
  vipCount,
  churnRisk,
}: SystemStatusBarProps) {
  const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  return (
    <div className={cn(
      "relative z-20 flex items-center justify-between px-6 py-2 border-b backdrop-blur-xl transition-colors duration-1000",
      isCrisis
        ? "border-destructive/20 bg-destructive/5"
        : "border-primary/10 bg-card/10"
    )}>
      {/* Left — System identity */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          isCrisis ? "bg-destructive" : "bg-emerald-500"
        )} />
        <span className="text-[10px] uppercase tracking-[0.25em] text-primary/70 font-semibold">
          {isCrisis ? "⚠ INSTABILITY DETECTED" : "RISE INTELLIGENCE CHAMBER"}
        </span>
      </div>

      {/* Center — Key metrics */}
      <div className="flex items-center gap-6">
        <StatusMetric label="MEMBERS" value={totalMembers.toLocaleString()} />
        <StatusMetric label="VISITS/MO" value={visitsMonth.toLocaleString()} />
        <StatusMetric label="VIP" value={vipCount.toLocaleString()} />
        <StatusMetric label="RETENTION" value={`${retentionRate}%`} warn={retentionRate < 60} />
        <StatusMetric label="CHURN RISK" value={churnRisk.toLocaleString()} warn={churnRisk > totalMembers * 0.3} />
      </div>

      {/* Right — Time */}
      <div className="text-[10px] text-muted-foreground/40 tabular-nums tracking-wider">
        {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}

function StatusMetric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">{label}</span>
      <span className={cn(
        "text-[11px] font-mono tabular-nums",
        warn ? "text-destructive/80" : "text-foreground/70"
      )}>
        {value}
      </span>
    </div>
  );
}
