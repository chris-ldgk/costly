import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FeatherLayoutGrid, FeatherPencil, FeatherTable } from "@subframe/core";
import { Badge, Button, Table, Tabs } from "@costly/components";
import { useState } from "react";
import {
  getPurchases,
  PURCHASES_PAGE_SIZE,
  type Purchase,
  type PurchaseListResult,
} from "#/lib/purchases";
import { formatDate, formatEur } from "#/utils/format";

type ViewMode = "cards" | "table";

export const Route = createFileRoute("/_app/purchases/")({
  component: PurchasesPage,
});

function PurchasesPage() {
  const [view, setView] = useState<ViewMode>("cards");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<PurchaseListResult>({
      queryKey: ["purchases"],
      queryFn: ({ pageParam }) =>
        getPurchases(PURCHASES_PAGE_SIZE, pageParam as number),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.hasMore
          ? allPages.reduce((sum, page) => sum + page.purchases.length, 0)
          : undefined,
    });

  const purchases = data?.pages.flatMap((page) => page.purchases) ?? [];

  if (isLoading) {
    return (
      <main className="mx-auto max-w-lg px-4 py-4">
        <p className="text-sm text-neutral-500">Loading purchases…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg space-y-4 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-700">All purchases</h2>

        {purchases.length > 0 ? (
          <Tabs className="w-auto shrink-0" role="tablist" aria-label="View mode">
            <Tabs.Item
              role="tab"
              aria-selected={view === "cards"}
              aria-label="Card view"
              active={view === "cards"}
              icon={<FeatherLayoutGrid />}
              onClick={() => setView("cards")}
            />
            <Tabs.Item
              role="tab"
              aria-selected={view === "table"}
              aria-label="Table view"
              active={view === "table"}
              icon={<FeatherTable />}
              onClick={() => setView("table")}
            />
          </Tabs>
        ) : null}
      </div>

      {purchases.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No purchases yet. Use the Create tab to add one.
        </p>
      ) : view === "cards" ? (
        <PurchaseCards purchases={purchases} />
      ) : (
        <PurchaseTable purchases={purchases} />
      )}

      {hasNextPage ? (
        <Button
          type="button"
          variant="neutral-secondary"
          size="large"
          className="w-full"
          disabled={isFetchingNextPage}
          onClick={() => {
            void fetchNextPage();
          }}
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </main>
  );
}

function PurchaseCards({ purchases }: { purchases: Purchase[] }) {
  return (
    <section className="space-y-3">
      {purchases.map((purchase) => (
        <article
          key={purchase.id}
          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-medium text-neutral-900">{purchase.name}</h3>
            <PurchaseStatusBadge purchase={purchase} />
          </div>
          <p className="text-lg font-semibold text-neutral-900">
            {formatEur(purchase.amountCents)}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-neutral-600">
            <div>
              <dt className="text-neutral-400">Partner share</dt>
              <dd>{purchase.partnerSharePercent}%</dd>
            </div>
            <div>
              <dt className="text-neutral-400">Date</dt>
              <dd>{formatDate(purchase.purchasedAt)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-neutral-400">Paid by</dt>
              <dd>{purchase.createdBy?.name ?? "Unknown"}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-end">
            <PurchaseEditLink purchaseId={purchase.id} />
          </div>
        </article>
      ))}
    </section>
  );
}

function PurchaseTable({ purchases }: { purchases: Purchase[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table
          header={
            <Table.HeaderRow>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Share</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Paid by</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="w-12" />
            </Table.HeaderRow>
          }
        >
          {purchases.map((purchase) => (
            <Table.Row key={purchase.id}>
              <Table.Cell className="min-w-[8rem] font-medium text-neutral-900">
                {purchase.name}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap">
                {formatEur(purchase.amountCents)}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap">
                {purchase.partnerSharePercent}%
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap">
                {formatDate(purchase.purchasedAt)}
              </Table.Cell>
              <Table.Cell className="min-w-[5rem] whitespace-nowrap">
                {purchase.createdBy?.name ?? "Unknown"}
              </Table.Cell>
              <Table.Cell>
                <PurchaseStatusBadge purchase={purchase} />
              </Table.Cell>
              <Table.Cell className="w-12">
                <PurchaseEditLink
                  purchaseId={purchase.id}
                  iconOnly
                  label={`Edit ${purchase.name}`}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      </div>
    </section>
  );
}

function PurchaseStatusBadge({ purchase }: { purchase: Purchase }) {
  return (
    <Badge variant={purchase.settlementId ? "neutral" : "warning"}>
      {purchase.settlementId ? "Settled" : "Open"}
    </Badge>
  );
}

function PurchaseEditLink({
  purchaseId,
  iconOnly = false,
  label = "Edit",
}: {
  purchaseId: string;
  iconOnly?: boolean;
  label?: string;
}) {
  return (
    <Link
      to="/purchases/$purchaseId/edit"
      params={{ purchaseId }}
      aria-label={label}
      className={
        iconOnly
          ? "inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          : undefined
      }
    >
      {iconOnly ? (
        <FeatherPencil className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Button variant="neutral-tertiary" size="small">
          Edit
        </Button>
      )}
    </Link>
  );
}
