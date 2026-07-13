import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "@tanstack/react-form";
import { Button, TextField } from "@costly/components";
import { createPurchaseFn } from "#/handlers/purchases";
import { parseEurToCents } from "#/utils/format";

export const Route = createFileRoute("/_app/purchases/new")({
  component: NewPurchasePage,
});

function NewPurchasePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createPurchase = useServerFn(createPurchaseFn);

  const mutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["balance"] });
      await router.navigate({ to: "/purchases" });
    },
  });

  const today = new Date().toISOString().slice(0, 10);

  const form = useForm({
    defaultValues: {
      name: "",
      amount: "",
      partnerSharePercent: "50",
      purchasedAt: today,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        data: {
          name: value.name.trim(),
          amountCents: parseEurToCents(value.amount),
          partnerSharePercent: Number.parseInt(value.partnerSharePercent, 10),
          purchasedAt: new Date(value.purchasedAt),
        },
      });
    },
  });

  return (
    <main className="mx-auto max-w-lg px-4 py-4">
      <h2 className="mb-4 text-sm font-medium text-neutral-700">
        Create purchase
      </h2>

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
                className="h-full w-full border-none bg-transparent px-1 text-body font-body text-default-font outline-none"
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
          {mutation.isPending ? "Saving…" : "Save purchase"}
        </Button>
      </form>
    </main>
  );
}
