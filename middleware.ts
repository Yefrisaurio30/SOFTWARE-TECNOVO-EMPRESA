import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Node y no Edge.
 *
 * `NextAuth(authConfig)` arrastra next-auth, @auth/core y zod al bundle, y en
 * Edge eso daba 1.03 MB contra el tope de 1 MB del plan Hobby, que rechazaba
 * el despliegue. En Node el tope de bundle es de 250 MB.
 *
 * No cambia nada del comportamiento: same auth(), same reglas, misma sesion.
 */
export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  /**
   * Los despliegues de preview no escriben.
   *
   * En el plan Hobby las variables de Preview y Production son las mismas, asi
   * que un preview recibe el DATABASE_URL de la base real. Sin este bloqueo,
   * probar el checkout o publicar un anuncio desde un preview deja pedidos y
   * borradores en produccion. Sigue pudiendo LEER, que es lo que sirve para
   * revisar la interfaz sin consequences.
   *
   * En local no hay VERCEL_ENV, asi que `npm run dev` escribe normal.
   */
  if (
    process.env.VERCEL_ENV === "preview" &&
    req.method !== "GET" &&
    req.method !== "HEAD"
  ) {
    return new Response("Despliegue de prueba: no acepta escrituras.", { status: 503 });
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "SUPERADMIN") {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return Response.redirect(url);
    }
    return;
  }

  if (
    pathname.startsWith("/distribuidores/catalogo") ||
    pathname.startsWith("/distribuidores/pedidos") ||
    pathname.startsWith("/api/distribuidor")
  ) {
    if (!req.auth?.user) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return Response.redirect(url);
    }
    return;
  }
});

/**
 * `/api/:path*` esta incluido para que el bloqueo de escrituras de los
 * previews cubra TODAS las rutas de la API, no solo las de distribuidor. Sin
 * eso, un preview podria seguir creando pedidos por /api/orders.
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/distribuidores/catalogo",
    "/distribuidores/pedidos",
    "/api/:path*",
  ],
};
