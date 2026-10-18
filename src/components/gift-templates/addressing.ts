/**
 * Vietnamese Pronoun and Addressing Utilities for Gift Cards
 * Supports flexible inputs: "Anh - Em", "an-em", "to-cau", "Tớ - Cậu", "Mình - Bạn", etc.
 */

export interface AddressingPronouns {
  /** Lowercase sender pronoun, e.g. "anh", "mình", "tớ", "em" */
  sender: string;
  /** Lowercase recipient pronoun, e.g. "em", "bạn", "cậu", "anh" */
  recipient: string;
  /** Capitalized sender pronoun, e.g. "Anh", "Mình", "Tớ", "Em" */
  Sender: string;
  /** Capitalized recipient pronoun, e.g. "Em", "Bạn", "Cậu", "Anh" */
  Recipient: string;
  /** Uppercase sender pronoun, e.g. "ANH", "MÌNH", "TỚ", "EM" */
  senderUpper: string;
  /** Uppercase recipient pronoun, e.g. "EM", "BẠN", "CẬU", "ANH" */
  recipientUpper: string;
  /** Normalized display label, e.g. "Anh - Em" */
  pairLabel: string;
}

const DEFAULT_PRONOUNS: AddressingPronouns = {
  sender: "mình",
  recipient: "bạn",
  Sender: "Mình",
  Recipient: "Bạn",
  senderUpper: "MÌNH",
  recipientUpper: "BẠN",
  pairLabel: "Mình - Bạn",
};

/** Normalize common unaccented and typo variations of Vietnamese pronouns */
const PRONOUN_MAP: Record<string, string> = {
  // anh / em
  an: "anh",
  anh: "anh",
  e: "em",
  em: "em",
  // tớ / cậu
  to: "tớ",
  "tớ": "tớ",
  cau: "cậu",
  "cậu": "cậu",
  // mình / bạn
  minh: "mình",
  "mình": "mình",
  ban: "bạn",
  "bạn": "bạn",
  // chị / em
  chi: "chị",
  "chị": "chị",
  // ba / bố / mẹ / con
  ba: "ba",
  bo: "bố",
  "bố": "bố",
  me: "mẹ",
  "mẹ": "mẹ",
  con: "con",
  // chú / cô / bác / cháu
  chu: "chú",
  "chú": "chú",
  co: "cô",
  "cô": "cô",
  bac: "bác",
  "bác": "bác",
  chau: "cháu",
  "cháu": "cháu",
  // chồng / vợ
  chong: "chồng",
  "chồng": "chồng",
  vo: "vợ",
  "vợ": "vợ",
  // chàng / nàng
  chang: "chàng",
  "chàng": "chàng",
  nang: "nàng",
  "nàng": "nàng",
};

/** Known counterpart when only one side is provided */
const COUNTERPART_MAP: Record<string, string> = {
  anh: "em",
  em: "anh",
  "tớ": "cậu",
  "cậu": "tớ",
  "mình": "bạn",
  "bạn": "mình",
  "chị": "em",
  ba: "con",
  "bố": "con",
  "mẹ": "con",
  con: "ba",
  "chú": "cháu",
  "cô": "cháu",
  "bác": "cháu",
  "cháu": "chú",
  "chồng": "vợ",
  "vợ": "chồng",
  "chàng": "nàng",
  "nàng": "chàng",
};

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalizeWord(raw: string): string {
  const cleaned = raw.trim().toLowerCase();
  return PRONOUN_MAP[cleaned] || cleaned;
}

/**
 * Parses user addressing input into sender and recipient pronouns.
 * Examples:
 * - "an-em" -> sender: "anh", recipient: "em"
 * - "Anh - Em" -> sender: "anh", recipient: "em"
 * - "to-cau" -> sender: "tớ", recipient: "cậu"
 * - "Anh" -> sender: "anh", recipient: "em"
 * - "" -> sender: "mình", recipient: "bạn"
 */
