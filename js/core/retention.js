// ═══════════════════════════════════════════════════════
// ArjunaFit — Retention Engine v1
// Detects user risk states and shows human nudges.
// ═══════════════════════════════════════════════════════
(function() {
  'use strict';

  const NUDGE_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12h

  // ── Helpers ────────────────────────────────────────────
  function localDateStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function mealsToday() {
    try {
      return JSON.parse(localStorage.getItem('af-food-' + localDateStr()) || '[]').length;
    } catch(e) { return 0; }
  }

  function daysSinceActive() {
    const lastSeen = parseInt(localStorage.getItem('af-last-seen') || '0');
    if (!lastSeen) return 0;
    return Math.floor((Date.now() - lastSeen) / 86400000);
  }

  function updateLastSeen() {
    localStorage.setItem('af-last-seen', Date.now().toString());
  }

  function trialDay() {
    const start = parseInt(localStorage.getItem('af-trial-start') || '0');
    if (!start) return 0;
    return Math.min(7, Math.floor((Date.now() - start) / 86400000) + 1);
  }

  function onboardingDone() {
    return !!localStorage.getItem('af-training-location');
  }

  // ── Nudge deduplication ────────────────────────────────
  function canShowNudge(type) {
    const key = 'af-nudge-' + type;
    const last = parseInt(localStorage.getItem(key) || '0');
    return (Date.now() - last) > NUDGE_COOLDOWN_MS;
  }

  function markNudgeShown(type) {
    localStorage.setItem('af-nudge-' + type, Date.now().toString());
    if (window.AF) AF.track('nudge_shown', { type });
  }

  // ── Core function ─────────────────────────────────────
  function getRetentionState() {
    const h              = new Date().getHours();
    const mealsDone      = mealsToday();
    const workoutStarted = !!localStorage.getItem('af-workout-started');
    const workoutDone    = !!localStorage.getItem('af-workout-completed');
    const dayClosed      = !!localStorage.getItem('af-day-closed-' + localDateStr());
    const absent         = daysSinceActive();
    const trial          = trialDay();
    const onboarding     = onboardingDone();
    const isPaid         = localStorage.getItem('af-paid') === '1';

    // Risk level
    let riskLevel = 'low';
    if (absent >= 2 || (!mealsDone && h >= 14) || (!workoutDone && h >= 19)) riskLevel = 'medium';
    if (absent >= 4 || (!onboarding) || (trial >= 6 && mealsDone === 0)) riskLevel = 'high';

    // What nudge to show
    let nudgeType = null;
    if (!onboarding)                     nudgeType = 'onboarding_resume';
    else if (absent >= 2)                nudgeType = 'return_after_absence';
    else if (!mealsDone && h >= 11)      nudgeType = 'log_meal';
    else if (!workoutDone && h >= 15 && h < 20) nudgeType = 'start_workout';
    else if (!dayClosed && h >= 20)      nudgeType = 'close_day';
    else if (workoutStarted && !workoutDone) nudgeType = 'resume_workout';
    else if (trial >= 6 && mealsDone === 0) nudgeType = 'trial_low_activity';

    return {
      hasLoggedMealToday:       mealsDone > 0,
      mealsCount:               mealsDone,
      hasStartedWorkout:        workoutStarted,
      hasCompletedWorkoutToday: workoutDone,
      hasClosedDay:             dayClosed,
      lastActiveDaysAgo:        absent,
      onboardingCompleted:      onboarding,
      trialDay:                 trial,
      isPaid,
      hour:                     h,
      riskLevel,
      nudgeType,
    };
  }

  // ── Nudge content ─────────────────────────────────────
  const NUDGES = {
    onboarding_resume: {
      emoji: '🧠',
      title: 'Terminemos de preparar tu día',
      msg:   'Arju necesita conocerte un poco más para ayudarte mejor.',
      cta:   'Continuar',
      href:  '/pages/onboarding.html',
      color: 'rgba(124,58,237,.1)',
      border:'rgba(196,181,253,.2)',
    },
    return_after_absence: {
      emoji: '👋',
      title: 'Qué bueno verte de nuevo.',
      msg:   'No empezamos de cero, retomamos desde aquí. Una acción pequeña mantiene vivo el proceso.',
      cta:   'Continuar mi día',
      href:  null,
      color: 'rgba(96,165,250,.08)',
      border:'rgba(96,165,250,.18)',
    },
    log_meal: {
      emoji: '🥗',
      title: 'Podemos empezar con algo simple.',
      msg:   'Registra una comida y Arju organiza el resto.',
      cta:   'Registrar con foto',
      href:  '/pages/nutrition.html?camera=1',
      color: 'rgba(52,211,153,.07)',
      border:'rgba(52,211,153,.18)',
    },
    start_workout: {
      emoji: '🏋️',
      title: 'Tu entreno está listo.',
      msg:   'Solo empieza con el calentamiento. No tiene que ser perfecto.',
      cta:   'Empezar entreno',
      href:  '/pages/workout.html',
      color: 'rgba(250,204,21,.07)',
      border:'rgba(250,204,21,.18)',
    },
    close_day: {
      emoji: '🌙',
      title: '¿Cerramos tu día sin juzgarlo?',
      msg:   'No importa si fue poco. Arju te ayuda a ver qué lograste.',
      cta:   'Cerrar mi día',
      href:  null,
      color: 'rgba(79,70,229,.08)',
      border:'rgba(124,58,237,.2)',
    },
    resume_workout: {
      emoji: '⚡',
      title: 'Ya empezaste. Puedes continuar.',
      msg:   'O marca hoy como suave. Ambas cuentan.',
      cta:   'Continuar entreno',
      href:  '/pages/workout.html',
      color: 'rgba(250,204,21,.07)',
      border:'rgba(250,204,21,.18)',
    },
    trial_low_activity: {
      emoji: '🌱',
      title: 'Todavía puedes probar lo importante.',
      msg:   'Registra una comida o empieza un entreno antes de que termine tu prueba.',
      cta:   'Registrar comida',
      href:  '/pages/nutrition.html',
      color: 'rgba(124,58,237,.08)',
      border:'rgba(196,181,253,.2)',
    },
  };

  // ── Render nudge card in Home ──────────────────────────
  function renderRetentionCard(containerId) {
    const state = getRetentionState();
    const type  = state.nudgeType;
    const container = document.getElementById(containerId);
    if (!container || !type) return;
    if (!canShowNudge(type)) return;

    const nudge = NUDGES[type];
    if (!nudge) return;

    markNudgeShown(type);

    const card = document.createElement('div');
    card.id = 'retention-nudge-card';
    card.style.cssText = 'background:' + nudge.color + ';border:1px solid ' + nudge.border + ';border-radius:16px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px';

    var ctaHtml;
    if (nudge.href) {
      ctaHtml = '<a href="' + nudge.href + '" id="nudge-cta" style="font-size:12px;font-weight:700;color:#c4b5fd;text-decoration:none;white-space:nowrap">' + nudge.cta + ' →</a>';
    } else if (type === 'close_day') {
      ctaHtml = '<button id="nudge-cta" onclick="window.AF_Trial&&window.AF_Trial.openPaywall?null:window.checkEndOfDay&&window.checkEndOfDay(true)" style="font-size:12px;font-weight:700;color:#c4b5fd;background:none;border:none;cursor:pointer;padding:0">' + nudge.cta + ' →</button>';
    } else {
      ctaHtml = '<span style="font-size:12px;font-weight:700;color:#c4b5fd">' + nudge.cta + '</span>';
    }

    card.innerHTML =
      '<div style="font-size:22px;flex-shrink:0">' + nudge.emoji + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:700;color:#f1f0f4;margin-bottom:3px">' + nudge.title + '</div>' +
        '<div style="font-size:12px;color:rgba(240,238,248,.6);line-height:1.5;margin-bottom:8px">' + nudge.msg + '</div>' +
        ctaHtml +
      '</div>' +
      '<button id="nudge-dismiss" style="background:none;border:none;cursor:pointer;padding:2px 4px;color:rgba(255,255,255,.2);font-size:16px;flex-shrink:0">×</button>';

    container.prepend(card);

    // CTA tracking
    var ctaEl = document.getElementById('nudge-cta');
    if (ctaEl) ctaEl.addEventListener('click', function() {
      if (window.AF) AF.track('nudge_clicked', { type });
    });

    // Dismiss
    document.getElementById('nudge-dismiss').addEventListener('click', function() {
      card.remove();
      if (window.AF) AF.track('nudge_dismissed', { type });
      // Extend cooldown on dismiss
      localStorage.setItem('af-nudge-' + type, String(Date.now() + NUDGE_COOLDOWN_MS));
    });

    // Modo regreso — extra block for 2+ day absence
    if (state.lastActiveDaysAgo >= 2 && type === 'return_after_absence') {
      renderModoRegreso(container, state.lastActiveDaysAgo);
    }
  }

  // ── Modo regreso ─────────────────────────────────────
  function renderModoRegreso(container, daysAgo) {
    var msgByDays = daysAgo >= 4
      ? 'No perdiste todo. Solo necesitamos volver con calma.'
      : 'Tu progreso sigue aquí. Retomemos con una acción pequeña.';

    var block = document.createElement('div');
    block.id = 'modo-regreso';
    block.style.cssText = 'background:linear-gradient(135deg,rgba(79,70,229,.12),rgba(124,58,237,.07));border:1px solid rgba(124,58,237,.2);border-radius:18px;padding:18px;margin-bottom:10px';
    block.innerHTML =
      '<div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(196,181,253,.5);margin-bottom:10px">Modo regreso</div>' +
      '<div style="font-size:14px;font-weight:700;color:#f1f0f4;margin-bottom:5px">Volvemos simple.</div>' +
      '<div style="font-size:13px;color:rgba(240,238,248,.6);line-height:1.6;margin-bottom:14px">' + msgByDays + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<a href="/pages/nutrition.html?camera=1" onclick="AF&&AF.track(\'small_action_clicked\',{action:\'meal\'})" style="font-size:12px;font-weight:700;padding:8px 14px;border-radius:12px;background:rgba(52,211,153,.12);color:rgba(110,231,183,.9);text-decoration:none;border:1px solid rgba(52,211,153,.2)">Registrar comida</a>' +
        '<a href="/pages/workout.html" onclick="AF&&AF.track(\'small_action_clicked\',{action:\'workout\'})" style="font-size:12px;font-weight:700;padding:8px 14px;border-radius:12px;background:rgba(250,204,21,.08);color:rgba(250,204,21,.8);text-decoration:none;border:1px solid rgba(250,204,21,.2)">Ver entreno suave</a>' +
        '<a href="/pages/coach.html" onclick="AF&&AF.track(\'small_action_clicked\',{action:\'coach\'})" style="font-size:12px;font-weight:700;padding:8px 14px;border-radius:12px;background:rgba(96,165,250,.08);color:rgba(147,197,253,.8);text-decoration:none;border:1px solid rgba(96,165,250,.15)">Hablar con Arju</a>' +
      '</div>';

    container.prepend(block);
  }

  // ── Update last seen on every load ────────────────────
  updateLastSeen();

  // ── Expose ────────────────────────────────────────────

  // ── Daily limit (max 3 strong nudges per day) ─────────
  function getDailyNudgeCount() {
    var today = (new Date()).toISOString().split('T')[0];
    return parseInt(localStorage.getItem('af-nudge-count-' + today) || '0');
  }
  function incrementDailyNudge() {
    var today = (new Date()).toISOString().split('T')[0];
    var count = getDailyNudgeCount();
    localStorage.setItem('af-nudge-count-' + today, String(count + 1));
  }
  var MAX_DAILY_NUDGES = 3;

  // ── Recipe nudge ─────────────────────────────────────────
  NUDGES.suggest_recipe = {
    emoji: '🍳',
    title: '¿No sabes qué cocinar?',
    msg:   'Te dejo una idea rápida para no improvisar hoy.',
    cta:   'Ver receta rápida',
    href:  '/pages/nutrition.html?tab=recetas',
    color: 'rgba(249,115,22,.07)',
    border:'rgba(249,115,22,.18)',
  };

  // ── Trial-day nudges ──────────────────────────────────────
  function getTrialDayNudge(trialDay) {
    var nudges = {
      1: { emoji:'🌱', title:'Hoy empieza tu prueba.', msg:'Conoce tu día y registra una primera acción.', cta:'Ver mi día', href:null, color:'rgba(124,58,237,.08)', border:'rgba(196,181,253,.2)' },
      3: { emoji:'📊', title:'Ya tienes algunos datos.', msg:'Arju puede ayudarte mejor si registras comida o entreno.', cta:'Registrar comida', href:'/pages/nutrition.html', color:'rgba(52,211,153,.07)', border:'rgba(52,211,153,.18)' },
      6: { emoji:'⏳', title:'Mañana termina tu prueba.', msg:'Revisa lo que ya empezaste. Tu progreso sigue aquí.', cta:'Ver mi progreso', href:'/pages/progress.html', color:'rgba(245,158,11,.08)', border:'rgba(245,158,11,.2)' },
      7: { emoji:'🎉', title:'Terminaste tus 7 días gratis.', msg:'No fue perfección. Fue inicio. Mira lo que ya construiste.', cta:'Ver mi progreso', href:'/pages/progress.html', color:'rgba(250,204,21,.08)', border:'rgba(250,204,21,.2)' },
    };
    return nudges[trialDay] || null;
  }

  // ── getNextBestNotification — priority queue ──────────────
  function getNextBestNotification() {
    if (getDailyNudgeCount() >= MAX_DAILY_NUDGES) return null;

    var state = getRetentionState();
    var h = (new Date()).getHours();

    // Priority order
    var candidates = [];

    // P1: onboarding
    if (!state.lastActiveDaysAgo && !window.AF_Retention._onboardingDone) {
      candidates.push('onboarding_resume');
    }

    // P2: Trial paywall
    if (state.trialDay >= 7 && !localStorage.getItem('af-paid')) {
      candidates.push('trial_conversion');
    }

    // P3: Return after absence
    if (state.lastActiveDaysAgo >= 2 && canShowNudge('return_after_absence')) {
      candidates.push('return_after_absence');
    }

    // P4: Night close (8pm–10:30pm)
    if (h >= 20 && h < 22 && !localStorage.getItem('af-day-closed-' + (new Date()).toISOString().split('T')[0])) {
      if (canShowNudge('close_day')) candidates.push('close_day');
    }

    // P5: Trial day nudge (1, 3, 6, 7)
    if ([1,3,6,7].includes(state.trialDay) && canShowNudge('trial_day_' + state.trialDay)) {
      candidates.push('trial_day_' + state.trialDay);
    }

    // P6: No meal by noon
    if (h >= 12 && !state.hasLoggedMealToday && canShowNudge('log_meal')) {
      candidates.push('log_meal');
    }

    // P7: Workout pending in afternoon
    if (h >= 15 && h < 20 && !state.hasCompletedWorkoutToday && canShowNudge('start_workout')) {
      candidates.push('start_workout');
    }

    // P8: Recipe suggestion
    if (!state.hasLoggedMealToday && canShowNudge('suggest_recipe')) {
      candidates.push('suggest_recipe');
    }

    // Return first valid candidate
    for (var i = 0; i < candidates.length; i++) {
      var type = candidates[i];
      var nudge = NUDGES[type];
      if (!nudge) {
        // Handle trial_day_N types
        var tMatch = type.match(/^trial_day_(\d+)$/);
        if (tMatch) nudge = getTrialDayNudge(parseInt(tMatch[1]));
      }
      if (nudge) return { type, nudge };
    }
    return null;
  }

  // ── Upgrade renderRetentionCard to use getNextBestNotification ──
  function renderSmartNotification(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var best = getNextBestNotification();
    if (!best) return;

    var type = best.type;
    var nudge = best.nudge;

    markNudgeShown(type);
    incrementDailyNudge();

    var card = document.createElement('div');
    card.id = 'smart-nudge-' + type;
    card.style.cssText = 'background:' + nudge.color + ';border:1px solid ' + nudge.border + ';border-radius:16px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px;animation:nudge-in .3s ease';
    if (!document.getElementById('nudge-anim-style')) {
      var s = document.createElement('style');
      s.id = 'nudge-anim-style';
      s.textContent = '@keyframes nudge-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);
    }

    var ctaHtml = nudge.href
      ? '<a href="' + nudge.href + '" id="sn-cta" style="font-size:12px;font-weight:700;color:#c4b5fd;text-decoration:none">' + nudge.cta + ' →</a>'
      : '<button id="sn-cta" style="font-size:12px;font-weight:700;color:#c4b5fd;background:none;border:none;cursor:pointer;padding:0;font-family:Outfit,sans-serif">' + nudge.cta + ' →</button>';

    card.innerHTML =
      '<div style="font-size:22px;flex-shrink:0">' + nudge.emoji + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:700;color:#f1f0f4;margin-bottom:3px">' + nudge.title + '</div>' +
        '<div style="font-size:12px;color:rgba(240,238,248,.6);line-height:1.5;margin-bottom:8px">' + nudge.msg + '</div>' +
        ctaHtml +
      '</div>' +
      '<button id="sn-dismiss" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,.2);font-size:16px;flex-shrink:0;padding:2px 4px">×</button>';

    container.prepend(card);

    var ctaEl = document.getElementById('sn-cta');
    if (ctaEl) ctaEl.addEventListener('click', function() {
      if (window.AF) AF.track('notification_clicked', { type, trialDay: state && state.trialDay });
      // Pass context to coach if routing there
      if (nudge.href && nudge.href.includes('coach')) {
        localStorage.setItem('af-notif-from', type);
      }
    });

    document.getElementById('sn-dismiss').addEventListener('click', function() {
      card.remove();
      if (window.AF) AF.track('notification_dismissed', { type });
      localStorage.setItem('af-nudge-' + type, String(Date.now() + NUDGE_COOLDOWN_MS));
    });

    if (window.AF) AF.track('notification_shown', { type });

    // Modo regreso for 2+ day absence
    if (type === 'return_after_absence') {
      setTimeout(function() { renderModoRegreso(container, state && state.lastActiveDaysAgo || 2); }, 100);
    }
  }

  window.AF_Retention = {
    getState: getRetentionState,
    getNextBestNotification,
    renderSmartNotification,
    renderCard: renderRetentionCard,
    canShowNudge,
    markNudgeShown,
    NUDGES,
  };

})();

