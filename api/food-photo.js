// api/food-photo.js — Vercel nativo (sin compat wrapper)
// Maneja imágenes base64 grandes directamente

const { createClient } = require('@supabase/supabase-js');

// Config Vercel — deshabilitar body parser automático para leer raw
module.exports.config = {
  api: { bodyParser: false }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
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
  // CORS preflight
  Object.entries(corsHeaders()).forEach(([k,v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(503).json({ error: 'Servicio no configurado' });

  // Leer body raw (bodyParser deshabilitado)
  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch(e) {
    return res.status(400).json({ error: 'Body inválido' });
  }

  const { image: imageBase64, authToken } = body;
  let mimeType = body.mimeType || 'image/jpeg';
  const VALID_MIME = ['image/jpeg','image/png','image/webp','image/gif'];
  if (!VALID_MIME.includes(mimeType)) mimeType = 'image/jpeg';

  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

  // Auth opcional — para rate limiting
  let userId = null;
  const token = authToken || (req.headers['authorization'] || '').replace('Bearer ', '');
  if (token && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data } = await sb.auth.getUser(token);
      userId = data?.user?.id || null;
    } catch(e) {}
  }

  // Limpiar base64 (quitar data:image/...;base64, si existe)
  const cleanB64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  const SYSTEM_PROMPT = `Eres un nutricionista experto en comida colombiana y latinoamericana.
Analiza la imagen y responde SOLO con JSON válido, sin texto extra:
{
  "foods": [{"name":"nombre","cal":100,"prot":10,"carb":15,"fat":5}],
  "total": {"cal":100,"prot":10,"carb":15,"fat":5},
  "message": "comentario breve y motivador sobre la comida"
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
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Analiza esta comida y responde con el JSON exacto pedido.' },
            { type: 'image_url', image_url: {
              url: `data:${mimeType};base64,${cleanB64}`,
              detail: 'low'
            }}
          ]
        }],
        response_format: { type: 'json_object' }
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error('[food-photo] OpenAI error:', openaiRes.status, err.slice(0,200));
      return res.status(500).json({ error: 'Error analizando la imagen', fallback: true });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ error: 'Respuesta vacía', fallback: true });

    let result;
    try {
      const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      result = JSON.parse(clean);
    } catch(e) {
      console.error('[food-photo] Parse failed:', text.slice(0,200));
      return res.status(200).json({ error: 'No pude identificar los alimentos', fallback: true });
    }

    // Guardar log en Supabase si hay usuario
    if (userId && process.env.SUPABASE_URL) {
      try {
        const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        await sb.from('food_photo_logs').insert({
          user_id: userId,
          result_json: result,
          created_at: new Date().toISOString()
        });
      } catch(e) {}
    }

    return res.status(200).json(result);

  } catch(e) {
    console.error('[food-photo] fetch error:', e.message);
    return res.status(500).json({ error: e.message, fallback: true });
  }
};
