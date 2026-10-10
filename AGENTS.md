# TECNOVO — Tienda virtual de motos, repuestos y accesorios

Reglas permanentes (OpenCode lee este archivo automáticamente):
- Español de Colombia, precios en COP con Intl.NumberFormat('es-CO').
- Stack fijo: Next.js 15 (App Router) + TypeScript estricto + Tailwind + shadcn/ui + Prisma + PostgreSQL + Auth.js + Zod + Wompi.
- Antes de cada fase, lee los skills relevantes de .opencode/skills/ (propios y de ECC).
- Diseño: negro y gris, limpio, premium tipo Apple, NO futurista. Sigue el skill tecnovo-design-system. Logo en assets/brand/.
- Pagos: sigue el skill wompi-payments y su reference.md al pie de la letra. La verdad del pago es el webhook.
- Nunca confiar en precios del cliente: el servidor recalcula desde la BD.
- Secretos solo en variables de entorno. Commits pequeños (feat:, fix:, chore:).
- Mobile-first, estados de loading/vacío/error en cada ruta.
- Despliegue final en VPS con Docker + Caddy (ver skill qa-deploy). Copiar assets/brand/ a public/brand/ en la fase F0.
