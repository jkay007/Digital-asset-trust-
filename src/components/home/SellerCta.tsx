import { Check } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const POINTS = [
  'Anonymised listing: your company name is never published',
  'Documents held in private, access-controlled storage',
  'Enquiries screened before any introduction',
  'Listing goes live only after administrator approval',
];

export function SellerCta() {
  const { user } = useAuth();
  return (
    <div className="on-dark relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-12 text-white sm:px-12 sm:py-16">
      <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-gold-400/20" />
      <div aria-hidden="true" className="absolute -right-10 -top-10 h-52 w-52 rounded-full border border-gold-400/30" />
      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow">For owners and shareholders</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Considering the sale of a regulated financial business?
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
            Reach qualified strategic and financial buyers discreetly. Submit your business for review. Nothing is
            published until it has been approved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to={user ? '/dashboard/submissions/new' : '/register/seller'} variant="gold" size="lg">
              Submit a confidential listing
            </ButtonLink>
            <ButtonLink to="/sell" variant="outline-light" size="lg">
              How selling works
            </ButtonLink>
          </div>
        </div>
        <ul className="space-y-3">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/85">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
