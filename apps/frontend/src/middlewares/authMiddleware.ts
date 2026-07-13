import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { libMiddleware } from "./libMiddleware";

export const authMiddleware = createMiddleware({ type: "function" })
  .middleware([libMiddleware])
  .server(async ({ next, context }) => {
    const cookieHeader = getRequestHeader("cookie") ?? null;
    const session = await context.lib.api.getSession(cookieHeader);

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    return next({
      context: {
        user: session.user,
      },
    });
  });
