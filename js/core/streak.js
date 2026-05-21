// ══════════════════════════════════════════════════
// ArjunaFit — Streak System
// Calcula, actualiza y muestra la racha de entrenamiento
// ══════════════════════════════════════════════════

const AF_Streak = {

  /**
   * Calcula la racha actual desde la tabla progress
   * @param {string} userId
   * @returns {{ current, max, todayDone, lastWorkoutDate }}
   */
  async calculate(userId) {
    try {
      const { data } = await sb
        .from('progress')
        .select('day_num, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!data?.length) return { current: 0, max: 0, todayDone: false, lastWorkoutDate: null };

      const today     = this._dateStr(new Date());
      const yesterday = this._dateStr(new Date(Date.now() - 864e5));

      // Días calendario únicos con entrenamiento
      const workoutDays = [...new Set(data.map(p => this._dateStr(new Date(p.created_at))))]
        .sort()
        .reverse();

      const todayDone = workoutDays[0] === today;
      const lastWorkoutDate = workoutDays[0] || null;

      // Si el último entrenamiento fue hace más de 2 días → racha rota
      if (lastWorkoutDate !== today && lastWorkoutDate !== yesterday) {
        return { current: 0, max: 0, todayDone: false, lastWorkoutDate };
      }

      // Contar días consecutivos hacia atrás
      let streak = 0;
      let checkDate = todayDone ? today : yesterday;

      for (const day of workoutDays) {
        if (day === checkDate) {
          streak++;
          checkDate = this._dateStr(new Date(new Date(checkDate).getTime() - 864e5));
        } else {
          break;
        }
      }

      return { current: streak, todayDone, lastWorkoutDate };

    } catch (e) {
      console.warn('Streak calc error:', e);
      return { current: 0, max: 0, todayDone: false, lastWorkoutDate: null };
    }
  },

  /**
   * Actualiza streak en profiles y retorna el nuevo max
   */
  async save(userId, streakCurrent) {
    try {
      const { data: prof } = await sb
        .from('profiles')
        .select('streak_max')
        .eq('id', userId)
        .single();

      const newMax = Math.max(streakCurrent, prof?.streak_max || 0);
      const today  = this._dateStr(new Date());

      await sb.from('profiles').update({
        streak_current:    streakCurrent,
        streak_max:        newMax,
        last_workout_date: today
      }).eq('id', userId);

      return newMax;
    } catch (e) {
      console.warn('Streak save error:', e);
    }
  },

  /**
   * Renderiza la racha visualmente (para usar en cualquier página)
   * @param {number} current - días actuales
   * @param {HTMLElement} container - dónde renderizar
   */
  render(current, container) {
    if (!container) return;

    const level = current >= 30 ? 'diamond' :
                  current >= 14 ? 'gold' :
                  current >= 7  ? 'silver' : 'bronze';

    const colors = {
      bronze:  { flame: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
      silver:  { flame: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)' },
      gold:    { flame: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
      diamond: { flame: '#7c3aed', glow: 'rgba(124, 58, 237, 0.4)' }
    };

    const c = colors[level];
    const label = current === 0 ? 'Sin racha' :
                  current === 1 ? '1 día' :
                  `${current} días`;

    container.innerHTML = `
      <div class="streak-widget" style="
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: ${c.glow};
        border: 1px solid ${c.flame}40;
        border-radius: 20px;
        transition: all 0.3s;
      ">
        <span style="
          font-size: 18px;
          filter: drop-shadow(0 0 6px ${c.flame});
          animation: streak-pulse 2s ease-in-out infinite;
        ">${current > 0 ? '🔥' : '❄️'}</span>
        <span style="
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 14px;
          font-weight: 700;
          color: ${c.flame};
          letter-spacing: -0.02em;
        ">${label}</span>
      </div>
      <style>
        @keyframes streak-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      </style>
    `;
  },

  /**
   * Genera los puntos de progreso semanal (7 días)
   * @param {Array} completedDates - fechas completadas esta semana
   * @returns {string} HTML
   */
  renderWeekDots(completedDates = [], container) {
    if (!container) return;

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Lunes

    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const dots = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = this._dateStr(d);
      const isToday = dateStr === this._dateStr(today);
      const isFuture = d > today;
      const isDone = completedDates.includes(dateStr);

      dots.push({ day: days[i], dateStr, isToday, isFuture, isDone });
    }

    container.innerHTML = `
      <div class="week-dots" style="
        display: flex;
        gap: 8px;
        align-items: center;
      ">
        ${dots.map(d => `
          <div class="week-dot" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          ">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              border: 2px solid ${d.isDone ? 'transparent' : d.isToday ? 'var(--primary, #7c3aed)' : 'rgba(255,255,255,0.1)'};
              background: ${d.isDone ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : d.isToday ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)'};
              transition: all 0.3s;
              ${d.isToday ? 'box-shadow: 0 0 12px rgba(124,58,237,0.5);' : ''}
            ">
              ${d.isDone ? '✓' : d.isToday ? '●' : ''}
            </div>
            <span style="
              font-size: 10px;
              font-weight: 600;
              color: ${d.isDone ? 'var(--primary-light, #c4b5fd)' : d.isToday ? 'var(--text-primary, #f1f0f4)' : 'var(--text-muted, #4a4165)'};
              letter-spacing: 0.05em;
            ">${d.day}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  _dateStr(date) {
    return date.toISOString().split('T')[0];
  }
};
