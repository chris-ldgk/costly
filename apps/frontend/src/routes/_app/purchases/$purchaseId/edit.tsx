import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Badge, Button, TextField } from "@costly/components";
import {
  getPurchase,
  updatePurchase,
  type Purchase,
} from "#/lib/purchases";
import {
  formatCentsToEurInput,
  formatDateInput,
  parseEurToCents,
} from "#/utils/format";

export const Route = createFileRoute("/_app/purchases/$purchaseId/edit")({
  component: EditPurchasePage,
});

function EditPurchasePage() {
  const { purchaseId } = Route.useParams();

  const { data: purchase, isError } = useQuery({
    queryKey: ["purchase", purchaseId],
    queryFn: () => getPurchase(purchaseId),
  });

  if (isError) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- router notFound
    throw notFound();
  }

  if (!purchase) {
    return (
      <main className="mx-auto max-w-lg px-4 py-4">
        <p className="text-sm text-neutral-500">Loading purchase…</p>
      </main>
    );
  }

  return <EditPurchaseForm purchase={purchase} purchaseId={purchaseId} />;
}

function EditPurchaseForm({
  purchase,
  purchaseId,
}: {
  purchase: Purchase;
  purchaseId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof updatePurchase>[1]) =>
      updatePurchase(purchaseId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["balance"] });
      await queryClient.invalidateQueries({ queryKey: ["purchase", purchaseId] });
      await router.navigate({ to: "/purchases" });
    },
  });

  const form = useForm({
    defaultValues: {
      name: purchase.name,
      amount: formatCentsToEurInput(purchase.amountCents),
      partnerSharePercent: String(purchase.partnerSharePercent),
      purchasedAt: formatDateInput(purchase.purchasedAt),
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        name: value.name.trim(),
        amountCents: parseEurToCents(value.amount),
        partnerSharePercent: Number.parseInt(value.partnerSharePercent, 10),
        purchasedAt: new Date(value.purchasedAt),
      });
    },
  });

  return (
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
            <TextField
              label="Partner's share (%)"
              helpText="How much of this cost is your partner's share"
              className="w-full"
            >
              <TextField.Input
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </TextField>
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
    </main>
  );
}
