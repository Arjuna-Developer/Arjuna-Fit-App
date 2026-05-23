// api/food-photo.js — Vercel nativo
const { createClient } = require('@supabase/supabase-js');

module.exports.config = { api: { bodyParser: false } };

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  Object.entries(corsHeaders()).forEach(([k,v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(503).json({ error: 'Servicio no configurado' });

  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch(e) {
    return res.status(400).json({ error: 'Body inválido' });
  }

  const { image: imageBase64 } = body;
  let mimeType = body.mimeType || 'image/jpeg';
  const VALID_MIME = ['image/jpeg','image/png','image/webp','image/gif'];
  if (!VALID_MIME.includes(mimeType)) mimeType = 'image/jpeg';
  if (!imageBase64) return res.status(400).json({ error: 'No image' });

  const cleanB64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  // Prompt muy específico con ejemplo de salida esperada
  const USER_PROMPT = `Analiza esta comida colombiana/latinoamericana.
Lista CADA alimento visible por separado con sus calorías y proteína estimados.
Responde ÚNICAMENTE con este JSON exacto (sin texto extra, sin markdown):
{
  "foods": [
    {"name": "Pechuga de pollo a la plancha", "cal": 165, "prot": 31},
    {"name": "Arroz blanco", "cal": 130, "prot": 3},
    {"name": "Fríjoles", "cal": 110, "prot": 7}
  ],
  "total": {"cal": 405, "prot": 41},
  "message": "Buena comida colombiana, buen aporte de proteína."
}`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 600,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Eres nutricionista experto en comida colombiana. Respondes SOLO con JSON válido, sin texto extra.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: USER_PROMPT },
              { type: 'image_url', image_url: {
                url: `data:${mimeType};base64,${cleanB64}`,
                detail: 'low'
              }}
            ]
          }
        ]
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error('[food-photo] OpenAI error:', openaiRes.status, err.slice(0,300));
      return res.status(500).json({ error: 'Error analizando imagen', fallback: true });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) return res.status(500).json({ error: 'Respuesta vacía', fallback: true });

    let result;
    try {
      const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      result = JSON.parse(clean);
    } catch(e) {
      console.error('[food-photo] Parse failed:', text.slice(0,300));
      return res.status(200).json({ error: 'No pude identificar', fallback: true });
    }

    // Normalizar campos — asegurar que cal y prot sean números
    if (result.foods && Array.isArray(result.foods)) {
      result.foods = result.foods.map(f => ({
        name:  f.name  || f.nombre || f.food || 'Alimento',
        cal:   parseInt(f.cal   || f.calories  || f.calorias || 0),
        prot:  parseInt(f.prot  || f.protein   || f.proteina || 0),
        carb:  parseInt(f.carb  || f.carbs     || f.carbohidratos || 0),
        fat:   parseInt(f.fat   || f.fats      || f.grasas   || 0),
      }));
    }

    if (result.total) {
      result.total = {
        cal:  parseInt(result.total.cal  || result.total.calories  || 0),
        prot: parseInt(result.total.prot || result.total.protein   || 0),
        carb: parseInt(result.total.carb || result.total.carbs     || 0),
        fat:  parseInt(result.total.fat  || result.total.fats      || 0),
      };
    } else if (result.foods) {
      // Calcular total si no viene
      result.total = result.foods.reduce((acc, f) => ({
        cal:  acc.cal  + (f.cal  || 0),
        prot: acc.prot + (f.prot || 0),
        carb: acc.carb + (f.carb || 0),
        fat:  acc.fat  + (f.fat  || 0),
      }), { cal: 0, prot: 0, carb: 0, fat: 0 });
    }

    return res.status(200).json(result);

  } catch(e) {
    console.error('[food-photo] Fatal:', e.message);
    return res.status(500).json({ error: e.message, fallback: true });
  }
};
