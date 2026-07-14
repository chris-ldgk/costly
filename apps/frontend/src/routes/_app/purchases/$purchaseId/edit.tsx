import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Badge, Button, Dialog, TextField } from "@costly/components";
import {
  PartnerShareSlider,
  snapPartnerSharePercent,
} from "#/components/PartnerShareSlider";
import {
  deletePurchaseFn,
  getPurchaseFn,
  updatePurchaseFn,
} from "#/handlers/purchases";
import {
  formatCentsToEurInput,
  formatDateInput,
  parseEurToCents,
} from "#/utils/format";

export const Route = createFileRoute("/_app/purchases/$purchaseId/edit")({
  loader: async ({ params }) => {
    try {
      const purchase = await getPurchaseFn({
        data: { purchaseId: params.purchaseId },
      });
      return { purchase };
    } catch {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- router notFound
      throw notFound();
    }
  },
  component: EditPurchasePage,
});

function EditPurchasePage() {
  const { purchase } = Route.useLoaderData();
  const router = useRouter();
  const queryClient = useQueryClient();
  const updatePurchase = useServerFn(updatePurchaseFn);
  const deletePurchase = useServerFn(deletePurchaseFn);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: updatePurchase,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["balance"] });
      await router.navigate({ to: "/purchases" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchase,
    onSuccess: async () => {
      setDeleteOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["balance"] });
      await router.navigate({ to: "/purchases" });
    },
  });

  const form = useForm({
    defaultValues: {
      name: purchase.name,
      amount: formatCentsToEurInput(purchase.amountCents),
      partnerSharePercent: snapPartnerSharePercent(
        purchase.partnerSharePercent,
      ),
      purchasedAt: formatDateInput(purchase.purchasedAt),
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        data: {
          purchaseId: purchase.id,
          name: value.name.trim(),
          amountCents: parseEurToCents(value.amount),
          partnerSharePercent: value.partnerSharePercent,
          purchasedAt: new Date(value.purchasedAt),
        },
      });
    },
  });

  return (
    <>
      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-neutral-700">Edit purchase</h2>
          <Link to="/purchases">
            <Button variant="neutral-tertiary" size="small">
              Cancel
            </Button>
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <span>Paid by {purchase.createdBy?.name ?? "Unknown"}</span>
          <Badge variant={purchase.settlementId ? "neutral" : "warning"}>
            {purchase.settlementId ? "Settled" : "Open"}
          </Badge>
        </div>

        {purchase.settlementId ? (
          <p className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">
            This purchase is settled. Changes update the record only and do not
            affect the current balance.
          </p>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : "Name is required",
            }}
          >
            {(field) => (
              <TextField label="Purchase name" className="w-full">
                <TextField.Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Groceries"
                />
              </TextField>
            )}
          </form.Field>

          <form.Field name="amount">
            {(field) => (
              <TextField
                label="Amount (EUR)"
                helpText="What you paid in total"
                className="w-full"
              >
                <TextField.Input
                  inputMode="decimal"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="0,00"
                />
              </TextField>
            )}
          </form.Field>

          <form.Field name="partnerSharePercent">
            {(field) => (
              <PartnerShareSlider
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <form.Field name="purchasedAt">
            {(field) => (
              <TextField label="Purchase date" className="w-full">
                <input
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-full w-full border-none bg-transparent px-1 text-base font-body text-default-font outline-none"
                />
              </TextField>
            )}
          </form.Field>

          {mutation.isError ? (
            <p className="text-sm text-red-600" role="alert">
              Could not save purchase. Check the values and try again.
            </p>
          ) : null}

          <Button
            type="submit"
            variant="brand-primary"
            size="large"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <div className="mt-6 border-t border-neutral-200 pt-6">
          <Button
            type="button"
            variant="destructive-tertiary"
            size="large"
            className="w-full"
            onClick={() => setDeleteOpen(true)}
          >
            Delete purchase
          </Button>
        </div>
      </main>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        className="p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <Dialog.Content className="w-full max-w-sm gap-4 p-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Delete purchase?
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {purchase.settlementId
              ? "This will permanently remove this settled purchase from history."
              : "This will permanently remove this purchase and update the current balance."}
          </p>
          {deleteMutation.isError ? (
            <p className="text-sm text-red-600" role="alert">
              Could not delete purchase. Try again.
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button
              variant="neutral-secondary"
              className="min-h-11 flex-1"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive-primary"
              className="min-h-11 flex-1"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate({
                  data: { purchaseId: purchase.id },
                })
              }
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
