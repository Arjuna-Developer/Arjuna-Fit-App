// ═══════════════════════════════════════════════════════
// ArjunaFit — Analytics & Event Tracking v1
// Tracks activation funnel + logs errors to Supabase.
// ═══════════════════════════════════════════════════════
(function() {
  'use strict';
// ── UTM capture on page load ─────────────────────────────────────
(function captureUTM() {
  try {
    var params = new URLSearchParams(window.location.search);
    var utm_source   = params.get('utm_source');
    var utm_medium   = params.get('utm_medium');
    var utm_campaign = params.get('utm_campaign');
    var utm_content  = params.get('utm_content');
    // Only save if present in URL (don't overwrite existing)
    if (utm_source)   localStorage.setItem('af-utm-source',   utm_source);
    if (utm_medium)   localStorage.setItem('af-utm-medium',   utm_medium);
    if (utm_campaign) localStorage.setItem('af-utm-campaign', utm_campaign);
    if (utm_content)  localStorage.setItem('af-utm-content',  utm_content);
    if (utm_source) console.log('[UTM] Captured:', utm_source, utm_medium, utm_campaign);
  } catch(e) {}
})();



  // ── Helpers ────────────────────────────────────────────────────

  function sanitizeMetadata(metadata) {
    try { return JSON.parse(JSON.stringify(metadata || {})); }
    catch(e) { return {}; }
  }

  var _UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  function getValidUserId() {
    // Try window._sb session first (most reliable)
    try {
      var keys = ['arjunafit-auth', 'sb-egswsqymkxmbtcpnozcq-auth-token'];
      for (var i = 0; i < keys.length; i++) {
        var raw = localStorage.getItem(keys[i]);
        if (!raw) continue;
        var s = JSON.parse(raw);
        var uid = s?.user?.id || s?.session?.user?.id || null;
        if (uid && _UUID_RE.test(uid)) return uid;
      }
    } catch(e) {}
    return null;
  }

  function getOrCreateSessionId() {
    if (!window._afSid) {
      window._afSid = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }
    return window._afSid;
  }

  function buildEventPayload(eventName, metadata) {
    var safeMeta = sanitizeMetadata(metadata);
    // Embed route + version inside metadata_json (avoids column-not-found 400)
    safeMeta._route       = typeof window !== 'undefined' ? window.location.pathname : null;
    safeMeta._app_version = typeof AF_VERSION !== 'undefined' ? AF_VERSION : null;
    return {
      user_id:       getValidUserId(),
      session_id:    getOrCreateSessionId(),
      event_name:    String(eventName || 'unknown_event'),
      product_type:  safeMeta.product_type || safeMeta.product
                     || (typeof localStorage !== 'undefined' ? localStorage.getItem('af-product-type') : null)
                     || null,
      metadata_json: safeMeta
    };
  }



  const AF_VERSION = 'mini-beta-day1-war-room-v1';
  const SUPABASE_URL = 'https://egswsqymkxmbtcpnozcq.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM';
  const ROUTE = window.location.pathname.split('/').pop() || 'index';

  // ── Get current user ID ────────────────────────────────
  // getUID is kept as alias for backward compatibility
  function getUID() { return getValidUserId(); }

  // ── Send event to Supabase ─────────────────────────────
  async function send(table, payload) {
    // Analytics is BEST EFFORT — never throws, never blocks
    try {
      var sb = window._sb;
      if (sb && sb.from) {
        var result = await sb.from(table).insert(payload);
        if (result.error) {
          console.warn('[Analytics] ' + table + ' insert failed:', {
            message: result.error.message,
            hint:    result.error.hint || '',
            code:    result.error.code || '',
            payload_keys: Object.keys(payload).join(',')
          });
        }
        return;
      }
      // Fallback: direct REST call (anon key, no auth required for inserts)
      var resp = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        console.warn('[Analytics] REST ' + table + ' ' + resp.status + ' — payload keys:', Object.keys(payload).join(','));
      }
    } catch(e) {
      console.warn('[Analytics] ' + table + ' skipped:', e.message);
    }
  }

  // ── Track event ────────────────────────────────────────
  function logEvent(eventName, metadata) {
    // uid and session_id are handled by buildEventPayload
    // Enrich metadata with UTM/source context
    const utmMeta = {
      utm_source:   localStorage.getItem('af-utm-source') || null,
      utm_campaign: localStorage.getItem('af-utm-campaign') || null,
      utm_content:  localStorage.getItem('af-utm-content') || null,
    };
    const enrichedMeta = metadata
      ? Object.assign({}, metadata, utmMeta)
      : (utmMeta.utm_source ? utmMeta : null);
    const payload = buildEventPayload(eventName, enrichedMeta || {});
    // Always log to console in dev
    console.log('[AF]', eventName, metadata || '');
    // Send to Supabase (fire-and-forget — never awaited, never blocks)
    send('app_events', payload).catch(function() {});
  }


  // ── Intent score map ─────────────────────────────────────────
  const INTENT_SCORE = {
    landing_cta_clicked:           1,
    landing_product_selected:      2,
    signup_product_selected:       2,
    signup_success:                3,
    onboarding_completed:          3,
    first_meal_logged:             4,
    workout_started:               4,
    return_day_2:                  5,
    trial_day6_warning_viewed:     5,
    trial_day7_summary_viewed:     6,
    unlock_clicked:                8,
    checkout_started:             10,
    custom_plan_intake_completed: 10,
    support_ticket_created:        2,
    payment_approved:             20,
  };

  const STAGE_MAP = {
    landing_cta_clicked:           'product_selected',
    signup_success:                'signup_completed',
    onboarding_completed:          'onboarding_completed',
    first_meal_logged:             'day1_activated',
    trial_day6_warning_viewed:     'trial_day6',
    trial_day7_summary_viewed:     'trial_day7',
    unlock_clicked:                'unlock_clicked',
    checkout_started:              'checkout_started',
    payment_approved:              'payment_approved',
    custom_plan_intake_completed:  'custom_intake_completed',
    support_ticket_created:        'support_requested',
  };

  // ── Upsert commercial contact on key events ───────────────────
  async function upsertCommercialContact(eventName, metadata) {
    const uid = getUID();
    const scoreIncrement = INTENT_SCORE[eventName] || 0;
    const newStage = STAGE_MAP[eventName];
    if (!scoreIncrement && !newStage) return; // not a tracked event

    try {
      const existing = uid
        ? await _sbSend('commercial_contacts', null, { select: 'id,intent_score', user_id: uid, single: true })
        : null;

      const payload = {
        user_id:         uid,
        product_interest: localStorage.getItem('af-product-type') || 'unknown',
        product_type:    localStorage.getItem('af-product-type') || null,
        last_event_name: eventName,
        last_event_at:   new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      };
      if (newStage) payload.funnel_stage = newStage;
      if (scoreIncrement) payload.intent_score = (existing?.intent_score || 0) + scoreIncrement;
      // source from referrer
      if (!existing) {
        payload.source    = document.referrer ? 'referral' : 'direct';
        payload.status    = 'new';
        payload.created_at = new Date().toISOString();
        const name = localStorage.getItem('af-user-name');
        if (name) payload.name = name;
      }

      // Upsert (anon client can insert but not select others' rows)
      await send('commercial_contacts', payload, uid ? 'user_id' : null);
    } catch(e) { /* non-blocking */ }
  }

    // ── Log client error ───────────────────────────────────
  function logClientError(error, context) {
    const uid = getUID();
    const payload = {
      user_id:       uid || null,
      route:         ROUTE || null,
      error_message: (error?.message || String(error)).substring(0, 400),
      error_stack:   error?.stack?.substring(0, 1000) || null,
      severity:      'error',
      metadata_json: context ? JSON.stringify({ context }) : null,
      created_at:    new Date().toISOString()
    };
    console.warn('[AF Error]', error, context || '');
    // Use app_errors (the actual table) — non-blocking
    if (window._sb) {
      window._sb.from('app_errors').insert(payload).then(function(){}).catch(function(){});
    } else {
      send('app_errors', payload);
    }
  }

  // ── Activation funnel ─────────────────────────────────
  function getActivationStatus() {
    const uid = getUID();
    const reto = localStorage.getItem('af-selected-reto');
    const onboardingDone = !!localStorage.getItem('af-training-location');
    const trialStart = parseInt(localStorage.getItem('af-trial-start') || '0');
    const trialDay = trialStart ? Math.min(7, Math.floor((Date.now() - trialStart) / 86400000) + 1) : 0;

    // Count meals across 30 days
    let mealsTotal = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const dd = new Date(today); dd.setDate(today.getDate() - i);
      const kk = 'af-food-' + dd.getFullYear() + '-' + String(dd.getMonth()+1).padStart(2,'0') + '-' + String(dd.getDate()).padStart(2,'0');
      try { mealsTotal += JSON.parse(localStorage.getItem(kk) || '[]').length; } catch(e) {}
    }

    const firstWorkoutStarted = !!localStorage.getItem('af-workout-started');
    const firstWorkoutCompleted = !!localStorage.getItem('af-workout-completed');
    const dayClosed = !!localStorage.getItem('af-day-closed-' + today.toISOString().split('T')[0]);

    return {
      userId: uid,
      selectedChallenge: !!reto,
      onboardingCompleted: onboardingDone,
      firstMealLogged: mealsTotal > 0,
      firstWorkoutStarted,
      firstWorkoutCompleted,
      dayClosed,
      trialDay,
      mealsTotal
    };
  }

  // ── Auto-track page views ──────────────────────────────
  function autoTrack() {
    const pageEvent = {
      'index': 'login_viewed',
      'onboarding': 'onboarding_viewed',
      'dashboard': 'dashboard_viewed',
      'nutrition': 'nutrition_viewed',
      'workout': 'workout_viewed',
      'progress': 'progress_viewed',
      'coach': 'coach_opened',
      'profile': 'profile_viewed',
      'biblioteca': 'biblioteca_viewed'
    }[ROUTE.replace('.html', '')] || 'page_viewed';

    logEvent(pageEvent, { route: ROUTE });
  }

  // ── Global error catcher ───────────────────────────────
  window.addEventListener('error', function(e) {
    logClientError(e.error || e.message, e.filename);
  });

  window.addEventListener('unhandledrejection', function(e) {
    logClientError({ message: String(e.reason), stack: null }, 'unhandledrejection');
  });

  // ── Version announce ───────────────────────────────────
  console.log('%c[ArjunaFit] Version ' + AF_VERSION, 'color:#7c3aed;font-weight:bold');

  // ── Expose API ─────────────────────────────────────────
  window.AF = window.AF || {};
  window.AF.analytics = { logEvent, logClientError, getActivationStatus };
  window.AF.version = AF_VERSION;
  window.AF.track = logEvent; // shorthand

  // Auto-track on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoTrack);
  } else {
    autoTrack();
  }

})();

