import { DRAW_CONFIG, SUBSCRIPTION_CONFIG } from "@/lib/constants";
import { z } from "zod";

function isValidMonthKey(value: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }
  const [, mm] = value.split("-");
  const month = Number(mm);
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

export const registerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const scoreSchema = z.object({
  score: z.coerce
    .number()
    .int()
    .min(DRAW_CONFIG.scoreMin)
    .max(DRAW_CONFIG.scoreMax),
  playedOn: z.coerce.date(),
});

export const charityPreferenceSchema = z.object({
  charityId: z.string().min(1),
  contributionPercent: z.coerce
    .number()
    .int()
    .min(SUBSCRIPTION_CONFIG.minimumCharityPercent)
    .max(90),
});

export const independentDonationSchema = z.object({
  charityId: z.string().min(1),
  amount: z.coerce.number().min(1),
});

export const subscriptionSchema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"]),
});

export const drawRunSchema = z.object({
  monthKey: z.string().refine(isValidMonthKey, "Month key must use YYYY-MM."),
  mode: z.enum(["RANDOM", "ALGORITHMIC"]),
  publishNow: z.coerce.boolean().optional().default(false),
});

export const proofSchema = z.object({
  drawResultId: z.string().min(1),
  proofUrl: z.string().url(),
});

export const charityUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase slug format."),
  description: z.string().min(10).max(1500),
  imageUrl: z.union([z.literal(""), z.string().url()]).optional(),
  upcomingEvents: z.string().max(2500).optional(),
  isFeatured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
});

export const reviewWinnerSchema = z.object({
  drawResultId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().max(500).optional(),
});
