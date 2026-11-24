"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/money";
import {
  commissionBreakdown,
  rateLabel,
  tierLabel,
} from "@/lib/listing-commission";
import { ConsentCheckboxes } from "@/components/legal/consent-checkboxes";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

export function ListingForm({
  defaults,
  remaining,
}: {
  defaults?: {
    name: string;
    brand: string;
    year: number;
    km: number;
    price: number;
    city: string;
    phone: string;
    description: string;
  };
  remaining: number;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [consents, setConsents] = useState(false);
  const [price, setPrice] = useState(String(defaults?.price ?? 0));
  const [year, setYear] = useState(defaults?.year ?? new Date().getFullYear() - 3);
  const [km, setKm] = useState(String(defaults?.km ?? 0));
  const [description, setDescription] = useState(defaults?.description ?? "");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          brand: fd.get("brand"),
          year: Number(fd.get("year")),
          km: Number(fd.get("km")),
          price: Number(fd.get("price")),
          city: fd.get("city"),
          phone: fd.get("phone"),
          description: fd.get("description"),
          // Las casillas viven dentro del form, así que llegan por FormData.
          terms: fd.get("terms") === "on",
          privacy: fd.get("privacy") === "on",
        }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        setError(json.error ?? "No se pudo crear la publicación");
        return;
      }
      router.push(`/publicar/fotos?id=${json.id}`);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="li-name" className={labelCls}>Modelo (año / referencia / versión)</label>
          <input id="li-name" name="name" required minLength={3} defaultValue={defaults?.name ?? ""} placeholder="Ej: TEC-ONE 2024 — versión estándar" className={inputCls} />
          <p className="mt-1 text-xs text-text-muted">Indica el año/modelo, la referencia o la versión de la moto.</p>
        </div>
        <div>
          <label htmlFor="li-brand" className={labelCls}>Marca</label>
          <input id="li-brand" name="brand" required minLength={2} defaultValue={defaults?.brand ?? ""} placeholder="TECNOVO" className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-year" className={labelCls}>Año</label>
          <input id="li-year" name="year" type="number" min={1990} max={new Date().getFullYear() + 1} required value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-km" className={labelCls}>Kilometraje</label>
          <input id="li-km" name="km" type="number" min={0} required value={km} onChange={(e) => setKm(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-price" className={labelCls}>Precio de venta (COP)</label>
          <input id="li-price" name="price" type="number" min={50000} step={1000} required value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
          {Number(price) > 0 ? (
            <div className="mt-1 space-y-0.5">
              <p className="text-xs text-text-faint tabular-nums">
                Lo verá el comprador: {formatCOP(Number(price))}
              </p>
              {Number(price) >= 50000 ? (
                <div className="rounded-xl border border-steel/40 bg-steel/5 px-3 py-2">
                  <p className="text-xs font-medium text-steel-deep tabular-nums">
                    Tramo: {tierLabel(Number(price))}
                  </p>
                  {(() => {
                    const b = commissionBreakdown(Number(price));
                    return (
                      <p className="mt-0.5 text-xs text-text tabular-nums">
                        Comisión {rateLabel(b.rate)} ({formatCOP(b.commission)}) →{" "}
                        <strong className="text-steel-deep">Te quedan: {formatCOP(b.netEarn)}</strong>
                      </p>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-xs text-danger tabular-nums">El precio mínimo es $50.000</p>
              )}
              <p className="text-[11px] text-text-faint">
                Tramos: menos de $100.000 → 15 % · de $100.000 a $1.000.000 → 10 % · más de $1.000.000 → 8 %
              </p>
            </div>
          ) : null}
        </div>
        <div>
          <label htmlFor="li-city" className={labelCls}>Ciudad</label>
          <input id="li-city" name="city" required minLength={2} defaultValue={defaults?.city ?? ""} placeholder="Villavicencio" className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-phone" className={labelCls}>Tu celular</label>
          <input id="li-phone" name="phone" type="tel" required defaultValue={defaults?.phone ?? ""} placeholder="312 277 9324" className={inputCls} />
          <p className="mt-1 text-xs text-text-faint">Lo ven los compradores del anuncio, no el público en general.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="li-desc" className={labelCls}>Descripción (mínimo 40 caracteres)</label>
          <textarea id="li-desc" name="description" rows={5} required minLength={40} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Estado, batería, mantenimiento, por qué la vendes…" className={inputCls} />
          <p className="mt-1 text-xs text-text-faint tabular-nums">{description.trim().length}/40 mínimo</p>
        </div>
      </div>
      <ConsentCheckboxes onChange={setConsents} />
      {error ? (
        <p role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving || remaining <= 0 || !consents}
          className="rounded-full bg-steel px-7 py-3 text-[15px] font-medium text-white disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Continuar a las fotos"}
        </button>
        <p className="text-sm text-text-muted tabular-nums">
          Te quedan <strong>{remaining}</strong> publicaciones hoy.
        </p>
      </div>
      {!consents ? (
        <p className="-mt-2 text-xs text-text-faint">
          Marca las dos casillas para poder continuar.
        </p>
      ) : null}
    </form>
  );
}