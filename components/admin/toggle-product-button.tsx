"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setProductActive } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

/**
 * Habilita o inhabilita un producto desde la tabla del admin.
 * Inhabilitar lo oculta del catálogo sin borrarlo (conserva pedidos).
 */
export function ToggleProductActiveButton({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optimistic, setOptimistic] = useState(active);

  const onClick = async () => {
    const next = !optimistic;
    if (!next && !window.confirm(`¿Inhabilitar "${name}"? Dejará de verse en el catálogo.`)) {
      return;
    }
    setLoading(true);
    setError("");
    const res = await setProductActive(id, next);
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo cambiar el estado");
      return;
    }
    setOptimistic(next);
    router.refresh();
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={onClick}
        disabled={loading}
        className={cn(
          "rounded-full border px-3 py-1 text-xs transition disabled:opacity-50",
          optimistic
            ? "border-white/15 text-text-muted hover:border-white/30 hover:text-text"
            : "border-steel/50 text-steel hover:bg-steel/10",
        )}
      >
        {loading ? "…" : optimistic ? "Inhabilitar" : "Habilitar"}
      </button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </span>
  );
}
