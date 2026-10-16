import type { TimelineItem } from "../types.ts";

/** "2024-02-14" -> "14/02/2024". Anything that is not a saved date is returned as it is. */
export function formatDateVi(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : date;
}

/**
 * The line shown under an anniversary. `days` is whole days since the date (negative while it is still
 * ahead), or null when the date could not be read.
 */
export function anniversaryText(days: number | null, label: string): string {
  if (days === null) return label;
  if (days === 0) return `${label}: hôm nay`;
  if (days < 0) return `${label}: còn ${-days} ngày nữa`;
  return `${label}: đã ${days} ngày`;
}

/** Earliest first; equal dates keep the order the buyer wrote them in. The input is left alone. */
export function sortTimeline(items: readonly TimelineItem[]): TimelineItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.date.localeCompare(b.item.date) || a.index - b.index)
    .map(({ item }) => item);
}