// ── Error logger (writes to app_errors in Supabase) ─────────────
window.AF_logError = function(route, message, severity, meta) {
  if (severity === undefined) severity = 'error';
  try {
    var uid = getUID ? getUID() : null;
    var sb = window._sb;
    if (!sb) return;
    // Fire-and-forget — never blocks
    sb.from('app_errors').insert({
      user_id: uid || null,
      route: route || (typeof window !== 'undefined' ? window.location.pathname : null),
      error_message: String(message || '').substring(0, 500),
      severity: severity || 'error',
      metadata_json: meta || {}
    }).then(function(){}).catch(function(){});
  } catch(e) { /* silent */ }
};

// Human-readable error messages
window.AF_errorMsg = function(raw) {
  var r = String(raw || '');
  if (r.includes('JWT') || r.includes('session') || r.includes('auth')) return 'Tu sesión expiró. Inicia sesión de nuevo.';
  if (r.includes('permission') || r.includes('policy') || r.includes('RLS')) return 'No tienes acceso a esta sección.';
  if (r.includes('network') || r.includes('fetch') || r.includes('Failed to fetch')) return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
  return 'No pudimos completar esta acción. Intenta de nuevo.';
};

// ── Beta observation events ───────────────────────────────────────
// Fired automatically by relevant pages
var AF_BETA_EVENTS = {
  SIGNUP_STARTED:       'signup_started',
  SIGNUP_COMPLETED:     'signup_completed_with_product',
  ONBOARDING_STARTED:   'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  DASHBOARD_VIEWED:     'dashboard_viewed',
  FIRST_MEAL_LOGGED:    'first_meal_logged',
  RECIPE_VIEWED:        'recipe_viewed',
  RECIPE_ADDED:         'recipe_added_to_day',
  WORKOUT_STARTED:      'workout_started',
  WORKOUT_COMPLETED:    'workout_completed',
  PROGRESS_VIEWED:      'progress_viewed',
  SUPPORT_CLICKED:      'support_clicked',
  WHATSAPP_CLICKED:     'whatsapp_clicked',
  STUCK_ONBOARDING:     'stuck_onboarding',
  CHECKIN_COMPLETED:    'daily_checkin_completed',
  ARJU_OPENED:          'arju_opened',
  BETA_FEEDBACK_SENT:   'beta_feedback_sent',
};
if (typeof window !== 'undefined') window.AF_BETA_EVENTS = AF_BETA_EVENTS;
