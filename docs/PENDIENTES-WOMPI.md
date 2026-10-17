# Pendiente: Wompi Widget/SDK y nombres de variables

> **Estado:** pendiente, a futuro. Decisión del cliente el 2026-10-17: "eso de momento
> no lo tenemos, déjalo a futuro".
>
> **No rompe nada:** el pago actual funciona y está probado. Este documento es solo
> el recordatorio de lo que quedó por hacer si lo piden.

## Lo que ya funciona (no tocar sin necesidad)

| Pieza | Ruta / archivo |
|---|---|
| Firma de integridad | `lib/wompi.ts` → `buildIntegritySignature` |
| Verificación de checksum | `lib/wompi.ts` → `verifyEventChecksum` |
| Crear checkout | `app/api/checkout/wompi/route.ts` |
| Webhook | `app/api/wompi/events/route.ts` |
| Procesar evento | `lib/wompi-events.ts` |
| Tests | `tests/wompi.test.ts` (incluye el vector oficial de la doc) |

Flujo actual: **Web Checkout** (redirección a `checkout.wompi.co/p/`), que es lo que
dicta `.opencode/skills/wompi-payments/reference.md` y lo que exige `AGENTS.md`
("sigue el reference.md al pie de la letra").

## 1. `WOMPI_PRIVATE_KEY` no existe

El spec legal pedía `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` y `WOMPI_PRIVATE_KEY`.
**Wompi no tiene llave privada.** Sus secretos son:

| Variable | Para qué |
|---|---|
| `WOMPI_PUBLIC_KEY` | Identifica el comercio. Va en la URL del checkout. |
| `WOMPI_INTEGRITY_SECRET` | Firma de integridad del checkout. **Solo servidor.** |
| `WOMPI_EVENTS_SECRET` | Valida el checksum del webhook. **Solo servidor.** |

Si algún día aparece un `WOMPI_PRIVATE_KEY` en una configuración, **no lo uses**:
no firmaría nada y sería una falsa sensación de seguridad.

Sobre el prefijo `NEXT_PUBLIC_`: nuestra llave pública **no** lleva prefijo porque
solo se usa en el servidor para armar la URL de redirección. Exponerla al navegador
no aporta nada.

## 2. Widget o SDK de Wompi (alternativa al redirect)

Si algún día quieren el selector de tarjetas **dentro** del sitio en vez de saltar a
`checkout.wompi.co`:

- Cargar `https://checkout.wompi.co/p/widget.js` en el cliente.
- Generar la firma **en el servidor** (igual que hoy) y pasarla al widget. Nunca
  generar la firma en el navegador ni exponer `INTEGRITY_SECRET`.
- El webhook sigue siendo la verdad del pago. El widget no confirma nada.

Considera que esto contradice `wompi-payments/reference.md` y agrega un script de
terceros al sitio, con su propio impacto en rendimiento y privacidad.

## 3. Ruta del webhook

El webhook está en `/api/wompi/events`. Si piden `/api/wompi/webhook`:

1. Crear el alias en `app/api/wompi/webhook/route.ts` que reutilice el mismo handler.
2. **Actualizar la URL del evento en el panel de Wompi**
   (`comercios.wompi.co`, sección de desarrolladores). Si no, los eventos dejan de
   llegar aunque la ruta exista.

Para exponer el webhook en desarrollo local hay que apuntar a una URL pública con
ngrok o cloudflared y registrar esa misma URL en el ambiente de pruebas.

## 4. Chequeo rápido antes de cambiar cualquier cosa de Wompi

```powershell
npx vitest run tests/wompi.test.ts
```

Ese archivo fija el comportamiento esperado: orden exacto de la firma, checksum con
orden dinámico, comparación con `timingSafeEqual`, idempotencia del webhook y
rechazo cuando el monto no coincide. Si un cambio rompe pagos, ese test falla.