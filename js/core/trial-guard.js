// ═══════════════════════════════════════════════
// ArjunaFit — Trial System
// 7-day free trial. Soft expiry. No aggressive blocks.
// ═══════════════════════════════════════════════
(function () {
  'use strict';

  // ── Checkout URLs (configure when Stripe/checkout ready) ─
  const CHECKOUT_URLS = {
    challenge_glutes:    '', // Pendiente — Reto glúteos $32 USD
    challenge_belly:     '', // Pendiente — Reto pancita $32 USD
    custom_muscle_gain:  'https://pay.hotmart.com/M105694336W?bid=1777962608286',
    custom_fat_loss:     'https://pay.hotmart.com/M105694336W',
  };

  function getCheckoutUrl() {
    const type = localStorage.getItem('af-product-type') || 'challenge_glutes';
    return CHECKOUT_URLS[type] || '';
  }

  // ── Day-specific trial messages ───────────────────────────
  const TRIAL_DAY_MSGS = [
    '', // padding for index 0
    'Hoy empezamos simple. Lo importante es dar el primer paso.',
    'Ya volviste una vez. Eso empieza a construir hábito.',
    'Tu cuerpo necesita repetición, no perfección.',
    'Mitad de prueba. Ya tienes datos para que Arju te acompañe mejor.',
    'Si hoy haces algo pequeño, el proceso sigue vivo.',
    'Mañana termina tu prueba gratis. Revisa lo que ya construiste. El reto completo cuesta $32 USD.',
    'Terminaste tus 7 días gratis. Puedes desbloquear el reto completo por $32 USD y seguir desde donde vas.'
  ];

  function getTrialDayMsg(dayNum) {
    const d = Math.max(1, Math.min(7, dayNum));
    return TRIAL_DAY_MSGS[d] || TRIAL_DAY_MSGS[1];
  }


  const TRIAL_DAYS = 7;
  const KEY_START  = 'af-trial-start';
  const KEY_PAID   = 'af-paid';

  // ── Init trial on first login ────────────────
  // Product type: challenges have trial, plans don't
  function getProductType() {
    return localStorage.getItem('af-product-tipo') || 'reto'; // 'reto' | 'plan'
  }
  
  function isTrialEligible() {
    // Specific types that get trial
    const trialTypes = ['challenge_glutes', 'challenge_belly', 'reto'];
    const specificType = localStorage.getItem('af-product-type') || '';
    const genericType  = localStorage.getItem('af-product-tipo') || 'reto';
    return trialTypes.includes(specificType) || genericType === 'reto';
  }

  function initTrial(userId) {
    // Plans don't get trial
    if (!isTrialEligible()) return;
    if (localStorage.getItem(KEY_PAID) === '1') return;
    if (!localStorage.getItem(KEY_START)) {
      localStorage.setItem(KEY_START, Date.now().toString());
      console.log('[Trial] Started:', new Date().toLocaleDateString());
    }
  }

  // ── Get trial status ──────────────────────────
  function getStatus() {
    // Plans: no trial, show 'plan_active' or 'plan_unpaid'
    if (!isTrialEligible()) {
      const paid = localStorage.getItem(KEY_PAID);
      const productType = localStorage.getItem('af-product-type') || 'custom_muscle_gain';
      return { type: 'plan', paid: !!paid, daysLeft: 0, expired: false, productType, requiresPayment: !paid };
    }

    if (localStorage.getItem(KEY_PAID) === '1')
      return { active: true, paid: true, daysLeft: 999, expired: false };

    const start = parseInt(localStorage.getItem(KEY_START) || '0');
    if (!start) return { active: false, paid: false, daysLeft: TRIAL_DAYS, expired: false };

    const elapsed = (Date.now() - start) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
    return {
      active:   daysLeft > 0,
      paid:     false,
      daysLeft: daysLeft,
      expired:  daysLeft === 0,
    };
  }

  // ── Show trial banner on dashboard ───────────
  function renderBanner() {
    const st = getStatus();
    if (st.paid) return;

    // Plan without payment — show payment required state
    if (st.type === 'plan' && st.requiresPayment) {
      const existing2 = document.getElementById('plan-payment-banner');
      if (!existing2) {
        const pb = document.createElement('div');
        pb.id = 'plan-payment-banner';
        pb.style.cssText = 'margin:0 16px 12px;padding:14px 16px;border-radius:16px;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.25)';
        const reto = localStorage.getItem('af-selected-reto') || '';
        const planNames = {masa:'Aumento de masa muscular',definicion:'Reducción de % graso'};
        pb.innerHTML = '<div style="font-size:13px;font-weight:700;color:#f1f0f4;margin-bottom:4px">' + (planNames[reto]||'Plan personalizado') + '</div><div style="font-size:12px;color:rgba(240,238,248,.6);margin-bottom:12px">Este plan requiere pago para iniciar. $72 USD/mes.</div><button onclick="window.AF_Trial?.openPaywall?.()" style="width:100%;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-family:\'Outfit\',sans-serif;font-size:13px;font-weight:700;cursor:pointer">Pagar plan → $72/mes</button>';
        const main = document.querySelector('main, .page, body');
        if (main) main.prepend(pb);
      }
      return;
    }

    const existing = document.getElementById('trial-banner');
    if (existing) existing.remove();

    if (!st.expired && st.daysLeft > 7) return; // No banner in first week

    const banner = document.createElement('div');
    banner.id = 'trial-banner';

    if (st.expired) {
      banner.style.cssText = `
        margin:0 16px 12px;padding:14px 16px;border-radius:16px;
        background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(236,72,153,.1));
        border:1px solid rgba(196,181,253,.25);
      `;
      banner.innerHTML = `
        <div style="font-size:13px;font-weight:700;color:#f1f0f4;margin-bottom:4px">
          Tu trial terminó 💜
        </div>
        <div style="font-size:12px;color:rgba(240,238,248,.6);margin-bottom:12px;line-height:1.5">
          Llevas ${getTotalSessions()} sesiones. Tu progreso está guardado.
        </div>
        <button onclick="window.AF_Trial.openPaywall()" style="
          width:100%;padding:11px;border-radius:12px;border:none;
          background:linear-gradient(135deg,#7c3aed,#ec4899);
          color:#fff;font-family:'Outfit',sans-serif;font-size:13px;
          font-weight:700;cursor:pointer;
        ">Desbloquear reto →</button>
      `;
    } else {
      // Last week warning
      banner.style.cssText = `
        margin:0 16px 12px;padding:11px 14px;border-radius:14px;
        background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);
        display:flex;align-items:center;justify-content:space-between;gap:12px;
      `;
      banner.innerHTML = `
        <div>
          <div style="font-size:12px;font-weight:600;color:#fcd34d">
            ${st.daysLeft} día${st.daysLeft !== 1 ? 's' : ''} de prueba
          </div>
          <div style="font-size:11px;color:rgba(252,211,77,.6)">Tu progreso se mantiene</div>
        </div>
        <button onclick="window.AF_Trial.openPaywall()" style="
          padding:7px 14px;border-radius:10px;border:none;
          background:rgba(245,158,11,.2);color:#fcd34d;
          font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;
        ">Ver Premium</button>
      `;
    }

    // Insert after hero section
    const hero = document.querySelector('.hero-card, .coach-card, #coachCard');
    if (hero) hero.insertAdjacentElement('afterend', banner);
    else {
      const scroll = document.querySelector('.scroll, #scroll, main');
      if (scroll) scroll.prepend(banner);
    }
  }

  // ── Paywall overlay ───────────────────────────
  function openPaywall() {
    const st = getStatus();
    const sessions = getTotalSessions();

    const ov = document.createElement('div');
    ov.id = 'af-paywall';
    ov.style.cssText = `
      position:fixed;inset:0;z-index:500;
      background:rgba(8,5,17,.95);backdrop-filter:blur(20px);
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;padding:32px 24px;
      font-family:'Outfit',sans-serif;
    `;
    ov.innerHTML = `
      <div style="max-width:340px;width:100%;text-align:center">
        <div style="font-size:40px;margin-bottom:16px">💜</div>
        <div style="font-size:22px;font-weight:700;color:#f1f0f4;margin-bottom:8px;
          letter-spacing:-.03em">
          ${st.expired ? 'Tu trial terminó' : `${st.daysLeft} días restantes`}
        </div>
        <div style="font-size:14px;color:rgba(240,238,248,.5);margin-bottom:28px;
          line-height:1.6">
          ${sessions > 0
            ? `Llevas <b style="color:#c4b5fd">${sessions} sesiones</b> completadas.<br>Tu progreso no desaparece.`
            : 'Tu progreso está guardado y te espera.'}
        </div>

        <!-- Features -->
        <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
          border-radius:16px;padding:16px;margin-bottom:20px;text-align:left">
          ${['🏋️ 37 días de entrenamientos progresivos',
             '🤖 Coach Arju sin límites',
             '🥗 Recetario LATAM + recetas del reto',
             '📊 Progreso y seguimiento completo',
             '🔒 Tu progreso no desaparece'].map(f => `
            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;
              font-size:13px;color:rgba(240,238,248,.8)">
              <span>${f}</span>
            </div>
          `).join('')}
        </div>

        <!-- Price -->
        <div style="margin-bottom:20px">
          <div style="font-size:32px;font-weight:800;color:#f1f0f4">$9.99</div>
          <div style="font-size:12px;color:rgba(240,238,248,.4)">por mes · cancela cuando quieras</div>
        </div>

        <!-- CTAs -->
        <button onclick="window.AF_Trial.handlePurchase()" style="
          width:100%;padding:15px;border-radius:16px;border:none;
          background:linear-gradient(135deg,#7c3aed,#ec4899);
          color:#fff;font-size:16px;font-weight:700;cursor:pointer;
          margin-bottom:10px;
          box-shadow:0 4px 20px rgba(124,58,237,.4);
        "><span id="af-unlock-cta-text">Desbloquear reto por $32 USD →</span></button>
        <script>if(window.AF_Exp&&window.AF_Exp.getVariant('landing_cta')==='B'){var ct=document.getElementById('af-unlock-cta-text');if(ct)ct.textContent='Continuar mi reto por $32 USD →';}</script>

        <button onclick="document.getElementById('af-paywall')?.remove()" style="
          width:100%;padding:12px;border-radius:16px;
          border:1px solid rgba(255,255,255,.1);
          background:transparent;color:rgba(240,238,248,.4);
          font-size:14px;cursor:pointer;
        ">${st.expired ? 'Ver mi progreso' : 'Seguir con trial'}</button>
      </div>
    `;
    document.body.appendChild(ov);
    var closeD7 = ov.querySelector('#close-day7');
    if (closeD7) closeD7.addEventListener('click', function() {
      var el = document.getElementById('day7-summary-ov');
      if (el) el.remove();
    });
  }

  // WhatsApp number for manual unlock during presale
  const WHATSAPP_NUMBER = window.AF_Support ? AF_Support.whatsappNumber : '573209497919';

  function handlePurchase(productId) {
    // Track experiment click
    if (window.AF_Exp) AF_Exp.trackClick('paywall_summary', 'unlock_clicked');
    if (window.AF) AF.track('unlock_clicked', { product: productId || localStorage.getItem('af-product-type') });
    // Delegate to AF_Commerce (single source of truth for commercial actions)
    if (window.AF_Commerce) {
      window.AF_Commerce.handleCommercialAction(productId || localStorage.getItem('af-product-type'));
      return;
    }
    // Fallback if commerce-config.js not loaded
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, '_blank');
      if(window.AF) AF.track('checkout_clicked', {url});
      return;
    }
    const type = localStorage.getItem('af-product-type') || '';
    const name = type === 'challenge_belly' ? 'Reto para bajar la pancita' : 'Reto de glúteos';
    showWhatsAppPaywall(name);
  }

  function showWhatsAppPaywall(retoName) {
    var existing = document.getElementById('wa-paywall-ov');
    if (existing) { existing.remove(); return; }

    var ov = document.createElement('div');
    ov.id = 'wa-paywall-ov';
    ov.style.cssText = "position:fixed;inset:0;z-index:700;background:rgba(8,5,17,.97);display:flex;align-items:center;justify-content:center;padding:24px;font-family:'Outfit',sans-serif";

    var msg = encodeURIComponent('Hola Arjuna! Quiero desbloquear ' + retoName + ' en ArjunaFit. Ya completé mis 7 días de prueba.');
    var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg;

    ov.innerHTML =
      '<div style="max-width:360px;width:100%;text-align:center">' +
      '<div style="font-size:48px;margin-bottom:16px">🔓</div>' +
      '<div style="font-size:20px;font-weight:800;color:#f1f0f4;margin-bottom:8px;letter-spacing:-.02em">Desbloquea tu reto</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:24px;line-height:1.6">Tu progreso se guarda.<br>Escríbele a Arjuna para continuar desde donde vas.</div>' +
      '<a href="' + waUrl + '" id="wa-cta" target="_blank" style="display:block;padding:16px;border-radius:16px;background:#25D366;color:#fff;font-family:Outfit,sans-serif;font-size:15px;font-weight:800;text-decoration:none;margin-bottom:12px;box-shadow:0 6px 24px rgba(37,211,102,.3)">💬 Hablar con Arjuna →</a>' +
      '<button id="wa-close-btn" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.35);font-family:Outfit,sans-serif;font-size:13px;cursor:pointer">Volver</button>' +
      '</div>';

    document.body.appendChild(ov);
    var waLink = ov.querySelector('#wa-cta');
    if (waLink) waLink.addEventListener('click', function() { if(window.AF) AF.track('whatsapp_unlock_clicked'); });
    ov.querySelector('#wa-close-btn').addEventListener('click', function() { ov.remove(); });
    if(window.AF) AF.track('whatsapp_paywall_viewed', {reto: retoName});
  }

  // ── Day 7 summary screen ─────────────────────────────────
  function showDay7Summary() {
    const existing = document.getElementById('day7-summary-ov');
    if (existing) return;

    const sessions = getTotalSessions();
    var mealsCount = 0;
    try {
      for (var i = 0; i < 7; i++) {
        var dd = new Date(); dd.setDate(dd.getDate() - i);
        var kk = 'af-food-' + dd.getFullYear() + '-' + String(dd.getMonth()+1).padStart(2,'0') + '-' + String(dd.getDate()).padStart(2,'0');
        mealsCount += JSON.parse(localStorage.getItem(kk) || '[]').length;
      }
    } catch(e) {}

    const reto = localStorage.getItem('af-selected-reto') || '';
    const retoName = reto === 'pancita' ? 'Reto para bajar la pancita' : 'Reto de glúteos';

    const ov = document.createElement('div');
    ov.id = 'day7-summary-ov';
    ov.style.cssText = "position:fixed;inset:0;z-index:550;background:rgba(8,5,17,.97);overflow-y:auto;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;padding:24px";

    ov.innerHTML =
      '<div style="max-width:360px;width:100%;text-align:center">' +
      '<div style="font-size:48px;margin-bottom:16px">🎉</div>' +
      '<div style="font-size:22px;font-weight:800;color:#f1f0f4;letter-spacing:-.02em;margin-bottom:8px">Terminaste tus 7 días gratis</div>' +
      '<div style="font-size:14px;color:rgba(255,255,255,.5);margin-bottom:24px;line-height:1.6">Ya probaste cómo ArjunaFit organiza tu entrenamiento,<br>nutrición y acompañamiento diario.</div>' +
      // Stats
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">' +
        '<div style="background:rgba(250,204,21,.08);border:1px solid rgba(250,204,21,.15);border-radius:14px;padding:14px 8px">' +
          '<div style="font-size:24px;font-weight:800;color:rgba(250,204,21,.9)">' + sessions + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">entrenos</div></div>' +
        '<div style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.15);border-radius:14px;padding:14px 8px">' +
          '<div style="font-size:24px;font-weight:800;color:rgba(52,211,153,.9)">' + mealsCount + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">comidas</div></div>' +
        '<div style="background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.15);border-radius:14px;padding:14px 8px">' +
          '<div style="font-size:24px;font-weight:800;color:rgba(196,181,253,.9)">7</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">días</div></div>' +
      '</div>' +
      // Arju message
      '<div style="background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.12);border-radius:14px;padding:14px;margin-bottom:20px;font-size:13px;color:rgba(219,234,254,.75);line-height:1.6">No se trata de haberlo hecho perfecto. Se trata de que ya empezaste.</div>' +
      // What unlocks
      '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:16px;margin-bottom:20px;text-align:left">' +
        '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.3);letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px">Al desbloquear ' + retoName + '</div>' +
        ['🏋️ 37 días de entrenamientos progresivos','🤖 Coach Arju sin límites','🥗 Recetario LATAM completo','📊 Tu progreso y PRs para siempre'].map(function(f) {
          return '<div style="display:flex;align-items:center;gap:10px;padding:5px 0;font-size:13px;color:rgba(240,238,248,.7)">' + f + '</div>';
        }).join('') +
      '</div>' +
      // CTAs
      '<button onclick="window.AF_Trial.handlePurchase()" style="width:100%;padding:15px;border-radius:16px;border:none;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-family:Outfit,sans-serif;font-size:15px;font-weight:800;box-shadow:0 6px 24px rgba(124,58,237,.35);margin-bottom:10px">Desbloquear reto completo →</button>' +
      '<button id="close-day7"  style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:transparent;color:rgba(255,255,255,.35);font-family:Outfit,sans-serif;font-size:13px;cursor:pointer">Ver mi resumen de progreso</button>' +
      '</div>';

    document.body.appendChild(ov);
  }

  // ── Day 7 trigger ────────────────────────────
  function checkDay7() {
    const st = getStatus();
    if (!st.active || st.paid) return;
    const daysUsed = TRIAL_DAYS - st.daysLeft;
    if (daysUsed >= 6) { // Day 7 or last day
      const shown7Key = 'af-day7-shown-' + new Date().toISOString().split('T')[0];
      if (!localStorage.getItem(shown7Key)) {
        localStorage.setItem(shown7Key, '1');
        setTimeout(showDay7Summary, 3000);
      }
    }
  }

  // ── Soft limit on expired ─────────────────────
  // Doesn't block, just nudges
  function checkExpiry() {
    const st = getStatus();
    if (!st.expired) return false;

    // Allow viewing but show paywall after 3 actions
    const actions = parseInt(sessionStorage.getItem('af-expired-actions') || '0');
    if (actions >= 3) {
      sessionStorage.setItem('af-expired-actions', '0');
      openPaywall();
      return true;
    }
    sessionStorage.setItem('af-expired-actions', (actions + 1).toString());
    return false;
  }

  function getTotalSessions() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('af-sets-'));
      return keys.length;
    } catch(e) { return 0; }
  }

  // ── Expose globally ───────────────────────────
  window.AF_Trial = { initTrial, getStatus, renderBanner, openPaywall, handlePurchase, checkExpiry, showDay7Summary, checkDay7, getTrialDayMsg, getCheckoutUrl, showWhatsAppPaywall };

})();
