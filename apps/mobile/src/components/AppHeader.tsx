import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui";
import { colors, spacing } from "@/theme";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export function AppHeader() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.replace("/login");
  }

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Costly</Text>
        <Text style={styles.email}>{session?.user.email ?? ""}</Text>
      </View>
      <Button title="Sign out" variant="tertiary" onPress={() => void handleSignOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { fontSize: 18, fontWeight: "600", color: colors.text },
  email: { fontSize: 12, color: colors.textMuted },
});
