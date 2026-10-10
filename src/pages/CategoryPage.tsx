import { Link, useParams } from 'react-router-dom';
import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { PageHeader } from '@/components/layout/Section';
import { breadcrumbJsonLd, Seo } from '@/components/seo/Seo';
import { PageLoader } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/states';
import { useCategories, useListingCounts } from '@/hooks/useReferenceData';
import { categoryIcon } from '@/lib/category-icons';
import NotFoundPage from './NotFoundPage';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories, isLoading, error, refetch } = useCategories();
  const { data: counts } = useListingCounts();

  if (isLoading) return <PageLoader />;
  if (error) return <div className="container py-16"><ErrorState error={error} onRetry={() => refetch()} /></div>;
  const category = categories?.find((c) => c.slug === slug);
  if (!category) return <NotFoundPage title="Category not found" />;

  const Icon = categoryIcon(category.icon);
  const count = counts?.byCategory.get(category.id) ?? 0;
  const path = `/categories/${category.slug}`;

  return (
    <>
      <Seo
        title={category.seo_title || `${category.name} for sale`}
        description={category.seo_description || category.description}
        path={path}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Categories', path: '/categories' },
          { name: category.name, path },
        ])}
      />
      <PageHeader
        eyebrow="Category"
        title={
          <span className="flex items-center gap-4">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gold-400/40 bg-white/5 text-gold-300 sm:flex">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            {category.name}
          </span>
        }
        description={
          <>
            <p>{category.long_description || category.description}</p>
            <p className="mt-4 text-sm text-white/55 tabular">
              {count} published {count === 1 ? 'opportunity' : 'opportunities'}
            </p>
          </>
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />
      <div className="container py-10 sm:py-14">
        <MarketplaceBrowser lockedCategory={category.slug} />

        <nav aria-labelledby="other-categories" className="mt-16 border-t border-slate-200 pt-10">
          <h2 id="other-categories" className="font-display text-xl font-semibold">
            Other categories
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {categories
              ?.filter((c) => c.id !== category.id)
              .map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/categories/${c.slug}`}
                    className="inline-block rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-navy-800 hover:border-gold-400 hover:bg-gold-50"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
        <Disclaimer variant="compact" className="mt-10" />
      </div>
    </>
  );
}
