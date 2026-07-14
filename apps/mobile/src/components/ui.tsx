import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from "react-native";
import { colors, radii, spacing } from "../theme";

type ButtonVariant = "brand" | "secondary" | "tertiary";

type ButtonProps = Omit<PressableProps, "children"> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  title,
  variant = "brand",
  loading,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      {...props}
      style={(state) => {
        const resolvedStyle = typeof style === "function" ? style(state) : style;
        return [
          styles.button,
          variantStyles[variant],
          isDisabled && styles.buttonDisabled,
          state.pressed && !isDisabled && styles.buttonPressed,
          resolvedStyle,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator color={variant === "brand" ? "#fff" : colors.text} />
      ) : (
        <Text style={[styles.buttonText, variantTextStyles[variant]]}>{title}</Text>
      )}
    </Pressable>
  );
}

type TextFieldProps = {
  label: string;
  helpText?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
};

export function TextField({
  label,
  helpText,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  maxLength,
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
      {helpText ? <Text style={styles.helpText}>{helpText}</Text> : null}
    </View>
  );
}

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

export function CardTitle(props: TextProps) {
  return <Text style={styles.cardTitle} {...props} />;
}

type BadgeProps = {
  label: string;
  variant?: "neutral" | "warning";
};

export function Badge({ label, variant = "neutral" }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        variant === "warning" ? styles.badgeWarning : styles.badgeNeutral,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          variant === "warning" ? styles.badgeTextWarning : styles.badgeTextNeutral,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type DialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function Dialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading,
}: DialogProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.dialogOverlay}>
      <View style={styles.dialogContent}>
        <Text style={styles.dialogTitle}>{title}</Text>
        <Text style={styles.dialogMessage}>{message}</Text>
        <View style={styles.dialogActions}>
          <Button title={cancelLabel} variant="tertiary" onPress={onCancel} />
          <Button
            title={confirmLabel}
            variant="brand"
            onPress={onConfirm}
            loading={loading}
          />
        </View>
      </View>
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderText}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightAction}
    </View>
  );
}

const variantStyles = StyleSheet.create({
  brand: { backgroundColor: colors.brand },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tertiary: { backgroundColor: "transparent" },
});

const variantTextStyles = StyleSheet.create({
  brand: { color: "#ffffff" },
  secondary: { color: colors.text },
  tertiary: { color: colors.textSecondary },
});

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontSize: 16, fontWeight: "600" },
  field: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  helpText: { fontSize: 12, color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeNeutral: { backgroundColor: colors.neutralBadge },
  badgeWarning: { backgroundColor: colors.warningBg },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextNeutral: { color: colors.textSecondary },
  badgeTextWarning: { color: colors.warning },
  dialogOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    zIndex: 50,
  },
  dialogContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dialogTitle: { fontSize: 18, fontWeight: "600", color: colors.text },
  dialogMessage: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  screenHeaderText: { flex: 1 },
  screenTitle: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  screenSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
