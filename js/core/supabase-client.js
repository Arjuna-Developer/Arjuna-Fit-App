// ═══════════════════════════════════════════════════════════════
// ARJUNAFIT — SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════════
(function() {
  'use strict';

  const CONFIG = {
    url:  'https://egswsqymkxmbtcpnozcq.supabase.co',
    anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM'
  };

  if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
    console.error('[Supabase] SDK no cargado.');
    return;
  }

  const sb = window.supabase.createClient(CONFIG.url, CONFIG.anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'arjunafit-auth'
    }
  });

  async function getCurrentUser() {
    try {
      const { data: { session } } = await sb.auth.getSession();
      return session?.user || null;
    } catch (e) { return null; }
  }

  async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    try {
      const { data } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return data;
    } catch (e) { return null; }
  }

  async function requireAuth(loginUrl = '/index.html', timeout = 4000) {
    return new Promise(async (resolve) => {
      try {
        const { data: { session } } = await Promise.race([
          sb.auth.getSession(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeout))
        ]);
        if (session?.user) { resolve(session.user); return; }
      } catch(e) {}
      window.location.replace(loginUrl);
    });
  }

  async function signOut(redirect = '/index.html') {
    try { await sb.auth.signOut(); } catch(e) {}
    window.location.replace(redirect);
  }

  window.sb = sb;
  window.AF = window.AF || {};
  window.AF.auth = { getCurrentUser, getCurrentProfile, requireAuth, signOut };

  console.log('[Supabase] Client ready ✓');
})();
