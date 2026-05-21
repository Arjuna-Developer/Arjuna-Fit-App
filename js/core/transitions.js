// ═══════════════════════════════════════════════
// ARJUNAFIT — Transitions & Breath System v2
// Suavidad global: pages, cards, buttons, nav.
// ═══════════════════════════════════════════════
(function () {
  'use strict';

  // ── CSS global: transiciones suaves + respiración ──
  const s = document.createElement('style');
  s.textContent = `
    /* ── Curva principal — spring suave ── */
    :root {
      --ease-af:    cubic-bezier(0.34, 1.12, 0.64, 1);
      --ease-out:   cubic-bezier(0.22, 1, 0.36, 1);
      --ease-in-out:cubic-bezier(0.65, 0, 0.35, 1);
      --dur-fast:   180ms;
      --dur-mid:    320ms;
      --dur-slow:   500ms;
    }

    /* ── Page enter ── */
    body {
      animation: af-page-in var(--dur-slow) var(--ease-out) both;
    }
    @keyframes af-page-in {
      from { opacity: 0; transform: translateY(14px) scale(0.985); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Page exit ── */
    body.af-out {
      animation: af-page-out 240ms var(--ease-in-out) forwards !important;
      pointer-events: none;
    }
    @keyframes af-page-out {
      to { opacity: 0; transform: translateY(-8px) scale(0.99); }
    }

    /* ── Cards — aparición suave escalonada ── */
    .card, .eco-card, .retention-nudge, .price-card, .plan-row,
    [id$="-card"], .opt, .recipe-card, .meal-card, .workout-card,
    .metric-card, .prog-card {
      animation: af-card-in var(--dur-slow) var(--ease-out) both;
    }
    @keyframes af-card-in {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Bottom nav — presión con rebote ── */
    nav a, nav button,
    .nav-item {
      transition: transform var(--dur-fast) var(--ease-af),
                  opacity  var(--dur-fast) var(--ease-out) !important;
    }
    nav a:active, nav button:active, .nav-item:active {
      transform: scale(0.84) !important;
    }

    /* ── Botones primarios ── */
    .btn-main, .cta-primary, .checkout-btn,
    button[style*="gradient"], a[style*="gradient"],
    .btn-send, .btn, #sfBtn {
      transition: transform var(--dur-fast) var(--ease-af),
                  box-shadow var(--dur-mid) var(--ease-out),
                  opacity    var(--dur-fast) linear !important;
    }
    .btn-main:active, .cta-primary:active,
    .checkout-btn:active, #sfBtn:active {
      transform: scale(0.95) !important;
      box-shadow: none !important;
    }

    /* ── Botones secundarios y chips ── */
    .ci-opt, .ci-train, .ps-option, .opt-btn, .fb-chip,
    .quick-action-btn, .btn-secondary, .cta-secondary {
      transition: background var(--dur-fast) var(--ease-out),
                  border-color var(--dur-fast) var(--ease-out),
                  transform var(--dur-fast) var(--ease-af),
                  color var(--dur-fast) linear !important;
    }
    .ci-opt:active, .ci-train:active, .ps-option:active,
    .opt-btn:active, .fb-chip:active, .quick-action-btn:active {
      transform: scale(0.93) !important;
    }

    /* ── Links y navegación interna ── */
    a[href^="/"]:not([href^="//"]):not([target="_blank"]) {
      transition: opacity var(--dur-fast) linear;
    }

    /* ── Toast / microvictoria ── */
    #mv-toast {
      animation: mv-rise 400ms var(--ease-out) both !important;
    }
    @keyframes mv-rise {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Nudge card ── */
    @keyframes nudge-in {
      from { opacity: 0; transform: translateY(-10px) scale(0.97); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Modales y overlays ── */
    #activation-modal, #wa-paywall-ov, #day7Modal,
    [id$="-modal"], [id$="-overlay"], [id$="-ov"] {
      animation: af-modal-in 340ms var(--ease-out) both;
    }
    @keyframes af-modal-in {
      from { opacity: 0; transform: scale(0.96) translateY(12px); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Accordions / acordeones ── */
    details[open] > *:not(summary) {
      animation: af-expand 300ms var(--ease-out) both;
    }
    @keyframes af-expand {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Check-in steps ── */
    #ci-step2 {
      animation: af-card-in var(--dur-mid) var(--ease-out) both;
    }

    /* ── Reveal animaciones de landing ── */
    .reveal {
      transition: opacity var(--dur-slow) var(--ease-out),
                  transform var(--dur-slow) var(--ease-out) !important;
    }

    /* ── Inputs — focus suave ── */
    input, textarea, select {
      transition: border-color var(--dur-fast) var(--ease-out),
                  background   var(--dur-fast) var(--ease-out),
                  box-shadow   var(--dur-mid)  var(--ease-out) !important;
    }
    input:focus, textarea:focus {
      box-shadow: 0 0 0 3px rgba(124,58,237,.18) !important;
    }

    /* ── Imagen placeholders de video — pulse suave ── */
    [style*="Video demostrativo"],
    .video-placeholder {
      animation: af-pulse 3s ease-in-out infinite;
    }
    @keyframes af-pulse {
      0%,100% { opacity: 1; }
      50%      { opacity: .7; }
    }

    /* ── Reduce motion: respetar preferencia del sistema ── */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(s);

  // ── Intercept internal links — smooth exit ──
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/') || href.startsWith('//') ||
        href.startsWith('#') || link.target === '_blank' ||
        href.includes('wa.me') || href.includes('mailto') || href.includes('tel:') ||
        href.includes('hotmart') || href.includes('pay.')) return;
    e.preventDefault();
    document.body.classList.add('af-out');
    setTimeout(() => window.location.href = href, 240);
  }, true);

  // ── Nav icon bounce on tap ──
  document.addEventListener('click', function(e) {
    const navBtn = e.target.closest('nav a, nav button');
    if (!navBtn) return;
    navBtn.style.transition = 'transform 180ms cubic-bezier(0.34,1.56,0.64,1)';
    navBtn.style.transform = 'scale(0.82)';
    setTimeout(function() {
      navBtn.style.transform = '';
      setTimeout(function() { navBtn.style.transition = ''; }, 220);
    }, 160);
  });

})();
