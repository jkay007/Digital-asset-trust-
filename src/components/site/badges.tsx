import { cn } from "@/lib/utils";
import type { InvestmentStatus, KycStatus, RiskLevel, TxStatus } from "@/lib/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide";

const riskTone: Record<RiskLevel, string> = {
  Low: "border-success/30 bg-success/10 text-success",
  Medium: "border-cyan/30 bg-cyan/10 text-cyan",
  High: "border-warning/30 bg-warning/10 text-warning",
  "Very High": "border-destructive/40 bg-destructive/10 text-destructive",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return <span className={cn(base, riskTone[level], className)}>{level} risk</span>;
}

const statusTone: Record<string, string> = {
  Active: "border-success/30 bg-success/10 text-success",
  Completed: "border-success/30 bg-success/10 text-success",
  Verified: "border-success/30 bg-success/10 text-success",
  Resolved: "border-success/30 bg-success/10 text-success",
  Pending: "border-warning/30 bg-warning/10 text-warning",
  Processing: "border-cyan/30 bg-cyan/10 text-cyan",
  "Under review": "border-cyan/30 bg-cyan/10 text-cyan",
  "Awaiting client": "border-cyan/30 bg-cyan/10 text-cyan",
  Open: "border-warning/30 bg-warning/10 text-warning",
  "Not started": "border-border bg-muted/40 text-muted-foreground",
  Withdrawn: "border-border bg-muted/40 text-muted-foreground",
  Cancelled: "border-border bg-muted/40 text-muted-foreground",
  Suspended: "border-destructive/40 bg-destructive/10 text-destructive",
  Rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  Restricted: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function StatusBadge({
  status,
  className,
}: {
  status: InvestmentStatus | TxStatus | KycStatus | string;
  className?: string;
}) {
  return (
    <span className={cn(base, statusTone[status] ?? "border-border bg-muted/40 text-muted-foreground", className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}
