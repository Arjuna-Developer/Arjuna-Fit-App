// ═══════════════════════════════════════════════════
// ARJUNA — Voice & Personality System
// Centralizado para preparar voice cloning futuro.
// Toda la copia del coach vive aquí.
//
// Futuro: cada mensaje tendrá audioUrl o elevenLabsVoiceId.
// Por ahora: text-only, fallback a Web Speech API.
// ═══════════════════════════════════════════════════
(function () {
  'use strict';

  const Voice = {

    // ── Configuración de voz (para TTS y futuro voice cloning) ──
    config: {
      lang: 'es-MX',
      rate: 0.94,
      pitch: 1.0,
      volume: 1.0,
      // Futuro:
      // elevenLabsVoiceId: 'arjuna-voice-id',
      // audioBaseUrl: '/audio/arjuna/',
    },

    // ── DASHBOARD GREETINGS ──────────────────────────
    greet: {
      morning: [
        n => `Buenas buenas, ${n} 👋`,
        n => `Hey ${n}. ¿Cómo te sientes hoy?`,
        (n,_,_2,t) => `${n}, hoy toca ${t}. Sin prisa.`,
        n => `Hola hola, ${n}. ¿Qué tal tu día?`,
      ],
      afternoon: [
        n => `Buenas, ${n}. Tu sesión está lista cuando quieras.`,
        (n,_,s) => s>1 ? `${n}, ${s} días seguidos. Vas bien.` : `${n}, ¿lista para hoy?`,
        n => `Hey ${n}. Aún tenemos tiempo de hacer algo bueno hoy.`,
      ],
      night: [
        n => `Buenas noches, ${n}. Si vas a entrenar, hazlo con calidad.`,
        n => `${n}, si tienes energía hoy, vamos. Si no, mañana es buen día.`,
      ],
      done: [
        n => `Buen trabajo hoy, ${n}.`,
        (n,_,s) => s>1 ? `${n}, ${s} días seguidos. Eso ya es hábito.` : `Hoy lo cumpliste, ${n}.`,
        n => `${n}, hoy avanzaste un paso más.`,
        () => `La consistencia gana. Hoy ganaste.`,
      ],
    },

    // ── WORKOUT WELCOME ──────────────────────────────
    workoutWelcome: {
      phrases: [
        n => `Buenas buenas, ${n}.`,
        n => `Aquí estamos, ${n}.`,
        n => `Hey ${n}.`,
        n => `Listas, ${n}.`,
      ],
      messages: [
        (count) => `Hoy son ${count} ejercicios. Vamos paso a paso.`,
        (_, wk) => `Semana ${wk} del reto. Calidad sobre cantidad.`,
        () => `Empezamos con calentamiento. Respira y siente.`,
        () => `Tu cuerpo, tu ritmo. Estoy contigo.`,
      ],
    },

    // ── PHASE TIPS ────────────────────────────────────
    phaseTips: {
      warmup:    'Despertando el cuerpo. Sin prisa, sin pausa.',
      mobility:  'Respira en cada movimiento. La movilidad no se fuerza.',
      activation:'Aquí empieza la magia. Siente el músculo que vas a trabajar.',
      main: [
        'Controla la bajada. Ahí está la mitad del resultado.',
        'Cada repetición importa. No las cuentes — siéntelas.',
        'Si puedes hablar normal, sube la intensidad un poquito.',
        'Una pausa de 1 segundo arriba hace la diferencia.',
        'No es el peso. Es la conexión con el músculo.',
      ],
      cooldown: 'Lo más importante: ya lo hiciste. Este bloque cierra el círculo.',
    },

    // ── CLOSURE MESSAGES ──────────────────────────────
    closure: [
      (s, v) => s>6 ? `${s} días seguidos. Eso ya es un hábito real.`
                    : v>0 ? `${v}kg movidos hoy. Cada serie fue una decisión correcta.`
                    : `Hoy apareciste. Eso es suficiente.`,
      s => s>1 ? `${s} días consecutivos. La consistencia gana siempre.`
              : `Primer paso dado. El segundo es mañana.`,
      () => `El cuerpo crece descansando. Hoy lo ganaste.`,
      s => s>3 ? `Llevas ${s} días siendo fiel a ti misma. Eso no se improvisa.`
              : `Hoy avanzaste un paso más. Mañana otro.`,
      () => `Buen trabajo hoy.`,
    ],

    // ── NUTRITION COMPANIONSHIP ───────────────────────
    nutrition: {
      tips: [
        'Hoy podemos sumar un poco más de proteína. Sin presión.',
        'Una comida a la vez. Vamos bastante bien.',
        'Agua antes que cualquier snack. El cuerpo te lo va a agradecer.',
        'El plato perfecto no existe. El plato consistente sí.',
        'Verduras en cada comida, aunque sea poco. Eso es lo que cambia todo.',
        'Si tienes hambre real, come. Sin culpas.',
        'Hoy: proteína, verduras, algo de carbs. Suficiente.',
      ],
      empty: 'Registrar lo que comes no es para ser perfecta. Es para ser consciente.',
    },

    // ── HELPERS ───────────────────────────────────────

    // Pick random message from array
    pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    // Pick deterministic by day (same message all day)
    pickByDay(arr) {
      return arr[new Date().getDate() % arr.length];
    },

    // Generate dashboard greeting
    getDashboardGreeting(name, todayDone, streak, sessType, weekNum) {
      const firstName = (name || 'chica').split(' ')[0];
      const h = new Date().getHours();
      const typeNames = { A: 'glúteos', B: 'piernas', C: 'fuerza completa' };
      const t = typeNames[sessType] || 'entrenamiento';

      let pool;
      if (todayDone) pool = this.greet.done;
      else if (h < 12) pool = this.greet.morning;
      else if (h < 19) pool = this.greet.afternoon;
      else pool = this.greet.night;

      const fn = this.pick(pool);
      return fn(firstName, weekNum||1, streak||0, t);
    },

    // Generate workout welcome
    getWorkoutWelcome(name, weekNum, session) {
      const firstName = (name || 'chica').split(' ')[0];
      const idx = new Date().getDate() % this.workoutWelcome.phrases.length;
      const phrase = this.workoutWelcome.phrases[idx](firstName);
      const msg = this.workoutWelcome.messages[idx](session.exercises.length, weekNum);
      return { phrase, msg, full: `${phrase} ${msg}` };
    },

    // Generate closure message
    getClosureMessage(streak, volume) {
      const fn = this.pick(this.closure);
      return fn(streak||0, volume||0);
    },

    // Get nutrition tip (rotates by day)
    getNutritionTip() {
      return this.pickByDay(this.nutrition.tips);
    },

    // ── SPEAK (TTS, prep para voice cloning) ─────────

    _MUTE_KEY:      'af-voice-muted',
    _ACTIVATED_KEY: 'af-voice-activated',

    isActivated() {
      try { return localStorage.getItem(this._ACTIVATED_KEY) === '1'; } catch(e) { return false; }
    },

    activate() {
      try {
        localStorage.setItem(this._ACTIVATED_KEY, '1');
        // Unlock audio context with silent utterance
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis?.speak(u);
        window.dispatchEvent(new CustomEvent('af-voice-activated'));
      } catch(e) {}
    },

    isMuted() {
      try { return localStorage.getItem(this._MUTE_KEY) === '1'; } catch(e) { return false; }
    },

    setMuted(muted) {
      try {
        localStorage.setItem(this._MUTE_KEY, muted ? '1' : '0');
        if (muted) this.stopSpeaking();
        // Dispatch event so UI can react
        window.dispatchEvent(new CustomEvent('af-voice-mute', { detail: { muted } }));
      } catch(e) {}
    },

    toggleMute() {
      const next = !this.isMuted();
      this.setMuted(next);
      return next;
    },

    speak(text, opts = {}) {
      try {
        if (this.isMuted() && !opts.force) return false;
        if (!this.isActivated() && !opts.force) return false; // needs activation first
        if (!window.speechSynthesis) return false;
        window.speechSynthesis.cancel();

        const speak = () => {
          const u = new SpeechSynthesisUtterance(text);
          u.lang   = this.config.lang;
          u.rate   = opts.rate   || this.config.rate;
          u.pitch  = opts.pitch  || this.config.pitch;
          u.volume = opts.volume || this.config.volume;

          const voices = window.speechSynthesis.getVoices();
          const v = voices.find(x => x.lang.startsWith('es-MX'))
                || voices.find(x => x.lang.startsWith('es-US'))
                || voices.find(x => x.lang.startsWith('es-LA'))
                || voices.find(x => x.lang.startsWith('es-CO'))
                || voices.find(x => x.lang.startsWith('es'));
          if (v) u.voice = v;

          window.speechSynthesis.speak(u);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
          speak();
        } else {
          window.speechSynthesis.onvoiceschanged = speak;
          setTimeout(speak, 200);
        }
        return true;
      } catch(e) {
        return false;
      }
    },

    stopSpeaking() {
      try { window.speechSynthesis?.cancel(); } catch(e){}
    },

    // Speak only if voice is available (one-shot, no error)
    speakIfAvailable(text, opts) {
      return this.speak(text, opts);
    },
  };

  // Expose globally
  window.AF = window.AF || {};
  window.AF.voice = Voice;
})();

