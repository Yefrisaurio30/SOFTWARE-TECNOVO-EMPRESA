import { prisma } from "@/lib/prisma";

export const CONSENT_SOURCES = ["REGISTRO", "PUBLICACION"] as const;
export type ConsentSource = (typeof CONSENT_SOURCES)[number];

/**
 * Extrae la IP de origen del cliente.
 * Detrás de un proxy (Caddy en producción) `x-forwarded-for` trae la IP real
 * del visitante como primer valor. En local devuelve ::1.
 */
export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "desconocida";
}

export type ConsentFlags = { terms: boolean; privacy: boolean };

/**
 * Valida en SERVIDOR que ambas casillas se marcaron.
 * El `required` del HTML es solo cliente: sin esto la prueba sería falsificable.
 */
export function areConsentsGiven(flags: unknown): flags is ConsentFlags {
  if (typeof flags !== "object" || flags === null) return false;
  const f = flags as Record<string, unknown>;
  return f.terms === true && f.privacy === true;
}

export interface RecordConsentInput extends ConsentFlags {
  email: string;
  userId?: string | null;
  source: ConsentSource;
  ipAddress: string;
  userAgent?: string | null;
}

/**
 * Datos de la persona, recortados a lo necesario.
 * `terms` y `privacy` ya fueron validados en true por `areConsentsGiven`.
 */
export function normalizeConsentInput(raw: unknown): ConsentFlags {
  if (typeof raw !== "object" || raw === null) return { terms: false, privacy: false };
  const r = raw as Record<string, unknown>;
  return { terms: r.terms === true, privacy: r.privacy === true };
}

/**
 * Graba la evidencia de consentimiento. Pensado para usarse DENTRO de la misma
 * transacción que crea el usuario o el anuncio: o se guarda todo, o nada.
 */
export function buildConsentData(input: RecordConsentInput) {
  const now = new Date();
  return {
    email: input.email.trim().toLowerCase().slice(0, 160),
    userId: input.userId ?? null,
    source: input.source,
    termsAccepted: true,
    termsAcceptedAt: now,
    privacyAccepted: true,
    privacyAcceptedAt: now,
    ipAddress: input.ipAddress.slice(0, 45),
    userAgent: input.userAgent?.slice(0, 300) ?? null,
  };
}

export async function getConsents(skip = 0, take = 200) {
  const [items, total] = await Promise.all([
    prisma.consent.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.consent.count(),
  ]);
  return { items, total };
}