import { Hono } from "hono";
import type { ApiBindings } from "../../../utils/bindings";
import type { SessionVariables } from "../../../middlewares/session";
import { getBalance } from "../../../handlers/purchases";
import { handleHandlerError } from "./utils";

export const balanceRouter = new Hono<{
  Bindings: ApiBindings;
  Variables: SessionVariables;
}>().get("/", async (c) => {
  const lib = c.get("lib");
  try {
    const balance = await getBalance(lib);
    return c.json(balance);
  } catch (err) {
    return handleHandlerError(c, err);
  }
});
