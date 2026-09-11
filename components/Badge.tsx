import type { HTMLAttributes } from "react";

export default function Badge({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border px-2 py-0.5 font-mono text-xs text-foreground/70 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
