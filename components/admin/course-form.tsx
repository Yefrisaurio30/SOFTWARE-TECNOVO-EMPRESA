"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@prisma/client";
import { saveCourse } from "@/lib/capacitacion-actions";
import { parseYoutubeId } from "@/lib/youtube";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

function toDateInput(iso: Date | null): string {
  if (!iso) return "";
  const d = new Date(iso.getTime() - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}

export function CourseForm({ course }: { course?: Course | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    course?.youtubeUrl ? parseYoutubeId(course.youtubeUrl) : null,
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const priceRaw = String(fd.get("price") ?? "").trim();
    const res = await saveCourse(
      {
        title: fd.get("title"),
        summary: fd.get("summary"),
        youtubeUrl: fd.get("youtubeUrl"),
        startsAt: fd.get("startsAt"),
        modality: fd.get("modality"),
        city: fd.get("city"),
        price: priceRaw === "" ? undefined : Number(priceRaw),
        active: fd.get("active") === "on",
      },
      course?.id,
    );
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin/capacitacion");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="co-title" className={labelCls}>Título</label>
          <input id="co-title" name="title" required defaultValue={course?.title ?? ""} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="co-summary" className={labelCls}>Resumen</label>
          <textarea id="co-summary" name="summary" rows={3} defaultValue={course?.summary ?? ""} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="co-yt" className={labelCls}>Video de YouTube (URL o ID)</label>
          <input
            id="co-yt"
            name="youtubeUrl"
            defaultValue={course?.youtubeUrl ?? ""}
            placeholder="https://www.youtube.com/watch?v=..."
            onChange={(e) => setPreview(parseYoutubeId(e.target.value))}
            className={inputCls}
          />
          {preview ? (
            <p className="mt-1 text-xs text-steel">Video detectado: {preview}</p>
          ) : course?.youtubeUrl ? (
            <p className="mt-1 text-xs text-danger">La URL guardada no es válida</p>
          ) : (
            <p className="mt-1 text-xs text-text-faint">Opcional. Si no hay video, sale una portada con ícono.</p>
          )}
        </div>
        <div>
          <label htmlFor="co-date" className={labelCls}>Fecha de inicio</label>
          <input id="co-date" name="startsAt" type="date" defaultValue={toDateInput(course?.startsAt ?? null)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="co-mod" className={labelCls}>Modalidad</label>
          <input id="co-mod" name="modality" defaultValue={course?.modality ?? ""} placeholder="Presencial / Virtual / Mixta" className={inputCls} />
        </div>
        <div>
          <label htmlFor="co-city" className={labelCls}>Ciudad</label>
          <input id="co-city" name="city" defaultValue={course?.city ?? ""} className={inputCls} />
        </div>
        <div>
          <label htmlFor="co-price" className={labelCls}>Precio (COP, vacío = gratis)</label>
          <input id="co-price" name="price" type="number" min={0} step={1000} defaultValue={course?.price ?? ""} className={inputCls} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={course?.active ?? true} className="size-4 accent-white" /> Visible
        </label>
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div>
        <button type="submit" disabled={saving} className="rounded-full bg-steel px-7 py-3 text-[15px] font-medium text-black disabled:opacity-60">
          {saving ? "Guardando…" : course ? "Guardar cambios" : "Crear curso"}
        </button>
      </div>
    </form>
  );
}