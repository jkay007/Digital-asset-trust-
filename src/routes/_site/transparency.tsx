import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { AllocationDonut, AllocationLegend } from "@/components/site/allocation-donut";
import { Disclaimer } from "@/components/site/disclaimer";
import { PageHero, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { compactUsd, dateTime, pct } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_site/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency Dashboard — Meridian Digital Asset Management" },
      {
        name: "description",
        content:
          "Live platform figures: assets under management, investor count, strategy breakdown and monthly distributions, with last-updated timestamps.",
      },
      { property: "og:title", content: "Transparency dashboard" },
      { property: "og:description", content: "AUM, investors, strategy breakdown and reporting downloads." },
    ],
  }),
  component: Transparency,
});

function Transparency() {
  const { stats, strategies, assets } = useStore();

  return (
    <>
      <PageHero
        eyebrow="Transparency"
        title="The numbers, updated and timestamped"
        description="Platform figures are maintained by the finance desk through the admin console. Every change is written to an immutable audit log."
      />

      <div className="mx-auto max-w-7xl space-y-12 px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Assets under management", value: compactUsd(stats.aum) },
            { label: "Verified investors", value: stats.investors.toLocaleString() },
            { label: "Monthly distributions", value: compactUsd(stats.monthlyPayoutsUsd) },
            { label: "Blended monthly target", value: pct(stats.avgMonthlyTarget, 2) },
          ].map((s) => (
            <Card key={s.label} className="surface">
              <CardContent className="p-6">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-mono text-2xl">{s.value}</p>
                <p className="mt-3 text-[11px] text-muted-foreground">Last updated {dateTime(stats.lastUpdated)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section>
          <SectionHeading eyebrow="Strategy breakdown" title="Capital by sleeve" />
          <Card className="surface mt-8">
            <CardContent className="space-y-5 p-6">
              {strategies.map((s) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="font-mono text-muted-foreground">
                      {compactUsd(s.allocated)} · target {pct(s.targetMonthly, 1)}/m
                    </span>
                  </div>
                  <Progress className="mt-2" value={(s.allocated / stats.aum) * 100} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="surface">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_1fr]">
              <AllocationDonut assets={assets} height={230} />
              <AllocationLegend assets={assets} />
            </CardContent>
          </Card>
          <Card className="surface">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-base font-semibold">Reports and disclosures</h3>
              <p className="text-sm text-muted-foreground">
                Quarterly exposure reports, annual summaries and policy documents are published here.
              </p>
              <div className="space-y-2">
                {["Q2 transparency report", "Annual exposure summary", "Custody & counterparty policy", "Fee schedule"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toast.info("Demo placeholder", { description: `${d} would download here.` })}
                    className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/40 p-3 text-left text-sm hover:border-primary/40"
                  >
                    {d}
                    <Download className="size-4 text-muted-foreground" aria-hidden />
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => toast.info("Demo placeholder")}>
                Request full reporting pack
              </Button>
            </CardContent>
          </Card>
        </section>

        <Disclaimer variant="strong">
          Published figures are unaudited operational figures from the platform's own records and include
          illustrative target rates. They are not certified financial statements.
        </Disclaimer>
      </div>
    </>
  );
}
