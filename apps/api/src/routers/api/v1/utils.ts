import type { Context } from "hono";

export function handleHandlerError(
  c: Pick<Context, "json">,
  err: unknown,
): Response {
  if (err instanceof Error) {
    if (err.message === "Purchase not found") {
      return c.json({ error: err.message }, 404);
    }
    return c.json({ error: err.message }, 400);
  }
  throw err;
}
