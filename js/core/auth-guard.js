// ════════════════════════════════════════════════════════════════
// ArjunaFit — Auth Guard Central
// fix-auth-guard-session-loading-p0
// ════════════════════════════════════════════════════════════════
'use strict';

var SUPABASE_URL = 'https://egswsqymkxmbtcpnozcq.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM';

// ── Helper: safe Supabase client ──────────────────────────────────
function getSB() {
  if (window._sb) return window._sb;
  if (window.supabase && window.supabase.createClient) {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY,
      { auth: { persistSession: true, storageKey: 'arjunafit-auth' } });
  }
  return null;
}

// ── Helper: timeout wrapper ───────────────────────────────────────
function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(function(_, reject) {
      setTimeout(function() { reject(new Error('timeout_' + ms)); }, ms);
    })
  ]).catch(function() { return fallback; });
}

// ── Helper: error screen ──────────────────────────────────────────
function showSessionError(containerId, msg) {
  var el = document.getElementById(containerId || 'ldr');
  if (!el) el = document.body;
  el.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:32px;background:#07020f;color:#f5f3ff;font-family:Outfit,sans-serif;text-align:center';
  el.innerHTML =
    '<div style="font-size:40px;margin-bottom:16px">😓</div>' +
    '<div style="font-size:18px;font-weight:800;margin-bottom:10px">No pudimos cargar tu sesión</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,.45);max-width:300px;line-height:1.7;margin-bottom:24px">' +
      (msg || 'Tu cuenta puede estar creada, pero algo no cargó bien. Intenta de nuevo.') +
    '</div>' +
    '<button onclick="location.reload()" style="padding:12px 24px;background:linear-gradient(135deg,#8b5cf6,#ec4899);border:none;border-radius:12px;color:#fff;font-family:Outfit,sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:10px">🔄 Intentar de nuevo</button>' +
    '<a href="/" style="font-size:13px;color:rgba(255,255,255,.4);text-decoration:none;display:block;margin-top:8px">Ir al inicio</a>' +
    '<button onclick="window.supabase&&window.supabase.createClient(\'' + SUPABASE_URL + '\',\'' + SUPABASE_ANON_KEY + '\').auth.signOut().then(function(){window.location.href=\'/\'})" style="background:none;border:none;color:rgba(255,255,255,.25);font-size:11px;cursor:pointer;margin-top:12px;font-family:Outfit,sans-serif">Cerrar sesión</button>';
}

