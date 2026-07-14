import { createAuthenticatedClient, unwrapJson } from "./api-client";

export const PURCHASES_PAGE_SIZE = 20;

export type BalanceResult = {
  userA: { id: string; name: string; email: string };
  userB: { id: string; name: string; email: string };
  netCentsUserBOwesUserA: number;
  lastSettlement: {
    settledAt: string;
    settledByName: string;
  } | null;
};

export type Purchase = {
  id: string;
  name: string;
  amountCents: number;
  partnerSharePercent: number;
  purchasedAt: string;
  settlementId: string | null;
  createdByUserId: string;
  createdBy?: { id: string; name: string; email: string } | null;
  settlement?: { id: string; settledAt: string } | null;
};

export type PurchaseListResult = {
  purchases: Purchase[];
  hasMore: boolean;
};

export type CreatePurchaseInput = {
  name: string;
  amountCents: number;
  partnerSharePercent: number;
  purchasedAt: Date;
};

function getClient() {
  return createAuthenticatedClient();
}

export async function fetchBalance(): Promise<BalanceResult> {
  const client = getClient();
  const res = await client.api.v1.balance.$get();
  return unwrapJson<BalanceResult>(res);
}

export async function fetchPurchases(query: {
  limit?: number;
  offset?: number;
}): Promise<PurchaseListResult> {
  const client = getClient();
  const res = await client.api.v1.purchases.$get({
    query: {
      limit: query.limit ?? PURCHASES_PAGE_SIZE,
      offset: query.offset ?? 0,
    },
  });
  return unwrapJson<PurchaseListResult>(res);
}

export async function fetchPurchase(purchaseId: string): Promise<Purchase> {
  const client = getClient();
  const res = await client.api.v1.purchases[":purchaseId"].$get({
    param: { purchaseId },
  });
  return unwrapJson<Purchase>(res);
}

export async function createPurchase(
  input: CreatePurchaseInput,
): Promise<Purchase> {
  const client = getClient();
  const res = await client.api.v1.purchases.$post({ json: input });
  return unwrapJson<Purchase>(res);
}

export async function updatePurchase(
  purchaseId: string,
  input: CreatePurchaseInput,
): Promise<Purchase> {
  const client = getClient();
  const res = await client.api.v1.purchases[":purchaseId"].$put({
    param: { purchaseId },
    json: input,
  });
  return unwrapJson<Purchase>(res);
}

export async function settleAllPurchases(): Promise<{ id: string }> {
  const client = getClient();
  const res = await client.api.v1.settlements.$post();
  return unwrapJson<{ id: string }>(res);
}
