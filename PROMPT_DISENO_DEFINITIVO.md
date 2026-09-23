# PROMPT DEFINITIVO — Rediseño UI/UX "Gravedad Cero Floral"
## Yeska Essence · Velas artesanales en cera de soja y yeso

> Documento maestro. Contiene: rol, contexto técnico real, dirección de arte derivada de
> los bocetos aprobados, sistema de diseño con valores exactos, arquitectura de secciones,
> sistema de movimiento con presupuesto de rendimiento, criterios de aceptación y
> **el catálogo completo con precios y descripciones** (incluye el producto que faltaba).

---

# 0. Rol y misión

Actúa como **director de arte digital + desarrollador front-end senior**, especializado en
sitios de marca de lujo artesanal (nivel Aesop, Diptyque, Loewe Home Scents). Dominas CSS
moderno (custom properties, `clamp()`, capas, `@supports`, animaciones compuestas),
JavaScript vanilla para interacción de UI y optimización de rendimiento en móviles de gama
media.

**Misión:** rediseñar por completo la capa visual del sitio público de Yeska Essence para
que deje de parecer un catálogo en cuadrícula y pase a ser **una experiencia inmersiva de
gravedad cero floral** — sin romper una sola funcionalidad existente ni la conexión a datos.

**Criterio de éxito en una frase:** que el sitio se sienta como abrir una caja de regalo
premium, no como abrir una hoja de cálculo.

---

# 1. Contexto técnico real (no negociable — léelo antes de escribir una línea)

Este **no** es un proyecto en blanco. Es un sitio funcionando, con base de datos y panel
de administración en producción.

| Aspecto | Realidad |
|---|---|
| Framework | **Astro** con salida `server` (SSR), desplegado en Netlify |
| Sitio público | `src/pages/index.astro` (576 líneas: frontmatter + HTML + `<script>` inline) |
| Estilos públicos | `src/styles/site.css` (378 líneas, import global, **no** scoped) |
| Datos | **Supabase** — tablas `productos`, `lineas`, `recordatorios`, `recordatorio_opciones` |
| Panel admin | `src/pages/admin/**` + `src/styles/admin.css` — **PROHIBIDO TOCAR** |
| Siembra | `scripts/seed.mjs` (carga catálogo + sube fotos a Supabase Storage) |
| Tipografías ya cargadas | Fraunces (variable), Karla, Pinyon Script — vía Google Fonts |

### 1.1 Funcionalidades que DEBEN seguir funcionando idénticas

No es una lista de sugerencias. Si al terminar alguna de estas se rompió o desapareció, el
trabajo está mal hecho:

1. **Preloader** (`#preload`) con anillo SVG dorado animado y palabra "Yeska Essence".
2. **Nav** (`#nav`) con clase `.scrolled` que se activa pasados 24px de scroll.
3. **Menú móvil** (`#menuBtn` / `#menu`) con `aria-expanded`, `body.locked`, cierre con `Escape`.
4. **Hero** con canvas de brasas/partículas (`#embers`).
5. **Ticker** horizontal infinito (`#ticker`).
6. **Filtros por línea** (flores / botánica / figuras / recipientes) + contador `#count` con `aria-live`.
7. **Buscador** (`#buscador`) por nombre y material.
8. **Orden por precio** (`#orden`).
9. **Favoritos**: botón corazón por tarjeta, contador flotante (`#favToggle`), panel lateral
   (`#favPanel`), persistencia en `localStorage` (clave `yeska-favs`), y envío del listado
   completo por WhatsApp (`#favSend`).
10. **Quickview** (`<dialog id="quickview">`) al tocar la foto de una tarjeta.
11. **Botón flotante de WhatsApp** (`.wa-float` → `wa.me/573214034007`).
12. **Botón "volver arriba"** (`#toTop`, aparece pasados 600px).
13. **Animaciones de entrada** por Intersection Observer (`.reveal`, `.rise`).
14. **Sección de recordatorios** con tabla de opciones (precio unidad / al mayor).

### 1.2 Lo que NO debes modificar

- El frontmatter de `index.astro` que consulta Supabase (líneas 1–42).
- `src/lib/supabase.js` y `src/lib/authGuard.js`.
- Cualquier archivo bajo `src/pages/admin/` o `src/styles/admin.css`.
- La forma de los objetos `productos` y `recs` (`{id, n, line, mat, p, note, img}` y
  `{id, n, d, note, img, rows}`) — el HTML se genera desde ahí en JS.
- Los `id` de los elementos que el JavaScript consulta. Puedes cambiar **clases** y
  **estructura interna**, nunca los `id` ya cableados.

### 1.3 Regla del bug histórico (aprendizaje que no se repite)

Ya ocurrió un bug donde el panel de favoritos aparecía abierto sin razón: una regla CSS
declaraba `display: flex` sobre una clase que el JS ocultaba con el atributo `hidden`, y el
`display` ganó. **Regla permanente para todo el rediseño:**

```css
[hidden] { display: none !important; }
```

