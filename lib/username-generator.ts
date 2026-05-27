import { USERNAME_MAX } from "./constants";
import { containsProfanity } from "./wordlist";

// Indonesian-flavored username generator (SPEC.md §1).

const PREFIXES = [
  "Raja",
  "Menteri",
  "Bapak",
  "Ibu",
  "Tukang",
  "Bocah",
  "Pak",
  "Bu",
  "Kang",
  "Mas",
  "Mbak",
  "Juragan",
];

const NOUNS = [
  "Ayam",
  "Nasi",
  "Tempe",
  "Telur",
  "Sambal",
  "Lauk",
  "Kotak",
  "Bungkus",
  "Mie",
  "Tahu",
  "Sayur",
  "Kerupuk",
];

const ADJECTIVES = ["Enjoyer", "Lover", "Hater", "Master", "Pro", "Sultan"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateUsername(): string {
  // Pattern A: [Prefix][Noun]            e.g. RajaAyam, TukangBungkus
  // Pattern B: [Noun][Adjective][Number] e.g. SambalEnjoyer69, AyamLover12
  let name: string;
  if (Math.random() < 0.6) {
    name = pick(PREFIXES) + pick(NOUNS);
  } else {
    name = pick(NOUNS) + pick(ADJECTIVES) + Math.floor(Math.random() * 100);
  }
  return name.slice(0, USERNAME_MAX);
}

export interface UsernameValidation {
  ok: boolean;
  value: string;
  error?: string;
}

export function validateUsername(raw: string): UsernameValidation {
  const value = raw.trim();
  if (!value) return { ok: false, value, error: "Nama ga boleh kosong." };
  if (value.length > USERNAME_MAX) {
    return { ok: false, value, error: `Maks ${USERNAME_MAX} karakter.` };
  }
  if (containsProfanity(value)) {
    return { ok: false, value, error: "Nama mengandung kata kasar." };
  }
  return { ok: true, value };
}

const USERNAME_COLORS = [
  "#C9302C",
  "#16A34A",
  "#F97316",
  "#7C3AED",
  "#2563EB",
  "#DB2777",
  "#0891B2",
  "#CA8A04",
  "#9333EA",
  "#0D9488",
];

/** Deterministic color per username (consistent across the app). */
export function colorForUsername(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return USERNAME_COLORS[h % USERNAME_COLORS.length];
}

export function generatePlayerId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // fallback for very old runtimes
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
