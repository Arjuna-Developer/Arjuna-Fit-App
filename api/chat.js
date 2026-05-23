// api/chat.js — Vercel nativo
// Proxy seguro a OpenAI para el coach Arju

module.exports.config = { api: { bodyParser: false } };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

// Reglas de Arju — siempre activas
const ARJU_RULES = `
Eres Arju, coach de transformación de ArjunaFit.
Eres una mujer colombiana, directa, cálida, sin filtros.
Hablas como una amiga que sabe de fitness, no como una app.
Usas lenguaje colombiano natural: "parcera", "ve", "dale", "chévere".
Nunca juzgas el cuerpo, el proceso ni los días malos.
Tus respuestas son máximo 3 oraciones cortas. Sin listas. Sin bullets.
Eres específica: no dices "come bien", dices qué comer.
Nunca menciones marcas de la competencia.
Nunca des diagnósticos médicos.
Si preguntan por precio del reto: Reto glúteos $32 USD, Reto pancita $32 USD.
`;

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(503).json({ error: 'OpenAI no configurado' });

  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch(e) {
    return res.status(400).json({ error: 'Body inválido' });
  }

  const {
    messages = [],
    system = '',
    max_tokens = 300,
    mode = 'daily_coach',
    user_id = ''
  } = body;

  if (!messages.length) return res.status(400).json({ error: 'Sin mensajes' });

  // Construir system prompt: reglas fijas + contexto personalizado
  const systemPrompt = ARJU_RULES + '\n\n' + (system || '');

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: Math.min(max_tokens, 500),
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6) // Últimos 6 mensajes para contexto
        ]
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error('[chat] OpenAI error:', openaiRes.status, err.slice(0, 200));
      return res.status(openaiRes.status).json({ error: 'OpenAI error', status: openaiRes.status });
    }

    const data = await openaiRes.json();
    return res.status(200).json(data);

  } catch(e) {
    console.error('[chat] fetch error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
