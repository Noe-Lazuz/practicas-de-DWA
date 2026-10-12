# AUDITORÍA Y OPTIMIZACIÓN DE RENDIMIENTO WEB — ASTROBITÁCORA

| Campo | Detalle |
|---|---|
| Materia | Diseño Web Adaptable — Sección A |
| Docente | Ing. Alberto Manases Turcios Ortez |
| Práctica | 5 — Auditoría y optimización del rendimiento web |
| Proyecto | **AstroBitácora** (sitio de divulgación astronómica) |
| Estudiante | Noé Benjamín Garmendia Lazo (U20241208) |
| Fecha | 24 de septiembre de 2026 |
| Herramienta | Lighthouse 12.x (Chrome), presets de escritorio, 3 corridas por versión (se reporta la **mediana**) |

---

## 1. ESTRUCTURA DEL PROYECTO

```
Practica 5 de DWA/
├── base/                       ← VERSIÓN BASE (sin optimizar)
│   ├── index.html
│   ├── css/styles.css          ← CSS completo, sin minificar
│   └── js/main.js              ← script sin defer
├── optimizado/                 ← VERSIÓN OPTIMIZADA
│   ├── index.html              ← WebP, width/height, lazy, defer, preconnect
│   ├── css/styles.min.css      ← CSS minificado
│   └── js/main.js              ← script con defer
└── AUDITORIA.md                ← este documento
```

> **Condiciones de medición:** sitio servido en local (`http-server` en `http://localhost:8088`), Lighthouse con preset *desktop* (viewport 1350×940, sin throttling artificial), solo categoría *Performance*. Se hicieron 3 corridas por versión y se usa la **mediana** porque el CDN de Google Fonts y Unsplash introduce ruido entre corridas. TBT se reporta como proxy de laboratorio para INP (INP es métrica de campo; no la mide Lighthouse en laboratorio).

---

## 2. FASE 1 — MEDICIÓN INICIAL (LÍNEA BASE)

Ejecutado sobre `http://localhost:8088/base/index.html`.

### 2.1 Puntajes y métricas clave

| Métrica | Valor inicial |
|---|---|
| **Desempeño (Performance)** | **83** (corridas: 83 · 66 · 88 → mediana 83) |
| **LCP** (Largest Contentful Paint) | **2.3 s** (corridas: 2.3 · 2.8 · 1.9 s) |
| **CLS** (Cumulative Layout Shift) | **0.004–0.106** (inestable; peor corrida 0.106, supera el umbral de 0.1) |
| **TBT** (Total Blocking Time) | 0 ms (proxy de laboratorio para INP) |
| **FCP** (First Contentful Paint) | 1.0 s |
| **Speed Index** | 1.3 s |
| **Bytes transferidos totales** | **1,613 KiB** |
| **Peso de imágenes** | **1,580 KiB** (7 peticiones → 98 % del peso total) |
| Peticiones totales | 12 |

### 2.2 Tres oportunidades / diagnósticos principales (reportados por Lighthouse)

| # | Oportunidad / diagnóstico | Impacto estimado |
|---|---|---|
| 1 | **Serve images in next-gen formats** (imágenes en JPEG de 1200–1500 px) | ~1,431 KiB de ahorro estimado |
| 2 | **Una imagen sin `width`/`height`** (`unsized-images`) → causa CLS | 1 elemento: imagen hero |
| 3 | **Recursos bloqueadores del render** (CSS de Google Fonts + `styles.css`) | 530 ms de ahorro estimado |

> Nota: las imágenes no usaban `loading="lazy"` ni `decoding="async"`, por lo que las 7 se descargaban completo en la carga inicial.

---

## 3. FASE 2 — HIPÓTESIS (antes de tocar el código)

**Inspección previa del proyecto:**

