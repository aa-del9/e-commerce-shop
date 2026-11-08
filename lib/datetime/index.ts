import { brand } from "@/brand/config";

// Formats in the store's time zone so server and browser render the same text.
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(brand.localization.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: brand.localization.timeZone,
  }).format(new Date(iso));
}

export function formatCountdown(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(minutes, 1)}m`;
}
