import type { Metadata } from "next";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** schema.org exige URL absolutas en image y offers.url. */
export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteUrl()}${path}`;
}

/**
 * Canonical y Open Graph por página. La ruta se pasa relativa ("/taller") y
 * Next la resuelve con metadataBase del layout, así que nunca queda una URL
 * de localhost ni del dominio de Vercel en el HTML publicado.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = "/brand/tecnovo-logo-negro.png",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: `${siteUrl()}${path}`,
      siteName: "TECNOVO",
      locale: "es_CO",
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** Páginas privadas o transaccionales: que no las indexen aunque se enlacen. */
export function privateMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false } };
}

/**
 * JSON-LD seguro: un "<" literal dentro de una descripción de la BD podría
 * cerrar la etiqueta <script>. Escaparlo no cambia el valor del string JSON.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
