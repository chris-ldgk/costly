import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink } from "better-auth/plugins";
import { getScriptEnv } from "../utils/wrangler-vars";

const scriptEnv = getScriptEnv();

const pool = new Pool({
  connectionString: scriptEnv.DATABASE_URL,
});
const db = drizzle({ client: pool });

export const auth = betterAuth({
  baseURL: scriptEnv.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    scriptEnv.BETTER_AUTH_SECRET ?? "dev-secret-min-32-characters-long!!",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    magicLink({
      disableSignUp: true,
      sendMagicLink: () => {},
    }),
  ],
});
