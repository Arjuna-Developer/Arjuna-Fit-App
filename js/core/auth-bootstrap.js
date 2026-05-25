// ════════════════════════════════════════════════════════════════
// ArjunaFit — Auth Bootstrap Central V1
// auth-session-route-stability-v1
// ════════════════════════════════════════════════════════════════
'use strict';

var _AB_URL  = 'https://egswsqymkxmbtcpnozcq.supabase.co';
var _AB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM';
var _AB_WA   = 'https://wa.link/hteek6';
var _AB_ADMIN = 'arjuna.desarrollador@gmail.com';
var _AB_CUSTOM = ['custom_muscle_gain','custom_fat_loss'];
var _AB_RETOS  = ['challenge_glutes','challenge_belly'];

// ── Internal helpers — all use [AuthBootstrap] prefix via _log/_warn ──
function _log(msg, data) {
}
function _warn(msg, data) {
  console.warn('[AuthBootstrap] ' + msg, data !== undefined ? data : '');
}

function _getSB() {
  if (window._sb) return window._sb;
  if (window.supabase && window.supabase.createClient) {
    var sb = window.supabase.createClient(_AB_URL, _AB_KEY,
      { auth: { persistSession: true, storageKey: 'arjunafit-auth' } });
    window._sb = sb;
    return sb;
  }
  return null;
}

function _race(promise, ms) {
  return Promise.race([
    promise,
    new Promise(function(_, rej) {
      setTimeout(function() { rej(new Error('ab_timeout_' + ms)); }, ms);
    })
  ]);
}

function _ls(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function _lsSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }

// ── Public: Show error screen ─────────────────────────────────────
window.AB_showError = function(msg, ldrId) {
  var el = document.getElementById(ldrId || 'ldr') || document.body;
  el.style.cssText = 'display:flex!important;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:32px;background:#07020f;color:#f5f3ff;font-family:Outfit,sans-serif;text-align:center;position:fixed;inset:0;z-index:9999';
  var wa = (window.AF_Support && AF_Support.whatsappUrl) || _AB_WA;
  el.innerHTML =
    '<div style="font-size:44px;margin-bottom:16px">😓</div>' +
    '<div style="font-size:18px;font-weight:800;margin-bottom:10px">No pudimos cargar tu sesión</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,.45);max-width:300px;line-height:1.7;margin-bottom:28px">' +
      (msg || 'Tu cuenta puede estar creada, pero algo no cargó bien.') +
    '</div>' +
    '<button onclick="location.reload()" style="padding:12px 28px;background:linear-gradient(135deg,#8b5cf6,#ec4899);border:none;border-radius:14px;color:#fff;font-family:Outfit,sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:10px;width:220px">🔄 Intentar de nuevo</button>' +
    '<a href="/" style="display:block;padding:10px 28px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;color:rgba(255,255,255,.6);font-family:Outfit,sans-serif;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:10px;width:220px;box-sizing:border-box">Ir al inicio</a>' +
    '<a href="' + wa + '" target="_blank" style="font-size:12px;color:rgba(139,92,246,.7);text-decoration:none;margin-top:4px">💬 Hablar con Arjuna</a>' +
    '<button onclick="window._sb&&window._sb.auth.signOut().then(function(){window.location.href=\'/\'})" style="background:none;border:none;color:rgba(255,255,255,.2);font-size:11px;cursor:pointer;margin-top:16px;font-family:Outfit,sans-serif">Cerrar sesión</button>';
};

// ── Public: Stop loading overlay ──────────────────────────────────
window.AB_stopLoading = function(ldrId) {
  var ldr = document.getElementById(ldrId || 'ldr');
  if (ldr) { ldr.classList.add('off'); ldr.style.display = 'none'; }
};

window.AB_setLoadingText = function(txt, ldrId) {
  var ldr = document.getElementById(ldrId || 'ldr');
  if (!ldr) return;
  var t = ldr.querySelector('[data-loading-text]') || ldr.querySelector('p') || ldr.querySelector('div:last-child') || ldr;
  if (t) t.textContent = txt;
};

