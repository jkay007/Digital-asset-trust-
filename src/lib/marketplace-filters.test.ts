import { activeFilterCount, DEFAULT_FILTERS, filtersToParams, parseFilters, toSearchQuery } from './marketplace-filters';

describe('marketplace filters', () => {
  it('returns defaults for empty params', () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it('round-trips a full set of filters through the URL', () => {
    const filters = {
      ...DEFAULT_FILTERS,
      q: 'emi passport',
      category: 'payments-emis',
      jurisdiction: 'lithuania',
      minPrice: 1_000_000,
      maxPrice: 5_000_000,
      types: ['full_acquisition' as const, 'majority_stake' as const],
      operating: ['operating' as const],
      verification: ['documents_reviewed' as const],
      includeSold: true,
      sort: 'price_desc' as const,
      page: 3,
    };
    expect(parseFilters(filtersToParams(filters))).toEqual(filters);
  });

  it('drops unknown or malicious values', () => {
    const parsed = parseFilters(
      new URLSearchParams(
        'category=../../etc&type=full_acquisition,hack&verification=fake&sort=drop%20table&page=-4&min=abc&operating=dormant',
      ),
    );
    expect(parsed.category).toBeNull();
    expect(parsed.types).toEqual(['full_acquisition']);
    expect(parsed.verification).toEqual([]);
    expect(parsed.sort).toBe('newest');
    expect(parsed.page).toBe(1);
    expect(parsed.minPrice).toBeNull();
    expect(parsed.operating).toEqual(['dormant']);
  });

  it('omits defaults when serialising', () => {
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe('');
    expect(filtersToParams({ ...DEFAULT_FILTERS, minPrice: 0 }).toString()).toBe('');
  });

  it('counts active filters, excluding sort and page', () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(
      activeFilterCount({ ...DEFAULT_FILTERS, q: 'x', types: ['merger', 'joint_venture'], sort: 'title', page: 2 }),
    ).toBe(3);
  });

  it('sanitises free-text search', () => {
    expect(toSearchQuery('  EMI; DROP TABLE assets; -- <script>  ')).toBe('EMI DROP TABLE assets -- script');
    expect(toSearchQuery('a'.repeat(500))).toHaveLength(120);
  });
});
