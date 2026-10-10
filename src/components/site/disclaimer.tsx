import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

export function Disclaimer({
  children,
  className,
  variant = "default",
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "inline" | "strong";
}) {
  const text =
    children ??
    "All figures are targets or illustrative projections only. They are not guaranteed, not a forecast, and capital is at risk.";

  if (variant === "inline") {
    return (
      <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
        <span className="font-semibold uppercase tracking-widest text-warning">Illustrative only — </span>
        {text}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm leading-relaxed",
        variant === "strong"
          ? "border-warning/40 bg-warning/10 text-foreground"
          : "border-border/70 bg-muted/30 text-muted-foreground",
        className,
      )}
      role="note"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
      <div>{text}</div>
    </div>
  );
}

export function ProjectionLabel({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-warning",
        className,
      )}
    >
      Illustrative projection — not a guaranteed return
    </p>
  );
}
