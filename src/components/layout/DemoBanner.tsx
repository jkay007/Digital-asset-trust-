import { Link } from 'react-router-dom';

/** Site-wide notice while the marketplace contains illustrative DEMO data. */
export function DemoBanner() {
  return (
    <div className="bg-navy-950 text-[0.78rem] text-white/80">
      <div className="container flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 py-2 text-center">
        <span className="rounded-sm bg-violet-200 px-1.5 py-px text-[0.65rem] font-bold uppercase tracking-wider text-violet-950">
          Demo
        </span>
        <span>
          Listings marked DEMO are illustrative only. They are not real businesses and are not available for acquisition.
        </span>
        <Link to="/legal/disclaimer" className="font-medium text-gold-300 underline-offset-2 hover:underline">
          Important notice
        </Link>
      </div>
    </div>
  );
}
