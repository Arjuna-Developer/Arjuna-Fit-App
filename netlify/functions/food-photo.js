// ═══════════════════════════════════════════════
// ArjunaFit — food-photo.js v2 (beta-hardened)
// Analiza foto de comida con OpenAI Vision
// Protecciones: auth, rate limit, tamaño, logs
// ═══════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const MAX_IMAGE_BYTES   = 4 * 1024 * 1024; // 4MB máximo
const DAILY_LIMIT       = 20;               // 20 fotos por usuario por día

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // ── Validar variables de entorno ────────────────
  if (!process.env.OPENAI_API_KEY) {
    console.error('[food-photo] Missing OPENAI_API_KEY');
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Servicio no configurado' }) };
  }

  // ── Parsear body ────────────────────────────────
  let imageBase64, mimeType, userId, authToken;
  try {
    const body   = JSON.parse(event.body || '{}');
    imageBase64  = body.image;
    mimeType     = body.mimeType || 'image/jpeg';
    const VALID_MIME = ['image/jpeg','image/png','image/webp','image/gif'];
    if (!VALID_MIME.includes(mimeType)) mimeType = 'image/jpeg';
    authToken    = body.authToken || event.headers['authorization']?.replace('Bearer ', '');
    if (!imageBase64) throw new Error('No image provided');
  } catch(e) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: e.message }) };
  }

  // ── Validar tamaño de imagen ────────────────────
  const imageBytes = Buffer.byteLength(imageBase64, 'base64');
  if (imageBytes > MAX_IMAGE_BYTES) {
    return {
      statusCode: 400, headers: corsHeaders(),
      body: JSON.stringify({ error: 'Imagen muy grande. Máximo 4MB.', code: 'IMAGE_TOO_LARGE' })
    };
  }

  // ── Validar sesión Supabase — OBLIGATORIO ──────────────
  if (!authToken) {
    return { statusCode: 401, headers: corsHeaders(),
      body: JSON.stringify({ error: 'Token requerido para analizar fotos.' }) };
  }
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data: { user }, error } = await sb.auth.getUser(authToken);
      if (!error && user) {
        userId = user.id;

        // ── Rate limit: max DAILY_LIMIT fotos por día ──
        const today = new Date().toISOString().split('T')[0];
        const { count } = await sb
          .from('food_photo_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', today + 'T00:00:00Z');

        if (count >= DAILY_LIMIT) {
          return {
            statusCode: 429, headers: corsHeaders(),
            body: JSON.stringify({ error: 'Límite diario de fotos alcanzado (' + DAILY_LIMIT + '/día)', code: 'RATE_LIMIT' })
          };
        }

        // Log this request
        await sb.from('food_photo_logs').insert({
          user_id: userId,
          image_size_bytes: imageBytes,
          mime_type: mimeType,
          created_at: new Date().toISOString()
        }).catch(err => console.warn('[food-photo] Log insert failed:', err.message));
      }
    } catch(authErr) {
      // Auth error — bloquear acceso
      console.warn('[food-photo] Auth error:', authErr.message);
      return { statusCode: 401, headers: corsHeaders(),
        body: JSON.stringify({ error: 'Sesión inválida. Vuelve a iniciar sesión.' }) };
    }
  }

  // ── Llamar GPT-4o Vision ─────────────────────────
  const prompt = `Analiza esta foto de comida y responde SOLO con JSON válido, sin markdown ni texto extra.

Formato exacto:
{
  "foods": [
    {
      "name": "nombre del alimento en español",
      "portion": "descripción de la porción (ej: 1 taza, 150g, 1 plato)",
      "cal": 320,
      "prot": 25,
      "carb": 35,
      "fat": 8
    }
  ],
  "total": { "cal": 320, "prot": 25, "carb": 35, "fat": 8 },
  "confidence": "alta",
  "note": "nota opcional sobre la estimación"
}

Reglas:
- Identifica TODOS los alimentos visibles
- Estima porciones visualmente
- Si no puedes identificar bien, usa confidence: "baja"
- Responde SOLO con JSON, nada más`;

  let openAiResult;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'low' } }
          ]
        }]
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[food-photo] OpenAI error:', response.status, errText.slice(0, 200));

      // Friendly error for common cases
      if (response.status === 429) {
        return { statusCode: 503, headers: corsHeaders(), body: JSON.stringify({
          error: 'Servicio ocupado. Intenta en 30 segundos.', code: 'OPENAI_BUSY', fallback: true
        })};
      }
      throw new Error('OpenAI error ' + response.status);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) throw new Error('OpenAI returned empty response');

    // Parse JSON
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      openAiResult = JSON.parse(clean);
    } catch(parseErr) {
      console.error('[food-photo] JSON parse failed:', text.slice(0, 200));
      return {
        statusCode: 200, headers: corsHeaders(),
        body: JSON.stringify({
          error: 'No pude identificar los alimentos con certeza. Intenta con mejor iluminación.',
          code: 'PARSE_FAILED',
          fallback: true
        })
      };
    }

    // Update log with result
    if (userId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await sb.from('food_photo_logs')
        .update({
          result_foods: openAiResult.foods?.length || 0,
          result_cal: openAiResult.total?.cal || 0,
          confidence: openAiResult.confidence || 'media'
        })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .catch(err => console.warn('[food-photo] Log update failed:', err.message));
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(openAiResult)
    };

  } catch(e) {
    console.error('[food-photo] Fatal error:', e.message);
    return {
      statusCode: 500, headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Error al analizar la foto. Intenta de nuevo o registra manualmente.',
        code: 'FATAL_ERROR',
        fallback: true
      })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
