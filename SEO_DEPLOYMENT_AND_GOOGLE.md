# SEO_DEPLOYMENT_AND_GOOGLE.md

Procedimientos de despliegue y configuración manual de Google para TECNOVO.
Fecha: 2026-11-24. Complemento de `SEO_IMPLEMENTATION_REPORT.md`.

Dominio canónico: **`https://www.tecnovomotoselectricas.com`**.
`https://tecnovomotoselectricas.com` redirige 307 al dominio `www` (Vercel). No cambiar DNS.

Stack real: Next.js 15 App Router + Prisma/PostgreSQL, despliegue provisional en Vercel
(proyecto `tecnovomotos`). El dominio final del proyecto es VPS con Docker + Caddy.

---

## 3. Despliegue

Antes de subir, las validaciones locales pasaron: typecheck, lint, 93/93 pruebas y build
(58 rutas). Detalle en `SEO_IMPLEMENTATION_REPORT.md`.

```bash
git add .
git commit -m "feat: implementacion SEO tecnico TECNOVO"
git push
```

El repositorio está conectado a Vercel: un push a `main` dispara el despliegue automático.
También se puede forzar manualmente con `vercel --prod` si hiciera falta (CLI ya autenticada).

Variables ya ajustadas en Vercel (Production):
- `NEXT_PUBLIC_SITE_URL=https://www.tecnovomotoselectricas.com` (config)
- `AUTH_URL=https://www.tecnovomotoselectricas.com` (secret)

Resto de secretos intactos.

### URLs a verificar tras el despliegue

| URL | Qué comprobar |
|---|---|
| `https://www.tecnovomotoselectricas.com/` | 200, título, canonical `www`, JSON-LD `Organization` |
| `https://www.tecnovomotoselectricas.com/robots.txt` | 200, `Sitemap:` apunta al dominio `www` |
| `https://www.tecnovomotoselectricas.com/sitemap.xml` | 200, XML válido, solo páginas públicas canónicas |
| `https://tecnovomotoselectricas.com/` | 307 a `www` (redirección coherente) |
| `https://tecnovomotoselectricas.com/sitemap.xml` | 307 a `www/sitemap.xml` |

Comando rápido (PowerShell):

```powershell
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://tecnovomotoselectricas.com/
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://www.tecnovomotoselectricas.com/
curl.exe -s https://www.tecnovomotoselectricas.com/robots.txt
curl.exe -s https://www.tecnovomotoselectricas.com/sitemap.xml
```

---

## 4. Google Search Console (lo hace el propietario)

El dominio ya está verificado: **no repetir la verificación**.

1. Entrar a https://search.google.com/search-console y elegir la propiedad
   `tecnovomotoselectricas.com`.
2. Menú lateral → **Indexación → Sitemaps**.
3. En "Añadir un sitemap nuevo", escribir `sitemap.xml` y pulsar **Enviar**.
   (Si la propiedad es de dominio, también se acepta
   `https://www.tecnovomotoselectricas.com/sitemap.xml`.)
4. Esperar el procesamiento. Esperado: "Correcto", sin errores de lectura, con URLs
   descubiertas. Si falla, primero comprobar que el XML responda 200 y sea válido.
5. Barra de inspección de URLs → pegar `https://www.tecnovomotoselectricas.com/` →
   **Probar URL publicada** → si es apta, **Solicitar indexación**.
6. Repetir con las páginas prioritarias: catálogo (`/motos-electricas`, `/motos-usadas`,
   `/repuestos-accesorios`), categorías, productos destacados (`tec-one`, `tec-force`,
   `tec-pro`), contacto (`/pqrs`), taller y calculadora.

No solicitar indexación de `/admin`, `/api`, `/login`, `/registro`, `/carrito`, `/checkout`,
`/pedido`, `/mis-anuncios`, `/publicar` ni catálogos mayoristas.

> Solicitar indexación no garantiza inclusión ni la hace inmediata.

---

## 5. Comprobar la indexación

