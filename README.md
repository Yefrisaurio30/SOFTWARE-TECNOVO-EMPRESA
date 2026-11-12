# TECNOVO — Tienda virtual de motos eléctricas

Next.js 15 + TypeScript + Tailwind + Prisma + PostgreSQL + Auth.js + Wompi.

## Arranque local

```powershell
# 1. Docker Desktop abierto
docker compose up db -d

# 2. Instalar y preparar
npm install
npx prisma migrate dev
npm run db:seed

# 3. Correr
npm run dev
```

Sitio: http://localhost:3000 · Admin: http://localhost:3000/admin

**Ojo:** la BD está en el puerto **5434** porque el Postgres del sistema ocupa el 5432
y otro proyecto el 5433. No lo cambies sin revisar `DATABASE_URL`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | `prisma generate` + build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (75 tests) |
| `npm run db:migrate` | Crea/aplica migraciones |
| `npm run db:seed` | Siembra catálogo y sede principal |
| `npm run db:studio` | Prisma Studio |

## Rutas

**Público:** `/` · `/motos-electricas` · `/motos-usadas` · `/repuestos-accesorios` ·
`/[categoria]/[slug]` · `/comparar` · `/calculadora` · `/carrito` · `/checkout` ·
`/pedido/[id]` · `/taller` · `/capacitacion` · `/publicar` · `/mis-anuncios` ·
`/distribuidores` (+ `/registro`, `/catalogo`, `/pedidos`) · `/login` · `/registro` ·
`/pqrs` · `/legales/{terminos-y-condiciones,politica-de-privacidad,politica-de-cookies,derecho-de-retracto-y-reembolsos}`

`/politica-datos` redirige a `/legales/politica-de-privacidad`. `/admin/moderacion`
redirige a `/admin/anuncios`.

**Admin (solo SUPERADMIN):** `/admin` · `/admin/anuncios` · `/admin/auditoria-legales` ·
`/admin/productos` · `/admin/pedidos` · `/admin/usuarios` · `/admin/taller` ·
`/admin/capacitacion` · `/admin/contenido`

**API:** `/api/orders` · `/api/checkout/wompi` · `/api/wompi/events` ·
`/api/auth/[...nextauth]` · `/api/auth/register` · `/api/admin/orders/export` ·
`/api/admin/products/upload` · `/api/distribuidor/{registro,checkout}`

## Cuentas

El superadmin se crea con el seed si defines `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
**Cambia la contraseña antes de publicar.**

## Variables de entorno

Copia `.env.example` a `.env`. Lo mínimo para desarrollo:

```
DATABASE_URL=postgresql://tecnovo:tecnovo@localhost:5434/tecnovo?schema=public
AUTH_SECRET=<genera uno>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP=573102636088
```

Wompi (`WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`) solo
si vas a probar pagos de verdad. Sandbox y producción usan llaves distintas.

## Datos

El número de WhatsApp, el precio de referencia de la gasolina y otros ajustes se
editan desde `/admin/contenido` o viven en la tabla `SiteSetting`.

Catálogo, red de servicio y cursos se administran desde `/admin`.

## Pendiente

- **Textos legales sin revisión de abogado.** Las cuatro páginas de `/legales/*`
  están redactadas y funcionan, pero deben pasar por un abogado en Colombia antes
  de publicarse en producción.
- **F10 — despliegue:** VPS con Docker + Caddy, dominio .com, backups.
  Ver `.opencode/skills/qa-deploy/SKILL.md`. No iniciado por decisión del cliente.
- **Wompi Widget/SDK:** usamos Web Checkout. Lo pendiente quedó documentado en
  `docs/PENDIENTES-WOMPI.md`, incluida la aclaración de que `WOMPI_PRIVATE_KEY`
  no existe en Wompi.
- **Correo de confirmación de pedido:** falta proveedor de email.
- **Subida de imágenes a disco:** `public/uploads` no sirve en Docker standalone.
  Migrar a Cloudinary/S3 antes de desplegar.
- **Auditoría de dependencias:** 13 alertas (2 moderadas, 9 altas, 2 críticas).
  Todas son de tooling/build, **ninguna del runtime de pagos o auth**. Los arreglos
  propuestos exigen saltos mayores (Next 16, Vitest 5) o un downgrade de
  `eslint-config-next`, así que requieren una sesión dedicada.
- **Clientes sin página de pedidos:** tras iniciar sesión siempre se va a inicio,
  así que quien entra a su confirmación de pedido no tiene forma de recuperarlo.
  Sugerencia: ruta `/mis-pedidos`.

Ver `PLAN.md` para las fases y `HANDOFF.md` para las trampas del entorno.