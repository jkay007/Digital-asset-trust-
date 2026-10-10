import type { ReactNode } from 'react';
import { PageHeader } from './Section';
import { Seo } from '@/components/seo/Seo';
import { Notice } from '@/components/ui/notice';

interface ProsePageProps {
  title: string;
  eyebrow: string;
  description: string;
  seoDescription: string;
  template?: boolean;
  updated?: string;
  children: ReactNode;
}

export function ProsePage({ title, eyebrow, description, seoDescription, template, updated, children }: ProsePageProps) {
  return (
    <>
      <Seo title={title} description={seoDescription} />
      <PageHeader eyebrow={eyebrow} title={title} description={description} breadcrumbs={[{ label: 'Home', href: '/' }, { label: title }]} />
      <div className="container max-w-3xl py-12 sm:py-16">
        {template && (
          <Notice tone="warning" title="Template wording" className="mb-8">
            This page is a starting template. It must be reviewed and completed by qualified legal counsel for the
            operating entity and its jurisdiction before the platform is launched.
          </Notice>
        )}
        {updated && <p className="mb-6 text-sm text-slate-500">Last updated: {updated}</p>}
        <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-navy-900 prose-a:text-navy-800">
          {children}
        </div>
      </div>
    </>
  );
}
