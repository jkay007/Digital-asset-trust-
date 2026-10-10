import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Disclaimer, ProjectionLabel } from "@/components/site/disclaimer";
import { PerformanceCalculator } from "@/components/site/performance-calculator";
import { PageHero, SectionHeading } from "@/components/site/section";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pct } from "@/lib/format";

export const Route = createFileRoute("/_site/performance")({
  head: () => ({
    meta: [
      { title: "Performance & Calculator — Meridian Digital Asset Management" },
      {
        name: "description",
        content:
          "Historical illustrative strategy figures and an interactive projection calculator. All figures are targets or illustrative projections, never guaranteed.",
      },
      { property: "og:title", content: "Performance and illustrative projections" },
      { property: "og:description", content: "Model capital invested against an illustrative portfolio value." },
    ],
  }),
  component: Performance,
});

const monthly = [
  { m: "Jan", r: 1.4 }, { m: "Feb", r: 1.1 }, { m: "Mar", r: -0.6 }, { m: "Apr", r: 1.9 },
  { m: "May", r: 2.2 }, { m: "Jun", r: 0.4 }, { m: "Jul", r: 1.6 }, { m: "Aug", r: -1.2 },
  { m: "Sep", r: 1.8 }, { m: "Oct", r: 2.4 }, { m: "Nov", r: 1.3 }, { m: "Dec", r: 0.9 },
];

const table = [
  { name: "Collateralised DeFi Lending", target: 1.6, best: 2.4, worst: -0.4, vol: "Moderate" },
  { name: "Institutional Staking", target: 1.1, best: 1.9, worst: -1.1, vol: "Moderate" },
  { name: "Managed Liquidity Provision", target: 2.4, best: 4.1, worst: -3.2, vol: "High" },
  { name: "Stablecoin Yield", target: 0.7, best: 1.0, worst: 0.1, vol: "Low" },
];

function Performance() {
  return (
    <>
      <PageHero
        eyebrow="Performance"
        title="Illustrative figures, presented honestly"
        description="We show negative months as prominently as positive ones. Every figure below is historical or illustrative and is not a promise of future performance."
      />

      <div className="mx-auto max-w-7xl space-y-14 px-6 py-16">
        <Disclaimer variant="strong">
          Figures on this page are illustrative composite figures for demonstration purposes. They are not
          audited, not guaranteed, and do not represent the return of any individual client account.
        </Disclaimer>

        <section>
          <SectionHeading
            eyebrow="Blended mandate"
            title="Monthly illustrative return profile"
            description="A blended view of the four sleeves over a rolling twelve-month window, including drawdown months."
          />
          <Card className="surface mt-8">
            <CardContent className="p-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`${v}%`, "Illustrative monthly"]}
                    />
                    <Bar dataKey="r" radius={[4, 4, 0, 0]} fill="var(--gold)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ProjectionLabel className="mt-4" />
            </CardContent>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="By strategy" title="Target versus observed range" />
          <Card className="surface mt-8">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">Monthly target</TableHead>
                    <TableHead className="text-right">Best month</TableHead>
                    <TableHead className="text-right">Worst month</TableHead>
                    <TableHead className="text-right">Volatility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right font-mono text-primary">{pct(r.target, 1)}</TableCell>
                      <TableCell className="text-right font-mono text-success">{pct(r.best, 1)}</TableCell>
                      <TableCell className="text-right font-mono text-destructive">{pct(r.worst, 1)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{r.vol}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Disclaimer className="mt-4" variant="inline" />
        </section>

        <section>
          <SectionHeading
            eyebrow="Calculator"
            title="Model your own illustrative projection"
            description="Set an initial amount, monthly contribution, horizon and target rate. The chart compares capital invested with an illustrative compounded value."
          />
          <div className="mt-8">
            <PerformanceCalculator />
          </div>
        </section>
      </div>
    </>
  );
}
