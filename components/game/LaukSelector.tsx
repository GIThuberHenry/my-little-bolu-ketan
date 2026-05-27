"use client";

import { useGameStore } from "@/store/gameStore";
import { LAUK_LIST } from "@/lib/lauk-config";

/** Pick which lauk you're packing. Radio behavior (one active). */
export function LaukSelector() {
  const selected = useGameStore((s) => s.selectedLauk);
  const setLauk = useGameStore((s) => s.setLauk);

  return (
    <div className="w-full">
      <p className="mb-1 text-center font-mono text-[10px] uppercase tracking-widest text-mbg-ink/60">
        Pilih Lauk
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {LAUK_LIST.map((l) => {
          const active = l.id === selected;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setLauk(l.id)}
              title={l.tooltip}
              aria-pressed={active}
              className={`flex items-center gap-1 rounded-sm border-2 px-2 py-1 font-mono text-xs transition ${
                active
                  ? "border-mbg-ink bg-mbg-gold"
                  : "border-mbg-ink/30 bg-mbg-white hover:border-mbg-ink"
              }`}
            >
              <span className="text-base" aria-hidden>
                {l.emoji}
              </span>
              <span className="hidden sm:inline">{l.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
