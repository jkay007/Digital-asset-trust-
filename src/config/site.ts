import skylineUrl from '@/assets/skyline.svg';

/**
 * Site-wide configuration. Copy and contact details here are placeholders for
 * the operating entity to replace before launch.
 */
export const site = {
  name: 'Global Financial Assets',
  shortName: 'GFA',
  tagline: 'The confidential marketplace for regulated financial businesses',
  description:
    'A confidential marketplace for the acquisition of banks, EMIs, payment institutions, crypto businesses, brokerages, investment firms, insurers and financial licences.',
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? '',
  contactEmail: 'enquiries@example.com',
  /** Legal entity line for the footer. Replace with the operating company. */
  legalEntity: 'Global Financial Assets (operating entity to be confirmed)',
  hero: {
    /** Replace with licensed photography if preferred; any URL or imported asset works. */
    imageUrl: skylineUrl,
    imageAlt: 'Financial district skyline at dusk',
  },
} as const;

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const primaryNav: NavItem[] = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Categories', href: '/categories' },
  { label: 'Jurisdictions', href: '/jurisdictions' },
  { label: 'Verification', href: '/verification' },
  { label: 'Sell', href: '/sell' },
  { label: 'Buyers', href: '/buyers' },
  { label: 'Insights', href: '/insights' },
];

export const footerNav: { heading: string; links: NavItem[] }[] = [
  {
    heading: 'Marketplace',
    links: [
      { label: 'All opportunities', href: '/marketplace' },
      { label: 'Categories', href: '/categories' },
      { label: 'Jurisdictions', href: '/jurisdictions' },
      { label: 'How verification works', href: '/verification' },
    ],
  },
  {
    heading: 'Buyers',
    links: [
      { label: 'Buyer registration', href: '/register/buyer' },
      { label: 'Submit an acquisition mandate', href: '/dashboard/mandates/new' },
      { label: 'Saved listings', href: '/dashboard/saved' },
      { label: 'For buyers', href: '/buyers' },
    ],
  },
  {
    heading: 'Sellers',
    links: [
      { label: 'Sell a business or licence', href: '/sell' },
      { label: 'Seller registration', href: '/register/seller' },
      { label: 'Submit a listing', href: '/dashboard/submissions/new' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Insights', href: '/insights' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Important notice', href: '/legal/disclaimer' },
      { label: 'Terms of use', href: '/legal/terms' },
      { label: 'Privacy notice', href: '/legal/privacy' },
    ],
  },
];
