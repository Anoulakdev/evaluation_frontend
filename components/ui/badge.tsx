import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-sans",
  {
    variants: {
      variant: {
        default:
          "border-sky-200 bg-sky-100 text-sky-800",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-800",
        success:
          "border-emerald-200 bg-emerald-100 text-emerald-800",
        warning:
          "border-amber-200 bg-amber-100 text-amber-800",
        destructive:
          "border-rose-200 bg-rose-100 text-rose-800",
        outline:
          "border-slate-200 text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
