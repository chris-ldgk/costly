import type { BetterAuthOptions } from "better-auth";
import type { envSchema } from "../utils/env";
import type { z } from "zod";

type Env = z.infer<typeof envSchema>;

export function getTrustedOrigins(env: Env): string[] {
  return [...new Set([...env.CORS_ORIGINS, env.BETTER_AUTH_URL])];
}

export function getAuthAdvancedOptions(
  env: Env,
): BetterAuthOptions["advanced"] {
  return {
    crossSubDomainCookies: {
      enabled: true,
      domain: env.COOKIE_DOMAIN,
    },
  };
}