declarado una sola vez, arriba, y toda superficie flotante nueva (paneles, tooltips,
overlays) debe auditarse contra este patrón antes de darla por terminada.

---

# 2. Dirección de arte — lectura literal de los 3 bocetos aprobados

Los bocetos son la fuente de verdad estética. Esto es lo que definen, boceto por boceto:

### Boceto 1 — "Nuestra Esencia" (hero editorial partido)

- Composición **asimétrica 45/55**: bloque de texto a la izquierda, imagen a la derecha.
- La foto vive dentro de un **arco arquitectónico** (medio punto: bordes superiores
  redondeados, base recta) con **doble filete dorado fino** — un filete exterior separado
  ~10px del interior. Nada de marcos gruesos.
- Titular serif enorme en **blanco crema**, dos líneas, sin contorno ni sombra dura.
- Párrafo corto debajo, tipografía serif ligera, ancho máximo ~34 caracteres.
- **Velas flotando libres sin fondo** distribuidas alrededor: rosas granate, suculentas
  verde salvia, ositos de cera beige/marrón. Unas delante del texto, otras detrás.
- **Pétalos sueltos** (rosa, crema, verde) girando en el aire, tamaños distintos, algunos
  desenfocados.
- **Polvo dorado**: puntos diminutos de 1–3px dispersos, opacidad baja.
- Microcaption centrada al pie, serif pequeña, espaciada.
- **Sin botón visible en el hero** — la invitación es visual, no un CTA ruidoso.

### Boceto 2 — "Colección Destacada" (galería de museo)

- Título centrado, serif, blanco crema, con polvo dorado alrededor.
- **Tres productos sobre pedestales cilíndricos en bronce** — no tarjetas rectangulares.
  Cilindro con degradado vertical (luz arriba, sombra abajo) y elipse superior visible.
- **El nombre del producto va escrito sobre la cara del pedestal**, en sans-serif blanca,
  centrado, tracking amplio. No debajo, no en una caja.
- La vela se apoya en el pedestal y proyecta sombra sobre él.
- Marco de sección: **hairline rectangular** apenas visible (rgba blanco muy bajo) que
  encuadra la composición sin cerrarla.
- Pétalos flotando también aquí, en menor densidad que en el hero.

### Boceto 3 — "Transformamos la luz en arte" (manifiesto a sangre completa)

- Sección de **ancho completo, sin contenedor**, que rompe el ritmo del resto.
- Titular gigantesco centrado (2 líneas), blanco crema, ocupando ~70% del ancho.
- **Campo denso de velas** rodeando el texto: rosas granate grandes muy nítidas delante,
  suculentas y ositos medianos a los lados, piezas pequeñas y **desenfocadas** al fondo.
- Auténtica **profundidad de campo**: escala + blur + opacidad varían con la capa.
- Es la sección de máximo impacto: aquí la densidad de elementos flotantes es la más alta.

### 2.1 Constantes presentes en los tres bocetos

- **Nav centrado, minimalista, siempre 3 enlaces**: `Colección · Nuestra Historia · Contacto`,
  en serif, separados por **barras verticales finas**, sobre fondo transparente, con una
  **línea horizontal hairline** debajo que lo separa del contenido. Sin logo grande, sin CTA.
- **Fondo rosa empolvado uniforme y continuo** en todas las pantallas: no hay cortes de
  sección con colores distintos. Las secciones se distinguen por composición, no por bloques.
- **Todo el texto sobre ese fondo es blanco crema**, nunca marrón oscuro.
- **Viñeta sutil** en las esquinas (el fondo se oscurece ligeramente en los bordes).

### 2.2 Corrección importante de paleta (léela con atención)

El prompt anterior indicaba fondo `#F3E8E6` / `#EEDCDB` con texto marrón `#4A3B39`.
**Los bocetos no son eso.** Muestreados píxel a píxel, el fondo de los tres es un
**malva rosado mucho más profundo y saturado: `#D1B4B0`**, con viñeta hacia `#A57E79` y
zonas claras hasta `#D5B8B4`. El texto ahí es **crema, no marrón**.

La resolución no es elegir uno u otro, es usar **dos ambientes**:

- **Ambiente Inmersivo** (`#D1B4B0`, texto crema) → hero, manifiesto, colección destacada,
  proceso, contacto. Es el alma del sitio, el de los bocetos.
- **Ambiente Lienzo** (`#F3E8E6`, texto `#4A3B39`) → sección de catálogo completo y
  recordatorios, donde hay **16 productos con foto, precio, filtros y buscador** y el
  usuario necesita leer y comparar sin fatiga visual.

La transición entre ambientes **nunca es un corte recto**: usa un degradado vertical de al
menos 160px, o una curva/arco SVG que una las dos superficies.

---

# 3. Sistema de diseño — valores exactos

### 3.1 Paleta (declarar como custom properties en `:root`)

