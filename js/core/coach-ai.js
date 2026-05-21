// ══════════════════════════════════════════════════
// ArjunaFit — Coach IA Core
// Mensajes contextuales + chat completo con OpenAI
// ══════════════════════════════════════════════════

const AF_Coach = {

  ENDPOINT: '/.netlify/functions/chat',

  // Prompt base del coach
  BASE_SYSTEM: `Eres Arjuna, coach personal de fitness y nutrición de ArjunaFit.
Tu misión: acompañar a mujeres LATAM en su transformación física de forma inteligente, sostenible y humana.

ESTILO:
- Calmado, premium, directo. Nunca genérico.
- Sin motivación tóxica ni presión.
- Sin obsesión con calorías.
- Español colombiano/LATAM natural.
- Máximo 3 oraciones por respuesta en chat rápido.
- Respuestas más largas solo cuando el usuario pregunta algo específico.

FILOSOFÍA:
- La consistencia supera a la perfección.
- Un día perdido no borra lo construido.
- El objetivo es querer volver mañana.
- Acompañar sin juzgar.

NUNCA:
- Decir "¡Tú puedes!" o frases vacías.
- Dar información médica.
- Hablar de dietas extremas o restricciones severas.
- Mencionar conteo obsesivo de calorías.`,

  /**
   * Carga contexto real del usuario desde Supabase
   */
  async _buildContext(userId) {
    try {
      const [profRes, progRes, setsRes, logRes, prRes] = await Promise.all([
        sb.from('profiles').select('*').eq('id', userId).maybeSingle(),
        sb.from('progress').select('day_num, created_at').eq('user_id', userId)
          .order('created_at', { ascending: false }).limit(10),
        sb.from('workout_sets').select('exercise_name, kg, reps_done, created_at').eq('user_id', userId)
          .order('created_at', { ascending: false }).limit(15),
        sb.from('day_logs').select('*').eq('user_id', userId)
          .eq('log_date', new Date().toISOString().split('T')[0]).single(),
        sb.from('personal_records').select('exercise_name, value, achieved_at').eq('user_id', userId)
          .order('achieved_at', { ascending: false }).limit(3)
      ]);

      const p = profRes.data || {};
      const progress = progRes.data || [];
      const sets = setsRes.data || [];
      const todayLog = logRes.data;
      const prs = prRes.data || [];

      // Últimos ejercicios únicos
      const recentExercises = [...new Set(sets.map(s => `${s.exercise_name} (${s.kg}kg)`))].slice(0, 4);

      return {
        nombre: p.nombre || 'amiga',
        objetivo: p.objetivo || 'glúteos y piernas',
        reto: p.reto || 'gluteos',
        peso: p.peso ? `${p.peso}kg` : 'no registrado',
        streakActual: p.streak_current || 0,
        streakMax: p.streak_max || 0,
        diasCompletados: progress.length,
        semanaActual: p.workout_day_num ? Math.ceil(p.workout_day_num / 3) : 1,
        metaCalorias: p.calorias_objetivo || 'no calculada',
        metaProteina: p.proteina_g ? `${p.proteina_g}g` : 'no calculada',
        lesiones: p.injuries?.length ? p.injuries.join(', ') : 'ninguna',
        restricciones: p.food_restrictions?.length ? p.food_restrictions.join(', ') : 'ninguna',
        ejerciciosRecientes: recentExercises.join(' · ') || 'ninguno aún',
        prsRecientes: prs.map(pr => `${pr.exercise_name} ${pr.value}kg`).join(', ') || 'ninguno aún',
        nutricionHoy: todayLog ? `${Math.round(todayLog.calorias_consumidas || 0)} cal, ${Math.round(todayLog.proteina_consumida || 0)}g proteína` : 'no registrada',
        entrenoHoy: todayLog?.workout_completed ? 'sí, completado' : 'pendiente'
      };
    } catch (e) {
      console.warn('Context build error:', e);
      return { nombre: 'amiga', objetivo: 'glúteos', streakActual: 0, diasCompletados: 0 };
    }
  },

  /**
   * Mensaje contextual corto (para dashboard, pre/post entreno)
   * @param {string} userId
   * @param {'dashboard'|'pre_workout'|'post_workout'|'nutrition'|'motivation'} type
   */
  async getQuickMessage(userId, type = 'dashboard') {
    try {
      const ctx = await this._buildContext(userId);

      const hour = new Date().getHours();
      const moment = hour < 12 ? 'mañana' : hour < 18 ? 'tarde' : 'noche';

      const prompts = {
        dashboard: `Es de ${moment}. ${ctx.nombre} abre su app. Racha: ${ctx.streakActual} días. Ha completado ${ctx.diasCompletados} sesiones. Semana ${ctx.semanaActual} del reto. Hoy: ${ctx.entrenoHoy}. 
Da un mensaje de bienvenida personalizado. Cálido, específico, corto. Máximo 2 oraciones. No uses su nombre más de una vez.`,

        pre_workout: `${ctx.nombre} va a entrenar ahora. Racha: ${ctx.streakActual} días. Últimos ejercicios: ${ctx.ejerciciosRecientes}. Lesiones: ${ctx.lesiones}.
Mensaje breve de preparación. Una idea concreta para este entrenamiento. Máximo 2 oraciones.`,

        post_workout: `${ctx.nombre} terminó su entrenamiento. Racha: ${ctx.streakActual} días. PRs recientes: ${ctx.prsRecientes}.
Mensaje de cierre. Celebración calmada y real. Refuerza hábito. Máximo 2 oraciones.`,

        nutrition: `${ctx.nombre}, objetivo: ${ctx.metaCalorias} cal / ${ctx.metaProteina} proteína. Nutrición hoy: ${ctx.nutricionHoy}. Restricciones: ${ctx.restricciones}.
Un tip nutricional práctico para hoy. Alimentos LATAM reales. Máximo 2 oraciones.`,

        motivation: `${ctx.nombre} lleva ${ctx.diasCompletados} días entrenando. Racha máxima: ${ctx.streakMax} días. Objetivo: ${ctx.objetivo}.
Un mensaje de perspectiva. Largo plazo. Sin clichés. Máximo 2 oraciones.`
      };

      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: this.BASE_SYSTEM,
          messages: [{ role: 'user', content: prompts[type] || prompts.dashboard }],
          max_tokens: 150
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() ||
        'La consistencia es el único secreto. Sigue así.';

    } catch (e) {
      console.warn('Quick message error:', e);
      // Fallback messages por tipo
      const fallbacks = {
        dashboard: 'Bienvenida de nuevo. Hoy cuenta.',
        pre_workout: 'Foco en la técnica hoy. El peso viene solo.',
        post_workout: 'Entrenamiento completado. Eso es lo que importa.',
        nutrition: 'Prioriza proteína en cada comida. Simple y efectivo.',
        motivation: 'Los resultados son la suma de los días normales.'
      };
      return fallbacks[type] || fallbacks.dashboard;
    }
  },

  /**
   * Chat completo con historial
   * @param {string} userId
   * @param {string} userMessage
   * @param {Array} history - [{role, content}]
   */
  async chat(userId, userMessage, history = []) {
    const ctx = await this._buildContext(userId);

    const systemWithCtx = `${this.BASE_SYSTEM}

CONTEXTO ACTUAL DE ${ctx.nombre.toUpperCase()}:
• Objetivo: ${ctx.objetivo}
• Reto: ${ctx.reto} | Semana ${ctx.semanaActual}
• Peso: ${ctx.peso}
• Racha: ${ctx.streakActual} días (máximo: ${ctx.streakMax})
• Días completados: ${ctx.diasCompletados}
• Meta calórica: ${ctx.metaCalorias} | Proteína: ${ctx.metaProteina}
• Nutrición hoy: ${ctx.nutricionHoy}
• Ejercicios recientes: ${ctx.ejerciciosRecientes}
• PRs recientes: ${ctx.prsRecientes}
• Lesiones: ${ctx.lesiones}
• Restricciones: ${ctx.restricciones}

Responde siempre desde este contexto. Si algo no está en el contexto, admítelo honestamente.`;

    const messages = [
      ...history.slice(-8), // Últimas 4 interacciones
      { role: 'user', content: userMessage }
    ];

    const response = await fetch(this.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system:        systemWithCtx,
        messages,
        max_tokens:    400,
        mode:          ctx.detectedMode || 'daily_coach',
        product_type:  ctx.productType  || '',
        use_knowledge: true
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) throw new Error('Empty response');

    // Guardar conversación en Supabase (fire and forget)
    sb.from('ai_conversations').insert([
      { user_id: userId, role: 'user', content: userMessage, context: ctx },
      { user_id: userId, role: 'assistant', content: reply, tokens: data.usage?.total_tokens }
    ]).then(() => {}).catch(() => {});

    return reply;
  },

  /**
   * Carga historial de conversación reciente
   */
  async loadHistory(userId, limit = 20) {
    try {
      const { data } = await sb
        .from('ai_conversations')
        .select('role, content, created_at')
        .eq('user_id', userId)
        .in('role', ['user', 'assistant'])
        .order('created_at', { ascending: false })
        .limit(limit);

      return (data || []).reverse().map(m => ({
        role: m.role,
        content: m.content,
        time: m.created_at
      }));
    } catch (e) {
      return [];
    }
  }
};

