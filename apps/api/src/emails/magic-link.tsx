import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

export type MagicLinkEmailProps = {
  url: string;
  expiresMinutes?: number;
};

export function MagicLinkEmail({
  url,
  expiresMinutes = 5,
}: MagicLinkEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your Costly sign-in link</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Sign in to Costly</Heading>
          <Text style={text}>
            Tap the button below to sign in. This link expires in{" "}
            {expiresMinutes} minutes and can only be used once.
          </Text>
          <Section style={buttonSection}>
            <Button href={url} style={button}>
              Sign in
            </Button>
          </Section>
          <Text style={text}>
            If the button does not work, copy and paste this link into your
            browser:
          </Text>
          <Link href={url} style={link}>
            {url}
          </Link>
          <Text style={footer}>
            If you did not request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MagicLinkEmail;

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

const buttonSection = {
  margin: "24px 0",
};

const button = {
  backgroundColor: "#111111",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "1",
  padding: "14px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const link = {
  color: "#2563eb",
  fontSize: "13px",
  lineHeight: "20px",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#888888",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "24px 0 0",
};
