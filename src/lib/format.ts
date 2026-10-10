const compactCurrency = new Map<string, Intl.NumberFormat>();
const fullCurrency = new Map<string, Intl.NumberFormat>();

function formatter(cache: Map<string, Intl.NumberFormat>, currency: string, compact: boolean) {
  const key = `${currency}:${compact}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : 0,
    });
    cache.set(key, f);
  }
  return f;
}

export interface PriceLike {
  asking_price: number | null;
  currency: string;
  price_on_request: boolean;
}

/** "€4.5M", "$850K" or "Price on request". */
export function formatPrice(listing: PriceLike, opts: { compact?: boolean } = {}): string {
  const compact = opts.compact ?? true;
  if (listing.price_on_request || listing.asking_price == null) return 'Price on request';
  try {
    return formatter(compact ? compactCurrency : fullCurrency, listing.currency || 'EUR', compact).format(
      Number(listing.asking_price),
    );
  } catch {
    return `${listing.currency} ${Number(listing.asking_price).toLocaleString('en-GB')}`;
  }
}

export function formatMoney(amount: number | null | undefined, currency = 'EUR', compact = true): string {
  if (amount == null) return '—';
  return formatter(compact ? compactCurrency : fullCurrency, currency, compact).format(Number(amount));
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFmt.format(d);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
