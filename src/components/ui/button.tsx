import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium font-body transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground rounded-sm shadow-sm hover:bg-destructive/90",
        outline: "border border-border bg-background text-foreground rounded-sm shadow-sm hover:bg-muted hover:border-primary/30",
        secondary: "bg-secondary text-secondary-foreground rounded-sm shadow-sm hover:bg-secondary/80",
        ghost: "text-foreground rounded-sm hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Luxury Variants
        luxury: "bg-primary text-primary-foreground font-medium tracking-wide rounded-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:brightness-105 active:scale-[0.98]",
        "luxury-outline": "border border-primary/30 text-primary bg-transparent rounded-sm hover:bg-primary/5 hover:border-primary/50 tracking-wide",
        "crystal": "bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/15 text-foreground rounded-sm shadow-glass hover:bg-white/85 dark:hover:bg-white/15 hover:shadow-md",
        "crystal-primary": "bg-primary/90 backdrop-blur-sm text-primary-foreground rounded-sm shadow-lg hover:bg-primary hover:shadow-xl active:scale-[0.98]",
        minimal: "text-foreground hover:text-primary tracking-wide font-normal underline-offset-8 hover:underline rounded-none",
        // Legacy variants
        qatar: "bg-primary text-primary-foreground font-semibold shadow-primary hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] rounded-full",
        "qatar-outline": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground rounded-full font-semibold",
        premium: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold rounded-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        subtle: "bg-muted text-foreground rounded-sm hover:bg-muted/80",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
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