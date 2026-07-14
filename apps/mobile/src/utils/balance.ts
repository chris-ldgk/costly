import type { BalanceResult } from "../lib/purchases";
import { formatEur } from "./format";

export function getBalanceText(balance: BalanceResult) {
  const { netCentsUserBOwesUserA, userA, userB } = balance;

  if (netCentsUserBOwesUserA === 0) {
    return "All settled ✓";
  }

  if (netCentsUserBOwesUserA > 0) {
    return `${userB.name} owes ${userA.name} ${formatEur(netCentsUserBOwesUserA)}`;
  }

  return `${userA.name} owes ${userB.name} ${formatEur(Math.abs(netCentsUserBOwesUserA))}`;
}
