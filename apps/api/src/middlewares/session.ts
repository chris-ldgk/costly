import { createMiddleware } from "hono/factory";
import { createAuth } from "../auth";
import type { Lib } from "../utils/lib";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const sessionMiddleware = createMiddleware<{
  Variables: { lib: Lib; user: SessionUser };
}>(async (c, next) => {
  const lib = c.get("lib");
  const auth = createAuth(lib);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  await next();
});
