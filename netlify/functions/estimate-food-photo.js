// ═══════════════════════════════════════════════════════
// ArjunaFit — Netlify Function: estimate-food-photo
// Analiza foto de comida con OpenAI Vision
// Input: { image_base64 (dataURL or base64), context }
// Output: normalized food estimation JSON
// ═══════════════════════════════════════════════════════
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({
      error: 'OPENAI_API_KEY not configured',
      fallback: true
    })};
  }

  let imageBase64, mimeType;
  try {
    const body = JSON.parse(event.body || '{}');
    const raw = body.image_base64 || body.image || '';
    if (!raw) throw new Error('No image provided');
    // Handle dataURL or raw base64
    if (raw.startsWith('data:')) {
      const [meta, data] = raw.split(',');
      mimeType = (meta.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
      imageBase64 = data;
    } else {
      imageBase64 = raw;
      mimeType = 'image/jpeg';
    }
  } catch(e) {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: e.message }) };
  }

  const prompt = `Eres Arju, coach nutricional de ArjunaFit. Analiza esta foto de comida.
Estima de forma aproximada los alimentos visibles y sus macros. Responde SOLO con JSON válido, sin texto extra ni markdown.

Formato exacto:
{
  "meal_name": "nombre del plato en español",
  "detected_foods": ["alimento1", "alimento2"],
  "estimated_calories": 400,
  "estimated_protein_g": 30,
  "estimated_carbs_g": 45,
  "estimated_fat_g": 12,
  "portion_recommendation": "Come 1 porción",
  "recommendation_text": "Esta comida tiene buen balance. 1 porción es suficiente para una comida principal.",
  "confidence": "medium",
  "notes": "Estimación aproximada basada en la imagen."
}

Reglas:
- Si no puedes identificar bien los alimentos, usa confidence "baja" y estima conservadoramente
- Si la imagen NO es comida, responde: {"error": "No es una imagen de comida", "fallback": true}
- Nunca prometas precisión exacta
- Solo JSON, nada más`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'low' } }
          ]
        }]
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('[estimate-food-photo] OpenAI error:', err.slice(0, 200));
      return { statusCode: resp.status, headers: cors(), body: JSON.stringify({ error: 'OpenAI error', fallback: true }) };
    }

    const ai = await resp.json();
    const text = ai.choices?.[0]?.message?.content?.trim() || '';
    const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    const result = JSON.parse(clean);
    return { statusCode: 200, headers: { ...cors(), 'Content-Type': 'application/json' }, body: JSON.stringify(result) };

  } catch(e) {
    console.error('[estimate-food-photo]', e.message);
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: e.message, fallback: true }) };
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
