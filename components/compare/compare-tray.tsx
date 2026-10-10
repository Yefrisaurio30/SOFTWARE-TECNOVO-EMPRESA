"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCompareStore } from "@/store/compare-store";

export function CompareTray() {
  const ids = useCompareStore((s) => s.ids);
  const clear = useCompareStore((s) => s.clear);

  return (
    <AnimatePresence>
      {ids.length >= 2 ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-full border border-white/10 bg-graphite/95 py-2 pr-2 pl-5 text-text backdrop-blur-xl"
          role="region"
          aria-label="Comparador"
        >
          <p className="text-sm">
            <strong className="tabular-nums">{ids.length}</strong>{" "}
            <span className="text-text-muted">para comparar</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={clear}
              aria-label="Limpiar comparador"
              className="grid size-8 place-items-center rounded-full text-text-faint hover:text-text"
            >
              <X size={15} />
            </button>
            <Link
              href={`/comparar?ids=${ids.join(",")}`}
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
            >
              Comparar
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
