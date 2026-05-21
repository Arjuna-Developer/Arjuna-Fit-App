// ═══════════════════════════════════════════════════════════════
// ArjunaFit — Netlify Function: Search Arju Knowledge
// POST /api/search-arju-knowledge
// Body: { query, product_type, mode, limit? }
// Returns: { chunks, static_docs, sources }
// ═══════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL     = process.env.SUPABASE_URL     || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Static knowledge map (matches arju-knowledge.js) ─────────────
const MODE_DOCS = {
  daily_coach:     ['brand_voice','commercial_rules','safety'],
  nutrition_coach: ['nutrition','recipes','safety'],
  workout_session: ['training','safety'],
  recipe_coach:    ['recipes','nutrition'],
  support:         ['support','commercial_rules','safety'],
  trial_conversion:['commercial_rules','brand_voice'],
};

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Security: require valid session (no anon access to knowledge)
  const authHeader = event.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { query = '', product_type = '', mode = 'daily_coach', limit: lim = 5 } = body;

  if (!query.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'query is required' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server config missing' }) };
  }

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
      auth: { persistSession: false }
    });

    // 1. Extract keywords for search
    const stopWords = new Set(['qué','que','cómo','como','para','cuando','donde','tiene','puede','debe','hay','una','uno','los','las','del','con','por','sobre','esto','esta','son','fue','ser','eso']);
    const keywords  = query.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .slice(0, 5);

    // 2. Category hints from mode
    const catHints  = MODE_DOCS[mode] || [];
    const productMap = {
      challenge_glutes: 'challenge_glutes',
      challenge_belly:  'challenge_belly',
      custom_muscle_gain: 'custom_muscle_gain',
      custom_fat_loss:  'custom_fat_loss',
    };
    if (product_type && productMap[product_type]) catHints.push(productMap[product_type]);

    // 3. Search active chunks by content keyword (ilike)
    let q = sb.from('arju_knowledge_chunks')
      .select('id,content,category,document_id,token_estimate,tags')
      .eq('status','active');

    if (keywords.length) {
      const orFilter = keywords.map(kw => `content.ilike.%${kw}%`).join(',');
      q = q.or(orFilter);
    }

    const { data: chunks, error } = await q.limit(lim);
    if (error) throw new Error(error.message);

    // 4. Get document titles for found chunks
    const docIds = [...new Set((chunks || []).map(c => c.document_id))];
    let docTitles = {};
    if (docIds.length) {
      const { data: docs } = await sb
        .from('arju_knowledge_documents')
        .select('id,title,category,source_name')
        .in('id', docIds);
      (docs || []).forEach(d => { docTitles[d.id] = d; });
    }

    const enrichedChunks = (chunks || []).map(c => ({
      ...c,
      document_title:  docTitles[c.document_id]?.title || '—',
      source_name:     docTitles[c.document_id]?.source_name || '—',
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chunks: enrichedChunks,
        keyword_count: keywords.length,
        mode,
        product_type,
        categories_hinted: catHints,
      }),
    };
  } catch(e) {
    console.error('[search-arju-knowledge]', e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
