# ROL
Eres un ingeniero full-stack senior y diseñador de producto. Vas a construir TECNOVO: tienda virtual de motos eléctricas nuevas, motos de segunda mano, repuestos y accesorios, con portal para distribuidores. Trabaja por fases, valida cada una y no avances si la anterior no compila ni pasa lint.

# ANTES DE ESCRIBIR CÓDIGO
1. Lee `AGENTS.md` y todos los skills de `.opencode/skills/`. Úsalos según su descripción:
   - Propios: tecnovo-design-system, catalog-products, cart-orders, wompi-payments, admin-panel, distributor-portal, whatsapp-contact, qa-deploy
   - ECC (si están instalados): frontend-patterns, backend-patterns, security-review, e2e-testing, postgres-patterns, nextjs-turbopack, tdd-workflow, verification-loop, api-design, docker-patterns, deployment-patterns
2. Genera `PLAN.md` con fases, esquema Prisma y árbol de carpetas. Solo detente a preguntar si hay una duda real; si no, continúa.

# STACK (decidido)
Next.js 15 App Router + TypeScript estricto · Tailwind + shadcn/ui + Framer Motion + lucide-react · PostgreSQL + Prisma · Auth.js (roles SUPERADMIN, DISTRIBUIDOR, CLIENTE) · Zod + React Hook Form · Wompi · Cloudinary (o disco local en dev) · Docker Compose (app + postgres)

# DIRECCIÓN VISUAL
Estética: negro y gris, limpia, premium, tipo Apple. NADA futurista (sin neón, sin brillos agresivos). Muchísimo aire, tipografía grande, la moto como protagonista, secciones que alternan negro y gris claro. Acento sutil "steel" tomado del aro del logo. Detalles completos en el skill tecnovo-design-system.
Estructura comercial de referencia: oferocol.com (header con CTAs, hero, bloque de marca, grid de modelos, ubicaciones, CTA de prueba de manejo, reseñas, widget de contacto). No copies textos, imágenes ni código.
Logo: usa los archivos de assets/brand/ (cópialos a public/brand/ en F0). La T sola va en el header y el favicon; el logo completo en footer, carga inicial y Open Graph.

# ALCANCE (12 ítems cotizados, todos obligatorios)
1. Página principal  2. Catálogo motos eléctricas nuevas  3. Catálogo motos de segunda mano  4. Catálogo repuestos y accesorios
5. Panel superadmin (jefe)  6. Carrito y pedidos  7. Pasarela Wompi  8. WhatsApp (botón con mensaje prellenado)
9. Diseño para distribuidor  10. Catálogo distribuidor (motos nuevas)  11. Pasarela de pagos distribuidor  12. Pruebas, hosting .com y capacitación

# FASES (un commit por fase)
F0 Setup (repo, Docker, Prisma, lint, .env.example, tokens) → F1 Sistema de diseño + layout global → F2 Modelo de datos + seed (12 nuevas, 8 usadas, 20 repuestos, 10 accesorios ficticios realistas) → F3 Home → F4 Catálogos + detalle → F5 Carrito, checkout y pedidos → F6 Wompi: sigue wompi-payments/reference.md (firma en servidor, Web Checkout, webhook con checksum, idempotencia) + tests Vitest → F7 Auth, roles y panel admin → F8 Portal distribuidor → F9 WhatsApp, SEO, performance, accesibilidad + toques que sorprenden (comparador de motos, calculadora de ahorro, pantalla de carga) → F10 Pruebas, README, manual de capacitación, despliegue en VPS con Docker + Caddy (docs/deploy-vps.md)

# CALIDAD
Mobile-first · Lighthouse Perf ≥90 / A11y ≥95 · Server Components por defecto · precios siempre recalculados en servidor · secretos solo en env · loading/vacío/error en cada ruta · tests Vitest + Playwright del flujo de compra.
Antes de cerrar cada fase, aplica el skill security-review (si está disponible) y verifica que build, lint y tests pasen.

# ENTREGABLE FINAL
Proyecto corriendo con `docker compose up`, README, `.env.example`, `/docs/manual-admin.md` y un resumen de qué quedó hecho por cada uno de los 12 ítems.

Empieza ahora por F0 y F1.
