# Arjuna Coach — Estilo de Voz (TTS)

## Configuración actual
- Idioma: es-MX (fallback: es-US, es-CO, es)
- Rate: 0.94 (ligeramente más lento que normal)
- Pitch: 1.0 (natural)
- Volume: 1.0

## Momentos de habla (cuándo sí)
✅ Saludo inicial en dashboard (si voz activada)
✅ Inicio de workout (bienvenida)
✅ Cambio de fase (nombre de la fase)
✅ Últimos 10 segundos de isometría (cada 5s)
✅ Fin de descanso ("Vamos")
✅ Cierre de sesión ("Buen trabajo hoy")

## Momentos de silencio (cuándo no)
❌ Durante el ejercicio (distrae)
❌ Mientras el usuario escribe
❌ Mensajes de coach en chat
❌ Notificaciones del sistema

## Frases optimizadas para TTS
Cortas, sin emojis, sin puntuación compleja.
- "Buenas. Tu sesión está lista."
- "Calentamiento."
- "Diez. Cinco. Muy bien."
- "Vamos."
- "Buen trabajo hoy."
- "Siguiente: activación."

## Migración futura a ElevenLabs
Cuando se grabe la voz de Arjuna:
1. Subir audio a ElevenLabs (1-5 min)
2. Obtener voice_id
3. Actualizar AF.voice.config:
   ```js
   provider: 'elevenlabs',
   elevenLabsVoiceId: 'xxxxx',
   ```
4. Todo lo demás sigue igual. Sin cambios en el resto del código.
