import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/legal-page";

export const Route = createFileRoute("/_site/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Meridian Digital Asset Management" },
      { name: "description", content: "How Meridian collects, uses and protects your personal data." },
      { property: "og:title", content: "Privacy Policy — Meridian" },
      { property: "og:description", content: "Our approach to personal data and privacy." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="We collect only what we need to operate the platform and meet regulatory obligations."
      updated="1 September 2026"
      sections={[
        { heading: "Data we collect", body: ["Identity details, contact information, verification documents, transaction history and device/session data."] },
        { heading: "Why we use it", body: ["To open and operate your account, meet KYC/AML obligations, prevent fraud and communicate with you."] },
        { heading: "Sharing", body: ["We share data only with verification providers, custodians, auditors and regulators where legally required. We never sell personal data."] },
        { heading: "Retention", body: ["Records are retained for at least five years after account closure to meet anti-money-laundering requirements."] },
        { heading: "Your rights", body: ["You may request access, correction or deletion of your data, subject to legal retention obligations. Contact privacy@meridian.capital."] },
      ]}
    />
  ),
});