```css
:root {
  /* Ambiente Inmersivo — el de los bocetos */
  --malva:          #D1B4B0;  /* fondo base inmersivo */
  --malva-hondo:    #A57E79;  /* viñeta, sombras de ambiente, degradados */
  --malva-claro:    #D9C0BC;  /* zonas iluminadas del fondo */
  --crema:          #F7F0EA;  /* titulares sobre ambiente inmersivo */
  --crema-suave:    rgba(247, 240, 234, 0.78); /* apoyos secundarios */

  /* Ambiente Lienzo — catálogo legible */
  --nude:           #F3E8E6;  /* fondo del catálogo */
  --nude-hondo:     #EEDCDB;  /* superficies alternas dentro del lienzo */
  --tinta:          #4A3B39;  /* texto principal sobre lienzo */
  --tinta-suave:    #7A6764;  /* texto secundario sobre lienzo */
  --carta:          #FFFFFF;  /* SOLO tarjetas de producto sobre lienzo */

  /* Metales y acentos */
  --oro:            #C49A45;  /* CTAs, íconos, filetes */
  --oro-hondo:      #8C6318;  /* extremos del degradado metálico */
  --oro-luz:        #E9CF7A;  /* brillo del degradado metálico */
  --bronce-alto:    #8C6A45;  /* cara iluminada del pedestal */
  --bronce-bajo:    #5E3F2C;  /* base en sombra del pedestal */
  --rosa-honda:     #A85A65;  /* palabras clave resaltadas, estados activos */
  --verde-salvia:   #8BA38D;  /* equilibrio botánico, línea "Botánica" */
  --wa:             #25D366;  /* verde WhatsApp, intocable */

  /* Filetes y sombras */
  --filete-oro:     rgba(196, 154, 69, 0.55);
  --filete-crema:   rgba(247, 240, 234, 0.22);
  --sombra-flota:   drop-shadow(0 14px 18px rgba(93, 63, 60, 0.28));
  --sombra-carta:   0 24px 48px -28px rgba(74, 59, 57, 0.42);
  --oro-grad: linear-gradient(110deg, #8C6318 0%, #C49A45 28%, #E9CF7A 50%, #C49A45 72%, #8C6318 100%);
}
```

**Reglas de color innegociables:**
- Cero blanco puro como fondo general. El blanco puro existe **solo** en tarjetas de producto.
- Cero neón, cero saturación alta, cero negro puro (`#000`).
- El dorado es el **único** metal. No mezclar con plata, cobre ni cromo.
- El verde salvia nunca es protagonista: es respiración, no acento principal.

### 3.2 Tipografía

**Decisión: se mantienen las tres familias ya cargadas.** `Playfair Display`, `Cormorant` y
`Lora` son excelentes, pero **Fraunces ya está en el proyecto**, es variable (ejes `SOFT` y
`opsz`), cubre exactamente el mismo registro serif elegante, y cargar una cuarta familia
costaría ~120KB sin ganancia estética real. Si tras maquetar el hero juzgas que Fraunces no
da el aire del boceto, **sustituye** Fraunces por Cormorant Garamond — nunca añadas ambas.

| Rol | Familia | Tamaño | Detalles |
|---|---|---|---|
| Display / H1 hero y manifiesto | Fraunces | `clamp(3rem, 9vw, 7.5rem)` | `line-height: .95`, `letter-spacing: -0.02em`, `font-variation-settings: "SOFT" 100, "opsz" 144`, `text-wrap: balance` |
| H2 de sección | Fraunces | `clamp(2rem, 5vw, 3.6rem)` | `line-height: 1.05` |
| H3 / nombre de producto | Fraunces | `clamp(1.05rem, 2vw, 1.35rem)` | `font-weight: 500` |
| Párrafo | Karla | `clamp(0.95rem, 1.6vw, 1.05rem)` | `line-height: 1.65`, `max-width: 58ch` |
| Eyebrow / etiqueta de pedestal | Karla | `0.72rem` | `text-transform: uppercase`, `letter-spacing: 0.2em`, `font-weight: 600` |
| Precio | Karla | `1.15rem` | `font-weight: 700`, `font-variant-numeric: tabular-nums` |
| Firma decorativa | Pinyon Script | `clamp(1.4rem, 3vw, 2.2rem)` | máximo 2 usos en toda la página |

**Regla de contraste de formas:** serif gigante contra fondo limpio + foto recortada = efecto
3D. Si el titular no se siente "demasiado grande", todavía es demasiado pequeño.

### 3.3 Geometría — cómo se rompe la cuadrícula

Prohibido: todo rectángulo de esquinas a 90° sin justificación. El vocabulario de formas es:

- **Arco de medio punto**: `border-radius: 50% 50% 12px 12px / 38% 38% 12px 12px` — para
  fotos protagonistas (hero, proceso, historia).
- **Cápsula**: `border-radius: 999px` — botones, chips de filtro, badges.
- **Rectángulo suavizado**: `border-radius: 20px 20px 28px 28px` (asimétrico) — tarjetas.
- **Cilindro**: pedestales de la colección destacada.
- **Doble filete dorado**: `border: 1px solid var(--filete-oro)` + pseudo-elemento
  `::before` con `inset: -10px` y el mismo borde.
