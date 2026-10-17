"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCourse } from "@/lib/capacitacion-actions";

export function DeleteCourseButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <span>
      <button
        disabled={busy}
        onClick={async () => {
          if (!window.confirm(`¿Borrar "${title}"?`)) return;
          setBusy(true);
          setError("");
          try {
            await deleteCourse(id);
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo borrar");
            setBusy(false);
          }
        }}
        className="rounded-full border border-danger/40 px-3 py-1 text-xs text-danger hover:bg-danger/10 disabled:opacity-50"
      >
        {busy ? "…" : "Borrar"}
      </button>
      {error ? <span className="ml-2 text-xs text-danger">{error}</span> : null}
    </span>
  );
}