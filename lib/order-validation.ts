import { z } from "zod";

export const CartItemInput = z.object({
  productId: z.string().cuid(),
  qty: z.number().int().min(1).max(99),
});

export const CreateOrderInput = z.object({
  items: z.array(CartItemInput).min(1).max(50),
  contactName: z.string().trim().min(3).max(120),
  contactPhone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{7,15}$/, "Teléfono inválido")),
  contactEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(200),
  delivery: z.enum(["ENVIO", "RECOGER"]),
});

export type CreateOrderData = z.infer<typeof CreateOrderInput>;
