/** Format with thousands separators, no rounding (SPEC: "12,847 meals" not "12K"). */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** mm:ss countdown from a future ISO timestamp (clamped at 0). */
export function secondsUntil(iso: string | null): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}
