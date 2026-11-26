import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const url = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/pedido",
          "/checkout",
          "/carrito",
          "/login",
          "/registro",
          "/mis-anuncios",
          "/publicar",
          "/distribuidores/catalogo",
          "/distribuidores/pedidos",
        ],
      },
    ],
    sitemap: `${url}/sitemap.xml`,
  };
}
