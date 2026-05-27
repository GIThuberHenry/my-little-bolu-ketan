"use client";

import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Header } from "@/components/ui/Header";
import { MBGBox } from "@/components/game/MBGBox";
import { LaukSelector } from "@/components/game/LaukSelector";
import { StabilityBar } from "@/components/game/StabilityBar";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { BulletinBoard } from "@/components/chat/BulletinBoard";
import { IntroModal } from "@/components/intro/IntroModal";
import { formatNumber } from "@/lib/format";
import { useGamePolling } from "@/hooks/useGamePolling";
import { useClickBatcher } from "@/hooks/useClickBatcher";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { CollapseOverlay } from "@/components/game/CollapseOverlay";
import { stabilityStage } from "@/lib/game-logic";
import { EventBanner } from "@/components/events/EventBanner";
import { useAudio } from "@/hooks/useAudio";
import { AudioControls } from "@/components/ui/AudioControls";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import { useKonami } from "@/hooks/useKonami";
import { FoodRain, makeFoodDrops, type FoodDrop } from "@/components/ui/FoodRain";
import { Achievements } from "@/components/ui/Achievements";

/** Root client component: wires store lifecycle and lays out the game screen. */
export function GameClient() {
  const hydrated = useGameStore((s) => s._hasHydrated);
  const ensureIdentity = useGameStore((s) => s.ensureIdentity);
  const personalMeals = useGameStore((s) => s.personalMeals);
  const totalMeals = useGameStore((s) => s.totalMeals);
  const comboCount = useGameStore((s) => s.comboCount);
  const localStabilityTick = useGameStore((s) => s.localStabilityTick);
  const breakCombo = useGameStore((s) => s.breakCombo);

  // Server sync (no-ops automatically when Supabase isn't configured).
  useGamePolling();
  useClickBatcher();
  useHeartbeat();
  useAudio();
  useDynamicTitle();

  const stabilityPct = useGameStore((s) => s.stabilityPct);
  const isCollapsed = useGameStore((s) => s.isCollapsed);
  const shaking = stabilityStage(stabilityPct, isCollapsed) === "critical";

  // Konami code → food rain easter egg.
  const [foodDrops, setFoodDrops] = useState<FoodDrop[]>([]);
  const triggerFoodRain = useCallback(() => setFoodDrops(makeFoodDrops()), []);
  useKonami(triggerFoodRain);

  // Secret message for devs who open the console.
  useEffect(() => {
    console.log(
      "%cHalo dev. Selamat datang di simulasi MBG. Jangan curang ya. 🍱",
      "color:#C9302C;font-weight:bold;font-size:14px",
    );
  }, []);

  // Generate username + playerId once the store has rehydrated.
  useEffect(() => {
    if (hydrated) ensureIdentity();
  }, [hydrated, ensureIdentity]);

  // Offline stability recovery simulation (server takes over when online).
  useEffect(() => {
    const step = 200;
    const id = window.setInterval(() => localStabilityTick(step), step);
    return () => window.clearInterval(id);
  }, [localStabilityTick]);

  // Break the combo after a second of inactivity.
  useEffect(() => {
    if (comboCount === 0) return;
    const id = window.setTimeout(() => breakCombo(), 1000);
    return () => window.clearTimeout(id);
  }, [comboCount, breakCombo]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div
        className={`mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 ${
          shaking ? "animate-shake" : ""
        }`}
      >
        <div className="rounded-sm border-2 border-mbg-ink bg-mbg-white p-3">
          <StabilityBar />
        </div>
        <EventBanner />
        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          <main className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
            <Counter
              total={totalMeals}
              personal={personalMeals}
              combo={comboCount}
            />
            <MBGBox />
            <LaukSelector />
          </main>
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
            <Leaderboard />
            <BulletinBoard />
          </aside>
        </div>
      </div>
      <IntroModal />
      <CollapseOverlay />
      <AudioControls />
      <Achievements />
      <FoodRain drops={foodDrops} onDone={() => setFoodDrops([])} />
    </div>
  );
}

function Counter({
  total,
  personal,
  combo,
}: {
  total: number;
  personal: number;
  combo: number;
}) {
  return (
    <div className="text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-mbg-ink/60">
        Total Terkemas
      </p>
      <p className="font-mono text-4xl font-bold tabular-nums sm:text-5xl">
        {formatNumber(total)}
      </p>
      <p className="mt-1 font-mono text-xs text-mbg-ink/60">
        Kontribusi Anda: {formatNumber(personal)} meals
      </p>
      {combo >= 2 ? (
        <p className="mt-1 font-display text-lg tracking-wider text-mbg-orange">
          COMBO x{combo}
        </p>
      ) : null}
    </div>
  );
}
