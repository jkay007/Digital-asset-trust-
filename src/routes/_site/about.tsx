import { createFileRoute } from "@tanstack/react-router";

import { Disclaimer } from "@/components/site/disclaimer";
import { PageHero, SectionHeading } from "@/components/site/section";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About — Meridian Digital Asset Management" },
      {
        name: "description",
        content:
          "Who we are, how the investment committee is structured, and the operating principles behind the Meridian mandate.",
      },
      { property: "og:title", content: "About Meridian Digital Asset Management" },
      { property: "og:description", content: "Governance, people and operating principles." },
    ],
  }),
  component: About,
});

const people = [
  { name: "H. Vance", role: "Chief Investment Officer", bio: "Two decades in credit and systematic strategies; chairs the investment committee." },
  { name: "J. Hall", role: "Head of Compliance", bio: "Former regulatory supervisor; owns onboarding, monitoring and reporting standards." },
  { name: "S. Mora", role: "Head of Finance Operations", bio: "Runs treasury, settlement and the reconciliation of all client flows." },
  { name: "R. Adeyemi", role: "Head of Protocol Research", bio: "Leads venue diligence, smart-contract review and counterparty scoring." },
];

const principles = [
  { title: "Disclose before you sell", body: "Risk language sits next to every return figure, not buried in a footer." },
  { title: "Limits beat forecasts", body: "We size positions by what we can afford to lose, not by what we hope to earn." },
  { title: "Reconcile daily", body: "Operational discipline is the difference between a fund and an experiment." },
  { title: "Document every decision", body: "Committee minutes and admin actions are logged and reviewable." },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built by people who have run regulated books"
        description="Meridian was formed to bring conventional investment governance to on-chain yield — the same committees, limits and reporting cadence, applied to a newer market."
      />
      <div className="mx-auto max-w-7xl space-y-14 px-6 py-16">
        <section>
          <SectionHeading eyebrow="Governance" title="Investment committee and functions" />
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {people.map((p) => (
              <Card key={p.name} className="surface">
                <CardContent className="p-6">
                  <div className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-sm text-primary">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{p.name}</h3>
                  <p className="text-xs uppercase tracking-widest text-primary">{p.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Principles" title="How we operate" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {principles.map((p) => (
              <Card key={p.title} className="surface">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Disclaimer />
      </div>
    </>
  );
}
