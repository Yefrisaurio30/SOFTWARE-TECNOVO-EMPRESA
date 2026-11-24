# SEO_IMPLEMENTATION_REPORT.md

Auditoría e implementación técnica de SEO para TECNOVO. Fecha: 2026-11-24.

## 0. Aclaración sobre el stack

El documento de trabajo indicaba React + Vite + Supabase, pero el repositorio real es
**Next.js 15 (App Router) + TypeScript + Prisma/PostgreSQL**, con despliegue provisional en
**Vercel** (`tecnovomotos`) y los dominios `tecnovomotoselectricas.com` y `www.` asociados.
El objetivo final del proyecto sigue siendo VPS con Docker + Caddy (skill `qa-deploy`).
Todo lo aquí descrito se aplicó al stack real; no se cambió la arquitectura.

Host canónico acordado: **`https://www.tecnovomotoselectricas.com`**.
El dominio sin `www` redirige 307 a `www` (configuración de Vercel, no del código), y así se
mantiene. Es coherente con la recomendación de Vercel y evita duplicidad.

## 1. Hallazgos antes de los cambios (evidencia real del sitio publicado)

| Verificación | Resultado encontrado |
|---|---|
| `/robots.txt` | Accesible, pero `Sitemap: https://tecnovomotos.vercel.app/sitemap.xml` |
| `/sitemap.xml` | XML válido, pero **todas las URLs** apuntaban a `tecnovomotos.vercel.app` |
| `<title>` en `/` | Único y correcto |
| `<meta name="description">` en `/` | Presente |
| `<link rel="canonical">` en `/` | **Ausente** (0 apariciones) |
| OG en `/` | `og:title`, `og:description`, imagen; **sin `og:url`**, imagen en dominio vercel.app |
| JSON-LD en `/` | **Ausente** (0 bloques) |
| Ficha `/motos-electricas/tec-one` | `Product` JSON-LD válido, sin `sku`, sin `BreadcrumbList`, sin canonical, `og:image` en vercel.app |
| Rutas privadas en el sitemap | No aparecen |
| Títulos/descripciones duplicados | No se encontraron en las páginas públicas revisadas |

Causa raíz de los problemas de dominio: `NEXT_PUBLIC_SITE_URL` en Vercel valía
`https://tecnovomotos.vercel.app`.

## 2. Cambios aplicados

### Metadata y canonical
- Nuevo helper `lib/seo.ts`: `pageMetadata()` (title, description, canonical, `og:url`,
  `og:type`, `siteName`, `locale`, Twitter), `privateMetadata()` (noindex/nofollow) y
  `jsonLd()` (escapa `<` para evitar cierre de etiqueta desde contenido de la BD).
- Canonical + OG + Twitter aplicados a todas las páginas públicas: inicio, tres catálogos,
  distribuidores, taller, capacitación, calculadora, comparar, buscar, PQRS, cuatro páginas
  legales y las fichas de producto (`generateMetadata`).
- Fichas de producto: JSON-LD `@graph` con `Product` (incluye `sku` real = slug) y
  `BreadcrumbList` con las tres migas visibles. Sin `aggregateRating` ni `review` (no hay
  reseñas reales: no se inventaron).
- Portada: JSON-LD `Organization` con nombre, URL y logo reales.
- `robots.txt` (generado por `app/robots.ts`): se ampliaron los `Disallow` a `/login`,
  `/registro`, `/mis-anuncios` y `/publicar`. El archivo sigue siendo generado por la ruta
  de Next.js, que es la forma correcta en App Router; no se creó `public/robots.txt` porque
  entraría en conflicto con la ruta generada.
- `sitemap.ts`: se añadió `/pqrs`, se eliminó el `lastModified: now` falsificado en páginas
  estáticas (se conserva `updatedAt` real en productos) y se unificó el origen de la URL base.
- Páginas privadas/transaccionales del servidor (`/admin/*`, pedido, anuncios, publicar,
  catálogo y pedidos mayoristas): `robots: noindex, nofollow`. Las rutas cliente
  (`/login`, `/registro`, `/carrito`, `/checkout`) quedan cubiertas por `robots.txt`.

### Configuración (fuera del repositorio)
- `NEXT_PUBLIC_SITE_URL` y `AUTH_URL` cambiados a `https://www.tecnovomotoselectricas.com`
  en `.env.production.local` (ignorado por Git) y en las variables de producción de Vercel.
  No se tocaron DATABASE_URL, llaves de Wompi ni ningún otro secreto.
- No se modificaron DNS ni registros de dominio.

### Pruebas (arreglo de infraestructura, sin cambio de comportamiento en producción)
- `tests/setup.ts`: mock de `unstable_cache` para que `getCatalog()` pueda ejecutarse fuera
  del contexto de Next en vitest. Corregía 3 fallos preexistentes.
- `tests/wompi.test.ts`: la prueba dependía del slug `rep-guaya-acelerador`, ausente en la
  base local; ahora crea su propio producto temporal y lo limpia. Corregía 2 fallos
  preexistentes.

## 3. Validaciones ejecutadas (resultados reales)

| Comando / comprobación | Resultado |
|---|---|
| `npm run typecheck` | OK, sin errores |
| `npm run lint` | OK, 0 errores y 0 advertencias (aviso de deprecación de `next lint`, no del código) |
| `npm test` | **93/93 pruebas en 11 archivos**, OK |
| `npm run build` | OK: 58 rutas generadas, `robots.txt` y `sitemap.xml` incluidos |
| HTML local de `/` (producción compilada) | `<title>` correcto, canonical `https://www.tecnovomotoselectricas.com`, `og:url` igual, 1 bloque `Organization` |
| HTML local de ficha `tec-one` | canonical con la ruta completa, JSON-LD `@graph` con `Product` y `BreadcrumbList`, `sku=tec-one` |
| `robots.txt` local | Disallow de rutas privadas, `Sitemap: https://www.tecnovomotoselectricas.com/sitemap.xml` |
| `sitemap.xml` local | URLs con el host canónico; sin `/admin`, `/carrito`, `/checkout`, `/pedido` ni `/api` |
| Escaneo de secretos en archivos versionados | Sin credenciales reales; solo marcadores de ejemplo en plantillas y un hash de integridad de npm |
| Catálogo, pedidos, moderación y webhook Wompi | Cubiertos por la suite de pruebas (93/93), incluida idempotencia del webhook |

La pasarela Wompi sigue **desactivada en el código** (checkout por WhatsApp); no se activó
ni se modificó porque está fuera del alcance de este trabajo. Eso se registra para no afirmar
que "la pasarela de pago funciona" sin evidencia.

## 4. Estado

Técnicamente preparado para el despliegue y para que Google pueda rastrear e indexar.
**No se afirma que el sitio esté indexado ni posicionado**: eso solo se puede confirmar con
evidencia en Google Search Console, y los pasos 4 a 6.3 los ejecuta el propietario.
