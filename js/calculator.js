// ══════════════════════════════════════════════════
// ArjunaFit · Motor de Cálculo Calórico & Entrenamiento
// Fórmula: Mifflin-St Jeor (la más precisa según NIH)
// ══════════════════════════════════════════════════

export const Calculator = {

  // ── Factores de actividad (Mifflin-St Jeor)
  ACTIVITY_FACTORS: {
    sedentario:  { factor: 1.2,   label: 'Sedentario',   desc: 'Sin ejercicio, trabajo de escritorio' },
    ligero:      { factor: 1.375, label: 'Ligero',        desc: 'Ejercicio 1-2 días/semana' },
    moderado:    { factor: 1.55,  label: 'Moderado',      desc: 'Ejercicio 3-5 días/semana' },
    activo:      { factor: 1.725, label: 'Activo',        desc: 'Ejercicio intenso 6-7 días/semana' },
    muy_activo:  { factor: 1.9,   label: 'Muy Activo',    desc: 'Atleta, trabajo físico + ejercicio' },
  },

  // ── Ajustes calóricos por objetivo
  OBJETIVO_ADJUSTMENTS: {
    crecer: { kcalAdj: +300, label: 'Superávit calórico (+300 kcal)', protMultiplier: 2.0, carbMultiplier: 0.45, fatMultiplier: 0.25 },
    bajar:  { kcalAdj: -400, label: 'Déficit calórico (-400 kcal)',   protMultiplier: 2.2, carbMultiplier: 0.35, fatMultiplier: 0.25 },
  },

  // ── Umbrales de entrenamiento basados en TDEE
  TRAINING_LEVELS: {
    // TDEE < 1800 → base (cuerpo con menos energía disponible)
    base:        { series: 4, reps: '10-12', descanso: 90,  label: 'Base',        desc: 'Metabolismo conservador — volumen moderado' },
    // TDEE 1800-2400 → intermedio
    intermedio:  { series: 4, reps: '8-10',  descanso: 90,  label: 'Intermedio',  desc: 'Metabolismo estándar — progresión óptima' },
    // TDEE > 2400 → avanzado (más energía = más volumen)
    avanzado:    { series: 5, reps: '6-8',   descanso: 120, label: 'Avanzado',    desc: 'Metabolismo alto — mayor volumen e intensidad' },
  },

  /**
   * Calcula TMB con Mifflin-St Jeor
   * Hombre: (10 × peso_kg) + (6.25 × altura_cm) − (5 × edad) + 5
   * Mujer:  (10 × peso_kg) + (6.25 × altura_cm) − (5 × edad) − 161
   */
  calcTMB(peso, altura, edad, genero) {
    const base = (10 * peso) + (6.25 * altura) - (5 * edad);
    return genero === 'hombre' ? base + 5 : base - 161;
  },

  /**
   * Calcula TDEE (Total Daily Energy Expenditure)
   * TDEE = TMB × Factor de actividad
   */
  calcTDEE(tmb, actividad) {
    const factor = this.ACTIVITY_FACTORS[actividad]?.factor || 1.55;
    return tmb * factor;
  },

  /**
   * Calcula calorías objetivo ajustadas según meta
   */
  calcCaloriasObjetivo(tdee, objetivo) {
    const adj = this.OBJETIVO_ADJUSTMENTS[objetivo];
    return Math.max(1200, tdee + adj.kcalAdj); // mínimo 1200 kcal
  },

  /**
   * Calcula macros en gramos
   * Proteína: 2.0-2.2g/kg peso (según objetivo)
   * Carbos: % del total calórico
   * Grasas: % del total calórico
   */
  calcMacros(caloriasObj, peso, objetivo) {
    const adj = this.OBJETIVO_ADJUSTMENTS[objetivo];

    // Proteína (prioridad #1)
    const protG = Math.round(peso * adj.protMultiplier);
    const protKcal = protG * 4;

    // Grasas
    const fatKcal = caloriasObj * adj.fatMultiplier;
    const fatG = Math.round(fatKcal / 9);

    // Carbos (lo que queda)
    const carbKcal = caloriasObj - protKcal - fatKcal;
    const carbG = Math.round(Math.max(50, carbKcal / 4)); // mínimo 50g

    return { protG, fatG, carbG };
  },

  /**
   * Calcula IMC
   */
  calcIMC(peso, altura) {
    const alturaM = altura / 100;
    return peso / (alturaM * alturaM);
  },

  /**
   * Clasifica IMC
   */
  clasificarIMC(imc) {
    if (imc < 18.5) return { label: 'Bajo peso', color: '#60a5fa', icon: '⚠️' };
    if (imc < 25)   return { label: 'Peso normal', color: '#22c27a', icon: '✅' };
    if (imc < 30)   return { label: 'Sobrepeso', color: '#f5a623', icon: '⚠️' };
    return                  { label: 'Obesidad', color: '#f43b6c', icon: '🔴' };
  },

  /**
   * Determina nivel de entrenamiento según TDEE
   */
  calcNivelEntrenamiento(tdee) {
    if (tdee < 1800) return 'base';
    if (tdee < 2400) return 'intermedio';
    return 'avanzado';
  },

  /**
   * CÁLCULO COMPLETO — devuelve todo
   */
  calcularTodo(peso, altura, edad, genero, actividad, objetivo) {
    const tmb = this.calcTMB(peso, altura, edad, genero);
    const tdee = this.calcTDEE(tmb, actividad);
    const caloriasObjetivo = this.calcCaloriasObjetivo(tdee, objetivo);
    const macros = this.calcMacros(caloriasObjetivo, peso, objetivo);
    const imc = this.calcIMC(peso, altura);
    const nivelEntrenamiento = this.calcNivelEntrenamiento(tdee);
    const trainingConfig = this.TRAINING_LEVELS[nivelEntrenamiento];
    const actividadInfo = this.ACTIVITY_FACTORS[actividad];
    const objetivoInfo = this.OBJETIVO_ADJUSTMENTS[objetivo];

    return {
      // Datos base
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      caloriasObjetivo: Math.round(caloriasObjetivo),

      // Macros
      proteinaG: macros.protG,
      carbsG: macros.carbG,
      grasasG: macros.fatG,

      // Distribución calórica %
      pctProt: Math.round((macros.protG * 4 / caloriasObjetivo) * 100),
      pctCarbs: Math.round((macros.carbG * 4 / caloriasObjetivo) * 100),
      pctGrasas: Math.round((macros.fatG * 9 / caloriasObjetivo) * 100),

      // IMC
      imc: Math.round(imc * 10) / 10,
      imcClasif: this.clasificarIMC(imc),

      // Entrenamiento personalizado
      nivelEntrenamiento,
      seriesEfectivas: trainingConfig.series,
      descansoSegundos: trainingConfig.descanso,
      repsRango: trainingConfig.reps,
      trainingLabel: trainingConfig.label,
      trainingDesc: trainingConfig.desc,

      // Info descriptiva
      actividadLabel: actividadInfo.label,
      objetivoAdj: objetivoInfo.label,

      // Peso ideal aproximado (Devine formula)
      pesoIdeal: genero === 'hombre'
        ? Math.round(50 + 2.3 * ((altura - 152.4) / 2.54))
        : Math.round(45.5 + 2.3 * ((altura - 152.4) / 2.54)),
    };
  },

  /**
   * Genera el plan de comidas personalizado según calorías
   */
  generarPlanComidas(caloriasObj, proteinaG, carbsG, grasasG, objetivo) {
    // Distribuir calorías en 5 comidas con % científicos
    const dist = objetivo === 'crecer'
      ? [0.22, 0.15, 0.28, 0.14, 0.21]  // D, M, A, P, C
      : [0.20, 0.12, 0.29, 0.14, 0.25]; // Cena más grande al bajar

    const meals = ['Desayuno', 'Merienda', 'Almuerzo', 'Post-entreno', 'Cena'];
    return meals.map((name, i) => ({
      name,
      kcal: Math.round(caloriasObj * dist[i]),
      prot: Math.round(proteinaG * dist[i]),
      carbs: Math.round(carbsG * dist[i]),
      grasas: Math.round(grasasG * dist[i]),
    }));
  }
};
