/**
 * Extrae el ID de un video de YouTube desde una URL o un ID suelto.
 * Acepta: youtube.com/watch?v=ID · youtu.be/ID · youtube.com/shorts/ID · youtube.com/embed/ID · ID
 * Devuelve null si no parece un ID válido de YouTube.
 */
export function parseYoutubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;
  const direct = /^[A-Za-z0-9_-]{11}$/.test(raw) ? raw : null;
  if (direct) return direct;
  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const seg = url.pathname.split("/").filter(Boolean)[0];
    return seg && /^[A-Za-z0-9_-]{11}$/.test(seg) ? seg : null;
  }
  if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;
  const v = url.searchParams.get("v");
  if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
  const m = url.pathname.match(/\/(embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
  return m ? m[2] : null;
}

/** URL de embed sin cookies ni rastreo previo. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** Miniatura oficial de YouTube (no requiere API key). */
export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}