// ════════════════════════════════════════════════════════════════
// resolveSessionRoute — CENTRAL AUTH GUARD
// ════════════════════════════════════════════════════════════════
window.resolveSessionRoute = async function(options) {
  options = options || {};
  var requireAuth    = options.requireAuth !== false; // default true
  var redirectNoAuth = options.redirectNoAuth || '/';
  var onResolved     = options.onResolved;            // callback(session, profile)
  var loadingId      = options.loadingId || 'ldr';
  var TIMEOUT        = options.timeout || 5000;

  var ldr = document.getElementById(loadingId);
  function setLdrText(txt) {
    if (ldr) {
      var t = ldr.querySelector('[data-loading-text]') || ldr.querySelector('div:last-child') || ldr;
      t.textContent = txt;
    }
  }
  function hideLdr() {
    if (ldr) { ldr.classList.add('off'); ldr.style.display = 'none'; }
  }

  console.log('[AuthGuard] start — route:', window.location.pathname);

  try {
    // ── 1. Get session with timeout ───────────────────────────────
    setLdrText('Verificando sesión...');
    var sb = getSB();
    if (!sb) throw new Error('Supabase not available');

    var sessionResult = await withTimeout(sb.auth.getSession(), TIMEOUT, { data: { session: null } });
    var session = sessionResult?.data?.session || null;
    console.log('[AuthGuard] session:', session ? 'ok uid='+session.user.id.substring(0,8) : 'null');

    // ── 2. No session handling ────────────────────────────────────
    if (!session) {
      var isJustRegistered = !!localStorage.getItem('af-user-name');
      var productType = localStorage.getItem('af-product-type') || '';
      console.log('[AuthGuard] no session | isJustRegistered:', isJustRegistered, '| product:', productType);

      if (requireAuth && !isJustRegistered) {
        console.log('[AuthGuard] redirect → login');
        window.location.replace(redirectNoAuth);
        return;
      }
      // Just registered → proceed with localStorage context
      if (onResolved) onResolved(null, null);
      hideLdr();
      return;
    }

    var uid = session.user.id;

    // ── 3. Load or create profile ─────────────────────────────────
    setLdrText('Cargando tu perfil...');
    console.log('[AuthGuard] loading profile uid:', uid.substring(0,8));

    var profileResult = await withTimeout(
      sb.from('profiles').select('*').eq('id', uid).maybeSingle(),
      TIMEOUT,
      { data: null, error: { message: 'profile_timeout' } }
    );
    var profile = profileResult?.data || null;
    console.log('[AuthGuard] profile loaded:', profile ? 'ok' : 'null');

    // ── 4. Create profile if missing ──────────────────────────────
    if (!profile) {
      console.log('[AuthGuard] profile missing, creating...');
      var productType = localStorage.getItem('af-product-type') || '';
      var userName    = localStorage.getItem('af-user-name') || session.user.email?.split('@')[0] || '';
      var isCustom    = ['custom_muscle_gain','custom_fat_loss'].includes(productType);

      var newProfile = {
        id:                  uid,
        email:               session.user.email,
        full_name:           userName,
        product_type:        productType || null,
        subscription_status: isCustom ? 'payment_required' : (productType ? 'trialing' : 'inactive'),
        access_level:        isCustom ? 'locked' : (productType ? 'trial' : 'locked'),
        onboarding_completed: false,
        updated_at:          new Date().toISOString()
      };
      var createResult = await withTimeout(
        sb.from('profiles').upsert(newProfile, { onConflict: 'id' }),
        TIMEOUT,
        { error: { message: 'create_timeout' } }
      );
      if (!createResult?.error) {
        profile = newProfile;
        console.log('[AuthGuard] profile created ok');
      } else {
        console.warn('[AuthGuard] profile create failed:', createResult?.error?.message);
        // Proceed with localStorage data even if Supabase fails
        profile = { id: uid, onboarding_completed: localStorage.getItem('af-onboarding-completed') === '1' };
      }
    }

    // ── 5. Log key fields ─────────────────────────────────────────
    console.log('[AuthGuard] selected_product:', profile?.product_type || localStorage.getItem('af-product-type'));
    console.log('[AuthGuard] subscription_status:', profile?.subscription_status || localStorage.getItem('af-subscription-status'));
    console.log('[AuthGuard] access_level:', profile?.access_level || localStorage.getItem('af-access-level'));
    console.log('[AuthGuard] onboarding_completed:', profile?.onboarding_completed, '| localStorage:', localStorage.getItem('af-onboarding-completed'));
    console.log('[AuthGuard] is_admin:', profile?.is_admin);

    // ── 6. Sync localStorage from profile ────────────────────────
    if (profile?.product_type)        localStorage.setItem('af-product-type',        profile.product_type);
    if (profile?.subscription_status) localStorage.setItem('af-subscription-status', profile.subscription_status);
    if (profile?.access_level)        localStorage.setItem('af-access-level',         profile.access_level);
    if (profile?.is_admin)            localStorage.setItem('af-is-admin',             '1');
    if (profile?.onboarding_completed) localStorage.setItem('af-onboarding-completed', '1');
    if (uid)                           localStorage.setItem('af-user-id',              uid);

    // ── 7. Call callback ──────────────────────────────────────────
    console.log('[AuthGuard] resolved → calling onResolved');
    if (onResolved) onResolved(session, profile);
    hideLdr();
    console.log('[AuthGuard] finally stop loading');

  } catch(err) {
    console.error('[AuthGuard] error:', err.message);
    hideLdr();
    showSessionError(loadingId, null);
  }
};

// ── Quick session check (non-blocking, for non-auth pages) ────────
window.getSessionQuick = async function(timeoutMs) {
  var sb = getSB();
  if (!sb) return null;
  try {
    var result = await withTimeout(sb.auth.getSession(), timeoutMs || 3000, { data: { session: null } });
    return result?.data?.session || null;
  } catch(e) { return null; }
};

console.log('[AuthGuard] auth-guard.js loaded');
