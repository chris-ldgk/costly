import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dialog } from "@costly/components";
import { useState } from "react";
import { getBalance, settleAllPurchases } from "#/lib/purchases";
import { getBalanceText } from "#/utils/balance";
import { formatDate } from "#/utils/format";

export const Route = createFileRoute("/_app/")({
  component: BalancePage,
});

function BalancePage() {
  const queryClient = useQueryClient();
  const [settleOpen, setSettleOpen] = useState(false);

  const { data: balance } = useQuery({
    queryKey: ["balance"],
    queryFn: getBalance,
  });

  const settleMutation = useMutation({
    mutationFn: settleAllPurchases,
    onSuccess: async () => {
      setSettleOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });

  if (!balance) {
    return (
      <main className="mx-auto max-w-lg px-4 py-4">
        <p className="text-sm text-neutral-500">Loading balance…</p>
      </main>
    );
  }

  const balanceText = getBalanceText(balance);

  return (
    <>
      <main className="mx-auto max-w-lg space-y-4 px-4 py-4">
        <h2 className="text-sm font-medium text-neutral-700">
          Current balance
        </h2>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-2xl font-semibold text-neutral-900">
            {balanceText}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {balance.lastSettlement
              ? `Last settled ${formatDate(balance.lastSettlement.settledAt)} by ${balance.lastSettlement.settledByName}`
              : "No settlements yet"}
          </p>
        </section>

        <Button
          variant="neutral-secondary"
          size="large"
          className="min-h-11 w-full"
          onClick={() => setSettleOpen(true)}
          disabled={balance.netCentsUserBOwesUserA === 0}
        >
          Settle all purchases
        </Button>
      </main>

      <Dialog
        open={settleOpen}
        onOpenChange={setSettleOpen}
        className="p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <Dialog.Content className="w-full max-w-sm gap-4 p-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Settle all purchases?
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            This marks every open purchase as settled. Your balance will reset
            to €0.00.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="neutral-secondary"
              className="min-h-11 flex-1"
              onClick={() => setSettleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="brand-primary"
              className="min-h-11 flex-1"
              disabled={settleMutation.isPending}
              onClick={() => settleMutation.mutate()}
            >
              {settleMutation.isPending ? "Settling…" : "Settle all"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
