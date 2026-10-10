---
name: tecnovo-design-system
description: Sistema visual de TECNOVO, negro y gris, limpio y premium tipo Apple, nada futurista. Úsalo en cualquier componente, página, estilo o animación de la tienda.
---
# Concepto: "Monocromo premium"
Una tienda que se siente como una vitrina de producto: mucho negro, mucho aire, tipografía grande y la moto como protagonista. Calma, precisión, cero ruido. NO futurista: sin neón, sin glitch, sin degradados chillones, sin bordes luminosos agresivos.
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
- steel (acento tomado del aro del logo) #B8C2CF; steel-deep #5C7393; gradiente de aro: #E9ECF1 → #8A9BB7 → #5C7393
- success #30D158 | danger #FF453A (apagados, solo para estados)
Regla: el acento "steel" se usa SOLO en líneas finas, foco, estado activo y detalles. Nunca como fondo grande.

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
- Widget flotante de contacto: círculo graphite con borde steel e ícono monocromo (nunca verde neón)

# Toques que sorprenden (hacer en F9, son pequeños y de alto impacto)
1. Comparador: el usuario marca hasta 3 motos y ve una tabla lado a lado en un panel inferior
2. Calculadora de ahorro: km por día + precio de gasolina → ahorro mensual y anual frente a una moto de combustión
3. Pantalla de carga de 600ms con el logo apareciendo, solo en la primera visita

# Prohibido
Verdes o cianes neón, glassmorphism recargado, sombras negras gruesas, animaciones largas, fuentes decorativas, emojis en la interfaz, copiar contenido de otras tiendas. Usar placeholders propios (gradientes grises con silueta) hasta tener fotos reales.
