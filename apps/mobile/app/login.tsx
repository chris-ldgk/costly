import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Button, TextField } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { colors, radii, spacing } from "@/theme";

type Step = "email" | "otp";

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp() {
    setStatus("loading");
    setError(null);

    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    if (sendError) {
      setStatus("idle");
      setError(sendError.message ?? "Could not send sign-in code");
      return;
    }

    setStatus("idle");
    setStep("otp");
  }

  async function handleVerifyOtp() {
    setStatus("loading");
    setError(null);

    const { error: signInError } = await authClient.signIn.emailOtp({
      email,
      otp,
    });

    if (signInError) {
      setStatus("idle");
      setError(signInError.message ?? "Invalid or expired code");
      return;
    }

    setStatus("idle");
    router.replace("/(tabs)");
  }

  function handleChangeEmail() {
    setStep("email");
    setOtp("");
    setError(null);
    setStatus("idle");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Costly</Text>
          <Text style={styles.subtitle}>
            {step === "email"
              ? "Sign in with a one-time code sent to your email."
              : `Enter the code sent to ${email}.`}
          </Text>

          {step === "email" ? (
            <View style={styles.form}>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={status === "loading" ? "Sending…" : "Send code"}
                onPress={() => void handleSendOtp()}
                loading={status === "loading"}
                disabled={!email.trim()}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <TextField
                label="Sign-in code"
                value={otp}
                onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
                placeholder="123456"
                keyboardType="numeric"
                maxLength={6}
              />
              <Text style={styles.hint}>
                In development, the code is logged in the API console.
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={status === "loading" ? "Signing in…" : "Sign in"}
                onPress={() => void handleVerifyOtp()}
                loading={status === "loading"}
                disabled={otp.length < 6}
              />
              <Button
                title="Use a different email"
                variant="tertiary"
                onPress={handleChangeEmail}
                disabled={status === "loading"}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { fontSize: 24, fontWeight: "600", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm },
  form: { gap: spacing.md },
  hint: { fontSize: 12, color: colors.textMuted },
  error: { fontSize: 14, color: colors.error },
});
