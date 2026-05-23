// api/_compat.js — Adaptador Netlify → Vercel con soporte para body grande
module.exports = function netlifyToVercel(handler) {
  return async function(req, res) {
    let body = '';

    // Vercel puede pre-parsear el body — reconvertir a string
    if (req.body !== undefined && req.body !== null) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } else {
      // Leer raw body para archivos grandes (imágenes base64)
      await new Promise((resolve) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          body = Buffer.concat(chunks).toString('utf-8');
          resolve();
        });
        req.on('error', resolve);
      });
    }

    const event = {
      httpMethod:              req.method,
      path:                    req.url,
      headers:                 req.headers,
      queryStringParameters:   req.query || {},
      body:                    body,
      isBase64Encoded:         false,
    };

    try {
      const result = await handler(event, {});

      // Respuesta binaria (audio MP3, etc.)
      if (result.isBase64Encoded) {
        const buf = Buffer.from(result.body, 'base64');
        res.status(result.statusCode || 200);
        if (result.headers) {
          Object.entries(result.headers).forEach(([k,v]) => res.setHeader(k, v));
        }
        return res.send(buf);
      }

      // Respuesta normal
      res.status(result.statusCode || 200);
      if (result.headers) {
        Object.entries(result.headers).forEach(([k,v]) => res.setHeader(k, v));
      }
      return res.send(result.body || '');

    } catch(e) {
      console.error('[Compat] Error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  };
};
