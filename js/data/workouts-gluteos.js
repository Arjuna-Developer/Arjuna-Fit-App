// ══════════════════════════════════════════════════
// ArjunaFit — Reto Glúteos + Piernas
// 8 semanas · 3 días/semana · 24 sesiones totales
// ══════════════════════════════════════════════════

const WORKOUTS_GLUTEOS = {
  id: 'gluteos',
  name: 'Reto Glúteos + Piernas',
  weeks: 8,
  days_per_week: 3,
  total_sessions: 24,

  phases: [
    { weeks: [1,2], id: 'activacion',      name: 'Activación',      color: '#10b981', description: 'Aprende los movimientos. Activa los glúteos.' },
    { weeks: [3,4], id: 'desarrollo',      name: 'Desarrollo',      color: '#7c3aed', description: 'Aumenta las cargas. Técnica perfecta.' },
    { weeks: [5,6], id: 'intensificacion', name: 'Intensificación', color: '#ec4899', description: 'Volumen máximo. Fuerza explosiva.' },
    { weeks: [7,8], id: 'peak',            name: 'Peak',            color: '#f59e0b', description: 'Máxima intensidad. Tus mejores PRs.' }
  ],

  sessions: {
    A: {
      id: 'A',
      name: 'Glúteos · Empuje',
      emoji: '🍑',
      focus: 'Glúteo Mayor',
      color: '#7c3aed',
      warmup: '5 min caminata + activación con banda',
      exercises: [
        {
          name: 'Hip Thrust con Barra',
          muscle: 'Glúteo Mayor',
          sets: 4, reps: '10-12', rest: 90,
          icon: '🏋️',
          cues: ['Aprieta glúteos arriba', 'Pelvis neutra, no hiperextiendas', 'Barbilla al pecho'],
          progression: { w3: '+2.5kg', w5: '+5kg', w7: 'drop set final' }
        },
        {
          name: 'Sentadilla Búlgara',
          muscle: 'Glúteo / Cuádriceps',
          sets: 3, reps: '10 c/l', rest: 75,
          icon: '🦵',
          cues: ['Rodilla trasera cerca del suelo', 'Tronco ligeramente inclinado', 'Empuja con el talón'],
          progression: { w3: '+2.5kg c/l', w5: '+5kg c/l' }
        },
        {
          name: 'Peso Muerto Rumano',
          muscle: 'Glúteo / Isquiotibiales',
          sets: 3, reps: '12', rest: 75,
          icon: '💪',
          cues: ['Bisagra de cadera, no sentadilla', 'Espalda neutra', 'Barra pegada a las piernas'],
          progression: { w3: '+5kg', w5: '+5kg' }
        },
        {
          name: 'Abducción de Cadera (cable/banda)',
          muscle: 'Glúteo Medio',
          sets: 3, reps: '15 c/l', rest: 60,
          icon: '🔥',
          cues: ['Contracción arriba 1 segundo', 'Baja controlado', 'Core firme'],
          progression: { w3: '+banda', w5: '+cable' }
        },
        {
          name: 'Hip Thrust Isométrico',
          muscle: 'Glúteo (resistencia)',
          sets: 2, reps: '30 seg', rest: 45,
          icon: '⏱️',
          cues: ['Mantén posición arriba', 'Respira normal', 'No bajes hasta acabar'],
          isTime: true
        }
      ]
    },

    B: {
      id: 'B',
      name: 'Piernas · Tracción',
      emoji: '💪',
      focus: 'Isquiotibiales / Glúteo Medio',
      color: '#ec4899',
      warmup: '5 min bici + movilidad cadera',
      exercises: [
        {
          name: 'Sentadilla Sumo con Mancuerna',
          muscle: 'Glúteo / Cuádriceps / Aductores',
          sets: 4, reps: '12', rest: 90,
          icon: '🏋️',
          cues: ['Pies más anchos que hombros', 'Rodillas hacia los pies', 'Fondo profundo'],
          progression: { w3: '+5kg', w5: '+5kg' }
        },
        {
          name: 'Curl de Pierna Tumbado',
          muscle: 'Isquiotibiales',
          sets: 3, reps: '12-15', rest: 75,
          icon: '🦵',
          cues: ['Contrae totalmente', 'Baja en 3 segundos', 'No uses inercia'],
          progression: { w3: '+2.5kg', w5: '+2.5kg' }
        },
        {
          name: 'Patada Glúteo en Cable',
          muscle: 'Glúteo Mayor (unilateral)',
          sets: 3, reps: '15 c/l', rest: 60,
          icon: '🔥',
          cues: ['Core firme', 'No arquees lumbar', 'Extensión completa'],
          progression: { w3: '+2.5kg', w5: '+2.5kg' }
        },
        {
          name: 'Step-Up con Mancuernas',
          muscle: 'Glúteo / Cuádriceps',
          sets: 3, reps: '12 c/l', rest: 75,
          icon: '⬆️',
          cues: ['Empuja con el talón del pie arriba', 'No uses el pie de abajo', 'Control total'],
          progression: { w3: '+2.5kg c/l', w5: '+2.5kg c/l' }
        },
        {
          name: 'Glute Bridge con Banda',
          muscle: 'Glúteo Medio / Mayor',
          sets: 3, reps: '20', rest: 45,
          icon: '🍑',
          cues: ['Banda sobre rodillas', 'Empuja rodillas hacia afuera', 'Aprieta arriba'],
          progression: { w5: 'banda más fuerte' }
        }
      ]
    },

    C: {
      id: 'C',
      name: 'Full Lower · Fuerza',
      emoji: '🔥',
      focus: 'Fuerza Completa',
      color: '#f59e0b',
      warmup: '5 min cardio suave + movilidad completa',
      exercises: [
        {
          name: 'Sentadilla con Barra',
          muscle: 'Cuádriceps / Glúteo / Core',
          sets: 4, reps: '8-10', rest: 120,
          icon: '🏋️',
          cues: ['Paralela o más profunda', 'Pecho arriba', 'Rodillas trackean pies'],
          progression: { w3: '+5kg', w5: '+5kg', w7: 'PR week' }
        },
        {
          name: 'Peso Muerto Convencional',
          muscle: 'Glúteo / Isquios / Espalda',
          sets: 3, reps: '8', rest: 120,
          icon: '💪',
          cues: ['Barra pegada al cuerpo', 'Empuja el suelo', 'Extiende cadera arriba'],
          progression: { w3: '+5kg', w5: '+5kg', w7: 'PR week' }
        },
        {
          name: 'Prensa de Pierna (pies altos)',
          muscle: 'Glúteo / Isquios',
          sets: 3, reps: '15', rest: 75,
          icon: '🦵',
          cues: ['Pies altos en la plataforma', 'Profundidad completa', 'Empuja con talones'],
          progression: { w3: '+10kg', w5: '+10kg' }
        },
        {
          name: 'Hip Thrust 1 Pierna',
          muscle: 'Glúteo Unilateral',
          sets: 3, reps: '10 c/l', rest: 60,
          icon: '🍑',
          cues: ['Máxima contracción unilateral', 'Pelvis paralela al suelo', 'Pierna libre flexionada'],
          progression: { w5: '+banda', w7: '+peso' }
        },
        {
          name: 'Calf Raise Bilateral',
          muscle: 'Gemelos / Sóleo',
          sets: 3, reps: '20', rest: 45,
          icon: '⬆️',
          cues: ['Rango completo', 'Pausa arriba 1 segundo', 'Baja lento'],
          progression: { w3: '+peso', w5: '+peso' }
        }
      ]
    }
  },

  // ── Progresión semanal ────────────────────────────
  weekProgression: {
    1: { intensity: 'RPE 6', focus: 'Técnica perfecta', note: 'Aprende cada movimiento. El peso es secundario.' },
    2: { intensity: 'RPE 7', focus: 'Consolidar técnica', note: 'Siente la conexión mente-músculo.' },
    3: { intensity: 'RPE 7-8', focus: 'Aumentar cargas', note: 'Si hiciste todas las reps, sube el peso.' },
    4: { intensity: 'RPE 8', focus: 'Cargas sólidas', note: 'Debe costar. Pero forma perfecta siempre.' },
    5: { intensity: 'RPE 8-9', focus: 'Volumen alto', note: 'Cuerpo en zona de cambio real.' },
    6: { intensity: 'RPE 9', focus: 'Máxima intensidad', note: 'El entrenamiento más duro del reto.' },
    7: { intensity: 'RPE 9', focus: 'PRs', note: 'Semana de records personales. Deja todo.' },
    8: { intensity: 'RPE 7', focus: 'Descarga + cierre', note: 'Volumen 30% menos. Celebra lo logrado.' }
  },

  // ── Funciones helper ──────────────────────────────

  /**
   * Dado el número de sesión completada (0 = ninguna),
   * retorna la siguiente sesión a hacer.
   * @param {number} completedSessions - cuántas sesiones ya completó (0-24)
   * @param {number} weekNum - semana actual (1-8)
   * @returns {object} - sesión completa con metadatos
   */
  getNextSession(completedSessions = 0, weekNum = 1) {
    const nextNum = completedSessions + 1;
    if (nextNum > this.total_sessions) return null; // Reto completado

    const sessionKey = ['A', 'B', 'C'][(completedSessions) % 3];
    const session = this.sessions[sessionKey];
    const phase = this.phases.find(p => p.weeks.includes(weekNum)) || this.phases[0];
    const progression = this.weekProgression[weekNum] || this.weekProgression[1];

    return {
      ...session,
      sessionNum: nextNum,
      weekNum,
      sessionInWeek: (completedSessions % 3) + 1, // 1, 2 o 3
      phase,
      progression,
      estimatedDuration: '45-55 min'
    };
  },

  /**
   * Calcula la semana actual basado en la fecha de inicio del reto
   * @param {string} startDate - ISO date string
   * @returns {number} semana (1-8)
   */
  getCurrentWeek(startDate) {
    if (!startDate) return 1;
    const start = new Date(startDate);
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.min(8, Math.max(1, Math.ceil((diffDays + 1) / 7)));
  },

  getPhaseByWeek(weekNum) {
    return this.phases.find(p => p.weeks.includes(weekNum)) || this.phases[0];
  }
};

// También exportamos para uso en módulos si se necesita
if (typeof module !== 'undefined') module.exports = WORKOUTS_GLUTEOS;