- **¿Qué archivos pesan más?** Las imágenes. Verificado con `resource-summary`: 7 imágenes = 1,580 KiB ≈ **98 %** del peso total; el documento, CSS y JS suman menos de 30 KiB.
- **¿Todas las imágenes necesitan descargarse inmediatamente?** No. Solo la hero (LCP) está *above the fold*; las 6 de la galería están *below the fold* y deberían cargar bajo demanda.
- **¿Hay imágenes sin dimensiones explícitas?** Sí: las 7 `<img>` no tienen `width`/`height` → el navegador no puede reservar espacio → CLS.
- **¿El recurso visual principal usa formato y tamaño razonables?** No: hero en JPEG de 1500×1125 (329 KiB) para mostrarse a ~500 px.
- **¿Cómo se carga el JavaScript?** Con `<script src="js/main.js">` al final del `</body>` **sin `defer`**: descarga y ejecuta bloqueando el parseo del HTML.
- **¿Hay recursos que podrían entregarse en formato más eficiente?** Sí: JPEG → WebP/AVIF; CSS sin minificar; fuentes sin `preconnect`.

### Hipótesis

1. **Si convierto las imágenes a WebP con el tamaño real de visualización (800×600 hero, 600×400 galería), espero reducir los bytes transferidos ~70 % porque WebP comprime ~30–50 % mejor que JPEG y, además, dejo de transferir píxeles que el usuario nunca ve.**
2. **Si agrego `width` y `height` a todas las `<img>`, espero bajar el CLS a ~0.00 porque el navegador reservará el espacio antes de descargar la imagen y no habrá desplazamiento de layout.**
3. **Si agrego `loading="lazy"` + `decoding="async"` a la galería, espero bajar el LCP y el peso inicial porque las 6 imágenes below-the-fold dejarán de descargarse en la carga inicial.**
4. **Si agrego `preconnect` a Google Fonts y `defer` al script, espero bajar el tiempo bloqueante de render porque la conexión TLS y el parseo del HTML avanzan en paralelo.**
5. **Si minifico el CSS, espero reducir algunos KiB (optimización secundaria) porque se eliminan espacios, comentarios y saltos de línea sin cambiar el resultado visual.**

---

## 4. FASE 3 — CAMBIOS APLICADOS (por prioridad)

| Prioridad | Cambio | Detalle | Archivo |
|---|---|---|---|
| 1 | Convertir JPEG → **WebP** (`q=75`) | Hero 800×600, galería 600×400 (tamaño real de visualización) | `optimizado/index.html` |
| 2 | **`width` + `height`** en las 7 `<img>` | Reserva de espacio → CLS 0 | `optimizado/index.html` |
| 3 | **`loading="lazy"` + `decoding="async"`** en las 6 imágenes de la galería | Carga bajo demanda de imágenes below-the-fold | `optimizado/index.html` |
| 4 | Hero **sin lazy**, con **`fetchpriority="high"`** | El elemento LCP (hero) se prioriza y no se aplaza | `optimizado/index.html` |
| 5 | **`preconnect`** a `fonts.googleapis.com` y `fonts.gstatic.com` (with `crossorigin`) | Conexión temprana con el CDN de fuentes | `optimizado/index.html` |
| 6 | **`defer`** en `<script src="main.js">` | Descarga en paralelo y ejecución tras el parseo; no bloquea render | `optimizado/index.html` |
| 7 | **CSS minificado** (`styles.min.css`, −34 % de bytes) | Mismas reglas que `styles.css`, sin comentarios ni espacios | `optimizado/css/styles.min.css` |
| 8 | Mantener **SVG inline** en iconos (0 peticiones extra) y `display=swap` en las fuentes | Sin FOIT ni peticiones HTTP adicionales | `optimizado/index.html` |

---

## 5. FASE 4 — MEDICIÓN FINAL (ANTES / DESPUÉS)

Medido sobre `http://localhost:8088/optimizado/index.html` (mismas condiciones: 3 corridas, mediana, preset desktop).

