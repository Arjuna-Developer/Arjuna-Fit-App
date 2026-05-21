# ArjunaFit — Operations Guide
## Version: production-monitoring-ops-v1

---

## ⚡ Acceso rápido

| Qué | URL |
|-----|-----|
| App (landing) | https://arjunafit.app |
| Login admin | https://arjunafit.app/admin-login.html |
| Panel admin | https://arjunafit.app/pages/admin-beta.html |
| Métricas / Gráficas | https://arjunafit.app/pages/growth.html |
| CRM / Seguimiento | https://arjunafit.app/pages/commercial.html |
| Supabase Dashboard | https://supabase.com/dashboard/project/egswsqymkxmbtcpnozcq |

---

## 🚀 Cómo hacer un deploy

1. Hacer cambios en el repositorio local
2. Verificar **Checklist Pre-Deploy** (abajo)
3. `git add . && git commit -m "descripción del cambio"`
4. `git push origin main`
5. Netlify auto-despliega en ~2 min
6. Verificar **Checklist Post-Deploy**
7. Revisar admin → Salud → Errores recientes

---

## ✅ Checklist Pre-Deploy

- [ ] Login funciona con usuario de prueba
- [ ] Signup con `?product=challenge_glutes` → crea trial
- [ ] Signup con `?product=custom_muscle_gain` → NO crea trial
- [ ] Home carga sin loading infinito
- [ ] Nutrición guarda comida
- [ ] Workout inicia y guarda series
- [ ] Admin entra con `arjuna.desarrollador@gmail.com`
- [ ] Usuario normal NO puede entrar a admin
- [ ] Pagos/fallback no tienen botones muertos
- [ ] Consola sin errores P0 (rojos críticos)
- [ ] Mobile 390px básicamente correcto

---

## ✅ Checklist Post-Deploy

- [ ] Landing carga (https://arjunafit.app)
- [ ] App carga (https://arjunafit.app/index.html)
- [ ] Login admin funciona
- [ ] Admin dashboard carga (métricas, alertas)
- [ ] Pestaña "Salud" → Supabase ✅, Auth ✅
- [ ] Versión correcta visible en Admin → Salud
- [ ] Sin errores 404 en consola
- [ ] Sin errores de assets (CSS, JS, fuentes)

---

## 🔄 Cómo hacer rollback

1. Ir a **Netlify Dashboard → Deploys**
2. Buscar el último deploy estable (marcado en verde)
3. Click → "Publish deploy"
4. Verificar que la versión anterior quedó activa
5. **No tocar la base de datos** a menos que la migración también requiera revertirse
6. Registrar el incidente en Supabase → `admin_actions` si aplica

---

## 🗄️ Cómo correr migraciones SQL

```bash
# 1. Hacer backup visual desde Supabase Dashboard → Table Editor → Export
# 2. Abrir Supabase SQL Editor
# 3. Pegar el contenido de sql/payments_community.sql (solo la sección nueva)
# 4. Revisar que use IF NOT EXISTS y drop policy if exists
# 5. Ejecutar
# 6. Verificar: probar login, admin, tabla afectada
```

**Tablas críticas a respaldar antes de migrar:**
- profiles
- payments
- community_memberships
- nutrition_logs
- workout_logs
- support_tickets

---

## 👤 Cómo activar perfil admin

```sql
-- En Supabase SQL Editor:
alter table profiles add column if not exists is_admin boolean default false;
alter table profiles add column if not exists role text default 'user';

update profiles
set is_admin = true, role = 'admin', updated_at = now()
where email = 'arjuna.desarrollador@gmail.com';
```

**La contraseña se configura únicamente en Supabase → Authentication → Users.**
**Nunca en código, GitHub, ni variables públicas.**

---

## 👥 Usuarios demo

| Rol | Email | Uso |
|-----|-------|-----|
| Admin | arjuna.desarrollador@gmail.com | Panel admin completo |
| Demo reto glúteos | — | Crear con `/signup?product=challenge_glutes` |
| Demo reto pancita | — | Crear con `/signup?product=challenge_belly` |
| Demo plan pendiente | — | Crear con `/signup?product=custom_muscle_gain` |

---

## 🔧 Feature flags (js/core/ops-config.js)

```js
window.AF_FLAGS = {
  enablePhotoFoodAI:     true,   // AI foto comida (apagar si falla)
  enableHotmartCheckout: true,   // Links de pago Hotmart
  enableCommunity:       true,   // Sección comunidad
  enableAdminMetrics:    true,   // Gráficas en admin
  enableBetaBanner:      true,   // Botón feedback beta
  maintenanceMode:       false,  // EMERGENCIA: pone pantalla de mantenimiento
};
```

---

## 🚨 Modo mantenimiento

Para activar temporalmente:
1. Abrir `js/core/ops-config.js`
2. Cambiar `maintenanceMode: false` → `maintenanceMode: true`
3. Hacer deploy
4. Una vez resuelto el problema, revertir y desplegar de nuevo

---

## 📊 Cómo revisar pagos

1. Ir a Admin → Pagos
2. Filtrar por `needs_review` primero
3. Verificar en Hotmart si el pago fue aprobado
4. Si confirmado: Admin → Usuarios → abrir usuario → "Activar reto/plan"
5. Verificar que `admin_actions` registró la acción

---

## 🆘 Cómo revisar errores

1. Admin → Salud → "Errores recientes"
2. O directamente en Supabase: `select * from app_errors order by created_at desc limit 20`
3. Priorizar severity = 'critical'
4. Buscar patrones: si el mismo error aparece 5+ veces → P0

---

## 📞 Contacto de soporte

**Email:** arjuna.desarrollador@gmail.com

Categorías de prioridad:
- 🔴 P0: Bloqueante (pago sin acceso, login caído, onboarding roto)
- 🟡 P1: Grave (CTA muerto, mobile roto, formulario sin guardar)
- 🟢 P2/P3: Mejoras