// ════════════════════════════════════════════════════════════════
// 1. getSessionWithTimeout
// ════════════════════════════════════════════════════════════════
window.AB_getSession = async function(ms) {
  ms = ms || 5000;
  _log('getting session, timeout=' + ms + 'ms');
  var sb = _getSB();
  if (!sb) { _warn('Supabase not available'); return null; }
  try {
    var result = await _race(sb.auth.getSession(), ms);
    var session = result?.data?.session || null;
    _log('session:', session ? 'ok uid=' + session.user.id.substring(0,8) : 'null');
    return session;
  } catch(e) {
    _warn('session error:', e.message);
    return null;
  }
};

// ════════════════════════════════════════════════════════════════
// 2. ensureUserProfile
// ════════════════════════════════════════════════════════════════
window.AB_ensureProfile = async function(user) {
  if (!user) return null;
  var sb = _getSB();
  if (!sb) return null;
  _log('loading profile uid:', user.id.substring(0,8));

  // Try to load existing profile
  try {
    var result = await _race(
      sb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      4000
    );
    if (result?.data) {
      _log('profile found');
      return result.data;
    }
  } catch(e) { _warn('profile fetch error:', e.message); }

  // Create minimal profile
  _log('profile missing, creating...');
  var productType = _ls('af-product-type') || '';
  var isCustom    = _AB_CUSTOM.includes(productType);
  var isAdmin     = user.email === _AB_ADMIN;

  var newProfile = {
    id:                  user.id,
    email:               user.email,
    full_name:           _ls('af-user-name') || user.email?.split('@')[0] || '',
    role:                isAdmin ? 'admin' : 'user',
    is_admin:            isAdmin,
    product_type:        productType || null,
    subscription_status: isCustom ? 'payment_required' : (productType ? 'trialing' : 'inactive'),
    access_level:        isCustom ? 'locked' : (productType ? 'trial' : 'locked'),
    onboarding_completed: _ls('af-onboarding-completed') === '1',
    updated_at:          new Date().toISOString()
  };

  try {
    await _race(sb.from('profiles').upsert(newProfile, { onConflict: 'id' }), 4000);
    _log('profile created ok');
  } catch(e) { _warn('profile create error:', e.message); }

  return newProfile;
};

// ════════════════════════════════════════════════════════════════
// 3. resolveUserProductState
// ════════════════════════════════════════════════════════════════
window.AB_resolveProduct = function(profile) {
  // Priority: profile → localStorage → URL param
  var product = profile?.product_type
    || profile?.selected_product
    || _ls('af-pending-product')
    || _ls('af-product-type')
    || new URLSearchParams(window.location.search).get('product')
    || '';

  var isReto   = _AB_RETOS.includes(product);
  var isCustom = _AB_CUSTOM.includes(product);

  var state = {
    product:             product,
    isReto:              isReto,
    isCustom:            isCustom,
    hasProduct:          !!(product),
    subscriptionStatus:  profile?.subscription_status || _ls('af-subscription-status') || 'inactive',
    accessLevel:         profile?.access_level        || _ls('af-access-level')        || 'locked',
    onboardingCompleted: profile?.onboarding_completed || _ls('af-onboarding-completed') === '1',
    isAdmin:             profile?.is_admin === true || profile?.role === 'admin', // NEVER from localStorage
  };

  _log('product resolved:', product || '(none)');
  _log('subscription_status:', state.subscriptionStatus);
  _log('access_level:', state.accessLevel);
  _log('onboarding_completed:', state.onboardingCompleted);

  return state;
};

// ════════════════════════════════════════════════════════════════
// 4. syncLocalStorage — keep localStorage in sync with profile
// ════════════════════════════════════════════════════════════════
window.AB_syncLS = function(profile) {
  if (!profile) return;
  if (profile.product_type)        _lsSet('af-product-type',        profile.product_type);
  if (profile.subscription_status) _lsSet('af-subscription-status', profile.subscription_status);
  if (profile.access_level)        _lsSet('af-access-level',         profile.access_level);
  if (profile.is_admin)            _lsSet('af-is-admin',             '1');
  if (profile.onboarding_completed) _lsSet('af-onboarding-completed','1');
  if (profile.id)                  _lsSet('af-user-id',              profile.id);
  if (profile.full_name)           _lsSet('af-user-name',            profile.full_name);
};

