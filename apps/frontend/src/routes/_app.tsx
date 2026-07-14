import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "@costly/components";
import { BottomTabNav } from "#/components/BottomTabNav";
import { getSession } from "#/lib/session";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { user } = await getSession();
    if (!user) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- router redirect
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  component: AppLayout,
});

function AppLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    await router.invalidate();
    await router.navigate({ to: "/login" });
  }

  return (
    <div className="min-h-dvh bg-neutral-50 pb-24 pt-[env(safe-area-inset-top)]">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Costly</h1>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
          <Button
            variant="neutral-tertiary"
            size="small"
            onClick={() => {
              void handleSignOut();
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <Outlet />

      <BottomTabNav />
    </div>
  );
}
