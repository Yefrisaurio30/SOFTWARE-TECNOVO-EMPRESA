# HANDOFF — TECNOVO

Documento de traspaso para retomar el proyecto desde el CLI.
Generado al terminar la auditoría y el diseño del plan de ajustes.

---

## 1. Arranque rápido

```powershell
# 1. Docker Desktop abierto
docker compose up db -d

# 2. App
npm run dev            # usa Turbopack (--turbopack en el script)

# 3. Verificación completa antes de commitear
npm run typecheck
npm run lint
npx vitest run
npx next build
```

**Acceso admin:** `jefe@tecnovo.com` / `CambiaEsto123*` — cambiar en producción.

---

## 2. Estado del repo

- Rama: `main` · **Desplegado en producción: https://tecnovomotos.vercel.app**
- Infra temporal: Vercel Hobby + Supabase Free (Oregon, `us-west-2`) + bucket
  `uploads` de Supabase Storage. La guía completa está en
  [`docs/deploy-vercel.md`](docs/deploy-vercel.md)
- RLS activado en las 14 tablas de `public`, sin políticas (negar por defecto).
  Prisma conecta como `postgres`, que tiene `BYPASSRLS`, así que la app no se
  entera. Ver `scripts/harden-rls.sql`
- **Pendiente:** las 3 llaves de Wompi sandbox. Sin ellas `/api/checkout/wompi`
  responde error. Agregarlas a `.env.production.local` y correr
  `node scripts/vercel-env-sync.mjs`
- **Pendiente y urgente:** rotar la contraseña de la base y la del admin. Ambas
  quedaron escritas en un registro de conversación
- Tests: 9 suites en `tests/` → `orders`, `wompi`, `wholesale`, `specs`,
  `image-validation`, `consent`, `energy`, `youtube`, `listing-moderation`
- Fases F0–F9 completadas. **F10 (hosting VPS + Caddy) Pendiente por decisión del cliente**

### Stack
Next.js 15.5 (App Router) · React 19 · TS estricto · Tailwind v4 · Prisma 6 + PostgreSQL 16 ·
Auth.js v5 (credenciales, JWT) · Zustand · Framer Motion 12 · Zod · Recharts · bcryptjs

> `@tanstack/react-table` está instalado pero **no se usa** (deps espuria).
> **No hay shadcn/ui real**, solo `clsx` + `cva` + `tailwind-merge`.

---

## 3. Trampas del entorno (leer antes de tocar nada)

| Trampa | Detalle |
|---|---|
| **Puerto de BD = 5434** | El Postgres 18 del sistema ocupa 5432 y otro proyecto ocupa 5433. `DATABASE_URL` apunta a `localhost:5434`. **Cambiar el puerto rompe todo.** |
| **Trampa de caracteres cirílicos** | Varias veces se coló una `о` cirílica (U+043E) en slugs, credenciales y emails. Symptoms: P1000, slugs raros. **Escaneo de seguridad:** buscar U+043E / U+041E antes de commitear. |
| **Guardar archivos sin BOM** | `Set-Content` en PowerShell 5.1 mete BOM → rompe JSON (`Unexpected token '﻿'`). Usar `[IO.File]::WriteAllText($p, $t, (New-Object Text.UTF8Encoding $false))`. |
| **PowerShell 5.1** | No existe `&&`, ni `head`, ni `-Raw` en `Get-Content` de rutas literales. Usar `;` y `Select-Object -First`. |
| **`next lint` obsoleto** | Deprecado en Next 16. Migrar al CLI de ESLint cuando se toque. |
| **`npm audit`** | 13 vulnerabilidades sin tratar (2 moderadas, 9 altas, 2 críticas). Pendiente en F6. |
| **Uploads a disco** | `POST /api/admin/products/upload` escribe en `public/uploads`. Se rompe en Docker standalone → migrar a Cloudinary/S3 en F10. **Resuelto:** ya no escribe a disco; hay un adaptador con dos drivers |
| **PowerShell 5.1 destruye argumentos con comillas** | `docker run -e FOO=$hash['KEY']` pasa literal y falla. Igual con `--body '{"a":"b"}'`. **Workaround:** asignar a una variable simple primero, o llamar desde Node |
| **`vercel api` no acepta un archivo** | `--body` espera el JSON en línea. Con rutas de archivo responde `Invalid JSON (400)` |
| **Ignored Build Step no filtra por rama** | Cancela el despliegue con exit 0 **y** con exit 1. No sirve para dejar pasar `main` |
| **El pooler de Supabase exige el tenant** | `-U postgres` responde `no tenant identifier provided`. Es `postgres.<referencia>` |
| **El `id` del bucket debe ser igual al nombre** | La API busca por `id` en `/object/<id>/<clave>`. Con UUID responde `NoSuchBucket` en todo |
| **Storage lista con carpetas virtuales** | `prefix: ""` devuelve solo la raíz, no los archivos; y con prefijo devuelve nombres **relativos**. Hay que listar carpeta por carpeta |
| **`hasSome` en `String[]` pide un arreglo** | `hasSome: "texto"` falla. Y solo hace coincidencia exacta, no subcadenas |

