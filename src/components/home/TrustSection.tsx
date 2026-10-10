import { Link } from 'react-router-dom';
import { ArrowRight, EyeOff, FileLock2, Stamp, UserCheck } from 'lucide-react';
import { VerificationBadge } from '@/components/marketplace/VerificationBadge';
import { VERIFICATION_LEVELS } from '@/lib/constants';

const PILLARS = [
  {
    icon: Stamp,
    title: 'Moderated before publication',
    body: 'Every submission stays unpublished until an authorised administrator has reviewed and approved it. Sellers cannot publish or edit live listings.',
  },
  {
    icon: UserCheck,
    title: 'Reviewer-recorded verification',
    body: 'Verification states are written by named reviewers with the date and method of each check. We never display a state that has not been recorded.',
  },
  {
    icon: FileLock2,
    title: 'Private document vault',
    body: 'Licences, corporate records and financials are stored in private storage, accessible only to the uploading seller and authorised reviewers via expiring links.',
  },
  {
    icon: EyeOff,
    title: 'Discretion for both sides',
    body: 'Public listings are anonymised. Buyer enquiries are handled by our team and not shared with sellers without consent.',
  },
];

export function TrustSection() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <div>
        <p className="eyebrow">Trust &amp; verification</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-[2.35rem]">
          Transparent about what has been checked, and what has not.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Each listing carries one of four verification states. They describe specific checks on a specific date, and
          they are a starting point for your own due diligence, not a substitute for it.
        </p>
        <ol className="mt-8 space-y-4">
          {VERIFICATION_LEVELS.map((level, i) => (
            <li key={level.value} className="relative flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-400 bg-white font-display text-sm font-semibold text-gold-700 tabular">
                {i}
              </span>
              <div>
                <VerificationBadge level={level.value} />
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{level.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          to="/verification"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700"
        >
          How verification works <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-5 self-start sm:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <Icon className="h-6 w-6 text-gold-600" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
