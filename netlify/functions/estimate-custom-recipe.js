// ═══════════════════════════════════════════════════════
// ArjunaFit — Netlify Function: /estimate-custom-recipe
// Estima macros de receta casera con OpenAI
// ═══════════════════════════════════════════════════════
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let name, ingredients_text, servings, meal_type, context;
  try {
    const body = JSON.parse(event.body || '{}');
    name             = body.name || 'Receta casera';
    ingredients_text = body.ingredients_text || '';
    servings         = Number(body.servings) || 1;
    meal_type        = body.meal_type || 'comida';
    context          = body.context || {};
    if (!ingredients_text.trim()) throw new Error('No ingredients provided');
  } catch(e) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: e.message }) };
  }

  const prompt = `Eres Arju, coach nutricional de ArjunaFit. El usuario preparó esta receta casera.

Receta: ${name}
Ingredientes: ${ingredients_text}
Porciones: ${servings}
Momento: ${meal_type}

Estima macros aproximados. Responde SOLO con JSON válido:
{
  "name": "Nombre de la receta",
  "total_calories": 820,
  "total_protein_g": 70,
  "total_carbs_g": 96,
  "total_fat_g": 28,
  "per_serving_calories": 410,
  "per_serving_protein_g": 35,
  "per_serving_carbs_g": 48,
  "per_serving_fat_g": 14,
  "recommended_serving_amount": "1 porción",
  "recommendation_text": "Para hoy, 1 porción está bien. Tiene proteína suficiente.",
  "confidence": "medium",
  "notes": "Estimación aproximada basada en ingredientes caseros."
}

Usa tono humano y breve. No prometas exactitud. Solo JSON.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) throw new Error('OpenAI error ' + res.status);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    const result = JSON.parse(clean);
    return { statusCode: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(result) };
  } catch(e) {
    console.error('[estimate-custom-recipe]', e.message);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: e.message }) };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
