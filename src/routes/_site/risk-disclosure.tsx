import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/legal-page";

export const Route = createFileRoute("/_site/risk-disclosure")({
  head: () => ({
    meta: [
      { title: "Risk Disclosure — Meridian Digital Asset Management" },
      { name: "description", content: "The material risks of investing in digital-asset and DeFi strategies." },
      { property: "og:title", content: "Risk Disclosure — Meridian" },
      { property: "og:description", content: "Digital assets are high risk. Read before investing." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Risk Disclosure"
      description="Digital assets are high-risk investments. You should not invest money you cannot afford to lose."
      updated="1 September 2026"
      sections={[
        { heading: "Capital at risk", body: ["You may lose some or all of the capital you invest. Returns are not guaranteed and targets may not be achieved."] },
        { heading: "Illustrative figures", body: ["Any reference to monthly returns, including 3% per month, is a target or illustrative projection only. Past or projected performance is not a reliable indicator of future results."] },
        { heading: "Market and volatility risk", body: ["Digital-asset prices can move sharply in short periods, affecting collateral, staking and liquidity positions."] },
        { heading: "Smart-contract and protocol risk", body: ["Protocols may contain bugs or be exploited, resulting in permanent loss of funds."] },
        { heading: "Stablecoin and counterparty risk", body: ["Stablecoins may lose their peg; custodians, exchanges and counterparties may fail."] },
        { heading: "Liquidity risk", body: ["Lock-ups, unbonding periods and market stress may delay or prevent withdrawals."] },
        { heading: "Regulatory risk", body: ["Laws governing digital assets are evolving and may restrict or prohibit certain activities. Investments are generally not covered by deposit-protection schemes."] },
      ]}
    />
  ),
});
