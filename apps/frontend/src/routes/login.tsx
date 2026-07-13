import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button, TextField } from "@costly/components";
import { authClient } from "#/lib/auth-client";
import { publicEnv } from "#/utils/env.ts";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { getSessionFn } = await import("#/handlers/purchases");
    const { user } = await getSessionFn();
    if (user) {
      // TanStack Router redirect is not an Error instance by design
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- router redirect
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const { error: signInError } = await authClient.signIn.magicLink({
      email,
      callbackURL: new URL(publicEnv.VITE_PUBLIC_URL).toString(),
    });

    if (signInError) {
      setStatus("error");
      setError(signInError.message ?? "Could not send magic link");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-50 px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-neutral-900">Costly</h1>
        <p className="mb-6 text-sm text-neutral-600">
          Sign in with a magic link sent to your email.
        </p>

        {status === "sent" ? (
          <p className="text-sm text-neutral-700">
            Check your email for a sign-in link. In development, the link is
            logged in the API console.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(e);
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
              {status === "loading" ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
