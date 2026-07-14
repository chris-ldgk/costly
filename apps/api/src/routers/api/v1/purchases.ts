import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  createPurchase,
  getBalance,
  getPurchase,
  getPurchases,
  settleAllPurchases,
  updatePurchase,
} from "../../../handlers/purchases";
import { sessionMiddleware } from "../../../middlewares/session";
import type { Lib } from "../../../utils/lib";
import type { SessionUser } from "../../../middlewares/session";
import {
  createPurchaseInputSchema,
  purchaseListQuerySchema,
} from "../../../schema";

const purchaseIdParamSchema = z.object({
  purchaseId: z.string().min(1),
});

export const purchasesRouter = new Hono<{
  Variables: { lib: Lib; user: SessionUser };
}>()
  .use(sessionMiddleware)
  .get("/purchases", zValidator("query", purchaseListQuerySchema), async (c) => {
    const lib = c.get("lib");
    const query = c.req.valid("query");
    return c.json(await getPurchases(lib, query));
  })
  .post(
    "/purchases",
    zValidator("json", createPurchaseInputSchema),
    async (c) => {
      const lib = c.get("lib");
      const user = c.get("user");
      const input = c.req.valid("json");
      const purchase = await createPurchase(lib, user.id, input);
      return c.json(purchase, 201);
    },
  )
  .post("/purchases/settle-all", async (c) => {
    const lib = c.get("lib");
    const user = c.get("user");
    const settlement = await settleAllPurchases(lib, user.id);
    return c.json(settlement);
  })
  .get("/balance", async (c) => {
    const lib = c.get("lib");
    return c.json(await getBalance(lib));
  })
  .get(
    "/purchases/:purchaseId",
    zValidator("param", purchaseIdParamSchema),
    async (c) => {
      const lib = c.get("lib");
      const { purchaseId } = c.req.valid("param");
      try {
        return c.json(await getPurchase(lib, purchaseId));
      } catch {
        return c.json({ error: "Purchase not found" }, 404);
      }
    },
  )
  .put(
    "/purchases/:purchaseId",
    zValidator("param", purchaseIdParamSchema),
    zValidator("json", createPurchaseInputSchema),
    async (c) => {
      const lib = c.get("lib");
      const { purchaseId } = c.req.valid("param");
      const input = c.req.valid("json");
      try {
        return c.json(await updatePurchase(lib, purchaseId, input));
      } catch {
        return c.json({ error: "Purchase not found" }, 404);
      }
    },
  );
