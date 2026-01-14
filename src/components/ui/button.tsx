import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium font-body tracking-refined transition-all duration-280 ease-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default — Crystal noir
        default: [
          "bg-secondary text-foreground",
          "border border-border/50",
          "shadow-[inset_0_1px_0_0_hsl(var(--crystal-silver)/0.05)]",
          "hover:border-primary/30 hover:bg-secondary/80",
          "hover:shadow-[inset_0_1px_0_0_hsl(var(--gold)/0.08)]",
        ].join(" "),
        
        // VIP Gold Primary — Metallic gold with bevel and prestige
        "vip-gold": [
          "bg-gradient-to-b from-primary via-primary/95 to-primary/85",
          "text-primary-foreground font-semibold tracking-ceremonial",
          "border border-primary/50",
          "shadow-[inset_0_1px_0_0_hsl(var(--gold-light)/0.3),inset_0_-1px_0_0_hsl(var(--gold-shadow)/0.3),0_4px_16px_-4px_hsl(var(--gold)/0.4)]",
          "hover:shadow-[inset_0_1px_0_0_hsl(var(--gold-light)/0.4),inset_0_-1px_0_0_hsl(var(--gold-shadow)/0.3),0_8px_24px_-4px_hsl(var(--gold)/0.5)]",
          "hover:from-primary hover:to-primary/90",
          "active:shadow-[inset_0_2px_4px_0_hsl(var(--gold-shadow)/0.4)]",
        ].join(" "),
        
        // Luxury (legacy) — Same as vip-gold
        luxury: [
          "bg-gradient-to-b from-primary via-primary/95 to-primary/85",
          "text-primary-foreground font-semibold tracking-ceremonial",
          "border border-primary/50",
          "shadow-[inset_0_1px_0_0_hsl(var(--gold-light)/0.3),0_4px_16px_-4px_hsl(var(--gold)/0.4)]",
          "hover:shadow-[inset_0_1px_0_0_hsl(var(--gold-light)/0.4),0_8px_24px_-4px_hsl(var(--gold)/0.5)]",
        ].join(" "),
        
        // Crystal — Glass button with refraction
        crystal: [
          "bg-card/80 backdrop-blur-xl text-foreground",
          "border border-border/60",
          "shadow-[inset_0_1px_0_0_hsl(var(--crystal-silver)/0.08)]",
          "hover:border-primary/40",
          "hover:bg-card/90",
          "hover:shadow-[inset_0_1px_0_0_hsl(var(--gold)/0.1),inset_0_0_30px_-10px_hsl(var(--gold)/0.03)]",
        ].join(" "),
        
        // Noir — Deep obsidian with subtle gold on hover
        noir: [
          "bg-card text-foreground",
          "border border-border/60",
          "shadow-[inset_0_1px_0_0_hsl(var(--crystal-silver)/0.05)]",
          "hover:border-primary/40",
          "hover:shadow-[inset_0_0_30px_-10px_hsl(var(--gold)/0.03)]",
        ].join(" "),
        
        // Destructive
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
          "shadow-[0_4px_12px_-4px_hsl(0_62%_30%/0.4)]",
        ].join(" "),
        
        // Outline — Crystal silver border
        outline: [
          "border border-border/60 bg-transparent text-foreground",
          "hover:bg-card/50 hover:border-primary/30",
          "hover:shadow-[inset_0_0_20px_-10px_hsl(var(--gold)/0.02)]",
        ].join(" "),
        
        // Secondary
        secondary: [
          "bg-secondary text-secondary-foreground",
          "border border-border/30",
          "hover:bg-secondary/80",
        ].join(" "),
        
        // Ghost — Subtle hover
        ghost: [
          "text-muted-foreground",
          "hover:bg-card/50 hover:text-foreground",
        ].join(" "),
        
        // Link — Gold underline on hover
        link: "text-primary underline-offset-4 hover:underline",
        
        // Text CTA — Crystal underline appears on hover
        "text-cta": [
          "text-muted-foreground bg-transparent",
          "relative",
          "after:absolute after:bottom-0 after:left-0 after:h-px after:w-0",
          "after:bg-gradient-to-r after:from-primary after:to-teal",
          "hover:text-foreground hover:after:w-full after:transition-all after:duration-300",
        ].join(" "),
        
        // Minimal — Just text
        minimal: "text-muted-foreground hover:text-foreground transition-colors",
        
        // Burgundy — Velvet accent
        burgundy: [
          "bg-gradient-to-b from-burgundy to-burgundy/80",
          "text-foreground",
          "border border-burgundy/60",
          "shadow-[inset_0_1px_0_0_hsl(var(--burgundy-light)/0.2)]",
          "hover:from-burgundy/90 hover:to-burgundy/70",
        ].join(" "),
        
        // Sapphire — Deep blue
        sapphire: [
          "bg-gradient-to-b from-sapphire to-sapphire/80",
          "text-foreground",
          "border border-sapphire/60",
          "shadow-[inset_0_1px_0_0_hsl(var(--sapphire-light)/0.2)]",
          "hover:from-sapphire/90 hover:to-sapphire/70",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg tracking-ceremonial",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
