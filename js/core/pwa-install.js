// ═══════════════════════════════════════════════════════════════
// ArjunaFit — PWA Install + Standalone Detection
// branding-manifest-splash-install-v1
// ═══════════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ── Detect standalone ──────────────────────────────────────────
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone && window.AF) {
    AF.track('pwa_opened_standalone', { version: window.AF_VERSION || '' });
  }

  // ── Capture beforeinstallprompt ────────────────────────────────
  var _deferred = null;

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    _deferred = e;
    console.log('[PWA] install prompt captured');
    if (typeof window.AF_showInstallCard === 'function') window.AF_showInstallCard();
    if (window.AF) AF.track('pwa_install_prompt_shown', {});
  });

  window.addEventListener('appinstalled', function() {
    console.log('[PWA] app installed');
    _deferred = null;
    if (window.AF) AF.track('pwa_installed', {});
  });

  // ── Public: trigger install ─────────────────────────────────────
  window.AF_installPWA = async function() {
    if (!_deferred) {
      window.AF_showManualInstall();
      return;
    }
    try {
      _deferred.prompt();
      var result = await _deferred.userChoice;
      if (window.AF) AF.track('pwa_install_prompt_result', { outcome: result.outcome });
      _deferred = null;
    } catch(e) {
      console.warn('[PWA] install error:', e.message);
      window.AF_showManualInstall();
    }
  };

  // ── Manual instructions ─────────────────────────────────────────
  window.AF_showManualInstall = function() {
    var ua = navigator.userAgent;
    var isIOS    = /iPhone|iPad|iPod/.test(ua);
    var isAndroid= /Android/.test(ua);
    var msg = isIOS
      ? 'En Safari: toca el botón de compartir ↑ y luego "Agregar a pantalla de inicio".'
      : isAndroid
      ? 'En Chrome: abre el menú (⋮) y toca "Agregar a pantalla principal".'
      : 'Busca el ícono de instalar (⊕) en la barra del navegador.';
    if (typeof window.AF_showManualInstallModal === 'function') {
      window.AF_showManualInstallModal(msg);
    } else {
      alert(msg);
    }
    if (window.AF) AF.track('manual_install_instructions_viewed', {
      platform: isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
    });
  };

  // ── Install card dismiss ────────────────────────────────────────
  window.AF_dismissInstallCard = function() {
    var card = document.getElementById('afInstallCard');
    if (card) card.style.display = 'none';
    try { localStorage.setItem('af-install-dismissed', '1'); } catch(e) {}
    if (window.AF) AF.track('install_card_dismissed', {});
  };

  // ── Show install card ───────────────────────────────────────────
  window.AF_showInstallCard = function() {
    if (isStandalone) return;
    try { if (localStorage.getItem('af-install-dismissed') === '1') return; } catch(e) {}
    var card = document.getElementById('afInstallCard');
    if (card) card.style.display = 'flex';
  };

})();
