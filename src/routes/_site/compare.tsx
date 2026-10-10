import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, Layers, ShieldCheck, Waves } from "lucide-react";

import { ComparisonTable } from "@/components/site/comparison";
import { PageHero } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_site/compare")({
  head: () => ({
    meta: [
      { title: "How We Compare — Meridian Digital Asset Management" },
      {
        name: "description",
        content:
          "Structured digital-asset strategies compared with savings, fixed income, equities/ETFs and unmanaged crypto on yield mechanics, transparency, risk controls and liquidity.",
      },
      { property: "og:title", content: "Structured digital-asset strategies vs other investments" },
      { property: "og:description", content: "An honest side-by-side comparison, with the risks stated." },
    ],
  }),
  component: Compare,
});

const pillars = [
  { icon: Layers, title: "Structured yield", body: "Income from lending, staking and fees — not from guessing prices." },
  { icon: Eye, title: "Transparency", body: "Allocation, AUM and monthly figures published and verifiable." },
  { icon: ShieldCheck, title: "Risk controls", body: "Hard exposure caps and automatic de-risking triggers per sleeve." },
  { icon: Waves, title: "Defined liquidity", body: "Clear redemption terms stated up front for every strategy." },
];

function Compare() {
  return (
    <>
      <PageHero
        eyebrow="How we compare"
        title="Why a structured approach — and where it falls short"
        description="We believe structured digital-asset strategies offer a distinctive combination of yield mechanics, transparency and discipline. Here is an honest comparison, including the areas where other investments are stronger."
      />
      <div className="mx-auto max-w-7xl space-y-14 px-6 py-16">
        <div className="grid gap-5 md:grid-cols-4">
          {pillars.map((p) => (
            <Card key={p.title} className="surface">
              <CardContent className="p-6">
                <p.icon className="size-5 text-primary" aria-hidden />
                <h2 className="mt-4 text-base font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <ComparisonTable />
        <div className="flex flex-wrap gap-3">
          <Button asChild><Link to="/strategies">Explore strategies</Link></Button>
          <Button asChild variant="outline"><Link to="/risk-disclosure">Read risk disclosure</Link></Button>
        </div>
      </div>
    </>
  );
}
