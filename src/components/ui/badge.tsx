import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium font-body tracking-refined transition-all duration-220 ease-luxury focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default — Subtle gold
        default: "border-primary/30 bg-primary/10 text-primary",
        
        // Secondary — Muted
        secondary: "border-border/50 bg-secondary text-secondary-foreground",
        
        // Destructive
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        
        // Outline — Crystal border
        outline: "text-foreground border-border/60 bg-transparent",
        
        // Success — Teal accent
        success: "border-teal/30 bg-teal/10 text-teal",
        
        // Gold — VIP
        gold: "border-primary/40 bg-primary/15 text-primary shadow-sm",
        
        // Tier Badges — Baroque medallion style
        initiation: [
          "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
        ].join(" "),
        
        connoisseur: [
          "border-amber-600/30 bg-amber-900/20 text-amber-400",
        ].join(" "),
        
        elite: [
          "border-amber-500/40 bg-amber-800/25 text-amber-300",
          "shadow-[0_0_8px_rgba(217,119,6,0.15)]",
        ].join(" "),
        
        "inner-circle": [
          "border-amber-400/50 bg-gradient-to-r from-amber-900/30 to-amber-800/30 text-amber-200",
          "shadow-[0_0_12px_rgba(251,191,36,0.2)]",
        ].join(" "),
        
        black: [
          "border-primary/60 bg-gradient-to-r from-card via-muted to-card text-primary",
          "shadow-gold-glow",
          "font-semibold tracking-ceremonial",
        ].join(" "),
        
        // VIP Emblem — Baroque style
        vip: [
          "border-primary/50 bg-gradient-to-b from-primary/20 to-primary/10",
          "text-primary font-semibold",
          "shadow-medallion",
          "px-4 py-1.5",
        ].join(" "),
        
        // Burgundy — Velvet
        burgundy: "border-burgundy/40 bg-burgundy/20 text-foreground",
        
        // Teal — Royal accent
        teal: "border-teal/40 bg-teal/15 text-teal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
