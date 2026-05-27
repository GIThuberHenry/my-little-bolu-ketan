"use client";

import { useGameStore } from "@/store/gameStore";

/** Fixed mute toggle + volume slider in the corner. */
export function AudioControls() {
  const muted = useGameStore((s) => s.audioMuted);
  const volume = useGameStore((s) => s.audioVolume);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const setVolume = useGameStore((s) => s.setVolume);

  return (
    <div className="fixed bottom-3 right-3 z-40 flex items-center gap-2 rounded-sm border-2 border-mbg-ink bg-mbg-white/95 px-2 py-1.5 shadow-[3px_3px_0_0_rgba(26,26,26,0.7)]">
      <button
        type="button"
        onClick={toggleMute}
        title={muted ? "Bunyikan" : "Bisukan"}
        aria-label={muted ? "Bunyikan" : "Bisukan"}
        className="text-lg leading-none"
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        disabled={muted}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        aria-label="Volume"
        className="h-1 w-20 accent-mbg-red disabled:opacity-40"
      />
    </div>
  );
}
