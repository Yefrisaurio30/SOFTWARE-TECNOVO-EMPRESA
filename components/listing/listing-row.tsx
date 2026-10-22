"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { discardListing, markAsSold, resubmitListing } from "@/lib/listing-actions";
import type { ListingStatus } from "@prisma/client";

interface Row {
  id: string;
  name: string;
  brand: string;
  priceRetail: number;
  status: ListingStatus;
  reviewNote: string | null;
  soldAt: Date | null;
  createdAt: Date;
  images: string[];
}

function Acciones({ row }: { row: Row }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const sold = async () => {
    if (!window.confirm(`¿Marcar "${row.name}" como vendida? Sale del catálogo al instante.`)) return;
    setError("");
    const res = await markAsSold(row.id);
    if (!res.ok) setError(res.error);
    else router.refresh();
  };

  const descartar = async () => {
    if (!window.confirm(`¿Descartar el borrador de "${row.name}"?`)) return;
    setError("");
    const res = await discardListing(row.id);
    if (!res.ok) setError(res.error);
    else router.refresh();
  };

  const reenviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await resubmitListing(row.id, {
        name: fd.get("name"),
        brand: fd.get("brand"),
        year: Number(fd.get("year")),
        km: Number(fd.get("km")),
        price: Number(fd.get("price")),
        city: fd.get("city"),
        phone: fd.get("phone"),
        description: fd.get("description"),
      });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  };

  if (row.status === "DRAFT") {
    return (
      <div className="mt-4">
        <a
          href={`/publicar/fotos?id=${row.id}`}
          className="inline-block rounded-full bg-steel px-5 py-2 text-sm font-medium text-[#000]"
        >
          Continuar y enviar a revisión
        </a>
        <button
          onClick={descartar}
          disabled={pending}
          className="ml-3 rounded-full border border-white/15 px-5 py-2 text-sm"
        >
          Descartar
        </button>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </div>
    );
  }

  if (row.status === "PENDING") {
    return (
      <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-muted">
        Tu publicación está en revisión. <strong className="text-text">Debe ser autorizada por un
        administrador</strong> de TECNOVO antes de aparecer en el catálogo.
      </p>
    );
  }

  if (row.status === "REJECTED") {
    return (
      <div className="mt-4">
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm">
          <p className="flex items-start gap-2">
            <X size={15} className="mt-0.5 shrink-0 text-danger" aria-hidden />
            <span>
              <strong className="text-danger">No lo publicamos.</strong>{" "}
              {row.reviewNote || "El administrador no dejó un motivo."}
            </span>
          </p>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-steel">Corregir y reenviar</summary>
          <form onSubmit={reenviar} className="mt-3 grid max-w-md gap-3">
            <input name="name" defaultValue={row.name} required aria-label="Modelo" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            <input name="brand" defaultValue={row.brand} required aria-label="Marca" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input name="year" type="number" defaultValue={2022} required aria-label="Año" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
              <input name="km" type="number" defaultValue={0} required aria-label="Kilometraje" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            </div>
            <input name="price" type="number" defaultValue={row.priceRetail} required aria-label="Precio" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            <input name="city" defaultValue="" required aria-label="Ciudad" placeholder="Ciudad" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            <input name="phone" required aria-label="Celular" placeholder="Celular" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            <textarea name="description" rows={3} required minLength={40} placeholder="Descripción" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
            <button disabled={pending} className="justify-self-start rounded-full bg-steel px-5 py-2 text-sm font-medium text-[#000]">
              {pending ? "Enviando…" : "Reenviar a revisión"}
            </button>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </form>
        </details>
      </div>
    );
  }

  // APPROVED y no vendido
  return (
    <div className="mt-4">
      <button
        onClick={sold}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-steel/50 px-5 py-2 text-sm text-steel hover:bg-steel/10"
      >
        <Check size={15} aria-hidden /> Marcar como vendida
      </button>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function ListingRow({ row, sold }: { row: Row; sold?: boolean }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-surface p-5">
      <div className="flex flex-wrap gap-4">
        <div className="flex shrink-0 gap-2">
          {(row.images.length > 0 ? row.images : [null]).slice(0, 3).map((src, i) =>
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="size-20 rounded-2xl border border-white/10 object-cover" />
            ) : (
              <div key={i} className="grid size-20 place-items-center rounded-2xl border border-dashed border-white/15 text-xs text-text-faint">
                sin foto
              </div>
            ),
          )}
        </div>
        <div className="min-w-52 flex-1">
          <p className="font-semibold">{row.name}</p>
          <p className="text-sm text-text-muted">
            {row.brand} · {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(row.priceRetail)}
          </p>
          <p className="mt-1 text-xs text-text-faint">
            {row.createdAt.toLocaleDateString("es-CO")}
            {sold && row.soldAt ? ` · Vendida el ${row.soldAt.toLocaleDateString("es-CO")}` : ""}
          </p>
          {sold ? (
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-text-faint">
              Anuncio cerrado. Se conserva como historial y no se puede editar ni borrar.
            </p>
          ) : (
            <Acciones row={row} />
          )}
        </div>
      </div>
    </article>
  );
}