---
name: tecnovo-design-system
description: Sistema visual de TECNOVO, negro y gris, limpio y premium tipo Apple, nada futurista. Úsalo en cualquier componente, página, estilo o animación de la tienda.
---
# Concepto: "Monocromo con acento neón y CTA naranja"
Una tienda que se siente como una vitrina de producto: mucho negro, mucho aire, tipografía grande y la moto como protagonista. Calma, precisión, cero ruido. Base monocroma con verde neón (#00E640) como acento de marca, azul eléctrico (#0088FF) para enlaces e interactividad y naranja (#FF6600) para CTAs de compra (paleta aprobada en informe QA oct-2026).
Referencia de ESTRUCTURA comercial: oferocol.com. Referencia de ESTÉTICA: tiendas de producto minimalistas tipo Apple. No copiar textos, imágenes, logos ni código de nadie.

# Logo (assets/brand/)
- tecnovo-logo-original.png: círculo metálico + T alada + texto. Usar en footer, página de carga y Open Graph.
- tecnovo-mark-512.png / favicon-64.png: solo la T. Usar en header y favicon.
- Pedir al cliente SVG o PNG transparente. Mientras tanto, usar los PNG sobre fondo negro (el logo ya es negro, por eso el header también es negro).

# Tokens (Tailwind theme.extend.colors)
- black #000000 | ink #0A0A0B | graphite #161618 | surface #1C1C1E | surface-2 #2A2A2D
- line rgba(255,255,255,0.10) | line-strong rgba(255,255,255,0.18)
- text #F5F5F7 | text-muted #A1A1A6 | text-faint #6E6E73
- light #F5F5F7 | light-surface #FFFFFF | light-text #1D1D1F | light-muted #6E6E73
- steel = ACENTO VERDE NEÓN DE MARCA #00E640 (paleta QA oct-2026); steel-deep #00A330 (verde oscuro, legible sobre gris claro)
- electric = AZUL ELÉCTRICO #0088FF: enlaces, badges decorativos e interactividad (hover de enlaces, "Ver más ›", "Seguir explorando")
- cta = NARANJA #FF6600: botones de compra (Agregar, Confirmar pedido, Pagar), cotizaciones destacadas y precios/ofertas en destaque. Texto negro sobre naranja: `bg-cta text-black`
- success #30D158 | danger #FF453A (apagados, solo para estados)

Regla del acento, sin excepciones:
- `text-steel` / `bg-steel` / `border-steel` SOLO sobre fondos oscuros (black, ink, graphite, surface, surface-2, white/5).
- Sobre secciones claras (`bg-light`, `bg-light-surface`) se usa `steel-deep`. El neón es ilegible sobre gris claro.
- El acento steel se usa en badges de specs, bordes activos y focus rings. Nunca como fondo grande ni en bloques de texto largos.
- Los botones de compra y cotización usan `bg-cta text-black`; los enlaces de texto usan `text-electric` (sobre fondos oscuros).
- Para texto negro sobre neón: `bg-steel text-black` solo en chips/estados puntuales.

# Tipografía
Inter (next/font) como alternativa a SF Pro. Titulares 600-700 con letter-spacing -0.03em y line-height 1.05.
Escala: hero clamp(44px, 8vw, 104px) · h2 clamp(32px, 5vw, 64px) · cuerpo 17px/1.5 · precios con tabular-nums.

# Espaciado y forma
- Secciones con py-24 a py-40; contenedor máx. 1200px
- Radios: tarjetas 28px, imágenes 24px, botones y chips 999px
- Sin sombras pesadas: bordes de 1px + resaltado interno sutil (inset 0 1px 0 rgba(255,255,255,.06))
- Alternar secciones: negro → gris claro #F5F5F7 → negro, con transición limpia

# Botones
- Primario en fondo oscuro: píldora blanca, texto negro. En fondo claro: píldora negra, texto blanco
- Secundario: enlace con flecha ("Ver más ›"), sin caja
- Hover: escala 1.02 y cambio sutil de brillo, 200ms

# Movimiento (Framer Motion)
- Curva cubic-bezier(.22,1,.36,1), reveals de 600-800ms, una sola vez al entrar a pantalla
- Parallax suave en el hero (≤ 24px). Sin autoplay agresivo; el carrusel se detiene al hover
- Respetar prefers-reduced-motion: desactivar todo salvo fades

# Componentes
- Navbar: píldora flotante translúcida (backdrop-blur), 56px, con la T, menú, buscador, carrito. Se compacta al hacer scroll
- Hero: negro puro, titular enorme, subtítulo gris, 2 CTAs, moto centrada con un foco de luz gris muy suave detrás y un aro fino (eco del logo) a modo de halo. Carrusel de 3 modelos
- "Por qué TECNOVO": 6 puntos en rejilla con íconos lineales de 1.5px, sin cajas pesadas
- Sección sticky de specs: la moto queda fija y las cifras (autonomía, velocidad, carga) aparecen con contador al hacer scroll
- ProductCard: fondo surface, imagen grande, nombre, 2 specs, precio, "Agregar" + ícono WhatsApp monocromo. En hover cambia a una segunda imagen
- Prueba de manejo: franja clara #F5F5F7 con CTA negro a WhatsApp
- Reseñas: tarjetas limpias con estrellas en steel
- Footer: negro, logo grande tenue, enlaces en gris, política de datos y PQRS
- Widget flotante de contacto: círculo graphite con borde neón e ícono monocromo

# Toques que sorprenden (hacer en F9, son pequeños y de alto impacto)
1. Comparador: el usuario marca hasta 3 motos y ve una tabla lado a lado en un panel inferior
2. Calculadora de ahorro: km por día + precio de gasolina → ahorro mensual y anual frente a una moto de combustión
3. Pantalla de carga de 600ms con el logo apareciendo, solo en la primera visita

# Prohibido
Colores fuera de la paleta autorizada (#00E640, #0088FF, #FF6600 y sus derivados), glassmorphism recargado, sombras negras gruesas, animaciones largas, fuentes decorativas, emojis en la interfaz, copiar contenido de otras tiendas. Usar placeholders propios (gradientes grises con silueta) hasta tener fotos reales.
