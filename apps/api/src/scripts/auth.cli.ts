import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { emailOTP } from "better-auth/plugins";
import { getScriptEnv } from "../utils/wrangler-vars";
import { getAuthAdvancedOptions, getTrustedOrigins } from "../auth/options";
import { envSchema } from "../utils/env";

const scriptEnv = getScriptEnv();
const env = envSchema.parse({
  ...scriptEnv,
  BETTER_AUTH_SECRET:
    scriptEnv.BETTER_AUTH_SECRET ?? "dev-secret-min-32-characters-long!!",
});

const pool = new Pool({
  connectionString: scriptEnv.DATABASE_URL,
});
const db = drizzle({ client: pool });

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(env),
  advanced: getAuthAdvancedOptions(env),
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    emailOTP({
      disableSignUp: true,
      sendVerificationOTP: async () => {},
    }),
  ],
});
