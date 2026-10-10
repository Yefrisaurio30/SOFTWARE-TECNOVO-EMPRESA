---
name: qa-deploy
description: Pruebas, SEO, rendimiento, despliegue en VPS con Docker y dominio .com, y manual de capacitación.
---
- Vitest para lógica (totales, firma y checksum de Wompi), Playwright para el flujo catálogo → carrito → checkout sandbox
- SEO: metadata por página, sitemap.xml, robots.txt, Open Graph con el logo, JSON-LD Product
- Rendimiento: next/image con sizes, fuentes optimizadas, lazy loading. Lighthouse Perf ≥90, A11y ≥95

# Despliegue objetivo: VPS Linux (Ubuntu) con Docker
- docker-compose.prod.yml con 3 servicios: app (Next.js standalone), postgres (volumen persistente) y caddy (HTTPS automático con Let's Encrypt)
- Caddyfile con el dominio .com y reverse_proxy a la app
- DNS: registro A del dominio y de www apuntando a la IP del VPS
- Firewall (ufw) abierto solo en 22, 80 y 443; login SSH con llave
- Backups: cron diario con pg_dump comprimido, retención 14 días, y copia a un almacenamiento externo
- Documentar todo en /docs/deploy-vps.md, paso a paso, para alguien que no es desarrollador
- Variables de producción en un .env en el servidor, nunca en el repo. Llaves de Wompi en modo production solo al final

# Capacitación
/docs/manual-admin.md con capturas y pasos para subir productos, gestionar pedidos, aprobar distribuidores y cambiar banners.
