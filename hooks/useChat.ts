"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT, POLL, SUPABASE_CONFIGURED } from "@/lib/constants";
import { useGameStore } from "@/store/gameStore";
import type { ChatMessage } from "@/lib/types";

/** Chat state: polls /api/chat every 3s and sends messages via POST. */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastIdRef = useRef(0);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    let cancelled = false;

    async function poll() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const since = lastIdRef.current;
        const res = await fetch(
          `/api/chat${since ? `?since=${since}` : ""}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: ChatMessage[] };
        const incoming = data.messages ?? [];
        if (cancelled || incoming.length === 0) return;

        setMessages((prev) => {
          const seen = new Set<number>();
          const out: ChatMessage[] = [];
          for (const m of [...prev, ...incoming]) {
            if (!seen.has(m.id)) {
              seen.add(m.id);
              out.push(m);
            }
          }
          return out.slice(-CHAT.maxVisible);
        });
        lastIdRef.current = Math.max(
          lastIdRef.current,
          ...incoming.map((m) => m.id),
        );
      } catch {
        // ignore; will retry next tick
      }
    }

    poll();
    const id = window.setInterval(poll, POLL.chatMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) return false;
    if (trimmed.length > CHAT.maxChars) {
      setError(`Maks ${CHAT.maxChars} karakter.`);
      return false;
    }
    if (!SUPABASE_CONFIGURED) {
      setError("Buletin butuh koneksi server.");
      return false;
    }

    const { playerId, username } = useGameStore.getState();
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: playerId,
          username,
          message: trimmed,
        }),
      });
      if (res.status === 429) {
        setError("Sabar — 1 pesan tiap 3 detik.");
        return false;
      }
      if (!res.ok) {
        setError("Gagal kirim pesan.");
        return false;
      }
      return true;
    } catch {
      setError("Gagal kirim pesan.");
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  return { messages, sendMessage, sending, error, enabled: SUPABASE_CONFIGURED };
}
