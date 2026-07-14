import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";
import { formatDate, formatDateInput } from "@/utils/format";

type PartnerShareSliderProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  helpText?: string;
};

export function PartnerShareSlider({
  value,
  onChange,
  label = "Partner's share (%)",
  helpText = "How much of this cost is your partner's share",
}: PartnerShareSliderProps) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      {helpText ? <Text style={styles.helpText}>{helpText}</Text> : null}
      <Slider
        value={value}
        onValueChange={(v) => onChange(Math.round(v / 5) * 5)}
        minimumValue={0}
        maximumValue={100}
        step={5}
        minimumTrackTintColor={colors.brand}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.brand}
      />
    </View>
  );
}

type DateFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateField({
  label = "Purchase date",
  value,
  onChange,
}: DateFieldProps) {
  const dateValue = value ? new Date(`${value}T12:00:00`) : new Date();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.datePreview}>{formatDate(dateValue)}</Text>
      <DateTimePicker
        value={dateValue}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        locale="de-DE"
        onChange={(_event, selectedDate) => {
          if (selectedDate) {
            onChange(formatDateInput(selectedDate));
          }
        }}
        style={styles.datePicker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  labelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  label: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  value: { fontSize: 14, fontWeight: "600", color: colors.text },
  helpText: { fontSize: 12, color: colors.textMuted },
  datePreview: { fontSize: 16, fontWeight: "500", color: colors.text },
  datePicker: {
    alignSelf: "stretch",
    marginTop: spacing.xs,
  },
});
