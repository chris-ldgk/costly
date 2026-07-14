import { authClient } from "#/lib/auth-client";

export async function getSession() {
  const { data } = await authClient.getSession();
  return { user: data?.user ?? null };
}
