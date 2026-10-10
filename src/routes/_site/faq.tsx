import { createFileRoute } from "@tanstack/react-router";

import { Disclaimer } from "@/components/site/disclaimer";
import { PageHero } from "@/components/site/section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/_site/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Meridian Digital Asset Management" },
      {
        name: "description",
        content:
          "Answers on minimums, verification, liquidity, fees, custody, taxation and what happens if a strategy underperforms.",
      },
      { property: "og:title", content: "Frequently asked questions" },
      { property: "og:description", content: "Minimums, verification, liquidity, fees, custody and risk." },
    ],
  }),
  component: Faq,
});

const faqs = [
  { q: "Are returns guaranteed?", a: "No. Every figure shown on this platform is a target, an illustrative projection or a historical figure. Strategies can and do produce negative months, and total loss of capital is possible." },
  { q: "What is the minimum investment?", a: "Minimums start at USD 1,000 for the lending, staking and stablecoin sleeves, and USD 5,000 for managed liquidity provision." },
  { q: "How long does verification take?", a: "Most individual verifications complete within one to three business days. Corporate onboarding typically takes longer because registry and beneficial-ownership documents must be reviewed." },
  { q: "When can I withdraw?", a: "Liquidity terms are set per sleeve, ranging from monthly with no notice for stablecoin yield to quarterly with fourteen days' notice for liquidity provision. All withdrawals pass a compliance review before release." },
  { q: "What fees apply?", a: "Each sleeve discloses a management fee and a performance fee. Network and banking costs are itemised at the deposit and withdrawal review steps before you confirm." },
  { q: "Who holds the assets?", a: "Client assets are held with qualified custodians under segregated arrangements, with multi-signature authorisation on operational wallets." },
  { q: "What happens if a strategy underperforms?", a: "Drawdown triggers reduce exposure automatically and escalate to the investment committee. Clients are notified through announcements and monthly statements." },
  { q: "Do you provide tax reporting?", a: "Annual summaries are available under Statements. They are informational and do not replace advice from a qualified tax professional in your jurisdiction." },
  { q: "Is this platform regulated?", a: "This is a demonstration platform and is not offering regulated services. In production, availability would depend on the licensing regime of each jurisdiction served." },
];

function Faq() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions we would want answered"
        description="If something is missing, the support desk is reachable from the contact page or from inside your dashboard."
      />
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-16">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`i${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Disclaimer variant="strong" />
      </div>
    </>
  );
}
