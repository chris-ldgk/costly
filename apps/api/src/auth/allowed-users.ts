import { z } from "zod";

export const allowedUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
});

export type AllowedUser = z.infer<typeof allowedUserSchema>;

export function parseAllowedUsers(raw: string): AllowedUser[] {
  const parsed: unknown = JSON.parse(raw);
  return z.array(allowedUserSchema).length(2).parse(parsed);
}

export function isAllowedEmail(raw: string, email: string): boolean {
  const users = parseAllowedUsers(raw);
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
}
