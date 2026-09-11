import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export default function Card({
  glass = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border ${
        glass ? "bg-background/60 backdrop-blur-md" : "bg-foreground/[0.03]"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
