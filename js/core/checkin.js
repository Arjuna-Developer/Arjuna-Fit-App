// ═══════════════════════════════════════════════════════
// ArjunaFit — Daily Check-in + Personalization v1
// Quick daily mini-conversation. Max 30 seconds.
// ═══════════════════════════════════════════════════════
(function() {
  'use strict';

  function localDateStr() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  var TODAY_KEY = 'af-checkin-' + localDateStr();

  function hasCheckedInToday() {
    return !!localStorage.getItem(TODAY_KEY);
  }

  function getCheckinData() {
    try { return JSON.parse(localStorage.getItem(TODAY_KEY) || 'null'); } catch(e) { return null; }
  }

  // ── Day modes ─────────────────────────────────────────
  function assignDayMode(answers) {
    var energy   = answers.energy   || 'normal';
    var willTrain = answers.willTrain || 'yes';
    var need     = answers.need     || '';

    if (energy === 'tired' || energy === 'no_mood') {
      if (willTrain === 'no') return 'nutrition_focus_day';
      return 'soft_day';
    }
    if (energy === 'energized') {
      if (willTrain === 'yes') return 'strong_day';
    }
    if (need === 'recover') return 'recovery_day';
    if (willTrain === 'no')  return 'nutrition_focus_day';
    if (willTrain === 'yes') return 'workout_focus_day';
    return 'normal_day';
  }

  // ── Personalization output ─────────────────────────────
  var MODES = {
    normal_day: {
      label: 'Día normal',
      arjuMsg: 'Hoy vamos paso a paso. Entreno claro y comida simple.',
      workoutTone: 'Control antes que ego. Técnica siempre.',
      nutritionFocus: 'Una comida registrada ya nos da dirección.',
      recipeHint: 'simple',
      intensityAdjust: 0,
    },
    strong_day: {
      label: 'Día con energía',
      arjuMsg: 'Hoy podemos empujar un poco más, sin perder técnica.',
      workoutTone: 'Si la técnica se mantiene, podemos progresar.',
      nutritionFocus: 'Comida alta en proteína para aprovechar el día.',
      recipeHint: 'high_protein',
      intensityAdjust: +1,
    },
    soft_day: {
      label: 'Día suave',
      arjuMsg: 'Hoy no buscamos intensidad. Buscamos mantener el proceso vivo.',
      workoutTone: 'Empecemos solo con el calentamiento. Lo demás se da solo.',
      nutritionFocus: 'Una comida fácil también sostiene el proceso.',
      recipeHint: 'quick',
      intensityAdjust: -1,
    },
    recovery_day: {
      label: 'Día de recuperación',
      arjuMsg: 'Hoy bajamos revoluciones. Recuperar también hace parte del cambio.',
      workoutTone: 'Movilidad y descanso activo. El cuerpo lo agradece.',
      nutritionFocus: 'Proteína y agua. Simple y efectivo.',
      recipeHint: 'light',
      intensityAdjust: -2,
    },
    return_day: {
      label: 'Día de regreso',
      arjuMsg: 'Volver también cuenta. Hoy retomamos con una acción pequeña.',
      workoutTone: 'Hoy solo apareces. Eso ya es suficiente.',
      nutritionFocus: 'Registra algo, lo que sea. Eso ya es información.',
      recipeHint: 'simple',
      intensityAdjust: -1,
    },
    nutrition_focus_day: {
      label: 'Día de nutrición',
      arjuMsg: 'Si hoy no entrenas, igual podemos cuidar tu comida.',
      workoutTone: null,
      nutritionFocus: 'Hoy ganamos desde la comida.',
      recipeHint: 'simple',
      intensityAdjust: 0,
    },
    workout_focus_day: {
      label: 'Día de entreno',
      arjuMsg: 'Tu entreno está listo. Vamos con control.',
      workoutTone: 'Controla la bajada. No corras la repetición.',
      nutritionFocus: 'Pre-entreno: algo de energía 30 min antes.',
      recipeHint: 'energy',
      intensityAdjust: 0,
    },
  };

  function getDailyPersonalization(answers) {
    var mode = assignDayMode(answers || {});
    var config = MODES[mode] || MODES.normal_day;

    var minAction;
    var h = new Date().getHours();
    if (h < 11)       minAction = 'Registrar desayuno';
    else if (h < 15)  minAction = 'Registrar almuerzo';
    else if (h < 19)  minAction = 'Ver entreno de hoy';
    else              minAction = 'Cerrar tu día';

    if (mode === 'nutrition_focus_day') minAction = 'Registrar una comida';
    if (mode === 'soft_day')            minAction = 'Empezar el calentamiento';
    if (mode === 'recovery_day')        minAction = 'Ver receta rápida';

    return {
      dayMode:          mode,
      modeLabel:        config.label,
      arjuMessage:      config.arjuMsg,
      workoutTone:      config.workoutTone,
      nutritionFocus:   config.nutritionFocus,
      recipeHint:       config.recipeHint,
      intensityAdjust:  config.intensityAdjust,
      recommendedAction:minAction,
    };
  }

  // ── Save check-in ──────────────────────────────────────
  async function saveCheckin(answers) {
    var personalization = getDailyPersonalization(answers);
    var data = Object.assign({}, answers, personalization, { date: localDateStr(), ts: Date.now() });
    localStorage.setItem(TODAY_KEY, JSON.stringify(data));

    if (window.AF) AF.track('daily_checkin_completed', { mode: personalization.dayMode });

    try {
      if (!window._sb) return;
      var sess = await window._sb.auth.getSession();
      var uid = sess?.data?.session?.user?.id;
      if (!uid) return;
      await window._sb.from('daily_checkins').upsert({
        user_id: uid, date: localDateStr(),
        energy_level: answers.energy || 'normal',
        will_train: answers.willTrain || 'yes',
        main_need: answers.need || '',
        day_mode: personalization.dayMode,
        recommended_action: personalization.recommendedAction,
        arju_message: personalization.arjuMessage,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,date' });
    } catch(e) {}
  }

  // ── Render check-in card ──────────────────────────────
  function renderCheckinCard(containerId) {
    var h = new Date().getHours();
    var container = document.getElementById(containerId);
    if (!container) return;

    // Night mode (8pm+) — different interaction
    if (h >= 20) return; // handled by EOD banner

    if (hasCheckedInToday()) {
      renderCheckinDone(container);
      return;
    }

    if (window.AF) AF.track('daily_checkin_viewed');

    var card = document.createElement('div');
    card.id = 'checkin-card';
    card.style.cssText = 'background:linear-gradient(135deg,rgba(124,58,237,.1),rgba(79,70,229,.06));border:1px solid rgba(196,181,253,.2);border-radius:18px;padding:18px;margin-bottom:10px';

    card.innerHTML =
      '<div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(196,181,253,.5);margin-bottom:8px">Check-in de hoy</div>' +
      '<div style="font-size:15px;font-weight:700;color:#f1f0f4;margin-bottom:4px">¿Cómo estás hoy?</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:14px">Arju ajusta tu día según cómo vienes.</div>' +
      '<div id="ci-step1">' +
        '<div style="display:flex;flex-wrap:wrap;gap:7px">' +
          '<button class="ci-opt" data-val="energized" style="padding:8px 13px;border-radius:12px;border:1px solid rgba(250,204,21,.25);background:rgba(250,204,21,.08);color:rgba(250,204,21,.8);font-family:Outfit,sans-serif;font-size:12px;font-weight:600;cursor:pointer">⚡ Con energía</button>' +
          '<button class="ci-opt" data-val="normal" style="padding:8px 13px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(240,238,248,.65);font-family:Outfit,sans-serif;font-size:12px;font-weight:600;cursor:pointer">😌 Normal</button>' +
          '<button class="ci-opt" data-val="tired" style="padding:8px 13px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(240,238,248,.65);font-family:Outfit,sans-serif;font-size:12px;font-weight:600;cursor:pointer">😴 Cansada</button>' +
          '<button class="ci-opt" data-val="no_mood" style="padding:8px 13px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(240,238,248,.65);font-family:Outfit,sans-serif;font-size:12px;font-weight:600;cursor:pointer">😶 Sin ganas</button>' +
          '<button class="ci-opt" data-val="stressed" style="padding:8px 13px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(240,238,248,.65);font-family:Outfit,sans-serif;font-size:12px;font-weight:600;cursor:pointer">🫀 Estresada</button>' +
          '<button class="ci-opt" data-val="returning" style="padding:8px 13px;border-radius:12px;border:1px solid rgba(96,165,250,.25);background:rgba(96,165,250,.08);color:rgba(147,197,253,.8);font-family:Outfit,sans-serif;font-size:12px;font-weight:600;cursor:pointer">🔄 Volviendo al ritmo</button>' +
        '</div>' +
      '</div>' +
      '<div id="ci-step2" style="display:none;margin-top:12px">' +
        '<div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:10px">¿Entrenas hoy?</div>' +
        '<div style="display:flex;gap:7px">' +
          '<button class="ci-train" data-val="yes" style="flex:1;padding:8px;border-radius:12px;border:1px solid rgba(52,211,153,.25);background:rgba(52,211,153,.07);color:rgba(52,211,153,.9);font-family:Outfit,sans-serif;font-size:12px;font-weight:700;cursor:pointer">✓ Sí</button>' +
          '<button class="ci-train" data-val="maybe" style="flex:1;padding:8px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(240,238,248,.6);font-family:Outfit,sans-serif;font-size:12px;font-weight:600;cursor:pointer">Tal vez</button>' +
          '<button class="ci-train" data-val="no" style="flex:1;padding:8px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(240,238,248,.6);font-family:Outfit,sans-serif;font-size:12px;font-weight:600;cursor:pointer">No hoy</button>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:10px;text-align:right">' +
        '<button id="ci-skip" style="font-size:11px;color:rgba(255,255,255,.25);background:none;border:none;cursor:pointer;font-family:Outfit,sans-serif">Más tarde</button>' +
      '</div>';

    container.prepend(card);

    // Step 1: energy
    var answers = {};
    card.querySelectorAll('.ci-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        card.querySelectorAll('.ci-opt').forEach(function(b) { b.style.opacity = '.4'; });
        btn.style.opacity = '1';
        answers.energy = btn.dataset.val;
        if (window.AF) AF.track('daily_checkin_started', { energy: answers.energy });
        document.getElementById('ci-step2').style.display = 'block';
      });
    });

    // Step 2: will train → save
    card.querySelectorAll('.ci-train').forEach(function(btn) {
      btn.addEventListener('click', function() {
        answers.willTrain = btn.dataset.val;
        saveCheckin(answers).then(function() {
          renderCheckinDone(container, getDailyPersonalization(answers));
        });
        card.remove();
      });
    });

    // Skip
    document.getElementById('ci-skip').addEventListener('click', function() {
      card.remove();
      if (window.AF) AF.track('daily_checkin_skipped');
    });
  }

  // ── After check-in: show day summary ─────────────────
  function renderCheckinDone(container, personalization) {
    var existing = document.getElementById('checkin-done');
    if (existing) existing.remove();
    if (!personalization) {
      var saved = getCheckinData();
      if (!saved) return;
      personalization = saved;
    }
    var done = document.createElement('div');
    done.id = 'checkin-done';
    done.style.cssText = 'background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.15);border-radius:16px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px';
    done.innerHTML =
      '<div style="font-size:18px;flex-shrink:0">✦</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:11px;font-weight:700;color:rgba(52,211,153,.5);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">' + (personalization.modeLabel || 'Tu día') + '</div>' +
        '<div style="font-size:13px;color:rgba(240,238,248,.75);line-height:1.5">' + (personalization.arjuMessage || 'Hoy vamos paso a paso.') + '</div>' +
        '<div style="margin-top:8px;font-size:12px;color:rgba(52,211,153,.6)">Acción: ' + (personalization.recommendedAction || 'Registrar comida') + '</div>' +
      '</div>';
    container.prepend(done);
    applyDayModeToHome(personalization);
  }

  // ── Apply day mode to dashboard UI ───────────────────
  function applyDayModeToHome(p) {
    if (!p || !p.dayMode) return;

    // Update coachStrip if available
    var coachBubble = document.getElementById('coachBubble');
    if (coachBubble && p.arjuMessage) {
      coachBubble.textContent = p.arjuMessage;
    }

    // Update nutrition focus
    var nutFocusEl = document.getElementById('nutritionFocusToday');
    if (nutFocusEl && p.nutritionFocus) {
      nutFocusEl.textContent = p.nutritionFocus;
    }

    // Store for workout to read
    localStorage.setItem('af-day-intensity', p.intensityAdjust || 0);
    localStorage.setItem('af-day-workout-tone', p.workoutTone || '');
    localStorage.setItem('af-day-mode', p.dayMode || 'normal_day');
  }

  // ── Auto-apply if already checked in ──────────────────
  function initCheckin(containerId) {
    if (hasCheckedInToday()) {
      var saved = getCheckinData();
      if (saved) {
        applyDayModeToHome(saved);
        renderCheckinDone(document.getElementById(containerId), saved);
      }
    } else {
      renderCheckinCard(containerId);
    }
  }

  // ── Expose ─────────────────────────────────────────────
  window.AF_Checkin = {
    hasCheckedIn: hasCheckedInToday,
    getData: getCheckinData,
    getDailyPersonalization,
    saveCheckin,
    renderCheckinCard,
    renderCheckinDone,
    applyDayModeToHome,
    initCheckin,
    MODES,
  };

})();

