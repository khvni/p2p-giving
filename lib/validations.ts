import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\+60\d{9,10}$/, 'Invalid Malaysian phone number. Format: +60123456789').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Campaign validation schemas
export const createCampaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  story: z.string().optional(),
  goalAmount: z.number().positive('Goal amount must be positive').max(10000000, 'Goal amount too large'),
  currency: z.string().default('MYR'),
  category: z.enum([
    'EDUCATION',
    'HEALTHCARE',
    'FOOD_RELIEF',
    'SHELTER',
    'DISASTER_RELIEF',
    'ORPHAN_CARE',
    'ELDERLY_CARE',
    'ZAKAT',
    'SADAQAH',
    'QURBANI',
    'WAKAF',
    'OTHER',
  ]),
  endDate: z.string().optional(),
  coverImage: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  minDonation: z.number().positive().optional(),
  maxDonation: z.number().positive().optional(),
  teamId: z.string().optional(),
  allowRecurring: z.boolean().default(true),
  allowAnonymous: z.boolean().default(true),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const campaignUpdateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  images: z.array(z.string().url()).optional(),
});

// Donation validation schemas
export const createDonationSchema = z.object({
  amount: z.number().positive('Donation amount must be positive').min(1, 'Minimum donation is RM 1'),
  currency: z.string().default('MYR'),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
  isAnonymous: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['monthly', 'weekly']).optional(),
});

// Team validation schemas
export const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters').max(50, 'Team name must be less than 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  goalAmount: z.number().positive('Goal amount must be positive'),
  currency: z.string().default('MYR'),
  avatar: z.string().url().optional(),
  maxMembers: z.number().positive().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

// Challenge validation schemas
export const createChallengeSchema = z.object({
  name: z.string().min(3, 'Challenge name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string(),
  endDate: z.string(),
  type: z.enum(['MOST_RAISED', 'MOST_DONORS', 'MOST_CAMPAIGNS', 'FASTEST_GOAL']),
  prize: z.string().optional(),
  rules: z.record(z.any()).optional(),
});

// Share tracking schema
export const trackShareSchema = z.object({
  campaignId: z.string(),
  platform: z.enum(['FACEBOOK', 'TWITTER', 'WHATSAPP', 'INSTAGRAM', 'TELEGRAM', 'EMAIL']),
});

// Malaysian specific validations
export const malaysianPhoneSchema = z
  .string()
  .regex(/^\+60\d{9,10}$/, 'Invalid Malaysian phone number. Format: +60123456789');

export const malaysianCurrencySchema = z
  .number()
  .positive()
  .transform((val) => Math.round(val * 100) / 100); // Round to 2 decimals

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type TrackShareInput = z.infer<typeof trackShareSchema>;
