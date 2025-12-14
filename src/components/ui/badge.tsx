import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium font-body transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        success: "border-transparent bg-green-500/20 text-green-400",
        gold: "border-primary/30 bg-primary/10 text-primary",
        initiation: "border-muted-foreground/30 bg-muted text-muted-foreground",
        connoisseur: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        elite: "border-amber-400/40 bg-amber-400/15 text-amber-300",
        "inner-circle": "border-amber-300/40 bg-amber-300/15 text-amber-200",
        black: "border-primary/50 bg-card text-primary shadow-lg",
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
