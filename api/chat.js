// api/chat.js — Arju Educable v3
// Memoria entre sesiones + RAG + guarda conversación para fine-tuning

const { createClient } = require('@supabase/supabase-js');

const ARJU_RULES = `Eres Arju, coach de ArjunaFit. Mujer colombiana directa y calida.
Hablas como amiga que sabe fitness: dale, parcera, chevere, ve.
Nunca juzgas el cuerpo ni el proceso. Max 3 oraciones. Sin listas.
Eres especifica: no dices "come bien", dices que comer exactamente.
Precio reto gluteos $32 USD, pancita $32 USD, plan personalizado $72 USD.
No menciones competidores. No diagnosticos medicos.`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function getSB() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Obtener usuario desde token
async function getUser(sb, authHeader) {
  if (!sb || !authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    const { data } = await sb.auth.getUser(token);
    return data?.user || null;
  } catch(e) { return null; }
}

// Cargar memoria reciente del usuario (últimas 10 interacciones)
async function loadMemory(sb, userId) {
  if (!sb || !userId) return [];
  try {
    const { data } = await sb.from('arju_memory')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    return (data || []).reverse(); // cronológico
  } catch(e) { return []; }
}

// Buscar knowledge relevante (RAG simple)
async function searchKnowledge(sb, query) {
  if (!sb) return '';
  try {
    // Búsqueda por palabras clave en content y tags
    const keywords = query.toLowerCase().split(' ')
      .filter(w => w.length > 3).slice(0, 3);
    if (!keywords.length) return '';

    const { data } = await sb.from('arju_knowledge')
      .select('title, content')
      .eq('active', true)
      .or(keywords.map(k => `content.ilike.%${k}%`).join(','))
      .limit(2);

    if (!data || !data.length) return '';
    return '\n\nCONOCIMIENTO RELEVANTE:\n' +
      data.map(d => `[${d.title}]: ${d.content}`).join('\n');
  } catch(e) { return ''; }
}

// Guardar en memoria
async function saveMemory(sb, userId, role, content, mode, sessionId) {
  if (!sb || !userId) return null;
  try {
    const { data } = await sb.from('arju_memory').insert({
      user_id: userId, role, content, mode,
      session_id: sessionId,
      created_at: new Date().toISOString()
    }).select('id').single();
    return data?.id || null;
  } catch(e) { return null; }
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const KEY = process.env.OPENAI_API_KEY;
  if (!KEY) return res.status(503).json({ error: 'no key' });

  const body = req.body || {};
  const clientMsgs = body.messages || [];
  const system     = body.system   || '';
  const mode       = body.mode     || 'daily_coach';
  const sessionId  = body.session_id || ('s_' + Date.now());

  if (!clientMsgs.length) return res.status(400).json({ error: 'no messages' });

  const sb   = getSB();
  const user = await getUser(sb, req.headers['authorization']);
  const uid  = user?.id || null;

  // La última pregunta del usuario
  const lastUserMsg = [...clientMsgs].reverse().find(m => m.role === 'user');
  const userText = lastUserMsg?.content || '';

  // Cargar memoria + RAG en paralelo
  const [memory, knowledge] = await Promise.all([
    loadMemory(sb, uid),
    searchKnowledge(sb, userText)
  ]);

  // Construir system prompt
  const memoryContext = memory.length
    ? '\n\nCONVERSACIONES ANTERIORES (para contexto):\n' +
      memory.slice(-6).map(m => `${m.role === 'user' ? 'Usuaria' : 'Arju'}: ${m.content}`).join('\n')
    : '';

  const systemPrompt = ARJU_RULES + '\n\n' + system + memoryContext + knowledge;

  // Guardar mensaje del usuario en memoria (no bloqueante)
  const userMemId = saveMemory(sb, uid, 'user', userText, mode, sessionId);

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: Math.min(body.max_tokens || 300, 500),
        temperature: 0.85,
        messages: [
          { role: 'system', content: systemPrompt },
          ...clientMsgs.slice(-6)
        ]
      })
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('[chat]', r.status, err.slice(0, 100));
      return res.status(r.status).json({ error: 'openai ' + r.status });
    }

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content || '';

    // Guardar respuesta de Arju en memoria (no bloqueante)
    if (reply) {
      saveMemory(sb, uid, 'assistant', reply, mode, sessionId).then(async (arjuMemId) => {
        // Si hay feedback positivo en el body, guardar para fine-tuning
        if (body.save_training && arjuMemId) {
          try {
            await sb.from('arju_training').insert({
              user_message: userText,
              ideal_reply:  reply,
              mode,
              source:       'auto',
              approved:     false
            });
          } catch(e) {}
        }
      }).catch(() => {});
    }

    return res.status(200).json({
      ...data,
      _memory_enabled: !!uid,
      _knowledge_used: knowledge.length > 0,
      _session_id:     sessionId
    });

  } catch(e) {
    console.error('[chat] fatal:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