// ════════════════════════════════════════════════════════════════
// Retention V2 additions — retention-nudges-inapp-v1
// ════════════════════════════════════════════════════════════════

// ── Additional nudge types ────────────────────────────────────────
(function() {
  var extra = window.AF_Retention;
  if (!extra || !extra.NUDGES) return;
  var N = extra.NUDGES;

  N.recipe_suggestion = {
    emoji:'🍽️', title:'¿No sabes qué comer?',
    msg:'Te dejo una opción simple según tu día.',
    cta:'Ver receta rápida', href:'/pages/nutrition.html?tab=recetas',
    color:'rgba(249,115,22,.08)', border:'rgba(249,115,22,.22)',
  };
  N.trial_day6 = {
    emoji:'⏰', title:'Mañana termina tu prueba gratis',
    msg:'Tu progreso se guarda. Puedes continuar el reto completo por $32 USD.',
    cta:'Ver mi progreso', href:'/pages/progress.html',
    color:'rgba(245,158,11,.08)', border:'rgba(245,158,11,.22)',
  };
  N.trial_expired = {
    emoji:'🔓', title:'Tu prueba terminó',
    msg:'Puedes desbloquear el reto completo por $32 USD y seguir desde donde vas.',
    cta:'Desbloquear reto', href:'/pages/dashboard.html',
    color:'rgba(139,92,246,.1)', border:'rgba(167,139,250,.3)',
  };
  N.payment_required = {
    emoji:'💳', title:'Tu plan personalizado está pendiente',
    msg:'Este plan requiere activación mensual de $72 USD para iniciar.',
    cta:'Pagar y empezar', href:'/pages/custom-plan-intake.html',
    color:'rgba(139,92,246,.1)', border:'rgba(167,139,250,.3)',
  };
  N.progress_reflection = {
    emoji:'✨', title:'Lo que hiciste hoy cuenta',
    msg:'Una acción pequeña mantiene vivo el proceso.',
    cta:'Ver progreso', href:'/pages/progress.html',
    color:'rgba(52,211,153,.07)', border:'rgba(52,211,153,.18)',
  };
})();

