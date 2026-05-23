// api/chat.js — Vercel wrapper
const compat = require('./_compat');
const { handler } = require('../netlify/functions/chat');

module.exports = compat(handler);
module.exports.config = { api: { bodyParser: { sizeLimit: '2mb' } } };
