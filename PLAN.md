# TECNOVO — PLAN.md

Tienda virtual de motos eléctricas nuevas, motos de segunda, repuestos y accesorios + portal distribuidores.

## 0. Reglas permanentes (AGENTS.md)

- Español de Colombia, COP con `Intl.NumberFormat('es-CO')`.
- Stack fijo: Next.js 15 App Router + TS estricto + Tailwind + shadcn/ui + Prisma + PostgreSQL + Auth.js + Zod + Wompi.
- Diseño: negro y gris, limpio premium tipo Apple, NO futurista. Ver `tecnovo-design-system`.
- Pagos: `wompi-payments/reference.md` al pie de la letra. La verdad del pago es el webhook.
- Servidor recalcula precios desde BD. Secretos solo en env. Commits `feat:/fix:/chore:`.
- Mobile-first, loading/vacío/error en cada ruta.
- Despliegue: VPS Docker + Caddy (`qa-deploy`).

Skills raíz (19): 8 propios + 11 ECC. Leer el relevante antes de cada fase.

## 1. Stack decidido

Next.js 15 + React 19 + TS estricto · Tailwind v4 + shadcn/ui + Framer Motion + lucide-react · PostgreSQL 16 + Prisma 6 · Auth.js v5 (roles SUPERADMIN, DISTRIBUIDOR, CLIENTE) · Zod + React Hook Form · Zustand (carrito) · Wompi Web Checkout · Vitest + Playwright · Docker Compose + Caddy.

## 2. Esquema Prisma (F2)

```prisma
enum Role { SUPERADMIN DISTRIBUIDOR CLIENTE }
enum ProductType { MOTO_NUEVA MOTO_USADA REPUESTO ACCESORIO }
enum OrderStatus { PENDIENTE PAGADO RECHAZADO ENVIADO ENTREGADO CANCELADO }
enum DistributorStatus { PENDIENTE APROBADO RECHAZADO }

model User {
  id            String   @id @default(cuid())
  name          String?
  email         String   @unique
  emailVerified DateTime?
  image         String?
  role          Role     @default(CLIENTE)
  distributor   DistributorProfile?
  orders        Order[]
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Auth.js models: Account, Session, VerificationToken (estándar)

model Product {
  id             String      @id @default(cuid())
  slug           String      @unique
  name           String
  type           ProductType
  brand          String
  priceRetail    Int         // COP enteros
  priceWholesale Int?
  stock          Int         @default(0)
  description    String
  images         String[]
  specs          Json        @default("{}")
  featured       Boolean     @default(false)
  active         Boolean     @default(true)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  orderItems     OrderItem[]
  @@index([type, active, featured])
  @@index([brand])
}

model Order {
  id          String      @id @default(cuid())
  userId      String?
  user        User?       @relation(fields: [userId], references: [id])
  status      OrderStatus @default(PENDIENTE)
  total       Int         // COP, calculado en servidor
  isWholesale Boolean     @default(false)
  paymentRef  String?     @unique
  contactName String
  contactPhone String
  contactEmail String?
  city        String
  address     String
  delivery    String      // ENVIO | RECOGER
  items       OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  qty       Int
  unitPrice Int     // snapshot servidor
}

model DistributorProfile {
  id        String            @id @default(cuid())
  userId    String            @unique
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  company   String
  nit       String            @unique
  city      String
  phone     String
  status    DistributorStatus @default(PENDIENTE)
  minUnits  Int               @default(1)
  createdAt DateTime          @default(now())
}

model SiteSetting {
  key   String @id // WHATSAPP_NUMBER, HERO_BANNERS, HOME_TEXTS, REVIEWS...
  value Json
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String
  entity    String
  entityId  String?
  createdAt DateTime @default(now())
}
```

Seed F2: 12 nuevas, 8 usadas, 20 repuestos, 10 accesorios ficticios realistas.

## 3. Árbol de carpetas