// ════════════════════════════════════════════════════════════════
// Check-in V2 additions — daily-checkin-adaptive-day-v1
// ════════════════════════════════════════════════════════════════

// ── DAY_MODES aliases for sprint spec ────────────────────────────
window.DAY_MODES = {
  high_energy:    { label:'Con energía',        modeKey:'strong_day',          workoutHint:'normal', recipeHint:'high_protein', arjuMsg:'Buen día para aprovechar la energía, sin perder técnica.' },
  normal_day:     { label:'Día normal',          modeKey:'normal_day',          workoutHint:'normal', recipeHint:'simple',       arjuMsg:'Vamos paso a paso. No necesitamos hacerlo perfecto.' },
  low_energy:     { label:'Cansada',             modeKey:'soft_day',            workoutHint:'soft',   recipeHint:'quick',        arjuMsg:'Hoy vamos suave. Escuchar el cuerpo también es parte del proceso.' },
  low_motivation: { label:'Sin ganas',           modeKey:'soft_day',            workoutHint:'minimal',recipeHint:'quick',        arjuMsg:'No necesitas ganas para hacer algo pequeño. Una acción mantiene vivo el proceso.' },
  stressed:       { label:'Estresada',           modeKey:'recovery_day',        workoutHint:'soft',   recipeHint:'light',        arjuMsg:'Hoy bajamos ruido. No buscamos exigirte más.' },
  returning:      { label:'Volviendo al ritmo',  modeKey:'return_day',          workoutHint:'soft',   recipeHint:'simple',       arjuMsg:'Qué bueno verte de nuevo. No empezamos de cero.' },
};