Búsqueda orientativa: `site:tecnovomotoselectricas.com`. No es un informe completo.
La fuente de verdad es Search Console:

| Sección | Revisar |
|---|---|
| Indexación → Páginas | Páginas indexadas y no indexadas |
| Sitemaps | Estado del sitemap y URLs descubiertas |
| Rendimiento → Resultados de búsqueda | Clics, impresiones y consultas |
| Experiencia → Core Web Vitals | Métricas de experiencia |
| Mejoras | Resultados enriquecidos cuando aparezcan |

No asumir que una página está indexada solo porque esté en el sitemap.

---

## 6. Herramientas gratuitas de validación

| Herramienta | Uso |
|---|---|
| https://pagespeed.web.dev/ | Rendimiento, accesibilidad, buenas prácticas, SEO y Core Web Vitals en móvil y escritorio |
| https://search.google.com/test/rich-results | Validar `Organization`, `Product` y `BreadcrumbList` |
| https://developer.chrome.com/docs/lighthouse/ | Oportunidades adicionales de optimización |

No añadir propiedades falsas (precios, reseñas, valoraciones) para perseguir resultados
enriquecidos.

---

## 7. Seguimiento SEO

**Primera revisión (después del primer rastreo):** estado del sitemap, errores de rastreo,
páginas indexadas, canonical elegida por Google y problemas de accesibilidad.

**Segunda revisión:** impresiones, clics, consultas, páginas con más visibilidad y productos
que empiezan a aparecer.

**Tercera revisión:** páginas sin impresiones, descripciones insuficientes, contenido
duplicado, problemas de indexación y oportunidades de contenido comercial.

Cada vez que se publique o retire un producto, el sitemap se actualiza solo (consulta a la
BD con `revalidate = 3600`); no hace falta editar el XML a mano.

---

## 8. Recomendaciones importantes

1. No comprar herramientas SEO de pago al inicio.
2. No modificar DNS si el dominio ya funciona.
3. No modificar claves ni permisos de la base.
4. No cambiar la arquitectura solo por SEO.
5. No publicar rutas administrativas.
6. No duplicar páginas con URLs canónicas distintas.
7. No inventar contenido comercial, reseñas ni precios.
8. No prometer posicionamiento inmediato.
9. Mantener el sitemap alineado con el catálogo.

---

## 9. Entregables

- `SEO_IMPLEMENTATION_REPORT.md` — auditoría e implementación realizada.
- `SEO_DEPLOYMENT_AND_GOOGLE.md` — este documento.

---

## 10. Criterio de finalización

| Criterio | Estado |
|---|---|
| Validaciones locales (build, tipos, pruebas, secretos) | **Hecho**, con evidencia en el informe |
| Sitio desplegado con los cambios | **Hecho** tras el push a `main` y el despliegue de Vercel |
| Dominio principal funciona y redirecciones coherentes | **Hecho**: `www` sirve, el ápice redirige 307 |
| `robots.txt` accesible | **Verificado en local**; pendiente de confirmar en producción |
| `sitemap.xml` accesible y válido | **Verificado en local**; pendiente de confirmar en producción |
| Metadatos correctos en páginas públicas | **Hecho** y verificado en HTML compilado |
| Productos con URLs y metadatos apropiados | **Hecho** (canonical, OG, `Product`, `BreadcrumbList`) |
| Datos estructurados válidos | **Hecho** en local; pendiente de Rich Results Test |
| Search Console recibió el sitemap | **Pendiente** (sección 4, propietario) |
| Solicitudes de indexación enviadas | **Pendiente** (sección 4, propietario) |
| Funcionalidades comerciales operativas | Pruebas automatizadas 93/93; checkout por WhatsApp activo, Wompi desactivado en código (registrado, no modificado) |

**No declarar TECNOVO indexado o posicionado** hasta tener evidencia en Google Search Console.
Resultado esperado: el sitio queda técnicamente preparado para que Google descubra, rastree,
interprete y potencialmente indexe sus páginas comerciales y productos.
