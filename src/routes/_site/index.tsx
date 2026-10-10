import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  FileCheck2,
  Layers,
  LineChart,
  Lock,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { AllocationDonut, AllocationLegend } from "@/components/site/allocation-donut";
import { RiskBadge } from "@/components/site/badges";
import { Disclaimer } from "@/components/site/disclaimer";
import { PerformanceCalculator } from "@/components/site/performance-calculator";
import { Eyebrow, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { compactUsd, pct, shortDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Meridian DAM — Smarter Access to Digital Asset Strategies" },
      {
        name: "description",
        content:
          "Professionally structured DeFi and digital-asset strategies through a transparent investment platform built around data, diversification and disciplined risk management. Capital at risk.",
      },
      { property: "og:title", content: "Smarter Access to Digital Asset Strategies" },
      {
        property: "og:description",
        content:
          "A transparent digital-asset investment platform. Target returns are illustrative, never guaranteed.",
      },
    ],
  }),
  component: Home,
});

const spark = Array.from({ length: 24 }, (_, i) => ({
  x: i,
  y: 100 + i * 4 + Math.sin(i / 2) * 9,
}));

function Home() {
  const { stats, strategies, assets } = useStore();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-70" aria-hidden />
        <div
          className="absolute -left-40 top-[-14rem] size-[42rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold), transparent 60%)" }}
          aria-hidden
        />
        <div
          className="absolute right-[-12rem] top-32 size-[34rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--cyan), transparent 60%)" }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden />
              Institutional structure · Independent custody · Transparent reporting
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] text-balance-tight sm:text-6xl">
              Smarter Access to <span className="text-primary">Digital Asset</span> Strategies.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Access professionally structured DeFi and digital-asset strategies through a transparent
              investment platform designed around data, diversification and disciplined risk management.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/strategies">
                  Explore strategies <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/register">Create account</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/how-it-works">View how it works</Link>
              </Button>
            </div>
            <Disclaimer className="mt-9 max-w-xl" variant="strong">
              Target returns referenced across this platform — including any monthly figures — are
              illustrative targets only. They are not guaranteed, not a forecast, and your capital is at risk.
            </Disclaimer>
          </div>

          <div className="fade-up space-y-4">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Eyebrow>Platform snapshot</Eyebrow>
                    <p className="mt-2 font-mono text-3xl text-foreground">{compactUsd(stats.aum)}</p>
                    <p className="text-sm text-muted-foreground">Assets under management</p>
                  </div>
                  <div className="h-16 w-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spark}>
                        <defs>
                          <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area dataKey="y" stroke="var(--gold)" strokeWidth={2} fill="url(#heroSpark)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/60 pt-5">
                  <Stat label="Investors" value={stats.investors.toLocaleString()} />
                  <Stat label="Live strategies" value={String(stats.strategiesLive)} />
                  <Stat label="Blended target" value={`${stats.avgMonthlyTarget}%/m`} />
                </div>
                <p className="mt-4 text-[11px] text-muted-foreground">
                  Figures last updated {shortDate(stats.lastUpdated)}. Blended target is illustrative.
                </p>
              </CardContent>
            </Card>

            <Card className="surface">
              <CardContent className="grid gap-6 p-6 sm:grid-cols-[180px_1fr]">
                <AllocationDonut assets={assets} height={180} />
                <div>
                  <Eyebrow>What we invest in</Eyebrow>
                  <div className="mt-3">
                    <AllocationLegend assets={assets} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-4">
          {[
            { icon: Layers, title: "Diversified mandate", body: "Four distinct strategy sleeves spanning lending, staking, liquidity and stablecoin yield." },
            { icon: Lock, title: "Segregated custody", body: "Client assets held with qualified custodians and multi-signature operational controls." },
            { icon: BarChart3, title: "Data-led allocation", body: "Exposure limits, drawdown triggers and venue scoring reviewed on a fixed cadence." },
            { icon: FileCheck2, title: "Reported transparently", body: "Monthly statements, live exposure breakdown and a public transparency dashboard." },
          ].map((p) => (
            <div key={p.title} className="rounded-lg border border-border/60 bg-background/40 p-5">
              <p.icon className="size-5 text-primary" aria-hidden />
              <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Strategies */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="Our strategies"
          title="Four disciplined sleeves, one governed mandate"
          description="Each strategy has its own risk rating, liquidity terms and target range. Targets are reviewed by the investment committee and may be revised at any time."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {strategies.map((s) => (
            <Card key={s.id} className="surface transition-colors hover:border-primary/40">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.category}</p>
                    <h3 className="mt-2 text-lg font-semibold">{s.name}</h3>
                  </div>
                  <RiskBadge level={s.risk} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
                <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border/60 pt-4">
                  <Stat label="Target / month" value={pct(s.targetMonthly, 1)} tone />
                  <Stat label="Minimum" value={compactUsd(s.minInvestment)} />
                  <Stat label="Liquidity" value={s.liquidity.split(",")[0] ?? ""} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Disclaimer className="mt-6" variant="inline" />
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading
            eyebrow="How it works"
            title="Five steps from account to reporting"
            align="center"
          />
          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {[
              { icon: FileCheck2, title: "Create account", body: "Register and complete identity verification." },
              { icon: Layers, title: "Select strategy", body: "Choose sleeves that match your risk tolerance." },
              { icon: Wallet, title: "Fund account", body: "Transfer by bank rail or supported stablecoin." },
              { icon: BarChart3, title: "Capital deployed", body: "Allocation executed under mandate limits." },
              { icon: LineChart, title: "Track performance", body: "Monitor exposure, valuations and statements." },
            ].map((s, i) => (
              <li key={s.title} className="rounded-lg border border-border/60 bg-background/40 p-5">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <s.icon className="mt-3 size-5 text-muted-foreground" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Calculator */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="Performance calculator"
          title="Model an illustrative projection"
          description="Adjust the inputs to see how capital invested compares with an illustrative compounded value. These outputs are modelling tools, not offers or predictions."
        />
        <div className="mt-10">
          <PerformanceCalculator />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="glass glow-gold rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-semibold text-balance-tight sm:text-4xl">
              Open an account and review the mandate
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Registration takes a few minutes. Identity verification is required before capital can be
              deployed, and you can review every strategy document before committing.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/register">Create account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/transparency">See transparency dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-sm ${tone ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
