import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Crown, Shield, Star, Diamond } from "lucide-react";

const emblemVariants = cva(
  "relative inline-flex items-center justify-center transition-all duration-400 ease-luxury",
  {
    variants: {
      tier: {
        initiation: [
          "text-muted-foreground",
        ].join(" "),
        
        connoisseur: [
          "text-amber-500",
        ].join(" "),
        
        elite: [
          "text-amber-400",
          "[filter:drop-shadow(0_0_6px_rgba(251,191,36,0.3))]",
        ].join(" "),
        
        "inner-circle": [
          "text-amber-300",
          "[filter:drop-shadow(0_0_10px_rgba(251,191,36,0.4))]",
        ].join(" "),
        
        black: [
          "text-primary",
          "[filter:drop-shadow(0_0_12px_rgba(200,162,74,0.5))]",
        ].join(" "),
      },
      size: {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
      },
    },
    defaultVariants: {
      tier: "initiation",
      size: "md",
    },
  }
);

const medallionVariants = cva(
  "absolute inset-0 rounded-full border-2 transition-all duration-400",
  {
    variants: {
      tier: {
        initiation: "border-muted-foreground/30 bg-muted/20",
        connoisseur: "border-amber-600/40 bg-amber-900/20",
        elite: "border-amber-500/50 bg-amber-800/25 shadow-[inset_0_0_20px_rgba(217,119,6,0.15)]",
        "inner-circle": "border-amber-400/60 bg-gradient-to-b from-amber-800/30 to-amber-900/30 shadow-[inset_0_0_30px_rgba(251,191,36,0.2)]",
        black: "border-primary/70 bg-gradient-to-b from-primary/20 to-primary/10 shadow-gold-glow",
      },
    },
    defaultVariants: {
      tier: "initiation",
    },
  }
);

export interface VIPEmblemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emblemVariants> {
  showMedallion?: boolean;
}

const tierIcons = {
  initiation: Star,
  connoisseur: Star,
  elite: Shield,
  "inner-circle": Crown,
  black: Diamond,
};

const VIPEmblem = React.forwardRef<HTMLDivElement, VIPEmblemProps>(
  ({ className, tier = "initiation", size = "md", showMedallion = true, ...props }, ref) => {
    const Icon = tierIcons[tier || "initiation"];
    const iconSizes = {
      sm: 14,
      md: 20,
      lg: 28,
      xl: 40,
    };
    
    return (
      <div
        ref={ref}
        className={cn(emblemVariants({ tier, size }), className)}
        {...props}
      >
        {showMedallion && (
          <div className={cn(medallionVariants({ tier }))} />
        )}
        <Icon 
          size={iconSizes[size || "md"]} 
          className="relative z-10" 
          strokeWidth={tier === "black" ? 1.5 : 2}
        />
      </div>
    );
  }
);
VIPEmblem.displayName = "VIPEmblem";

// Tier Badge with Emblem
interface TierBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tier: "initiation" | "connoisseur" | "elite" | "inner-circle" | "black";
  tierName?: string;
  showIcon?: boolean;
}

const tierNames = {
  initiation: "Initiation",
  connoisseur: "Connoisseur",
  elite: "Élite",
  "inner-circle": "Inner Circle",
  black: "RISE Black",
};

const TierBadge = React.forwardRef<HTMLDivElement, TierBadgeProps>(
  ({ className, tier, tierName, showIcon = true, ...props }, ref) => {
    const displayName = tierName || tierNames[tier];
    const Icon = tierIcons[tier];
    
    const badgeStyles = {
      initiation: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
      connoisseur: "border-amber-600/40 bg-amber-900/25 text-amber-400",
      elite: "border-amber-500/50 bg-amber-800/30 text-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.15)]",
      "inner-circle": "border-amber-400/50 bg-gradient-to-r from-amber-900/30 to-amber-800/30 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.2)]",
      black: "border-primary/60 bg-gradient-to-r from-card via-muted to-card text-primary shadow-gold-glow font-semibold tracking-ceremonial",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium font-body",
          "transition-all duration-220 ease-luxury",
          badgeStyles[tier],
          className
        )}
        {...props}
      >
        {showIcon && <Icon size={14} strokeWidth={tier === "black" ? 1.5 : 2} />}
        <span>{displayName}</span>
      </div>
    );
  }
);
TierBadge.displayName = "TierBadge";

export { VIPEmblem, TierBadge, emblemVariants };
