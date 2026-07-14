import { appRouter } from "./routers";
import { getLib } from "./utils/lib";
import type { ApiBindings } from "./utils/bindings";
import { seedUsers } from "./handlers/seed-users";

export default {
  fetch: appRouter.fetch,
  scheduled(_controller, env, ctx) {
    const lib = getLib(env as unknown as ApiBindings);
    ctx.waitUntil(
      seedUsers(lib).catch((err: unknown) => {
        console.error("[seed] Failed to seed users", err);
      }),
    );
  },
} satisfies ExportedHandler<CloudflareBindings>;
