import { Link, createFileRoute } from "@tanstack/react-router";

import { RiskBadge } from "@/components/site/badges";
import { Disclaimer } from "@/components/site/disclaimer";
import { PageHero } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { compactUsd, pct } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_site/strategies")({
  head: () => ({
    meta: [
      { title: "Our Strategies — Meridian Digital Asset Management" },
      {
        name: "description",
        content:
          "DeFi lending, institutional staking, managed liquidity provision and stablecoin yield — each with its own risk rating, liquidity terms and illustrative target range.",
      },
      { property: "og:title", content: "Four digital-asset strategy sleeves" },
      { property: "og:description", content: "Risk ratings, liquidity terms and illustrative targets for each sleeve." },
    ],
  }),
  component: Strategies,
});

function Strategies() {
  const { strategies } = useStore();

  return (
    <>
      <PageHero
        eyebrow="Our strategies"
        title="Four sleeves, distinct risk, one mandate"
        description="Each sleeve is managed to its own exposure limits and liquidity policy. Targets are set by the investment committee and are illustrative, never guaranteed."
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-16">
        <Disclaimer variant="strong" />
        {strategies.map((s) => (
          <Card key={s.id} className="surface">
            <CardContent className="grid gap-8 p-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.category}</p>
                  <RiskBadge level={s.risk} />
                  {!s.active && <span className="text-xs text-muted-foreground">Closed to new capital</span>}
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{s.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Capacity utilisation</span>
                    <span className="font-mono">
                      {compactUsd(s.allocated)} / {compactUsd(s.capacity)}
                    </span>
                  </div>
                  <Progress className="mt-2" value={(s.allocated / s.capacity) * 100} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 self-start">
                <Fact label="Target / month" value={pct(s.targetMonthly, 1)} tone />
                <Fact label="Risk rating" value={s.risk} />
                <Fact label="Minimum" value={compactUsd(s.minInvestment)} />
                <Fact label="Lock-up" value={s.lockupMonths ? `${s.lockupMonths} months` : "None"} />
                <Fact label="Liquidity" value={s.liquidity} />
                <Fact label="Fees" value={`${s.managementFee}% mgmt · ${s.performanceFee}% perf`} />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/register">Create account to allocate</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/risk-management">Read risk framework</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm ${tone ? "font-mono text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
