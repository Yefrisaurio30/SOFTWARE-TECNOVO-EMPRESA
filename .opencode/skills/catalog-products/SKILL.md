---
name: catalog-products
description: Catálogos de motos nuevas, usadas, repuestos y accesorios, con filtros, orden y detalle de producto.
---
# Modelo (Prisma)
Product { id, slug, name, type: MOTO_NUEVA|MOTO_USADA|REPUESTO|ACCESORIO, brand, priceRetail, priceWholesale?, stock, description, images[], specs Json, featured, active }
- Nuevas: autonomía, potencia, velocidad máx., batería, tiempo de carga
- Usadas: año, kilometraje, estado (1-10), garantía. Unidad única: al reservarse se bloquea stock
- Repuestos: compatibilidad (modelos), referencia, marca

# Rutas
/motos-electricas, /motos-usadas, /repuestos-accesorios y /[categoria]/[slug].

# UX
Filtros en searchParams (marca, precio, año, km, compatibilidad), orden (relevancia, precio, recientes), paginación.
Detalle con galería con zoom, tabla de specs, relacionados y JSON-LD Product. Skeletons y estado vacío.
