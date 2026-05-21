// ════════════════════════════════════════════════════════════════
// ArjunaFit — Ops Config (Feature Flags + Monitoring)
// production-monitoring-ops-v1
// ════════════════════════════════════════════════════════════════
'use strict';

// ── App version ───────────────────────────────────────────────────
window.AF_BUILD = {
  version: 'beta-ready-mini-launch-v1',
  buildDate: '2026-05-18',
  environment: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
               ? 'local' : 'production',
};

// ── Feature flags ─────────────────────────────────────────────────
window.AF_FLAGS = {
  enablePhotoFoodAI:     true,   // AI food photo recognition
  enableHotmartCheckout: true,   // Live Hotmart payment links
  enableCommunity:       true,   // Community section access
  enableAdminMetrics:    true,   // Admin growth charts
  enableBetaBanner:      true,   // Beta feedback button
  enableCoachAI:         true,   // Coach Arju AI responses
  enableRecipeRecommend: true,   // Smart recipe recommendations
  maintenanceMode:       false,  // Emergency kill switch
};

// Check maintenance mode on load
if (window.AF_FLAGS.maintenanceMode) {
  var path = window.location.pathname;
  var isAdmin = localStorage.getItem('af-is-admin') === '1';
  if (!isAdmin && !path.includes('admin')) {
    document.addEventListener('DOMContentLoaded', function() {
      document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Outfit,sans-serif;background:#07020f;color:#f5f3ff;text-align:center;padding:24px">' +
        '<div style="font-size:40px;margin-bottom:16px">🔧</div>' +
        '<div style="font-size:20px;font-weight:800;margin-bottom:10px">Ajuste rápido en curso</div>' +
        '<div style="font-size:14px;color:rgba(255,255,255,.45);max-width:320px;line-height:1.7">ArjunaFit estará disponible de nuevo en unos minutos. Gracias por tu paciencia.</div>' +
      '</div>';
    });
  }
}

// ── Global error handler ──────────────────────────────────────────
window.onerror = function(message, source, lineno, colno, error) {
  var msg = String(message || '').substring(0, 400);
  // Don't log "Script error" cross-origin noise
  if (msg === 'Script error.' || !msg) return false;
  console.warn('[AF Error]', msg, 'at', (source||'') + ':' + lineno);
  // Defer logging to avoid circular errors during page load
  setTimeout(function() {
    try {
      var meta = { source: source, line: lineno, col: colno, version: window.AF_BUILD?.version };
      if (window.AF_logError) AF_logError(window.location.pathname, msg, 'error', meta);
    } catch(e) { /* ignore logging errors */ }
  }, 100);
  return false; // don't suppress
};

window.onunhandledrejection = function(event) {
  var msg = String(event.reason?.message || event.reason || 'Unhandled promise rejection').substring(0, 400);
  if (window.AF_logError) AF_logError(window.location.pathname, msg, 'warning', { version: window.AF_BUILD?.version });
};

// ── Loading timeout helper ────────────────────────────────────────
// Usage: var cancel = AF_loadTimeout(8000, function() { showError(); });
window.AF_loadTimeout = function(ms, onTimeout) {
  var timer = setTimeout(function() {
    if (window.AF_logError) AF_logError(window.location.pathname, 'Loading timeout (' + ms + 'ms)', 'warning');
    if (onTimeout) onTimeout();
  }, ms || 8000);
  return function() { clearTimeout(timer); }; // returns cancel fn
};

// ── Log app version to console ────────────────────────────────────
(function() {
  var env = window.AF_BUILD.environment;
  var style = 'background:#8b5cf6;color:#fff;padding:2px 7px;border-radius:4px;font-weight:700';
  console.log('%c ArjunaFit %c ' + window.AF_BUILD.version + ' [' + env + '] ', style, '');
})();
