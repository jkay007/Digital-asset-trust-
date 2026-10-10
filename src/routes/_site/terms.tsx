import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/legal-page";

export const Route = createFileRoute("/_site/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Meridian Digital Asset Management" },
      { name: "description", content: "The terms governing use of the Meridian platform and services." },
      { property: "og:title", content: "Terms of Use — Meridian" },
      { property: "og:description", content: "Terms governing access to the Meridian platform." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Use"
      description="Please read these terms carefully before using the platform."
      updated="1 September 2026"
      sections={[
        { heading: "Acceptance", body: ["By accessing the platform you agree to these terms. If you do not agree, do not use the services."] },
        { heading: "Eligibility", body: ["You must be at least 18, legally able to contract, and not resident in a restricted jurisdiction. Identity verification is mandatory before funding."] },
        { heading: "No guarantee of returns", body: ["Any target, illustrative or historical figure is not a promise of future performance. The value of investments can fall as well as rise and you may lose all capital invested."] },
        { heading: "Deposits and withdrawals", body: ["All flows are subject to compliance review. We may delay, reject or reverse transactions where required by law or our AML policy."] },
        { heading: "Fees", body: ["Management and performance fees are disclosed per strategy and deducted as stated in the strategy terms."] },
        { heading: "Limitation of liability", body: ["To the extent permitted by law, we are not liable for losses arising from market movements, protocol failures, network outages or third-party custody events."] },
        { heading: "Governing law", body: ["These terms are governed by the laws of England and Wales."] },
      ]}
    />
  ),
});
