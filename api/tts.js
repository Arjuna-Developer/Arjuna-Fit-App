// api/tts.js — Vercel wrapper
// Migrado automáticamente desde netlify/functions/tts.js
const compat = require('./_compat');
const { handler } = require('../netlify/functions/tts');
module.exports = compat(handler);