- **Solapamiento entre secciones**: al menos 2 secciones deben tener un elemento que
  sobresalga hacia la siguiente con `margin-bottom: -80px` + `z-index` positivo. Las
  secciones no pueden quedar apiladas como ladrillos.
- **Desfase vertical en grids**: en la colección destacada, la pieza central va 24–40px más
  alta que las laterales.

---

# 4. Arquitectura de la página (orden, ambiente y copy en español)

> Todo el copy va **en español**. Los bocetos tienen texto en inglés porque son mockups;
> el sitio es de una marca colombiana que vende en Colombia.

| # | Sección | Ambiente | Contenido |
|---|---|---|---|
| 0 | Preloader | Inmersivo | Anillo dorado + "Yeska Essence" / "Iluminando momentos". Máx. 1.5s. |
| 1 | Nav | Transparente | `Colección · Nuestra Historia · Contacto` + acceso a favoritos. |
| 2 | **Hero manifiesto** | Inmersivo | H1: *"Transformamos la luz en arte y el aroma **en recuerdos**"*. Campo denso de velas flotantes (boceto 3). Caption al pie: *"Hecho a mano, con intención"*. |
| 3 | Ticker | Inmersivo | Cinta infinita: `Cera de soja 100% · Yeso artesanal · Fragancias premium · Hecho en Colombia ·` |
| 4 | **Nuestra Esencia** | Inmersivo | Boceto 1 exacto. H2: *"Tres materiales, una pieza que **no se marchita**"*. Foto del proceso dentro del arco dorado. Texto: ver §6.2. |
| 5 | **Colección Destacada** | Inmersivo | Boceto 2 exacto. 3 pedestales de bronce con 3 piezas insignia. Enlace *"Ver la colección completa →"*. |
| 6 | *(transición)* | degradado | Malva → nude en ≥160px, o arco SVG. |
| 7 | **La Colección** | Lienzo | Catálogo completo: filtros, buscador, orden, 16 tarjetas, favoritos, quickview. |
| 8 | **Recordatorios** | Lienzo | 7 líneas con opciones y precio unidad / al mayor. |
| 9 | *(transición)* | degradado | Nude → malva. |
| 10 | **Proceso** | Inmersivo | 4 pasos con las fotos `proceso-yeso`, `proceso-trio`, `proceso-set`, en escalera vertical desfasada, no en fila. |
| 11 | **Contacto** | Inmersivo | Teléfonos, Instagram, CTA de WhatsApp. |
| 12 | Footer | Inmersivo hondo | Logo, lema, © y datos. |

---

# 5. Sistema de movimiento (el factor "wow", con freno de mano)

### 5.1 Las cuatro animaciones obligatorias

**A. Levitación constante**
```css
@keyframes levitar {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%      { transform: translate3d(0, -15px, 0) rotate(2deg); }
}
.flota { animation: levitar 5.5s ease-in-out infinite; will-change: transform; }
```
**Secreto orgánico obligatorio:** cada pieza flotante lleva `animation-delay` y
`animation-duration` distintos (duraciones 4s–7s, delays de 0 a −6s). Si dos piezas se
mueven en sincronía, el efecto se rompe y parece un GIF barato.

**B. Parallax de scroll**
Capas de fondo (pétalos, polvo dorado) se mueven ~0.3× la velocidad del scroll; las velas
grandes de primer plano ~1.15×. Implementar con GSAP ScrollTrigger **o** con
`transform: translate3d()` dentro de un `requestAnimationFrame` sobre un valor de scroll
cacheado. **Nunca** leer `getBoundingClientRect()` dentro del listener de scroll.

**C. Revelado al entrar en viewport**
`opacity: 0; transform: translateY(30px)` → `opacity: 1; translateY(0)`, `600ms`,
`cubic-bezier(.2,.7,.2,1)`. Vía Intersection Observer con `threshold: 0.15` y
`unobserve()` tras disparar. Elementos hermanos escalonados a 60–80ms.

**D. Micro-interacciones**
- Tarjeta hover: foto `scale(1.05)` en 420ms + sombra que se expande de
  `0 24px 48px -28px` a `0 34px 64px -26px`.
- Botón dorado hover: el degradado metálico se desplaza (`background-position`), sin cambiar
  de color.
- Pedestal hover: la vela sube 8px y su sombra sobre el cilindro se acorta y se oscurece.
- Chip de filtro activo: relleno dorado + texto crema, transición 200ms.

### 5.2 Presupuesto de rendimiento (obligatorio — aquí es donde estos diseños fracasan)

| Regla | Valor |
|---|---|
| Elementos flotantes simultáneos, escritorio | máx. **14** |
| Elementos flotantes simultáneos, móvil (<768px) | máx. **6** |
| Propiedades animadas permitidas | **solo** `transform` y `opacity` |
| Prohibido animar | `top`, `left`, `width`, `height`, `margin`, `filter`, `box-shadow` |
| `will-change` | solo sobre elementos que animan de verdad, nunca global |
| Peso de cada imagen flotante | ≤ **60KB** en WebP |
| Parallax en móvil | **desactivado** (solo levitación, y reducida) |
| Objetivo | 60fps sostenidos; **LCP < 2.5s**, **CLS < 0.1** en móvil 4G |

