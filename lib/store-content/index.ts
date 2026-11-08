import type { Announcement } from "@/lib/store-content/types";

function time(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function isAnnouncementLive(announcement: Announcement, now: number): boolean {
  const startsAt = time(announcement.startsAt);
  const endsAt = time(announcement.endsAt);
  return (startsAt === undefined || startsAt <= now) && (endsAt === undefined || now < endsAt);
}

// The earliest future start or end time, so the cached bar refreshes when the visible set changes.
export function nextAnnouncementChange(
  announcements: readonly Announcement[],
  now: number,
): number | undefined {
  const upcoming = announcements
    .flatMap(({ endsAt, startsAt }) => [time(startsAt), time(endsAt)])
    .filter((value): value is number => value !== undefined && value > now);
  return upcoming.length > 0 ? Math.min(...upcoming) : undefined;
}

const CM_PER_INCH = 2.54;

// Converts numeric measurement cells (every column after the size label); text cells stay as written.
export function convertSizeChartRows(
  rows: readonly string[][],
  from: "cm" | "in",
  to: "cm" | "in",
): string[][] {
  if (from === to) return rows.map((row) => [...row]);
  const factor = from === "cm" ? 1 / CM_PER_INCH : CM_PER_INCH;
  return rows.map((row) =>
    row.map((cell, index) => {
      if (index === 0) return cell;
      return cell.replace(/\d+(?:\.\d+)?/g, (number) => {
        const converted = Math.round(Number(number) * factor * 10) / 10;
        return String(converted);
      });
    }),
  );
}