```
├─ app/
│  ├─ layout.tsx, globals.css, loading.tsx, error.tsx, not-found.tsx
│  ├─ page.tsx (home)
│  ├─ motos-electricas/, motos-usadas/, repuestos-accesorios/
│  ├─ [categoria]/[slug]/
│  ├─ carrito/, checkout/, pedido/[id]/
│  ├─ admin/ (dashboard, productos, pedidos, usuarios, contenido)
│  ├─ distribuidores/ (landing, catalogo, checkout, pedidos)
│  └─ api/ (products, checkout/wompi, wompi/events, admin/*, distributor/*, auth/[...nextauth])
├─ components/ (ui/ shadcn, layout/ navbar footer whatsapp-widget, home/ hero specs comparador calculadora, product/ card filters gallery, cart/ drawer, admin/ tables)
├─ lib/ (prisma.ts, auth.ts, money.ts, wompi.ts, validations.ts, whatsapp.ts, site-settings.ts)
├─ store/ (cart-store.ts con zustand)
├─ prisma/ (schema.prisma, seed.ts)
├─ public/brand/ (copia de assets/brand en F0)
├─ docs/ (deploy-vps.md, manual-admin.md)
├─ tests/ (vitest: money, wompi firma/checksum/idempotencia)
├─ e2e/ (playwright: catalogo→carrito→checkout)
├─ docker-compose.yml, docker-compose.prod.yml, Dockerfile, Caddyfile
└─ .env.example
```

## 4. Fases (un commit por fase, no avanzar sin build+lint en verde)

- **F0 Setup:** Next 15 + TS estricto + Tailwind + ESLint + Prettier + Prisma + Docker (app+postgres) + `.env.example` + `public/brand/`. DoD: `npm run build`, `lint`, `docker compose up db`.
- **F1 Diseño + layout:** tokens `tecnovo-design-system`, Inter, navbar píldora, footer, widget WhatsApp, loading/error/404. DoD: Lighthouse local OK, `prefers-reduced-motion`.
- **F2 Datos + seed:** schema + seed 50 productos. DoD: `prisma migrate + db seed` reproducible.
- **F3 Home:** hero carrusel 3 modelos, marca, grid, ubicaciones, prueba manejo, reseñas. DoD: Perf ≥90 objetivo.
- **F4 Catálogos + detalle:** filtros en searchParams, orden, paginación, galería zoom, JSON-LD, skeletons. DoD: estados vacío/error.
- **F5 Carrito/checkout/pedidos:** Zustand + persist, servidor recalcula + valida stock en transacción. DoD: test de totales.
- **F6 Wompi:** `reference.md` exacto (firma servidor, checkout URL, webhook checksum + timingSafeEqual + idempotencia + valida monto). DoD: 4 tests Vitest en verde.
- **F7 Auth + admin:** Auth.js roles, middleware /admin solo SUPERADMIN, CRUD, CSV, auditoría. DoD: sin sesión no expone nada privado.
- **F8 Distribuidor:** registro NIT→PENDIENTE, catálogo mayorista solo MOTO_NUEVA + priceWholesale, checkout separado, PDF. DoD: sin aprobación nunca filtra mayorista en HTML ni API.
- **F9 WhatsApp/SEO/extras:** wa.me prellenado, metadata/sitemap/robots/OG, comparador 3 motos, calculadora ahorro, splash 600ms primera visita. DoD: A11y ≥95.
- **F10 QA/deploy:** Vitest+Playwright flujo compra, README, `docs/manual-admin.md`, `docs/deploy-vps.md`, compose prod + Caddy. DoD: `docker compose up` corre todo.

## 5. Ítems cotizados → fase

1. Principal → F3 · 2. Nuevas → F4 · 3. Usadas → F4 · 4. Repuestos/accesorios → F4 · 5. Superadmin → F7 · 6. Carrito/pedidos → F5 · 7. Wompi → F6 · 8. WhatsApp → F9 · 9. Diseño distribuidor → F8 · 10. Catálogo distribuidor → F8 · 11. Pagos distribuidor → F6+F8 · 12. Pruebas/hosting/capacitación → F10.

## 6. Env

```
DATABASE_URL=postgresql://tecnovo:tecnovo@db:5432/tecnovo?schema=public
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP=573001112233
WOMPI_ENV=sandbox
WOMPI_PUBLIC_KEY=pub_test_...
WOMPI_INTEGRITY_SECRET=prod_integrity_...
WOMPI_EVENTS_SECRET=stg_...
# WOMPI_DIST_* solo si cuenta aparte
```

## 7. Riesgos

- Wompi: solo webhook vale. Nunca precio del cliente, nunca reference reutilizada, checksum con orden dinámico + `timingSafeEqual`.
- Usadas: stock 1, bloqueo al reservar.
- Mayorista: blindar API + HTML.
- Fotos reales pendientes → placeholders grises propios.

