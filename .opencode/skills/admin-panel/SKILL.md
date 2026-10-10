---
name: admin-panel
description: Panel del superadministrador (jefe) con dashboard, CRUD de productos, pedidos, usuarios y contenido.
---
Ruta /admin protegida por middleware (solo SUPERADMIN).
- Dashboard: ventas del mes, pedidos pendientes, stock bajo, gráfico (recharts)
- Productos: CRUD, subida múltiple de imágenes, activar/desactivar, destacar, precios retail y mayorista
- Pedidos: tabla con filtros, cambio de estado, detalle, exportar CSV
- Usuarios/distribuidores: aprobar o rechazar solicitudes, asignar rol
- Contenido: banners del hero, textos de la home, número de WhatsApp, reseñas
- TanStack Table, formularios con Zod, confirmación antes de borrar, toasts, log de auditoría simple
