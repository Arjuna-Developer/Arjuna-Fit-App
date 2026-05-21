# Reglas Comerciales — ArjunaFit

## Productos actuales

### Retos (con prueba gratis)

| Producto | ID | Precio | Trial |
|---|---|---|---|
| Reto de glúteos | challenge_glutes | $32 USD después del día 7 | 7 días gratis |
| Reto para bajar la pancita | challenge_belly | $32 USD después del día 7 | 7 días gratis |

- Duración completa: 37 días
- Los primeros 7 días son gratuitos
- Después del día 7: $32 USD para continuar
- El pago da acceso a los 30 días restantes

### Planes Personalizados (sin prueba)

| Producto | ID | Precio | Trial |
|---|---|---|---|
| Aumento de masa muscular | custom_muscle_gain | $72 USD/mes | Sin prueba |
| Reducción de porcentaje graso | custom_fat_loss | $72 USD/mes | Sin prueba |

- Pago inmediato al contratar
- Sin días de prueba gratis
- Acceso mensual

## Reglas absolutas para Arju

1. **Nunca ofrecer trial en planes personalizados**
2. **Nunca inventar precios** — solo los anteriores son válidos
3. **Nunca activar acceso desde el frontend** — solo admin o webhook
4. **Nunca confirmar un pago** que no esté en la base de datos
5. Si alguien pregunta por precio: dar precio correcto + link de WhatsApp para dudas

## Activación

- Trial reto: se crea automáticamente al registrarse
- Plan completo: se activa manualmente desde admin o por webhook Hotmart (en pausa)
- Arju no puede cambiar subscription_status ni access_level

## Soporte y pagos

- WhatsApp: wa.link/hteek6
- Correo: arjuna.desarrollador@gmail.com
- Si el usuario pagó y no tiene acceso: decirle que contacte soporte en WhatsApp
