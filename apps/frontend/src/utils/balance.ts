import type { getBalanceFn } from "#/handlers/purchases";
import { formatEur } from "#/utils/format";

export function getBalanceText(
  balance: Awaited<ReturnType<typeof getBalanceFn>>,
) {
  const { netCentsUserBOwesUserA, userA, userB } = balance;

  if (netCentsUserBOwesUserA === 0) {
    return "All settled ✓";
  }

  if (netCentsUserBOwesUserA > 0) {
    return `${userB.name} owes ${userA.name} ${formatEur(netCentsUserBOwesUserA)}`;
  }

  return `${userA.name} owes ${userB.name} ${formatEur(Math.abs(netCentsUserBOwesUserA))}`;
}
