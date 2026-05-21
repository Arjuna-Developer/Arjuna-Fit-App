// ═══════════════════════════════════════════════════════════════════
// ArjunaFit — food-log.js v1.0 (P1.2)
// Supabase-first nutrition log module
// Fallback: localStorage with pending_sync flag
// ═══════════════════════════════════════════════════════════════════

window.FoodLog = (function() {
  const TABLE = 'nutrition_logs';

  function getSB() { return window.sb || null; }
  function getUID() {
    try {
      var raw = localStorage.getItem('sb-egswsqymkxmbtcpnozcq-auth-token')
            || localStorage.getItem('arjunafit-auth');
      return raw ? JSON.parse(raw)?.user?.id : null;
    } catch(e) { return null; }
  }

  function todayKey() { return new Date().toISOString().split('T')[0]; }

  // ── saveFoodLog ──────────────────────────────────────────────────
  async function saveFoodLog(food) {
    var uid  = getUID();
    var entry = {
      user_id:   uid || 'local',
      date:      food.date || todayKey(),
      name:      food.name,
      calories:  food.cal  || food.calories  || 0,
      protein:   food.prot || food.protein   || 0,
      carbs:     food.carb || food.carbs     || 0,
      fat:       food.fat  || 0,
      meal:      food.meal || 'snack',
      source:    food.source || 'manual',
      created_at: new Date().toISOString()
    };

    // Try Supabase first
    if (getSB() && uid) {
      try {
        var { data, error } = await getSB().from(TABLE).insert(entry).select().single();
        if (!error && data) {
          _saveLocal(data);
          return data;
        }
      } catch(e) { console.warn('[FoodLog] Supabase save failed:', e.message); }
    }

    // Fallback: localStorage with pending_sync
    entry.id = 'local_' + Date.now();
    entry.pending_sync = true;
    _saveLocal(entry);
    return entry;
  }

  // ── loadTodayFoodLogs ────────────────────────────────────────────
  async function loadTodayFoodLogs() {
    var uid = getUID();
    var today = todayKey();

    if (getSB() && uid) {
      try {
        var { data, error } = await getSB()
          .from(TABLE)
          .select('*')
          .eq('user_id', uid)
          .eq('date', today)
          .order('created_at', { ascending: true });
        if (!error && data) {
          // Sync to localStorage
          localStorage.setItem('af-food-' + today, JSON.stringify(data));
          return data;
        }
      } catch(e) { console.warn('[FoodLog] Supabase load failed:', e.message); }
    }

    // Fallback: localStorage
    try { return JSON.parse(localStorage.getItem('af-food-' + today) || '[]'); }
    catch(e) { return []; }
  }

  // ── deleteFoodLog ────────────────────────────────────────────────
  async function deleteFoodLog(id) {
    if (getSB() && id && !String(id).startsWith('local_')) {
      try { await getSB().from(TABLE).delete().eq('id', id); } catch(e) {}
    }
    // Remove from localStorage
    var today = todayKey();
    try {
      var logs = JSON.parse(localStorage.getItem('af-food-' + today) || '[]');
      localStorage.setItem('af-food-' + today, JSON.stringify(logs.filter(l => l.id !== id)));
    } catch(e) {}
  }

  // ── updateFoodLog ────────────────────────────────────────────────
  async function updateFoodLog(id, patch) {
    if (getSB() && id && !String(id).startsWith('local_')) {
      try {
        var { data } = await getSB().from(TABLE).update(patch).eq('id', id).select().single();
        if (data) { _updateLocal(data); return data; }
      } catch(e) {}
    }
    _updateLocal({ id, ...patch });
    return { id, ...patch };
  }

  // ── syncLocalFallback ────────────────────────────────────────────
  async function syncLocalFallback() {
    var uid = getUID();
    if (!getSB() || !uid) return { synced: 0 };
    var synced = 0;
    // Find all af-food-* keys with pending_sync entries
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key || !key.startsWith('af-food-')) continue;
      try {
        var logs = JSON.parse(localStorage.getItem(key) || '[]');
        var pending = logs.filter(l => l.pending_sync);
        for (var log of pending) {
          var toSync = Object.assign({}, log, { user_id: uid, pending_sync: undefined, id: undefined });
          var { data, error } = await getSB().from(TABLE).insert(toSync).select().single();
          if (!error && data) {
            // Replace local entry with Supabase entry
            logs = logs.filter(l => l.id !== log.id);
            logs.push(data);
            synced++;
          }
        }
        localStorage.setItem(key, JSON.stringify(logs));
      } catch(e) { console.warn('[FoodLog] sync error:', e.message); }
    }
    console.log('[FoodLog] Synced', synced, 'pending entries');
    return { synced };
  }

  // ── Helpers ──────────────────────────────────────────────────────
  function _saveLocal(entry) {
    try {
      var key  = 'af-food-' + (entry.date || todayKey());
      var logs = JSON.parse(localStorage.getItem(key) || '[]');
      var idx  = logs.findIndex(l => l.id === entry.id);
      if (idx >= 0) logs[idx] = entry; else logs.push(entry);
      localStorage.setItem(key, JSON.stringify(logs));
    } catch(e) {}
  }
  function _updateLocal(entry) {
    try {
      var key  = 'af-food-' + todayKey();
      var logs = JSON.parse(localStorage.getItem(key) || '[]');
      var idx  = logs.findIndex(l => l.id === entry.id);
      if (idx >= 0) { logs[idx] = Object.assign(logs[idx], entry); localStorage.setItem(key, JSON.stringify(logs)); }
    } catch(e) {}
  }

  // Auto-sync on load
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(syncLocalFallback, 2000);
  });

  return { saveFoodLog, loadTodayFoodLogs, deleteFoodLog, updateFoodLog, syncLocalFallback };
})();
