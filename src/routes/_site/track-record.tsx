import { Link, createFileRoute } from "@tanstack/react-router";
import { Award, Building2, FileCheck2, Lock, ShieldCheck, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Disclaimer, ProjectionLabel } from "@/components/site/disclaimer";
import { PageHero, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usd } from "@/lib/format";

export const Route = createFileRoute("/_site/track-record")({
  head: () => ({
    meta: [
      { title: "Track Record & Trust — Meridian Digital Asset Management" },
      { name: "description", content: "Illustrative monthly history against a ~3% target, worked investor examples, and the safeguards behind the platform." },
      { property: "og:title", content: "Track record, examples and trust — Meridian" },
      { property: "og:description", content: "Illustrative history vs a 3% monthly target. Not guaranteed; capital at risk." },
    ],
  }),
  component: TrackRecord,
});

// Illustrative monthly composite returns (%). Not audited, not guaranteed.
const monthly = [3.1, 2.8, 3.4, 2.2, 3.0, -1.4, 2.6, 3.3, 2.9, 3.5, 1.8, 3.2, 2.7, 3.1, 0.6, 3.0, 2.9, 3.4, 2.5, 3.2, -0.8, 2.8, 3.1, 3.0];
const months = monthly.map((r, i) => ({
  m: new Date(2024, 9 + i, 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
  r,
  target: 3,
}));
let acc = 10000;
const growth = months.map((x) => { acc *= 1 + x.r / 100; return { m: x.m, value: Math.round(acc) }; });
const avg = monthly.reduce((a, b) => a + b, 0) / monthly.length;
const hits = monthly.filter((r) => r >= 3).length;
const neg = monthly.filter((r) => r < 0).length;

const examples = [1000, 10000, 50000].map((start) => {
  const at = (n: number) => start * Math.pow(1.03, n);
  return { start, m6: at(6), m12: at(12), m24: at(24) };
});

const trust = [
  { icon: ShieldCheck, t: "Qualified custody", b: "Assets held with regulated, insured custodians under multi-signature controls." },
  { icon: FileCheck2, t: "Independent reporting", b: "Monthly NAV and allocation published; annual review by external accountants." },
  { icon: Lock, t: "Segregated accounts", b: "Client assets kept separate from company operating funds." },
  { icon: Users, t: "Investment committee", b: "Every sleeve change approved by committee with an independent risk officer." },
  { icon: Building2, t: "KYC / AML compliance", b: "Full identity verification and transaction monitoring on every account." },
  { icon: Award, t: "Transparent fees", b: "Management and performance fees disclosed per strategy — no hidden charges." },
];

const tip = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 };

function TrackRecord() {
  return (
    <>
      <PageHero
        eyebrow="Track record & trust"
        title="Targeting around 3% a month — with the misses shown too"
        description="Our strategies target approximately 3% per month. Below is an illustrative 24-month composite history, worked examples, and the safeguards we operate. Target figures are not guaranteed and some months are negative."
      />
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16">
        <Disclaimer variant="strong">
          Figures on this page are illustrative composite data for demonstration and are not audited results.
          A 3% monthly figure is a target, not a promise. Past or illustrative performance does not predict
          future results; you can lose some or all of your capital.
        </Disclaimer>

        <div className="grid gap-4 sm:grid-cols-4">
          {[["Avg. monthly (illustrative)", `${avg.toFixed(2)}%`], ["Months at/above 3% target", `${hits} of ${monthly.length}`], ["Negative months", String(neg)], ["Worst month", `${Math.min(...monthly)}%`]].map(([l, v]) => (
            <Card key={l} className="surface"><CardContent className="p-5"><p className="text-[11px] uppercase tracking-widest text-muted-foreground">{l}</p><p className="mt-2 font-mono text-2xl text-primary">{v}</p></CardContent></Card>
          ))}
        </div>

        <section>
          <SectionHeading eyebrow="History" title="Monthly returns vs 3% target" description="Gold bars met or exceeded target; red bars were losses." />
          <Card className="surface mt-6"><CardContent className="h-80 p-6"><ResponsiveContainer>
            <BarChart data={months}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="m" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" unit="%" /><Tooltip contentStyle={tip} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="r" name="Monthly return">{months.map((x) => <Cell key={x.m} fill={x.r < 0 ? "var(--destructive)" : x.r >= 3 ? "var(--primary)" : "var(--cyan)"} />)}</Bar>
            </BarChart>
          </ResponsiveContainer></CardContent></Card>
        </section>

        <section>
          <SectionHeading eyebrow="Growth" title="$10,000 over 24 months (illustrative composite)" />
          <Card className="surface mt-6"><CardContent className="h-80 p-6"><ResponsiveContainer>
            <LineChart data={growth}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="m" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={tip} formatter={(v: number) => usd(v)} />
              <Line dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer></CardContent></Card>
          <p className="mt-3 text-sm text-muted-foreground">Ending value {usd(growth[growth.length - 1]!.value)} before tax. Fees and actual timing will differ.</p>
        </section>

        <section>
          <SectionHeading eyebrow="Worked examples" title="What a 3% monthly target would mean — if achieved" description="Compounded at exactly 3% per month with no withdrawals. Real results vary and may be lower or negative." />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {examples.map((e) => (
              <Card key={e.start} className="surface"><CardContent className="space-y-2 p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Starting with</p>
                <p className="font-mono text-2xl">{usd(e.start)}</p>
                {[["6 months", e.m6], ["12 months", e.m12], ["24 months", e.m24]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between border-t border-border/50 pt-2 text-sm"><span className="text-muted-foreground">{l}</span><span className="font-mono text-primary">{usd(v as number)}</span></div>
                ))}
              </CardContent></Card>
            ))}
          </div>
          <ProjectionLabel className="mt-4" />
        </section>

        <section>
          <SectionHeading eyebrow="Trust" title="Why investors trust the platform" />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {trust.map((x) => (
              <Card key={x.t} className="surface"><CardContent className="p-6"><x.icon className="size-5 text-primary" aria-hidden /><h3 className="mt-4 font-semibold">{x.t}</h3><p className="mt-2 text-sm text-muted-foreground">{x.b}</p></CardContent></Card>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild><Link to="/register">Create account</Link></Button>
          <Button asChild variant="outline"><Link to="/compare">Compare with other investments</Link></Button>
          <Button asChild variant="ghost"><Link to="/risk-disclosure">Risk disclosure</Link></Button>
        </div>
      </div>
    </>
  );
}
