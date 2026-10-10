import { checkedAtFor } from './VerificationPanel';

describe('checkedAtFor', () => {
  it('never produces a timestamp in the future', () => {
    const now = new Date('2026-10-10T09:30:00Z');
    expect(checkedAtFor('2026-10-10', now)).toBe(now.toISOString());
  });
  it('uses midday for past dates', () => {
    const now = new Date('2026-10-10T09:30:00Z');
    expect(checkedAtFor('2026-09-01', now)).toBe('2026-09-01T12:00:00.000Z');
  });
});
