// api/chat.js — Vercel nativo v2
// Fix: usar req.body directamente (Vercel pre-parsea el body JSON)

const ARJU_RULES = `Eres Arju, coach de ArjunaFit. Mujer colombiana, directa y cálida.
Hablas como amiga que sabe de fitness. Lenguaje colombiano: "parcera", "dale", "chévere".
Nunca juzgas el cuerpo ni el proceso. Máximo 3 oraciones. Sin listas ni bullets.
Reto glúteos $32 USD. Reto pancita $32 USD. Plan personalizado $72 USD.
No menciones competidores. No diagnósticos médicos.`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-ArjunaFit',
};

async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(503).json({ error: 'OpenAI no configurado' });

  // Vercel pre-parsea el body — leerlo directamente
  const body = req.body || {};
  const messages  = body.messages  || [];
  const system    = body.system    || '';
  const max_tokens = Math.min(body.max_tokens || 300, 500);

  if (!messages.length) return res.status(400).json({ error: 'Sin mensajes' });

  const systemPrompt = ARJU_RULES + '\n\n' + system;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens,
        temperature: 0.85,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6)
        ]
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error('[chat] OpenAI', openaiRes.status, err.slice(0, 200));
      return res.status(500).json({ error: 'OpenAI error ' + openaiRes.status });
    }

    const data = await openaiRes.json();
    return res.status(200).json(data);

  } catch(e) {
    console.error('[chat] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

// Exportar handler con config
module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