// ════════════════════════════════════════════════════════════════
// Arju V2 — Context-aware message builder
// ════════════════════════════════════════════════════════════════

// Build a message with full context + return structured response
window.arjuSend = async function(userMessage, mode, ctx) {
  var systemPrompt = window.getArjuSystemPrompt
    ? getArjuSystemPrompt(mode || 'daily_coach', ctx || {})
    : "Eres Arju, coach de ArjunaFit. Responde breve y útil.";

  try {
    var response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, systemPrompt: systemPrompt, mode: mode })
    });
    if (!response.ok) throw new Error('api_error');
    var data = await response.json();
    var message = data.message || data.reply || data.content || '';
    if (window.AF) AF.track('arju_response_generated', { mode: mode, product: ctx?.productType || '' });
    return {
      message:             message,
      suggestedActions:    window.getArjuActions ? getArjuActions(mode) : [],
      mode:                mode,
      shouldShowRecipe:    mode === 'recipe_coach',
      shouldShowWorkout:   mode === 'workout_session',
      shouldShowPaymentCTA: mode === 'trial_conversion' || mode === 'custom_plan_coach',
      shouldCreateSupportTicket: mode === 'support_router',
      tone:                (window.ARJU_MODES && window.ARJU_MODES[mode]) ? window.ARJU_MODES[mode].tone : 'helpful',
    };
  } catch(e) {
    if (window.AF) AF.track('arju_response_failed', { mode: mode, error: e.message });
    var fallback = window.getArjuFallback ? getArjuFallback(mode) : 'Vamos paso a paso.';
    return {
      message:          fallback,
      suggestedActions: window.getArjuActions ? getArjuActions(mode) : [],
      mode:             mode,
      isFallback:       true,
    };
  }
};

// Determine best Arju mode based on context
window.detectArjuMode = function(ctx) {
  if (!ctx) return 'daily_coach';
  var st = ctx.subscriptionStatus;
  var trialDay = parseInt(ctx.trialDay) || 0;
  var daysAbsent = ctx.retentionState?.daysAbsent || 0;

  if (daysAbsent >= 2)             return 'retention_coach';
  if (st === 'payment_required')   return 'custom_plan_coach';
  if (trialDay >= 8)               return 'trial_conversion';
  if (trialDay >= 6)               return 'trial_conversion';
  var hour = new Date().getHours();
  if (hour >= 21)                  return 'night_close';
  return 'daily_coach';
};
