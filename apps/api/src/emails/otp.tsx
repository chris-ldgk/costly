import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

export type OtpEmailProps = {
  otp: string;
  expiresMinutes?: number;
};

export function OtpEmail({ otp, expiresMinutes = 5 }: OtpEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your Costly sign-in code: {otp}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Sign in to Costly</Heading>
          <Text style={text}>
            Enter this one-time code to sign in. It expires in {expiresMinutes}{" "}
            minutes.
          </Text>
          <Section style={codeSection}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={footer}>
            If you did not request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OtpEmail;

const body = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "32px 28px",
  borderRadius: "8px",
  maxWidth: "480px",
};

const heading = {
  color: "#111111",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "0 0 16px",
};

const text = {
  color: "#444444",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const codeSection = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const code = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  color: "#111111",
  display: "inline-block",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "0.25em",
  lineHeight: "1",
  margin: "0",
  padding: "20px 28px",
};

const footer = {
  color: "#888888",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "24px 0 0",
};
