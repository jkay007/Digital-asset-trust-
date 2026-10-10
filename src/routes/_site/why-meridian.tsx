import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Banknote, CalendarClock, Coins, Handshake, Layers, Network, Repeat, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Disclaimer, ProjectionLabel } from "@/components/site/disclaimer";
import { PageHero, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usd } from "@/lib/format";

export const Route = createFileRoute("/_site/why-meridian")({
  head: () => ({
    meta: [
      { title: "Why Meridian vs Banks & Alternatives — Meridian Digital Asset Management" },
      { name: "description", content: "How Meridian compares with bank savings and alternative investments, how we use DeFi and digital-asset trading, and the network of investors behind us." },
      { property: "og:title", content: "Why investors choose Meridian over a bank savings account" },
      { property: "og:description", content: "DeFi explained, the protocols we connect to, and our 8-year history. Capital at risk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhyMeridian,
});

const yearly = [
  { name: "Bank savings", v: 12000 * 1.04 },
  { name: "Govt bonds", v: 12000 * 1.045 },
  { name: "Equity index", v: 12000 * 1.08 },
  { name: "Meridian target", v: 12000 * Math.pow(1.03, 12) },
];

const vsBank = [
  { t: "Where your money works", bank: "Lent out by the bank; you get a small share of the interest.", us: "Deployed directly into lending, staking and liquidity markets — you receive the yield, less stated fees." },
  { t: "Illustrative yield", bank: "Typically 1–5% a year.", us: "Targeting around 3% a month — a target, not a promise." },
  { t: "Visibility", bank: "Balance sheet you cannot see.", us: "Positions verifiable on-chain, monthly reporting." },
  { t: "Protection", bank: "Often covered by deposit insurance.", us: "No deposit insurance — capital is at risk." },
];

const defi = [
  { icon: Banknote, t: "Lending", b: "We supply stablecoins and assets to overcollateralised lending markets such as Aave and Compound. Borrowers pay interest; that interest flows to the portfolio." },
  { icon: Coins, t: "Staking", b: "We stake assets like ETH through validators and liquid-staking protocols (e.g. Lido, Rocket Pool) and earn network rewards for securing the blockchain." },
  { icon: Repeat, t: "Liquidity provision", b: "We provide paired liquidity on exchanges like Uniswap and Curve, earning a share of every trading fee." },
  { icon: Layers, t: "Active trading", b: "A risk-capped sleeve trades digital assets on regulated venues using systematic, rules-based signals with hard stop-losses." },
];

const flow = ["Your deposit", "Meridian portfolio", "Lending · Staking · Liquidity · Trading", "Interest, rewards & fees", "Your account"];

const network = [
  { icon: CalendarClock, v: "8 years", l: "Operating in digital-asset markets" },
  { icon: Users, v: "4,182", l: "Active investors" },
  { icon: Network, v: "20+", l: "Integrated protocols & venues" },
  { icon: Handshake, v: "$117.6M", l: "Assets under management" },
];

const tip = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 };

function WhyMeridian() {
  return (
    <>
      <PageHero
        eyebrow="Why Meridian"
        title="Why investors look beyond the bank"
        description="A savings account keeps money safe but often loses ground to inflation. Meridian aims for meaningfully higher returns by putting capital to work across DeFi and digital-asset markets — with the risks clearly stated."
      />
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {network.map((n) => (
            <Card key={n.l} className="surface"><CardContent className="p-5">
              <n.icon className="size-5 text-primary" aria-hidden />
              <p className="mt-3 font-mono text-2xl text-primary">{n.v}</p>
              <p className="text-sm text-muted-foreground">{n.l}</p>
            </CardContent></Card>
          ))}
        </div>

        <section>
          <SectionHeading eyebrow="Banks vs Meridian" title="Same money, very different engine" />
          <div className="mt-6 overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead><tr className="border-b border-border/70 bg-muted/20">
                <th className="p-4 text-xs uppercase tracking-widest text-muted-foreground">Criteria</th>
                <th className="p-4">Bank savings</th>
                <th className="bg-primary/10 p-4 text-primary">Meridian</th>
              </tr></thead>
              <tbody>
                {vsBank.map((r) => (
                  <tr key={r.t} className="border-b border-border/50 last:border-0">
                    <th scope="row" className="p-4 font-medium">{r.t}</th>
                    <td className="p-4 text-muted-foreground">{r.bank}</td>
                    <td className="bg-primary/5 p-4">{r.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Illustration" title="$12,000 after one year" description="Typical annual rates for each option versus our 3% monthly target compounded. Illustrative only." />
          <Card className="surface mt-6"><CardContent className="h-80 p-6"><ResponsiveContainer>
            <BarChart data={yearly}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={tip} formatter={(v: number) => usd(v)} />
              <Bar dataKey="v" name="Value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></CardContent></Card>
          <ProjectionLabel className="mt-4" />
        </section>

        <section>
          <SectionHeading eyebrow="How DeFi works" title="Where the return actually comes from" description="Decentralised finance (DeFi) runs financial services — lending, exchanges, staking — as open software on public blockchains. Instead of a bank in the middle, rules are enforced by code and every transaction is visible." />
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            {flow.map((f, i) => (
              <span key={f} className="flex items-center gap-2">
                <span className="rounded-md border border-border/70 bg-muted/30 px-3 py-2">{f}</span>
                {i < flow.length - 1 && <ArrowRight className="size-4 text-primary" aria-hidden />}
              </span>
            ))}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {defi.map((d) => (
              <Card key={d.t} className="surface"><CardContent className="p-6">
                <d.icon className="size-5 text-primary" aria-hidden />
                <h3 className="mt-4 font-semibold">{d.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.b}</p>
              </CardContent></Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Trust" title="An all-round approach, built over eight years" description="Diversifying across several independent income sources means no single protocol or market decides your outcome. Investment committee oversight, exposure caps and qualified custody sit behind every sleeve." />
        </section>

        <Disclaimer variant="strong">
          Digital assets are not risk-free. Returns are not guaranteed, past performance does not predict future
          results, capital is not protected by deposit insurance and you may lose some or all of your investment.
          Protocol names are shown to explain how DeFi works and do not imply partnership or endorsement.
        </Disclaimer>

        <div className="flex flex-wrap gap-3">
          <Button asChild><Link to="/register">Create account</Link></Button>
          <Button asChild variant="outline"><Link to="/track-record">See track record</Link></Button>
          <Button asChild variant="ghost"><Link to="/compare">Full comparison</Link></Button>
        </div>
      </div>
    </>
  );
}
