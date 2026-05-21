
// ── Official Arju modes ───────────────────────────────
const ARJU_MODES = {
  daily_coach:       { label:'Daily coach',       tone:'guía general del día, breve y motivador' },
  nutrition_coach:   { label:'Nutrición',         tone:'comida, macros, recetas, registro. Sin presión.' },
  workout_session:   { label:'Sesión de entreno', tone:'técnica, calentamiento, series. Muy breve.' },
  progression_coach: { label:'Progresión',        tone:'subir peso, repetir o ir suave. Tono seguro.' },
  night_close:       { label:'Cierre del día',    tone:'cierre emocional, sin juicio, preparar mañana.' },
  retention_coach:   { label:'Retención',         tone:'regreso sin culpa, acción mínima.' },
  trial_conversion:  { label:'Trial',             tone:'valor del reto, próximo paso, sin presión.' },
  onboarding_coach:  { label:'Onboarding',        tone:'primer día, expectativas claras, bienvenida.' },
};

// ═══════════════════════════════════════════════════════
// ArjunaFit — Coach Context System
// Capa 1: Respuestas locales instantáneas (80–90% de casos)
// Sin OpenAI. Sin latencia. Sin costo.
// ═══════════════════════════════════════════════════════
(function () {
  'use strict';

  const POOLS = {
    morning_nowork: [
      (c) => `Buenos días${c.name?', '+c.name:''}. ${c.sessionName?'Tu sesión está lista.':'Día de recuperación.'}`,
      (c) => `Buenas buenas. ${c.streak>1?c.streak+' días seguidos. ':''}¿Cómo amaneciste?`,
      ()  => `La constancia que estás construyendo se nota. Buenos días.`,
      (c) => `${c.sessionName?'Tu sesión de hoy: '+c.sessionName+'.':'Hoy descansas.'} Un día a la vez.`,
    ],
    afternoon_nowork: [
      ()  => `Buenas. ¿Cómo va el día?`,
      (c) => `${c.sessionName?'Tu sesión te espera cuando quieras.':'Hoy toca descansar y recuperar.'}`,
      (c) => `${c.proteinPct<50?'Recuerda sumar proteína en tu próxima comida.':'Vas bien con la alimentación hoy.'}`,
      ()  => `Sin prisa. Paso a paso siempre funciona.`,
    ],
    returning_short: [
      (c) => `De vuelta. ${c.daysSince===1?'Ayer fue ayer.':c.daysSince+' días después.'} Seguimos.`,
      ()  => `El cuerpo recupera más rápido de lo que crees. ¿Continuamos?`,
      ()  => `Una pausa no rompe el progreso. Lo que importa es volver.`,
      (c) => `${c.name?c.name+', b':'B'}ienvenido de vuelta. Tu progreso te espera.`,
    ],
    returning_long: [
      ()  => `Semanas después, estás de vuelta. Eso es lo que importa.`,
      ()  => `El hábito no desaparece. Solo necesita retomarse. Empecemos despacio.`,
      ()  => `Sin juzgar el tiempo. Hoy cuenta como día uno — mejor que ninguno.`,
    ],
    food_first: [
      (c) => `${c.mealName||'Comida'} registrada. Buen comienzo.`,
      ()  => `Primera comida del día anotada. Seguimos así.`,
      (c) => `${c.foodName?c.foodName+'. Buena elección para empezar.':'Buen inicio de día.'}`,
    ],
    food_logged: [
      (c) => `Registrado. ${c.proteinPct<60?'Recuerda incluir proteína en la próxima.':''}`,
      ()  => `Registrar lo que comes es el primer paso para entenderlo.`,
      (c) => `Llevas ${c.mealsToday} comidas hoy. ${c.calPct<40?'Aún tienes espacio calórico.':c.calPct>90?'Ya casi completas tu meta.':'Vas bien.'}`,
    ],
    protein_goal_met: [
      ()  => `Meta de proteína cubierta hoy. Eso ayuda directamente a la recuperación.`,
      (c) => `${c.proteinG}g de proteína. Tu cuerpo lo va a aprovechar bien.`,
      ()  => `Proteína cubierta. El trabajo del gym tiene más impacto cuando comes así.`,
    ],
    protein_low_eod: [
      ()  => `Hoy quedamos cortos en proteína. Mañana lo equilibramos sin drama.`,
      (c) => `${c.proteinG}g de proteína hoy. El objetivo es ${c.proteinGoal}g. Sin presión, mañana sumamos.`,
    ],
    calories_low_eod: [
      ()  => `Ayer quedaste corto en calorías. Hoy podemos equilibrarlo sin compensar de golpe.`,
      ()  => `Comer poco no siempre ayuda. Tu cuerpo necesita combustible para rendir.`,
    ],
    workout_done: [
      (c) => `Sesión completa. ${c.volume?c.volume+'kg de volumen hoy. ':''}Buen trabajo.`,
      (c) => `${c.exercises} ejercicios. ${c.sets} series. Ya lo hiciste.`,
      ()  => `El músculo crece mientras descansas. La sesión de hoy fue real.`,
      (c) => `${c.prAchieved?'Nuevo PR. ':''}Hoy fuiste consistente.`,
    ],
    streak_3:  [ () => `3 días seguidos. Ya estás construyendo algo real.` ],
    streak_7:  [ (c) => `7 días de racha. ${c.streak>7?c.streak+' días. ':''} El hábito ya está instalándose.` ],
    streak_14: [ () => `14 días. Dos semanas sin parar. El progreso no es accidente.` ],
    streak_21: [ () => `21 días. La ciencia dice que el hábito ya es automático.` ],
    streak_30: [ () => `Un mes completo. Eso es carácter, no suerte.` ],
    pr_achieved: [
      (c) => `Nuevo récord en ${c.exercise||'ese ejercicio'}. ${c.weight?c.weight+'kg. ':''}Eso no fue casualidad.`,
      ()  => `Nuevo PR. El progreso es silencioso hasta que no lo es.`,
    ],
    day_close: [
      (c) => `Buen día hoy. ${c.workoutDone?'Entrenaste. ':''}${c.mealsLogged?'Comiste bien. ':''}Mañana seguimos.`,
      ()  => `Descansa y deja que el cuerpo procese. Hoy fue real.`,
    ],
    calories_over: [
      ()  => `Hoy superaste la meta calórica. Sin drama. El cuerpo se regula solo mañana.`,
      ()  => `Una comida no define nada. Lo que importa es el patrón de la semana.`,
    ],
    nutrition_suggest: [
      (c) => `Te faltan aprox ${c.proteinRemaining}g de proteína. ${c.suggestion||'Una comida proteica lo resuelve.'}`,
      ()  => `Proteína en la próxima comida. Es lo más importante hoy.`,
    ],
  };

  // ── Pick avoiding last used ───────────────────────────
  function pick(key, ctx) {
    const pool = POOLS[key];
    if (!pool?.length) return null;
    const lk = `af-coach-last-${key}`;
    const last = parseInt(localStorage.getItem(lk)||'-1');
    let idx = Math.floor(Math.random()*pool.length);
    if (idx===last && pool.length>1) idx=(idx+1)%pool.length;
    localStorage.setItem(lk, idx);
    try { return pool[idx](ctx||{}); } catch(e) { return pool[0](ctx||{}); }
  }

  // ── Build context from today's state ─────────────────
  
// ── getArjuContext — comprehensive context for Arju ────
function getArjuContext() {
  var today = (function() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  })();

  // User basics
  var userName     = localStorage.getItem('af-user-name') || '';
  var reto         = localStorage.getItem('af-selected-reto') || '';
  var productType  = localStorage.getItem('af-product-type') || 'challenge_glutes';
  var retoName     = reto === 'pancita' ? 'Reto para bajar la pancita'
                   : reto === 'masa'    ? 'Aumento de masa muscular'
                   : reto === 'definicion' ? 'Reducción de % graso'
                   : 'Reto de glúteos';
  var trialStart   = parseInt(localStorage.getItem('af-trial-start') || '0');
  var trialDay     = trialStart ? Math.min(7, Math.floor((Date.now() - trialStart) / 86400000) + 1) : 0;
  var trialDaysLeft = trialStart ? Math.max(0, 7 - Math.floor((Date.now() - trialStart) / 86400000)) : 0;
  var isPaid       = localStorage.getItem('af-paid') === '1';

  // Today's nutrition
  var foods        = [];
  try { foods = JSON.parse(localStorage.getItem('af-food-' + today) || '[]'); } catch(e) {}
  var mealsCount   = foods.length;
  var totCal       = foods.reduce(function(s,f){return s+(f.cal||0);}, 0);
  var totProt      = foods.reduce(function(s,f){return s+(f.prot||0);}, 0);

  // Today's workout
  var workoutStarted   = !!localStorage.getItem('af-workout-started');
  var workoutCompleted = !!localStorage.getItem('af-workout-completed');
  var dayMode          = localStorage.getItem('af-day-mode') || 'normal_day';

  // Check-in
  var checkin = null;
  try { checkin = JSON.parse(localStorage.getItem('af-checkin-' + today) || 'null'); } catch(e) {}

  // Retention
  var lastSeen   = parseInt(localStorage.getItem('af-last-seen') || '0');
  var daysAbsent = lastSeen ? Math.max(0, Math.floor((Date.now() - lastSeen) / 86400000)) : 0;

  // Onboarding data
  var trainingLevel    = localStorage.getItem('af-training-level') || '';
  var trainingLocation = localStorage.getItem('af-training-location') || '';
  var constraint       = localStorage.getItem('af-constraint') || '';
  var nutriChallenge   = localStorage.getItem('af-nutrition-challenge') || '';

  // Build concise summary for prompt
  var summaryParts = [];
  summaryParts.push((userName ? 'Usuario: ' + userName + '. ' : '') + 'Reto: ' + retoName + '.');
  if (trialDay) summaryParts.push('Día ' + trialDay + ' de trial (' + trialDaysLeft + ' días restantes).');
  if (daysAbsent >= 2) summaryParts.push('Estuvo ' + daysAbsent + ' días sin entrar — modo regreso.');
  if (checkin) summaryParts.push('Check-in hoy: energía=' + (checkin.energy || 'no indicado') + ', entrena=' + (checkin.willTrain || 'no indicado') + '.');
  if (mealsCount === 0) summaryParts.push('No ha registrado comida hoy.');
  else summaryParts.push(mealsCount + ' comida' + (mealsCount>1?'s':'') + ' registrada' + (mealsCount>1?'s':'') + ' (' + Math.round(totProt) + 'g prot, ' + Math.round(totCal) + ' kcal).');
  if (!workoutStarted) summaryParts.push('No ha iniciado entrenamiento hoy.');
  else if (workoutCompleted) summaryParts.push('Entrenamiento completado hoy.');
  else summaryParts.push('Entrenamiento iniciado pero no completado.');
  if (constraint && constraint !== 'ninguna') summaryParts.push('Cuidado físico: ' + constraint + '.');
  if (nutriChallenge) summaryParts.push('Dificultad comida: ' + nutriChallenge + '.');

  // Structured fields for arju-prompts.js
  var subscriptionStatus = localStorage.getItem('af-subscription-status') || (isPaid ? 'active' : trialDay > 0 ? 'trialing' : 'payment_required');
  var accessLevel        = localStorage.getItem('af-access-level') || (isPaid ? 'full' : 'trial');
  var challengeDay       = parseInt(localStorage.getItem('af-challenge-day') || trialDay) || 0;

  return {
    userName, reto, retoName, productType, trialDay, trialDaysLeft, isPaid,
    mealsCount, totCal, totProt, workoutStarted, workoutCompleted,
    checkin, daysAbsent, trainingLevel, trainingLocation, constraint, nutriChallenge,
    dayMode,
    // ── V2 fields for arju-prompts.js ──────────────────────
    subscriptionStatus,
    accessLevel,
    challengeDay,
    nutritionToday: { count: mealsCount, calories: totCal, protein: totProt },
    workoutToday:   { started: workoutStarted, completed: workoutCompleted },
    retentionState: { daysAbsent: daysAbsent },
    paymentStatus:  isPaid ? 'approved' : subscriptionStatus === 'payment_required' ? 'payment_required' : 'unknown',
    contextSummary: summaryParts.join(' '),
    // Check-in context
    checkinState:   window.getCheckinState ? getCheckinState() : { hasCheckedIn: false, dayMode: 'normal_day' }
  };
}

// ── Prompt base ────────────────────────────────────────
function getArjuSystemPrompt(ctx) {
  ctx = ctx || getArjuContext();
  return 'Eres Arju, el coach IA de ArjunaFit. Respondes en español, con tono humano, breve, cálido y claro. ' +
    'Máximo 3 oraciones por respuesta, a menos que el usuario pida más. ' +
    'No presionas, no juzgas y no usas toxic fitness. Nunca dices "Como IA", "Según tus datos", "Procede a", "Optimiza tu rendimiento" ni "modo bestia". ' +
    'Siempre priorizas seguridad, técnica, constancia y una acción simple para hoy. ' +
    'Contexto del usuario: ' + ctx.contextSummary;
}

function buildCtx(extra) {
    const today = new Date().toISOString().split('T')[0];
    const foods = JSON.parse(localStorage.getItem(`af-food-${today}`)||'[]');
    const GOALS = { cal:2000, prot:120, carbs:200, fat:55 };
    const totCal  = foods.reduce((s,f)=>s+(f.cal||0),0);
    const totProt = foods.reduce((s,f)=>s+(f.prot||0),0);
    const streak  = parseInt(localStorage.getItem('af-streak')||'0');
    const lastSeen= parseInt(localStorage.getItem('af-last-seen')||'0');
    const daysSince= lastSeen ? Math.floor((Date.now()-lastSeen)/(1000*60*60*24)) : 0;
    localStorage.setItem('af-last-seen', Date.now());
    const dayNames=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    return {
      totCal, totProt,
      calPct:           Math.round((totCal/GOALS.cal)*100),
      proteinPct:       Math.round((totProt/GOALS.prot)*100),
      proteinG:         Math.round(totProt),
      proteinGoal:      GOALS.prot,
      proteinRemaining: Math.max(0,Math.round(GOALS.prot-totProt)),
      mealsToday:       foods.length,
      streak, daysSince,
      hour:   new Date().getHours(),
      dayName:dayNames[new Date().getDay()],
      ...extra
    };
  }

  // ── Get message for event ─────────────────────────────
  function getMessage(event, extra) {
    const ctx = buildCtx(extra);
    const h   = ctx.hour;
    switch(event) {
      case 'app_open':
        if (ctx.daysSince>=7)  return pick('returning_long', ctx);
        if (ctx.daysSince>=2)  return pick('returning_short', ctx);
        if (h>=6 && h<12)      return pick('morning_nowork', ctx);
        return pick('afternoon_nowork', ctx);
      case 'food_logged':
        if (ctx.proteinPct>=90)return pick('protein_goal_met', ctx);
        if (ctx.calPct>105)    return pick('calories_over', ctx);
        return ctx.mealsToday<=1 ? pick('food_first',ctx) : pick('food_logged',ctx);
      case 'protein_goal_met': return pick('protein_goal_met', ctx);
      case 'calories_over':    return pick('calories_over', ctx);
      case 'workout_done':     return pick('workout_done', ctx);
      case 'day_close':        return pick('day_close', ctx);
      case 'pr_achieved':      return pick('pr_achieved', ctx);
      case 'nutrition_suggest':return pick('nutrition_suggest', ctx);
      case 'streak_milestone':
        if (ctx.streak>=30) return pick('streak_30',ctx);
        if (ctx.streak>=21) return pick('streak_21',ctx);
        if (ctx.streak>=14) return pick('streak_14',ctx);
        if (ctx.streak>=7)  return pick('streak_7',ctx);
        if (ctx.streak>=3)  return pick('streak_3',ctx);
        return null;
      default: return null;
    }
  }

  // ── Show on page ──────────────────────────────────────
  function show(event, extra, targetEl) {
    const msg = getMessage(event, extra);
    if (!msg) return null;
    const targets = [
      document.getElementById('coachBubble'),
      document.getElementById('nutriTip'),
      document.getElementById('coachGreeting'),
      document.getElementById('coachMsg'),
      targetEl,
    ].filter(Boolean);
    targets.forEach(el => {
      const prev = el.textContent;
      if (prev === msg) return;
      el.style.transition='opacity .3s ease';
      el.style.opacity='0';
      setTimeout(()=>{el.textContent=msg;el.style.opacity='1';},150);
    });
    console.log(`[Coach] ${event}: "${msg}"`);
    return msg;
  }

  // ── Auto-greet ────────────────────────────────────────
  function autoGreet(name, sessionName) {
    return show('app_open', {name, sessionName});
  }

  // ── After food logged (call from saveFood) ────────────
  function afterFoodLogged(foodName, mealName) {
    return show('food_logged', {foodName, mealName: mealName||'Comida'});
  }

  // ── After workout ─────────────────────────────────────
  function afterWorkout(volume, exercises, sets, prAchieved) {
    return show('workout_done', {volume, exercises, sets, prAchieved});
  }

  // ── Check streak milestone ────────────────────────────
  function checkStreak(streak) {
    const milestones = [3,7,14,21,30];
    if (milestones.includes(streak)) return show('streak_milestone', {streak});
    return null;
  }

  // ── Expose ────────────────────────────────────────────
  // ── Retention coach responses ─────────────────────────
const RETENTION_COACH = [
  'Hoy no venimos a castigarnos. Venimos a retomar.',
  'Tu proceso no se dañó por un día difícil.',
  'Una comida registrada ya nos da dirección.',
  'Volver después de parar también es una habilidad.',
  'No busquemos recuperar todo hoy. Hagamos lo posible.',
  'El proceso sigue activo. Solo necesita una acción.',
  'No perdiste el hábito. Solo pausaste.',
  'Hoy hacemos lo posible, no lo perfecto.',
];

function getRetentionResponse() {
  return RETENTION_COACH[Math.floor(Math.random() * RETENTION_COACH.length)];
}

window.CoachCtx = {
  getRetentionResponse,
  getArjuContext,
  getArjuSystemPrompt, getMessage, show, autoGreet, afterFoodLogged, afterWorkout, checkStreak, buildCtx };
  console.log('[CoachCtx] Ready');
})();
