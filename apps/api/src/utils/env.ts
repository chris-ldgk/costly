import { z } from "zod";

export const envSchema = z.object({
  CORS_ORIGINS: z
    .string()
    .refine((v) => v.split(",").length > 0)
    .transform((v) => v.split(",").map((v) => v.trim())),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string(),
  ALLOWED_USERS: z.string(),
  RESEND_FROM_EMAIL: z.string().min(3),
  RESEND_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});
