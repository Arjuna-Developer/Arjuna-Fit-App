
// ArjunaFit — Trial System v2
// FUENTE DE VERDAD: Supabase profiles.trial_start
// localStorage = cache rápido, NUNCA fuente de verdad
// El trial NUNCA se puede resetear limpiando caché
(function () {
  'use strict';

  const TRIAL_DAYS = 7;
  const KEY_START  = 'af-trial-start';   // localStorage cache
  const KEY_PAID   = 'af-paid';

  const CHECKOUT_URLS = {
    challenge_glutes:   'https://pay.hotmart.com/E6998679V',
    challenge_belly:    'https://pay.hotmart.com/E7678934T',
    custom_muscle_gain: 'https://pay.hotmart.com/M105694336W',
    custom_fat_loss:    'https://pay.hotmart.com/M105694336W',
    custom_plan:        'https://pay.hotmart.com/M105694336W',
  };

  const TRIAL_DAY_MSGS = [
    '',
    'Hoy empezamos simple. Lo importante es dar el primer paso.',
    'Ya volviste una vez. Eso empieza a construir hábito.',
    'Tu cuerpo necesita repetición, no perfección.',
    'Mitad de prueba. Ya tienes datos para que Arju te acompañe mejor.',
    'Si hoy haces algo pequeño, el proceso sigue vivo.',
    'Mañana termina tu prueba gratis. Revisa lo que ya construiste. El reto completo cuesta $32 USD.',
    'Terminaste tus 7 días gratis. Puedes desbloquear el reto completo por $32 USD y seguir desde donde vas.'
  ];

  function getCheckoutUrl() {
    const type = localStorage.getItem('af-product-type') || 'challenge_glutes';
    return CHECKOUT_URLS[type] || CHECKOUT_URLS['challenge_glutes'];
  }

  function getTrialDayMsg(d) {
    return TRIAL_DAY_MSGS[Math.max(1, Math.min(7, d))] || TRIAL_DAY_MSGS[1];
  }

  function isTrialEligible() {
    const trialTypes = ['challenge_glutes', 'challenge_belly', 'reto'];
    const t = localStorage.getItem('af-product-type') || '';
    const g = localStorage.getItem('af-product-tipo') || 'reto';
    return trialTypes.includes(t) || g === 'reto';
  }
  // REGLA: si Supabase tiene trial_start → siempre usar ese valor
  // Si no tiene → crear ahora y guardar en Supabase
  // NUNCA re-crear si ya existe en Supabase
  async function _syncTrialFromSupabase() {
    var sb = window.sb;
    if (!sb) return;

    try {
      var sess = await sb.auth.getSession();
      var uid = sess?.data?.session?.user?.id;
      if (!uid) return;

      // Leer trial_start de Supabase
      var { data, error } = await sb.from('profiles')
        .select('trial_start, paid_at')
        .eq('id', uid).single();

      if (error && error.code !== 'PGRST116') {
        console.warn('[Trial] Supabase read error:', error.message);
        return;
      }
      if (data && data.paid_at) {
        localStorage.setItem(KEY_PAID, '1');
        localStorage.removeItem(KEY_START);
        if (typeof renderBanner === 'function') renderBanner();
        return;
      }

      if (data && data.trial_start) {
        // ✅ Supabase tiene trial_start → usar ese SIEMPRE (protege contra borrado de caché)
        var ts = new Date(data.trial_start).getTime();
        var current = parseInt(localStorage.getItem(KEY_START) || '0');

        // Si localStorage tiene un valor MÁS NUEVO (más reciente = menos días)
        // → descartar localStorage y usar el de Supabase (el correcto)
        if (!current || ts < current) {
          localStorage.setItem(KEY_START, ts.toString());
          console.log('[Trial] Restaurado desde Supabase:', new Date(ts).toLocaleDateString());
        }

      } else {
        // ✅ Primera vez — crear trial_start en Supabase ahora
        var now = new Date().toISOString();
        var nowMs = Date.now();

        // Guardar en Supabase (fuente de verdad)
        await sb.from('profiles').upsert({
          id: uid,
          trial_start: now,
          updated_at: now
        }, { onConflict: 'id' });

        // Cache en localStorage
        localStorage.setItem(KEY_START, nowMs.toString());
        console.log('[Trial] Iniciado en Supabase:', new Date(nowMs).toLocaleDateString());
      }

      // Después de sync: verificar expiración y actuar
      setTimeout(function() {
        var st2 = getStatus();
        if (st2.expired) {
          // Trial expirado confirmado por Supabase → bloqueo duro
          window.AF_Trial.checkExpiry();
        } else if (typeof renderBanner === 'function') {
          renderBanner(); // Mostrar banner de días restantes
        }
      }, 300);

    } catch(e) {
      console.warn('[Trial] Sync error:', e.message);
    }
  }
  function initTrial(userId) {
    if (!isTrialEligible()) return;
    if (localStorage.getItem(KEY_PAID) === '1') return;

    // Siempre sincronizar con Supabase al iniciar
    // Esto garantiza que localStorage tenga el valor correcto
    _syncTrialFromSupabase();
  }
  // localStorage se sincroniza desde Supabase al cargar
  function getStatus() {
    if (!isTrialEligible()) {
      const paid = localStorage.getItem(KEY_PAID);
      const productType = localStorage.getItem('af-product-type') || 'custom_muscle_gain';
      return { type: 'plan', paid: !!paid, daysLeft: 0, expired: false, productType, requiresPayment: !paid };
    }

    if (localStorage.getItem(KEY_PAID) === '1')
      return { active: true, paid: true, daysLeft: 999, expired: false };

    const start = parseInt(localStorage.getItem(KEY_START) || '0');

    // Sin trial_start en caché → mostrar 7 días mientras carga desde Supabase
    // (se corregirá en cuanto _syncTrialFromSupabase() responda)
    if (!start) {
      _syncTrialFromSupabase(); // lanzar sync
      return { active: true, paid: false, daysLeft: TRIAL_DAYS, expired: false, syncing: true };
    }

    const elapsed  = (Date.now() - start) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
    const dayNum   = Math.min(7, Math.max(1, Math.floor(elapsed) + 1));

    return {
      active:   daysLeft > 0,
      paid:     false,
      daysLeft: daysLeft,
      dayNum:   dayNum,
      expired:  daysLeft === 0,
    };
  }
  function renderBanner() {
    const st = getStatus();
    if (st.paid) {
      var old = document.getElementById('trial-banner');
      if (old) old.remove();
      return;
    }

    if (st.type === 'plan' && st.requiresPayment) {
      const existing2 = document.getElementById('plan-payment-banner');
      if (!existing2) {
        const pb = document.createElement('div');
        pb.id = 'plan-payment-banner';
        pb.style.cssText = 'margin:0 16px 12px;padding:14px 16px;border-radius:16px;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.25)';
        const reto = localStorage.getItem('af-selected-reto') || '';
        const planNames = { masa:'Aumento de masa muscular', definicion:'Reducción de % graso', custom_plan:'Plan personalizado' };
        pb.innerHTML = '<div style="font-size:13px;font-weight:700;color:#f1f0f4;margin-bottom:4px">' + (planNames[reto]||'Plan personalizado') + '</div>'
          + '<div style="font-size:12px;color:rgba(240,238,248,.6);margin-bottom:12px">Este plan requiere pago para iniciar. $72 USD/mes.</div>'
          + '<button onclick="window.AF_Trial?.openPaywall?.()" style="width:100%;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-family:\'Outfit\',sans-serif;font-size:13px;font-weight:700;cursor:pointer">Pagar plan → $72/mes</button>';
        const main = document.querySelector('main, .page, body');
        if (main) main.prepend(pb);
      }
      return;
    }

    const existing = document.getElementById('trial-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'trial-banner';

    if (st.expired) {
      banner.style.cssText = 'margin:0 16px 12px;padding:14px 16px;border-radius:16px;background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(236,72,153,.1));border:1px solid rgba(196,181,253,.25)';
      banner.innerHTML = '<div style="font-size:13px;font-weight:700;color:#f1f0f4;margin-bottom:4px">Tu trial terminó 💜</div>'
        + '<div style="font-size:12px;color:rgba(240,238,248,.6);margin-bottom:12px;line-height:1.5">Llevas ' + getTotalSessions() + ' sesiones. Tu progreso está guardado.</div>'
        + '<button onclick="window.AF_Trial.openPaywall()" style="width:100%;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-family:\'Outfit\',sans-serif;font-size:13px;font-weight:700;cursor:pointer">Desbloquear reto →</button>';
    } else {
      banner.style.cssText = 'margin:0 16px 12px;padding:11px 14px;border-radius:14px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);display:flex;align-items:center;justify-content:space-between;gap:12px';
      banner.innerHTML = '<div>'
        + '<div style="font-size:12px;font-weight:600;color:#fcd34d">' + st.daysLeft + ' día' + (st.daysLeft !== 1 ? 's' : '') + ' de prueba</div>'
        + '<div style="font-size:11px;color:rgba(252,211,77,.6)">Tu progreso se mantiene</div>'
        + '</div>'
        + '<button onclick="window.AF_Trial.openPaywall()" style="padding:7px 14px;border-radius:10px;border:none;background:rgba(245,158,11,.2);color:#fcd34d;font-family:\'Outfit\',sans-serif;font-size:12px;font-weight:600;cursor:pointer">Ver Premium</button>';
    }

    const hero = document.querySelector('.hero-card, .coach-card, #coachCard');
    if (hero) hero.insertAdjacentElement('afterend', banner);
    else {
      const scroll = document.querySelector('.scroll, #scroll, main');
      if (scroll) scroll.prepend(banner);
    }
  }
  function openPaywall() {
    const st = getStatus();
    const sessions = getTotalSessions();
    const existing = document.getElementById('af-paywall');
    if (existing) { existing.remove(); return; }

    const ov = document.createElement('div');
    ov.id = 'af-paywall';
    ov.style.cssText = "position:fixed;inset:0;z-index:500;background:rgba(8,5,17,.95);backdrop-filter:blur(20px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;font-family:'Outfit',sans-serif;overflow-y:auto";
    ov.innerHTML = '<div style="max-width:340px;width:100%;text-align:center">'
      + '<div style="font-size:40px;margin-bottom:16px">💜</div>'
      + '<div style="font-size:22px;font-weight:700;color:#f1f0f4;margin-bottom:8px;letter-spacing:-.03em">' + (st.expired ? 'Tu trial terminó' : st.daysLeft + ' días restantes') + '</div>'
      + '<div style="font-size:14px;color:rgba(240,238,248,.5);margin-bottom:28px;line-height:1.6">' + (sessions > 0 ? 'Llevas <b style="color:#c4b5fd">' + sessions + ' sesiones</b> completadas.<br>Tu progreso no desaparece.' : 'Tu progreso está guardado y te espera.') + '</div>'
      + '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:16px;margin-bottom:20px;text-align:left">'
      + ['🏋️ 37 días de entrenamientos progresivos','🤖 Coach Arju sin límites','🥗 Recetario LATAM + recetas del reto','📊 Progreso y seguimiento completo','🔒 Tu progreso no desaparece'].map(function(f){ return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px;color:rgba(240,238,248,.8)">' + f + '</div>'; }).join('')
      + '</div>'
      + '<div style="margin-bottom:20px"><div style="font-size:32px;font-weight:800;color:#f1f0f4">$32</div><div style="font-size:12px;color:rgba(240,238,248,.4)">USD · acceso completo al reto</div></div>'
      + '<button onclick="window.AF_Trial.handlePurchase()" style="width:100%;padding:15px;border-radius:16px;border:none;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:10px;box-shadow:0 4px 20px rgba(124,58,237,.4)">Desbloquear reto por $32 USD →</button>'
      + '<button onclick="document.getElementById(\'af-paywall\').remove()" style="width:100%;padding:12px;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(240,238,248,.4);font-size:14px;cursor:pointer">' + (st.expired ? 'Ver mi progreso' : 'Seguir con trial') + '</button>'
      + '</div>';
    document.body.appendChild(ov);
  }

  const WHATSAPP_NUMBER = '573209497919';

  function handlePurchase(productId) {
    if (window.AF_Exp) AF_Exp.trackClick('paywall_summary', 'unlock_clicked');
    if (window.AF) AF.track('unlock_clicked', { product: productId || localStorage.getItem('af-product-type') });
    if (window.AF_Commerce) { window.AF_Commerce.handleCommercialAction(productId || localStorage.getItem('af-product-type')); return; }
    const url = getCheckoutUrl();
    if (url) { window.open(url, '_blank'); return; }
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
    ov.innerHTML = '<div style="max-width:360px;width:100%;text-align:center"><div style="font-size:48px;margin-bottom:16px">🔓</div><div style="font-size:20px;font-weight:800;color:#f1f0f4;margin-bottom:8px;letter-spacing:-.02em">Desbloquea tu reto</div><div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:24px;line-height:1.6">Tu progreso se guarda.<br>Escríbele a Arjuna para continuar.</div><a href="' + waUrl + '" target="_blank" style="display:block;padding:16px;border-radius:16px;background:#25D366;color:#fff;font-size:15px;font-weight:800;text-decoration:none;margin-bottom:12px;box-shadow:0 6px 24px rgba(37,211,102,.3)">💬 Hablar con Arjuna →</a><button onclick="document.getElementById(\'wa-paywall-ov\').remove()" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.35);font-size:13px;cursor:pointer">Volver</button></div>';
    document.body.appendChild(ov);
    if (window.AF) AF.track('whatsapp_paywall_viewed', { reto: retoName });
  }

  function showDay7Summary() {
    if (document.getElementById('day7-summary-ov')) return;
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
    const retoName = reto === 'pancita' || reto === 'challenge_belly' ? 'Reto para bajar la pancita' : 'Reto de glúteos';
    const ov = document.createElement('div');
    ov.id = 'day7-summary-ov';
    ov.style.cssText = "position:fixed;inset:0;z-index:550;background:rgba(8,5,17,.97);overflow-y:auto;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;padding:24px";
    ov.innerHTML = '<div style="max-width:360px;width:100%;text-align:center"><div style="font-size:48px;margin-bottom:16px">🎉</div><div style="font-size:22px;font-weight:800;color:#f1f0f4;letter-spacing:-.02em;margin-bottom:8px">Terminaste tus 7 días gratis</div><div style="font-size:14px;color:rgba(255,255,255,.5);margin-bottom:24px;line-height:1.6">Ya probaste cómo ArjunaFit organiza tu entrenamiento, nutrición y acompañamiento.</div>'
      + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">'
      + '<div style="background:rgba(250,204,21,.08);border:1px solid rgba(250,204,21,.15);border-radius:14px;padding:14px 8px"><div style="font-size:24px;font-weight:800;color:rgba(250,204,21,.9)">' + sessions + '</div><div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">entrenos</div></div>'
      + '<div style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.15);border-radius:14px;padding:14px 8px"><div style="font-size:24px;font-weight:800;color:rgba(52,211,153,.9)">' + mealsCount + '</div><div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">comidas</div></div>'
      + '<div style="background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.15);border-radius:14px;padding:14px 8px"><div style="font-size:24px;font-weight:800;color:rgba(196,181,253,.9)">7</div><div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">días</div></div>'
      + '</div>'
      + '<div style="background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.12);border-radius:14px;padding:14px;margin-bottom:20px;font-size:13px;color:rgba(219,234,254,.75);line-height:1.6">No se trata de haberlo hecho perfecto. Se trata de que ya empezaste.</div>'
      + '<button onclick="window.AF_Trial.handlePurchase()" style="width:100%;padding:15px;border-radius:16px;border:none;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-size:15px;font-weight:800;box-shadow:0 6px 24px rgba(124,58,237,.35);margin-bottom:10px">Desbloquear reto completo →</button>'
      + '<button onclick="document.getElementById(\'day7-summary-ov\').remove()" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:transparent;color:rgba(255,255,255,.35);font-size:13px;cursor:pointer">Ver mi resumen</button>'
      + '</div>';
    document.body.appendChild(ov);
  }

  function checkDay7() {
    const st = getStatus();
    if (!st.active || st.paid) return;
    const daysUsed = TRIAL_DAYS - st.daysLeft;
    if (daysUsed >= 6) {
      const shown7Key = 'af-day7-shown-' + new Date().toISOString().split('T')[0];
      if (!localStorage.getItem(shown7Key)) {
        localStorage.setItem(shown7Key, '1');
        setTimeout(showDay7Summary, 3000);
      }
    }
  }

  function checkExpiry() {
    const st = getStatus();
    if (!st.expired) return false;

    // Trial confirmado expirado — verificar vs Supabase antes de bloquear
    // Esto evita falsos positivos si localStorage está desincronizado
    _syncTrialFromSupabase().then(function() {
      const st2 = getStatus();
      if (!st2.expired) return; // Supabase dice que no expiró — dejar pasar
      
      // Expirado confirmado — bloqueo DURO
      // Mostrar paywall fullscreen sin opción de cerrar
      var existing = document.getElementById('af-hard-block');
      if (existing) return;

      var ov = document.createElement('div');
      ov.id = 'af-hard-block';
      ov.style.cssText = [
        'position:fixed','inset:0','z-index:9999',
        "background:rgba(8,5,17,.98)",
        'display:flex','flex-direction:column',
        'align-items:center','justify-content:center',
        'padding:32px 24px',"font-family:'Outfit',sans-serif",
        'overflow-y:auto'
      ].join(';');

      var sessions = getTotalSessions();
      var checkoutUrl = getCheckoutUrl();

      ov.innerHTML = [
        '<div style="max-width:340px;width:100%;text-align:center">',
        '<div style="font-size:44px;margin-bottom:16px">⏰</div>',
        '<div style="font-size:22px;font-weight:800;color:#f1f0f4;margin-bottom:8px;letter-spacing:-.03em">',
        'Tus 7 días gratis terminaron</div>',
        '<div style="font-size:14px;color:rgba(255,255,255,.5);line-height:1.6;margin-bottom:24px">',
        sessions > 0
          ? 'Completaste <b style="color:#c4b5fd">' + sessions + ' sesiones</b>.<br>Tu progreso está guardado y te espera.'
          : 'Tu progreso está guardado y te espera.',
        '</div>',
        '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:16px;margin-bottom:20px;text-align:left">',
        ['🏋️ 56 días de entrenamientos','🤖 Coach Arju sin límites','🥗 Recetario completo LATAM',
         '📊 Progreso y seguimiento','🔒 Tu avance no desaparece'].map(function(f) {
          return '<div style="display:flex;align-items:center;gap:10px;padding:5px 0;font-size:13px;color:rgba(255,255,255,.75)">' + f + '</div>';
        }).join(''),
        '</div>',
        '<div style="margin-bottom:20px">',
        '<div style="font-size:34px;font-weight:800;color:#f1f0f4">$32 USD</div>',
        '<div style="font-size:12px;color:rgba(255,255,255,.35)">acceso completo al reto · pago único</div>',
        '</div>',
        '<a href="' + checkoutUrl + '" target="_blank" ',
        'style="display:block;width:100%;padding:15px;border-radius:16px;border:none;',
        'background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-size:16px;',
        'font-weight:800;text-align:center;text-decoration:none;cursor:pointer;',
        'box-shadow:0 6px 24px rgba(124,58,237,.4);margin-bottom:10px">',
        'Desbloquear reto por $32 USD →</a>',
        '<a href="https://wa.me/573209497919?text=' + encodeURIComponent('Hola! Terminaron mis 7 días de prueba en ArjunaFit y quiero continuar.') + '" ',
        'target="_blank" style="display:block;width:100%;padding:12px;border-radius:14px;',
        'background:rgba(37,211,102,.15);border:1px solid rgba(37,211,102,.3);color:#4ade80;',
        'font-size:13px;font-weight:600;text-align:center;text-decoration:none">',
        '💬 Hablar con Arjuna por WhatsApp</a>',
        '</div>'
      ].join('');

      document.body.appendChild(ov);
      // NO hay botón de cerrar — bloqueo real
    });

    return true;
  }

  function getTotalSessions() {
    try { return Object.keys(localStorage).filter(k => k.startsWith('af-sets-')).length; }
    catch(e) { return 0; }
  }
  // Al cargar la página: sincronizar con Supabase y verificar expiración
  document.addEventListener('DOMContentLoaded', function() {
    // Sync inmediato con Supabase
    _syncTrialFromSupabase().then(function() {
      // Después de sync, verificar si expiró
      if (isTrialEligible()) {
        var st = getStatus();
        if (st.expired) {
          // Expirado → bloqueo duro automático al cargar la página
          window.AF_Trial.checkExpiry();
        }
      }
    });
  });

  window.AF_Trial = {
    initTrial, getStatus, renderBanner, openPaywall, handlePurchase,
    checkExpiry, showDay7Summary, checkDay7, getTrialDayMsg, getCheckoutUrl,
    showWhatsAppPaywall, syncFromSupabase: _syncTrialFromSupabase
  };

})();
