import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { expo } from "@better-auth/expo";
import { emailOTP } from "better-auth/plugins";
import type { Lib } from "../utils/lib";
import { authSchema } from "../schema";
import { parseAllowedUsers } from "./allowed-users";
import { sendOtpEmail } from "../emails/send-otp";
import { getAuthAdvancedOptions, getTrustedOrigins } from "./options";

const OTP_EXPIRES_MINUTES = 5;

export function createAuth(lib: Lib) {
  const { env, db } = lib;
  const allowedEmails = new Set(
    parseAllowedUsers(env.ALLOWED_USERS).map((u) => u.email.toLowerCase()),
  );

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: getTrustedOrigins(env),
    advanced: getAuthAdvancedOptions(env),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      expo(),
      emailOTP({
        disableSignUp: true,
        expiresIn: OTP_EXPIRES_MINUTES * 60,
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== "sign-in") {
            return;
          }

          if (!allowedEmails.has(email.toLowerCase())) {
            throw new Error("Email not allowed");
          }

          console.log(`[Costly] Sign-in OTP for ${email}: ${otp}`);

          if (env.NODE_ENV === "development") {
            return;
          }

          if (!env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is required to send OTP emails");
          }

          await sendOtpEmail({
            apiKey: env.RESEND_API_KEY,
            from: env.RESEND_FROM_EMAIL,
            to: email,
            otp,
            expiresMinutes: OTP_EXPIRES_MINUTES,
          });
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
