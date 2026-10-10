"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";
import { saveProduct } from "@/lib/admin-actions";
import { getSpecs } from "@/lib/products";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

export function ProductForm({ product }: { product?: Product | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const specs = product ? getSpecs(product) : {};

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await saveProduct(
      {
        name: fd.get("name"),
        slug: fd.get("slug"),
        type: fd.get("type"),
        brand: fd.get("brand"),
        priceRetail: fd.get("priceRetail"),
        priceWholesale: (fd.get("priceWholesale") as string) || undefined,
        stock: fd.get("stock"),
        description: fd.get("description"),
        imagesRaw: fd.get("imagesRaw"),
        specsRaw: fd.get("specsRaw"),
        featured: fd.get("featured") === "on",
        active: fd.get("active") === "on",
      },
      product?.id,
    );
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="pf-name" className={labelCls}>Nombre</label>
          <input id="pf-name" name="name" required defaultValue={product?.name ?? ""} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-slug" className={labelCls}>Slug (vacío = auto)</label>
          <input id="pf-slug" name="slug" defaultValue={product?.slug ?? ""} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-type" className={labelCls}>Tipo</label>
          <select id="pf-type" name="type" defaultValue={product?.type ?? "MOTO_NUEVA"} className={inputCls}>
            <option value="MOTO_NUEVA">Moto nueva</option>
            <option value="MOTO_USADA">Moto usada</option>
            <option value="REPUESTO">Repuesto</option>
            <option value="ACCESORIO">Accesorio</option>
          </select>
        </div>
        <div>
          <label htmlFor="pf-brand" className={labelCls}>Marca</label>
          <input id="pf-brand" name="brand" required defaultValue={product?.brand ?? ""} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-retail" className={labelCls}>Precio retail (COP)</label>
            <input id="pf-retail" name="priceRetail" type="number" min={0} required defaultValue={product?.priceRetail ?? 0} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pf-ws" className={labelCls}>Mayorista (opcional)</label>
            <input id="pf-ws" name="priceWholesale" type="number" min={0} defaultValue={product?.priceWholesale ?? ""} className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="pf-stock" className={labelCls}>Stock</label>
          <input id="pf-stock" name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-desc" className={labelCls}>Descripción</label>
          <textarea id="pf-desc" name="description" rows={3} defaultValue={product?.description ?? ""} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-img" className={labelCls}>Imágenes (una URL por línea)</label>
          <textarea id="pf-img" name="imagesRaw" rows={2} defaultValue={(product?.images ?? []).join("\n")} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-specs" className={labelCls}>Specs (JSON)</label>
          <textarea id="pf-specs" name="specsRaw" rows={3} defaultValue={JSON.stringify(specs, null, 2)} className={inputCls} dir="ltr" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="size-4 accent-white" /> Destacado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-4 accent-white" /> Activo
        </label>
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div>
        <button type="submit" disabled={saving} className="rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black disabled:opacity-60">
          {saving ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
