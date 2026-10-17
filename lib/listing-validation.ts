import { z } from "zod";

const currentYear = new Date().getFullYear();

/** Paso 1: datos del anuncio. Crea el borrador. */
export const ListingDraftInput = z.object({
  name: z.string().trim().min(3, "Ponle un nombre al modelo").max(120),
  brand: z.string().trim().min(2, "Escribe la marca").max(60),
  year: z.coerce
    .number()
    .int()
    .min(1990, "El año no parece válido")
    .max(currentYear + 1, "El año no puede ser futuro"),
  km: z.coerce.number().int().min(0, "El kilometraje no puede ser negativo").max(500000),
  price: z.coerce.number().int().min(100000, "El precio mínimo es $100.000").max(200000000),
  city: z.string().trim().min(2, "Escribe la ciudad").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{7,15}$/, "Teléfono inválido (solo dígitos)")),
  description: z
    .string()
    .trim()
    .min(40, "Describe la moto con al menos 40 caracteres")
    .max(1500),
});

export type ListingDraftData = z.infer<typeof ListingDraftInput>;

/** Cuotas del marketplace. */
export const MAX_LISTINGS_PER_DAY = 10;
export const MAX_CONCURRENT_DRAFTS = 3;
/** Minutos que vive un borrador sin tocarse. */
export const DRAFT_TTL_MINUTES = 30;

export const ListingStatusLabel: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING: "En revisión",
  APPROVED: "Publicado",
  REJECTED: "Rechazado",
};