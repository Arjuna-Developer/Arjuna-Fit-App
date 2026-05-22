// api/payment-webhook.js — Vercel wrapper
// Migrado automáticamente desde netlify/functions/payment-webhook.js
const compat = require('./_compat');
const { handler } = require('../netlify/functions/payment-webhook');
module.exports = compat(handler);
