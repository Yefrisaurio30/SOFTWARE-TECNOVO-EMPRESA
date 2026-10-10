"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full border border-white/15 px-5 py-2 text-sm transition hover:border-white/30"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
