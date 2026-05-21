// ══════════════════════════════════════════════════════════════
// ArjunaFit — Netlify Function: /chat
// Proxy seguro para OpenAI + Knowledge Base integration
// admin-arju-knowledge-center-v1
// ══════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Reglas inmutables de ArjunaFit (siempre activas) ─────────────
const ARJUNA_CORE_RULES = `
REGLAS COMERCIALES ARJUNAFIT (NO NEGOCIABLES):
- Reto de glúteos y reto pancita: 7 días gratis, luego $32 USD, 37 días total.
- Planes personalizados (masa muscular / reducción grasa): $72 USD/mes, pago inmediato, SIN prueba gratis.
- NUNCA ofrecer trial en planes personalizados.
- NUNCA confirmar un pago sin datos reales.
- NUNCA activar acceso ni cambiar access_level.
- Si pagó y no tiene acceso: "Escríbenos al WhatsApp wa.link/hteek6".

REGLAS DE SEGURIDAD (NO NEGOCIABLES):
- No diagnosticar enfermedades ni tratar condiciones médicas.
- No dar dietas clínicas ni recomendar ayunos extremos.
- No decir que se quema grasa en zonas específicas.
- Ante dolor fuerte: parar y consultar profesional.
- No prometer resultados garantizados.

TONO: Arju es humano, cálido, breve, directo y sin culpa.
Frases guía: "Volver también cuenta." "No empezamos de cero." "Hoy paso a paso."
`;

// ── Search relevant knowledge chunks ─────────────────────────────
async function searchKnowledge(query, mode, productType) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE) return [];
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
      auth: { persistSession: false }
    });

    // Category hints by mode
    const modeCategories = {
      daily_coach:     ['brand_voice','commercial_rules','safety'],
      nutrition_coach: ['nutrition','recipes','safety'],
      workout_session: ['training','safety'],
      recipe_coach:    ['recipes','nutrition'],
      support:         ['support','commercial_rules'],
      trial_conversion:['commercial_rules','objections'],
    };
    const catHints = modeCategories[mode] || [];
    if (productType) catHints.push(productType.replace('challenge_','').replace('custom_',''));

    // Keyword extraction
    const stopWords = new Set(['qué','que','cómo','como','para','cuando','donde','tiene','puede','debe','hay','una']);
    const keywords = query.toLowerCase().split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w)).slice(0, 4);

    if (!keywords.length) return [];

    const orFilter = keywords.map(kw => `content.ilike.%${kw}%`).join(',');
    const { data } = await sb
      .from('arju_knowledge_chunks')
      .select('content,category,token_estimate')
      .eq('status','active')
      .or(orFilter)
      .limit(4);

    return (data || []).map(c => c.content.substring(0, 400));
  } catch(e) {
    console.warn('[chat] knowledge search failed:', e.message);
    return [];
  }
}

// ── CORS headers ─────────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

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

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      system       = '',
      messages     = [],
      max_tokens   = 400,
      temperature  = 0.75,
      mode         = 'daily_coach',
      product_type = '',
      use_knowledge = true,
    } = body;

    // 1. Get last user message for knowledge search
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    // 2. Search admin knowledge base
    let knowledgeContext = '';
    if (use_knowledge && lastUserMsg) {
      const chunks = await searchKnowledge(lastUserMsg, mode, product_type);
      if (chunks.length) {
        knowledgeContext = '\n\nCONOCIMIENTO ARJUNAFIT RELEVANTE:\n' +
          chunks.map((c, i) => `[${i+1}] ${c}`).join('\n\n');
      }
    }

    // 3. Build final system prompt: core rules + custom system + knowledge
    const finalSystem = [
      ARJUNA_CORE_RULES,
      system ? '\nCONTEXTO ADICIONAL:\n' + system : '',
      knowledgeContext,
    ].filter(Boolean).join('\n');

    const openaiMessages = [
      { role: 'system', content: finalSystem },
      ...messages,
    ];

    if (!openaiMessages.length) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'No messages provided' }) };
    }

    const safeMaxTokens = Math.min(max_tokens, 600);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        max_tokens: safeMaxTokens,
        temperature,
        presence_penalty:  0.3,
        frequency_penalty: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers: corsHeaders(),
        body: JSON.stringify({ error: errorData.error?.message || 'OpenAI error' })
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch(err) {
    console.error('[chat] Function error:', err);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
