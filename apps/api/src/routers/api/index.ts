import { Hono } from "hono";
import { cors } from "hono/cors";
import { libMiddleware } from "../../middlewares/lib";
import { createAuth } from "../../auth";
import { v1Router } from "./v1";

export const apiRouter = new Hono()
  .use(libMiddleware)
  .use(async (c, next) => {
    const lib = c.get("lib");
    const { env } = lib;
    const middleware = cors({
      origin: env.CORS_ORIGINS,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    });
    return middleware(c, next);
  })
  .on(["GET", "POST"], "/auth/*", (c) => {
    const auth = createAuth(c.get("lib"));
    return auth.handler(c.req.raw);
  })
  .route("/v1", v1Router);

export type ApiRouter = typeof apiRouter;