### 5.3 Accesibilidad del movimiento

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Todo elemento decorativo flotante lleva `aria-hidden="true"` y `pointer-events: none`.

### 5.4 Smooth scrolling

Lenis (o similar) es **opcional y condicionado**: actívalo solo en escritorio, solo si
`prefers-reduced-motion` no está activo, y verifica que no rompa el `<dialog>` del quickview
ni el scroll interno del panel de favoritos. Si entra en conflicto, se descarta — la
funcionalidad manda sobre el efecto.

---

# 6. Contenido real de marca (del PDF oficial)

### 6.1 Identidad

- **Nombre:** Yeska Essence (Instagram: `@Yeska_Essence`).
  *Nota: el PDF alterna "Yeska_Essence" y "Yesca_essence" — unificar siempre en* **Yeska Essence**.
- **Lema principal:** *"Transformamos la luz en arte, y el aroma en recuerdos."*
- **Lema secundario:** *"Iluminando Momentos"*
- **Teléfonos:** 321 403 4007 · 316 525 2600
- **WhatsApp del sitio:** `wa.me/573214034007`

### 6.2 Los cuatro pilares (texto para "Nuestra Esencia")

1. **Bases de yeso hechas a mano** — recipientes, bandejas y jarrones elaborados
   artesanalmente. El yeso permite acabados pulidos, minimalistas y elegantes que quedan
   como joya decorativa permanente en el hogar.
2. **Cera de soja 100% natural** — sostenible, biodegradable y de combustión limpia. Su
   punto de fusión más bajo garantiza mayor duración y una liberación de fragancia más
   intensa y pura.
3. **Esculturas en cera** — desde peonías y rosas en tonos pastel hasta cactus exóticos,
   cada figura se esculpe para imitar la belleza de la naturaleza.
4. **Fragancias exquisitas** — aromas premium que evocan frescura, serenidad y elegancia,
   diseñados para perdurar y crear ambientes acogedores.

### 6.3 Líneas del catálogo oficial (6 en el PDF)

Línea Botánica · Sets de Gala & Peonías · Recordatorios Personalizados · Cofres de Rosas ·
Centros de Mesa · Trío de Calma y recipientes.

> ⚠️ **Discrepancia a resolver con la dueña:** la base de datos tiene **4** líneas
> (`flores`, `botanica`, `figuras`, `recipientes`). El PDF describe **6**. Además,
> **"Cofres de Rosas" se anuncia pero no tiene ninguna pieza con precio en el catálogo**.
> No inventes productos para llenar ese hueco: mantén las 4 líneas de la base de datos y
> reporta la diferencia.

### 6.4 Línea de eventos

- **XV Años** — tonos azules, rosas o dorados; elefantes de la suerte o rosas delicadas.
- **Bautizos y Primeras Comuniones** — yeso blanco, aromas suaves (lavanda, algodón).
- **Bodas y Aniversarios** — cristal y mármol con flores de cera de soja.
- **Eventos Corporativos** — regalos de agradecimiento.
- **Personalización total:** etiquetas a medida con nombres, fechas y mensajes, más
  empaques premium.

---

# 7. CATÁLOGO COMPLETO — 16 productos con precio y descripción

> Extraído del PDF oficial (32 páginas), verificado página por página.
> **Producto nuevo detectado:** el PDF dedica **dos páginas distintas** (8 y 9) a dos
> productos diferentes que se llaman igual, "Centro de Mesa", ambos a $50.000. Hoy la base
> de datos solo tiene uno. Se desdoblan abajo en **#3** y **#4** con nombres distintivos.
> Es el único producto que faltaba; el resto del catálogo ya estaba completo.

### 7.1 Productos

