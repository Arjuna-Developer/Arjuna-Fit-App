// ── ArjunaFit Language System ──
// Español / English

const LANG_KEY = 'af_lang';

const TRANSLATIONS = {
  es: {
    // Nav
    nav_home: 'Inicio',
    nav_nutrition: 'Nutrición',
    nav_guide: 'Guía',
    nav_market: 'Mercado',
    nav_profile: 'Perfil',

    // Login
    login_title: 'Tu cuerpo,\ntu reto.',
    login_sub: 'Glúteos firmes, piernas definidas y la confianza que siempre quisiste.',
    login_social: '+100 mujeres ya están en su transformación 🔥',
    login_welcome: '¡Hola de nuevo! 👋',
    login_sub2: 'Entra y continúa donde lo dejaste',
    login_email: 'Tu correo',
    login_pass: 'Tu contraseña',
    login_forgot: '¿Olvidaste tu contraseña?',
    login_btn: 'Entrar a mi reto 🚀',
    login_entering: 'Entrando...',
    login_success: '✅ ¡Bienvenida!',

    // Onboarding
    onb_step_of: 'Paso',
    onb_of: 'de',
    onb_exit: 'Salir',
    onb_continue: 'Continuar →',
    onb_save: '✅ Guardar cambios',
    onb_start: '🚀 ¡Empezar mi reto!',
    onb_saving: 'Guardando...',
    onb_cancel: '✕ Cancelar',
    onb_skip_photo: 'Saltar por ahora →',

    // Step: nombre
    step_name_eye: 'Primero lo primero',
    step_name_title: '¿Cómo te\nllamas? 👋',
    step_name_sub: 'Así te llamaré durante todo tu reto. Ponlo como quieras que te llamen.',
    step_name_placeholder: 'Tu nombre o apodo',
    step_name_label: '✏️ Tu nombre',

    // Step: género
    step_gender_eye: 'Tu perfil',
    step_gender_title: '¿Con quién\nentrenas hoy? 👤',
    step_gender_sub: 'El cálculo calórico varía según tu sexo biológico.',
    gender_female: 'Mujer',
    gender_male: 'Hombre',

    // Step: body
    step_body_eye: 'Tu cuerpo',
    step_body_title: 'Tu punto\nde partida 📏',
    step_body_sub: 'Con estos datos calculamos tu metabolismo exacto. Es solo para ti.',
    step_weight: '⚖️ Peso actual',
    step_height: '📏 Altura',
    step_age: '🎂 Edad',
    unit_years: 'años',

    // Step: actividad
    step_act_eye: 'Nivel de actividad',
    step_act_title: '¿Qué tan activa\neres? 🏃',
    step_act_sub: 'Este factor multiplica tu metabolismo basal. Sé honesta.',
    act_sedentario: 'Sedentario',
    act_sedentario_desc: 'Sin ejercicio, trabajo de escritorio',
    act_ligero: 'Ligero',
    act_ligero_desc: 'Ejercicio 1-2 días/semana',
    act_moderado: 'Moderado',
    act_moderado_desc: 'Ejercicio 3-5 días/semana',
    act_activo: 'Activo',
    act_activo_desc: 'Ejercicio intenso 6-7 días/semana',
    act_muy_activo: 'Muy Activo',
    act_muy_activo_desc: 'Atleta o trabajo físico + ejercicio',

    // Step: objetivo
    step_obj_eye: 'Tu objetivo',
    step_obj_title: '¿Qué quieres\nlograr? 🎯',
    step_obj_sub: 'Esto ajusta tus calorías y personaliza todo el programa.',
    obj_crecer: 'Crecer y Tonificar',
    obj_crecer_desc: 'Aumentar volumen en glúteos y piernas.',
    obj_crecer_tag: 'Superávit +300 kcal · Proteína 2.0g/kg',
    obj_bajar: 'Bajar Grasa y Tonificar',
    obj_bajar_desc: 'Perder grasa manteniendo el músculo.',
    obj_bajar_tag: 'Déficit -400 kcal · Proteína 2.2g/kg',
    env_gym: 'Gimnasio',
    env_gym_desc: 'Barra, máquinas',
    env_casa: 'Casa',
    env_casa_desc: 'Bandas, mancuernas',
    env_label: '🏋️ ¿Dónde entrenas?',

    // Results
    step_results_eye: 'Tu cálculo',
    step_results_title: 'Tus calorías\nexactas 🔬',
    step_results_sub: 'Calculado con Mifflin-St Jeor — la fórmula más precisa.',
    results_plan: 'Tu plan personalizado',
    results_kcal: 'calorías al día',
    results_why: '¿Qué significa esto para ti?',
    results_crecer_msg: 'Tu cuerpo necesita {kcal} calorías para crecer músculo. No comas menos — eso destruiría tu progreso. Come los {prot}g de proteína todos los días y tus glúteos van a responder.',
    results_bajar_msg: 'Tu cuerpo quemará grasa con {kcal} calorías. No menos — eso solo daña el músculo. Come los {prot}g de proteína y el cuerpo hará el resto.',
    results_imc: 'Índice de masa corporal',
    results_ideal: 'Peso ideal aprox',

    // Photo
    step_photo_eye: 'Foto inicial',
    step_photo_title: 'Tu foto\nde inicio 📸',
    step_photo_sub: 'Esta es tu foto de referencia. Cada lunes subirás una nueva para ver tu transformación.',
    photo_tap: 'Toca para tomar o subir foto',
    photo_desc: 'Foto frontal de cuerpo completo en ropa deportiva',
    photo_privacy: '🔒 Privada. Solo tú puedes ver tus fotos.',

    // Summary
    step_sum_title: '¡Todo listo!',
    step_sum_sub: 'Tu programa de 8 semanas está listo con tus datos exactos.',
    sum_kcal: 'kcal por día',
    sum_prot: 'proteína al día',
    sum_photo: '📸 Sube una foto cada lunes para ver tu transformación',

    // Dashboard
    greet_morning: '☀️ Buenos días',
    greet_afternoon: '🌤️ Buenas tardes',
    greet_night: '🌙 Buenas noches',
    dash_week: 'Semana',
    dash_of8: 'de 8',
    dash_days_done: 'días hechos',
    dash_streak: 'en racha 🔥',
    dash_left: 'restantes',
    dash_progress: 'de 56 días completados',
    dash_profile: 'Tu perfil',
    dash_weeks: 'Semanas del reto',
    dash_this_week: 'Esta semana',
    dash_rest: 'Descanso',
    dash_locked_msg: '🔒 Completa el día anterior primero',

    // Shortcuts
    sc_nutrition: 'Mi Nutrición',
    sc_nutrition_sub: 'Plan del día',
    sc_guide: 'Guía Alimentos',
    sc_guide_sub: 'Qué comprar',
    sc_market: 'Lista Mercado',
    sc_market_sub: 'Compras semana',
    sc_settings: 'Ajustes',
    sc_settings_sub: 'Tu cuenta',

    // Menu
    menu_change_profile: 'Cambiar mi perfil',
    menu_market: 'Lista de mercado',
    menu_dark: 'Modo oscuro',
    menu_logout: 'Cerrar sesión',
    menu_lang: 'English 🇺🇸',

    // Day
    day_method: '📋 Método',
    day_warmup: '🔥 Calentamiento',
    day_training: '💪 Entrenamiento',
    day_complete: '✅ Completar entrenamiento',
    day_rest_title: 'Descanso',
    day_skip: 'Saltar',
    day_pause: 'Pausar',
    day_resume: 'Reanudar',
    day_complete_msg: '¡El músculo crece en el descanso. Duerme bien esta noche. 💪',
    day_back_home: '🏠 Volver al inicio',
    day_warmup_note: '🔥 12-15 minutos de calentamiento. No saltes esta parte.',
    day_done_btn: '✅ Listo, ir al entrenamiento 💪',
    day_warm_title: '🧘 Al terminar — Vuelta a la calma',
    day_first_rnd: 'Primero calientas el músculo',
    day_prep_note: 'No es descanso — es preparación. Tu cuerpo necesita esto 🛡️',
    day_effective: 'Aquí es donde crece el músculo',
    day_rest_label: 'Descansa {s} segundos entre cada serie',
    day_exercises: 'ejercicios',
    day_series_each: 'series cada uno',
    day_start_warmup: '🔥 ¡Vamos al calentamiento!',
    day_sets_note: 'Series — toca para marcar ✓',
    day_aprox_note: '🔄 Aproximaciones (no son descanso — son preparación)',
    day_efect_note: '🔥 Series Efectivas — Máximo esfuerzo',
  },

  en: {
    // Nav
    nav_home: 'Home',
    nav_nutrition: 'Nutrition',
    nav_guide: 'Guide',
    nav_market: 'Market',
    nav_profile: 'Profile',

    // Login
    login_title: 'Your body,\nyour challenge.',
    login_sub: 'Firm glutes, defined legs and the confidence you always wanted.',
    login_social: '+100 women are already in their transformation 🔥',
    login_welcome: 'Welcome back! 👋',
    login_sub2: 'Log in and continue where you left off',
    login_email: 'Your email',
    login_pass: 'Your password',
    login_forgot: 'Forgot your password?',
    login_btn: 'Enter my challenge 🚀',
    login_entering: 'Logging in...',
    login_success: '✅ Welcome!',

    // Onboarding
    onb_step_of: 'Step',
    onb_of: 'of',
    onb_exit: 'Exit',
    onb_continue: 'Continue →',
    onb_save: '✅ Save changes',
    onb_start: '🚀 Start my challenge!',
    onb_saving: 'Saving...',
    onb_cancel: '✕ Cancel',
    onb_skip_photo: 'Skip for now →',

    step_name_eye: 'First things first',
    step_name_title: "What's your\nname? 👋",
    step_name_sub: "This is how I'll call you throughout your challenge.",
    step_name_placeholder: 'Your name or nickname',
    step_name_label: '✏️ Your name',

    step_gender_eye: 'Your profile',
    step_gender_title: "Who's training\ntoday? 👤",
    step_gender_sub: 'Caloric calculation varies by biological sex.',
    gender_female: 'Woman',
    gender_male: 'Man',

    step_body_eye: 'Your body',
    step_body_title: 'Your starting\npoint 📏',
    step_body_sub: 'We use this to calculate your exact metabolism.',
    step_weight: '⚖️ Current weight',
    step_height: '📏 Height',
    step_age: '🎂 Age',
    unit_years: 'years',

    step_act_eye: 'Activity level',
    step_act_title: 'How active\nare you? 🏃',
    step_act_sub: 'This multiplies your basal metabolism. Be honest.',
    act_sedentario: 'Sedentary',
    act_sedentario_desc: 'No exercise, desk job',
    act_ligero: 'Light',
    act_ligero_desc: 'Exercise 1-2 days/week',
    act_moderado: 'Moderate',
    act_moderado_desc: 'Exercise 3-5 days/week',
    act_activo: 'Active',
    act_activo_desc: 'Intense exercise 6-7 days/week',
    act_muy_activo: 'Very Active',
    act_muy_activo_desc: 'Athlete or physical work + exercise',

    step_obj_eye: 'Your goal',
    step_obj_title: 'What do you\nwant to achieve? 🎯',
    step_obj_sub: 'This adjusts your calories and personalizes the entire program.',
    obj_crecer: 'Grow & Tone',
    obj_crecer_desc: 'Increase glute and leg volume.',
    obj_crecer_tag: 'Surplus +300 kcal · Protein 2.0g/kg',
    obj_bajar: 'Burn Fat & Tone',
    obj_bajar_desc: 'Lose fat while maintaining muscle.',
    obj_bajar_tag: 'Deficit -400 kcal · Protein 2.2g/kg',
    env_gym: 'Gym',
    env_gym_desc: 'Barbell, machines',
    env_casa: 'Home',
    env_casa_desc: 'Bands, dumbbells',
    env_label: '🏋️ Where do you train?',

    step_results_eye: 'Your calculation',
    step_results_title: 'Your exact\ncalories 🔬',
    step_results_sub: 'Calculated with Mifflin-St Jeor — the most accurate formula.',
    results_plan: 'Your personalized plan',
    results_kcal: 'calories per day',
    results_why: 'What does this mean for you?',
    results_crecer_msg: 'Your body needs {kcal} calories to grow muscle. Don\'t eat less — that would destroy your progress. Hit your {prot}g of protein every day and your glutes will respond.',
    results_bajar_msg: 'Your body will burn fat with {kcal} calories. Not less — that only damages the muscle we want to keep. Hit your {prot}g of protein and the body will do the rest.',
    results_imc: 'Body Mass Index',
    results_ideal: 'Ideal weight approx.',

    step_photo_eye: 'Starting photo',
    step_photo_title: 'Your starting\nphoto 📸',
    step_photo_sub: 'This is your reference photo. Every Monday you\'ll upload a new one.',
    photo_tap: 'Tap to take or upload a photo',
    photo_desc: 'Full body frontal photo in athletic wear',
    photo_privacy: '🔒 Private. Only you can see your photos.',

    step_sum_title: "You're all set!",
    step_sum_sub: 'Your 8-week program is ready with your exact data.',
    sum_kcal: 'kcal per day',
    sum_prot: 'protein per day',
    sum_photo: '📸 Upload a photo every Monday to track your transformation',

    greet_morning: '☀️ Good morning',
    greet_afternoon: '🌤️ Good afternoon',
    greet_night: '🌙 Good evening',
    dash_week: 'Week',
    dash_of8: 'of 8',
    dash_days_done: 'days done',
    dash_streak: 'streak 🔥',
    dash_left: 'remaining',
    dash_progress: 'of 56 days completed',
    dash_profile: 'Your profile',
    dash_weeks: 'Challenge weeks',
    dash_this_week: 'This week',
    dash_rest: 'Rest',
    dash_locked_msg: '🔒 Complete the previous day first',

    sc_nutrition: 'My Nutrition',
    sc_nutrition_sub: "Today's plan",
    sc_guide: 'Food Guide',
    sc_guide_sub: 'What to buy',
    sc_market: 'Market List',
    sc_market_sub: "Week's groceries",
    sc_settings: 'Settings',
    sc_settings_sub: 'Your account',

    menu_change_profile: 'Change my profile',
    menu_market: 'Market list',
    menu_dark: 'Dark mode',
    menu_logout: 'Log out',
    menu_lang: 'Español 🇨🇴',

    day_method: '📋 Method',
    day_warmup: '🔥 Warm-up',
    day_training: '💪 Training',
    day_complete: '✅ Complete workout',
    day_rest_title: 'Rest',
    day_skip: 'Skip',
    day_pause: 'Pause',
    day_resume: 'Resume',
    day_complete_msg: 'Muscle grows during rest. Sleep well tonight. 💪',
    day_back_home: '🏠 Back to home',
    day_warmup_note: '🔥 12-15 minutes of warm-up. Do not skip this.',
    day_done_btn: '✅ Ready, let\'s train 💪',
    day_warm_title: '🧘 When done — Cool down',
    day_first_rnd: 'First: warm up the muscle',
    day_prep_note: 'Not rest — preparation. Your body needs this 🛡️',
    day_effective: 'This is where muscle grows',
    day_rest_label: 'Rest {s} seconds between each set',
    day_exercises: 'exercises',
    day_series_each: 'sets each',
    day_start_warmup: '🔥 Let\'s warm up!',
    day_sets_note: 'Sets — tap to check ✓',
    day_aprox_note: '🔄 Warm-up sets (not rest — preparation)',
    day_efect_note: '🔥 Working Sets — Maximum effort',
  }
};

const Lang = {
  STORAGE_KEY: LANG_KEY,

  get() {
    return localStorage.getItem(this.STORAGE_KEY) || 'es';
  },

  set(lang) {
    localStorage.setItem(this.STORAGE_KEY, lang);
    location.reload();
  },

  toggle() {
    this.set(this.get() === 'es' ? 'en' : 'es');
  },

  t(key, vars = {}) {
    const lang = this.get();
    let str = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['es']?.[key] || key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  },

  // Apply all data-i18n attributes
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr');
      const val = this.t(key);
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });
    // Update lang toggle buttons
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.textContent = this.t('menu_lang');
    });
  }
};

window.Lang = Lang;
window.t = (key, vars) => Lang.t(key, vars);
window.toggleLang = () => Lang.toggle();

// Auto-apply on DOM ready
document.addEventListener('DOMContentLoaded', () => Lang.apply());