---

## 4. Roles de usuario

Enum: `SUPERADMIN` · `MAYORISTA` · `DISTRIBUIDOR` · `CLIENTE`

`MAYORISTA` y `DISTRIBUIDOR` conviven: MAYORISTA es acceso directo, DISTRIBUIDOR pasa por
aprobación de perfil (`lib/distributor.ts`). **Deuda a consolidar.**

---

## 5. Qué NO tocar (funcionando y testeado)

| Módulo | Razón |
|---|---|
| `lib/wompi.ts`, `lib/wompi-events.ts` | Verdad del pago. Checksum con orden dinámico + `timingSafeEqual`, idempotencia, validación de monto |
| `app/api/wompi/events/route.ts` | Webhook. La verdad del pago es aquí, no la redirección |
| `lib/orders.ts` | Recálculo de totales en servidor, valida stock en transacción |
| `app/pedido/[id]/page.tsx` | `canAccessOrder()` ya protege datos del pedido |
| `middleware.ts` (bloque `/admin`) | Solo `SUPERADMIN` |
| `tests/` | Red de seguridad de pagos y precios |

---

## 6. Frágilidades detectadas en auditoría

1. **`middleware.ts:19-30`** — en rutas de distribuidor solo exige `req.auth?.user`, **no el rol**. Sobrevive porque `requireApprovedDistributor()` revalida en la página, pero falta defensa en profundidad.
2. **Rol obsoleto en JWT** — el rol se hornea en el token; si el admin cambia un rol, el usuario conserva el viejo hasta que expire.
3. **`lib/products.ts` → `getCatalog`** — trae todas las filas y filtra `specs` en memoria. OK a ~44 productos, se rompe al crecer.
4. **Footer con enlaces rotos** — `/politica-datos` y `/pqrs` **no existen** (404). Verificado: no están en `app/`.
5. **Duplicidad de roles** — ver sección 4.
6. Sin e2e (Playwright) todavía.

---

## 7. Plan aprobado (pendiente de ejecutar)

| Fase | Contenido | Migración |
|---|---|---|
| **F1b** | **Login siempre redirige a inicio**, cualquier rol | — |
| **F0** | Documentación: autorizar neón, regla "neón en oscuro / `steel-deep` en claro" | — |
| **F1** | Neón: `steel` → `#39FF14`, `steel-deep` → verde legible sobre gris claro, fix `product-card.tsx:48` | — |
| **F2** | Calculadora: gasolina estandarizada y editable, `calcSavings` puro + test, badge garantía 5 años | — |
| **F3** | `/taller` con garantía, red de servicio, mapa de `lib/store.ts`, WhatsApp. Admin CRUD. Seed **solo sede real Villavicencio** | `Service` |
| **F4** | `/capacitacion`: banner superior, grid con YouTube embeds, fechas y modalidad. Admin CRUD. **Vacía hasta que el cliente cargue los cursos reales** | `Course` |
| **F5** | Navbar, footer y `sitemap.ts` | — |
| **F6** | `/politica-datos` y `/pqrs`, `npm audit`, README/PLAN | — |

