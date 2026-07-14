import type { Lib } from "../utils/lib";
import { desc, eq, isNull } from "drizzle-orm";
import {
  createPurchaseInputSchema,
  type CreatePurchaseInput,
  type UpdatePurchaseInput,
} from "../schema";

export async function createPurchase(
  lib: Lib,
  userId: string,
  input: CreatePurchaseInput,
) {
  const data = createPurchaseInputSchema.parse(input);
  const [purchase] = await lib.db
    .insert(lib.schema.purchases)
    .values({
      name: data.name,
      amountCents: data.amountCents,
      partnerSharePercent: data.partnerSharePercent,
      purchasedAt: data.purchasedAt,
      createdByUserId: userId,
    })
    .returning();
  return purchase;
}

export async function getPurchases(lib: Lib) {
  return lib.db.query.purchases.findMany({
    with: {
      createdBy: true,
      settlement: true,
    },
    orderBy: (purchases, { desc }) => [desc(purchases.createdAt)],
  });
}

export async function getPurchase(lib: Lib, purchaseId: string) {
  const purchase = await lib.db.query.purchases.findFirst({
    where: {
      id: purchaseId,
    },
    with: {
      createdBy: true,
      settlement: true,
    },
  });
  if (!purchase) {
    throw new Error("Purchase not found");
  }
  return purchase;
}

export async function updatePurchase(
  lib: Lib,
  purchaseId: string,
  input: UpdatePurchaseInput,
) {
  const data = createPurchaseInputSchema.parse(input);

  const [existing] = await lib.db
    .select({ id: lib.schema.purchases.id })
    .from(lib.schema.purchases)
    .where(eq(lib.schema.purchases.id, purchaseId))
    .limit(1);

  if (!existing) {
    throw new Error("Purchase not found");
  }

  await lib.db
    .update(lib.schema.purchases)
    .set({
      name: data.name,
      amountCents: data.amountCents,
      partnerSharePercent: data.partnerSharePercent,
      purchasedAt: data.purchasedAt,
    })
    .where(eq(lib.schema.purchases.id, purchaseId));

  return getPurchase(lib, purchaseId);
}

export async function deletePurchase(lib: Lib, purchaseId: string) {
  const [existing] = await lib.db
    .select({ id: lib.schema.purchases.id })
    .from(lib.schema.purchases)
    .where(eq(lib.schema.purchases.id, purchaseId))
    .limit(1);

  if (!existing) {
    throw new Error("Purchase not found");
  }

  await lib.db
    .delete(lib.schema.purchases)
    .where(eq(lib.schema.purchases.id, purchaseId));

  return { id: purchaseId };
}

export type BalanceResult = {
  userA: { id: string; name: string; email: string };
  userB: { id: string; name: string; email: string };
  /** Positive = userB owes userA; negative = userA owes userB; zero = settled */
  netCentsUserBOwesUserA: number;
  lastSettlement: {
    settledAt: Date;
    settledByName: string;
  } | null;
};

export async function getBalance(lib: Lib): Promise<BalanceResult> {
  const users = await lib.db.query.user.findMany();
  if (users.length !== 2) {
    throw new Error("Expected exactly two users");
  }

  const sorted = users.sort((a, b) => a.email.localeCompare(b.email));
  const userA = sorted[0]!;
  const userB = sorted[1]!;

  const unsettled = await lib.db
    .select()
    .from(lib.schema.purchases)
    .where(isNull(lib.schema.purchases.settlementId));

  let netCentsUserBOwesUserA = 0;

  for (const purchase of unsettled) {
    const partnerOwes =
      (purchase.amountCents * purchase.partnerSharePercent) / 100;
    if (purchase.createdByUserId === userA.id) {
      netCentsUserBOwesUserA += partnerOwes;
    } else if (purchase.createdByUserId === userB.id) {
      netCentsUserBOwesUserA -= partnerOwes;
    }
  }

  const [latestSettlement] = await lib.db
    .select()
    .from(lib.schema.settlements)
    .orderBy(desc(lib.schema.settlements.settledAt))
    .limit(1);

  let lastSettlement: BalanceResult["lastSettlement"] = null;
  if (latestSettlement) {
    const [settledBy] = await lib.db
      .select({ name: lib.schema.user.name })
      .from(lib.schema.user)
      .where(eq(lib.schema.user.id, latestSettlement.settledByUserId))
      .limit(1);
    lastSettlement = {
      settledAt: latestSettlement.settledAt,
      settledByName: settledBy?.name ?? "Unknown",
    };
  }

  return {
    userA: { id: userA.id, name: userA.name, email: userA.email },
    userB: { id: userB.id, name: userB.name, email: userB.email },
    netCentsUserBOwesUserA: Math.round(netCentsUserBOwesUserA),
    lastSettlement,
  };
}

export async function settleAllPurchases(lib: Lib, userId: string) {
  const [settlement] = await lib.db
    .insert(lib.schema.settlements)
    .values({ settledByUserId: userId })
    .returning();

  if (!settlement) {
    throw new Error("Failed to create settlement");
  }

  await lib.db
    .update(lib.schema.purchases)
    .set({ settlementId: settlement.id })
    .where(isNull(lib.schema.purchases.settlementId));

  return settlement;
}
