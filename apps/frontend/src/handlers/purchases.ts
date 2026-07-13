import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "#/middlewares/authMiddleware";
import { optionalAuthMiddleware } from "#/middlewares/optionalAuthMiddleware";
import { plain } from "#/utils/disposable";

const createPurchaseInputSchema = z.object({
  name: z.string().min(1),
  amountCents: z.number().int().positive(),
  partnerSharePercent: z.number().int().min(0).max(100),
  purchasedAt: z.coerce.date(),
});

export const getSessionFn = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(({ context }) => {
    return plain({ user: context.user });
  });

export const createPurchaseFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createPurchaseInputSchema)
  .handler(async ({ context, data }) => {
    const purchase = await context.lib.api.createPurchase(context.user.id, {
      name: data.name,
      amountCents: data.amountCents,
      partnerSharePercent: data.partnerSharePercent,
      purchasedAt: data.purchasedAt,
    });
    return plain(purchase);
  });

const purchaseIdSchema = z.object({
  purchaseId: z.string().min(1),
});

export const getPurchaseFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(purchaseIdSchema)
  .handler(async ({ context, data }) => {
    const purchase = await context.lib.api.getPurchase(data.purchaseId);
    return plain(purchase);
  });

export const updatePurchaseFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    purchaseIdSchema.extend({
      name: z.string().min(1),
      amountCents: z.number().int().positive(),
      partnerSharePercent: z.number().int().min(0).max(100),
      purchasedAt: z.coerce.date(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { purchaseId, ...input } = data;
    const purchase = await context.lib.api.updatePurchase(purchaseId, input);
    return plain(purchase);
  });

export const getPurchasesFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const purchases = await context.lib.api.getPurchases();
    return plain(purchases);
  });

export const getBalanceFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const balance = await context.lib.api.getBalance();
    return plain(balance);
  });

export const settleAllPurchasesFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const settlement = await context.lib.api.settleAllPurchases(
      context.user.id,
    );
    return plain(settlement);
  });
