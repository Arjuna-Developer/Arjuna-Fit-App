// ═══════════════════════════════════════════════════════
// ArjunaFit — Microvictorias
// Respuesta emocional instantánea. Local. Sin OpenAI.
// ═══════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Message pools por evento ─────────────────────────
  const MV = {
    food_desayuno: [
      'Empezaste bien. Una decisión simple también cuenta.',
      'Buen inicio. Tu día ya empezó.',
      'El desayuno es el primer sí del día.',
      'Bien. La constancia empieza por momentos como este.',
    ],
    food_almuerzo: [
      'Buen punto del día. Mantener energía también es progreso.',
      'Almuerzo registrado. Tu cuerpo lo agradece.',
      'A mitad del día y vas bien. Sigue así.',
    ],
    food_cena: [
      'Buen cierre. Hoy avanzaste.',
      'Cena registrada. Tu día sí tuvo nutrición.',
      'Cerraste bien la alimentación. Eso también es entrenamiento.',
    ],
    food_snack: [
      'Snack registrado. Las decisiones pequeñas también suman.',
      'Bien. Mantener energía entre comidas es inteligente.',
    ],
    food_any: [
      'Registrado. Cada comida que anotas es información que te ayuda.',
      'Un paso más en el día.',
    ],
    workout_done: [
      'Tu cuerpo ya recibió estímulo hoy.',
      'Entrenaste. Eso no lo puede quitar nadie.',
      'Sesión completa. El músculo crece mientras descansas.',
      'Ya lo hiciste. La consistencia se construye exactamente así.',
    ],
    return_after_absence: [
      'Volver también cuenta.',
      'Estás aquí. Eso es lo que importa.',
      'Una pausa no borra el progreso. Seguimos.',
    ],
    day_incomplete_night: [
      'Todavía podemos cerrar bien el día.',
      'No fue perfecto, pero seguimos construyendo.',
      'Hoy puedes agregar algo pequeño antes de dormir.',
    ],
    streak_3: [
      '3 días seguidos. Ya estás construyendo algo real.',
    ],
    streak_7: [
      '7 días. Una semana. El hábito ya está instalándose.',
    ],
    pr_achieved: [
      'Nuevo récord. El trabajo se ve.',
      'PR. Eso no fue suerte.',
    ],
    food_logged: [
      'Comida registrada ✓',
      'Ya le diste dirección a tu día.',
      'Un registro. Un paso.',
    ],
    recipe_added: [
      'Receta guardada ✓',
      'Una opción simple también cuenta.',
      'Elegiste bien. Seguimos.',
    ],
    workout_started: [
      'Ya empezaste',
      'El primer paso es el más difícil. Ya lo hiciste.',
      'Ahora solo sigue el primer ejercicio.',
    ],
    workout_completed: [
      'Entrenamiento completado ✓',
      'Hoy apareciste.',
      'Completaste tu sesión. Eso construye resultados.',
    ],
    user_returned: [
      'Volviste',
      'Eso también es progreso.',
      'No empezamos de cero. Ya estás aquí.',
    ],
    restaurant_logged: [
      'Comida fuera registrada ✓',
      'Comer fuera también puede seguir el proceso.',
      'Elegiste con intención. Eso cuenta.',
    ],
    daily_closure: [
      'Día cerrado',
      'Mañana no empiezas de cero.',
      'Cerraste tu día con intención.',
    ],
  };

  let _lastShown = {};

  function pick(key) {
    const pool = MV[key];
    if (!pool?.length) return null;
    const last = _lastShown[key] ?? -1;
    let idx = Math.floor(Math.random() * pool.length);
    if (idx === last && pool.length > 1) idx = (idx + 1) % pool.length;
    _lastShown[key] = idx;
    return pool[idx];
  }

  // ── Show microvictory toast ───────────────────────────
  function show(msg, opts = {}) {
    if (!msg) return;

    // Update coach bubble if on screen
    const bubble = document.getElementById('coachBubble');
    if (bubble) {
      bubble.style.transition = 'opacity .25s';
      bubble.style.opacity = '0';
      setTimeout(() => {
        bubble.textContent = msg;
        bubble.style.opacity = '1';
      }, 200);
    }

    // Toast notification
    const existing = document.getElementById('mv-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.id = 'mv-toast';
    t.style.cssText = `
      position:fixed;
      top:calc(env(safe-area-inset-top,16px) + 12px);
      left:50%;transform:translateX(-50%);
      z-index:450;
      max-width:calc(100vw - 32px);width:340px;
      background:rgba(14,8,26,.97);
      border:1px solid ${opts.color || 'rgba(124,58,237,.4)'};
      border-radius:18px;padding:12px 16px;
      font-family:'Outfit',sans-serif;
      font-size:14px;font-weight:500;
      color:rgba(240,238,248,.9);
      line-height:1.5;
      box-shadow:0 8px 32px rgba(0,0,0,.4),
                 0 0 0 1px ${opts.color || 'rgba(124,58,237,.1)'};
      display:flex;align-items:center;gap:10px;
      animation:mv-in .3s cubic-bezier(.34,1.1,.64,1) both;
    `;

    const style = document.getElementById('mv-style') || (() => {
      const s = document.createElement('style');
      s.id = 'mv-style';
      s.textContent = `@keyframes mv-in{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
      document.head.appendChild(s);
      return s;
    })();

    // ── Icon rendering: evaluate function BEFORE inserting into template ─
    var _mvIcon = (function(){
      try {
        if (opts.icon && window.AF_ICONS && window.AF_ICONS[opts.icon]) {
          return '<span style="width:24px;height:24px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:currentColor;">' + window.AF_ICONS[opts.icon] + '</span>';
        }
      } catch(e) {}
      return '<span style="font-size:20px;flex-shrink:0">' + (opts.emoji || '✨') + '</span>';
    })();
    t.innerHTML = _mvIcon + '<span>' + (msg || '') + '</span>';
    document.body.appendChild(t);

    const dur = opts.dur || 3500;
    setTimeout(() => {
      t.style.transition = 'opacity .3s';
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }, dur);
  }

  // ── Public triggers ───────────────────────────────────
  function onFoodLogged(mealType) {
    const key = `food_${mealType?.toLowerCase()}` in MV
      ? `food_${mealType?.toLowerCase()}`
      : 'food_any';
    const msg = pick(key) || pick('food_any');
    show(msg, { emoji: '🥗', icon: 'nutrition', color: 'rgba(34,197,94,.35)' });
  }

  function onWorkoutDone() {
    show(pick('workout_done'), { emoji: '💪', icon: 'workout', color: 'rgba(250,204,21,.35)', dur: 4000 });
  }

  function onReturn(daysSince) {
    if (daysSince >= 2) {
      show(pick('return_after_absence'), { emoji: '🔄', icon: 'progress', color: 'rgba(96,165,250,.35)' });
    }
  }

  function onDayIncompleteNight() {
    const h = new Date().getHours();
    if (h >= 20) {
      show(pick('day_incomplete_night'), { emoji: '🌙', icon: 'dayClose', color: 'rgba(124,58,237,.35)', dur: 5000 });
    }
  }

  function onStreak(n) {
    const key = n >= 7 ? 'streak_7' : n >= 3 ? 'streak_3' : null;
    if (key) show(pick(key), { emoji: '🔥', icon: 'streak', color: 'rgba(245,158,11,.35)', dur: 4000 });
  }

  function onPR(exercise, weight) {
    show(pick('pr_achieved'), { emoji: '🏆', icon: 'badgeReto', color: 'rgba(250,204,21,.45)', dur: 4500 });
  }

  // ── Day 1 + retention events ─────────────────────────
  function onFirstMealLogged() {
    show(pick(['Buen inicio. Tu día ya empezó.',
               'Primera comida del día. Eso también construye.',
               'Una comida registrada ya nos da dirección.']),
         { emoji:'🌱', color:'rgba(52,211,153,.3)', dur:3500 });
  }

  function onSmallActionCompleted(action) {
    var msgs = {
      meal:    'Una comida registrada ya nos da dirección.',
      recipe:  'Ya tienes una decisión menos que pensar hoy.',
      workout: 'Empezar ya cuenta.',
      manual:  'Perfecto. Eso también registra.',
    };
    show(msgs[action] || 'Una acción pequeña mantiene vivo el proceso.',
         { emoji:'✦', color:'rgba(52,211,153,.25)', dur:3000 });
  }

  function onDayRecovered() {
    show(pick(['Hoy retomaste. Eso vale mucho.',
               'No fue perfecto, pero seguimos construyendo.',
               'Un día de regreso es un día que cuenta.']),
         { emoji:'🔄', color:'rgba(96,165,250,.3)', dur:4000 });
  }

  function onMissedDayReframed() {
    show(pick(['No fue perfecto, pero seguimos.',
               'Ayer no importa. Lo que hagamos hoy, sí.',
               'El proceso no se dañó. Seguimos desde aquí.']),
         { emoji:'🌅', color:'rgba(124,58,237,.25)', dur:4000 });
  }

  // ── Expose globally ───────────────────────────────────
  window.MV = { show, onFoodLogged, onWorkoutDone, onReturn, onDayIncompleteNight, onStreak, onPR, onFirstMealLogged, onSmallActionCompleted, onDayRecovered, onMissedDayReframed };

  console.log('[MV] Microvictorias ready');
})();
