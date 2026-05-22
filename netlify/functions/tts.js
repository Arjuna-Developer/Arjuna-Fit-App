// netlify/functions/tts.js
// Arju TTS — ElevenLabs eleven_flash_v2_5
// Voz: Bella (EXAVITQu4vr4xnSDxMaL) — cálida, expresiva
// Fallback: error claro para que el cliente use browser TTS

const VOICE_ID  = 'EXAVITQu4vr4xnSDxMaL'; // Bella — warm & expressive
const MODEL_ID  = 'eleven_flash_v2_5';      // ~75ms latency, 32 idiomas

// Agregar tags emocionales según el contenido
function addEmotionTags(text) {
  const t = text.trim();
  // Saludos / motivación
  if (/buenos días|buenas|hola|llegaste|bienvenid/.test(t.toLowerCase()))
    return '[warm] ' + t;
  // Motivación / logro
  if (/lograste|terminaste|excelente|dale|vamos|puedes|eso es/.test(t.toLowerCase()))
    return '[motivated] ' + t;
  // Reflexivo / noche
  if (/recuerda|descansa|mañana|proceso|constancia/.test(t.toLowerCase()))
    return '[soft] ' + t;
  return t;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers, body: '' };

  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers, body: 'Method not allowed' };

  const API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!API_KEY)
    return { statusCode: 503, headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }) };

  let text = '';
  try {
    const body = JSON.parse(event.body || '{}');
    text = (body.text || '').slice(0, 500).trim();
  } catch(e) {
    return { statusCode: 400, headers, body: 'Invalid JSON' };
  }

  if (!text)
    return { statusCode: 400, headers, body: 'No text provided' };

  const taggedText = addEmotionTags(text);

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: taggedText,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.45,        // más variación = más natural
            similarity_boost: 0.80,
            style: 0.35,            // algo de estilo expresivo
            use_speaker_boost: true,
          },
          language_code: 'es',
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[TTS] ElevenLabs error:', res.status, err);
      return { statusCode: res.status,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'ElevenLabs error', status: res.status }) };
    }

    const audioBuffer = await res.arrayBuffer();
    const base64Audio  = Buffer.from(audioBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'audio/mpeg' },
      body: base64Audio,
      isBase64Encoded: true,
    };

  } catch(e) {
    console.error('[TTS] fetch error:', e.message);
    return { statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message }) };
  }
};
