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

export const config = {
  matcher: ["/admin/:path*", "/distribuidores/catalogo", "/distribuidores/pedidos", "/api/distribuidor/:path*"],
};
