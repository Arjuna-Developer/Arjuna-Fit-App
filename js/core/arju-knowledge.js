// ═══════════════════════════════════════════════════════════════
// ArjunaFit — Arju Knowledge Base Retrieval
// Carga y selecciona conocimiento para el prompt del coach
// prebeta-branding-seo-knowledge-recipes-v1
// ═══════════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ── Knowledge store ─────────────────────────────────────────────
  // Se carga dinámicamente desde /knowledge/ y /data/
  var _knowledgeCache = {};

  // ── Document map by mode and product ────────────────────────────
  var KNOWLEDGE_MAP = {
    daily_coach: {
      always:  ['arju-brand-voice', 'commercial-rules', 'safety-rules'],
      challenge_glutes:    ['challenge-glutes', 'training-principles', 'nutrition-principles'],
      challenge_belly:     ['challenge-belly', 'training-principles', 'nutrition-principles'],
      custom_muscle_gain:  ['custom-muscle-gain', 'training-principles', 'nutrition-principles'],
      custom_fat_loss:     ['custom-fat-loss', 'training-principles', 'nutrition-principles'],
    },
    nutrition_coach: {
      always:  ['arju-brand-voice', 'nutrition-principles', 'safety-rules'],
      challenge_glutes:    ['challenge-glutes'],
      challenge_belly:     ['challenge-belly'],
      custom_muscle_gain:  ['custom-muscle-gain'],
      custom_fat_loss:     ['custom-fat-loss'],
    },
    workout_session: {
      always:  ['training-principles', 'safety-rules', 'arju-brand-voice'],
      challenge_glutes:    ['challenge-glutes'],
      challenge_belly:     ['challenge-belly'],
      custom_muscle_gain:  ['custom-muscle-gain'],
      custom_fat_loss:     ['custom-fat-loss'],
    },
    recipe_coach: {
      always:  ['arju-brand-voice', 'nutrition-principles'],
    },
    support: {
      always:  ['faq', 'commercial-rules', 'arju-brand-voice', 'safety-rules'],
    },
    trial_conversion: {
      always:  ['commercial-rules', 'faq', 'arju-brand-voice'],
    },
    // Social / recipe modes
    recipe_sharing: {
      always: ['recipe-sharing-system', 'nutrition-principles', 'arju-brand-voice'],
    },
    social_reply: {
      always: ['social-faq', 'objection-handling', 'commercial-rules', 'arju-brand-voice'],
    },
  };

  // ── Inline knowledge snippets (fallback if MD files not loaded) ─
  var INLINE_KNOWLEDGE = {
    'arju-brand-voice': `
Arju es humano, cálido, breve y claro. No hace toxic fitness.
Frases: "No tiene que ser perfecto." "Volver también cuenta." "Hoy paso a paso."
Nunca: regañar, culpar, prometer resultados mágicos, activar pagos, cambiar acceso.`,

    'commercial-rules': `
Retos (challenge_glutes, challenge_belly): 7 días gratis, luego $32 USD, 37 días totales.
Personalizados (custom_muscle_gain, custom_fat_loss): $72 USD/mes, SIN prueba gratis, pago inmediato.
NUNCA ofrecer trial en personalizados. No inventar precios. No activar acceso.`,

    'safety-rules': `
No diagnosticar. No tratar enfermedades. No crear dietas médicas. No prometer resultados.
Ante dolor fuerte: parar y consultar profesional. No ayunos extremos.`,

    'training-principles': `
Técnica antes que peso. Progresión gradual. Calentamiento. Descanso es parte del proceso.
Adaptar según estado: versión suave si cansado, parar si hay dolor agudo.`,

    'nutrition-principles': `
Proteína en cada comida. Comida simple y sostenible. Sin perfeccionismo. Sin hambre extrema.
Comida real: arepa, arroz, papa, plátano, lentejas, frijoles son válidos.
Estimaciones, no exactitud. Una comida registrada ya es progreso.`,

    'challenge-glutes': `
Reto de glúteos: hip thrust, sentadilla búlgara, peso muerto rumano, abducción.
Enfoque en conexión mente-músculo. Pausa arriba en hip thrust.
No prometer glúteos perfectos. Resultados varían.`,

    'challenge-belly': `
Reto pancita: core, pasos, movilidad, hábitos. Plancha, dead bug, bird dog, caminata.
No existe grasa localizada. Reducción general con hábitos consistentes.`,

    'custom-muscle-gain': `
Masa muscular: superávit o comer suficiente. Proteína alta. Fuerza progresiva. Descanso.
$72 USD/mes. Sin trial. Pago inmediato.`,

    'custom-fat-loss': `
Reducción grasa: déficit sostenible. Proteína alta. Fuerza + movimiento. Sin extremos.
$72 USD/mes. Sin trial. Pago inmediato.`,

    'recipe-sharing-system': `
En redes: nombre, foto, 3 ingredientes principales, macro aproximado, tip de Arju, CTA.
En app: receta completa, porciones ajustables, macros, agregar al día, recomendación de Arju.
CTA: "Guárdala en tu día con Arju." No decir "solo para miembros" de forma fría.`,

    'faq': `
Trial: solo retos. Personalizados: sin trial.
Si pagó y no tiene acceso: WhatsApp wa.link/hteek6.
Si faltó un día: volver al siguiente, sin culpa.`,
  };

  // ── Build system context for Arju prompt ─────────────────────────
  window.AF_buildArjuContext = function(userContext) {
    var mode        = userContext.mode        || 'daily_coach';
    var productType = userContext.productType || '';
    var dayNum      = userContext.dayNum      || 1;
    var isTrial     = userContext.isTrial     || false;

    var modeMap = KNOWLEDGE_MAP[mode] || KNOWLEDGE_MAP.daily_coach;
    var docs    = (modeMap.always || []).concat(modeMap[productType] || []);

    // Remove duplicates
    docs = docs.filter(function(d, i) { return docs.indexOf(d) === i; });

    var contextParts = [];
    docs.forEach(function(docId) {
      var content = _knowledgeCache[docId] || INLINE_KNOWLEDGE[docId];
      if (content) {
        contextParts.push('## ' + docId.replace(/-/g, ' ').toUpperCase() + '\n' + content.trim());
      }
    });

    var productLabel = {
      challenge_glutes:  'Reto de glúteos',
      challenge_belly:   'Reto para bajar la pancita',
      custom_muscle_gain:'Plan de masa muscular',
      custom_fat_loss:   'Plan de reducción de grasa',
    }[productType] || 'ArjunaFit';

    var systemContext = [
      '# SISTEMA — ARJU COACH ARJUNAFIT',
      '',
      'Eres Arju, el coach IA de ArjunaFit.',
      'Usuario: ' + (userContext.userName || 'tu usuario'),
      'Plan activo: ' + productLabel,
      'Día: ' + dayNum + (isTrial ? ' (período de prueba)' : ''),
      '',
      '# BASE DE CONOCIMIENTO',
      contextParts.join('\n\n'),
    ].join('\n');

    return systemContext;
  };

  // ── Retrieve relevant knowledge for a user message ───────────────
  window.AF_retrieveKnowledge = function(userMessage, mode, productType) {
    var msg = (userMessage || '').toLowerCase();
    var extra = [];

    // Keyword-based retrieval
    if (/precio|costo|pago|trial|gratis|premium|plan/.test(msg)) extra.push('commercial-rules');
    if (/dolor|lesión|lesion|médico|medico|enfermedad/.test(msg)) extra.push('safety-rules');
    if (/receta|comer|comida|proteína|proteina|desayuno|almuerzo|cena/.test(msg)) extra.push('nutrition-principles');
    if (/ejercicio|entreno|workout|técnica|tecnica|peso|repeticiones/.test(msg)) extra.push('training-principles');
    if (/glúte|glute|cadera/.test(msg)) extra.push('challenge-glutes');
    if (/pancita|abdomen|grasa abdominal|core/.test(msg)) extra.push('challenge-belly');
    if (/faq|pregunta|cómo funciona|que es arju/.test(msg)) extra.push('faq');

    return extra.filter(function(d, i) { return extra.indexOf(d) === i; });
  };

  // ── Public API ───────────────────────────────────────────────────
  window.AF_Knowledge = {
    buildContext:     window.AF_buildArjuContext,
    retrieveFor:      window.AF_retrieveKnowledge,
    getInline:        function(docId) { return INLINE_KNOWLEDGE[docId] || null; },
  };

  console.log('[ArjuKnowledge] loaded v1');

})();
