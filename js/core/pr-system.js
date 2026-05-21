// ══════════════════════════════════════════════════
// ArjunaFit — Personal Record System
// Detecta y muestra nuevos PRs automáticamente
// ══════════════════════════════════════════════════

const AF_PR = {

  // Cola de toasts para no solapar
  _queue: [],
  _showing: false,

  /**
   * Verifica si hay nuevo PR al registrar una serie
   * @param {string} userId
   * @param {string} exerciseName
   * @param {number} kg
   * @param {number} reps
   * @param {number} weekNum
   * @param {number} dayNum
   */
  async check(userId, exerciseName, kg, reps, weekNum, dayNum) {
    try {
      // Obtener máximos históricos de semanas anteriores
      const { data: history } = await sb
        .from('exercise_progress')
        .select('max_kg, total_volume')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .lt('week_num', weekNum)
        .order('max_kg', { ascending: false })
        .limit(1);

      const prev = history?.[0];
      const volume = kg * reps;
      const prs = [];

      // PR en peso máximo
      if (kg > 0 && (!prev || kg > (prev.max_kg || 0))) {
        prs.push({
          type: 'max_kg',
          exercise: exerciseName,
          value: kg,
          prev: prev?.max_kg || 0,
          diff: prev ? +(kg - prev.max_kg).toFixed(1) : kg
        });

        // Guardar en DB
        await sb.from('personal_records').insert({
          user_id: userId,
          exercise_name: exerciseName,
          record_type: 'max_kg',
          value: kg,
          prev_value: prev?.max_kg || null,
          week_num: weekNum,
          day_num: dayNum
        });
      }

      // PR en volumen (kg × reps)
      if (volume > 0 && (!prev || volume > (prev.total_volume || 0))) {
        // Solo mostrar toast de volumen si no hay ya PR de peso
        if (prs.length === 0) {
          prs.push({
            type: 'max_volume',
            exercise: exerciseName,
            value: volume,
            prev: prev?.total_volume || 0
          });
        }
      }

      // Mostrar toasts en secuencia
      prs.forEach(pr => this._enqueue(pr));

      return prs;

    } catch (e) {
      console.warn('PR check error:', e);
      return [];
    }
  },

  /**
   * Carga PRs históricos de un ejercicio
   */
  async getHistory(userId, exerciseName) {
    const { data } = await sb
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_name', exerciseName)
      .eq('record_type', 'max_kg')
      .order('achieved_at', { ascending: false })
      .limit(5);
    return data || [];
  },

  /**
   * Retorna todos los PRs del usuario
   */
  async getAll(userId) {
    const { data } = await sb
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('record_type', 'max_kg')
      .order('achieved_at', { ascending: false });
    return data || [];
  },

  // ── Toast visual ────────────────────────────────

  _enqueue(pr) {
    this._queue.push(pr);
    if (!this._showing) this._showNext();
  },

  _showNext() {
    if (this._queue.length === 0) {
      this._showing = false;
      return;
    }

    this._showing = true;
    const pr = this._queue.shift();
    this._renderToast(pr);
  },

  _renderToast(pr) {
    // Remover toast anterior si existe
    document.querySelectorAll('.af-pr-toast').forEach(t => t.remove());

    const msgs = {
      max_kg:     `Nuevo PR en ${pr.exercise}`,
      max_volume: `Volumen récord en ${pr.exercise}`,
      max_reps:   `Récord de reps en ${pr.exercise}`
    };

    const subs = {
      max_kg:     pr.diff > 0 ? `+${pr.diff}kg · ${pr.value}kg total` : `${pr.value}kg`,
      max_volume: `${Math.round(pr.value)}kg total`,
      max_reps:   `${pr.value} reps`
    };

    const toast = document.createElement('div');
    toast.className = 'af-pr-toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="pr-toast-inner">
        <span class="pr-toast-star">✦</span>
        <div class="pr-toast-content">
          <div class="pr-toast-title">${msgs[pr.type]}</div>
          <div class="pr-toast-sub">${subs[pr.type]}</div>
        </div>
      </div>
    `;

    // Inyectar estilos si no existen
    if (!document.getElementById('af-pr-styles')) {
      const style = document.createElement('style');
      style.id = 'af-pr-styles';
      style.textContent = `
        .af-pr-toast {
          position: fixed;
          top: calc(16px + env(safe-area-inset-top));
          left: 50%;
          transform: translateX(-50%) translateY(-80px);
          z-index: 9999;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
          opacity: 0;
          pointer-events: none;
          max-width: 340px;
          width: calc(100% - 32px);
        }
        .af-pr-toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        .pr-toast-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(20, 12, 34, 0.98), rgba(26, 16, 48, 0.98));
          border: 1px solid rgba(251, 191, 36, 0.4);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(251,191,36,0.1);
          backdrop-filter: blur(20px);
        }
        .pr-toast-star {
          font-size: 20px;
          color: #fbbf24;
          filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.8));
          animation: pr-star-spin 2s linear infinite;
          flex-shrink: 0;
        }
        @keyframes pr-star-spin {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .pr-toast-content { flex: 1; min-width: 0; }
        .pr-toast-title {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 13px;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pr-toast-sub {
          font-size: 11px;
          color: rgba(251, 191, 36, 0.6);
          font-weight: 500;
          margin-top: 1px;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
            toast.remove();
            setTimeout(() => this._showNext(), 200);
          }, 350);
        }, 3200);
      });
    });
  }
};
