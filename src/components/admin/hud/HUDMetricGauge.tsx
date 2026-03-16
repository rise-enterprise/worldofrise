import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HUDMetricGaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color?: "gold" | "teal" | "burgundy" | "sapphire";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  gold: { stroke: "hsl(40, 62%, 56%)", glow: "hsl(40, 62%, 56%)" },
  teal: { stroke: "hsl(195, 62%, 32%)", glow: "hsl(195, 62%, 45%)" },
  burgundy: { stroke: "hsl(350, 55%, 30%)", glow: "hsl(350, 55%, 40%)" },
  sapphire: { stroke: "hsl(215, 60%, 35%)", glow: "hsl(215, 60%, 50%)" },
};

const sizeMap = { sm: 80, md: 110, lg: 140 };

export default function HUDMetricGauge({
  value, max, label, unit = "", color = "gold", size = "md",
}: HUDMetricGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const dim = sizeMap[size];
  const strokeWidth = size === "sm" ? 4 : 6;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(animatedValue / max, 1);
  const dashOffset = circumference * (1 - pct * 0.75); // 270° arc
  const c = colorMap[color];

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const displayVal = unit === "%" ? `${Math.round(animatedValue)}%` :
    animatedValue >= 1000000 ? `${(animatedValue / 1000000).toFixed(1)}M` :
    animatedValue >= 1000 ? `${(animatedValue / 1000).toFixed(1)}K` :
    Math.round(animatedValue).toLocaleString();

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-[135deg]">
          {/* Background arc */}
          <circle
            cx={dim / 2} cy={dim / 2} r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
            opacity={0.3}
          />
          {/* Value arc */}
          <circle
            cx={dim / 2} cy={dim / 2} r={radius}
            fill="none"
            stroke={c.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.23, 1, 0.32, 1)",
              filter: `drop-shadow(0 0 6px ${c.glow})`,
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "font-display font-bold tabular-nums gold-gradient-text",
            size === "sm" ? "text-base" : size === "md" ? "text-xl" : "text-2xl"
          )}>
            {displayVal}
          </span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 font-body text-center">
        {label}
      </span>
    </div>
  );
}
