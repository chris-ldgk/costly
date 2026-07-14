import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Button } from "@/components/ui";
import {
  fetchPurchases,
  PURCHASES_PAGE_SIZE,
  type Purchase,
} from "@/lib/purchases";
import { formatDate, formatEur } from "@/utils/format";
import { colors, radii, spacing } from "@/theme";

export default function PurchasesScreen() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["purchases"],
      queryFn: ({ pageParam }) =>
        fetchPurchases({ limit: PURCHASES_PAGE_SIZE, offset: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.hasMore
          ? allPages.reduce((sum, page) => sum + page.purchases.length, 0)
          : undefined,
    });

  const purchases = data?.pages.flatMap((page) => page.purchases) ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={purchases}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={styles.listTitle}>All purchases</Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No purchases yet. Use the Create tab to add one.
          </Text>
        }
        renderItem={({ item }) => <PurchaseCard purchase={item} />}
        ListFooterComponent={
          hasNextPage ? (
            <Button
              title={isFetchingNextPage ? "Loading…" : "Load more"}
              variant="secondary"
              onPress={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              style={styles.loadMore}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function PurchaseCard({ purchase }: { purchase: Purchase }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{purchase.name}</Text>
        <Badge
          label={purchase.settlementId ? "Settled" : "Open"}
          variant={purchase.settlementId ? "neutral" : "warning"}
        />
      </View>
      <Text style={styles.cardAmount}>{formatEur(purchase.amountCents)}</Text>
      <View style={styles.metaGrid}>
        <View>
          <Text style={styles.metaLabel}>Partner share</Text>
          <Text style={styles.metaValue}>{purchase.partnerSharePercent}%</Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>Date</Text>
          <Text style={styles.metaValue}>{formatDate(purchase.purchasedAt)}</Text>
        </View>
        <View style={styles.metaFull}>
          <Text style={styles.metaLabel}>Paid by</Text>
          <Text style={styles.metaValue}>
            {purchase.createdBy?.name ?? "Unknown"}
          </Text>
        </View>
      </View>
      <Link
        href={{
          pathname: "/(tabs)/purchases/[purchaseId]/edit",
          params: { purchaseId: purchase.id },
        }}
        asChild
      >
        <Pressable style={styles.editLink}>
          <Text style={styles.editLinkText}>Edit</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  listTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderDashed,
    borderRadius: radii.md,
    padding: spacing.lg,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardName: { flex: 1, fontSize: 16, fontWeight: "500", color: colors.text },
  cardAmount: { fontSize: 18, fontWeight: "600", color: colors.text },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaFull: { width: "100%" },
  metaLabel: { fontSize: 12, color: colors.textPlaceholder },
  metaValue: { fontSize: 14, color: colors.textSecondary },
  editLink: { alignSelf: "flex-end", marginTop: spacing.md, padding: spacing.xs },
  editLinkText: { color: colors.brandText, fontWeight: "600" },
  loadMore: { marginTop: spacing.sm },
});
