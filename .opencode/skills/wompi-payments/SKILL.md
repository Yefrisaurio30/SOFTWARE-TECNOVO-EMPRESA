---
name: wompi-payments
description: Integración de Wompi (Colombia) con Web Checkout, firma de integridad en servidor y webhook verificado e idempotente. Para clientes y distribuidores.
---
Basado en la documentación oficial (docs.wompi.co: "Widget & Checkout Web" y "Eventos"). Antes de implementar, confirma allí que nada cambió. El código de referencia está en reference.md de esta misma carpeta.

# Flujo
1. POST /api/checkout/wompi (con sesión o datos de invitado): el servidor lee el Order de la BD y recalcula el total. Nunca usa un monto enviado por el cliente.
2. Genera una reference única de por vida (ej. TNV-{orderId}-{timestamp}); la guarda en el Order.
3. Calcula amount_in_cents = total COP × 100 y la firma de integridad: SHA256 de la concatenación EXACTA y en este orden: reference + amountInCents + currency + INTEGRITY_SECRET. Esto se hace SOLO en el servidor.
4. Devuelve la URL de Web Checkout (https://checkout.wompi.co/p/) con: public-key, currency=COP, amount-in-cents, reference, signature:integrity, redirect-url. El navegador redirige ahí. (Alternativa: Widget con widget.js y data-signature:integrity.)
5. Wompi vuelve a /pedido/[id]. Esa página es solo informativa y muestra "verificando pago" hasta que el webhook confirme.
6. POST /api/wompi/events recibe el evento transaction.updated. Verificación del checksum: tomar los valores de signature.properties EN EL ORDEN en que vienen (rutas como transaction.id, transaction.status, transaction.amount_in_cents), concatenar signature.timestamp, concatenar EVENTS_SECRET, SHA256, y comparar con signature.checksum (también llega en el header X-Event-Checksum). Leer properties dinámicamente: puede variar.
7. Si el checksum es válido: buscar el Order por transaction.reference, comprobar que amount_in_cents coincida con el total del pedido, y actualizar estado: APPROVED → PAGADO (descontar stock), DECLINED/ERROR/VOIDED → RECHAZADO. Debe ser idempotente: si el pedido ya está en estado final, responder 200 sin repetir efectos.
8. Responder 200 rápido. Si el checksum falla, 400 y registrar el intento sin guardar secretos.

# Variables de entorno
WOMPI_ENV=sandbox|production · WOMPI_PUBLIC_KEY · WOMPI_INTEGRITY_SECRET · WOMPI_EVENTS_SECRET
Distribuidor: WOMPI_DIST_* solo si el cliente usa una cuenta Wompi aparte.
Las llaves y secretos de pruebas son distintos a los de producción. El secreto de integridad NO es la llave pública ni la privada.

# Sandbox y producción
API sandbox: https://sandbox.wompi.co/v1 · producción: https://production.wompi.co/v1. La URL de eventos se configura por separado para cada ambiente en el dashboard de Wompi (comercios.wompi.co, sección de desarrolladores).
En desarrollo local, exponer /api/wompi/events con ngrok o cloudflared y registrar esa URL en el ambiente de pruebas.

# Errores que NO se deben cometer
- Firmar o guardar secretos en el frontend
- Confiar en la redirección como prueba de pago
- Reutilizar una reference
- No comparar el monto del evento con el del pedido
- Asumir un orden fijo en signature.properties
- Comparar checksums con === (usar timingSafeEqual)

# Tests obligatorios (Vitest)
Firma de integridad con el ejemplo oficial de la doc, verificación de checksum válido e inválido, evento repetido (idempotencia) y monto que no coincide.
