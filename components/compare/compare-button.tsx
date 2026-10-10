"use client";

import { GitCompare } from "lucide-react";
import type { Product } from "@prisma/client";
import { COMPARE_MAX, useCompareStore } from "@/store/compare-store";
import { cn } from "@/lib/utils";

export function CompareButton({ product }: { product: Product }) {
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);
  const active = ids.includes(product.id);
  const full = !active && ids.length >= COMPARE_MAX;

  return (
    <button
      onClick={() => toggle(product.id)}
      disabled={full}
      aria-pressed={active}
      aria-label={active ? `Quitar ${product.name} del comparador` : `Comparar ${product.name}`}
      title={full ? `Máximo ${COMPARE_MAX} motos` : "Comparar"}
      className={cn(
        "grid size-9 place-items-center rounded-full border transition",
        active
          ? "border-steel bg-steel/15 text-steel"
          : "border-white/10 text-text-muted hover:border-white/25 hover:text-text",
        full && "cursor-not-allowed opacity-40",
      )}
    >
      <GitCompare size={16} aria-hidden />
    </button>
  );
}
