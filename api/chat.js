// api/chat.js — igual patrón que food-photo.js (funciona)
const ARJU_RULES = `Eres Arju, coach de ArjunaFit. Mujer colombiana, directa y calida.
Hablas como amiga que sabe de fitness. Dices: dale, parcera, chevere.
Nunca juzgas. Maximo 3 oraciones cortas. Sin listas.
Si preguntan precio: Reto gluteos $32 USD, Reto pancita $32 USD.`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-ArjunaFit',
  'Content-Type': 'application/json',
};

// bodyParser deshabilitado — mismo patron que food-photo
module.exports.config = { api: { bodyParser: false } };

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const KEY = process.env.OPENAI_API_KEY;
  if (!KEY) return res.status(503).json({ error: 'no key' });

  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch(e) {
    return res.status(400).json({ error: 'bad body' });
  }

  const messages   = body.messages  || [];
  const system     = body.system    || '';
  const max_tokens = Math.min(body.max_tokens || 300, 500);

  if (!messages.length) return res.status(400).json({ error: 'no messages' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens,
        temperature: 0.85,
        messages: [
          { role: 'system', content: ARJU_RULES + '\n' + system },
          ...messages.slice(-6)
        ]
      })
    });

    if (!r.ok) {
      const t = await r.text();
      console.error('[chat]', r.status, t.slice(0,100));
      return res.status(r.status).json({ error: 'openai ' + r.status });
    }

    const data = await r.json();
    return res.status(200).json(data);

  } catch(e) {
    console.error('[chat] fatal:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
