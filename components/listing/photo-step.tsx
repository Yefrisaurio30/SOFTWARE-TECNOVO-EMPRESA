"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_FILES, MAX_TOTAL_BYTES, formatKB } from "@/lib/image-validation";
import { submitForReview } from "@/lib/listing-actions";

export function PhotoStep({
  listingId,
  initialImages,
}: {
  listingId: string;
  initialImages: string[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [usedBytes, setUsedBytes] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchUsage = useCallback(async () => {
    const res = await fetch(`/api/listings/images?listingId=${listingId}`);
    if (res.ok) {
      const j = (await res.json()) as { images: string[]; usedBytes: number };
      setImages(j.images);
      setUsedBytes(j.usedBytes);
    }
  }, [listingId]);

  useEffect(() => {
    void fetchUsage();
  }, [fetchUsage]);

  // Best-effort: si el usuario sale sin enviar, el borrador se descarta.
  // No es garantía (el navegador puede morir sin disparar el evento);
  // el barrido de 30 minutos cubre ese caso.
  useEffect(() => {
    const onHide = () => {
      const payload = JSON.stringify({ id: listingId });
      try {
        navigator.sendBeacon("/api/listings/discard", new Blob([payload], { type: "application/json" }));
      } catch {
        void fetch("/api/listings/discard", {
          method: "POST",
          body: payload,
          keepalive: true,
        });
      }
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [listingId]);

  const upload = async (files: FileList) => {
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("listingId", listingId);
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/listings/images", { method: "POST", body: fd });
      const json = (await res.json()) as { error?: string; usedBytes?: number };
      if (!res.ok) {
        setError(json.error ?? "No se pudieron subir las fotos");
        return;
      }
      if (typeof json.usedBytes === "number") setUsedBytes(json.usedBytes);
      await fetchUsage();
    } catch {
      setError("Error de red al subir");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (url: string) => {
    setError("");
    await fetch(`/api/listings/images?url=${encodeURIComponent(url)}`, { method: "DELETE" });
    await fetchUsage();
  };

  const send = async () => {
    setError("");
    setBusy(true);
    const res = await submitForReview(listingId);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/mis-anuncios?enviado=1");
    router.refresh();
  };

  const remaining = MAX_TOTAL_BYTES - usedBytes;

  return (
    <div className="max-w-2xl">
      <div className="rounded-[28px] border border-white/10 bg-surface p-6">
        <p className="text-sm font-medium">
          Paso 2 de 2 · Fotos de tu anuncio{" "}
          <span className="text-text-muted tabular-nums">
            ({images.length}/{MAX_FILES})
          </span>
        </p>
        <p className="mt-1 text-sm text-text-muted tabular-nums">
          {formatKB(usedBytes)} de 8 MB usados. Te queda {formatKB(remaining)}.
        </p>

        {images.length > 0 ? (
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {images.map((src) => (
              <li key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full rounded-2xl border border-white/10 object-cover" />
                <button
                  type="button"
                  onClick={() => remove(src)}
                  aria-label="Quitar foto"
                  className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-black/70 text-sm text-white"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {images.length < MAX_FILES ? (
          <div className="mt-4">
            <label
              htmlFor="li-photos"
              className="block w-full cursor-pointer rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-text-muted hover:border-steel/50"
            >
              {busy ? "Subiendo…" : "Toca para elegir fotos de tu moto"}
            </label>
            <input
              id="li-photos"
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => e.target.files && upload(e.target.files)}
            />
            <p className="mt-2 text-xs text-text-faint">
              Hasta {MAX_FILES} fotos, 8 MB en total. JPG, PNG, WebP, GIF, AVIF, HEIC o BMP.
            </p>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mt-4 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          onClick={send}
          disabled={busy || images.length === 0}
          className="mt-6 w-full rounded-full bg-steel py-3 text-[15px] font-medium text-black disabled:opacity-50"
        >
          {busy ? "Enviando…" : "Enviar a revisión"}
        </button>
        <p className="mt-2 text-center text-xs text-text-faint">
          Un administrador revisa tu anuncio antes de que aparezca en el catálogo.
        </p>
      </div>
    </div>
  );
}