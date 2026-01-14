import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl text-card-foreground transition-all duration-300 ease-luxury",
  {
    variants: {
      variant: {
        // Default — Obsidian surface
        default: "bg-card border border-border/50 shadow-glass",
        
        // Luxury (legacy) — same as obsidian
        luxury: "bg-gradient-to-b from-card to-background border border-border/30 shadow-obsidian hover:border-primary/25 hover:shadow-obsidian-lg",
        
        // Glass — Subtle transparency
        glass: "bg-card/95 backdrop-blur-xl border border-border/40 shadow-glass",
        
        // Metric — For dashboard metrics
        metric: "glass-panel light-shift",
        
        // Elevated — Higher prominence
        elevated: "bg-card border border-border/40 shadow-crystal",
        
        // Crystal (legacy) — Same as obsidian
        crystal: "bg-card/98 backdrop-blur-2xl border border-border/30 shadow-crystal light-shift",
        
        // Obsidian — Deep noir with inner light on hover
        obsidian: "bg-gradient-to-b from-card to-background border border-border/30 shadow-obsidian hover:border-primary/25 hover:shadow-obsidian-lg",
        
        // VIP — Gold border glow
        vip: "bg-card border border-primary/30 shadow-[0_4px_24px_-4px_rgba(200,162,74,0.15)] hover:border-primary/50 hover:shadow-gold-glow",
        
        // Medallion — Baroque inspired
        medallion: "bg-gradient-to-b from-card via-card to-muted border border-primary/40 shadow-medallion relative overflow-hidden",
        
        // Burgundy — Velvet accent
        burgundy: "bg-gradient-to-b from-burgundy/20 to-card border border-burgundy/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-display text-xl font-medium leading-none tracking-refined", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground font-body tracking-refined", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