// ════════════════════════════════════════════════════════════════
// 5. redirectByUserState — THE CENTRAL ROUTER
// ════════════════════════════════════════════════════════════════
window.AB_redirect = function(state, currentPage) {
  currentPage = currentPage || window.location.pathname;
  var dest = null;

  // Admin
  if (state.isAdmin) {
    if (currentPage.includes('admin-beta') || currentPage.includes('growth') || currentPage.includes('commercial')) {
      _log('admin on admin page — staying');
      return; // already on admin page
    }
    // Admin on login pages → go to admin
    if (currentPage === '/' || currentPage.includes('index') || currentPage.includes('admin-login')) {
      dest = '/pages/admin-beta.html';
    }
    // Admin on app pages → let them stay (admins can use app too)
  }

  if (!dest) {
    if (!state.hasProduct) {
      dest = '/signup';
    } else if (state.isCustom) {
      var isPaid = state.subscriptionStatus === 'active';
      dest = isPaid ? '/pages/dashboard.html' : '/pages/custom-plan-intake.html';
    } else if (state.isReto) {
      dest = state.onboardingCompleted ? '/pages/dashboard.html' : '/pages/onboarding.html';
    } else {
      dest = '/pages/dashboard.html';
    }
  }

  _log('redirect to:', dest);
  if (dest && !currentPage.includes(dest.replace('/pages/','').replace('.html',''))) {
    window.location.replace(dest);
  }
};

// ════════════════════════════════════════════════════════════════
// 6. AB_boot — full auth bootstrap for any page
// ════════════════════════════════════════════════════════════════
window.AB_boot = async function(options) {
  options = options || {};
  var ldrId       = options.ldrId || 'ldr';
  var requireAuth = options.requireAuth !== false;
  var autoRedirect= options.autoRedirect || false;
  var onReady     = options.onReady; // callback(session, profile, state)

  _log('start — page:', window.location.pathname);

  // Hard timeout: if everything fails after 8s, show error
  var hardTimer = setTimeout(function() {
    _warn('HARD TIMEOUT 8s — showing error screen');
    window.AB_showError(null, ldrId);
  }, 8000);

  try {
    AB_setLoadingText('Verificando sesión...', ldrId);

    // 1. Get session
    var session = await AB_getSession(5000);

    // 2. No session
    if (!session) {
      var justRegistered = !!_ls('af-user-name');
      _log('no session | justRegistered:', justRegistered);
      if (requireAuth && !justRegistered) {
        clearTimeout(hardTimer);
        _log('redirect → login');
        window.location.replace('/?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }
      // Registered but unconfirmed — proceed with localStorage
      clearTimeout(hardTimer);
      AB_stopLoading(ldrId);
      var lsState = AB_resolveProduct(null);
      if (onReady) onReady(null, null, lsState);
      return;
    }

    // 3. Ensure profile
    AB_setLoadingText('Cargando tu perfil...', ldrId);
    var profile = await AB_ensureProfile(session.user);

    clearTimeout(hardTimer);

    // 4. Sync localStorage
    AB_syncLS(profile);

    // 5. Resolve state
    var state = AB_resolveProduct(profile);
    _log('user type:', state.isAdmin ? 'admin' : state.isReto ? 'reto' : state.isCustom ? 'custom' : 'unknown');
    _log('finished');

    // 6. Auto-redirect if requested
    if (autoRedirect) AB_redirect(state);

    // 7. Callback
    AB_stopLoading(ldrId);
    if (onReady) onReady(session, profile, state);

  } catch(err) {
    clearTimeout(hardTimer);
    _warn('error:', err.message);
    AB_showError(null, ldrId);
  }
};

_log('loaded v1'); // [AuthBootstrap] logs active
