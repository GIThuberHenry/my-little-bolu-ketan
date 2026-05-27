"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-5xl" aria-hidden>
        😵
      </p>
      <h1 className="font-serif text-3xl font-bold">Server pusing</h1>
      <p className="max-w-sm font-sans text-sm text-mbg-ink/70">
        Operasi nasional sempat tersendat. Coba lagi ya, warga.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-sm border-2 border-mbg-ink bg-mbg-red px-4 py-2 font-display text-lg tracking-widest text-mbg-white transition hover:bg-mbg-ink"
      >
        Coba Lagi
      </button>
    </main>
  );
}
