import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, CardTitle, Dialog } from "@/components/ui";
import { fetchBalance, settleAllPurchases } from "@/lib/purchases";
import { getBalanceText } from "@/utils/balance";
import { formatDate } from "@/utils/format";
import { colors, spacing } from "@/theme";

export default function BalanceScreen() {
  const queryClient = useQueryClient();
  const [settleOpen, setSettleOpen] = useState(false);

  const { data: balance } = useQuery({
    queryKey: ["balance"],
    queryFn: fetchBalance,
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
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppHeader />
      </SafeAreaView>
    );
  }

  const balanceText = getBalanceText(balance);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <CardTitle>Current balance</CardTitle>
        <Card>
          <Text style={styles.balanceText}>{balanceText}</Text>
          <Text style={styles.settlementMeta}>
            {balance.lastSettlement
              ? `Last settled ${formatDate(balance.lastSettlement.settledAt)} by ${balance.lastSettlement.settledByName}`
              : "No settlements yet"}
          </Text>
        </Card>
        <Button
          title="Settle all purchases"
          variant="secondary"
          onPress={() => setSettleOpen(true)}
          disabled={balance.netCentsUserBOwesUserA === 0}
        />
      </ScrollView>
      <Dialog
        visible={settleOpen}
        title="Settle all purchases?"
        message="This marks every open purchase as settled. You can still edit settled records later."
        confirmLabel={settleMutation.isPending ? "Settling…" : "Settle all"}
        onConfirm={() => settleMutation.mutate()}
        onCancel={() => setSettleOpen(false)}
        loading={settleMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  balanceText: { fontSize: 24, fontWeight: "600", color: colors.text },
  settlementMeta: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
  },
});
