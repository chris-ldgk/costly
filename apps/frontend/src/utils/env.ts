import { z } from "zod";

export const secretEnvSchema = z.object({});

export const publicEnvSchema = z.object({
  VITE_PUBLIC_URL: z.string(),
  VITE_API_URL: z.string(),
});

export const publicEnv = publicEnvSchema.parse(import.meta.env);
