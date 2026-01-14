import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl text-card-foreground transition-all duration-300 ease-luxury",
  {
    variants: {
      variant: {
        // Default — Crystal Glass
        default: "crystal-panel",
        
        // Glass — Subtle transparency with refraction
        glass: [
          "bg-card/90 backdrop-blur-xl",
          "border border-border/40",
          "shadow-glass",
          "hover:border-primary/20 hover:shadow-crystal",
        ].join(" "),
        
        // Crystal — Premium glass morphism with beveled edges
        crystal: [
          "crystal-panel-elevated",
          "hover:border-primary/25",
          "relative overflow-hidden",
        ].join(" "),
        
        // Obsidian — Deep noir with crystal edge highlight
        obsidian: [
          "bg-gradient-to-b from-card via-card to-background",
          "border border-border/30",
          "shadow-[inset_0_1px_0_0_hsl(var(--crystal-silver)/0.06),inset_0_-1px_0_0_hsl(0_0%_0%/0.3),0_8px_32px_-8px_hsl(0_0%_0%/0.5)]",
          "hover:border-primary/30",
          "hover:shadow-[inset_0_1px_0_0_hsl(var(--gold)/0.1),inset_0_-1px_0_0_hsl(0_0%_0%/0.3),0_12px_40px_-8px_hsl(0_0%_0%/0.6),inset_0_0_60px_-20px_hsl(var(--gold)/0.03)]",
        ].join(" "),
        
        // Luxury (legacy) — Same as obsidian
        luxury: [
          "bg-gradient-to-b from-card via-card to-background",
          "border border-border/30",
          "shadow-[inset_0_1px_0_0_hsl(var(--crystal-silver)/0.06),0_8px_32px_-8px_hsl(0_0%_0%/0.5)]",
          "hover:border-primary/25",
        ].join(" "),
        
        // Metric — For dashboard metrics with inner glow
        metric: [
          "crystal-panel",
          "light-shift",
          "relative overflow-hidden",
        ].join(" "),
        
        // Elevated — Higher prominence with gold accent
        elevated: [
          "crystal-panel-elevated",
          "gold-foil-accent",
        ].join(" "),
        
        // VIP — Gold border with prestige glow
        vip: [
          "crystal-panel-gold",
          "relative overflow-hidden",
        ].join(" "),
        
        // Medallion — Baroque inspired with gold frame
        medallion: [
          "bg-gradient-to-b from-card via-card/95 to-muted/80",
          "border border-primary/40",
          "shadow-medallion",
          "relative overflow-hidden",
          "gold-foil-accent",
        ].join(" "),
        
        // Burgundy — Velvet accent
        burgundy: [
          "bg-gradient-to-b from-burgundy/20 to-card",
          "border border-burgundy/30",
          "shadow-[inset_0_1px_0_0_hsl(var(--burgundy-light)/0.1),0_8px_32px_-8px_hsl(var(--burgundy)/0.3)]",
        ].join(" "),
        
        // Sapphire — Deep blue accent
        sapphire: [
          "bg-gradient-to-b from-sapphire/20 to-card",
          "border border-sapphire/30",
          "shadow-[inset_0_1px_0_0_hsl(var(--sapphire-light)/0.1),0_8px_32px_-8px_hsl(var(--sapphire)/0.3)]",
        ].join(" "),
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
    <h3 ref={ref} className={cn("font-display text-xl font-medium leading-none tracking-crystal", className)} {...props} />
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
