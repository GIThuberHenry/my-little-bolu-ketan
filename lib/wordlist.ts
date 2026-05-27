// Minimal profanity filter (SPEC: "filter kata kasar minimal" — sengaja ga canggih).
// Case-insensitive substring match over a small wordlist.

const BAD_WORDS = [
  "anjing",
  "anjg",
  "babi",
  "bangsat",
  "kontol",
  "memek",
  "ngentot",
  "entot",
  "tai",
  "taik",
  "bajingan",
  "goblok",
  "tolol",
  "pepek",
  "jancok",
  "jancuk",
  "asu",
  "kampret",
  "brengsek",
  "pukimak",
  "pantek",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "pussy",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((w) => lower.includes(w));
}

/** Replace profanity with asterisks (for chat display). */
export function cleanText(text: string): string {
  let out = text;
  for (const w of BAD_WORDS) {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    out = out.replace(re, (m) => "*".repeat(m.length));
  }
  return out;
}