| Métrica | ANTES (base) | DESPUÉS (optimizado) | Diferencia |
|---|---|---|---|
| **Performance** | 83 | **95** (87 · 97 · 95) | **+12 pts** |
| **LCP** | 2.3 s | **1.1 s** (1.6 · 1.0 · 1.1) | **−1.2 s (−48 %)** |
| **CLS** | 0.004–0.106 (inestable) | **0.004** (estable en las 3 corridas) | −0.10 en peor caso |
| **TBT (proxy INP)** | 0 ms | 0 ms | igual |
| **FCP** | 1.0 s | 1.1 s | ±ruido de red |
| **Speed Index** | 1.3 s | 1.3 s | igual (ruido de red) |
| **Bytes totales** | **1,613 KiB** | **483 KiB** | **−1,130 KiB (−70 %)** |
| **Peso de imágenes** | **1,580 KiB** | **450 KiB** | **−1,130 KiB (−71 %)** |
| Peticiones | 12 | 12 | igual |

### 5.1 Comparación de peso por imagen (JPEG 1200 px → WebP 600 px)

| Imagen | ANTES (JPEG) | DESPUÉS (WebP) | Reducción |
|---|---|---|---|
| Hero — La Tierra desde el espacio (1500 px → 800 px) | 329 KiB | 109 KiB | **−67 %** |
| Pilares de la Creación | 140 KiB | 37 KiB | −74 % |
| La Vía Láctea | 226 KiB | 62 KiB | −73 % |
| Órbita Terrestre | 136 KiB | 42 KiB | −69 % |
| Campo Estelar | 355 KiB | 111 KiB | −69 % |
| Cielo Nocturno | 172 KiB | 46 KiB | −73 % |
| Nuestro Planeta | 222 KiB | 43 KiB | **−81 %** |
| **TOTAL** | **1,580 KiB** | **450 KiB** | **−71 %** |

### 5.2 Respuestas de la comparación

- **¿Qué métrica cambió más?** Los **bytes transferidos (−70 %)** y el **LCP (−48 %)**. En puntaje, Performance subió de 83 → 95.
- **¿Qué optimización redujo más bytes?** **WebP + redimensionado**: quitar los píxeles innecesarios y cambiar de códec ahorró ~1,130 KiB (el 71 % del peso de imágenes).
- **¿Qué cambio tuvo poco impacto?** La **minificación del CSS** (~3 KiB) y el **preconnect a fuentes**: su efecto quedó enmascarado por la latencia variable del CDN de Google Fonts. `defer` + lazy reducen CPU inicial, pero como el script es pequeño su efecto en TBT ya era 0 ms.
- **¿Apareció algún problema nuevo?** El **FCP/Speed Index** no mejoraron de forma consistente; el frente de ataque ahora es la **fuente de Google Fonts (CSS bloqueante de terceros)** y que el servidor local no envía cabeceras de caché. Otros 302 KiB de ahorro de imagen siguen disponibles (galería renderizada a ~350 px con WebP de 600 px: se puede reducir más con `srcset`/`sizes`).
- **¿Conservarías todos los cambios en producción?** **Sí**, todos, porque ninguno degrada la calidad visual ni la funcionalidad. En producción además agregaría: auto-alojar las fuentes (eliminar la dependencia de terceros), cabeceras `Cache-Control`/immutable para estáticos y compresión gzip/brotli en el servidor.

---

## 6. CONCLUSIONES

AstroBitácora pasó de 83 → **95** de Performance, con **LCP de 2.3 s → 1.1 s**, **CLS estabilizado en 0.004** y **70 % menos bytes transferidos** (1,613 → 483 KiB). La optimización de imágenes (WebP + tamaño correcto) fue la de mayor impacto, seguida de reservar espacio con `width`/`height` (eliminó el CLS) y aplicar carga diferida en la galería. El punto débil restante es el CSS de Google Fonts, un recurso de terceros que sigue bloqueando el render; en producción conviene auto-alojar las fuentes.

---

## 7. RESPUESTAS A LAS PREGUNTAS FINALES

### ¿Qué significa LCP y cuál fue el elemento LCP?
**LCP (Largest Contentful Paint)** mide el tiempo en que se pinta el **mayor elemento visible** en la pantalla — el usuario percibe que "la página cargó" cuando aparece. En AstroBitácora el elemento LCP confirmado por Lighthouse es la **imagen hero** (`<section#hero > div.hero__image > img`, "La Tierra vista desde el espacio"). Por eso se le dio `fetchpriority="high"` y no lleva `loading="lazy"`.

