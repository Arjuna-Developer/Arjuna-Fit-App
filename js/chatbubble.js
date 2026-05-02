// ── ArjunaFit · Chat Bubble Global ──
// Agrega una burbuja flotante de chat en cualquier página
// Uso: <script src="../js/chatbubble.js"></script>

(function() {
  // No mostrar en la página de chat misma
  if(window.location.pathname.includes('chat.html')) return;

  const style = document.createElement('style');
  style.textContent = `
    .af-bubble-btn {
      position: fixed;
      bottom: calc(80px + env(safe-area-inset-bottom));
      right: 18px;
      width: 58px; height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #ec4899);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; z-index: 100;
      box-shadow: 0 6px 24px rgba(124,58,237,.5);
      animation: bubble-pulse 3s ease-in-out infinite;
      transition: transform .2s;
    }
    .af-bubble-btn:active { transform: scale(.9); }
    @keyframes bubble-pulse {
      0%,100% { box-shadow: 0 6px 24px rgba(124,58,237,.5); }
      50%      { box-shadow: 0 6px 32px rgba(124,58,237,.8), 0 0 0 8px rgba(124,58,237,.1); }
    }
    .af-bubble-badge {
      position: absolute; top: -2px; right: -2px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #22c55e; border: 2px solid white;
      font-size: 10px; font-weight: 800; color: white;
      display: flex; align-items: center; justify-content: center;
    }
    .af-bubble-tooltip {
      position: fixed;
      bottom: calc(148px + env(safe-area-inset-bottom));
      right: 18px;
      background: var(--surface, white);
      border: 1.5px solid var(--border, #e0e0e0);
      border-radius: 16px; padding: 12px 16px;
      font-family: 'Outfit', sans-serif;
      font-size: 14px; font-weight: 700;
      color: var(--text, #1e1b4b);
      box-shadow: 0 8px 24px rgba(0,0,0,.12);
      white-space: nowrap; z-index: 100;
      animation: tooltipIn .3s ease;
      pointer-events: none;
    }
    .af-bubble-tooltip::after {
      content: '';
      position: absolute; bottom: -8px; right: 20px;
      width: 0; height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid var(--border, #e0e0e0);
    }
    @keyframes tooltipIn {
      from { opacity:0; transform: translateY(8px); }
      to   { opacity:1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // Botón
  const btn = document.createElement('button');
  btn.className = 'af-bubble-btn';
  btn.innerHTML = `🤖<div class="af-bubble-badge">✓</div>`;
  btn.title = 'Habla con tu entrenador';

  // Tooltip messages
  const tips = [
    '¿Tienes dudas hoy? 💬',
    '¡Pregúntame lo que sea! 🏋️',
    '¿Te duele algo? Cuéntame 🩹',
    '¿Perdiste motivación? 💪',
    '¿Dudas de nutrición? 🥗',
  ];
  let tipIdx = 0;
  let tooltip = null;

  function showTooltip() {
    if(tooltip) return;
    tooltip = document.createElement('div');
    tooltip.className = 'af-bubble-tooltip';
    tooltip.textContent = tips[tipIdx % tips.length];
    tipIdx++;
    document.body.appendChild(tooltip);
    setTimeout(hideTooltip, 3500);
  }

  function hideTooltip() {
    if(tooltip) { tooltip.remove(); tooltip = null; }
  }

  btn.onclick = () => {
    hideTooltip();
    // Navigate to chat with context
    const isPages = window.location.pathname.includes('/pages/');
    window.location.href = isPages ? 'chat.html' : 'pages/chat.html';
  };

  document.body.appendChild(btn);

  // Show tooltip after 3s, then every 30s
  setTimeout(showTooltip, 3000);
  setInterval(showTooltip, 30000);
})();
