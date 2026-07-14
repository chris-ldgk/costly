import { Resend } from "resend";
import { OtpEmail } from "./otp";

export type SendOtpEmailInput = {
  apiKey: string;
  from: string;
  to: string;
  otp: string;
  expiresMinutes?: number;
};

export async function sendOtpEmail({
  apiKey,
  from,
  to,
  otp,
  expiresMinutes,
}: SendOtpEmailInput) {
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Your Costly sign-in code",
    react: OtpEmail({ otp, expiresMinutes }),
  });

  if (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }

  return data;
}
