import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { authProxyMiddleware } from "./middlewares/authProxyMiddleware";
import { libMiddleware } from "./middlewares/libMiddleware";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [authProxyMiddleware, csrfMiddleware, libMiddleware],
  };
});
