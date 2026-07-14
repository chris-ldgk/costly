import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { withRpc, toPlainValue } from "#/utils/disposable";
import { libMiddleware } from "./libMiddleware";

/** Optional auth — returns user if logged in, null otherwise */
export const optionalAuthMiddleware = createMiddleware({ type: "function" })
  .middleware([libMiddleware])
  .server(async ({ next, context }) => {
    const cookieHeader = getRequestHeader("cookie") ?? null;
    const user = await withRpc(
      context.lib.api.getSession(cookieHeader),
      (session) => (session?.user ? toPlainValue(session.user) : null),
    );

    return next({
      context: {
        user,
      },
    });
  });
