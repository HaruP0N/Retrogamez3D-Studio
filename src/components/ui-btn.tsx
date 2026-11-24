import { cva } from "class-variance-authority";

export const btn = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 font-mono text-sm uppercase tracking-wider transition-all",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110 glow",
        outline: "border border-border text-foreground hover:border-primary hover:text-primary",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);
