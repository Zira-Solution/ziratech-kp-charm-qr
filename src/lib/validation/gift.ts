/**
 * Validation for the gift card content a buyer saves from the studio.
 * Text is stored exactly as typed (React escapes it when it is rendered).
 */

/** Plain text: strips control characters (keeps line breaks), trims, and caps the length. */
export function cleanText(input: unknown, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}
