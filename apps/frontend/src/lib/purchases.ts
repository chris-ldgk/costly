import { apiClient } from "#/lib/apiClient";
import type { BalanceResult, CreatePurchaseInput } from "@costly/api";

export const PURCHASES_PAGE_SIZE = 20;

export type Purchase = {
  id: string;
  name: string;
  amountCents: number;
  partnerSharePercent: number;
  purchasedAt: string;
  settlementId: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string } | null;
  settlement: { id: string; settledAt: string } | null;
};

export type PurchaseListResult = {
  purchases: Purchase[];
  hasMore: boolean;
};

export type { BalanceResult };

type JsonResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

async function unwrap<T>(res: JsonResponse): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `API error: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function getPurchases(
  limit = PURCHASES_PAGE_SIZE,
  offset = 0,
): Promise<PurchaseListResult> {
  const res = await apiClient.api.v1.purchases.$get({
    query: { limit: String(limit), offset: String(offset) },
  });
  return unwrap<PurchaseListResult>(res);
}

export async function getPurchase(purchaseId: string): Promise<Purchase> {
  const res = await apiClient.api.v1.purchases[":purchaseId"].$get({
    param: { purchaseId },
  });
  return unwrap<Purchase>(res);
}

export async function createPurchase(input: CreatePurchaseInput): Promise<Purchase> {
  const res = await apiClient.api.v1.purchases.$post({
    json: {
      ...input,
      purchasedAt: input.purchasedAt.toISOString(),
    },
  });
  return unwrap<Purchase>(res);
}

export async function updatePurchase(
  purchaseId: string,
  input: CreatePurchaseInput,
): Promise<Purchase> {
  const res = await apiClient.api.v1.purchases[":purchaseId"].$put({
    param: { purchaseId },
    json: {
      ...input,
      purchasedAt: input.purchasedAt.toISOString(),
    },
  });
  return unwrap<Purchase>(res);
}

export async function getBalance(): Promise<BalanceResult> {
  const res = await apiClient.api.v1.balance.$get();
  return unwrap<BalanceResult>(res);
}

export async function settleAllPurchases() {
  const res = await apiClient.api.v1.purchases["settle-all"].$post();
  return unwrap(res);
}
