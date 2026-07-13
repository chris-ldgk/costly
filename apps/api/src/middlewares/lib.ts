import { createMiddleware } from "hono/factory";
import { getLib } from "../utils/lib";
import type { Lib } from "../utils/lib";
import type { ApiBindings } from "../utils/bindings";

export const libMiddleware = createMiddleware<{
  Bindings: ApiBindings;
  Variables: { lib: Lib };
}>(async (c, next) => {
  const lib = getLib(c.env);
  c.set("lib", lib);
  await next();
});