| # | Producto | Línea | Precio | Materiales | Descripción |
|---|---|---|---|---|---|
| 1 | **Bouquet Colorido** | flores | $80.000 | Cuenco en yeso · Flores en cera de soja con fragancia · Flores secas naturales · Lazo de satín | Un ramo que no se marchita: rosas, peonías y una gerbera esculpidas en cera de soja en rosa, azul, amarillo y blanco, acompañadas de flores secas y una mariposa de cera. Presentado en cuenco dorado con lazo. La pieza más viva del catálogo. |
| 2 | **Abrazo Aromático** | figuras | $100.000 | Oso y rosas en cera de soja con fragancia · Envoltura tipo bouquet · Lazo | La pieza insignia. Un oso texturizado en rosas de cera fucsia, con corazón al pecho, coronando un bouquet de rosas moradas, blancas y coral sobre flores secas. Envuelto como ramo de floristería. El regalo de aniversario por excelencia. |
| 3 | **Centro de Mesa · Cuenco Floral** | flores | $50.000 | Vasija en yeso · Flores aromatizadas en cera de soja · Caja de acetato con lazo | Cuenco de yeso artesanal colmado de rosas de cera en azul, rosa, amarillo y blanco sobre follaje. Se entrega en caja de acetato transparente con lazo, listo para regalar sin envolver. |
| 4 | **Centro de Mesa · Trío de Jarrones** ⭐ *(faltaba)* | flores | $50.000 | Jarrones y bandeja en yeso acanalado · Flores secas naturales · Mariposas de cera · Lazos de satín | Set de jarrones acanalados en yeso con detalle dorado, dispuestos sobre bandeja a juego, con flores secas en tonos mostaza y vino y mariposas de cera en pastel. Un centro de mesa modular: se agrupa o se reparte por la casa. |
| 5 | **Trío de Calma** | recipientes | $32.000 | Vasija con tapa y base en yeso artesanal · Cera de soja 100% con fragancia | Recipiente con tapa y base en yeso artesanal, con cera de soja pura en su interior y la fragancia que elijas. Minimalismo puro: la vela que queda bien en cualquier repisa. |
| 6 | **Esencia Acanalada** | flores | **Con cera $45.000 · Sin cera $35.000** | Vasija acanalada en yeso · Flores en cera de soja con fragancia | Mini bouquet sobre vasija acanalada en yeso. Su interior puede ir con cera —y encenderse— o sin ella, como pieza puramente decorativa. Dos productos en uno. |
| 7 | **Cúpula de Seda** | recipientes | $28.000 | Vasija en yeso con tapa · Cera de soja con fragancia | La pieza de entrada al mundo Yeska: vasija de yeso con tapa en cúpula y cera de soja aromatizada. Acabado pulido, silueta limpia. |
| 8 | **Capricho de Chantilly** | flores | $80.000 | Vasos de cristal · Cera de soja texturizada con fragancia · Etiquetas personalizadas | Set de velas-postre: cera rosada coronada de "chantilly" texturizado y florecillas de cera en amarillo y coral, servidas en vaso de cristal con etiqueta personalizada. Irresistibles en mesas dulces y eventos. |
| 9 | **Loto de Devoción** | figuras | $40.000 | Vasija en yeso artesanal · Virgen en cera de soja con fragancia | Figura de la Virgen esculpida en cera de soja sobre vasija de yeso artesanal. Pensada para bautizos, primeras comuniones y rincones de recogimiento. |
| 10 | **Idilio Felino** | figuras | $42.000 | Base en yeso · Peonía y gatos en cera de soja con fragancia | Una peonía abierta acompañada de gatos en cera de soja sobre base de yeso. Ternura sin azúcar: el detalle para quien quiere a sus animales. |
| 11 | **Nido de Oro** | recipientes | $42.000 | Vasija en yeso con acabado dorado · Cera de soja con fragancia | Vasija de yeso con acabado dorado y cera de soja aromatizada. La pieza más joyera del catálogo: funciona encendida o como objeto decorativo permanente. |
| 12 | **Tulipán** | flores | $40.000 | Vasija en cristal · Tulipán en cera de soja con fragancia | Un tulipán esculpido en cera de soja dentro de vasija de cristal. Elegancia de una sola flor: el mínimo gesto que llena una mesa de noche. |
| 13 | **Terraza Inmortal** | botánica | $55.000 | Vasija en yeso · Cactus en cera de soja con fragancia | Un jardín que nunca pide agua. Cactus esculpidos en cera de soja sobre vasija de yeso: todo el verde, cero mantenimiento. |
| 14 | **Esencia del Desierto** | botánica | $40.000 | Base en yeso artesanal · Tres cactus en cera de soja · Varias fragancias | Set exclusivo que combina una base de yeso artesanal con tres delicados cactus esculpidos en cera de soja. Disponibles en diversas fragancias que evocan frescura natural: el detalle perfecto para quien busca decoración sostenible y con estilo. |
| 15 | **Set Armonía** | flores | $35.000 | Jarrón y base en yeso artesanal · Peonía en cera de soja · Ramillete de flores | Embellece tus espacios con nuestro Set Armonía: base y jarrón de yeso de textura suave, complementados con un delicado ramillete y una peonía esculpida en cera de soja premium. Diseño contemporáneo con calidez artesana. |
| 16 | **Burbuja de Amor** | flores | $28.000 · **al mayor $26.500** | Recipiente en yeso artesanal · Rosas en cera de soja · Cinta · Acetato opcional | Recipiente de yeso con cera de soja aromatizada y rosas esculpidas en la misma cera, con cinta de color y mensaje personalizado. Acetato opcional. Funciona como pieza de catálogo **y** como recordatorio por volumen. |

### 7.2 Recordatorios — 7 líneas, 12 opciones de precio

