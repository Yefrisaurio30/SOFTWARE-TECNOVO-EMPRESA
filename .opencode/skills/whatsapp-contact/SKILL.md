---
name: whatsapp-contact
description: Botones y widget flotante de WhatsApp con mensaje prellenado por producto.
---
- Número en NEXT_PUBLIC_WHATSAPP (editable también desde el admin)
- Enlace: https://wa.me/{numero}?text={mensaje codificado con encodeURIComponent}
- Mensaje: "Hola TECNOVO, me interesa {nombre} ({url}). ¿Me cotizan?"
- Botón en ProductCard y detalle, widget flotante global, CTA de prueba de manejo
- target="_blank" con rel="noopener noreferrer". Evento de analytics en cada clic
