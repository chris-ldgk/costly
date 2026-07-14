import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, TextField } from "@/components/ui";
import { DateField, PartnerShareSlider } from "@/components/PurchaseFormFields";
import { fetchPurchase, updatePurchase } from "@/lib/purchases";
import {
  formatCentsToEurInput,
  formatDateInput,
  parseEurToCents,
} from "@/utils/format";
import { colors, spacing } from "@/theme";

export default function EditPurchaseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();

  const { data: purchase, isError } = useQuery({
    queryKey: ["purchase", purchaseId],
    queryFn: () => fetchPurchase(purchaseId),
    enabled: Boolean(purchaseId),
  });

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [partnerSharePercent, setPartnerSharePercent] = useState(50);
  const [purchasedAt, setPurchasedAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!purchase) {
      return;
    }
    setName(purchase.name);
    setAmount(formatCentsToEurInput(purchase.amountCents));
    setPartnerSharePercent(purchase.partnerSharePercent);
    setPurchasedAt(formatDateInput(purchase.purchasedAt));
  }, [purchase]);

  const mutation = useMutation({
    mutationFn: () =>
      updatePurchase(purchaseId, {
        name: name.trim(),
        amountCents: parseEurToCents(amount),
        partnerSharePercent,
        purchasedAt: new Date(purchasedAt),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["balance"] });
      await queryClient.invalidateQueries({ queryKey: ["purchase", purchaseId] });
      router.replace("/(tabs)/purchases");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppHeader />
        <View style={styles.content}>
          <Text style={styles.error}>Purchase not found.</Text>
          <Link href="/(tabs)/purchases" asChild>
            <Button title="Back to purchases" variant="secondary" />
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  if (!purchase) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppHeader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Edit purchase</Text>
            <Link href="/(tabs)/purchases" asChild>
              <Button title="Cancel" variant="tertiary" />
            </Link>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Paid by {purchase.createdBy?.name ?? "Unknown"}
            </Text>
            <Badge
              label={purchase.settlementId ? "Settled" : "Open"}
              variant={purchase.settlementId ? "neutral" : "warning"}
            />
          </View>

          {purchase.settlementId ? (
            <Text style={styles.settledNote}>
              This purchase is settled. Changes update the record only and do not
              affect the current balance.
            </Text>
          ) : null}

          <Card style={styles.form}>
            <TextField
              label="Purchase name"
              value={name}
              onChangeText={setName}
              placeholder="Groceries"
            />
            <TextField
              label="Amount (EUR)"
              helpText="What you paid in total"
              value={amount}
              onChangeText={setAmount}
              placeholder="0,00"
              keyboardType="decimal-pad"
            />
            <PartnerShareSlider
              value={partnerSharePercent}
              onChange={setPartnerSharePercent}
            />
            <DateField value={purchasedAt} onChange={setPurchasedAt} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title={mutation.isPending ? "Saving…" : "Save changes"}
              onPress={() => {
                setError(null);
                mutation.mutate();
              }}
              loading={mutation.isPending}
              disabled={!name.trim()}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaText: { fontSize: 14, color: colors.textSecondary },
  settledNote: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  form: { gap: spacing.md },
  error: { fontSize: 14, color: colors.error },
});
