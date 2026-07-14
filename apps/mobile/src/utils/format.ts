const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export function formatEur(cents: number): string {
  return eurFormatter.format(cents / 100);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function parseEurToCents(value: string): number {
  const normalized = value.replace(",", ".").trim();
  const euros = Number.parseFloat(normalized);
  if (Number.isNaN(euros) || euros <= 0) {
    throw new Error("Invalid amount");
  }
  return Math.round(euros * 100);
}

export function formatCentsToEurInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function formatDateInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
