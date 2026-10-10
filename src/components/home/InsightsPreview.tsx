import { Link } from 'react-router-dom';
import { insights } from '@/content/insights';
import { formatDate } from '@/lib/format';

export function InsightCard({ insight }: { insight: (typeof insights)[number] }) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lift">
      <div className="flex items-center gap-3 text-xs">
        <span className="font-semibold uppercase tracking-[0.16em] text-gold-700">{insight.topic}</span>
        <span className="text-slate-300" aria-hidden="true">
          •
        </span>
        <time dateTime={insight.publishedAt} className="text-slate-500">
          {formatDate(insight.publishedAt)}
        </time>
      </div>
      <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-navy-900">
        <Link to={`/insights/${insight.slug}`} className="after:absolute after:inset-0 group-hover:text-navy-700">
          {insight.title}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{insight.excerpt}</p>
      <p className="mt-auto pt-5 text-xs font-medium text-slate-500">{insight.readingMinutes} min read</p>
    </article>
  );
}

export function InsightsPreview() {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {insights.slice(0, 3).map((insight) => (
        <li key={insight.slug}>
          <InsightCard insight={insight} />
        </li>
      ))}
    </ul>
  );
}
