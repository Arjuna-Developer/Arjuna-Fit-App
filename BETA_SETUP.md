# ArjunaFit — Guía de Configuración para Beta Cerrada
## beta-infrastructure-unblock-v1

Sigue estos 5 pasos en orden. Cada uno desbloquea un bloqueante real.

---

## 🔴 BLOQUEANTE 1 — WhatsApp real

**Archivo:** `js/core/commerce-config.js`

Busca esta línea (está al inicio del archivo):
```js
var WHATSAPP_NUMBER = '573001234567'; // ← CAMBIAR AQUÍ
```

Reemplaza `573001234567` por tu número real con el código de país, sin espacios ni `+`.

**Ejemplo Colombia:** si tu número es +57 315 123 4567 → escribe `573151234567`

Esto actualiza automáticamente todos los botones "Hablar con Arjuna" y links de soporte de la app. No necesitas cambiar nada más.

Después haz deploy → verifica en `/pages/help.html` que el botón de WhatsApp abra el chat correcto.

---

## 🔴 BLOQUEANTE 2 — SQL en Supabase

**Archivo:** `sql/payments_community.sql`

1. Abre Supabase Dashboard → tu proyecto → **SQL Editor**
2. Copia todo el contenido del archivo `sql/payments_community.sql`
3. Pégalo en el SQL Editor
4. Antes de ejecutar, confirma que contiene `IF NOT EXISTS` en los `CREATE TABLE`
5. Haz click en **Run**
6. Verifica que no haya errores rojos (los warnings en amarillo están bien)

**Validar que funcionó:**
Abre **Table Editor** y confirma que existen estas tablas:
`profiles` · `payments` · `community_memberships` · `support_tickets` · `admin_actions` · `app_errors` · `nutrition_logs` · `workout_logs` · `daily_checkins` · `user_nudges` · `beta_feedback`

**Verificar funciones:**
En SQL Editor ejecuta:
```sql
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%admin%';
```
Debes ver: `is_admin_user`, `admin_activate_challenge`, `admin_activate_plan`

---

## 🔴 BLOQUEANTE 3 — Usuario admin

**Paso 1 — Crear usuario en Supabase Auth:**
1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user**
3. Email: `arjuna.desarrollador@gmail.com`
4. Contraseña: usa una contraseña fuerte y única (mínimo 12 caracteres, con mayúsculas, números y símbolos)
5. **No pongas la contraseña en ningún archivo ni en este documento**

**Paso 2 — Activar rol admin:**
En Supabase SQL Editor ejecuta:
```sql
UPDATE profiles
SET
  is_admin = true,
  role     = 'admin',
  updated_at = now()
WHERE email = 'arjuna.desarrollador@gmail.com';
```

Si el UPDATE devuelve 0 rows affected, significa que el perfil no se creó automáticamente. En ese caso:
```sql
-- Obtén el user_id del Auth:
SELECT id FROM auth.users WHERE email = 'arjuna.desarrollador@gmail.com';

-- Luego inserta manualmente (reemplaza UUID con el id real):
INSERT INTO profiles (id, email, role, is_admin, updated_at)
VALUES ('UUID-DEL-USUARIO', 'arjuna.desarrollador@gmail.com', 'admin', true, now())
ON CONFLICT (id) DO UPDATE SET role = 'admin', is_admin = true;
```

**Paso 3 — Verificar:**
Abre `arjunafit.app/admin-login.html` y entra con el correo y contraseña. Debes ver el panel admin.

---

## 🔴 BLOQUEANTE 4 — Variables de entorno Netlify

1. Abre Netlify Dashboard → tu sitio → **Site Configuration** → **Environment variables**
2. Agrega estas variables (una por una):

| Variable | Valor | Dónde obtenerlo |
|---|---|---|
| `HOTMART_WEBHOOK_SECRET` | el secreto de tu webhook en Hotmart | Hotmart → Webhooks → tu webhook → Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | la service role key de Supabase | Supabase → Settings → API → service_role |
| `OPENAI_API_KEY` | tu clave de OpenAI | platform.openai.com → API Keys |

⚠️ **NUNCA** pongas estas variables en el código o GitHub. Solo en Netlify.

3. Después de agregar, haz **Trigger deploy** para que las variables surtan efecto.

**Para obtener SUPABASE_SERVICE_ROLE_KEY:**
Supabase Dashboard → Settings → API → sección "Project API keys" → copia `service_role` (no la `anon`)

---

## 🔴 BLOQUEANTE 5 — IDs reales de Hotmart

**Archivo:** `netlify/functions/payment-webhook.js`

Busca la sección `HOTMART_PRODUCT_MAP` y descomenta/completa con tus IDs reales:

**Cómo obtener los IDs:**
1. Hotmart Dashboard → Products → tu producto
2. El ID aparece en la URL: `hotmart.com/product/edit/XXXXX/YYYYYYY`
3. También aparece en los webhooks enviados por Hotmart (campo `data.product.id`)

**Qué editar:**
```js
HOTMART_PRODUCT_MAP = {
  'ID_REAL_DEL_PRODUCTO_GLUTEOS': 'challenge_glutes',
  'ID_REAL_DEL_PRODUCTO_PANCITA': 'challenge_belly',
  'M105694336W': 'custom_muscle_gain',   // Confirma si este ID es correcto
  'ID_REAL_PARA_FAT_LOSS': 'custom_fat_loss',
};
```

**Para probar el webhook sin pago real:**
Usa el simulador de Hotmart (Hotmart → Webhooks → "Test") o herramientas como Postman para enviar un POST de prueba a tu función de Netlify.

---

## ✅ Verificación final — checklist pre-beta

Después de completar los 5 pasos, abre `arjunafit.app/pages/health.html` y verifica:

- [ ] Supabase conectado ✅
- [ ] Tablas base creadas ✅
- [ ] WhatsApp configurado (no muestra "Placeholder") ✅
- [ ] Soporte email ✅
- [ ] Sin errores críticos en las últimas 24h ✅

También prueba manualmente:
- [ ] `arjunafit.app/admin-login.html` → entra como admin ✅
- [ ] `arjunafit.app/pages/admin-beta.html` → ve usuarios, pagos, métricas ✅
- [ ] `arjunafit.app/signup.html?product=challenge_glutes` → crea cuenta, va a onboarding ✅
- [ ] `arjunafit.app/signup.html?product=custom_muscle_gain` → crea cuenta, va a custom-plan-intake (no crea trial) ✅
- [ ] Botón "Hablar con Arjuna" en help.html → abre tu WhatsApp real ✅
- [ ] Mobile en iPhone/Android → básicamente correcto ✅

---

## 📞 Si algo falla

Abre `arjunafit.app/pages/health.html` y comparte el screenshot del estado.

Cualquier tabla faltante: reejecutar el SQL desde Supabase SQL Editor.
Cualquier RLS bloqueando un flujo normal: revisar la sección de políticas al final del SQL.

