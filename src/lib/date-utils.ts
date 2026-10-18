/**
 * Utilities for parsing and formatting dates in Vietnamese and ISO formats.
 * Pure functions (no JSX / React) so they can be unit-tested directly.
 */

export function isValidDate(y: number, mo: number, d: number): boolean {
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export function toIso(y: number, mo: number, d: number): string {
  const mm = String(mo).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

export function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function parseUserDate(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
  let m = /^(\d{4})[-/.\s](\d{1,2})[-/.\s](\d{1,2})$/.exec(trimmed);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    return isValidDate(y, mo, d) ? toIso(y, mo, d) : null;
  }

  // 2. DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  m = /^(\d{1,2})[-/.\s](\d{1,2})[-/.\s](\d{4})$/.exec(trimmed);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    return isValidDate(y, mo, d) ? toIso(y, mo, d) : null;
  }

  // 3. 8 continuous digits: DDMMYYYY (e.g. 20102024)
  m = /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    return isValidDate(y, mo, d) ? toIso(y, mo, d) : null;
  }

  return null;
}
