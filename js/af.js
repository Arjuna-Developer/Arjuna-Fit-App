// ── ArjunaFit · Supabase UMD Helper ──
// Carga DESPUÉS de: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

(function() {
  const URL = 'https://egswsqymkxmbtcpnozcq.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM';
  window._sb = supabase.createClient(URL, KEY);

  // ── AUTH ──
  window.AF = {
    async getSession() {
      const { data } = await _sb.auth.getSession();
      return data.session;
    },
    async requireAuth(redirect = '../index.html') {
      const { data } = await _sb.auth.getSession();
      if (!data.session) { window.location.href = redirect; return null; }
      return data.session.user;
    },
    async logout() {
      await _sb.auth.signOut();
      window.location.href = '../index.html';
    },

    // ── PROFILE ──
    async getProfile(userId) {
      const { data, error } = await _sb.from('profiles').select('*').eq('id', userId).maybeSingle();
      if(error) console.error('getProfile error:', error);
      return data || null;
    },
    async saveProfile(userId, profileData) {
      const { error } = await _sb.from('profiles').upsert({ id: userId, ...profileData });
      if(error) console.error('saveProfile error:', error);
      return !error;
    },

    // ── PROGRESS ──
    async getCompleted(userId) {
      const { data } = await _sb.from('progress').select('day_num').eq('user_id', userId).order('day_num');
      return (data || []).map(r => r.day_num);
    },
    async completeDay(userId, dayNum) {
      const { error } = await _sb.from('progress')
        .upsert({ user_id: userId, day_num: dayNum }, { onConflict: 'user_id,day_num' });
      if(error) console.error('completeDay error:', error);
      return !error;
    },

    // ── WORKOUT SETS ──
    async saveSet(userId, setData) {
      try {
        await _sb.from('workout_sets').upsert({ user_id: userId, ...setData, created_at: new Date().toISOString() });
      } catch(e) { console.warn('saveSet:', e.message); }
    },
    async getLastSession(userId, exName, weekNum) {
      try {
        const { data } = await _sb.from('workout_sets').select('*')
          .eq('user_id', userId).eq('exercise_name', exName)
          .eq('set_type', 'efectiva').lt('week_num', weekNum)
          .order('week_num', { ascending: false }).limit(10);
        return data || [];
      } catch(e) { return []; }
    },
    async getAllSets(userId) {
      try {
        const { data } = await _sb.from('workout_sets').select('*')
          .eq('user_id', userId).eq('set_type', 'efectiva')
          .order('week_num').order('day_num');
        return data || [];
      } catch(e) { return []; }
    },
    calcSuggestion(history, profile) {
      if (!history || !history.length) return null;
      const lastKg = history[history.length - 1]?.kg;
      if (!lastKg) return null;
      const target = profile?.nivel_entrenamiento === 'avanzado' ? 6 : profile?.nivel_entrenamiento === 'intermedio' ? 8 : 10;
      const allDone = history.every(s => (s.reps_done || 0) >= target);
      const inc = lastKg >= 30 ? 2.5 : 1.25;
      const next = Math.round((lastKg + inc) * 4) / 4;
      return allDone
        ? { readyToUp: true, lastKg, suggest: next, msg: `¡Lista para subir! Hiciste ${lastKg}kg. Prueba ${next}kg 💪` }
        : { readyToUp: false, lastKg, suggest: lastKg, msg: `Mantén ${lastKg}kg. Al completar todas las reps subirás a ${next}kg.` };
    },

    // ── PROGRESS PHOTOS ──
    async getPhotos(userId) {
      const { data } = await _sb.from('progress_photos').select('*').eq('user_id', userId).order('week_num');
      return data || [];
    }
  };
})();
