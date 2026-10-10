import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { site } from '@/config/site';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import type { PageMetadata } from '@/integrations/supabase/types';

interface SeoProps {
  title?: string;
  description?: string;
  /** Override canonical path; defaults to the current pathname. */
  path?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** Loads all admin-editable metadata overrides once and caches them. */
export function usePageMetadata() {
  return useQuery({
    queryKey: ['page_metadata'],
    enabled: isSupabaseConfigured,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('page_metadata').select('*');
      if (error) throw error;
      return new Map<string, PageMetadata>((data ?? []).map((row) => [row.path, row]));
    },
  });
}

export function Seo({ title, description, path, image, noindex, jsonLd }: SeoProps) {
  const location = useLocation();
  const pathname = path ?? location.pathname;
  const { data: overrides } = usePageMetadata();
  const override = overrides?.get(pathname);

  const resolvedTitle = override?.title || title;
  const fullTitle = resolvedTitle ? `${resolvedTitle} | ${site.name}` : `${site.name} | ${site.tagline}`;
  const resolvedDescription = override?.description || description || site.description;
  const resolvedImage = override?.og_image_url || image;
  const robots = override?.noindex || noindex ? 'noindex, nofollow' : 'index, follow';
  const canonical = site.url ? `${site.url}${pathname === '/' ? '' : pathname}` : undefined;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      {canonical && <meta property="og:url" content={canonical} />}
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: site.url ? `${site.url}${item.path}` : item.path,
    })),
  };
}
