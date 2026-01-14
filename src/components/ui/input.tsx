import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-11 w-full rounded-lg font-body text-sm",
          // Colors — Obsidian surface with crystal border
          "bg-muted/50 border border-border/60 text-foreground",
          "placeholder:text-muted-foreground/60",
          // Padding
          "px-4 py-2",
          // Focus — Gold crystal ring
          "focus:outline-none focus:border-primary/50",
          "focus:shadow-[0_0_0_3px_hsl(42_50%_54%_/_0.1),inset_0_0_20px_hsl(42_50%_54%_/_0.02)]",
          // Transitions
          "transition-all duration-220 ease-luxury",
          // File inputs
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