### ¿Cómo una imagen sin dimensiones contribuye a CLS?
Sin `width`/`height`, el navegador no sabe cuánto espacio reservar: pinta el texto y el layout, y cuando la imagen llega el navegador **inserta** su caja y **empuja** el contenido hacia abajo → **desplazamiento de layout** (CLS). En el base, Lighthouse encontró exactamente la hero con `unsized-images` y el CLS llegó a 0.106 (más del umbral de 0.1). Con `width="800" height="600"` el navegador reserva la proporción 4:3 de antemano y el desplazamiento cae a 0.004 (≈ 0).

### ¿Por qué `loading="lazy"` es útil en galería pero malo en hero?
`lazy` **pospone la descarga** hasta que la imagen está cerca del viewport. En la galería (below the fold) ahorra bytes y mejora el peso inicial; en la **hero** (elemento LCP, visible apenas abre la página) sería un error porque **retrasaría la pintura del contenido principal**: el navegador esperaría la ventana de carga perezosa y el LCP subiría. La hero es el recurso "crítico" que hay que **priorizar** (`fetchpriority="high"`), nunca aplazar.

### Diferencia entre `defer` y `async`. ¿Cuál elegiste y por qué?
- **`defer`**: descarga **en paralelo** sin bloquear, y ejecuta el script **después** de parsear todo el HTML, en orden de aparición. Ideal cuando el script depende del DOM.
- **`async`**: descarga y ejecuta **apenas esté listo**, en cualquier orden, **pausando el parseo** mientras se ejecuta. Ideal para scripts independientes (analytics, anuncios).

Elegí `defer`, porque `main.js` manipula el DOM (`querySelector` sobre `.header__toggle`) y ya se ejecuta sobre `DOMContentLoaded`; con `defer` además se garantiza que no bloquee el render del contenido visible.

### ¿Qué formato de imagen elegiste y qué comparación de peso obtuviste?
**WebP** con `q=75` y el tamaño exacto de visualización. Ejemplo por imagen: la hero pasó de **329 KiB (JPEG 1500×1125)** → **109 KiB (WebP 800×600)**, −67 %. En total, WebP + redimensionado llevó el peso de las 7 imágenes de **1,580 KiB → 450 KiB** (−71 %), con la misma calidad percibida. (AVIF comprimiría aún más, pero con soporte de navegador ligeramente menor.)

### Si el puntaje sube pero LCP sigue alto, ¿está terminada la optimización?
**No.** El puntaje de Performance es un agregado ponderado: puede subir porque CLS/TBT mejoran aunque el LCP siga mal, y el LCP es la métrica que más pesa en la experiencia real (25 % del puntaje). Terminar la optimización implica: LCP < 2.5 s, CLS < 0.1 e INP < 200 ms juntos, en dispositivos reales y con PageSpeed Insights (datos de campo). En este proyecto el LCP bajo los 1.1 s se logró con imágenes ligeras y `fetchpriority="high"`; si siguiera alto, los siguientes pasos serían auto-alojar las fuentes, reducir el CSS bloqueante y validar en móvil con throttling.

---

## 8. CÓMO REPRODUCIR LA MEDICIÓN (qué verificar en Lighthouse)

1. Servir la carpeta localmente (desde `Practica 5 de DWA`):
   - `npx serve .` → `http://localhost:3000/base/index.html` y `http://localhost:3000/optimizado/index.html`
   - o `python -m http.server 8088`.
2. Abrir cada versión en Chrome → `F12` → pestaña **Lighthouse**.
3. Marcar **Performance** y modo **Desktop** (o Mobile para la vista del curso), y ejecutar. Se recomienda **2–3 corridas** y tomar la mediana.
4. Verificar en "Diagnostics/Oportunidades" que ya **no** aparezcan:
   - *Serve images in next-gen formats* (todas WebP) ✓
   - *Unsized images / CLS causado por imágenes* ✓
   - *Lazy-load images / offscreen images* ✓
   - Y confirmar en *Web Vitals*: **LCP < 2.5 s**, **CLS < 0.1**, **TBT < 200 ms**.