import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { libMiddleware } from "./libMiddleware";

/** Optional auth — returns user if logged in, null otherwise */
export const optionalAuthMiddleware = createMiddleware({ type: "function" })
  .middleware([libMiddleware])
  .server(async ({ next, context }) => {
    const cookieHeader = getRequestHeader("cookie") ?? null;
    const session = await context.lib.api.getSession(cookieHeader);

    return next({
      context: {
        user: session?.user ?? null,
      },
    });
  });
