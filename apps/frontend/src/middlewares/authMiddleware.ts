import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { withRpc, toPlainValue } from "#/utils/disposable";
import { libMiddleware } from "./libMiddleware";

export const authMiddleware = createMiddleware({ type: "function" })
  .middleware([libMiddleware])
  .server(async ({ next, context }) => {
    const cookieHeader = getRequestHeader("cookie") ?? null;
    const user = await withRpc(
      context.lib.api.getSession(cookieHeader),
      (session) => {
        if (!session?.user) {
          throw new Error("Unauthorized");
        }
        return toPlainValue(session.user);
      },
    );

    return next({
      context: {
        user,
      },
    });
  });
