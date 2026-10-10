const BUYER_STEPS = [
  { title: 'Register as a buyer', body: 'Create a confidential buyer profile and tell us about your acquisition criteria.' },
  { title: 'Search and shortlist', body: 'Filter by category, jurisdiction, price, transaction type and verification state. Save listings to your shortlist.' },
  { title: 'Enquire confidentially', body: 'Send an enquiry or file an acquisition mandate. Our team qualifies interest before any introduction.' },
  { title: 'Diligence and approval', body: 'Proceed under NDA with your advisers. Plan for change-of-control approval where required.' },
];

const SELLER_STEPS = [
  { title: 'Submit privately', body: 'Describe the business and upload supporting documents to private storage.' },
  { title: 'Review and verification', body: 'Reviewers check the company and regulator records and may request changes.' },
  { title: 'Approval and publication', body: 'An administrator approves the anonymised listing before it is published.' },
  { title: 'Qualified introductions', body: 'We screen buyer enquiries and introduce credible counterparties under NDA.' },
];

function Steps({ heading, steps }: { heading: string; steps: { title: string; body: string }[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:p-8">
      <h3 className="font-display text-2xl font-semibold text-white">{heading}</h3>
      <ol className="mt-6 space-y-6">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="font-display text-2xl font-semibold text-gold-400 tabular" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="font-semibold text-white">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HowItWorks() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Steps heading="For buyers" steps={BUYER_STEPS} />
      <Steps heading="For sellers" steps={SELLER_STEPS} />
    </div>
  );
}
