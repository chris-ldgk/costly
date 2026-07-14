import { createMiddleware } from "hono/factory";
import { createAuth } from "../auth";
import type { Lib } from "../utils/lib";
import type { ApiBindings } from "../utils/bindings";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionVariables = {
  lib: Lib;
  user: SessionUser;
  session: NonNullable<
    Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>
  >["session"];
};

export const sessionMiddleware = createMiddleware<{
  Bindings: ApiBindings;
  Variables: { lib: Lib; user?: SessionUser; session?: SessionVariables["session"] };
}>(async (c, next) => {
  const lib = c.get("lib");
  const auth = createAuth(lib);
  const cookieHeader = c.req.header("cookie") ?? null;
  const headers = new Headers();
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const result = await auth.api.getSession({ headers });
  if (result?.user) {
    c.set("user", result.user as SessionUser);
    c.set("session", result.session);
  }

  await next();
});

export const requireSession = createMiddleware<{
  Bindings: ApiBindings;
  Variables: SessionVariables;
}>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});
