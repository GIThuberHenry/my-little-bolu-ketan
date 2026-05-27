import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { COMBO, LS_KEYS, STABILITY } from "@/lib/constants";
import {
  clickMeals,
  clickStabilityDelta,
  clamp,
  decayStability,
} from "@/lib/game-logic";
import { getEvent } from "@/lib/event-config";
import { getLauk, DEFAULT_LAUK } from "@/lib/lauk-config";
import {
  generatePlayerId,
  generateUsername,
} from "@/lib/username-generator";
import type {
  ActiveEvent,
  ClickPayload,
  ClickResponse,
  GameStateDTO,
  LaukId,
} from "@/lib/types";

export interface ClickResult {
  meals: number;
  combo: number;
  blocked: boolean;
}

interface GameStore {
  // --- server-synced (not persisted) ---
  totalMeals: number;
  stabilityPct: number;
  activeEvent: ActiveEvent | null;
  isCollapsed: boolean;
  collapseEndsAt: string | null;
  lastCollapser: string | null;
  activePlayersCount: number;
  online: boolean;

  // --- local identity & settings (persisted) ---
  username: string;
  playerId: string;
  selectedLauk: LaukId;
  personalMeals: number;
  audioMuted: boolean;
  audioVolume: number;
  seenIntro: boolean;

  // --- ephemeral local ---
  comboCount: number;
  lastClickAt: number;
  pendingClicks: ClickPayload[];
  _hasHydrated: boolean;

  // --- actions ---
  ensureIdentity: () => void;
  setUsername: (name: string) => void;
  randomizeUsername: () => void;
  setLauk: (lauk: LaukId) => void;
  registerClick: () => ClickResult;
  drainPendingClicks: () => ClickPayload[];
  setServerState: (dto: GameStateDTO) => void;
  setOnline: (online: boolean) => void;
  reconcilePersonal: (meals: number) => void;
  applyClickResponse: (resp: ClickResponse) => void;
  localStabilityTick: (dtMs: number) => void;
  breakCombo: () => void;
  setSeenIntro: (seen: boolean) => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      totalMeals: 0,
      stabilityPct: 0,
      activeEvent: null,
      isCollapsed: false,
      collapseEndsAt: null,
      lastCollapser: null,
      activePlayersCount: 1,
      online: false,

      username: "",
      playerId: "",
      selectedLauk: DEFAULT_LAUK,
      personalMeals: 0,
      audioMuted: false,
      audioVolume: 0.3,
      seenIntro: false,

      comboCount: 0,
      lastClickAt: 0,
      pendingClicks: [],
      _hasHydrated: false,

      ensureIdentity: () => {
        const { username, playerId } = get();
        const patch: Partial<GameStore> = {};
        if (!username) patch.username = generateUsername();
        if (!playerId) patch.playerId = generatePlayerId();
        if (Object.keys(patch).length) set(patch);
      },

      setUsername: (name) => set({ username: name.slice(0, 16) }),

      randomizeUsername: () => set({ username: generateUsername() }),

      setLauk: (lauk) => set({ selectedLauk: lauk }),

      registerClick: () => {
        const s = get();
        if (s.isCollapsed) {
          return { meals: 0, combo: s.comboCount, blocked: true };
        }
        const now = Date.now();
        const gap = now - s.lastClickAt;
        let combo: number;
        if (gap <= COMBO.windowMs) combo = s.comboCount + 1;
        else if (gap > COMBO.idleBreakMs) combo = 1;
        else combo = Math.max(1, s.comboCount);

        const lauk = getLauk(s.selectedLauk);
        const event = getEvent(s.activeEvent?.id ?? null);
        const meals = clickMeals(lauk, combo, event);
        const rawStability =
          s.stabilityPct + clickStabilityDelta(lauk, combo, event);

        const common = {
          comboCount: combo,
          lastClickAt: now,
          personalMeals: s.personalMeals + meals,
          totalMeals: s.totalMeals + meals, // optimistic; server reconciles
          pendingClicks: [
            ...s.pendingClicks,
            { lauk: s.selectedLauk, timestamp: now },
          ],
        };

        // Offline (no server): simulate the collapse locally so the mechanic
        // is demoable solo. Online, the server is authoritative.
        if (!s.online && rawStability >= STABILITY.collapseThreshold) {
          set({
            ...common,
            stabilityPct: 0,
            isCollapsed: true,
            collapseEndsAt: new Date(
              now + STABILITY.collapseFreezeSec * 1000,
            ).toISOString(),
            lastCollapser: s.username,
          });
          return { meals, combo, blocked: false };
        }

        set({ ...common, stabilityPct: clamp(rawStability, 0, 100) });
        return { meals, combo, blocked: false };
      },

      drainPendingClicks: () => {
        const pending = get().pendingClicks;
        if (pending.length) set({ pendingClicks: [] });
        return pending;
      },

      setServerState: (dto) =>
        set({
          totalMeals: dto.total_meals,
          stabilityPct: dto.stability_pct,
          activeEvent: dto.active_event,
          isCollapsed: dto.is_collapsed,
          collapseEndsAt: dto.collapse_ends_at,
          lastCollapser: dto.last_collapser_username,
          activePlayersCount: dto.active_players_count,
          online: true,
        }),

      setOnline: (online) => set({ online }),

      reconcilePersonal: (meals) => set({ personalMeals: meals }),

      // Reconcile immediate fields from a /api/click response (full state still
      // comes from polling /api/state).
      applyClickResponse: (resp) =>
        set((s) => ({
          totalMeals: resp.new_total_meals,
          stabilityPct: resp.new_stability_pct,
          personalMeals: resp.personal_meals,
          online: true,
          isCollapsed: resp.collapsed ? true : s.isCollapsed,
          collapseEndsAt: resp.collapsed
            ? resp.collapse_ends_at
            : s.collapseEndsAt,
          lastCollapser: resp.collapsed ? resp.collapser : s.lastCollapser,
        })),

      // Offline-only recovery simulation (server is authoritative when online).
      localStabilityTick: (dtMs) => {
        const s = get();
        if (s.online) return;
        if (s.isCollapsed) {
          // Clear the local collapse once the freeze window elapses.
          if (
            s.collapseEndsAt &&
            new Date(s.collapseEndsAt).getTime() <= Date.now()
          ) {
            set({ isCollapsed: false, collapseEndsAt: null, stabilityPct: 0 });
          }
          return;
        }
        const players = Math.max(1, s.activePlayersCount);
        set({ stabilityPct: decayStability(s.stabilityPct, dtMs, players) });
      },

      breakCombo: () => {
        if (get().comboCount !== 0) set({ comboCount: 0 });
      },

      setSeenIntro: (seen) => set({ seenIntro: seen }),
      toggleMute: () => set({ audioMuted: !get().audioMuted }),
      setVolume: (v) => set({ audioVolume: clamp(v, 0, 1) }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: LS_KEYS.store,
      storage: createJSONStorage(() => localStorage),
      // Only persist local identity + settings, never server-synced state.
      partialize: (s) => ({
        username: s.username,
        playerId: s.playerId,
        selectedLauk: s.selectedLauk,
        personalMeals: s.personalMeals,
        audioMuted: s.audioMuted,
        audioVolume: s.audioVolume,
        seenIntro: s.seenIntro,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