| # | Recordatorio | Opción | Unidad | Al mayor |
|---|---|---|---|---|
| 1 | **Rocío de Flores** — recipiente acanalado en yeso artesanal, cera de soja con fragancia, lazo de fique alrededor del cuenco y mensaje de la quinceañera. | 1 · Flores artificiales, mecha de madera, blanco, sin tapa | $19.500 | $19.000 |
| | | 2 · Orquídea en cera en su interior, sin tapa | $23.500 | $23.000 |
| | | 3 · Con tapa acanalada, orquídea en cera, caja decorativa y lazo | $29.000 | $28.500 |
| 2 | **Mariposa de Invierno** — recipiente acrílico transparente con mariposa en cera de soja y fragancia. Caja en acetato, cinta, flores artificiales y mensaje. | Unidad completa | $12.000 | $11.500 |
| 3 | **Esencia Octagonal** — recipiente octagonal en yeso blanco o de color, lazo de fique y mensaje de la quinceañera. | 1 · Con mariposa en cera de soja (sin base redonda) | $10.000 | $9.500 |
| | | 2 · Con flores artificiales | $9.000 | $8.500 |
| 4 | **Nudo de Ensueño** — recipiente entrelazado en yeso blanco artesanal, cera de soja con fragancia, lazo de fique y mensaje. Figura del color que prefieras. | 1 · Con rosa | $9.000 | $8.500 |
| | | 2 · Con oso | $7.500 | $7.000 |
| 5 | **Cristal de Verano** — recipiente de vidrio con cera de soja, fragancia y tres rosas de colores variados. Cinta alrededor del frasco y mensaje. | Unidad · *acetato adicional $4.000* | $24.000 | $23.500 |
| 6 | **Ternura en Cristal** — elefante en cera de soja del color que prefieras, con cinta y mensaje de la quinceañera. | 1 · En recipiente de vidrio con cera y fragancia | $16.000 | $15.500 |
| | | 2 · Solo el elefante, empacado en papel cristal | $8.000 | $7.500 |
| 7 | **Jardín de Cristal y Seda** — recipiente de vidrio con cera de soja y fragancia, flores artesanales, cinta de color y mensaje. | Unidad | $19.000 | $18.500 |

### 7.3 Cómo cargar el producto que falta

`scripts/seed.mjs` ya contiene 15 productos. Para el #4:

1. Renombrar el producto existente `centro-de-mesa` → **"Centro de Mesa · Cuenco Floral"**.
2. Añadir la entrada nueva:
   ```js
   { id: 'centro-mesa-trio', n: 'Centro de Mesa · Trío de Jarrones', line: 'flores',
     mat: 'Jarrones y bandeja en yeso acanalado · Flores secas · Mariposas de cera', p: 50000 },
   ```
3. Guardar su foto como `scripts/seed-images/centro-mesa-trio.jpg` (extraíble de la
   página 9 del PDF oficial).
4. Alternativa sin tocar código: crearlo desde `/admin → Productos → + Nuevo producto`.

---

# 8. Realidad de las imágenes (el punto que decide si el efecto funciona)

**El efecto de gravedad cero exige PNG/WebP con fondo transparente.** Las fotos actuales en
`public/img/` y `scripts/seed-images/` son **JPG con fondo visible** (mesas, paredes, telas).
Pegarlas flotando se verá como recortes de revista, no como levitación.

Plan en tres niveles, en orden de preferencia:

1. **Ideal** — recortar fondo de 8–12 piezas (rosa granate, suculenta, peonía, oso, cactus,
   tulipán…) y exportarlas a WebP transparente ≤60KB en `public/img/flota/`. Solo estas
   levitan.
2. **Aceptable** — si no hay recortes disponibles: las **fotos reales van siempre dentro de
   marcos** (arco, cápsula, tarjeta) y **lo único que levita son elementos vectoriales
   dibujados en SVG inline**: pétalos, motas de polvo dorado, siluetas florales. El efecto
   de gravedad cero se mantiene; se pierde solo el volumen fotográfico.
3. **Prohibido** — recortes con halo blanco, borde dentado o fondo residual. Antes que eso,
   nivel 2.

**Sombras:** nunca horneadas en la foto. Siempre por CSS sobre el elemento transparente:
```css
filter: drop-shadow(0 14px 18px rgba(93, 63, 60, 0.28));
```
Así la sombra acompaña la levitación en vez de quedarse quieta.

**Carga:** `loading="lazy"` + `decoding="async"` en todo lo que esté bajo el pliegue;
`fetchpriority="high"` solo en la imagen LCP del hero. `width` y `height` explícitos en
cada `<img>` para que el CLS no se dispare.

**Profundidad de campo por capas (boceto 3):**

| Capa | `z-index` | Escala | `filter` | Opacidad | Parallax |
|---|---|---|---|---|---|
| Fondo | 1 | 0.55–0.7 | `blur(3px)` | 0.55 | 0.3× |
| Medio (texto) | 10 | — | — | 1 | 1× |
| Frente | 20 | 1.0–1.35 | nítido | 1 | 1.15× |

---

# 9. Responsive, accesibilidad y criterios de aceptación

### 9.1 Breakpoints

