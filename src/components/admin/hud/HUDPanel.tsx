import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HUDPanelProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gold" | "alert" | "minimal";
  label?: string;
}

export default function HUDPanel({ children, className, variant = "default", label }: HUDPanelProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        "backdrop-blur-xl border transition-all duration-300",
        variant === "default" && "bg-card/40 border-border/30 shadow-obsidian",
        variant === "gold" && "bg-card/30 border-primary/20 shadow-gold-glow",
        variant === "alert" && "bg-destructive/5 border-destructive/20",
        variant === "minimal" && "bg-transparent border-border/15",
        className
      )}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--foreground)/0.1)_2px,hsl(var(--foreground)/0.1)_4px)]" />
      
      {/* Top edge glow */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {label && (
        <div className="absolute top-2 left-3 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-body">
          {label}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