// ── getNextNudge (clean V2 API) ───────────────────────────────────
window.getNextNudge = function() {
  var state = window.AF_Retention ? AF_Retention.getState() : null;
  if (!state) return null;
  var productType = localStorage.getItem('af-product-type') || '';
  var subscStatus = localStorage.getItem('af-subscription-status') || '';
  var h = new Date().getHours();
  var isPlan = productType === 'custom_muscle_gain' || productType === 'custom_fat_loss';

  // Determine priority nudge
  var nudgeType = null;

  if (!state.onboardingDone)                      nudgeType = 'onboarding_resume';
  else if (isPlan && subscStatus === 'payment_required') nudgeType = 'payment_required';
  else if (state.absent >= 2)                     nudgeType = 'return_after_absence';
  else if (state.trial >= 8 && !state.isPaid)     nudgeType = 'trial_expired';
  else if (state.trial === 7 && !state.isPaid)    nudgeType = 'trial_day7';
  else if (state.trial === 6 && !state.isPaid)    nudgeType = 'trial_day6';
  else if (!state.mealsDone && h >= 7 && h < 22) nudgeType = 'log_meal';
  else if (!state.workoutStarted && h >= 7 && h < 20) nudgeType = 'start_workout';
  else if (!state.dayClosed && h >= 20)           nudgeType = 'close_day';
  else if (state.mealsDone > 0)                   nudgeType = 'progress_reflection';
  else                                             nudgeType = 'recipe_suggestion';

  if (!nudgeType) return null;
  if (window.AF_Retention && !AF_Retention.canShowNudge(nudgeType)) return null;

  var N = window.AF_Retention ? AF_Retention.NUDGES[nudgeType] : null;
  if (!N) return null;

  return {
    id: nudgeType + '_' + Date.now(),
    type: nudgeType, title: N.title, message: N.msg,
    ctaLabel: N.cta, ctaRoute: N.href || '#',
    emoji: N.emoji, color: N.color, border: N.border,
    priority: ['onboarding_resume','payment_required','return_after_absence','trial_expired'].includes(nudgeType) ? 'high' : 'medium',
    dismissible: !['payment_required','trial_expired'].includes(nudgeType),
  };
};

