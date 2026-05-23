// js/core/session-cache.js
// Una sola auth.getSession() compartida por toda la app
// Elimina las 5-11 llamadas duplicadas por página
(function() {
  'use strict';

  var _sessionPromise = null;
  var _session = null;
  var _resolved = false;

  function initSB() {
    return window.sb || (window.supabase && window.supabase.createClient(
      'https://egswsqymkxmbtcpnozcq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM',
      { auth: { persistSession: true, storageKey: 'arjunafit-auth' } }
    ));
  }

  // Una sola Promise — todas las llamadas comparten el resultado
  window.AF_getSession = function() {
    if (_resolved) return Promise.resolve(_session);
    if (_sessionPromise) return _sessionPromise;

    var sb = initSB();
    if (!sb) return Promise.resolve(null);

    _sessionPromise = Promise.race([
      sb.auth.getSession(),
      new Promise(function(resolve) {
        setTimeout(function() { resolve({ data: { session: null } }); }, 5000);
      })
    ]).then(function(result) {
      _session = result?.data?.session || null;
      _resolved = true;
      // Guardar UID en window para acceso rápido sin await
      if (_session?.user?.id) {
        window.AF_uid = _session.user.id;
        window.AF_user = _session.user;
        localStorage.setItem('af-uid', _session.user.id);
      }
      return _session;
    }).catch(function() {
      _resolved = true;
      return null;
    });

    return _sessionPromise;
  };

  // Obtener UID sin async (usa cache)
  window.AF_getUID = function() {
    return window.AF_uid || localStorage.getItem('af-uid') || null;
  };

  // Invalidar cache (en logout)
  window.AF_clearSession = function() {
    _sessionPromise = null;
    _session = null;
    _resolved = false;
    window.AF_uid = null;
    window.AF_user = null;
  };

  // Pre-cargar sesión inmediatamente al cargar el script
  document.addEventListener('DOMContentLoaded', function() {
    window.AF_getSession();
  });

  // También iniciar inmediatamente si el DOM ya cargó
  if (document.readyState !== 'loading') {
    window.AF_getSession();
  }

})();
