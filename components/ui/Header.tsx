"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { StatTicker } from "./StatTicker";
import { Modal } from "./Modal";
import { IdentityEditor } from "./IdentityEditor";

/** Fake-government header banner + live ticker + identity control. */
export function Header() {
  const hydrated = useGameStore((s) => s._hasHydrated);
  const username = useGameStore((s) => s.username);
  const [editing, setEditing] = useState(false);

  return (
    <header className="border-b-2 border-mbg-ink bg-mbg-red text-mbg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            🦅
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-90">
              Republik Indonesia
            </p>
            <h1 className="font-serif text-base font-bold sm:text-xl">
              Kementerian Makan Bergizi Gratis
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right font-mono text-[10px] uppercase tracking-widest">
            <p className="opacity-80">Nama Warga</p>
            <p className="font-display text-base tracking-wider">
              {hydrated ? username || "…" : "…"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="Ganti Identitas"
            className="rounded-sm border-2 border-mbg-white/70 px-2 py-1 text-sm transition hover:bg-mbg-white hover:text-mbg-red"
          >
            ✏️
          </button>
        </div>
      </div>
      <StatTicker />

      <Modal open={editing} onClose={() => setEditing(false)}>
        <div className="p-5">
          <h2 className="mb-1 font-serif text-xl font-bold text-mbg-ink">
            Ganti Identitas
          </h2>
          <p className="mb-3 font-sans text-xs text-mbg-ink/60">
            Acak atau ketik sendiri (maks 16 karakter).
          </p>
          <IdentityEditor ctaLabel="Simpan" onDone={() => setEditing(false)} />
        </div>
      </Modal>
    </header>
  );
}
