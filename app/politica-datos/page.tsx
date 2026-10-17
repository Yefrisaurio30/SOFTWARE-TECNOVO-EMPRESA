import { redirect } from "next/navigation";

/**
 * Ruta antigua. La política de privacidad vive ahora en
 * /legales/politica-de-privacidad (requisito Ley 1581 de 2012).
 * Se redirige para no romper enlaces ni duplicar contenido legal.
 */
export default function PoliticaDatosRedirect() {
  redirect("/legales/politica-de-privacidad");
}