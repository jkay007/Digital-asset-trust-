import { z } from 'zod';
import { BUYER_TYPES, CURRENCIES } from './constants';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^[+()\d\s.-]{6,30}$/.test(v), 'Enter a valid phone number')
  .transform((v) => (v ? v : undefined));

const BUYER_TYPE_VALUES = BUYER_TYPES.map((b) => b.value) as [string, ...string[]];

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(254),
  company: optionalText(160),
  phone: phoneSchema,
  buyer_type: z.enum(BUYER_TYPE_VALUES).optional().or(z.literal('').transform(() => undefined)),
  message: z
    .string()
    .trim()
    .min(20, 'Please tell us a little more (at least 20 characters)')
    .max(3000, 'Please keep your message under 3,000 characters'),
  nda_requested: z.boolean().default(false),
  consent: z.literal(true, { errorMap: () => ({ message: 'You must agree before sending an enquiry' }) }),
  /** Honeypot: real users never see or fill this field. */
  website: z.string().max(0).optional().or(z.literal('')),
});
export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;

export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(128)
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'Include at least one letter and one number');

export const currencySchema = z.enum(CURRENCIES);
