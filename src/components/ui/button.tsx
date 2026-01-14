import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium font-body tracking-refined transition-all duration-220 ease-luxury focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default — Subtle noir
        default: "bg-secondary text-foreground border border-border/50 hover:border-primary/30 hover:bg-secondary/80",
        
        // VIP Gold Primary — Metallic gradient with bevel
        "vip-gold": [
          "bg-gradient-to-b from-primary via-primary/90 to-primary/80",
          "text-primary-foreground font-semibold tracking-ceremonial",
          "border border-primary/40",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(200,162,74,0.3)]",
          "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_6px_20px_rgba(200,162,74,0.4)]",
          "hover:from-primary/95 hover:to-primary/85",
        ].join(" "),
        
        // Luxury (legacy) — Same as vip-gold
        luxury: [
          "bg-gradient-to-b from-primary via-primary/90 to-primary/80",
          "text-primary-foreground font-semibold tracking-ceremonial",
          "border border-primary/40",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(200,162,74,0.3)]",
          "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_6px_20px_rgba(200,162,74,0.4)]",
          "hover:from-primary/95 hover:to-primary/85",
        ].join(" "),
        
        // Crystal (legacy) — Same as noir
        crystal: [
          "bg-card text-foreground",
          "border border-border/60",
          "hover:border-primary/40",
          "hover:shadow-[inset_0_0_30px_rgba(200,162,74,0.03)]",
        ].join(" "),
        
        // Noir Secondary — Crystal border with inner glow
        noir: [
          "bg-card text-foreground",
          "border border-border/60",
          "hover:border-primary/40",
          "hover:shadow-[inset_0_0_30px_rgba(200,162,74,0.03)]",
        ].join(" "),
        
        // Destructive
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        // Outline — Crystal silver border
        outline: "border border-border/60 bg-transparent text-foreground hover:bg-card hover:border-primary/30",
        
        // Secondary
        secondary: "bg-secondary text-secondary-foreground border border-border/30 hover:bg-secondary/80",
        
        // Ghost — Subtle hover
        ghost: "text-muted-foreground hover:bg-card hover:text-foreground",
        
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
          "bg-burgundy text-foreground",
          "border border-burgundy/60",
          "hover:bg-burgundy/80",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
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