// ── Voice activation UI (injected globally) ──
(function initVoiceUI() {
  if (typeof window === 'undefined') return;

  function injectActivationBanner() {
    if (window.AF?.voice?.isActivated()) return;
    if (sessionStorage.getItem('af-voice-banner-dismissed')) return;
    if (document.getElementById('af-voice-banner')) return;

    const pages_with_nav = ['dashboard', 'workout', 'progress', 'nutrition', 'profile'];
    const isNavPage = pages_with_nav.some(p => window.location.pathname.includes(p));
    if (!isNavPage) return;

    const banner = document.createElement('div');
    banner.id = 'af-voice-banner';
    banner.style.cssText = `
      position:fixed;bottom:calc(76px + env(safe-area-inset-bottom));left:18px;
      z-index:170;max-width:240px;
      background:linear-gradient(135deg,rgba(20,12,36,.97),rgba(14,8,26,.97));
      border:1px solid rgba(196,181,253,.2);border-radius:18px;
      padding:12px 14px;display:flex;align-items:center;gap:11px;
      box-shadow:0 8px 28px rgba(0,0,0,.5);backdrop-filter:blur(20px);
      animation:af-in .4s cubic-bezier(.34,1.1,.64,1) both;
    `;
    banner.innerHTML = `
      <div style="font-size:22px">🔊</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;color:#f1f0f4;
          font-family:'Outfit',sans-serif">Activar voz</div>
        <div style="font-size:10px;color:rgba(240,238,248,.4);
          font-family:'Outfit',sans-serif">El coach puede hablarte</div>
      </div>
      <button id="af-voice-activate-btn" style="
        padding:6px 12px;border-radius:10px;border:none;
        background:rgba(124,58,237,.8);color:#fff;
        font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;
        cursor:pointer;white-space:nowrap;flex-shrink:0;
      ">Activar</button>
      <div onclick="dismissVoiceBannerGlobal()" style="
        font-size:12px;color:rgba(240,238,248,.3);cursor:pointer;flex-shrink:0;padding:4px;
      ">✕</div>
    `;
    document.body.appendChild(banner);

    document.getElementById('af-voice-activate-btn').addEventListener('click', () => {
      window.AF.voice.activate();
      const b = document.getElementById('af-voice-banner');
      if (b) b.remove();
      // Speak confirmation
      setTimeout(() => window.AF.voice.speak('Listo. Ya puedo hablarte.'), 200);
    });
  }

  window.dismissVoiceBannerGlobal = function() {
    sessionStorage.setItem('af-voice-banner-dismissed', '1');
    const b = document.getElementById('af-voice-banner');
    if (b) b.remove();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectActivationBanner, 2500));
  } else {
    setTimeout(injectActivationBanner, 2500);
  }
})();