export function parseAddressing(raw?: string | null): AddressingPronouns {
  if (!raw || typeof raw !== "string") {
    return DEFAULT_PRONOUNS;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return DEFAULT_PRONOUNS;
  }

  // Split by common delimiters: -, /, ,, &, +, "và", "va", "and", or multiple spaces
  const parts = trimmed
    .split(/(?:[-/,|&+–—]|\s+(?:v[àa]|and|\+)\s+|\s{2,})/iu)
    .map((p) => p.trim())
    .filter(Boolean);

  let senderRaw = "";
  let recipientRaw = "";

  if (parts.length >= 2) {
    senderRaw = parts[0];
    recipientRaw = parts[1];
  } else {
    // Check single space separation, e.g. "anh em", "an em"
    const spaceParts = trimmed.split(/\s+/).filter(Boolean);
    if (spaceParts.length >= 2) {
      senderRaw = spaceParts[0];
      recipientRaw = spaceParts[1];
    } else if (spaceParts.length === 1) {
      senderRaw = spaceParts[0];
    }
  }

  const sender = normalizeWord(senderRaw);
  let recipient = recipientRaw ? normalizeWord(recipientRaw) : "";

  if (!recipient && sender && COUNTERPART_MAP[sender]) {
    recipient = COUNTERPART_MAP[sender];
  }

  if (!sender && !recipient) {
    return DEFAULT_PRONOUNS;
  }

  const finalSender = sender || "mình";
  const finalRecipient = recipient || "bạn";

  const Sender = capitalize(finalSender);
  const Recipient = capitalize(finalRecipient);

  return {
    sender: finalSender,
    recipient: finalRecipient,
    Sender,
    Recipient,
    senderUpper: finalSender.toUpperCase(),
    recipientUpper: finalRecipient.toUpperCase(),
    pairLabel: `${Sender} - ${Recipient}`,
  };
}

/**
 * Formats a respectful, natural Vietnamese salutation.
 * - recipientName: "Bảo Ngọc", recipientPronoun: "em" -> "Gửi em Bảo Ngọc,"
 * - recipientName: "Em yêu", recipientPronoun: "em" -> "Gửi Em yêu,"
 * - recipientName: "", recipientPronoun: "em" -> "Gửi em,"
 * - recipientName: "", recipientPronoun: "bạn" -> "Gửi bạn,"
 */
export function formatSalutation(recipientName?: string, recipientPronoun = "bạn"): string {
  const name = recipientName?.trim();
  const pronoun = recipientPronoun.trim().toLowerCase();

  if (!name) {
    return `Gửi ${pronoun},`;
  }

  // If the name already starts with the pronoun (e.g. "Em Lan", "em yêu", "cậu Nam")
  const nameLower = name.toLowerCase();
  if (nameLower === pronoun || nameLower.startsWith(`${pronoun} `)) {
    return `Gửi ${name},`;
  }

  // If pronoun is default "bạn", just "Gửi [Tên]," or "Gửi bạn [Tên],"
  if (pronoun === "bạn") {
    return `Gửi ${name},`;
  }

  return `Gửi ${pronoun} ${name},`;
}

/** Default letter content personalized with sender and recipient pronouns */
export function getDefaultLetterContent(pronouns: AddressingPronouns): string {
  return `Có vài điều ${pronouns.sender} luôn muốn nói nhưng chưa có dịp...
Hôm nay, ${pronouns.sender} muốn gửi tất cả vào món quà nhỏ này đến ${pronouns.recipient}.

Cảm ơn ${pronouns.recipient} vì đã luôn ở bên cạnh, cùng đi qua những ngày tháng rực rỡ và ấm áp nhất. Mong nụ cười của ${pronouns.recipient} luôn tỏa sáng như ánh nắng mùa thu nhé! 🌸`;
}

/** Short fallback letter content */
export function getShortFallbackLetter(pronouns: AddressingPronouns): string {
  return `Có vài điều ${pronouns.sender} luôn muốn nói nhưng chưa có dịp...\nHôm nay, ${pronouns.sender} muốn gửi tất cả vào món quà này đến ${pronouns.recipient}.`;
}

/** Default letter subtitle personalized */
export function getDefaultLetterSubtitle(pronouns: AddressingPronouns): string {
  return `Vẫn còn vài điều ${pronouns.sender} muốn kể ${pronouns.recipient} nghe... ♡`;
}

/** Default voice note text personalized */
export function getDefaultVoiceNote(pronouns: AddressingPronouns): string {
  return `Có những điều viết ra vẫn chưa đủ. Nên lần này, ${pronouns.sender} muốn ${pronouns.recipient} nghe bằng chính giọng nói của ${pronouns.sender}. ❤️`;
}

/** Default final keepsake message personalized */
export function getDefaultFinalMessage(pronouns: AddressingPronouns): string {
  return `Món quà này sẽ luôn ở đây,\nmỗi khi ${pronouns.recipient} muốn nhớ lại. ♡`;
}

/** Adapts demo or template text containing "mình" or "bạn" with the chosen pronouns */
export function adaptTextPronouns(text: string, pronouns: AddressingPronouns): string {
  if (!text) return text;
  if (pronouns.sender === "mình" && pronouns.recipient === "bạn") {
    return text;
  }

  // Replace case-sensitively
  return text
    .replace(/\bmình\b/g, pronouns.sender)
    .replace(/\bMình\b/g, pronouns.Sender)
    .replace(/\bMÌNH\b/g, pronouns.senderUpper)
    .replace(/\bbạn\b/g, pronouns.recipient)
    .replace(/\bBạn\b/g, pronouns.Recipient)
    .replace(/\bBẠN\b/g, pronouns.recipientUpper);
}
