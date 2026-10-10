import { Link, createFileRoute } from "@tanstack/react-router";
import { BarChart3, FileCheck2, Layers, LineChart, Wallet } from "lucide-react";

import { Disclaimer } from "@/components/site/disclaimer";
import { PageHero, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_site/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Meridian Digital Asset Management" },
      {
        name: "description",
        content:
          "From account opening and verification to strategy selection, funding, deployment and ongoing reporting — the five-step Meridian investment process.",
      },
      { property: "og:title", content: "How the Meridian platform works" },
      { property: "og:description", content: "Five steps: account, strategy, funding, deployment, reporting." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    icon: FileCheck2,
    title: "Create your account",
    body: "Register with your email, then complete identity verification. Individual clients submit government ID and proof of address; corporate clients submit registry extracts and beneficial-ownership details.",
    detail: ["Typical review window: 1–3 business days", "Sanctions, PEP and adverse-media screening applied", "No capital can be deployed before verification completes"],
  },
  {
    icon: Layers,
    title: "Select your strategy mix",
    body: "Review each sleeve's risk rating, liquidity terms, fees and illustrative target range. You can allocate to one sleeve or blend across all four.",
    detail: ["Minimums from USD 1,000", "Concentration limits applied per sleeve", "Documentation available before you commit"],
  },
  {
    icon: Wallet,
    title: "Fund your account",
    body: "Transfer by bank rail (SEPA, SWIFT, Faster Payments) or supported stablecoin. Every deposit is issued a reference number and an itemised fee breakdown before confirmation.",
    detail: ["Deposits credited after settlement confirmation", "Source-of-funds checks may apply", "All fees disclosed at the review step"],
  },
  {
    icon: BarChart3,
    title: "Capital is deployed",
    body: "The investment desk deploys capital under the mandate's exposure limits. Positions are opened across vetted venues with continuous monitoring of counterparty and protocol risk.",
    detail: ["Venue scoring reviewed monthly", "Automatic de-risking triggers on drawdown breaches", "Segregated custody arrangements"],
  },
  {
    icon: LineChart,
    title: "Track and withdraw",
    body: "Monitor valuations, allocation and transactions from your dashboard. Withdrawal requests follow the liquidity terms of each sleeve and pass a compliance review before release.",
    detail: ["Monthly statements and annual summaries", "Compliance-gated withdrawal workflow", "Full transaction history with filters"],
  },
];

function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="A governed path from onboarding to reporting"
        description="Meridian applies the same operational discipline you would expect from a traditional asset manager, adapted for on-chain markets."
      >
        <Button asChild size="lg">
          <Link to="/register">Create account</Link>
        </Button>
      </PageHero>

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-16">
        {steps.map((s, i) => (
          <Card key={s.title} className="surface">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
              <div className="flex size-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <s.icon className="size-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="font-mono text-xs text-primary">STEP 0{i + 1}</p>
                <h2 className="mt-1.5 text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                  {s.detail.map((d) => (
                    <li key={d} className="rounded-md border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}

        <SectionHeading
          eyebrow="Before you invest"
          title="What we ask you to read"
          description="Understanding the mandate matters more than the headline numbers."
        />
        <Disclaimer variant="strong">
          Digital-asset strategies carry risk of partial or total capital loss. Target figures shown across
          the platform are illustrative and subject to change. Nothing on this platform constitutes investment
          advice or a guarantee of performance.
        </Disclaimer>
      </div>
    </>
  );
}
