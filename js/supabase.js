// ── ArjunaFit · Supabase Client ──
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = 'https://egswsqymkxmbtcpnozcq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ══════════════════════════════════════
// AUTH
// ══════════════════════════════════════
export const Auth = {
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true, user: data.user };
  },
  async logout() {
    await supabase.auth.signOut();
    window.location.href = '../index.html';
  },
  async requireAuth(redirectTo = '../index.html') {
    const session = await this.getSession();
    if (!session) { window.location.href = redirectTo; return null; }
    return session.user;
  }
};

// ══════════════════════════════════════
// PROFILE
// ══════════════════════════════════════
export const Profile = {
  async get(userId) {
    const { data } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    return data;
  },
  async set(userId, profileData) {
    const { error } = await supabase
      .from('profiles').upsert({ id: userId, ...profileData });
    return !error;
  }
};

// ══════════════════════════════════════
// PROGRESS (días completados 1-56)
// ══════════════════════════════════════
export const Progress = {
  async getCompleted(userId) {
    const { data } = await supabase
      .from('progress').select('day_num')
      .eq('user_id', userId).order('day_num');
    return (data || []).map(r => r.day_num);
  },
  async completeDay(userId, dayNum) {
    const { error } = await supabase
      .from('progress').upsert({ user_id: userId, day_num: dayNum });
    return !error;
  },
  isDayUnlocked(completedDays, dayNum) {
    if (dayNum === 1) return true;
    return completedDays.includes(dayNum - 1);
  },
  isDayCompleted(completedDays, dayNum) {
    return completedDays.includes(dayNum);
  }
};

// ══════════════════════════════════════
// WORKOUT TRACKER (cargas y progresión)
// ══════════════════════════════════════
export const WorkoutTracker = {

  async saveSet(userId, setData) {
    const { error } = await supabase.from('workout_sets').upsert({
      user_id: userId, ...setData,
      created_at: new Date().toISOString()
    });
    if (error) console.error('saveSet error:', error);
    return !error;
  },

  async getSetsForDay(userId, dayNum) {
    const { data } = await supabase.from('workout_sets').select('*')
      .eq('user_id', userId).eq('day_num', dayNum)
      .order('exercise_idx').order('set_num');
    return data || [];
  },

  async getExerciseHistory(userId, exerciseName) {
    const { data } = await supabase.from('workout_sets').select('*')
      .eq('user_id', userId).eq('exercise_name', exerciseName)
      .eq('set_type', 'efectiva')
      .order('week_num', { ascending: true }).order('set_num');
    return data || [];
  },

  async getLastSession(userId, exerciseName, currentWeek) {
    const { data } = await supabase.from('workout_sets').select('*')
      .eq('user_id', userId).eq('exercise_name', exerciseName)
      .eq('set_type', 'efectiva').lt('week_num', currentWeek)
      .order('week_num', { ascending: false }).order('set_num').limit(10);
    return data || [];
  },

  calcSuggestion(history, profile) {
    if (!history || history.length === 0) return null;
    const lastSets = history.filter(s => s.set_type === 'efectiva');
    if (lastSets.length === 0) return null;
    const lastKg = lastSets[lastSets.length - 1]?.kg;
    if (!lastKg) return { suggest: null, readyToUp: false, msg: 'Registra el peso de hoy para ver tu progresión' };
    const targetReps = profile?.nivel_entrenamiento === 'avanzado' ? 6
      : profile?.nivel_entrenamiento === 'intermedio' ? 8 : 10;
    const allDone = lastSets.every(s => (s.reps_done || 0) >= targetReps);
    const increment = lastKg >= 30 ? 2.5 : 1.25;
    const nextKg = Math.round((lastKg + increment) * 4) / 4;
    if (allDone) return { suggest: nextKg, readyToUp: true, lastKg,
      msg: `¡Lista para subir! Hiciste ${lastKg}kg. ¡Prueba con ${nextKg}kg! 💪` };
    return { suggest: lastKg, readyToUp: false, lastKg,
      msg: `Mantén ${lastKg}kg. Al completar todas las reps, subirás a ${nextKg}kg.` };
  },

  async updateWeekSummary(userId, weekNum, exerciseName, sets) {
    const ef = sets.filter(s => s.set_type === 'efectiva');
    if (!ef.length) return;
    const kgs = ef.map(s => s.kg || 0).filter(k => k > 0);
    const maxKg = kgs.length ? Math.max(...kgs) : 0;
    const avgKg = kgs.length ? kgs.reduce((a,b)=>a+b,0)/kgs.length : 0;
    const totalVol = ef.reduce((s,e) => s + ((e.kg||0)*(e.reps_done||0)), 0);
    const allRepsDone = ef.every(s => (s.reps_done||0) >= 8);
    await supabase.from('exercise_progress').upsert({
      user_id: userId, week_num: weekNum, exercise_name: exerciseName,
      max_kg: maxKg, avg_kg: Math.round(avgKg*100)/100,
      total_volume: Math.round(totalVol*100)/100,
      completed_sets: ef.length, all_reps_done: allRepsDone, ready_to_up: allRepsDone,
    }, { onConflict: 'user_id,week_num,exercise_name' });
  },

  async getWeeklyProgress(userId) {
    const { data } = await supabase.from('exercise_progress').select('*')
      .eq('user_id', userId).order('week_num');
    return data || [];
  }
};
