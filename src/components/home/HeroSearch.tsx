import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCategories, useJurisdictions } from '@/hooks/useReferenceData';
import { filtersToParams, DEFAULT_FILTERS } from '@/lib/marketplace-filters';
import { cn } from '@/lib/utils';

export function HeroSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: jurisdictions } = useJurisdictions();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = filtersToParams({
      ...DEFAULT_FILTERS,
      q,
      category: category || null,
      jurisdiction: jurisdiction || null,
    });
    navigate(`/marketplace${params.toString() ? `?${params}` : ''}`);
  };

  const control =
    'h-12 w-full bg-transparent px-4 text-[0.95rem] text-navy-900 placeholder:text-slate-500 focus:outline-none';

  return (
    <form
      role="search"
      aria-label="Search opportunities"
      onSubmit={onSubmit}
      className={cn(
        'grid grid-cols-1 gap-1 rounded-xl bg-white p-1.5 shadow-lift ring-1 ring-black/5 md:grid-cols-[1.6fr_1fr_1fr_auto] md:gap-0',
        className,
      )}
    >
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" aria-hidden="true" />
        <label htmlFor="hero-q" className="sr-only">
          Keyword
        </label>
        <input
          id="hero-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="EMI, CASP, broker-dealer, insurer…"
          className={cn(control, 'pl-12')}
          maxLength={120}
        />
      </div>
      <div className="border-t border-slate-100 md:border-l md:border-t-0">
        <label htmlFor="hero-category" className="sr-only">
          Category
        </label>
        <select id="hero-category" value={category} onChange={(e) => setCategory(e.target.value)} className={cn(control, 'cursor-pointer')}>
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="border-t border-slate-100 md:border-l md:border-t-0">
        <label htmlFor="hero-jurisdiction" className="sr-only">
          Jurisdiction
        </label>
        <select
          id="hero-jurisdiction"
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className={cn(control, 'cursor-pointer')}
        >
          <option value="">All jurisdictions</option>
          {jurisdictions?.map((j) => (
            <option key={j.id} value={j.slug}>
              {j.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="lg" className="h-12 md:ml-1.5">
        <Search className="h-4 w-4" aria-hidden="true" />
        Search
      </Button>
    </form>
  );
}
