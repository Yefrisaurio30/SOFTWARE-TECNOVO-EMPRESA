---
name: distributor-portal
description: Portal de distribuidores con registro aprobado, catálogo mayorista de motos nuevas y pagos propios.
---
- Registro con datos de empresa (NIT, ciudad, contacto) → PENDIENTE hasta aprobación del superadmin
- /distribuidores: diseño más sobrio y orientado a negocio, mismos tokens visuales
- Catálogo mayorista: solo MOTO_NUEVA, muestra priceWholesale, mínimo de unidades configurable
- Carrito y checkout separados con Wompi (ver skill wompi-payments)
- Historial de pedidos y resumen en PDF
- Sin sesión aprobada nunca se exponen precios mayoristas (ni en el HTML ni en la API)
