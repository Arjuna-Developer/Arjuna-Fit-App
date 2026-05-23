// ArjunaFit — Arju Voice Assistant
// Siempre escucha. Detecta "Arju". Responde con voz OpenAI.
(function () {
  if (window._ArjuLoaded) return;
  window._ArjuLoaded = true;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SS = window.speechSynthesis;

  // ── Config ──────────────────────────────────────
  const WAKE = ['arju', 'arjuna', 'hey arju', 'oye arju'];
  const MAX_HISTORY = 10;

  // ── State ────────────────────────────────────────
  let rec       = null;
  let speaking  = false;
  let inConvo   = false;   // true = next transcript es pregunta directa
  let history   = [];
  let lastReply = '';
  let convoTimer = null;
  let audioUnlocked = false;

  // ── FAB ──────────────────────────────────────────
  function renderFAB() {
    if (document.getElementById('af')) return;
    if (location.pathname.includes('coach')) return;
    const d = document.createElement('div');
    d.id = 'af';
    d.innerHTML = '<span id="af-i">🤖</span><span id="af-l">Arju</span>';
    d.style.cssText = `position:fixed;bottom:calc(74px + env(safe-area-inset-bottom));
      right:16px;z-index:9001;width:54px;height:54px;border-radius:18px;
      background:linear-gradient(135deg,#7c3aed,#ec4899);
      border:1.5px solid rgba(255,255,255,.15);cursor:pointer;
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
      box-shadow:0 6px 24px rgba(124,58,237,.5);
      -webkit-tap-highlight-color:transparent;font-family:'Outfit',sans-serif;`;
    document.getElementById('af-i') && null; // style injected below
    const st = document.createElement('style');
    st.textContent = `#af-i{font-size:22px;line-height:1}
      #af-l{font-size:8px;font-weight:700;color:rgba(255,255,255,.8);
        letter-spacing:.05em;text-transform:uppercase}
      @keyframes af-pulse{0%,100%{box-shadow:0 6px 24px rgba(124,58,237,.5)}
        50%{box-shadow:0 6px 32px rgba(124,58,237,.8),0 0 20px rgba(124,58,237,.3)}}
      #arju-toast{position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);
        left:50%;transform:translateX(-50%);z-index:400;
        max-width:calc(100vw - 32px);width:340px;
        background:rgba(16,8,30,.97);border:1px solid rgba(124,58,237,.4);
        border-radius:16px;padding:12px 16px;font-family:'Outfit',sans-serif;
        font-size:14px;color:#f1f0f4;line-height:1.5;
        box-shadow:0 8px 32px rgba(0,0,0,.5);pointer-events:none;
        transition:opacity .3s ease}
      @keyframes af-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      body{animation:af-in .35s ease both}`;
    document.head.appendChild(st);
    document.body.appendChild(d);
    d.addEventListener('click', onFABClick);
  }

  function setFAB(icon, label, pulse) {
    const i = document.getElementById('af-i');
    const l = document.getElementById('af-l');
    const f = document.getElementById('af');
    if (i) i.textContent = icon;
    if (l) l.textContent = label;
    if (f) f.style.animation = pulse ? 'af-pulse 1.8s ease-in-out infinite' : '';
  }

  // ── Toast ─────────────────────────────────────────
  let toastTimer;
  function toast(html, dur = 5000) {
    let t = document.getElementById('arju-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'arju-toast';
      document.body.appendChild(t);
    }
    t.style.opacity = '1';
    t.innerHTML = html;
    clearTimeout(toastTimer);
    if (dur > 0) toastTimer = setTimeout(() => { t.style.opacity = '0'; }, dur);
  }

  // ── Unlock audio (must be in user gesture) ────────
  function unlockAudio() {
    if (audioUnlocked || !SS) return;
    try {
      SS.cancel();
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      SS.speak(u);
      audioUnlocked = true;
    } catch(e) {}
  }

  // ── Recognition ───────────────────────────────────
  function startRec() {
    if (!SR || speaking) return;
    if (rec) { try { rec.stop(); } catch(e) {} }

    rec = new SR();
    rec.lang = 'es-CO';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      if (speaking) return;

      const interim = Array.from(e.results)
        .filter(r => !r.isFinal).map(r => r[0].transcript).join('');
      const final = Array.from(e.results)
        .filter(r => r.isFinal).map(r => r[0].transcript.trim()).join(' ').trim();

      if (interim && inConvo) toast('🎙️ ' + interim);

      if (!final) return;
      console.log('[Arju] 🎤', final, '| inConvo:', inConvo);
      handleText(final);
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted')
        console.warn('[Arju] rec error:', e.error);
    };

    rec.onend = () => {
      if (speaking) return;
      // SOLO reiniciar si hay conversación activa
      // Si no hay conversación, parar completamente
      if (inConvo) {
        setTimeout(startRec, 150);
      }
      // No auto-restart when idle — user must tap to start
    };

    try { rec.start(); } catch(e) {}
  }

  function stopRec() {
    try { if (rec) { rec.onend = null; rec.stop(); } } catch(e) {}
    rec = null;
  }

  // ── Handle transcript ─────────────────────────────
  function handleText(text) {
    const lower = text.toLowerCase().trim();

    if (inConvo) {
      // Already in conversation — treat everything as question
      clearTimeout(convoTimer);
      answer(text);
      return;
    }

    // Look for wake word
    const hit = WAKE.find(w => lower.includes(w));
    if (!hit) return;

    // Extract inline question after wake word
    const idx = lower.indexOf(hit);
    const after = text.slice(idx + hit.length)
      .replace(/^[\s,.\-!?]+/, '')
      .replace(/^(una pregunta|una duda|oye|dime)[,.\s]*/i, '')
      .trim();

    if (after.length > 3) {
      // Wake word + question in same utterance
      answer(after);
    } else {
      // Wake word only — confirm and wait
      inConvo = true;
      setFAB('🎙️', 'Dime', true);
      speak('Dime.');
    }
  }

  // ── Answer via OpenAI ─────────────────────────────
  async function answer(question) {
    inConvo = true;
    clearTimeout(convoTimer);
    console.log('[Arju] → OpenAI:', question);
    toast('<span style="color:#c4b5fd;font-size:11px">ARJU</span><br>...');
    setFAB('⏳', 'Pensando', false);

    // Update overlay if open
    const resp = document.getElementById('ov-response');
    const status = document.getElementById('ov-status');
    if (resp) resp.textContent = '...';
    if (status) status.textContent = 'Pensando...';

    history.push({ role: 'user', content: question });
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

    const ctx = getContext();
    const sys = `Eres Arju, coach de ArjunaFit. Español colombiano, tono humano y calmado. Máximo 2 frases. Si el usuario pide más, expande naturalmente. Contexto: ${ctx}`;

    const ctrl = new AbortController();
    const tOut = setTimeout(() => ctrl.abort(), 12000);
    setTimeout(() => toast('<span style="color:#c4b5fd;font-size:11px">ARJU</span><br>Dame un segundo...'), 5000);

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ system: sys, messages: history, max_tokens: 150 }),
      });
      clearTimeout(tOut);
      const data = await r.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error('empty');

      history.push({ role: 'assistant', content: reply });
      window.lastArjuReply = reply;
      console.log('[Arju] ✅ Reply:', reply);
      toast(`<span style="color:#c4b5fd;font-size:11px">ARJU</span><br>${reply}`);
      if (resp) resp.textContent = reply;
      if (status) status.textContent = 'Listo ✓';
      speak(reply);
    } catch(e) {
      clearTimeout(tOut);
      const msg = e.name === 'AbortError' ? 'Se tardó mucho.' : 'Tuve un problema.';
      console.warn('[Arju] ❌', e.message);
      toast(`<span style="color:#c4b5fd;font-size:11px">ARJU</span><br>${msg}`);
      if (resp) resp.textContent = msg;
      if (status) status.textContent = 'Error';
      speak(msg);
    }
  }

  // ── Speak via OpenAI TTS ──────────────────────────
  async function speak(text) {
    if (!text) return;
    speaking = true;
    stopRec();
    setFAB('🔊', 'Arju', true);

    const clean = text.replace(/[^\u0000-\u024F\s.,!?¿¡;:\-]/g, '').trim();

    try {
      const r = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      });
      if (!r.ok) throw new Error('tts ' + r.status);
      const data = await r.json();
      if (!data.audio) throw new Error('no audio');

      const bytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        afterSpeak();
      };
      audio.onerror = () => { URL.revokeObjectURL(url); afterSpeak(); };
      await audio.play();
      console.log('[Arju] 🔊 Playing audio');

    } catch(e) {
      console.warn('[Arju] TTS failed, using SS fallback:', e.message);
      // Fallback to Web Speech
      if (SS) {
        try { SS.resume(); } catch(x) {}
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = 'es-CO'; u.rate = 0.92;
        let done = false;
        const fin = () => { if (!done) { done = true; afterSpeak(); } };
        u.onend = fin; u.onerror = fin;
        SS.speak(u);
        setTimeout(fin, Math.max(3000, clean.split(' ').length * 600));
      } else {
        afterSpeak();
      }
    }
  }

  function afterSpeak() {
    speaking = false;
    setFAB('🎙️', 'Escucha', true);
    // Stay in conversation — listen for follow-up
    startRec();
    // Close conversation after 4s of silence
    convoTimer = setTimeout(() => {
      inConvo = false;
      history = [];
      setFAB('🤖', 'Arju', false);
      toast('', 0);
      console.log('[Arju] Conversación cerrada');
    }, 4000);
  }

  // ── Page context ──────────────────────────────────
  function getContext() {
    const p = location.pathname;
    if (p.includes('workout')) {
      const ex = document.querySelector('.ex-card.open .ex-name')?.textContent;
      return `Entrenando. Ejercicio activo: ${ex || 'ninguno'}.`;
    }
    if (p.includes('nutrition')) return 'Viendo nutrición.';
    if (p.includes('progress'))  return 'Viendo progreso.';
    return 'Dashboard de ArjunaFit.';
  }

  // ── FAB click ─────────────────────────────────────
  function onFABClick() {
    unlockAudio();
    if (document.getElementById('arju-ov')) {
      document.getElementById('arju-ov').remove();
      return;
    }
    openOverlay();
  }

  // ── Main overlay — text + optional voice ─────────
  function openOverlay() {
    const ov = document.createElement('div');
    ov.id = 'arju-ov';
    ov.style.cssText = `position:fixed;inset:0;z-index:9000;
      background:rgba(8,5,17,.92);backdrop-filter:blur(18px);
      display:flex;align-items:flex-end;font-family:'Outfit',sans-serif;`;

    ov.innerHTML = `
      <div style="width:100%;max-width:430px;margin:0 auto;
        padding:20px 16px calc(16px + env(safe-area-inset-bottom));
        background:rgba(14,7,26,.98);border-radius:24px 24px 0 0;
        border-top:1px solid rgba(255,255,255,.08)">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="width:40px;height:40px;border-radius:14px;flex-shrink:0;
            background:linear-gradient(135deg,#7c3aed,#ec4899);
            display:flex;align-items:center;justify-content:center;font-size:20px;
            box-shadow:0 0 16px rgba(124,58,237,.4)">🤖</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;color:#f1f0f4">Arju</div>
            <div id="ov-status" style="font-size:11px;color:rgba(196,181,253,.5)">
              Tu coach personal</div>
          </div>
          <button onclick="document.getElementById('arju-ov')?.remove()" style="
            padding:6px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.1);
            background:rgba(255,255,255,.04);color:rgba(240,238,248,.5);
            font-family:'Outfit',sans-serif;font-size:12px;cursor:pointer">✕</button>
        </div>

        <!-- Response area -->
        <div id="ov-response" style="
          min-height:60px;background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.07);border-radius:16px;
          padding:14px;margin-bottom:14px;
          font-size:14px;color:rgba(240,238,248,.8);line-height:1.6">
          ¿En qué te puedo ayudar hoy?
        </div>

        <!-- Text input — PRIMARY METHOD -->
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <input id="ov-input" type="text" placeholder="Escribe tu pregunta..."
            onkeydown="if(event.key==='Enter'&&this.value.trim()) arjuSend(this.value.trim())"
            style="flex:1;background:rgba(255,255,255,.06);
              border:1.5px solid rgba(255,255,255,.1);border-radius:12px;
              padding:11px 14px;font-family:'Outfit',sans-serif;font-size:14px;
              color:#f1f0f4;outline:none;-webkit-appearance:none;"
            onfocus="this.style.borderColor='rgba(124,58,237,.5)'"
            onblur="this.style.borderColor='rgba(255,255,255,.1)'">
          <button onclick="arjuSend(document.getElementById('ov-input')?.value?.trim())" style="
            padding:11px 16px;border-radius:12px;border:none;
            background:linear-gradient(135deg,#7c3aed,#9333ea);
            color:#fff;font-family:'Outfit',sans-serif;
            font-size:14px;font-weight:700;cursor:pointer;flex-shrink:0">
            Enviar</button>
        </div>

        <!-- Voice button + controls -->
        <div style="display:flex;gap:8px">
          <button id="ov-mic" onclick="arjuMic()" style="
            flex:1;padding:10px;border-radius:12px;
            border:1px solid rgba(124,58,237,.3);
            background:rgba(124,58,237,.1);color:#c4b5fd;
            font-family:'Outfit',sans-serif;font-size:13px;
            font-weight:600;cursor:pointer">
            🎙️ Hablar</button>
          <button onclick="if(window.Arju)window.Arju.speak(lastArjuReply)" style="
            padding:10px 14px;border-radius:12px;
            border:1px solid rgba(255,255,255,.08);
            background:rgba(255,255,255,.04);color:rgba(240,238,248,.5);
            font-family:'Outfit',sans-serif;font-size:12px;cursor:pointer">
            🔁</button>
          <button onclick="toggleArjuVoice(this)" id="ov-voice-toggle" style="
            padding:10px 14px;border-radius:12px;
            border:1px solid rgba(255,255,255,.08);
            background:rgba(255,255,255,.04);color:rgba(240,238,248,.5);
            font-family:'Outfit',sans-serif;font-size:12px;cursor:pointer">
            ${localStorage.getItem('arju-voice')==='0'?'🔇':'🔊'}</button>
        </div>

        <!-- Quick questions -->
        <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px">
          ${[
            ['¿Qué entreno hoy?', 'Qué entreno toca hoy'],
            ['¿Qué como ahora?', 'Qué puedo comer ahora'],
            ['¿Cuánto descanso?', 'Cuánto tiempo debo descansar entre series'],
            ['Motívame', 'Dame una frase motivadora para entrenar'],
          ].map(([label, q]) => `
            <button onclick="arjuSend('${q}')" style="
              padding:6px 12px;border-radius:20px;
              border:1px solid rgba(255,255,255,.08);
              background:rgba(255,255,255,.04);
              color:rgba(240,238,248,.6);
              font-family:'Outfit',sans-serif;font-size:12px;cursor:pointer;
              -webkit-tap-highlight-color:transparent">
              ${label}</button>`).join('')}
        </div>
      </div>
    `;

    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
    // Focus text input
    setTimeout(() => document.getElementById('ov-input')?.focus(), 200);
  }

  // ── Send from overlay ─────────────────────────────
  window.arjuSend = async function(text) {
    if (!text?.trim()) {
      const resp = document.getElementById('ov-response');
      if (resp) resp.textContent = 'No alcancé a escucharte. Intenta de nuevo.';
      return;
    }
    text = text.trim();
    console.log('[Arju] arjuSend — question:', text);

    const input  = document.getElementById('ov-input');
    const resp   = document.getElementById('ov-response');
    const status = document.getElementById('ov-status');
    if (input)  input.value = '';
    if (resp)   resp.innerHTML = '<span style="color:rgba(196,181,253,.4)">Pensando...</span>';
    if (status) status.textContent = 'Consultando a OpenAI...';
    setFAB('⏳', 'Pensando', false);

    history.push({ role: 'user', content: text });
    if (history.length > 10) history = history.slice(-10);

    const ctx = getContext();
    const sys = `Eres Arju, coach de ArjunaFit. Español colombiano. Máximo 2-3 frases directas. Tono humano y calmado. Contexto actual del usuario: ${ctx}`;

    console.log('[Arju] Sending to OpenAI — messages:', history.length);

    const ctrl = new AbortController();
    const to = setTimeout(() => {
      ctrl.abort();
      console.warn('[Arju] OpenAI timeout after 10s');
    }, 10000);

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ system: sys, messages: history, max_tokens: 120 }),
      });
      clearTimeout(to);

      console.log('[Arju] OpenAI HTTP status:', r.status);

      if (!r.ok) {
        const errText = await r.text().catch(() => 'unknown');
        console.error('[Arju] OpenAI error response:', errText);
        throw new Error(`HTTP ${r.status}: ${errText.slice(0,100)}`);
      }

      const data = await r.json();
      console.log('[Arju] OpenAI data:', JSON.stringify(data).slice(0, 200));

      const reply = data.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error('Empty response from OpenAI');

      console.log('[Arju] ✅ Reply received:', reply.slice(0, 80));

      history.push({ role: 'assistant', content: reply });
      window.lastArjuReply = reply;

      // Show text IMMEDIATELY — voice is secondary
      if (resp) resp.textContent = reply;
      if (status) status.textContent = '✓';
      setFAB('🤖', 'Arju', false);
      toast(`<b style="color:#c4b5fd;font-size:11px">ARJU</b><br>${reply}`);

      console.log('[Arju] Response rendered — attempting TTS');
      speak(reply);

    } catch(e) {
      clearTimeout(to);
      console.error('[Arju] arjuSend error:', e.message);
      const msg = e.name === 'AbortError'
        ? 'Se tardó mucho. Revisa tu conexión e intenta de nuevo.'
        : `Error: ${e.message.slice(0, 60)}`;
      if (resp) resp.textContent = msg;
      if (status) status.textContent = 'Error ×';
      setFAB('🤖', 'Arju', false);
    }
  };

  // ── Mic in overlay ────────────────────────────────
  window.arjuMic = function() {
    if (!SR) {
      alert('Tu navegador no soporta reconocimiento de voz.\nUsa el teclado para escribir tu pregunta.');
      return;
    }
    const btn = document.getElementById('ov-mic');
    const status = document.getElementById('ov-status');
    if (btn) btn.textContent = '🔴 Escuchando...';
    inConvo = true;
    startRec();
    // The next transcript will be processed by handleText
    // Close overlay mic button after 8s
    setTimeout(() => {
      if (btn) btn.textContent = '🎙️ Hablar';
      inConvo = false;
    }, 8000);
  };

  window.toggleArjuVoice = function(btn) {
    const muted = localStorage.getItem('arju-voice') === '0';
    localStorage.setItem('arju-voice', muted ? '1' : '0');
    btn.textContent = muted ? '🔊' : '🔇';
  };

  // ── Init ──────────────────────────────────────────
  function init() {
    const activated = localStorage.getItem('arju-activated') === '1';
    console.log('[Arju] Init | SR:', !!SR, '| activated:', activated);
    renderFAB();
    if (SR && activated) {
      // Start always-on recognition
      setTimeout(startRec, 1500);
    }
    window.Arju = {
      speak, answer,
      activate: () => {
        unlockAudio();
        localStorage.setItem('arju-activated', '1');
        startRec();
        speak('Arju activado. Di Arju para hablar conmigo.');
      },
      get inConvo() { return inConvo; },
      get history() { return history; },
    };
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();
})();
