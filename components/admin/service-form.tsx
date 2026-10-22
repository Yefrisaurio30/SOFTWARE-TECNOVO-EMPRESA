"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@prisma/client";
import { saveService } from "@/lib/taller-actions";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

export function ServiceForm({ service }: { service?: Service | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await saveService(
      {
        name: fd.get("name"),
        city: fd.get("city"),
        address: fd.get("address"),
        phone: fd.get("phone"),
        mapsUrl: fd.get("mapsUrl"),
        servicesRaw: fd.get("servicesRaw"),
        warranty: fd.get("warranty") === "on",
        isHeadquarter: fd.get("isHeadquarter") === "on",
        active: fd.get("active") === "on",
      },
      service?.id,
    );
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin/taller");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sv-name" className={labelCls}>Nombre</label>
          <input id="sv-name" name="name" required defaultValue={service?.name ?? ""} className={inputCls} />
        </div>
        <div>
          <label htmlFor="sv-city" className={labelCls}>Ciudad</label>
          <input id="sv-city" name="city" required defaultValue={service?.city ?? ""} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sv-address" className={labelCls}>Dirección</label>
          <input id="sv-address" name="address" defaultValue={service?.address ?? ""} className={inputCls} />
        </div>
        <div>
          <label htmlFor="sv-phone" className={labelCls}>Teléfono</label>
          <input id="sv-phone" name="phone" defaultValue={service?.phone ?? ""} className={inputCls} />
        </div>
        <div>
          <label htmlFor="sv-maps" className={labelCls}>URL de Google Maps</label>
          <input id="sv-maps" name="mapsUrl" type="url" defaultValue={service?.mapsUrl ?? ""} placeholder="https://maps.app.goo.gl/..." className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sv-services" className={labelCls}>Servicios (uno por línea)</label>
          <textarea
            id="sv-services"
            name="servicesRaw"
            rows={4}
            defaultValue={(service?.services ?? []).join("\n")}
            placeholder={"Mecánica general\nCambio de batería\nDiagnóstico eléctrico"}
            className={inputCls}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="warranty" defaultChecked={service?.warranty ?? true} className="size-4 accent-white" /> Acepta garantía
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isHeadquarter" defaultChecked={service?.isHeadquarter ?? false} className="size-4 accent-white" /> Sede principal
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={service?.active ?? true} className="size-4 accent-white" /> Activo
        </label>
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div>
        <button type="submit" disabled={saving} className="rounded-full bg-steel px-7 py-3 text-[15px] font-medium text-[#000] disabled:opacity-60">
          {saving ? "Guardando…" : service ? "Guardar cambios" : "Crear punto de servicio"}
        </button>
      </div>
    </form>
  );
}