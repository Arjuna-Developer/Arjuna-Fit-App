# ArjunaFit — Asset Guide v1
## Sprint Visual 3 — Sistema completo de assets

---

## 📁 Estructura de carpetas

```
/assets/
  /food/           → Imágenes reales de recetas (JPG/WebP)
  /banners/        → Banners para secciones y retos (SVG/JPG)
  /illustrations/  → Ilustraciones premium (SVG/PNG)
  /coach/          → Assets del Coach Arjuna (SVG/PNG)
  /arju/           → SVGs de estados de Arju (SVG) — YA EXISTÍA
  /brand/          → Logo, OG image, splash — YA EXISTÍA
  /empty-states/   → SVGs de estados vacíos — YA EXISTÍA
```

---

## 🍽️ Imágenes de recetas (/assets/food/)

### Formato recomendado
- **Formato:** JPG (principal) o WebP (alternativa)
- **Tamaño:** 800×450px (16:9)
- **Max peso:** 120KB
- **Estilo:** foto real de comida, luz natural o estudio, fondo limpio

### Nombrado exacto (el nombre = id de la receta en recipes.json)
```
/assets/food/{recipe.id}.jpg
```

### Primeras 10 imágenes recomendadas:
| Archivo | Receta |
|---|---|
| `arepa-huevo-aguacate.jpg` | Arepa con huevo y aguacate |
| `bowl-pollo-fit.jpg` | Bowl de pollo fit |
| `avena-proteina-fresas.jpg` | Avena proteica con fresas |
| `yogur-banano-avena.jpg` | Yogur griego con banano |
| `salmon-quinoa-esparragos.jpg` | Salmón con quinoa |
| `omelette-espinaca-queso.jpg` | Omelette de espinaca |
| `wrap-integral-pollo.jpg` | Wrap integral de pollo |
| `batido-banano-proteina.jpg` | Batido de banano |
| `ensalada-pollo-aguacate.jpg` | Ensalada de pollo |
| `smoothie-verde.jpg` | Smoothie verde proteico |

### Cómo probar
```
1. Subir archivo a /assets/food/arepa-huevo-aguacate.jpg
2. Abrir /pages/nutrition.html → sección Recetario
3. La card debe mostrar imagen (fade-in suave)
4. Desconectar red → debe aparecer "🍽️ Imagen próximamente"
```

---

## 🖼️ Ilustraciones (/assets/illustrations/)

Placeholders SVG creados. Reemplazar cuando existan diseños reales.

| Archivo | Uso | Sustituir por |
|---|---|---|
| `onboarding-welcome.svg` | Pantalla bienvenida | Ilustración dark premium |
| `coach-ai.svg` | Sección Coach / empty state | Figura IA humana |
| `workout-complete.svg` | Completar entreno | Celebración |
| `challenge-glutes.svg` | Landing reto glúteos | Arte del reto |
| `challenge-abdomen.svg` | Landing reto abdomen | Arte del reto |
| `empty-recipes.svg` | Sin recetas cargadas | Plato vacío premium |
| `empty-progress.svg` | Sin progreso todavía | Gráfica vacía premium |

**Cómo usar en HTML:**
```html
<img src="/assets/illustrations/coach-ai.svg" 
     class="af-illustration" alt="Coach IA">
```

---

## 🎯 Banners (/assets/banners/)

SVG placeholders creados con gradiente de marca. Reemplazar con imagen real.

| Archivo | Dimensión real | Uso |
|---|---|---|
| `reto-gluteos.svg` | 1200×600px | Banner reto glúteos |
| `reto-abdomen.svg` | 1200×600px | Banner reto pancita |
| `coach-ai.svg` | 1200×600px | Banner Coach IA |
| `nutrition.svg` | 1200×600px | Banner nutrición |
| `recipes.svg` | 1200×600px | Banner recetas |

**Uso con .af-banner:**
```html
<div class="af-banner">
  <img src="/assets/banners/reto-gluteos.svg" class="af-banner__img" loading="lazy">
  <div class="af-banner__overlay"></div>
  <div class="af-banner__content">
    <div class="af-banner__title">Reto de Glúteos</div>
    <div class="af-banner__sub">7 días gratis · luego $32 USD</div>
    <a href="/signup?product=challenge_glutes" class="af-banner__cta">Empezar gratis</a>
  </div>
</div>
```

**Para activar en Dashboard:**
Busca en dashboard.html el bloque `<!-- ══ BANNER STRIP (opcional)` y elimina los delimitadores del comentario.

---

## 🤖 Coach assets (/assets/coach/)

SVG avatares creados como fallback premium.

| Archivo | Uso |
|---|---|
| `arjuna-avatar.svg` | Avatar principal en coach header |
| `arjuna-speaking.svg` | Estado "respondiendo" |
| `arjuna-listening.svg` | Estado "escuchando" |
| `arjuna-badge.svg` | Badge compacto |

Reemplazar con PNG/foto real del coach cuando esté disponible.

---

## 🎨 Clases CSS nuevas (visual-polish.css)

| Clase | Descripción |
|---|---|
| `.image-card` | Card con imagen 16:9 reutilizable |
| `.image-card__media` | Contenedor de imagen |
| `.image-card__img` | Imagen con fade-in |
| `.image-card__overlay` | Degradado oscuro legibilidad |
| `.image-card__badge` | Tag sobre imagen |
| `.image-card__cta` | Botón de acción |
| `.af-banner` | Banner horizontal con overlay |
| `.af-banner__img` | Imagen de fondo del banner |
| `.af-banner__cta` | CTA del banner (gradiente) |
| `.coach-avatar` | Avatar circular con breathing glow |
| `.coach-avatar--sm` | 44×44px |
| `.coach-avatar--md` | 60×60px |
| `.coach-avatar--lg` | 80×80px |
| `.af-illustration` | Ilustración a ancho completo |

