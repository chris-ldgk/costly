import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "#/middlewares/authMiddleware";
import { optionalAuthMiddleware } from "#/middlewares/optionalAuthMiddleware";
import { rpcPlain } from "#/utils/disposable";

const createPurchaseInputSchema = z.object({
  name: z.string().min(1),
  amountCents: z.number().int().positive(),
  partnerSharePercent: z.number().int().min(0).max(100),
  purchasedAt: z.coerce.date(),
});

export const getSessionFn = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(({ context }) => {
    return { user: context.user };
  });

export const createPurchaseFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createPurchaseInputSchema)
  .handler(async ({ context, data }) => {
    return rpcPlain(
      context.lib.api.createPurchase(context.user.id, {
        name: data.name,
        amountCents: data.amountCents,
        partnerSharePercent: data.partnerSharePercent,
        purchasedAt: data.purchasedAt,
      }),
    );
  });

const purchaseIdSchema = z.object({
  purchaseId: z.string().min(1),
});

export const getPurchaseFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(purchaseIdSchema)
  .handler(async ({ context, data }) => {
    return rpcPlain(context.lib.api.getPurchase(data.purchaseId));
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
    return rpcPlain(context.lib.api.updatePurchase(purchaseId, input));
  });

export const getPurchasesFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return rpcPlain(context.lib.api.getPurchases());
  });

export const getBalanceFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return rpcPlain(context.lib.api.getBalance());
  });

export const settleAllPurchasesFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return rpcPlain(
      context.lib.api.settleAllPurchases(context.user.id),
    );
  });
