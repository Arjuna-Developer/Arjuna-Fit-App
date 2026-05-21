# ArjunaFit — Matriz de Permisos RLS
## Version: security-rls-production-v1

| Tabla                  | Usuario normal (self) | Usuario normal (otros) | Admin | Backend/Webhook |
|------------------------|----------------------|------------------------|-------|-----------------|
| profiles               | READ/UPDATE propios¹  | ❌ bloqueado           | ✅ todo | N/A |
| payments               | READ propios          | ❌ bloqueado           | ✅ READ | ✅ INSERT/UPDATE |
| nutrition_logs         | ✅ CRUD propios       | ❌ bloqueado           | ✅ READ | N/A |
| workout_logs           | ✅ CRUD propios       | ❌ bloqueado           | ✅ READ | N/A |
| set_logs               | ✅ CRUD propios       | ❌ bloqueado           | ✅ READ | N/A |
| user_recipe_favorites  | ✅ CRUD propios       | ❌ bloqueado           | N/A | N/A |
| support_tickets        | ✅ INSERT + READ propios | ❌ bloqueado        | ✅ READ/UPDATE | N/A |
| support_ticket_notes   | ❌ bloqueado          | ❌ bloqueado           | ✅ todo | N/A |
| community_memberships  | READ propia           | ❌ bloqueado           | ✅ todo | ✅ INSERT |
| admin_actions          | ❌ bloqueado          | ❌ bloqueado           | ✅ todo | N/A |
| commercial_contacts    | ❌ bloqueado          | ❌ bloqueado           | ✅ todo | N/A |
| commercial_notes       | ❌ bloqueado          | ❌ bloqueado           | ✅ todo | N/A |
| app_events             | INSERT propios        | ❌ bloqueado           | ✅ READ | N/A |
| app_errors             | INSERT propios        | ❌ bloqueado           | ✅ READ | N/A |
| beta_feedback          | INSERT + READ propios | ❌ bloqueado           | ✅ READ | N/A |

¹ Usuario no puede cambiar: role, is_admin, subscription_status, access_level

## Funciones seguras (security definer)
- `is_admin_user()` — verifica rol admin en profiles
- `admin_activate_challenge(userId, productType)` — activa reto, asigna comunidad, logs action
- `admin_activate_plan(userId, productType)` — activa plan $72, asigna comunidad, logs action

## Reglas críticas
- Pagos: solo backend/webhook puede crear/modificar
- access_level: solo admin_activate_* o webhook puede cambiar a 'full'
- is_admin: nunca editable desde UI normal
- community_memberships: solo admin/backend puede insertar
