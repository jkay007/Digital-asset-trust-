import { Mail, MessageSquareText, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';

export default function ContactPage() {
  return (
    <>
      <Seo title="Contact" description="Contact the Global Financial Assets team about buying or selling a regulated financial business." />
      <PageHeader
        eyebrow="Contact"
        title="Speak to our team"
        description="For enquiries about a specific listing, use the confidential enquiry form on the listing page so that it is linked to the correct opportunity."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <div className="container grid gap-6 py-12 sm:py-16 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-6 shadow-card">
          <Mail className="h-6 w-6 text-gold-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">General enquiries</h2>
          <a href={`mailto:${site.contactEmail}`} className="mt-2 block text-sm font-medium text-navy-800 underline underline-offset-2">
            {site.contactEmail}
          </a>
        </div>
        <div className="rounded-xl border border-slate-200 p-6 shadow-card">
          <MessageSquareText className="h-6 w-6 text-gold-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">About a listing</h2>
          <p className="mt-2 text-sm text-slate-600">Open the listing and use its confidential enquiry form.</p>
          <ButtonLink to="/marketplace" variant="outline" size="sm" className="mt-4">
            Browse listings
          </ButtonLink>
        </div>
        <div className="rounded-xl border border-slate-200 p-6 shadow-card">
          <ShieldCheck className="h-6 w-6 text-gold-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Selling a business</h2>
          <p className="mt-2 text-sm text-slate-600">Start a confidential submission; nothing is published without approval.</p>
          <ButtonLink to="/sell" variant="outline" size="sm" className="mt-4">
            How selling works
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
