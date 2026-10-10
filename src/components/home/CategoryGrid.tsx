import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { useCategories, useListingCounts } from '@/hooks/useReferenceData';
import { categoryIcon } from '@/lib/category-icons';
import { cn } from '@/lib/utils';

export function CategoryGrid({ className }: { className?: string }) {
  const { data: categories, isLoading, error, refetch } = useCategories();
  const { data: counts } = useListingCounts();

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;

  return (
    <ul className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5', className)}>
      {isLoading
        ? Array.from({ length: 10 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-48 rounded-xl" />
            </li>
          ))
        : categories?.map((category) => {
            const Icon = categoryIcon(category.icon);
            const count = counts?.byCategory.get(category.id) ?? 0;
            return (
              <li key={category.id}>
                <Link
                  to={`/categories/${category.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lift"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-gold-300 transition-colors group-hover:bg-navy-800">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-[1.05rem] font-semibold leading-snug text-navy-900">
                    {category.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{category.description}</p>
                  <span className="mt-auto flex items-center justify-between pt-4 text-xs font-medium text-slate-500">
                    <span className="tabular">
                      {count} {count === 1 ? 'opportunity' : 'opportunities'}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
    </ul>
  );
}
