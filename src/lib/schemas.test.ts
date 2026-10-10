import { enquirySchema, passwordSchema } from './schemas';

const valid = {
  name: 'Jane Buyer',
  email: 'jane@example.com',
  message: 'We are interested in acquiring this business within six months.',
  consent: true as const,
  nda_requested: true,
};

describe('enquiry schema', () => {
  it('accepts a valid enquiry', () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });
  it('requires consent and a meaningful message', () => {
    expect(enquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, message: 'too short' }).success).toBe(false);
  });
  it('rejects a filled honeypot', () => {
    expect(enquirySchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(false);
  });
  it('validates phone numbers', () => {
    expect(enquirySchema.safeParse({ ...valid, phone: '+44 20 7946 0000' }).success).toBe(true);
    expect(enquirySchema.safeParse({ ...valid, phone: 'call me' }).success).toBe(false);
  });
});

describe('password schema', () => {
  it('requires length, a letter and a digit', () => {
    expect(passwordSchema.safeParse('short1').success).toBe(false);
    expect(passwordSchema.safeParse('onlyletterslong').success).toBe(false);
    expect(passwordSchema.safeParse('letters12345').success).toBe(true);
  });
});
