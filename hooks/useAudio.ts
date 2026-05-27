"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { audio } from "@/lib/audio";

/** Wires store audio settings to the AudioManager and triggers cue sounds. */
export function useAudio() {
  const muted = useGameStore((s) => s.audioMuted);
  const volume = useGameStore((s) => s.audioVolume);
  const isCollapsed = useGameStore((s) => s.isCollapsed);
  const activeEventId = useGameStore((s) => s.activeEvent?.id ?? null);
  const stabilityPct = useGameStore((s) => s.stabilityPct);

  useEffect(() => {
    audio.init(
      useGameStore.getState().audioMuted,
      useGameStore.getState().audioVolume,
    );
  }, []);

  useEffect(() => {
    audio.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    audio.setVolume(volume);
  }, [volume]);

  // Collapse cue (once per collapse).
  const prevCollapsed = useRef(false);
  useEffect(() => {
    if (isCollapsed && !prevCollapsed.current) audio.playCollapse();
    prevCollapsed.current = isCollapsed;
  }, [isCollapsed]);

  // Event-start cue (once per new event).
  const prevEvent = useRef<string | null>(null);
  useEffect(() => {
    if (activeEventId && activeEventId !== prevEvent.current) {
      audio.playEventStart();
    }
    prevEvent.current = activeEventId;
  }, [activeEventId]);

  // Alarm cue when crossing into critical (>=85%).
  const prevCritical = useRef(false);
  useEffect(() => {
    const critical = stabilityPct >= 85;
    if (critical && !prevCritical.current) audio.playAlarm();
    prevCritical.current = critical;
  }, [stabilityPct]);

  // Ambient normal voice line every ~90s while stable.
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = useGameStore.getState();
      if (!s.audioMuted && !s.isCollapsed && s.stabilityPct < 30) {
        audio.playVoice("normal");
      }
    }, 90_000);
    return () => window.clearInterval(id);
  }, []);
}
