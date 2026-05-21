// ══════════════════════════════════════════════════
// ArjunaFit — Netlify Function: /tts
// OpenAI Text-to-Speech → devuelve audio MP3
// Mismo OPENAI_API_KEY que /chat
// ══════════════════════════════════════════════════

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' })
    };
  }

  let text = '';
  try {
    const body = JSON.parse(event.body || '{}');
    text = (body.text || '').trim().slice(0, 400); // max 400 chars
  } catch(e) {
    return { statusCode: 400, headers: corsHeaders(), body: 'Invalid JSON' };
  }

  if (!text) {
    return { statusCode: 400, headers: corsHeaders(), body: 'No text provided' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',       // tts-1 = faster, tts-1-hd = better quality
        input: text,
        voice: 'nova',        // nova = warm female, natural
        response_format: 'mp3',
        speed: 0.95,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[TTS] OpenAI error:', err);
      return {
        statusCode: response.status,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'TTS failed', detail: err })
      };
    }

    // Get audio as buffer and return as base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ audio: base64, format: 'mp3' }),
    };

  } catch(e) {
    console.error('[TTS] Error:', e.message);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: e.message })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
