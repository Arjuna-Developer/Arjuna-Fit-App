// api/food-photo.js — Vercel con límite de body 10MB para imágenes
const compat = require('./_compat');
const { handler } = require('../netlify/functions/food-photo');

// Aumentar límite de body para base64 de imágenes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

module.exports = compat(handler);
