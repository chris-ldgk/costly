import { Hono } from "hono";
import type { ApiBindings } from "../../../utils/bindings";
import type { SessionVariables } from "../../../middlewares/session";
import { settleAllPurchases } from "../../../handlers/purchases";
import { handleHandlerError } from "./utils";

export const settlementsRouter = new Hono<{
  Bindings: ApiBindings;
  Variables: SessionVariables;
}>().post("/", async (c) => {
  const lib = c.get("lib");
  const user = c.get("user");
  try {
    const settlement = await settleAllPurchases(lib, user.id);
    return c.json(settlement, 201);
  } catch (err) {
    return handleHandlerError(c, err);
  }
});
