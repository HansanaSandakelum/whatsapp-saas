import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "h:mm a");
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatWindowTimer(expiresAt: Date): {
  label: string;
  color: "green" | "yellow" | "red" | "gray";
} {
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMs <= 0) {
    return { label: "Closed", color: "gray" };
  }
  if (diffHours > 6) {
    const h = Math.floor(diffHours);
    const m = Math.floor((diffHours - h) * 60);
    return { label: `${h}h ${m}m`, color: "green" };
  }
  if (diffHours > 1) {
    const h = Math.floor(diffHours);
    const m = Math.floor((diffHours - h) * 60);
    return { label: `${h}h ${m}m`, color: "yellow" };
  }
  return { label: `${diffMins}m`, color: "red" };
}