| Ancho | Comportamiento |
|---|---|
| **375px** (mínimo obligatorio) | Sin scroll horizontal. Hero a una columna, titular `3rem`. Máx. 6 flotantes, sin parallax. Pedestales apilados verticalmente. Tarjetas a 1 columna. |
| **768px** | Hero a una columna con el arco debajo del texto. Pedestales en 2+1. Catálogo a 2 columnas. |
| **1024px** | Hero partido 45/55 como el boceto 1. 3 pedestales en fila. Catálogo a 3 columnas. |
| **1440px+** | Contenedor máximo `1180px`, flotantes ocupando el margen exterior. |

Verificación obligatoria en 375px: que `.wa-float` y `.fav-toggle` **no se solapen** (hoy
chocan). Sepáralos verticalmente o agrúpalos en una columna flotante única.

### 9.2 Accesibilidad — checklist

- Contraste **WCAG AA** verificado en cada superficie: 4.5:1 texto normal, 3:1 texto grande.
  ⚠️ Crema `#F7F0EA` sobre malva `#D1B4B0` da ≈2.1:1 — **no pasa AA para texto pequeño**.
  Solución: el crema puro se usa **solo en titulares grandes (≥24px, peso ≥500)**; para
  párrafos sobre malva, oscurece el fondo local con una capa
  `rgba(93, 63, 60, 0.28)` detrás del bloque de texto, o usa `--tinta` sobre malva claro.
  **Mide cada combinación, no la asumas.**
- Foco visible en todo elemento interactivo (`:focus-visible` con anillo dorado, ya existe).
- Focus trap en menú móvil y panel de favoritos; `Escape` cierra y devuelve el foco al
  disparador.
- Orden de tabulación lógico; los flotantes decorativos nunca entran en el tab order.
- Todo `<img>` de producto con `alt` descriptivo; los decorativos con `alt=""` + `aria-hidden`.
- El contador de resultados mantiene `aria-live="polite"`.

### 9.3 Criterios de aceptación (la tarea no está terminada hasta que todos se cumplan)

- [ ] `npm run build` compila sin errores ni warnings nuevos.
- [ ] Las 14 funcionalidades del §1.1 funcionan exactamente igual que antes.
- [ ] Cero scroll horizontal a 375px.
- [ ] 60fps sostenidos en el hero con scroll en un móvil de gama media.
- [ ] LCP < 2.5s y CLS < 0.1 en móvil (Lighthouse, throttling 4G).
- [ ] Lighthouse: Rendimiento ≥ 85, Accesibilidad ≥ 95.
- [ ] Con `prefers-reduced-motion: reduce` activo, la página es legible y navegable sin
      movimiento, y **nada queda invisible** (los `.reveal` deben terminar en `opacity: 1`).
- [ ] Ningún elemento flotante intercepta clics (`pointer-events: none` en todos).
- [ ] `[hidden] { display: none !important; }` declarado y auditado contra cada superficie flotante.
- [ ] Los 16 productos y los 7 recordatorios se renderizan con precio correcto.
- [ ] El panel `/admin` sigue intacto y funcional.

---

# 10. Entregables

1. **`src/styles/site.css`** — reescrito con el sistema de diseño completo: variables de
   los dos ambientes, geometría, `@keyframes`, capas de profundidad, responsive y
   `prefers-reduced-motion`.
2. **`src/pages/index.astro`** — HTML reestructurado según la arquitectura del §4,
   conservando intactos el frontmatter de Supabase y todos los `id` cableados. Las capas de
   elementos flotantes se añaden como contenedores decorativos con `aria-hidden`.
3. **JavaScript** — pulido dentro del `<script>` existente: parallax con
   `requestAnimationFrame` sin lectura de layout en el listener, focus trap, auditoría de
   `hidden`, y separación de `.wa-float` / `.fav-toggle` en móvil.
4. **`public/img/flota/`** — piezas recortadas en WebP transparente (nivel 1 del §8) o,
   en su defecto, los SVG decorativos del nivel 2.
5. **Reporte final en texto** que enumere: qué se cambió, qué decisiones de diseño se
   tomaron y por qué, los resultados medidos de Lighthouse, y cualquier punto del §6.3
   (líneas del catálogo, "Cofres de Rosas") que quede pendiente de confirmar con la dueña.

---

# 11. Restricciones duras — resumen

1. No cambiar el esquema de datos ni las consultas a Supabase.
2. No eliminar ninguna de las 14 funcionalidades del §1.1.
3. No tocar `src/pages/admin/**` ni `src/styles/admin.css`.
4. No añadir una cuarta familia tipográfica (§3.2).
5. Cero blanco puro de fondo; cero negro puro; cero neón.
6. Solo animar `transform` y `opacity`.
7. Cumplir el presupuesto de flotantes: 14 escritorio / 6 móvil.
8. Todo el copy en español.
9. No inventar productos, precios ni fragancias que no estén en el §7.
10. Correr `npm run build` y validar los criterios del §9.3 antes de dar por terminado.
