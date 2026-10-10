import { Compass } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { ButtonLink } from '@/components/ui/button';

export default function NotFoundPage({ title = 'Page not found', message }: { title?: string; message?: string }) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Seo title={title} noindex />
      <Compass className="h-12 w-12 text-gold-600" aria-hidden="true" />
      <p className="eyebrow mt-6">Error 404</p>
      <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
      <p className="mt-4 max-w-md text-slate-600">
        {message ?? 'The page you are looking for may have moved, been unpublished or never existed.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/marketplace">Browse the marketplace</ButtonLink>
        <ButtonLink to="/" variant="outline">
          Return home
        </ButtonLink>
      </div>
    </div>
  );
}
