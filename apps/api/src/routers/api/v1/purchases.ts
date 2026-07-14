import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { ApiBindings } from "../../../utils/bindings";
import type { SessionVariables } from "../../../middlewares/session";
import {
  createPurchase,
  getPurchase,
  getPurchases,
  updatePurchase,
} from "../../../handlers/purchases";
import {
  createPurchaseInputSchema,
  purchaseListQuerySchema,
} from "../../../schema";
import { z } from "zod";
import { handleHandlerError } from "./utils";

const purchaseIdParamSchema = z.object({
  purchaseId: z.string().min(1),
});

export const purchasesRouter = new Hono<{
  Bindings: ApiBindings;
  Variables: SessionVariables;
}>()
  .get("/", zValidator("query", purchaseListQuerySchema), async (c) => {
    const lib = c.get("lib");
    const query = c.req.valid("query");
    try {
      const result = await getPurchases(lib, query);
      return c.json(result);
    } catch (err) {
      return handleHandlerError(c, err);
    }
  })
  .post("/", zValidator("json", createPurchaseInputSchema), async (c) => {
    const lib = c.get("lib");
    const user = c.get("user");
    const input = c.req.valid("json");
    try {
      const purchase = await createPurchase(lib, user.id, input);
      return c.json(purchase, 201);
    } catch (err) {
      return handleHandlerError(c, err);
    }
  })
  .get("/:purchaseId", zValidator("param", purchaseIdParamSchema), async (c) => {
    const lib = c.get("lib");
    const { purchaseId } = c.req.valid("param");
    try {
      const purchase = await getPurchase(lib, purchaseId);
      return c.json(purchase);
    } catch (err) {
      return handleHandlerError(c, err);
    }
  })
  .put(
    "/:purchaseId",
    zValidator("param", purchaseIdParamSchema),
    zValidator("json", createPurchaseInputSchema),
    async (c) => {
      const lib = c.get("lib");
      const { purchaseId } = c.req.valid("param");
      const input = c.req.valid("json");
      try {
        const purchase = await updatePurchase(lib, purchaseId, input);
        return c.json(purchase);
      } catch (err) {
        return handleHandlerError(c, err);
      }
    },
  );
