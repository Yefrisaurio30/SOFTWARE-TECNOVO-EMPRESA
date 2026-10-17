import { redirect } from "next/navigation";

/**
 * Alias del módulo de moderación. El nombre pedido en la especificación legal
 * es /admin/moderacion; la vista construida y probada vive en /admin/anuncios.
 */
export default function ModeracionRedirect() {
  redirect("/admin/anuncios");
}