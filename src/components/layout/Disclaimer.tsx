import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DISCLAIMER_POINTS = [
  'Listings are invitations to discuss and are not offers, solicitations or guarantees of any kind. Information is provided by sellers and may be incomplete or change without notice.',
  'Financial licences and authorisations are frequently not transferable. A licence typically remains with the regulated entity and may lapse, be restricted or be withdrawn on a change of ownership.',
  'Acquiring a regulated business commonly requires prior regulatory approval, including change-of-control, fit-and-proper and source-of-funds assessments, which may be refused or take many months.',
  'Verification states describe only the specific checks recorded by an authorised reviewer on the date shown. They are not due diligence, legal, tax or investment advice.',
];

interface DisclaimerProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export function Disclaimer({ variant = 'full', className }: DisclaimerProps) {
  if (variant === 'compact') {
    return (
      <p className={cn('text-xs leading-relaxed text-slate-500', className)}>
        Listings are not offers or guarantees. Licences may not be transferable and acquisitions can require regulatory
        approval. Verification reflects only the checks recorded by an authorised reviewer.{' '}
        <Link to="/legal/disclaimer" className="font-medium text-navy-700 underline underline-offset-2">
          Read the important notice
        </Link>
        .
      </p>
    );
  }
  return (
    <aside
      aria-labelledby="disclaimer-heading"
      className={cn('rounded-xl border border-slate-200 bg-slate-50 p-6', className)}
    >
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-gold-700" aria-hidden="true" />
        <h2 id="disclaimer-heading" className="font-display text-lg font-semibold">
          Important notice
        </h2>
      </div>
      <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-700">
        {DISCLAIMER_POINTS.map((point) => (
          <li key={point} className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-600" aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