**Orden: F1b primero** (es la queja inmediata, 3 líneas), luego F0+F1, después el resto.

### Decisiones ya tomadas por el cliente
- Neón `#39FF14` autorizado como acento principal (contradice el skill de diseño viejo → hay que actualizarlo en F0)
- **Ficha técnica: descartada.** No hay carrusel ni botón. Era solo la calculadora de ahorro + garantía
- Los cursos de `/capacitacion` serán **reales**, cargados por el cliente vía admin. No inventar contenido
- `/taller`: solo la sede real de Villavicencio como seed

---

## 8. Login — el bug reportado

`app/login/page.tsx:34`

```ts
// ANTES (dos defectos: rama por rol + carrera de sesión)
const session = await getSession();
router.push(session?.user?.role === "SUPERADMIN" ? "/admin" : next);

// DESPUÉS
router.push("/");
```

El cliente pidió **siempre a inicio**, sin importar el rol. Está avisado de que esto
rompe la continuidad de 5 flujos que usan `?next=`:

- `checkout/page.tsx:72,136` → `/checkout`
- `pedido/[id]/page.tsx:34` → `/pedido/{id}`
- `distribuidores/registro:32` → `/distribuidores/registro`
- `distributor.ts:32` → `/distribuidores/catalogo`
- `admin.ts:7` → `/admin`

**Pendiente de decisión (no bloquea):** los clientes no tienen página de pedidos.
Solo existe `/distribuidores/pedidos` (mayoristas). Si un cliente entra a su
confirmación de pedido, rebota al login y al volver a inicio no tiene forma de
recuperarlo. Opciones: ruta `/mis-pedidos`, o dejarlo para más adelante.

---

## 9. Rutas actuales

Público: `/` · `/motos-electricas` · `/motos-usadas` · `/repuestos-accesorios` ·
`/[categoria]/[slug]` · `/comparar` · `/calculadora` · `/carrito` · `/checkout` ·
`/pedido/[id]` · `/distribuidores` (+ `/registro`, `/catalogo`, `/pedidos`) ·
`/login` · `/registro`

Admin: `/admin` (+ `/productos`, `/productos/nuevo`, `/productos/[id]`, `/pedidos`,
`/pedidos/[id]`, `/usuarios`, `/contenido`)

API: `/api/orders` · `/api/checkout/wompi` · `/api/wompi/events` ·
`/api/auth/[...nextauth]` · `/api/auth/register` · `/api/admin/orders/export` ·
`/api/admin/products/upload` · `/api/distribuidor/{registro,checkout}`

SEO: `/sitemap.xml` (dinámico) · `/robots.txt`

---

## 10. Datos de negocio

- WhatsApp: **312 277 9324** (`NEXT_PUBLIC_WHATSAPP=573122779324`, editable en `/admin/contenido`)
- Sede: **Villavicencio, Meta** (`lib/store.ts` → URLs de Google Maps)
- Catálogo: 5 motos reales — TEC-FORCE, TEC-CR4 PRO y TEC-CR5 a $4.990.000;
  TEC-ONE a $1.849.900; TEC-PRO a $1.950.000. Todas con garantía de 5 años
- Mayorista ≈ 85% del retail (verificar valores con el cliente)
- Fotos de productos: `public/motos/{slug}/lado-1..4.png`
- Fichas técnicas como imagen (volantes) disponibles en `Imagenes/tecnovo/*.jpeg` — **no usadas**