// Mood → DAY_MODE mapper
window.moodToDayMode = function(mood) {
  var map = { energized:'high_energy', normal:'normal_day', tired:'low_energy', no_mood:'low_motivation', stressed:'stressed', returning:'returning' };
  return map[mood] || 'normal_day';
};

// ── getCheckinState() — clean public API ──────────────────────────
window.getCheckinState = function() {
  if (window.AF_Checkin && AF_Checkin.hasCheckedIn()) {
    var data = AF_Checkin.getData();
    var dayMode = window.moodToDayMode(data.energy || data.mood || 'normal');
    return {
      hasCheckedIn:    true,
      mood:            data.energy || data.mood || 'normal',
      dayMode:         dayMode,
      dayModeConfig:   window.DAY_MODES[dayMode] || window.DAY_MODES.normal_day,
      arjuMsg:         (window.DAY_MODES[dayMode] || window.DAY_MODES.normal_day).arjuMsg,
      personalization: window.AF_Checkin.getDailyPersonalization ? AF_Checkin.getDailyPersonalization(data) : null,
    };
  }
  return { hasCheckedIn: false, dayMode: 'normal_day', dayModeConfig: window.DAY_MODES.normal_day };
};

// ── getRecommendedRecipeByMood ────────────────────────────────────
window.getRecommendedRecipeByMood = function(mood) {
  var recipeMap = {
    energized:  ['arroz-pollo-ensalada', 'pollo-arroz-ensalada', 'carne-papa'],
    normal:     ['huevos-arepa-aguacate', 'arroz-pollo-ensalada', 'lentejas'],
    tired:      ['yogur-banano-avena', 'huevos-aguacate', 'atun-arepa'],
    no_mood:    ['yogur-banano-avena', 'atun-arepa', 'huevos-pericos'],
    stressed:   ['tortilla-vegetales', 'ensalada-pollo-aguacate', 'atun-arepa'],
    returning:  ['huevos-arepa-aguacate', 'yogur-banano-avena', 'atun-arepa'],
  };
  var options = recipeMap[mood] || recipeMap.normal;
  return options[Math.floor(Math.random() * options.length)];
};

// ── Workout hint by day mode ──────────────────────────────────────
window.getWorkoutHintByMode = function(dayMode) {
  var mode = window.DAY_MODES[dayMode];
  if (!mode) return 'normal';
  return mode.workoutHint;
};

// ── Expose getCheckinState in AF_Checkin ──────────────────────────
if (window.AF_Checkin) {
  window.AF_Checkin.getState      = window.getCheckinState;
  window.AF_Checkin.DAY_MODES     = window.DAY_MODES;
  window.AF_Checkin.moodToDayMode = window.moodToDayMode;
  window.AF_Checkin.getRecipeByMood = window.getRecommendedRecipeByMood;
}

// ── Add "Volviendo al ritmo" to the check-in options if not there ─
// (This is handled by the UI already having data-val="returning" — just wire it)
document.addEventListener('DOMContentLoaded', function() {
  var returningBtn = document.querySelector('.ci-opt[data-val="returning"]');
  if (!returningBtn) return;
  // Button exists — wire its styling to match
  returningBtn.style.borderColor = 'rgba(96,165,250,.25)';
  returningBtn.style.background  = 'rgba(96,165,250,.08)';
  returningBtn.style.color       = 'rgba(147,197,253,.8)';
});
