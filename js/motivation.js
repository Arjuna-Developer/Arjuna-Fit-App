// ── ArjunaFit Motivation System ──
// Psicología: el entrenador aparece en los momentos EXACTOS de abandono

const MOTI_KEY = 'af_moti_seen';

const MOTIVATION = {

  // ── Momentos críticos de abandono (basado en data de retención fitness) ──
  triggers: [

    // DÍA 1 — Miedo a empezar
    {
      id: 'day1_start',
      condition: (days, streak, weekNum) => days === 0,
      emoji: '🏋️',
      title: '¡Tu entrenador está aquí!',
      msg: 'Sé que da un poco de nervios empezar. Es completamente normal. Yo estuve aquí diseñando cada ejercicio pensando en ti. El primer día siempre es el más difícil — y también el más importante. ¡Vamos!',
      freq: 'once',
    },

    // DÍA 7 — Primera semana completa
    {
      id: 'week1_done',
      condition: (days, streak, weekNum) => days === 3 && weekNum === 1,
      emoji: '🎉',
      title: '¡Completaste tu primera semana!',
      msg: 'Eso que sientes en las piernas y los glúteos es músculo que se está formando. Muy pocas personas llegan a donde tú llegaste. La semana 2 es donde empieza la magia.',
      freq: 'once',
    },

    // SEMANA 2-3 — "Valle de la muerte" — no ven cambios
    {
      id: 'valley_week2',
      condition: (days, streak, weekNum) => weekNum === 2 && days >= 3 && days <= 5,
      emoji: '💪',
      title: 'Normal que aún no notes cambios',
      msg: 'En la semana 2-3 el músculo está creciendo POR DENTRO. Los cambios visibles llegan en la semana 3-4. No pares ahora — estás exactamente en el punto donde la mayoría abandona. Tú no eres la mayoría.',
      freq: 'weekly',
    },

    // MITAD DEL RETO — Semana 4
    {
      id: 'halfway',
      condition: (days, streak, weekNum) => weekNum === 4,
      emoji: '🔥',
      title: '¡Estás a la MITAD!',
      msg: '4 semanas completas. Ya eres otra persona. Tómate una foto HOY y compárala con la del inicio — te vas a sorprender. La segunda mitad es donde el cuerpo explota en resultados.',
      freq: 'once',
    },

    // SEMANA 6 — Segundo valle de abandono
    {
      id: 'valley_week6',
      condition: (days, streak, weekNum) => weekNum === 6,
      emoji: '⚡',
      title: 'El momento más difícil y más poderoso',
      msg: 'La semana 6 es donde el 70% abandona. Tú no. Las últimas 2 semanas son las que transforman un cuerpo trabajado en un cuerpo definido. No regalas tu esfuerzo ahora.',
      freq: 'once',
    },

    // RACHA DE 5+ DÍAS
    {
      id: 'streak_5',
      condition: (days, streak, weekNum) => streak >= 5 && streak < 10,
      emoji: '🔥',
      title: `¡${0} días seguidos! 🔥`,
      dynamicTitle: (days, streak) => `¡${streak} entrenamientos seguidos! 🔥`,
      msg: 'Eso es disciplina real. Ese hábito que estás formando vale más que cualquier resultado físico. El cuerpo sigue al hábito.',
      freq: 'once',
    },

    // DÍA DE DESCANSO — ansiedad de no entrenar
    {
      id: 'rest_day',
      condition: (days, streak, weekNum, isRestDay) => isRestDay,
      emoji: '😴',
      title: 'Hoy descansas. Es parte del plan.',
      msg: 'El músculo no crece entrenando — crece descansando. Hoy es tan importante como el día de entrenamiento. Hidratate, come bien, duerme. Mañana vas con todo.',
      freq: 'daily',
    },

    // ÚLTIMA SEMANA
    {
      id: 'final_week',
      condition: (days, streak, weekNum) => weekNum === 8,
      emoji: '🏆',
      title: '¡La semana final! ¡Dalo TODO!',
      msg: 'Llegaste donde muy pocas llegan. Esta semana es tuya. Cada repetición de esta semana es el cierre de 8 semanas de trabajo. Tu cuerpo, tu historia, tu transformación.',
      freq: 'once',
    },
  ],

  // Obtener el mensaje que le corresponde al usuario AHORA
  getForUser(completedDays, weekNum, isRestDay = false) {
    const streak = this.calcStreak(completedDays);
    const seen = this.getSeen();
    const days = completedDays.length;

    for (const t of this.triggers) {
      if (!t.condition(days, streak, weekNum, isRestDay)) continue;

      // Check frequency
      if (t.freq === 'once' && seen.includes(t.id)) continue;
      if (t.freq === 'daily') {
        const lastSeen = localStorage.getItem(`af_moti_last_${t.id}`);
        const today = new Date().toDateString();
        if (lastSeen === today) continue;
        localStorage.setItem(`af_moti_last_${t.id}`, today);
      }
      if (t.freq === 'weekly') {
        const lastSeen = localStorage.getItem(`af_moti_week_${t.id}`);
        if (lastSeen === String(weekNum)) continue;
        localStorage.setItem(`af_moti_week_${t.id}`, weekNum);
      }

      return {
        ...t,
        title: t.dynamicTitle ? t.dynamicTitle(days, streak) : t.title,
      };
    }
    return null;
  },

  markSeen(id) {
    const seen = this.getSeen();
    if (!seen.includes(id)) {
      seen.push(id);
      localStorage.setItem(MOTI_KEY, JSON.stringify(seen));
    }
  },

  getSeen() {
    try { return JSON.parse(localStorage.getItem(MOTI_KEY) || '[]'); } catch { return []; }
  },

  calcStreak(completedDays) {
    // Simplified streak: consecutive training days completed
    return completedDays.length > 0 ? Math.min(completedDays.length, 7) : 0;
  },
};

window.Motivation = MOTIVATION;
