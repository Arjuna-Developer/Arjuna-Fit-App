// api/chat.js — Vercel wrapper
// Migrado automáticamente desde netlify/functions/chat.js
const compat = require('./_compat');
const { handler } = require('../netlify/functions/chat');
module.exports = compat(handler);
