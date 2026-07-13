import { createMiddleware } from "@tanstack/react-start";

export const authProxyMiddleware = createMiddleware({ type: "request" })
  .server(async ({ next, request }) => {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/auth")) {
      const cfEnv = await import("cloudflare:workers").then((m) => m.env);
      return cfEnv.API.fetch(request);
    }

    return next();
  });
