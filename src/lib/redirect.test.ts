import { safeRedirect } from './redirect';

describe('safeRedirect', () => {
  it('allows same-origin paths', () => {
    expect(safeRedirect('/dashboard/saved')).toBe('/dashboard/saved');
    expect(safeRedirect('/listings/demo-x?tab=1')).toBe('/listings/demo-x?tab=1');
  });
  it('blocks open redirects and loops', () => {
    expect(safeRedirect('https://evil.example')).toBe('/dashboard');
    expect(safeRedirect('//evil.example')).toBe('/dashboard');
    expect(safeRedirect('/\\evil.example')).toBe('/dashboard');
    expect(safeRedirect('/login?redirect=/x')).toBe('/dashboard');
    expect(safeRedirect(null)).toBe('/dashboard');
  });
});
