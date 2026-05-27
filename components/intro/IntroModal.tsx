"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Modal } from "@/components/ui/Modal";
import { IdentityEditor } from "@/components/ui/IdentityEditor";

/** First-visit onboarding (SPEC §10, copy from VIBES). Shows once. */
export function IntroModal() {
  const hydrated = useGameStore((s) => s._hasHydrated);
  const seenIntro = useGameStore((s) => s.seenIntro);
  const setSeenIntro = useGameStore((s) => s.setSeenIntro);
  const [step, setStep] = useState(0);

  const open = hydrated && !seenIntro;
  const finish = () => setSeenIntro(true);

  return (
    <Modal open={open} dismissable={false}>
      <div className="p-5">
        {step === 0 ? (
          <Step
            kicker="Langkah 1 / 3"
            title="SELAMAT DATANG"
            body="Anda adalah warga negara terpilih untuk operasi MAKAN BERGIZI GRATIS NASIONAL. Tugas Anda sederhana: KEMAS MAKANAN."
          />
        ) : null}
        {step === 1 ? (
          <Step
            kicker="Langkah 2 / 3"
            title="PERINGATAN"
            body="Kalo Anda kelewat semangat ngeklik, kotak nasional akan ROBOH. Dan nama Anda akan diumumkan ke seluruh negeri. Malu-maluin."
          />
        ) : null}
        {step === 2 ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mbg-red">
              Langkah 3 / 3
            </p>
            <h2 className="mb-3 font-serif text-2xl font-bold">MULAI OPERASI</h2>
            <p className="mb-4 font-sans text-sm text-mbg-ink/70">
              Bareng-bareng jadi pahlawan nasional. Atau penyebab kerobohan.
              Terserah. Tetapkan identitas warga Anda dulu:
            </p>
            <IdentityEditor ctaLabel="MULAI MENGEMAS →" onDone={finish} />
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={finish}
            className="font-mono text-[11px] uppercase tracking-widest text-mbg-ink/50 underline hover:text-mbg-ink"
          >
            Lewati
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-sm border-2 border-mbg-ink bg-mbg-red px-4 py-2 font-display text-lg tracking-widest text-mbg-white transition hover:bg-mbg-ink"
            >
              Lanjut →
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function Step({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mbg-red">
        {kicker}
      </p>
      <h2 className="mb-3 font-serif text-2xl font-bold">{title}</h2>
      <p className="font-sans text-sm leading-relaxed text-mbg-ink/80">{body}</p>
    </div>
  );
}
