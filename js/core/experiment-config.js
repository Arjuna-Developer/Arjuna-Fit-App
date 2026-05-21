// ═══════════════════════════════════════════════════════
// ArjunaFit — Experiment Config v1
// Lightweight A/B variant system. No external dependencies.
// ═══════════════════════════════════════════════════════
(function() {
  'use strict';

  // ── Active experiments ───────────────────────────────────────
  // Change variants here to run experiments.
  // Variants are stored in localStorage for consistency.
  var EXPERIMENTS = {
    landing_cta: {
      name:        'Landing CTA variant',
      description: 'CTA principal en cards de reto en landing',
      status:      'running',           // planned | running | paused | winner | inconclusive
      metric:      'signup_page_viewed',
      variants:    ['A','B'],           // A = "Probar 7 días gratis" | B = "Elegir mi reto gratis"
      default:     'A',
    },
    onboarding_length: {
      name:        'Onboarding corto vs completo',
      description: '4 pasos obligatorios vs 6 pasos actuales',
      status:      'planned',
      metric:      'onboarding_completed',
      variants:    ['control','short'],
      default:     'control',
    },
    home_day1_focus: {
      name:        'Home Día 1 — acción única',
      description: 'Una acción principal según hora vs múltiples CTAs',
      status:      'running',
      metric:      'first_meal_logged',
      variants:    ['A','B'],           // A = multiple CTAs | B = single primary action
      default:     'B',
    },
    paywall_summary: {
      name:        'Paywall Día 7 con resumen de progreso',
      description: 'Mostrar progreso real antes del CTA de desbloqueo',
      status:      'running',
      metric:      'unlock_clicked',
      variants:    ['A','B'],           // A = solo CTA | B = progreso + CTA
      default:     'B',
    },
    signup_copy: {
      name:        'Signup CTA copy',
      description: '"Crear cuenta y empezar gratis" vs "Crear cuenta y preparar mi primer día"',
      status:      'planned',
      metric:      'signup_success',
      variants:    ['A','B'],
      default:     'A',
    },
  };

  // ── CTA copy map ─────────────────────────────────────────────
  var CTA_VARIANTS = {
    landing_cta: {
      A: { reto:'Probar 7 días gratis', plan:'Empezar ahora' },
      B: { reto:'Elegir mi reto gratis', plan:'Empezar ahora' },
    },
    signup_copy: {
      A: { reto:'Crear cuenta y empezar gratis', plan:'Crear cuenta y continuar al pago' },
      B: { reto:'Crear cuenta y preparar mi primer día', plan:'Crear cuenta y continuar al pago' },
    },
  };

  // ── URL override ─────────────────────────────────────────────
  // Allow ?exp_landing_cta=B to force a variant (QA / testing)
  function getVariantFromUrl(expId) {
    var params = new URLSearchParams(window.location.search);
    return params.get('exp_' + expId) || null;
  }

  // ── Get or assign variant ────────────────────────────────────
  function getVariant(expId) {
    var exp = EXPERIMENTS[expId];
    if (!exp) return null;
    if (exp.status === 'planned' || exp.status === 'paused') return exp.default;

    var urlOverride = getVariantFromUrl(expId);
    if (urlOverride && exp.variants.includes(urlOverride)) return urlOverride;

    var storageKey = 'af-exp-' + expId;
    var stored = localStorage.getItem(storageKey);
    if (stored && exp.variants.includes(stored)) return stored;

    // Assign randomly (50/50 for 2 variants)
    var idx = Math.floor(Math.random() * exp.variants.length);
    var assigned = exp.variants[idx];
    localStorage.setItem(storageKey, assigned);
    return assigned;
  }

  // ── Get CTA copy ─────────────────────────────────────────────
  function getCta(expId, productType) {
    var variant = getVariant(expId);
    var map = CTA_VARIANTS[expId];
    if (!map || !map[variant]) return null;
    var isReto = !productType || productType.startsWith('challenge_');
    return isReto ? map[variant].reto : map[variant].plan;
  }

  // ── Track experiment view ─────────────────────────────────────
  function trackView(expId) {
    var variant = getVariant(expId);
    if (!variant) return;
    if (window.AF) AF.track('experiment_viewed', {
      experiment_name: expId,
      variant:         variant,
      metric:          EXPERIMENTS[expId]?.metric || '',
    });
  }

  // ── Track experiment click ────────────────────────────────────
  function trackClick(expId, resultEvent) {
    var variant = getVariant(expId);
    if (window.AF) AF.track('experiment_cta_clicked', {
      experiment_name: expId,
      variant:         variant,
      result_event:    resultEvent || '',
    });
  }

  // ── Get all active assignments ────────────────────────────────
  function getActiveAssignments() {
    var out = {};
    Object.keys(EXPERIMENTS).forEach(function(id) {
      out[id] = getVariant(id);
    });
    return out;
  }

  // ── getConfig — returns current experiment config ─────────────
  function getConfig() {
    return {
      experiments: EXPERIMENTS,
      assignments: getActiveAssignments(),
    };
  }

  // Auto-log assignments on load
  setTimeout(function() {
    var assignments = getActiveAssignments();
    Object.keys(assignments).forEach(function(id) {
      if (EXPERIMENTS[id].status === 'running') trackView(id);
    });
  }, 1000);

  // ── Expose ───────────────────────────────────────────────────
  window.AF_Exp = {
    getVariant,
    getCta,
    trackView,
    trackClick,
    getConfig,
    EXPERIMENTS,
    CTA_VARIANTS,
  };

  console.log('[AF Exp] Variants:', getActiveAssignments());

})();
