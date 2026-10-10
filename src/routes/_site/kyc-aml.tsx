import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/legal-page";

export const Route = createFileRoute("/_site/kyc-aml")({
  head: () => ({
    meta: [
      { title: "KYC / AML Policy — Meridian Digital Asset Management" },
      { name: "description", content: "Our identity verification and anti-money-laundering framework." },
      { property: "og:title", content: "KYC / AML Policy — Meridian" },
      { property: "og:description", content: "How we verify clients and monitor transactions." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="KYC / AML Policy"
      description="We verify every client and monitor every flow to keep the platform clean."
      updated="1 September 2026"
      sections={[
        { heading: "Customer due diligence", body: ["All clients provide government ID, proof of address and, where required, source-of-funds evidence before funding."] },
        { heading: "Enhanced due diligence", body: ["Higher-risk clients, politically exposed persons and large allocations are subject to additional checks."] },
        { heading: "Sanctions screening", body: ["Clients and wallet addresses are screened against global sanctions lists at onboarding and continuously."] },
        { heading: "Transaction monitoring", body: ["Deposits and withdrawals are reviewed by our compliance team; suspicious activity is reported to the relevant authority."] },
        { heading: "Record keeping", body: ["Verification and transaction records are retained for a minimum of five years."] },
      ]}
    />
  ),
});
