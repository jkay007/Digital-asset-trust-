import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { RiskBadge } from "@/components/site/badges";
import { Disclaimer } from "@/components/site/disclaimer";
import { PageHero, SectionHeading } from "@/components/site/section";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

export const Route = createFileRoute("/_site/risk-management")({
  head: () => ({
    meta: [
      { title: "Risk Management — Meridian Digital Asset Management" },
      {
        name: "description",
        content:
          "Exposure limits, venue diligence, drawdown triggers and an interactive risk matrix covering low through very high risk categories.",
      },
      { property: "og:title", content: "Risk management framework" },
      { property: "og:description", content: "Interactive risk matrix, diligence protocol and exposure limits." },
    ],
  }),
  component: RiskManagement,
});

const matrix: { level: RiskLevel; exposure: string; examples: string; controls: string[] }[] = [
  {
    level: "Low",
    exposure: "Up to 40% of mandate",
    examples: "Stablecoin yield, tokenised cash equivalents, operating buffer",
    controls: ["Issuer redemption depth tested monthly", "Counterparty caps per venue", "Daily depeg monitoring"],
  },
  {
    level: "Medium",
    exposure: "Up to 45% of mandate",
    examples: "Over-collateralised lending, institutional staking",
    controls: ["Loan-to-value ceilings", "Oracle integrity checks", "Validator diversification and slashing cover"],
  },
  {
    level: "High",
    exposure: "Up to 25% of mandate",
    examples: "Directional BTC and ETH exposure",
    controls: ["Position sizing bands", "Drawdown de-risking triggers", "Rebalancing within mandate bands"],
  },
  {
    level: "Very High",
    exposure: "Up to 12% of mandate",
    examples: "Concentrated liquidity provision",
    controls: ["Hedged pairs only", "Hard capacity cap", "Daily impermanent-loss attribution"],
  },
];

const protocols = [
  { title: "Venue diligence", body: "Audit history, time-in-market, TVL stability, governance concentration and incident record are scored before any capital is committed." },
  { title: "Counterparty limits", body: "No single venue may hold more than a defined share of mandate assets, regardless of yield on offer." },
  { title: "Drawdown triggers", body: "Predefined loss thresholds automatically reduce exposure and escalate to the investment committee." },
  { title: "Custody segregation", body: "Client assets are held separately from operating funds with multi-signature withdrawal authorisation." },
  { title: "Liquidity laddering", body: "Redemption buffers are sized against historic withdrawal patterns plus a stress multiple." },
  { title: "Independent review", body: "Compliance reviews exposure reports monthly and can freeze allocations to any sleeve." },
];

function RiskManagement() {
  const [active, setActive] = useState<RiskLevel>("Medium");
  const selected = matrix.find((m) => m.level === active)!;

  return (
    <>
      <PageHero
        eyebrow="Risk management"
        title="Risk sizing is the product"
        description="Yield is a consequence of risk taken. Our framework defines how much of each risk category the mandate may hold, and what happens when limits are approached."
      />

      <div className="mx-auto max-w-7xl space-y-14 px-6 py-16">
        <section>
          <SectionHeading eyebrow="Risk matrix" title="Select a category to inspect its limits" />
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {matrix.map((m) => (
              <button
                key={m.level}
                type="button"
                onClick={() => setActive(m.level)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  active === m.level ? "border-primary/60 bg-primary/10" : "border-border/60 bg-background/40 hover:border-primary/30",
                )}
                aria-pressed={active === m.level}
              >
                <RiskBadge level={m.level} />
                <p className="mt-3 font-mono text-sm">{m.exposure}</p>
              </button>
            ))}
          </div>
          <Card className="surface mt-5">
            <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_1.2fr]">
              <div>
                <RiskBadge level={selected.level} />
                <p className="mt-4 text-sm text-muted-foreground">Typical exposure</p>
                <p className="font-mono text-lg">{selected.exposure}</p>
                <p className="mt-4 text-sm text-muted-foreground">Representative positions</p>
                <p className="text-sm">{selected.examples}</p>
              </div>
              <ul className="space-y-2">
                {selected.controls.map((c) => (
                  <li key={c} className="rounded-md border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="Protocols" title="Diligence and operational controls" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {protocols.map((p) => (
              <Card key={p.title} className="surface">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Disclaimer variant="strong">
          No risk framework eliminates loss. Controls reduce the probability and size of adverse outcomes but
          cannot prevent them. Capital invested through this platform remains fully at risk.
        </Disclaimer>
      </div>
    </>
  );
}
