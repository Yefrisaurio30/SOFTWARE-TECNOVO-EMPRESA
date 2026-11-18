"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { reviewListing } from "@/lib/moderation-actions";
import { formatCOP } from "@/lib/money";
import { getSpecs } from "@/lib/products";
import { specValue } from "@/lib/specs";

interface Pending {
  id: string;
  name: string;
  brand: string;
  description: string;
  priceRetail: number;
  images: string[];
  specs: Prisma.JsonValue;
  createdAt: Date;
  owner: { name: string | null; email: string } | null;
}

export function ModerationCard({ listing }: { listing: Pending }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const specs = getSpecs({ specs: listing.specs });

  const decide = async (decision: "APPROVED" | "REJECTED") => {
    if (decision === "REJECTED" && note.trim().length < 5) {
      setError("Escribe el motivo: el usuario lo necesita para corregir el anuncio.");
      return;
    }
    if (!window.confirm(decision === "APPROVED" ? "¿Aprobar y publicar?" : "¿Rechazar?")) return;
    setBusy(true);
    setError("");
    const res = await reviewListing(listing.id, decision, note);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNote("");
    router.refresh();
  };

  return (
    <article className="rounded-[24px] border border-white/10 bg-surface p-5">
      <div className="flex flex-wrap gap-5">
        <div className="flex shrink-0 flex-wrap gap-2">
          {listing.images.length > 0 ? (
            listing.images.slice(0, 5).map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={128}
                height={128}
                quality={75}
                sizes="128px"
                className="size-24 rounded-2xl border border-white/10 object-cover"
              />
            ))
          ) : (
            <div className="grid size-24 place-items-center rounded-2xl border border-dashed border-white/15 text-xs text-text-faint">
              sin fotos
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">{listing.name}</h3>
            <p className="text-xl font-semibold tabular-nums">{formatCOP(listing.priceRetail)}</p>
          </div>
          <p className="text-sm text-text-muted">
            {listing.brand} · {specValue("anio", specs.anio ?? "—")} ·{" "}
            {specValue("kilometraje_km", specs.kilometraje_km ?? "—")} · {specValue("ciudad", specs.ciudad ?? "—")}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Contacto: {specValue("telefono", specs.telefono ?? "—")} ·{" "}
            {listing.owner?.name ?? listing.owner?.email ?? "sin cuenta"}
          </p>
          <p className="mt-2 text-xs text-text-faint">
            Publicado el {listing.createdAt.toLocaleDateString("es-CO")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{listing.description}</p>

          <div className="mt-4 flex flex-wrap items-start gap-3">
            <button
              onClick={() => decide("APPROVED")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-steel px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Check size={15} aria-hidden /> Aprobar
            </button>
            <label htmlFor={`note-${listing.id}`} className="sr-only">
              Motivo del rechazo
            </label>
            <input
              id={`note-${listing.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Motivo del rechazo (lo ve el usuario)"
              className="min-w-56 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none focus:border-steel/60"
            />
            <button
              onClick={() => decide("REJECTED")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-danger/40 px-5 py-2 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
            >
              <X size={15} aria-hidden /> Rechazar
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        </div>
      </div>
    </article>
  );
}