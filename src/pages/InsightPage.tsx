import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/Section';
import { breadcrumbJsonLd, Seo } from '@/components/seo/Seo';
import { Notice } from '@/components/ui/notice';
import { getInsight } from '@/content/insights';
import { formatDate } from '@/lib/format';
import NotFoundPage from './NotFoundPage';

export default function InsightPage() {
  const { slug } = useParams<{ slug: string }>();
  const insight = slug ? getInsight(slug) : undefined;
  if (!insight) return <NotFoundPage title="Article not found" />;
  const path = `/insights/${insight.slug}`;
  return (
    <>
      <Seo
        title={insight.title}
        description={insight.excerpt}
        path={path}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: insight.title,
            description: insight.excerpt,
            datePublished: insight.publishedAt,
          },
          breadcrumbJsonLd([
            { name: 'Insights', path: '/insights' },
            { name: insight.title, path },
          ]),
        ]}
      />
      <PageHeader
        eyebrow={insight.topic}
        title={insight.title}
        description={
          <p className="text-base text-white/60">
            <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time> · {insight.readingMinutes} min read
          </p>
        }
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Insights', href: '/insights' }, { label: insight.topic }]}
      />
      <article className="container max-w-3xl py-12 sm:py-16">
        <p className="text-xl leading-relaxed text-slate-700">{insight.excerpt}</p>
        <div className="prose prose-slate mt-8 max-w-none prose-headings:font-display prose-headings:text-navy-900 prose-a:text-navy-800">
          {insight.sections.map((section, i) => (
            <section key={i}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <Notice tone="info" className="mt-10">
          This article is general information only and is not legal, regulatory, tax or investment advice. Requirements
          vary by jurisdiction and change over time; take advice from qualified professionals.
        </Notice>
        <Link to="/insights" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All insights
        </Link>
      </article>
    </>
  );
}
