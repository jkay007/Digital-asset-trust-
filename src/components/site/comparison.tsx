import { Check, Minus, X } from "lucide-react";

import { Disclaimer } from "@/components/site/disclaimer";
import { cn } from "@/lib/utils";

type Mark = "yes" | "partial" | "no";

const columns = [
  { key: "structured", label: "Structured digital-asset strategies", highlight: true },
  { key: "savings", label: "Savings / fixed income" },
  { key: "equities", label: "Equities / ETFs" },
  { key: "crypto", label: "Direct unmanaged crypto" },
] as const;

type ColKey = (typeof columns)[number]["key"];

const rows: { label: string; detail: string; values: Record<ColKey, { mark: Mark; text: string }> }[] = [
  {
    label: "Yield mechanics",
    detail: "Where the return is intended to come from.",
    values: {
      structured: { mark: "yes", text: "Lending interest, staking rewards, liquidity fees — rules-based and on-chain" },
      savings: { mark: "yes", text: "Contractual interest set by bank or issuer" },
      equities: { mark: "partial", text: "Dividends plus price movement" },
      crypto: { mark: "no", text: "Mostly price speculation, no structured income" },
    },
  },
  {
    label: "Illustrative return profile",
    detail: "Indicative ranges only — not predictions or promises.",
    values: {
      structured: { mark: "partial", text: "Target ranges set per sleeve; can be negative" },
      savings: { mark: "partial", text: "Lower, more predictable; may trail inflation" },
      equities: { mark: "partial", text: "Long-run growth with drawdowns" },
      crypto: { mark: "partial", text: "Extreme swings in both directions" },
    },
  },
  {
    label: "Transparency",
    detail: "How easily positions and flows can be verified.",
    values: {
      structured: { mark: "yes", text: "On-chain positions, monthly reporting, published allocation" },
      savings: { mark: "partial", text: "Periodic statements; bank balance sheet opaque" },
      equities: { mark: "yes", text: "Regulated disclosures and daily NAV" },
      crypto: { mark: "partial", text: "Ledger visible, but no reporting or oversight" },
    },
  },
  {
    label: "Risk controls",
    detail: "Limits applied before capital is deployed.",
    values: {
      structured: { mark: "yes", text: "Exposure caps, protocol due diligence, depeg & drawdown triggers" },
      savings: { mark: "yes", text: "Deposit insurance (where applicable)" },
      equities: { mark: "partial", text: "Diversification; fund mandate limits" },
      crypto: { mark: "no", text: "Investor bears all key, custody and protocol risk alone" },
    },
  },
  {
    label: "Liquidity",
    detail: "How quickly capital can typically be returned.",
    values: {
      structured: { mark: "partial", text: "Sleeve-dependent: none to 6-month lock-up, compliance review" },
      savings: { mark: "partial", text: "Instant to fixed-term" },
      equities: { mark: "yes", text: "Daily in market hours" },
      crypto: { mark: "yes", text: "24/7, but slippage in stress" },
    },
  },
  {
    label: "Principal protection",
    detail: "Whether capital is protected.",
    values: {
      structured: { mark: "no", text: "Not protected — capital at risk" },
      savings: { mark: "yes", text: "Often insured up to statutory limits" },
      equities: { mark: "no", text: "Not protected" },
      crypto: { mark: "no", text: "Not protected; total loss possible" },
    },
  },
  {
    label: "Professional oversight",
    detail: "Who makes allocation decisions.",
    values: {
      structured: { mark: "yes", text: "Investment committee, independent risk function" },
      savings: { mark: "yes", text: "Bank treasury" },
      equities: { mark: "partial", text: "Passive index or fund manager" },
      crypto: { mark: "no", text: "Self-directed" },
    },
  },
];

const icon: Record<Mark, React.ReactNode> = {
  yes: <Check className="size-4 text-success" aria-label="Strong" />,
  partial: <Minus className="size-4 text-warning" aria-label="Partial" />,
  no: <X className="size-4 text-destructive" aria-label="Weak" />,
};

export function ComparisonTable() {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-border/70">
        <table className="w-full min-w-[860px] text-left text-sm">
          <caption className="sr-only">Comparison of structured digital-asset strategies with other investment types</caption>
          <thead>
            <tr className="border-b border-border/70 bg-muted/20">
              <th scope="col" className="p-4 text-xs uppercase tracking-widest text-muted-foreground">Criteria</th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn("p-4 text-sm font-semibold", "highlight" in c && "bg-primary/10 text-primary")}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-border/50 last:border-0">
                <th scope="row" className="p-4 align-top">
                  <p className="font-medium">{r.label}</p>
                  <p className="mt-1 text-xs font-normal text-muted-foreground">{r.detail}</p>
                </th>
                {columns.map((c) => (
                  <td key={c.key} className={cn("p-4 align-top", "highlight" in c && "bg-primary/5")}>
                    <div className="flex gap-2">
                      <span className="mt-0.5 shrink-0">{icon[r.values[c.key].mark]}</span>
                      <span className="text-muted-foreground">{r.values[c.key].text}</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Disclaimer variant="strong">
        This comparison is general and educational, not personal advice. Digital assets are not risk-free,
        returns are not guaranteed, capital is not protected and you may lose all of your investment. Each
        asset class suits different objectives; structured strategies are not appropriate for every investor.
      </Disclaimer>
    </div>
  );
}
