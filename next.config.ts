import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // sharp se usa en las rutas de subida para comprimir fotos; mejor dejarlo
  // fuera del bundle para que use los binarios nativos precompilados.
  serverExternalPackages: ["sharp"],
  images: {
    // Formatos modernos: AVIF primero, WebP como respaldo.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Caché del optimizador: 30 días.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Fotos de producto y de anuncios que viven en Supabase Storage.
      // `STORAGE_DRIVER=supabase` devuelve URL absolutas de este origen.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Miniaturas de portada de videos de capacitación.
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
