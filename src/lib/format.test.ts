import { formatBytes, formatDate, formatPrice } from './format';

describe('formatting', () => {
  it('formats asking prices compactly and fully', () => {
    expect(formatPrice({ asking_price: 2_400_000, currency: 'EUR', price_on_request: false })).toBe('€2.4M');
    expect(formatPrice({ asking_price: 2_400_000, currency: 'EUR', price_on_request: false }, { compact: false })).toBe(
      '€2,400,000',
    );
    expect(formatPrice({ asking_price: 850_000, currency: 'USD', price_on_request: false })).toBe('US$850K');
  });

  it('never shows a price when price is on request', () => {
    expect(formatPrice({ asking_price: 1_000_000, currency: 'EUR', price_on_request: true })).toBe('Price on request');
    expect(formatPrice({ asking_price: null, currency: 'EUR', price_on_request: false })).toBe('Price on request');
  });

  it('formats dates and sizes', () => {
    expect(formatDate('2026-10-10T12:00:00Z')).toBe('10 Oct 2026');
    expect(formatDate(null)).toBe('—');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
