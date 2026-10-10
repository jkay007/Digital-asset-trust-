/**
 * Editorial insights. General information only, not legal or regulatory advice.
 * Stored in code so the content is versioned and reviewed like any other change;
 * move to a CMS table if editors need to publish without a deployment.
 */
export interface InsightSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Insight {
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  publishedAt: string;
  readingMinutes: number;
  sections: InsightSection[];
}

export const insights: Insight[] = [
  {
    slug: 'are-financial-licences-transferable',
    title: 'Are financial licences transferable? What buyers are actually acquiring',
    excerpt:
      'In most jurisdictions a licence belongs to the regulated entity, not to its owner. Understanding that distinction shapes the whole transaction.',
    topic: 'Regulation',
    publishedAt: '2026-09-18',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'A common misconception in this market is that a financial licence can be bought and sold like a piece of property. In practice, most regulators grant authorisation to a specific legal entity, assessed on its specific owners, management, capital and business plan. The licence is rarely a free-standing asset.',
          'What a buyer usually acquires is the shares of the regulated company. The licence stays with that company, but the change of ownership itself normally needs prior regulatory approval.',
        ],
      },
      {
        heading: 'Change of control is the real gateway',
        paragraphs: [
          'Across the EU, UK and many other financial centres, acquiring a qualifying holding in a regulated firm, often defined by thresholds such as 10%, 20%, 30% or 50%, requires prior notification to and approval from the competent authority. Regulators typically assess the reputation and financial soundness of the proposed acquirer, the source of funds, and whether the firm will continue to meet its prudential requirements.',
        ],
        bullets: [
          'Assessment periods are set by law in some jurisdictions but can be extended by information requests.',
          'Completing before approval can be a regulatory breach and can lead to sanctions or forced divestment.',
          'Approval is not guaranteed, even where the target business is in good standing.',
        ],
      },
      {
        heading: 'Licences that cannot move',
        paragraphs: [
          'Some authorisations are personal to the applicant, conditional on a business plan that will not survive the sale, or subject to activity requirements. A licence that has been dormant for a long period may be at risk of withdrawal in some regimes. Buyers should confirm the current standing of the authorisation directly with the regulator’s public register and through legal advisers.',
        ],
      },
      {
        heading: 'Practical implications',
        paragraphs: [
          'Structure the transaction with regulatory approval as a condition precedent, budget for the time it takes, and plan the post-completion governance, including management and compliance staffing, that the regulator will expect to see.',
        ],
      },
    ],
  },
  {
    slug: 'acquiring-an-emi-change-of-control',
    title: 'Acquiring an EMI or payment institution: a buyer’s change-of-control checklist',
    excerpt:
      'Safeguarding, banking relationships and agent networks often matter as much as the licence itself. A practical checklist for buyers.',
    topic: 'Payments',
    publishedAt: '2026-08-27',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'Electronic money institutions and payment institutions are among the most actively traded regulated businesses. Their value depends on far more than the authorisation itself.',
        ],
      },
      {
        heading: 'Areas to diligence',
        paragraphs: ['Before signing, buyers commonly review:'],
        bullets: [
          'Regulatory history: inspection findings, remediation plans, restrictions or conditions on the authorisation.',
          'Safeguarding: how client funds are protected, reconciliations, and safeguarding audit results where required.',
          'Banking and scheme access: safeguarding and operational accounts, card scheme memberships, and whether they survive a change of control.',
          'Passporting and cross-border permissions, which may depend on the firm’s home-state regime.',
          'Outsourcing and agent arrangements, including critical third-party providers.',
          'AML/CFT framework, transaction monitoring and suspicious activity reporting.',
        ],
      },
      {
        heading: 'Timeline',
        paragraphs: [
          'Change-of-control assessments typically run alongside legal due diligence. Counterparties such as safeguarding banks may run their own onboarding of the new owner, so engage them early.',
        ],
      },
    ],
  },
  {
    slug: 'crypto-asset-service-providers-after-mica',
    title: 'Buying a crypto-asset business after MiCA: what has changed',
    excerpt:
      'With transitional periods ending, the value of an authorised CASP and the diligence it requires have shifted materially.',
    topic: 'Digital assets',
    publishedAt: '2026-07-14',
    readingMinutes: 5,
    sections: [
      {
        paragraphs: [
          'The EU Markets in Crypto-Assets Regulation (MiCA) created an EU-wide authorisation regime for crypto-asset service providers (CASPs). Member states could allow firms operating under prior national regimes to continue for a limited transitional period, and those periods have now ended.',
          'For acquirers, this has made the distinction between an authorised CASP and a legacy national registration critical.',
        ],
      },
      {
        heading: 'Diligence priorities',
        paragraphs: [],
        bullets: [
          'Confirm the authorisation, its scope of services and any passporting notifications on the competent authority’s register and the ESMA interim register.',
          'Review custody arrangements and segregation of client crypto-assets.',
          'Assess Travel Rule compliance and blockchain analytics tooling.',
          'Understand capital requirements and how they will be met after completion.',
        ],
      },
      {
        heading: 'Outside the EU',
        paragraphs: [
          'Other jurisdictions operate their own virtual asset regimes with different ownership-change rules. A registration in one jurisdiction does not confer permission to serve clients in another.',
        ],
      },
    ],
  },
  {
    slug: 'what-verification-means',
    title: 'What “verified” means on Global Financial Assets, and what it does not',
    excerpt:
      'Our four verification states describe specific checks recorded by an authorised reviewer. They are a starting point for diligence, never a substitute.',
    topic: 'Platform',
    publishedAt: '2026-06-30',
    readingMinutes: 4,
    sections: [
      {
        paragraphs: [
          'Every listing displays one of four states: Unverified, Company Checked, Regulator Record Checked or Documents Reviewed. Each state is recorded by a named, authorised reviewer with the date of the check, and the listing’s badge is derived from that record in our database. Sellers cannot set or change it.',
        ],
      },
      {
        heading: 'What the states do not mean',
        paragraphs: [
          'A verification state is not legal, financial or regulatory due diligence. It does not confirm that a licence is transferable, that a regulator will approve a change of control, or that the information in a listing is complete. Checks reflect the position on the date recorded and can become out of date.',
        ],
      },
      {
        heading: 'Demo listings',
        paragraphs: [
          'Listings marked DEMO are fictitious examples. Any verification state shown on a demo listing is illustrative only and is clearly labelled as such.',
        ],
      },
    ],
  },
];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}
