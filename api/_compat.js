// api/_compat.js — Adapta las funciones Netlify al formato Vercel
// Permite reusar el código de netlify/functions/ sin reescribir
module.exports = function netlifyToVercel(handler) {
  return async function(req, res) {
    // Construir evento Netlify desde req de Vercel
    let body = '';
    if (req.body) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } else {
      // Leer body crudo
      await new Promise((resolve) => {
        let raw = '';
        req.on('data', chunk => { raw += chunk; });
        req.on('end', () => { body = raw; resolve(); });
        req.on('error', resolve);
      });
    }

    const event = {
      httpMethod: req.method,
      path: req.url,
      headers: req.headers,
      queryStringParameters: req.query || {},
      body: body,
      isBase64Encoded: false,
    };

    try {
      const result = await handler(event, {});
      
      // Manejar respuestas base64 (audio)
      if (result.isBase64Encoded) {
        const buf = Buffer.from(result.body, 'base64');
        res.status(result.statusCode || 200);
        if (result.headers) {
          Object.entries(result.headers).forEach(([k,v]) => res.setHeader(k, v));
        }
        res.send(buf);
        return;
      }

      // Respuesta normal
      res.status(result.statusCode || 200);
      if (result.headers) {
        Object.entries(result.headers).forEach(([k,v]) => res.setHeader(k, v));
      }
      res.send(result.body || '');
    } catch(e) {
      console.error('[Vercel] Handler error:', e);
      res.status(500).json({ error: e.message });
    }
  };
};
