import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, CardTitle, TextField } from "@/components/ui";
import { DateField, PartnerShareSlider } from "@/components/PurchaseFormFields";
import { createPurchase } from "@/lib/purchases";
import { parseEurToCents } from "@/utils/format";
import { colors, spacing } from "@/theme";

export default function NewPurchaseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [partnerSharePercent, setPartnerSharePercent] = useState(50);
  const [purchasedAt, setPurchasedAt] = useState(today);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createPurchase({
        name: name.trim(),
        amountCents: parseEurToCents(amount),
        partnerSharePercent,
        purchasedAt: new Date(purchasedAt),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["balance"] });
      router.replace("/(tabs)/purchases");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <CardTitle>Create purchase</CardTitle>
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
              title={mutation.isPending ? "Saving…" : "Save purchase"}
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
  form: { gap: spacing.md },
  error: { fontSize: 14, color: colors.error },
});
