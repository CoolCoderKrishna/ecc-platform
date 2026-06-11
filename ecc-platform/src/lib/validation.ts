import { z } from "zod";

// ─── String helpers ────────────────────────────────────────────
const sanitized = (min?: number, max?: number) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z.string()
        .min(min ?? 1, "Required")
        .max(max ?? 1000, "Too long")
    );

const optionalSanitized = (max?: number) =>
  z
    .string()
    .optional()
    .transform((s) => s?.trim() ?? s)
    .pipe(z.string().max(max ?? 1000, "Too long").optional());

const optionalUrl = z.string().url("Invalid URL").optional().or(z.literal(""));

const dateString = z
  .string()
  .optional()
  .refine(
    (s) => !s || !isNaN(new Date(s).getTime()),
    "Invalid date"
  );

// ─── Profile ──────────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  academicYear: z
    .enum(["FRESHMAN", "SOPHOMORE", "JUNIOR", "SENIOR", "GRADUATE", "ALUMNI"])
    .optional(),
  skills: z.array(z.string().max(50)).max(50).optional(),
  interests: z.array(z.string().max(50)).max(50).optional(),
  careerGoals: z.array(z.string().max(100)).max(20).optional(),
  preferredTechs: z.array(z.string().max(50)).max(50).optional(),
  location: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  telegramBotEnabled: z.boolean().optional(),
  telegramChatId: z.string().max(50).optional(),
  smsEnabled: z.boolean().optional(),
  phoneNumber: z
    .string()
    .max(20)
    .optional()
    .refine(
      (s) => !s || /^\+?[\d\s\-()]{7,20}$/.test(s),
      "Invalid phone number"
    ),
  whatsappEnabled: z.boolean().optional(),
  whatsappNumber: z
    .string()
    .max(20)
    .optional()
    .refine(
      (s) => !s || /^\+?[\d\s\-()]{7,20}$/.test(s),
      "Invalid phone number"
    ),
  notificationFreq: z
    .enum(["INSTANT", "DAILY", "WEEKLY"])
    .optional(),
});

// ─── Certifications ───────────────────────────────────────────
export const certificationCreateSchema = z.object({
  name: sanitized(1, 200),
  provider: sanitized(1, 200),
  url: optionalUrl,
  completedAt: dateString,
  expiresAt: dateString,
  skills: z.array(z.string().max(50)).max(20).optional(),
});

// ─── Goals ────────────────────────────────────────────────────
export const goalCreateSchema = z.object({
  title: sanitized(1, 200),
  description: optionalSanitized(2000),
  category: z.string().max(100).optional(),
  deadline: dateString,
  milestones: z.array(z.string().max(200)).max(20).optional(),
});

export const goalUpdateSchema = z.object({
  id: z.string().min(1, "Invalid goal ID"),
  completed: z.boolean().optional(),
  progress: z.number().min(0).max(100).optional(),
  milestoneId: z.string().min(1).optional(),
  milestoneCompleted: z.boolean().optional(),
});

// ─── Portfolio ────────────────────────────────────────────────
export const portfolioCreateSchema = z.object({
  title: sanitized(1, 200),
  description: optionalSanitized(5000),
  type: z.enum(["PROJECT", "INTERNSHIP", "CERTIFICATION", "ACHIEVEMENT", "RESEARCH", "OPEN_SOURCE"]),
  url: optionalUrl,
  imageUrl: optionalUrl,
  skills: z.array(z.string().max(50)).max(30).optional(),
  featured: z.boolean().optional(),
});

// ─── Achievements ─────────────────────────────────────────────
export const achievementCreateSchema = z.object({
  title: sanitized(1, 200),
  description: optionalSanitized(2000),
  date: z.string().refine((s) => !isNaN(new Date(s).getTime()), "Invalid date"),
  category: sanitized(1, 100),
  url: optionalUrl,
});

// ─── Data Sources ─────────────────────────────────────────────
export const dataSourceCreateSchema = z.object({
  name: sanitized(1, 200),
  url: z.string().url("Invalid URL"),
  type: z.enum(["RSS", "API", "SCRAPER", "MANUAL"]),
  category: z.enum([
    "INTERNSHIP", "CERTIFICATION", "HACKATHON", "COMPETITION",
    "RESEARCH", "OPEN_SOURCE", "SCHOLARSHIP", "COURSE", "WORKSHOP", "OTHER",
  ]),
  scrapeFreq: z.number().min(5).max(1440).optional(),
  config: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const dataSourceUpdateSchema = z.object({
  id: z.string().min(1, "Invalid source ID"),
  isActive: z.boolean().optional(),
  scrapeFreq: z.number().min(5).max(1440).optional(),
  config: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

// ─── Auth Registration ────────────────────────────────────────
export const registerSchema = z.object({
  name: sanitized(1, 100),
  email: z.string().email("Invalid email").max(200),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .refine(
      (s) => /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s),
      "Password must contain uppercase, lowercase, and a number"
    ),
  academicYear: z
    .enum(["FRESHMAN", "SOPHOMORE", "JUNIOR", "SENIOR", "GRADUATE", "ALUMNI"])
    .optional(),
  skills: z.array(z.string().max(50)).max(50).optional(),
  interests: z.array(z.string().max(50)).max(50).optional(),
});

// ─── Generic ID validation ────────────────────────────────────
export const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

// ─── Helper to validate and return errors ─────────────────────
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const firstError = result.error.issues[0];
  return {
    success: false,
    error: firstError?.message ?? "Invalid input",
  };
}
