// api/chat.js — Vercel wrapper
const compat = require('./_compat');
const { handler } = require('../netlify/functions/chat');

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
};

module.exports = compat(handler);
