import { Resend } from "resend";
import { MagicLinkEmail } from "./magic-link";

export type SendMagicLinkEmailInput = {
  apiKey: string;
  from: string;
  to: string;
  url: string;
};

export async function sendMagicLinkEmail({
  apiKey,
  from,
  to,
  url,
}: SendMagicLinkEmailInput) {
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Your Costly sign-in link",
    react: MagicLinkEmail({ url }),
  });

  if (error) {
    throw new Error(`Failed to send magic link email: ${error.message}`);
  }

  return data;
}
