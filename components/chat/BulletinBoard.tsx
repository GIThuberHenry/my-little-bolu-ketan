"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Panel } from "@/components/ui/GovDashboardFrame";
import { colorForUsername } from "@/lib/username-generator";
import { useChat } from "@/hooks/useChat";
import { CHAT } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";

export function BulletinBoard() {
  const { messages, sendMessage, sending, error, enabled } = useChat();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const ok = await sendMessage(draft);
    if (ok) setDraft("");
  }

  return (
    <Panel title="📢 Buletin Warga" bodyClassName="p-0">
      <ul className="flex max-h-64 min-h-32 flex-col gap-1 overflow-y-auto p-2">
        {!enabled ? (
          <li className="px-2 py-3 text-center font-sans text-xs text-mbg-ink/50">
            Buletin warga aktif setelah terhubung ke server pusat.
          </li>
        ) : messages.length === 0 ? (
          <li className="px-2 py-3 text-center font-sans text-xs text-mbg-ink/50">
            Buletin warga masih sepi. Sapa dulu kek.
          </li>
        ) : (
          messages.map((m) => <ChatLine key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </ul>

      <div className="border-t-2 border-mbg-ink p-2">
        <div className="flex gap-2">
          <input
            value={draft}
            disabled={!enabled || sending}
            maxLength={CHAT.maxChars}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={
              enabled ? "Tulis pesan…" : "Buletin (offline)…"
            }
            className="min-w-0 flex-1 rounded-sm border-2 border-mbg-ink bg-mbg-white px-2 py-1 font-sans text-xs outline-none focus:bg-mbg-cream disabled:border-mbg-ink/30 disabled:bg-mbg-cream/50 disabled:text-mbg-ink/50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!enabled || sending || !draft.trim()}
            className="rounded-sm border-2 border-mbg-ink bg-mbg-red px-2 font-mono text-xs text-mbg-white transition hover:bg-mbg-ink disabled:border-mbg-ink/30 disabled:bg-mbg-cream/50 disabled:text-mbg-ink/50"
          >
            Kirim
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-mbg-ink/50">
          <span className="text-mbg-red">{error ?? ""}</span>
          <span>
            {draft.length}/{CHAT.maxChars}
          </span>
        </div>
      </div>
    </Panel>
  );
}

export function ChatLine({ message }: { message: ChatMessage }) {
  if (message.is_system) {
    return (
      <motion.li
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-sm bg-mbg-cream px-2 py-1 font-mono text-[11px] text-mbg-ink/80"
      >
        {message.message}
      </motion.li>
    );
  }
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-1 py-0.5 font-sans text-xs leading-snug"
    >
      <span
        className="font-display tracking-wide"
        style={{ color: colorForUsername(message.username) }}
      >
        {message.username}
      </span>{" "}
      <span className="text-mbg-ink/85">{message.message}</span>
    </motion.li>
  );
}
