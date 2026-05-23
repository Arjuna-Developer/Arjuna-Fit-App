const CORS_H = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

const ARJU = "Eres Arju, coach de ArjunaFit. Mujer colombiana directa y calida. " +
  "Hablas como amiga que sabe fitness: dale, parcera, chevere. " +
  "Nunca juzgas. Max 3 oraciones. Sin listas. " +
  "Precio reto gluteos $32, pancita $32, plan personalizado $72 USD.";

module.exports = async function(req, res) {
  Object.entries(CORS_H).forEach(([k,v]) => res.setHeader(k,v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const K = process.env.OPENAI_API_KEY;
  if (!K) return res.status(503).json({error:"no key"});

  const b = req.body || {};
  const msgs = b.messages || [];
  const sys  = b.system   || "";
  if (!msgs.length) return res.status(400).json({error:"no messages"});

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {"Authorization":"Bearer "+K,"Content-Type":"application/json"},
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: Math.min(b.max_tokens||300, 500),
        temperature: 0.85,
        messages: [
          {role:"system", content: ARJU + " " + sys},
          ...msgs.slice(-6)
        ]
      })
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch(e) {
    console.error("[chat]", e.message);
    return res.status(500).json({error: e.message});
  }
};
