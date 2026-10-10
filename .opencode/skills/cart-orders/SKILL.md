---
name: cart-orders
description: Carrito de compras, checkout y gestión de pedidos con totales calculados en servidor.
---
- Carrito en Zustand con persistencia en localStorage; sincroniza a BD si hay sesión. Drawer + página /carrito
- Checkout: contacto, dirección/ciudad, entrega (envío o recoger en tienda), resumen
- Order { id, userId?, status: PENDIENTE|PAGADO|RECHAZADO|ENVIADO|ENTREGADO|CANCELADO, total, items[], paymentRef, createdAt }
- El servidor SIEMPRE recalcula totales desde la BD y valida stock en transacción Prisma
- Correo de confirmación y /pedido/[id] con estado
