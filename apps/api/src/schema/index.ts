import { defineRelations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/zod";
import { z } from "zod";
import {
  account,
  session,
  user,
  verification,
} from "./auth";
import { purchases, settlements } from "./purchases";

export {
  user,
  session,
  account,
  verification,
};

export const authSchema = {
  user,
  session,
  account,
  verification,
} as const;

export const schema = {
  ...authSchema,
  settlements,
  purchases,
} as const;

export type Schema = typeof schema;

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
    purchases: r.many.purchases({
      from: r.user.id,
      to: r.purchases.createdByUserId,
    }),
    settlements: r.many.settlements({
      from: r.user.id,
      to: r.settlements.settledByUserId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  purchases: {
    createdBy: r.one.user({
      from: r.purchases.createdByUserId,
      to: r.user.id,
    }),
    settlement: r.one.settlements({
      from: r.purchases.settlementId,
      to: r.settlements.id,
      optional: true,
    }),
  },
  settlements: {
    settledBy: r.one.user({
      from: r.settlements.settledByUserId,
      to: r.user.id,
    }),
    purchases: r.many.purchases({
      from: r.settlements.id,
      to: r.purchases.settlementId,
    }),
  },
}));

export const purchaseSelectSchema = createSelectSchema(purchases);
export type PurchaseSelect = z.infer<typeof purchaseSelectSchema>;
export const purchaseInsertSchema = createInsertSchema(purchases);
export type PurchaseInsert = z.infer<typeof purchaseInsertSchema>;
export const purchaseUpdateSchema = createUpdateSchema(purchases);
export type PurchaseUpdate = z.infer<typeof purchaseUpdateSchema>;

export const settlementSelectSchema = createSelectSchema(settlements);
export type SettlementSelect = z.infer<typeof settlementSelectSchema>;

export const createPurchaseInputSchema = z.object({
  name: z.string().min(1),
  amountCents: z.number().int().positive(),
  partnerSharePercent: z.number().int().min(0).max(100),
  purchasedAt: z.coerce.date(),
});
export type CreatePurchaseInput = z.infer<typeof createPurchaseInputSchema>;
export type UpdatePurchaseInput = CreatePurchaseInput;

export const PURCHASES_PAGE_SIZE = 20;

export const purchaseListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(PURCHASES_PAGE_SIZE),
  offset: z.coerce.number().int().min(0).default(0),
});
export type PurchaseListQuery = z.infer<typeof purchaseListQuerySchema>;