// ── shouldShowNudge (frequency guard) ────────────────────────────
window.shouldShowNudge = function(nudgeType) {
  return window.AF_Retention ? AF_Retention.canShowNudge(nudgeType) : true;
};

// ── renderNudgeCard (premium NudgeCard component) ─────────────────
window.renderNudgeCard = function(containerId, nudge) {
  nudge = nudge || getNextNudge();
  var container = document.getElementById(containerId);
  if (!container || !nudge) return;

  var existing = container.querySelector('.af-nudge-card');
  if (existing) existing.remove();

  var card = document.createElement('div');
  card.className = 'af-nudge-card';
  card.style.cssText = 'margin:12px 0;padding:16px 18px;background:' + (nudge.color || 'rgba(139,92,246,.08)') + ';border:1.5px solid ' + (nudge.border || 'rgba(167,139,250,.25)') + ';border-radius:18px;position:relative';

  var nType = nudge.type;
  var dismissBtn = '';
  if (nudge.dismissible) {
    var db = document.createElement('button');
    db.textContent = '×';
    db.style.cssText = 'position:absolute;top:10px;right:12px;background:none;border:none;color:rgba(255,255,255,.3);font-size:16px;cursor:pointer;font-family:Outfit,sans-serif';
    db.addEventListener('click', function() {
      card.remove();
      if (window.AF_Retention) AF_Retention.markNudgeShown(nType);
    });
    card.appendChild(db);
  }
  var dismissBtn = '';

  card.innerHTML = dismissBtn +
    '<div style="display:flex;align-items:flex-start;gap:13px">' +
      '<div style="font-size:26px;flex-shrink:0;line-height:1;margin-top:2px">' + (nudge.emoji || '✦') + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:14px;font-weight:700;color:#f5f3ff;margin-bottom:5px;line-height:1.3">' + nudge.title + '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,.5);line-height:1.65;margin-bottom:12px">' + nudge.message + '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<a id="nudge-cta-' + nudge.type + '" href="' + nudge.ctaRoute + '" style="display:inline-flex;align-items:center;padding:9px 16px;background:linear-gradient(135deg,#8b5cf6,#ec4899);border-radius:12px;color:#fff;text-decoration:none;font-family:Outfit,sans-serif;font-size:12px;font-weight:700">' + nudge.ctaLabel + '</a>' +
        '</div>' +
      '</div>' +
    '</div>';

  container.insertBefore(card, container.firstChild);
  // Wire CTA click tracking via event delegation
  var ctaEl = card.querySelector('a');
  if (ctaEl) {
    ctaEl.addEventListener('click', function() {
      if (window.AF) AF.track('nudge_clicked', { type: nudge.type, product: localStorage.getItem('af-product-type') || '' });
      if (window.AF_Retention) AF_Retention.markNudgeShown(nudge.type);
    });
  }
  if (window.AF) AF.track('nudge_viewed', { type: nudge.type, product: localStorage.getItem('af-product-type') || '' });
  if (window.AF_Retention) AF_Retention.markNudgeShown(nudge.type);
};
