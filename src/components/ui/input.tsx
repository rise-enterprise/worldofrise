import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md font-body text-sm",
          "bg-background border border-border text-foreground",
          "placeholder:text-muted-foreground/50",
          "px-4 py-2",
          "focus:outline-none focus:border-primary/40",
          "focus:ring-1 focus:ring-primary/10",
          "transition-colors duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
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