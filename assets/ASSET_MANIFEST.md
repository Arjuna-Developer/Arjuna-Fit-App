# ArjunaFit — Asset Manifest
# Version: human-assets-ready-v1
# Actualizar este archivo cada vez que se suba un asset real.

## ESTADO: ⏳ = pendiente | ✅ = listo | 🔄 = en proceso

---

## FOUNDER — Video

| Archivo | Estado | Uso |
|---|---|---|
| `assets/founder/video/founder-main-16x9.mp4` | ⏳ | Landing principal |
| `assets/founder/video/founder-short-9x16.mp4` | ⏳ | Reels / Historias |
| `assets/founder/video/founder-cut-15s.mp4` | ⏳ | Anuncios cortos |
| `assets/founder/video/founder-main-poster.webp` | ⏳ | Poster del video |

**Para activar en landing:** Reemplazar el bloque `<!-- ACTIVAR VIDEO -->` en arjunafit-landing.html con:
```html
<video src="/assets/founder/video/founder-main-16x9.mp4"
       poster="/assets/founder/video/founder-main-poster.webp"
       controls playsinline preload="none"
       style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
</video>
```

---

## FOUNDER — Fotos

| Archivo | Estado | Uso |
|---|---|---|
| `assets/founder/photos/founder-portrait-01.webp` | ⏳ | Landing hero/founder |
| `assets/founder/photos/founder-gym-01.webp` | ⏳ | Sección entrenamiento |
| `assets/founder/photos/founder-app-01.webp` | ⏳ | Sección ecosistema |
| `assets/founder/photos/founder-lifestyle-01.webp` | ⏳ | Redes sociales |
| `assets/founder/photos/founder-explaining-01.webp` | ⏳ | Coach / guía |

---

## FOUNDER — B-Roll (clips 5–8 seg)

| Archivo | Estado | Uso |
|---|---|---|
| `assets/founder/broll/broll-app-dashboard.mp4` | ⏳ | Landing / Reels |
| `assets/founder/broll/broll-gym-walking.mp4` | ⏳ | Redes |
| `assets/founder/broll/broll-exercise-demo.mp4` | ⏳ | Sección entreno |
| `assets/founder/broll/broll-food-prep.mp4` | ⏳ | Sección nutrición |
| `assets/founder/broll/broll-phone-closeup.mp4` | ⏳ | App / Anuncios |
| `assets/founder/broll/broll-glute-exercise.mp4` | ⏳ | Reto glúteos |

---

## FOOD — Fotos LATAM

| Archivo | Estado | Uso |
|---|---|---|
| `assets/food/food-huevos-arepa.webp` | ⏳ | Recetario / Landing |
| `assets/food/food-avena-banano.webp` | ⏳ | Recetario |
| `assets/food/food-arroz-pollo.webp` | ⏳ | Recetario |
| `assets/food/food-lentejas.webp` | ⏳ | Recetario |
| `assets/food/food-frijoles.webp` | ⏳ | Recetario |
| `assets/food/food-yogur-fruta.webp` | ⏳ | Recetario / Home |
| `assets/food/food-tortilla-vegetales.webp` | ⏳ | Recetario |
| `assets/food/food-batido-banano.webp` | ⏳ | Recetario |
| `assets/food/food-arepa-queso.webp` | ⏳ | Recetario |
| `assets/food/food-pechuga-brocoli.webp` | ⏳ | Recetario |

**Para activar fotos en recetario:** Agregar `img src="/assets/food/food-*.webp"` en cada card de recipe en nutrition.html.

---

## TESTIMONIOS

| Archivo | Estado | Datos |
|---|---|---|
| `assets/testimonials/testimonial-01.webp` | ⏳ | Permiso requerido |
| `assets/testimonials/testimonial-02.webp` | ⏳ | Permiso requerido |
| `assets/testimonials/testimonial-03.webp` | ⏳ | Permiso requerido |

**IMPORTANTE:** Solo subir con permiso firmado. Ver texto de consentimiento en filming-checklist.html.

---

## EXERCISE VIDEOS

| Carpeta | Ejercicios pendientes |
|---|---|
| `assets/videos/exercises/glutes/` | hip-thrust, peso-muerto-rumano, sentadilla-bulgara, abduccion-maquina, patada-gluteo, puente-gluteo |
| `assets/videos/exercises/core/` | plancha, crunch, mountain-climbers, elevacion-piernas |
| `assets/videos/exercises/general/` | press-banca, jalon-pecho, remo-mancuerna, press-militar, sentadilla-libre |

**Nomenclatura:** `nombre-ejercicio-16x9.mp4` y `nombre-ejercicio-poster.webp`

**Para activar en app:** En `js/core/exercise-library.js` cambiar:
```javascript
video_status: 'pending' → 'available'
video_url: '' → '/assets/videos/exercises/glutes/hip-thrust-16x9.mp4'
thumbnail_url: '' → '/assets/videos/exercises/glutes/hip-thrust-poster.webp'
```

---

## SOCIAL

| Archivo | Formato | Uso |
|---|---|---|
| `assets/social/og-image.webp` | 1200×630 | Open Graph / Twitter |
| `assets/social/story-template.webp` | 1080×1920 | Instagram Stories |
| `assets/social/post-template.webp` | 1080×1080 | Instagram Feed |

