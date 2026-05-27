"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { validateUsername } from "@/lib/username-generator";
import { USERNAME_MAX } from "@/lib/constants";

/** Reusable name editor: random generate or manual entry, with validation. */
export function IdentityEditor({
  onDone,
  ctaLabel = "Simpan",
}: {
  onDone?: () => void;
  ctaLabel?: string;
}) {
  const username = useGameStore((s) => s.username);
  const setUsername = useGameStore((s) => s.setUsername);
  const randomizeUsername = useGameStore((s) => s.randomizeUsername);
  const [draft, setDraft] = useState(username);
  const [error, setError] = useState<string | null>(null);

  function handleRandom() {
    randomizeUsername();
    setDraft(useGameStore.getState().username);
    setError(null);
  }

  function handleSave() {
    const v = validateUsername(draft);
    if (!v.ok) {
      setError(v.error ?? "Nama tidak valid.");
      return;
    }
    setUsername(v.value);
    setError(null);
    onDone?.();
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[10px] uppercase tracking-widest text-mbg-ink/60">
        Nama Warga
      </label>
      <div className="flex gap-2">
        <input
          value={draft}
          maxLength={USERNAME_MAX}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="min-w-0 flex-1 rounded-sm border-2 border-mbg-ink bg-mbg-white px-2 py-1.5 font-display text-lg tracking-wide outline-none focus:bg-mbg-cream"
          placeholder="Nama warga…"
        />
        <button
          type="button"
          onClick={handleRandom}
          title="Acak nama"
          className="rounded-sm border-2 border-mbg-ink bg-mbg-cream px-3 font-mono text-sm hover:bg-mbg-gold"
        >
          🎲
        </button>
      </div>
      {error ? (
        <p className="font-mono text-[11px] text-mbg-red">{error}</p>
      ) : null}
      <button
        type="button"
        onClick={handleSave}
        className="mt-1 rounded-sm border-2 border-mbg-ink bg-mbg-red px-3 py-2 font-display text-lg tracking-widest text-mbg-white transition hover:bg-mbg-ink"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
