import { getLib } from "#/utils/lib.ts";
import { createMiddleware } from "@tanstack/react-start";

export const libMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    const cfEnv = await import("cloudflare:workers").then((m) => m.env);
    const lib = getLib(cfEnv);

    return next({
      context: {
        lib,
      },
    });
  },
);
