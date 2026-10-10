"use client";

import { useState } from "react";
import { deleteProduct } from "@/lib/admin-actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!window.confirm(`¿Borrar "${name}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    setError("");
    const res = await deleteProduct(id);
    setLoading(false);
    if (!res.ok) setError(res.error);
  };

  return (
    <span>
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-full border border-danger/40 px-3 py-1 text-xs text-danger hover:bg-danger/10 disabled:opacity-50"
      >
        {loading ? "…" : "Borrar"}
      </button>
      {error ? <span className="ml-2 text-xs text-danger">{error}</span> : null}
    </span>
  );
}
