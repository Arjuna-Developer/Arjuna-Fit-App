// ═══════════════════════════════════════════════
// ArjunaFit — Netlify Function: /food-photo
// Analiza foto de comida con OpenAI Vision
// Devuelve macros estimados
// ═══════════════════════════════════════════════
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }
  if (!process.env.OPENAI_API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  let imageBase64, mimeType;
  try {
    const body = JSON.parse(event.body || '{}');
    imageBase64 = body.image;
    mimeType    = body.mimeType || 'image/jpeg';
    if (!imageBase64) throw new Error('No image provided');
  } catch(e) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: e.message }) };
  }

  const prompt = `Analiza esta foto de comida y responde SOLO con JSON válido, sin markdown.

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
  "confidence": "alta/media/baja",
  "note": "nota opcional sobre la estimación"
}

Reglas:
- Identifica todos los alimentos visibles
- Estima porciones visualmente
- Usa gramos como unidad de nutrientes
- Si no puedes identificar bien, usa confidence: "baja"
- Responde solo con JSON, nada más`;

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
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[food-photo] OpenAI error:', err);
      return {
        statusCode: response.status,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'OpenAI error', detail: err.slice(0, 200) })
      };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    // Parse JSON from response
    let result;
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(clean);
    } catch(e) {
      console.error('[food-photo] Parse error:', text);
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
          error: 'parse_failed',
          raw: text,
          fallback: true
        })
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch(e) {
    console.error('[food-photo] Error:', e.message);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: e.message })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
