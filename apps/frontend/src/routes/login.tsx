import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button, TextField } from "@costly/components";
import { authClient } from "#/lib/auth-client";
import { getSession } from "#/lib/session";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { user } = await getSession();
    if (user) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- router redirect
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

type Step = "email" | "otp";

function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
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

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
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

    await router.invalidate();
    await router.navigate({ to: "/" });
  }

  function handleChangeEmail() {
    setStep("email");
    setOtp("");
    setError(null);
    setStatus("idle");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-50 px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-neutral-900">Costly</h1>
        <p className="mb-6 text-sm text-neutral-600">
          {step === "email"
            ? "Sign in with a one-time code sent to your email."
            : `Enter the code sent to ${email}.`}
        </p>

        {step === "email" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendOtp(e);
            }}
            className="flex flex-col gap-4"
          >
            <TextField label="Email" className="w-full">
              <TextField.Input
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </TextField>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="brand-primary"
              size="large"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending…" : "Send code"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleVerifyOtp(e);
            }}
            className="flex flex-col gap-4"
          >
            <TextField label="Sign-in code" className="w-full">
              <TextField.Input
                type="text"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
            </TextField>

            <p className="text-xs text-neutral-500">
              In development, the code is logged in the API console.
            </p>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="brand-primary"
              size="large"
              className="w-full"
              disabled={status === "loading" || otp.length < 6}
            >
              {status === "loading" ? "Signing in…" : "Sign in"}
            </Button>

            <Button
              type="button"
              variant="neutral-tertiary"
              size="medium"
              className="w-full"
              disabled={status === "loading"}
              onClick={handleChangeEmail}
            >
              Use a different email
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
