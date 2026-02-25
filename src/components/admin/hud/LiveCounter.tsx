import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LiveCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: number; // percentage
  className?: string;
}

export default function LiveCounter({ value, label, prefix = "", suffix = "", trend, className }: LiveCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = value;
    };
    requestAnimationFrame(animate);
  }, [value]);

  const formatted = display >= 1000000
    ? `${(display / 1000000).toFixed(1)}M`
    : display >= 1000
    ? `${(display / 1000).toFixed(1)}K`
    : Math.round(display).toLocaleString();

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-xs text-muted-foreground/50">{prefix}</span>}
        <span className="text-2xl font-display font-bold tabular-nums gold-gradient-text">
          {formatted}
        </span>
        {suffix && <span className="text-xs text-muted-foreground/50">{suffix}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-body">
          {label}
        </span>
        {trend !== undefined && (
          <span className={cn(
            "text-[10px] font-semibold",
            trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
