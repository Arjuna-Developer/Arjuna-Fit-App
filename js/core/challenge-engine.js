// ═══════════════════════════════════════════════════════
// ArjunaFit — Challenge Engine v1
// 37-day challenge structure for both retos.
// Days 1–7 = trial. Days 8–37 = require full access.
// ═══════════════════════════════════════════════════════
(function() {
  // ── getDayContent — public alias for getChallengeDayContent ─────
  // Defined as a function declaration (hoisted) so it's available everywhere
  function getDayContent(productType, dayNumber, context) {
    if (typeof getChallengeDayContent === 'function') {
      return getChallengeDayContent(productType, dayNumber, context);
    }
    // Fallback if called before init
    return {
      title:      'Entrenamiento del día',
      phase:      'Base',
      muscle:     'Full body',
      exercises:  ['Calentamiento', 'Movimiento principal', 'Estiramiento'],
      duration:   '30–45 min',
      difficulty: 'Base',
      tags:       ['Base']
    };
  }


  'use strict';

  // ── Challenge meta ───────────────────────────────────
  const CHALLENGE_META = {
    challenge_glutes: {
      id: 'challenge_glutes',
      name: 'Reto de glúteos',
      total_days: 37,
      trial_days: 7,
      focus: 'Glúteos · Fuerza · Técnica',
      description: 'Trabajar glúteos con intención, progresión y acompañamiento diario.',
      color: 'rgba(236,72,153,.6)',
      emoji: '🍑'
    },
    challenge_belly: {
      id: 'challenge_belly',
      name: 'Reto para bajar la pancita',
      total_days: 37,
      trial_days: 7,
      focus: 'Core · Nutrición · Hábitos',
      description: 'Reducir abdomen con entrenamiento, nutrición simple y constancia.',
      color: 'rgba(52,211,153,.6)',
      emoji: '🌿'
    }
  };

  // ── Day content: Reto de glúteos ─────────────────────
  const GLUTES_DAYS = [
    { day:1, is_trial:true, title:'Activación + técnica', focus:'Conexión mente-músculo',
      arju_msg:'Hoy aprendemos a sentir el glúteo antes de subir peso.',
      nutrition_focus:'Proteína en el desayuno — un huevo ya ayuda.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Puente de glúteo','Abducción de cadera','Hip thrust liviano','Caminata lateral con banda'],
      workout:'A', primaryAction:'meal' },
    { day:2, is_trial:true, title:'Proteína + recuperación', focus:'Comer para el glúteo',
      arju_msg:'Tu glúteo también necesita comida para crecer.',
      nutrition_focus:'Sube proteína en una comida hoy — pollo, huevos o yogur.',
      recipe:'yogur-banano-avena',
      exercises:['Movilidad de cadera','Estiramiento de cuádriceps','Respiración diafragmática'],
      workout:'rest', primaryAction:'recipe' },
    { day:3, is_trial:true, title:'Fuerza de glúteo', focus:'Hip Thrust progresivo',
      arju_msg:'Control antes que ego. La pausa arriba vale más que el peso.',
      nutrition_focus:'Almuerzo completo post-entreno — proteína, carbohidrato y algo verde.',
      recipe:'arroz-pollo-ensalada',
      exercises:['Hip thrust','Peso muerto rumano','Abducción de cadera','Sentadilla copa'],
      workout:'A', primaryAction:'workout' },
    { day:4, is_trial:true, title:'Recuperación activa', focus:'Descanso inteligente',
      arju_msg:'Descansar también construye. Tu músculo crece en el descanso.',
      nutrition_focus:'Hidratación y proteína simple — el cuerpo se repara con micronutrientes.',
      recipe:'tortilla-vegetales',
      exercises:['Caminata suave 20 min','Movilidad de cadera','Estiramiento glúteo'],
      workout:'rest', primaryAction:'meal' },
    { day:5, is_trial:true, title:'Glúteo + pierna', focus:'Estímulo compuesto',
      arju_msg:'Hoy sumamos estímulo con intención. Sin prisa.',
      nutrition_focus:'Energía antes del entreno — una arepa o fruta 30 min antes.',
      recipe:'carne-papa-aguacate',
      exercises:['Sentadilla búlgara','Puente de glúteo','Prensa o sentadilla sumo','Abducción final'],
      workout:'B', primaryAction:'workout' },
    { day:6, is_trial:true, title:'Comida simple + constancia', focus:'Comer sin complicarse',
      arju_msg:'Comer bien no tiene que complicarse. Simple también funciona.',
      nutrition_focus:'Una comida cocinada en casa ya marca diferencia.',
      recipe:'huevos-pericos',
      exercises:['Core suave','Movilidad general','Activación glúteo (mini-band)'],
      workout:'rest', primaryAction:'recipe' },
    { day:7, is_trial:true, title:'Resumen + continuidad', focus:'Cierre del primer bloque',
      arju_msg:'Ya diste el primer paso. Ahora viene el proceso real.',
      nutrition_focus:'Celebra con una comida que disfrutes y tenga proteína.',
      recipe:'arroz-pollo-ensalada',
      exercises:['Calentamiento completo','Hip thrust','Peso muerto','Sentadilla copa'],
      workout:'C', primaryAction:'summary' },
    // Days 8–37 content (placeholders, expandable)
    // ── FASE 2: Días 8–14 — Fuerza base ──────────────────────────
    { day:8,  phase:2, is_trial:false, title:'Fuerza base de glúteo', focus:'Construir con más intención',
      arju_msg:'Ahora que ya empezaste, vamos a construir con más intención.',
      nutrition_focus:'Proteína alta hoy — el glúteo necesita material para crecer.',
      recipe:'arroz-pollo-ensalada',
      exercises:['Hip thrust 4x8','Sentadilla copa 3x10','Puente de glúteo 3x12','Abducción 3x15'],
      workout:'A', primaryAction:'workout' },
    { day:9,  phase:2, is_trial:false, title:'Proteína y recuperación', focus:'Comer para el músculo',
      arju_msg:'El músculo también se construye cuando comes y descansas.',
      nutrition_focus:'Post-entreno: proteína + carbohidrato dentro de la primera hora.',
      recipe:'yogur-banano-avena',
      exercises:['Movilidad de cadera','Estiramiento de cadena posterior','Respiración'],
      workout:'rest', primaryAction:'meal' },
    { day:10, phase:2, is_trial:false, title:'Hip thrust + bisagra', focus:'Control de bisagra',
      arju_msg:'Hoy buscamos control, no solo mover peso.',
      nutrition_focus:'Almuerzo completo — proteína, carbohidrato complejo, vegetales.',
      recipe:'carne-papa-aguacate',
      exercises:['Hip thrust progresivo 4x8','Peso muerto rumano 3x10','Puente unilateral 3x8 c/lado','Good morning liviano'],
      workout:'A', primaryAction:'workout' },
    { day:11, phase:2, is_trial:false, title:'Movilidad + activación', focus:'Preparar el cuerpo',
      arju_msg:'Preparar el cuerpo también es avanzar.',
      nutrition_focus:'Hidratación y algo verde — el cuerpo agradece los días más suaves.',
      recipe:'tortilla-vegetales',
      exercises:['Movilidad de cadera 10 min','Activación glúteo con mini-band','Estiramiento piriforme','Respiración de core'],
      workout:'mobility', primaryAction:'meal' },
    { day:12, phase:2, is_trial:false, title:'Glúteo + pierna', focus:'Estímulo compuesto',
      arju_msg:'Sumamos estímulo sin perder técnica.',
      nutrition_focus:'Energía antes — una arepa o fruta 30 min antes del entreno.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Sentadilla búlgara 3x8 c/lado','Puente de glúteo 4x12','Extensión de cadera 3x12','Abducción lateral 3x15'],
      workout:'B', primaryAction:'workout' },
    { day:13, phase:2, is_trial:false, title:'Comida simple alta en proteína', focus:'Nutrición práctica',
      arju_msg:'Una comida bien elegida puede sostener todo tu día.',
      nutrition_focus:'Una comida con 30g+ de proteína — pollo, huevos, atún, frijoles.',
      recipe:'atun-arepa',
      exercises:['Core suave 15 min','Plancha 3x20s','Movilidad de cadera'],
      workout:'rest', primaryAction:'recipe' },
    { day:14, phase:2, is_trial:false, title:'Resumen semana 2', focus:'Ya no solo empezaste',
      arju_msg:'Ya no solo empezaste. Estás repitiendo. Ahí empieza el cambio real.',
      nutrition_focus:'Celebra con una comida que disfrutes y tenga proteína.',
      recipe:'arroz-pollo-ensalada',
      exercises:['Entreno completo de semana','Hip thrust','Sentadilla','Peso muerto liviano'],
      workout:'C', primaryAction:'workout', phaseEnd:true },

    // ── FASE 3: Días 15–21 — Progresión y volumen ──────────────────
    { day:15, phase:3, is_trial:false, title:'Progresión sin miedo', focus:'Técnica firme',
      arju_msg:'Si la técnica está firme, podemos intentar un poco más.',
      nutrition_focus:'Proteína en cada comida — objetivo diario: 100–120g.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Hip thrust pesado 4x6','Sentadilla copa 4x8','Abducción con peso 3x15','Glúteo kickback'],
      workout:'A', primaryAction:'workout' },
    { day:16, phase:3, is_trial:false, title:'Recuperación activa', focus:'Descanso inteligente',
      arju_msg:'El descanso inteligente también forma parte del cambio.',
      nutrition_focus:'Comida anti-inflamatoria — aguacate, salmón, vegetales de colores.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Caminata 20 min','Estiramiento glúteo profundo','Movilidad de cadera','Respiración'],
      workout:'rest', primaryAction:'meal' },
    { day:17, phase:3, is_trial:false, title:'Volumen de glúteo', focus:'Repetir con intención',
      arju_msg:'Hoy repetimos con intención. Ahí se construye.',
      nutrition_focus:'Post-entreno: batido o comida con proteína dentro de 45 minutos.',
      recipe:'yogur-banano-avena',
      exercises:['Hip thrust 5x8','Sentadilla búlgara 4x8 c/lado','Peso muerto rumano 3x10','Puente unilateral 3x10'],
      workout:'A', primaryAction:'workout' },
    { day:18, phase:3, is_trial:false, title:'Nutrición para rendimiento', focus:'Comer para rendir',
      arju_msg:'Entrenar mejor también depende de llegar con energía.',
      nutrition_focus:'Carbohidrato antes del entreno — no entrenes en ayunas si puedes evitarlo.',
      recipe:'huevos-pericos',
      exercises:['Activación glúteo','Core 20 min','Movilidad de cadena posterior'],
      workout:'rest', primaryAction:'recipe' },
    { day:19, phase:3, is_trial:false, title:'Glúteo unilateral', focus:'Control lado por lado',
      arju_msg:'Controlar lado por lado mejora fuerza y forma.',
      nutrition_focus:'Almuerzo completo y variado — no repitas el mismo plato todos los días.',
      recipe:'carne-papa-aguacate',
      exercises:['Sentadilla búlgara 4x10 c/lado','Hip thrust unilateral 4x10','Extensión unilateral 3x12','Abducción con mini-band'],
      workout:'B', primaryAction:'workout' },
    { day:20, phase:3, is_trial:false, title:'Cena simple y recuperación', focus:'Cerrar bien el día',
      arju_msg:'No necesitas una comida perfecta. Necesitas una que puedas sostener.',
      nutrition_focus:'Cena con proteína y vegetales — simple y sin culpa.',
      recipe:'tortilla-vegetales',
      exercises:['Movilidad 15 min','Estiramiento completo','Respiración profunda'],
      workout:'rest', primaryAction:'meal' },
    { day:21, phase:3, is_trial:false, title:'Check de progreso', focus:'Ver lo que repetiste',
      arju_msg:'Mira lo que ya repetiste. Eso también cambia el cuerpo.',
      nutrition_focus:'Comida que disfrutes con proteína — celebra tres semanas.',
      recipe:'arroz-pollo-ensalada',
      exercises:['Hip thrust','Peso muerto rumano','Sentadilla copa','Abducción'],
      workout:'C', primaryAction:'workout', phaseEnd:true },

    // ── FASE 4: Días 22–30 — Intensidad inteligente ────────────────
    { day:22, phase:4, is_trial:false, title:'Intensidad controlada', focus:'La técnica manda',
      arju_msg:'Subimos dificultad, pero la técnica manda.',
      nutrition_focus:'Proteína distribuida en 3 comidas — no acumular todo al final del día.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Hip thrust pesado 4x5','Sentadilla búlgara pesada 4x6','Peso muerto rumano pesado 3x8','Abducción 3x20'],
      workout:'A', primaryAction:'workout' },
    { day:23, phase:4, is_trial:false, title:'Proteína desde temprano', focus:'Empezar con energía',
      arju_msg:'Empezar con proteína te ayuda a sostener energía todo el día.',
      nutrition_focus:'Desayuno con 25–30g de proteína — huevos, yogur, queso o proteína.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Activación glúteo','Core 20 min','Movilidad de cadera y columna'],
      workout:'rest', primaryAction:'meal' },
    { day:24, phase:4, is_trial:false, title:'Glúteo pesado', focus:'Fuerza con control',
      arju_msg:'Hoy vamos con fuerza, sin perder control.',
      nutrition_focus:'Post-entreno completo — recuperación activa con proteína.',
      recipe:'carne-papa-aguacate',
      exercises:['Hip thrust máximo técnico 4x4','Sentadilla copa pesada 3x8','Extensión de cadera pesada 3x12','Abducción final 3x20'],
      workout:'A', primaryAction:'workout' },
    { day:25, phase:4, is_trial:false, title:'Movilidad y descarga', focus:'Bajar para avanzar',
      arju_msg:'Bajar un poco también puede ayudarte a avanzar mejor.',
      nutrition_focus:'Hidratación — 8 vasos mínimo, más si entrenas con intensidad.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Yoga suave / movilidad','Estiramiento glúteo y piriforme','Caminata 20 min'],
      workout:'rest', primaryAction:'meal' },
    { day:26, phase:4, is_trial:false, title:'Pierna + glúteo', focus:'Fuerza, rango y control',
      arju_msg:'Fuerza, rango y control.',
      nutrition_focus:'Energía sostenida — carbohidrato antes y proteína después del entreno.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Prensa de pierna 4x10','Hip thrust 4x8','Sentadilla búlgara 3x8 c/lado','Abducción 3x20'],
      workout:'B', primaryAction:'workout' },
    { day:27, phase:4, is_trial:false, title:'Receta alta en proteína', focus:'Una receta puede sostenerte',
      arju_msg:'Una receta simple puede ser parte de tu progreso.',
      nutrition_focus:'Elige una receta y prepárala hoy — cocinar también es un hábito.',
      recipe:'atun-arepa',
      exercises:['Core 20 min','Activación glúteo liviana','Movilidad'],
      workout:'rest', primaryAction:'recipe' },
    { day:28, phase:4, is_trial:false, title:'Resumen de avance', focus:'Tienes más historia de la que crees',
      arju_msg:'Ya tienes más historia de la que crees.',
      nutrition_focus:'Comida que disfrutes — cuatro semanas merecen algo rico.',
      recipe:'yogur-banano-avena',
      exercises:['Entreno técnico completo','Hip thrust','Sentadilla','Peso muerto liviano'],
      workout:'C', primaryAction:'workout' },
    { day:29, phase:4, is_trial:false, title:'Glúteo técnico', focus:'Sentir importa más que pesar',
      arju_msg:'Sentir el músculo importa más que subir por subir.',
      nutrition_focus:'Proteína + carbohidrato en pre-entreno — no entrenes con hambre.',
      recipe:'huevos-pericos',
      exercises:['Hip thrust con pausa 4x8','Sentadilla lenta 3x10','Abducción controlada 3x20','Glúteo kickback técnico'],
      workout:'A', primaryAction:'workout' },
    { day:30, phase:4, is_trial:false, title:'Cierre de fase', focus:'Tú seguiste',
      arju_msg:'Llegaste a una parte donde muchas personas abandonan. Tú seguiste.',
      nutrition_focus:'Celebra bien — una comida completa, sin culpa.',
      recipe:'arroz-pollo-ensalada',
      exercises:['Entreno fuerte de cierre','Hip thrust pesado','Sentadilla búlgara','Peso muerto'],
      workout:'B', primaryAction:'workout', phaseEnd:true },

    // ── FASE 5: Días 31–37 — Consolidación ─────────────────────────
    { day:31, phase:5, is_trial:false, title:'Consolidación', focus:'Sostener lo construido',
      arju_msg:'Ahora buscamos sostener lo que construiste.',
      nutrition_focus:'Proteína alta de mantenimiento — no reduzcas lo que funcionó.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Hip thrust 4x8','Sentadilla copa 3x10','Peso muerto rumano 3x10','Abducción 3x20'],
      workout:'A', primaryAction:'workout' },
    { day:32, phase:5, is_trial:false, title:'Nutrición de continuidad', focus:'Dejar de empezar de cero',
      arju_msg:'El cuerpo cambia más cuando dejas de empezar de cero.',
      nutrition_focus:'Repetir lo que funcionó — no reinventes la rueda esta semana.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Core 20 min','Movilidad y activación','Caminata suave'],
      workout:'rest', primaryAction:'meal' },
    { day:33, phase:5, is_trial:false, title:'Fuerza final', focus:'Con calma y control',
      arju_msg:'Hoy medimos progreso con calma y control.',
      nutrition_focus:'Comida completa post-entreno — proteína + carbohidrato.',
      recipe:'carne-papa-aguacate',
      exercises:['Hip thrust PR intento 4x5','Sentadilla búlgara 4x8','Peso muerto rumano 3x10','Abducción final'],
      workout:'A', primaryAction:'workout' },
    { day:34, phase:5, is_trial:false, title:'Recuperación activa', focus:'Espacio para responder',
      arju_msg:'Tu cuerpo también necesita espacio para responder.',
      nutrition_focus:'Anti-inflamatoria — aguacate, salmón, vegetales de colores.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Caminata 25 min','Estiramiento completo','Yoga suave'],
      workout:'rest', primaryAction:'meal' },
    { day:35, phase:5, is_trial:false, title:'Último estímulo fuerte', focus:'Con intención, no castigo',
      arju_msg:'Terminamos con intención, no con castigo.',
      nutrition_focus:'Pre-entreno con energía — no en ayunas. Post-entreno con proteína.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Hip thrust pesado 4x6','Sentadilla búlgara pesada 3x8','Peso muerto rumano 3x10','Glúteo completo'],
      workout:'B', primaryAction:'workout' },
    { day:36, phase:5, is_trial:false, title:'Preparar siguiente etapa', focus:'El proceso continúa',
      arju_msg:'Un reto termina, pero tu proceso puede continuar.',
      nutrition_focus:'Una comida que puedas repetir semana a semana — sostenible.',
      recipe:'tortilla-vegetales',
      exercises:['Movilidad completa','Activación liviana','Estiramiento de glúteo'],
      workout:'rest', primaryAction:'recipe' },
    { day:37, phase:5, is_trial:false, title:'Cierre del reto', focus:'37 días de constancia',
      arju_msg:'No fue perfección. Fue constancia. Y eso ya cambió algo.',
      nutrition_focus:'Celebra como mereces — una comida que ames, sin culpa.',
      recipe:'arroz-pollo-ensalada',
      exercises:['Entreno simbólico de cierre','Hip thrust técnico','Postura y control'],
      workout:'finish', primaryAction:'summary', challengeEnd:true },
  ];

  // ── Day content: Reto para bajar la pancita ──────────
  const BELLY_DAYS = [
    { day:1, is_trial:true, title:'Movimiento + comida base', focus:'Empezar sin presión',
      arju_msg:'Hoy no buscamos hacerlo perfecto. Buscamos empezar.',
      nutrition_focus:'Registra tu primera comida — una acción pequeña da dirección.',
      recipe:'tortilla-vegetales',
      exercises:['Caminata suave 15 min','Plancha isométrica 20s','Respiración de core','Dead bug básico'],
      workout:'core', primaryAction:'meal' },
    { day:2, is_trial:true, title:'Core + comida simple', focus:'Abdomen y hábitos',
      arju_msg:'El abdomen cambia con hábitos repetidos, no con un esfuerzo extremo.',
      nutrition_focus:'Proteína en la primera comida — cambia cómo te sientes el resto del día.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Plancha 3x20s','Dead bug 3x8','Crunch controlado 3x10','Caminata 10 min'],
      workout:'core', primaryAction:'workout' },
    { day:3, is_trial:true, title:'Cardio controlado + proteína', focus:'Movimiento sostenible',
      arju_msg:'No necesitas matarte. Necesitas sostenerlo.',
      nutrition_focus:'No saltes comidas — el hambre extrema lleva a malas decisiones.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Caminata inclinada 20 min','Circuito suave: sentadilla + plancha + step','Movilidad final'],
      workout:'cardio', primaryAction:'workout' },
    { day:4, is_trial:true, title:'Recuperación + caminata', focus:'Descanso activo',
      arju_msg:'Volver mañana también hace parte del plan.',
      nutrition_focus:'Cena ligera hoy — proteína + vegetales, sin sobrecargarte.',
      recipe:'atun-arepa',
      exercises:['Caminata 20 min','Respiración diafragmática','Estiramiento de cadena posterior'],
      workout:'rest', primaryAction:'meal' },
    { day:5, is_trial:true, title:'Core + fuerza', focus:'Control y constancia',
      arju_msg:'Más control, menos castigo.',
      nutrition_focus:'Comida completa y simple — proteína, carbohidrato, vegetal.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Plancha 4x25s','Mountain climbers controlados 3x10','Sentadilla suave 3x10','Remo o jalón si aplica'],
      workout:'core', primaryAction:'workout' },
    { day:6, is_trial:true, title:'Recetas simples', focus:'Comer sin improvisar',
      arju_msg:'Si sabes qué comer, es más fácil no improvisar.',
      nutrition_focus:'Elige una receta hoy y agrégala a tu día.',
      recipe:'yogur-avena-fruta',
      exercises:['Caminata ligera opcional','Movilidad de 10 min'],
      workout:'rest', primaryAction:'recipe' },
    { day:7, is_trial:true, title:'Resumen + continuidad', focus:'Cierre del primer bloque',
      arju_msg:'Ya empezaste. Ahora construimos continuidad.',
      nutrition_focus:'Una comida que disfrutes y tenga proteína.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Plancha','Mountain climbers','Sentadilla copa','Core completo'],
      workout:'core', primaryAction:'summary' },
    // ── FASE 2: Días 8–14 — Consistencia ────────────────────────────
    { day:8,  phase:2, is_trial:false, title:'Retomar con claridad', focus:'Hábitos, no castigo',
      arju_msg:'Ahora seguimos construyendo hábitos, no castigando el cuerpo.',
      nutrition_focus:'Una comida con proteína y algo verde — sin complicar.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Plancha 3x25s','Mountain climbers 3x10','Sentadilla suave 3x12','Caminata 15 min'],
      workout:'core', primaryAction:'workout' },
    { day:9,  phase:2, is_trial:false, title:'Proteína y saciedad', focus:'Comer con dirección',
      arju_msg:'Comer mejor no significa comer menos sin dirección.',
      nutrition_focus:'Proteína en cada comida — te ayuda a no llegar con hambre extrema a la noche.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Movilidad suave','Respiración de core 10 min','Estiramiento cadena posterior'],
      workout:'rest', primaryAction:'meal' },
    { day:10, phase:2, is_trial:false, title:'Core + movimiento', focus:'Abdomen y tiempo',
      arju_msg:'El abdomen cambia con entrenamiento, comida y tiempo.',
      nutrition_focus:'Almuerzo completo — evita saltarte comidas en el día más activo.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Plancha 4x25s','Dead bug 3x8','Crunch controlado 3x12','Mountain climbers 3x10'],
      workout:'core', primaryAction:'workout' },
    { day:11, phase:2, is_trial:false, title:'Caminata y recuperación', focus:'Sostener sin romperse',
      arju_msg:'Más no siempre es mejor. Sostener sí.',
      nutrition_focus:'Hidratación + cena ligera — recuperar también es parte del proceso.',
      recipe:'atun-arepa',
      exercises:['Caminata 25 min','Movilidad de cadera','Respiración profunda'],
      workout:'rest', primaryAction:'meal' },
    { day:12, phase:2, is_trial:false, title:'Fuerza base', focus:'Composición corporal',
      arju_msg:'Ganar fuerza también ayuda a cambiar composición corporal.',
      nutrition_focus:'Proteína + carbohidrato antes del entreno — no en ayunas.',
      recipe:'tortilla-vegetales',
      exercises:['Sentadilla copa 3x12','Plancha 3x25s','Peso muerto liviano 3x10','Mountain climbers 3x10'],
      workout:'core', primaryAction:'workout' },
    { day:13, phase:2, is_trial:false, title:'Cena ligera', focus:'Cerrar bien',
      arju_msg:'Cerrar bien el día puede ayudarte a sostener el proceso.',
      nutrition_focus:'Cena: proteína + vegetales — simple y sin culpa.',
      recipe:'yogur-avena-fruta',
      exercises:['Movilidad 15 min','Estiramiento cadena anterior','Respiración'],
      workout:'rest', primaryAction:'meal' },
    { day:14, phase:2, is_trial:false, title:'Resumen semana 2', focus:'Ya estás repitiendo',
      arju_msg:'Ya estás repitiendo hábitos. Ahí empieza el cambio real.',
      nutrition_focus:'Celebra con una comida completa — dos semanas merece.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Plancha','Mountain climbers','Sentadilla','Core completo'],
      workout:'core', primaryAction:'workout', phaseEnd:true },
    { day:15, phase:3, is_trial:false, title:'Déficit sostenible', focus:'Sin hambre extrema',
      arju_msg:'No buscamos matarte de hambre. Buscamos dirección.',
      nutrition_focus:'Come suficiente proteína — es lo que más ayuda a perder grasa sin perder músculo.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Cardio suave 20 min','Plancha 3x25s','Sentadilla 3x12','Core completo'],
      workout:'cardio', primaryAction:'workout' },
    { day:16, phase:3, is_trial:false, title:'Core controlado', focus:'Control sin castigo',
      arju_msg:'Más control, menos castigo.',
      nutrition_focus:'No saltes el almuerzo — te ayuda a llegar sin hambre a la noche.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Plancha 4x30s','Dead bug 3x10','Mountain climbers controlados 3x12','Crunch lento 3x15'],
      workout:'core', primaryAction:'workout' },
    { day:17, phase:3, is_trial:false, title:'Comida sin improvisar', focus:'Decidir antes',
      arju_msg:'Si sabes qué comer, reduces decisiones difíciles.',
      nutrition_focus:'Prepara o elige tu almuerzo antes de que llegue el hambre.',
      recipe:'atun-arepa',
      exercises:['Caminata 20 min','Activación de core suave','Estiramiento general'],
      workout:'rest', primaryAction:'recipe' },
    { day:18, phase:3, is_trial:false, title:'Cardio controlado', focus:'Repetible',
      arju_msg:'El cardio ayuda más cuando puedes repetirlo.',
      nutrition_focus:'No restrinjas carbohidratos en días de cardio — necesitas energía.',
      recipe:'tortilla-vegetales',
      exercises:['Cardio moderado 25 min','Caminata inclinada o trote suave','Core 10 min final'],
      workout:'cardio', primaryAction:'workout' },
    { day:19, phase:3, is_trial:false, title:'Fuerza + abdomen', focus:'Cuerpo más fuerte',
      arju_msg:'Tu abdomen también responde a un cuerpo más fuerte.',
      nutrition_focus:'Post-entreno: proteína dentro de la hora — músculo se recupera.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Sentadilla copa 4x10','Plancha con variaciones 4x25s','Mountain climbers 3x12','Peso muerto liviano 3x10'],
      workout:'core', primaryAction:'workout' },
    { day:20, phase:3, is_trial:false, title:'Receta práctica', focus:'Simple funciona',
      arju_msg:'Simple también funciona.',
      nutrition_focus:'Elige una receta nueva hoy — el recetario está ahí para ti.',
      recipe:'yogur-avena-fruta',
      exercises:['Movilidad y estiramiento','Caminata opcional','Respiración profunda'],
      workout:'rest', primaryAction:'recipe' },
    { day:21, phase:3, is_trial:false, title:'Check de progreso', focus:'Lo que sí sostuviste',
      arju_msg:'Mira lo que sí has sostenido. Eso cuenta.',
      nutrition_focus:'Celebra tres semanas — una comida que disfrutes.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Plancha','Mountain climbers','Sentadilla','Core completo'],
      workout:'core', primaryAction:'workout', phaseEnd:true },
    { day:22, phase:4, is_trial:false, title:'Consistencia real', focus:'Volver construye',
      arju_msg:'El cambio se construye cuando vuelves, no cuando todo sale perfecto.',
      nutrition_focus:'Proteína distribuida — no acumules todo en una comida.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Plancha progresiva 4x30s','Dead bug 3x10','Sentadilla con peso 3x12','Mountain climbers 3x15'],
      workout:'core', primaryAction:'workout' },
    { day:23, phase:4, is_trial:false, title:'Proteína y control de hambre', focus:'Sentirte satisfecha',
      arju_msg:'Sentirte satisfecha ayuda a sostener mejor el día.',
      nutrition_focus:'Proteína en desayuno + almuerzo — reduce ansiedad por comida en la tarde.',
      recipe:'atun-arepa',
      exercises:['Caminata 25 min','Activación de core','Movilidad de cadera'],
      workout:'rest', primaryAction:'meal' },
    { day:24, phase:4, is_trial:false, title:'Fuerza + cardio suave', focus:'Sumar sin castigar',
      arju_msg:'Hoy sumamos movimiento sin castigarte.',
      nutrition_focus:'Energía antes del entreno — no en ayunas.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Cardio 15 min warm-up','Sentadilla 4x10','Plancha 3x30s','Mountain climbers 3x12'],
      workout:'cardio', primaryAction:'workout' },
    { day:25, phase:4, is_trial:false, title:'Recuperación y estrés', focus:'Descanso importa',
      arju_msg:'El descanso también afecta cómo te sientes en tu cuerpo.',
      nutrition_focus:'Cena tranquila — proteína ligera, vegetales, sin pesado.',
      recipe:'tortilla-vegetales',
      exercises:['Yoga y movilidad suave 20 min','Respiración profunda','Estiramiento completo'],
      workout:'rest', primaryAction:'meal' },
    { day:26, phase:4, is_trial:false, title:'Core + estabilidad', focus:'Controlar mejor',
      arju_msg:'Controlar mejor el cuerpo también es progreso.',
      nutrition_focus:'Comida completa y equilibrada — proteína + carbohidrato + grasa buena.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Plancha lateral 3x20s c/lado','Dead bug avanzado 3x8','Sentadilla con pausa 3x10','Core total 20 min'],
      workout:'core', primaryAction:'workout' },
    { day:27, phase:4, is_trial:false, title:'Cena simple', focus:'No improvisar de noche',
      arju_msg:'No improvisar de noche puede cambiar mucho.',
      nutrition_focus:'Prepara tu cena antes de sentir hambre extrema.',
      recipe:'yogur-avena-fruta',
      exercises:['Caminata suave','Movilidad','Estiramiento'],
      workout:'rest', primaryAction:'recipe' },
    { day:28, phase:4, is_trial:false, title:'Resumen de avance', focus:'No fue perfecto. Fue repetido.',
      arju_msg:'No fue perfecto. Fue repetido.',
      nutrition_focus:'Celebra cuatro semanas con algo que disfrutes.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Entreno completo','Plancha','Mountain climbers','Sentadilla','Core'],
      workout:'core', primaryAction:'workout' },
    { day:29, phase:4, is_trial:false, title:'Movimiento largo suave', focus:'Caminar también cuenta',
      arju_msg:'Caminar también cuenta.',
      nutrition_focus:'Hidratación y vegetales — el cuerpo agradece los días activos suaves.',
      recipe:'atun-arepa',
      exercises:['Caminata larga 30 min','Estiramiento activo','Movilidad de cadera'],
      workout:'rest', primaryAction:'meal' },
    { day:30, phase:4, is_trial:false, title:'Cierre de fase', focus:'Más lejos de otras veces',
      arju_msg:'Llegaste más lejos que muchas veces anteriores.',
      nutrition_focus:'Comida que disfrutes — 30 días lo merecen.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Plancha progresiva','Mountain climbers','Sentadilla','Core completo'],
      workout:'core', primaryAction:'workout', phaseEnd:true },
    { day:31, phase:5, is_trial:false, title:'Consolidar hábitos', focus:'Parte de tu vida',
      arju_msg:'Ahora buscamos que esto se sienta parte de tu vida.',
      nutrition_focus:'Repite lo que funcionó — eso es exactamente lo que queremos.',
      recipe:'huevos-arepa-aguacate',
      exercises:['Plancha 4x30s','Dead bug 3x10','Sentadilla 3x12','Mountain climbers 3x15'],
      workout:'core', primaryAction:'workout' },
    { day:32, phase:5, is_trial:false, title:'Comida base', focus:'Evitar decisiones impulsivas',
      arju_msg:'Una comida simple puede evitar decisiones impulsivas.',
      nutrition_focus:'Prepara algo que sepas hacer bien — eso también es progreso.',
      recipe:'tortilla-vegetales',
      exercises:['Caminata 20 min','Movilidad','Activación suave'],
      workout:'rest', primaryAction:'meal' },
    { day:33, phase:5, is_trial:false, title:'Core final', focus:'Control, no sufrimiento',
      arju_msg:'Hoy medimos control, no sufrimiento.',
      nutrition_focus:'Post-entreno: proteína dentro de la hora.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Plancha 4x35s','Dead bug avanzado 3x10','Mountain climbers 3x15','Sentadilla con pausa 3x10'],
      workout:'core', primaryAction:'workout' },
    { day:34, phase:5, is_trial:false, title:'Recuperación', focus:'Continuar sin romper',
      arju_msg:'Bajar ritmo también puede ayudarte a continuar.',
      nutrition_focus:'Cena tranquila y nutritiva — proteína + vegetales.',
      recipe:'yogur-avena-fruta',
      exercises:['Yoga y movilidad','Estiramiento cadena posterior','Respiración profunda'],
      workout:'rest', primaryAction:'meal' },
    { day:35, phase:5, is_trial:false, title:'Fuerza + movimiento', focus:'Fuerte, sin castigo',
      arju_msg:'Terminamos fuerte, pero sin castigarnos.',
      nutrition_focus:'Energía antes y proteína después — último entreno fuerte.',
      recipe:'ensalada-pollo-aguacate',
      exercises:['Plancha progresiva 4x35s','Mountain climbers 3x15','Sentadilla 4x12','Core completo final'],
      workout:'core', primaryAction:'workout' },
    { day:36, phase:5, is_trial:false, title:'Preparar continuidad', focus:'Saber cómo seguir',
      arju_msg:'Lo importante no es solo terminar. Es saber cómo seguir.',
      nutrition_focus:'Una comida sostenible que puedas repetir semana a semana.',
      recipe:'atun-arepa',
      exercises:['Movilidad completa','Activación liviana','Estiramiento final'],
      workout:'rest', primaryAction:'recipe' },
    { day:37, phase:5, is_trial:false, title:'Cierre del reto', focus:'No fue perfección. Fue volver.',
      arju_msg:'Este proceso no fue sobre perfección. Fue sobre volver.',
      nutrition_focus:'Celebra como mereces — 37 días es mucho.',
      recipe:'pollo-arroz-ensalada',
      exercises:['Core completo simbólico','Plancha final','Mountain climbers','Celebración activa'],
      workout:'finish', primaryAction:'summary', challengeEnd:true },
  ];

    // ── Recipe catalog (Semana 1 trial) ─────────────────────
  const RECIPE_CATALOG = {
    'huevos-arepa-aguacate':   { name:'Huevos con arepa y aguacate', time:'15 min', protein:22, cal:380, difficulty:'Fácil' },
    'yogur-banano-avena':      { name:'Yogur griego con banano y avena', time:'5 min', protein:18, cal:310, difficulty:'Fácil' },
    'arroz-pollo-ensalada':    { name:'Arroz con pollo y ensalada', time:'20 min', protein:38, cal:480, difficulty:'Fácil' },
    'tortilla-vegetales':      { name:'Tortilla de huevo con vegetales', time:'12 min', protein:20, cal:280, difficulty:'Fácil' },
    'carne-papa-aguacate':     { name:'Carne molida con papa y aguacate', time:'25 min', protein:34, cal:520, difficulty:'Media' },
    'huevos-pericos':          { name:'Arepa con huevos pericos', time:'10 min', protein:18, cal:340, difficulty:'Fácil' },
    'ensalada-pollo-aguacate': { name:'Ensalada de pollo con aguacate', time:'15 min', protein:36, cal:380, difficulty:'Fácil' },
    'atun-arepa':              { name:'Atún con arepa pequeña', time:'8 min', protein:28, cal:320, difficulty:'Fácil' },
    'pollo-arroz-ensalada':    { name:'Pollo con arroz y ensalada', time:'20 min', protein:40, cal:460, difficulty:'Fácil' },
    'yogur-avena-fruta':       { name:'Yogur griego con avena y fruta', time:'5 min', protein:16, cal:290, difficulty:'Fácil' },
    // Legacy keys
    'pechuga-arroz':           { name:'Pechuga con arroz integral', time:'20 min', protein:40, cal:440, difficulty:'Fácil' },
    'yogur-fruta':             { name:'Yogur con fruta fresca', time:'3 min', protein:12, cal:200, difficulty:'Fácil' },
    'batido-banano':           { name:'Batido de banano y proteína', time:'5 min', protein:24, cal:280, difficulty:'Fácil' },
    'lentejas':                { name:'Lentejas con vegetales', time:'30 min', protein:18, cal:350, difficulty:'Media' },
    'arroz-pollo':             { name:'Arroz con pollo', time:'20 min', protein:36, cal:450, difficulty:'Fácil' },
    'huevos-aguacate':         { name:'Huevos con aguacate', time:'10 min', protein:16, cal:300, difficulty:'Fácil' },
    'omelette':                { name:'Omelette de claras con vegetales', time:'10 min', protein:22, cal:240, difficulty:'Fácil' },
    'atun-frijoles':           { name:'Atún con frijoles negros', time:'10 min', protein:32, cal:380, difficulty:'Fácil' },
    'carne-papa':              { name:'Carne con papa al horno', time:'35 min', protein:30, cal:480, difficulty:'Media' },
  };

  // ── Core helper functions ─────────────────────────────────────
  function getCurrentChallengeType() {
    var reto = localStorage.getItem('af-selected-reto') || '';
    var tipo = localStorage.getItem('af-product-tipo') || '';
    if (reto === 'gluteos' || reto === 'challenge_glutes') return 'gluteos';
    if (reto === 'pancita' || reto === 'challenge_belly') return 'pancita';
    if (reto === 'masa' || reto === 'custom_muscle_gain') return 'gluteos'; // custom plan uses glutes workout template
    if (reto === 'definicion' || reto === 'custom_fat_loss') return 'pancita'; // custom plan uses belly template
    return 'gluteos'; // default
  }

  function getChallengeMeta(type) {
    return CHALLENGE_META[type === 'gluteos' ? 'challenge_glutes' : 'challenge_belly'] || CHALLENGE_META['challenge_glutes'];
  }

  function getCurrentDay() {
    var start = parseInt(localStorage.getItem('af-trial-start') || '0');
    if (!start) return 1;
    var daysPassed = Math.floor((Date.now() - start) / 86400000);
    return Math.max(1, Math.min(37, daysPassed + 1));
  }

  function isTrialDay(dayNum) {
    var paid = localStorage.getItem('af-paid') === '1';
    var status = localStorage.getItem('af-subscription-status') || '';
    if (paid || status === 'active') return false;
    return dayNum <= 7;
  }

  function isDayLocked(dayNum) {
    var paid = localStorage.getItem('af-paid') === '1';
    var status = localStorage.getItem('af-subscription-status') || '';
    if (paid || status === 'active') return false;
    return dayNum > 7;
  }

  function getTrialDayLabel(dayNum) {
    var isLocked = isDayLocked(dayNum);
    if (isLocked) return 'Día ' + dayNum + ' de 37 🔒';
    if (isTrialDay(dayNum)) return 'Día ' + dayNum + ' de 7 gratis';
    return 'Día ' + dayNum + ' de 37';
  }

  function getTodaySummary() {
    var dayNum = getCurrentDay();
    var type = getCurrentChallengeType();
    var days = type === 'gluteos' ? GLUTES_DAYS : BELLY_DAYS;
    var dayData = days[dayNum - 1] || days[0];
    return {
      day: dayNum,
      isTrialDay: isTrialDay(dayNum),
      isLocked: isDayLocked(dayNum),
      dayData: dayData,
      challengeType: type,
    };
  }

    function getRecipeInfo(key) {
    return RECIPE_CATALOG[key] || { name: key, time: '15 min', protein: 20, cal: 300, difficulty: 'Fácil' };
  }

  // ── Phase labels ────────────────────────────────────────────────
  const PHASE_LABELS = {
    glutes: { 1:'Activación + base', 2:'Fuerza base', 3:'Progresión y volumen', 4:'Intensidad inteligente', 5:'Consolidación' },
    belly:  { 1:'Base de hábitos', 2:'Consistencia', 3:'Déficit sostenible', 4:'Fuerza + abdomen', 5:'Cierre y continuidad' },
  };

  // ── getChallengeDayContent — main Day content function ──────────
  function getChallengeDayContent() {
    var type     = getCurrentChallengeType();           // 'gluteos' | 'pancita'
    var dayNum   = getCurrentDay();                     // 1–37
    var isLocked = isDayLocked(dayNum);
    var isTrial  = isTrialDay(dayNum);
    var trialDay = Math.min(dayNum, 7);

    var days = type === 'gluteos' ? GLUTES_DAYS : BELLY_DAYS;
    var dayData = days[dayNum - 1] || days[0];

    var recipe = getRecipeInfo(dayData.recipe);

    // Time-based primary action
    var hour = new Date().getHours();
    var timeAction = hour < 10 ? 'Registrar desayuno' :
                     hour < 13 ? 'Registrar almuerzo' :
                     hour < 17 ? 'Registrar merienda' :
                     hour < 20 ? 'Registrar cena' :
                                 'Cerrar mi día';

    // Override with day's primaryAction if not summary
    var primaryAction = dayData.primaryAction === 'summary' ? 'summary' :
                        dayData.primaryAction === 'workout' ? 'Ir al entrenamiento' :
                        dayData.primaryAction === 'recipe'  ? 'Ver receta de hoy' :
                        timeAction;

    // Trial-specific label
    var daysLeft = Math.max(0, 7 - trialDay);
    var badgeLabel = isTrial ? 'Día ' + trialDay + ' de 7 gratis' : 'Día ' + dayNum + ' de 37';
    var challengeType_key = type === 'gluteos' ? 'glutes' : 'belly';
    var phase = dayData.phase || 1;
    var phaseLabel = (PHASE_LABELS[challengeType_key] || {})[phase] || '';
    var isPhaseEnd = dayData.phaseEnd === true;
    var isChallengeEnd = dayData.challengeEnd === true;

    var trialSubcopy = isTrial
      ? (trialDay < 7
          ? 'Te ' + (daysLeft === 1 ? 'queda 1 día' : 'quedan ' + daysLeft + ' días') + ' de prueba. Luego $32 USD.'
          : 'Hoy termina tu prueba gratis.')
      : 'Reto activo · ' + phaseLabel;

    return {
      challengeType:   type,
      dayNumber:       dayNum,
      trialDay:        trialDay,
      isTrialDay:      isTrial,
      isLocked:        isLocked,
      phase,
      phaseLabel,
      isPhaseEnd,
      isChallengeEnd,
      title:           dayData.title,
      focus:           dayData.focus,
      arjuMessage:     dayData.arju_msg,
      nutritionFocus:  dayData.nutrition_focus,
      exercises:       dayData.exercises || [],
      workoutType:     dayData.workout,
      recipeSuggestion: recipe,
      recipeKey:       dayData.recipe,
      primaryAction,
      timeAction,
      badgeLabel,
      trialSubcopy,
      ctaLabel:        isLocked ? 'Desbloquear reto por $32 USD' :
                       isChallengeEnd ? 'Ver mi resumen del reto' : primaryAction,
    };
  }

    window.AF_Challenge = {
    getMeta: getChallengeMeta,
    getCurrentType: getCurrentChallengeType,
    getDayContent,
    getChallengeDayContent,
    getRecipeInfo,
    RECIPE_CATALOG,
    PHASE_LABELS,
    getCurrentDay,
    isTrialDay,
    isDayLocked,
    getDayLabel: getTrialDayLabel,
    getTodaySummary
  };

})();
