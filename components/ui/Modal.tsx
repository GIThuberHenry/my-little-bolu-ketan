"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

/** Centered modal with backdrop. `dismissable` allows backdrop-click to close. */
export function Modal({
  open,
  onClose,
  children,
  dismissable = true,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  dismissable?: boolean;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-mbg-ink/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dismissable && onClose?.()}
        >
          <motion.div
            className="w-full max-w-md rounded-sm border-[3px] border-mbg-ink bg-mbg-cream shadow-[8px_8px_0_0_rgba(26,26,26,0.85)]"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
