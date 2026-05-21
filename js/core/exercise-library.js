// ═══════════════════════════════════════════════════════
// ArjunaFit — Exercise Library v1
// Master data for all exercises: names, videos, tips,
// errors, regression, progression, breathing cues.
// ═══════════════════════════════════════════════════════
window.EXERCISE_LIBRARY = {

  // ── GLÚTEOS ───────────────────────────────────────────
  'hip-thrust': {
    id:'hip-thrust', slug:'hip-thrust',
    easy:'Empuje de glúteo', technical:'Hip Thrust',
    category:'gluteos', primary_muscle:'Glúteo Mayor',
    secondary_muscles:['Isquiotibiales','Core'],
    equipment:'barra', level:'intermedio',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'glutes/hip-thrust-16x9.mp4',
    arju_tip:'Pausa un segundo arriba. Ahí es donde el glúteo trabaja más.',
    common_mistake:'No arquees la espalda para subir más peso. La pelvis sube, no la espalda.',
    setup:'Apoya la parte alta de la espalda en un banco. Pies al ancho de cadera. Barra sobre cadera con protección.',
    execution:'Empuja con los talones y lleva la pelvis hacia arriba. Aprieta glúteos arriba. Baja controlado.',
    breathing:'Exhala al subir. Inhala al bajar.',
    regression:'Puente de glúteo en el piso sin peso.',
    progression:'Agrega 2.5kg cuando completes todas las reps con control y buena pausa.'
  },
  'peso-muerto-rumano': {
    id:'peso-muerto-rumano', slug:'peso-muerto-rumano',
    easy:'Bisagra de fuerza', technical:'Peso muerto rumano',
    category:'gluteos', primary_muscle:'Isquiotibiales',
    secondary_muscles:['Glúteo Mayor','Lumbar'],
    equipment:'barra_mancuernas', level:'intermedio',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'glutes/peso-muerto-rumano-16x9.mp4',
    arju_tip:'Dobla la cadera hacia atrás, no la espalda hacia abajo. Siente el estiramiento en los isquios.',
    common_mistake:'No redondees la espalda. Si sientes la espalda, baja el peso.',
    setup:'Pies al ancho de cadera. Agarre por fuera de las piernas. Espalda neutra.',
    execution:'Lleva la cadera atrás manteniendo espalda recta. Baja hasta sentir estiramiento. Regresa con la cadera.',
    breathing:'Inhala antes de bajar. Exhala al subir.',
    regression:'Bisagra de cadera sin peso con banda en espejo.',
    progression:'Agrega 2.5kg cuando puedas completar todas las reps sin perder la postura.'
  },
  'sentadilla-bulgara': {
    id:'sentadilla-bulgara', slug:'sentadilla-bulgara',
    easy:'Pierna firme', technical:'Sentadilla búlgara',
    category:'gluteos', primary_muscle:'Cuádriceps',
    secondary_muscles:['Glúteo Mayor','Isquiotibiales'],
    equipment:'mancuernas_barra', level:'intermedio',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'glutes/sentadilla-bulgara-16x9.mp4',
    arju_tip:'El pie de atrás no empuja. Solo equilibra. Baja controlado, sin lanzarte.',
    common_mistake:'No dejes que la rodilla delantera colapse hacia adentro.',
    setup:'Pie trasero elevado en banco. Pie delantero alejado. Tronco ligeramente inclinado.',
    execution:'Baja hasta que la rodilla trasera casi toque el suelo. Empuja con el talón delantero.',
    breathing:'Inhala al bajar. Exhala al subir.',
    regression:'Zancada estática sin elevación ni peso.',
    progression:'Primero domina el equilibrio, luego agrega mancuernas.'
  },
  'abduccion-maquina': {
    id:'abduccion-maquina', slug:'abduccion-maquina',
    easy:'Abre glúteo', technical:'Abducción en máquina',
    category:'gluteos', primary_muscle:'Glúteo Medio',
    secondary_muscles:['Glúteo Menor'],
    equipment:'maquina', level:'principiante',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'glutes/abduccion-maquina-16x9.mp4',
    arju_tip:'Abre con control. No rebotes. La contracción al abrir es lo más importante.',
    common_mistake:'No usar impulso. Si rebotás, el peso es muy alto.',
    setup:'Siéntate derecha. Almohadillas sobre los muslos. Espalda contra el respaldo.',
    execution:'Abre lentamente resistiendo hasta el final. Pausa 1 segundo. Cierra controlado.',
    breathing:'Exhala al abrir. Inhala al cerrar.',
    regression:'Abducción de pie con banda liviana.',
    progression:'Agrega un peldaño de peso cuando puedas hacer todas las reps sin impulso.'
  },
  'patada-gluteo': {
    id:'patada-gluteo', slug:'patada-gluteo',
    easy:'Patada de glúteo', technical:'Kickback en cable',
    category:'gluteos', primary_muscle:'Glúteo Mayor',
    secondary_muscles:['Isquiotibiales'],
    equipment:'cable', level:'principiante',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'glutes/patada-gluteo-16x9.mp4',
    arju_tip:'No es la pierna que empuja — es el glúteo. Siente el glúteo trabajar.',
    common_mistake:'No arquees la lumbar para llegar más atrás.',
    setup:'Tobillera en cable bajo. Inclinado levemente hacia adelante. Core firme.',
    execution:'Extiende la pierna hacia atrás con el glúteo. Pausa arriba. Regresa controlado.',
    breathing:'Exhala al extender. Inhala al regresar.',
    regression:'Patada de glúteo en cuadrupedia sin peso.',
    progression:'Sube el peso cuando completes todas las reps sin mover la espalda.'
  },
  'puente-gluteo': {
    id:'puente-gluteo', slug:'puente-gluteo',
    easy:'Puente de glúteo', technical:'Glute Bridge',
    category:'gluteos', primary_muscle:'Glúteo Mayor',
    secondary_muscles:['Core','Isquiotibiales'],
    equipment:'suelo', level:'principiante',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'glutes/puente-gluteo-16x9.mp4',
    arju_tip:'Aprieta el glúteo arriba antes de bajar. Ese apriete es el trabajo.',
    common_mistake:'No hiperextiendas la lumbar. La pelvis sube, no la espalda.',
    setup:'Tumbada de espaldas. Pies al ancho de cadera. Rodillas flexionadas.',
    execution:'Empuja talones al suelo y sube la cadera. Aprieta arriba. Baja controlado.',
    breathing:'Exhala al subir. Inhala al bajar.',
    regression:'Lo mismo con menos rango de movimiento.',
    progression:'Agrega peso sobre las caderas o pasa a hip thrust con banco.'
  },

  // ── CORE ──────────────────────────────────────────────
  'plancha': {
    id:'plancha', slug:'plancha',
    easy:'Bloqueo de abdomen', technical:'Plancha',
    category:'core', primary_muscle:'Core (Transverso)',
    secondary_muscles:['Glúteos','Hombros'],
    equipment:'suelo', level:'principiante',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'core/plancha-16x9.mp4',
    arju_tip:'Aprieta abdomen y glúteos. No dejes que la cadera caiga ni suba.',
    common_mistake:'No dejes caer la cadera. Si cae, baja a rodillas.',
    setup:'Antebrazos o manos en el suelo. Cuerpo en línea recta.',
    execution:'Mantén la posición apretando todo: abdomen, glúteos, piernas. Respira.',
    breathing:'Respira normal. No aguantes la respiración.',
    regression:'Plancha con rodillas apoyadas en el suelo.',
    progression:'Cuando sostengas 30 segundos con buena técnica, agrega 10 segundos más.'
  },
  'crunch': {
    id:'crunch', slug:'crunch',
    easy:'Cierre de abdomen', technical:'Crunch abdominal',
    category:'core', primary_muscle:'Recto Abdominal',
    secondary_muscles:['Oblicuos'],
    equipment:'suelo', level:'principiante',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'core/crunch-16x9.mp4',
    arju_tip:'El movimiento es pequeño. Solo despega los hombros. El abdomen hace el trabajo.',
    common_mistake:'No jales el cuello con las manos. Los brazos acompañan, no empujan.',
    setup:'Tumbada boca arriba. Rodillas flexionadas. Manos detrás de la cabeza o cruzadas.',
    execution:'Despega hombros apretando el abdomen. Baja controlado sin relajar.',
    breathing:'Exhala al subir. Inhala al bajar.',
    regression:'Contracción abdominal sin despegar (transverso).',
    progression:'Agrega 5 reps más o incorpora peso pequeño en el pecho.'
  },
  'mountain-climbers': {
    id:'mountain-climbers', slug:'mountain-climbers',
    easy:'Rodillas al frente', technical:'Mountain climbers',
    category:'core', primary_muscle:'Core',
    secondary_muscles:['Hombros','Flexores de cadera'],
    equipment:'suelo', level:'principiante',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'core/mountain-climbers-16x9.mp4',
    arju_tip:'Controla el abdomen. No solo corras las piernas. La cadera no sube.',
    common_mistake:'No dejes que la cadera suba hacia arriba. Cuerpo paralelo al suelo.',
    setup:'Posición de plancha con brazos extendidos. Core firme.',
    execution:'Alterna llevar cada rodilla hacia el pecho. Mantén cadera baja.',
    breathing:'Respira continuo. No aguantes.',
    regression:'Hazlo lento, paso a paso, sin saltar.',
    progression:'Aumenta la velocidad cuando controles la postura perfectamente.'
  },
  'elevacion-piernas': {
    id:'elevacion-piernas', slug:'elevacion-piernas',
    easy:'Sube piernas', technical:'Elevación de piernas',
    category:'core', primary_muscle:'Recto Abdominal Inferior',
    secondary_muscles:['Flexores de cadera'],
    equipment:'suelo_barra', level:'intermedio',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'core/elevacion-piernas-16x9.mp4',
    arju_tip:'La espalda baja debe presionar el suelo todo el tiempo. Si se despega, acorta el rango.',
    common_mistake:'No uses impulso. Si no puedes mantener la espalda abajo, dobla las rodillas.',
    setup:'Tumbada boca arriba. Manos bajo la espalda o al lado. Piernas juntas.',
    execution:'Sube las piernas hasta 90° manteniendo la espalda baja pegada. Baja controlado.',
    breathing:'Exhala al subir. Inhala al bajar.',
    regression:'Elevación con rodillas flexionadas a 90°.',
    progression:'Baja más lento (3-4 segundos bajando).'
  },

  // ── FUERZA GENERAL ────────────────────────────────────
  'press-banca': {
    id:'press-banca', slug:'press-banca',
    easy:'Empuje de pecho', technical:'Press banca',
    category:'pecho', primary_muscle:'Pectoral',
    secondary_muscles:['Tríceps','Deltoides Anterior'],
    equipment:'barra_mancuernas', level:'intermedio',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'general/press-banca-16x9.mp4',
    arju_tip:'Controla la bajada. No rebotes la barra contra el pecho.',
    common_mistake:'No arquees excesivamente la espalda. Las escápulas van hacia abajo y adentro.',
    setup:'Tumbada en banco. Agarre ligeramente más ancho que hombros. Pies apoyados.',
    execution:'Baja la barra al pecho en 2-3 segundos. Empuja hacia arriba y ligeramente atrás.',
    breathing:'Inhala al bajar. Exhala al empujar.',
    regression:'Press con mancuernas o en máquina.',
    progression:'Agrega 2.5kg cuando completes todas las reps sin perder técnica.'
  },
  'jalon-pecho': {
    id:'jalon-pecho', slug:'jalon-pecho',
    easy:'Jalón de espalda', technical:'Jalón al pecho',
    category:'espalda', primary_muscle:'Dorsal Ancho',
    secondary_muscles:['Bíceps','Romboides'],
    equipment:'maquina', level:'principiante',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'general/jalon-pecho-16x9.mp4',
    arju_tip:'Jala con los codos, no con las manos. Piensa en llevar los codos hacia las caderas.',
    common_mistake:'No te inclines demasiado atrás. El torso puede inclinarse 15-20°, no más.',
    setup:'Sentada con muslos bajo los apoyos. Agarre neutro o prono, algo más ancho que hombros.',
    execution:'Jala hacia el pecho llevando los codos hacia abajo. Aprieta la espalda. Regresa controlado.',
    breathing:'Exhala al jalar. Inhala al subir.',
    regression:'Remo en polea sentada.',
    progression:'Agrega un peldaño de peso cuando hagas todas las reps sin impulso.'
  },
  'remo-mancuerna': {
    id:'remo-mancuerna', slug:'remo-mancuerna',
    easy:'Remo fuerte', technical:'Remo con mancuerna',
    category:'espalda', primary_muscle:'Dorsal Ancho',
    secondary_muscles:['Romboides','Bíceps'],
    equipment:'mancuerna', level:'principiante',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'general/remo-mancuerna-16x9.mp4',
    arju_tip:'Jala con el codo, no con el brazo. Lleva el codo hacia el techo.',
    common_mistake:'No rotar el torso para subir más peso. Si rotas, el peso es mucho.',
    setup:'Apoyar rodilla y mano del mismo lado en banco. Cuerpo paralelo al suelo.',
    execution:'Jala la mancuerna hacia la cadera llevando el codo hacia arriba. Baja controlado.',
    breathing:'Exhala al jalar. Inhala al bajar.',
    regression:'Remo con banda de resistencia anclada.',
    progression:'Agrega 2kg cuando hagas todas las reps sin rotar el cuerpo.'
  },
  'press-militar': {
    id:'press-militar', slug:'press-militar',
    easy:'Empuje arriba', technical:'Press militar',
    category:'hombros', primary_muscle:'Deltoides',
    secondary_muscles:['Tríceps','Trapecios'],
    equipment:'barra_mancuernas', level:'intermedio',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'general/press-militar-16x9.mp4',
    arju_tip:'No inclines el torso para completar la rep. Si lo haces, el peso es demasiado.',
    common_mistake:'No arquees la lumbar al empujar. Core firme en todo momento.',
    setup:'De pie o sentada. Barra o mancuernas a la altura de los hombros. Agarre neutro o prono.',
    execution:'Empuja hacia arriba hasta extender brazos. Baja controlado al punto de inicio.',
    breathing:'Exhala al empujar. Inhala al bajar.',
    regression:'Press con mancuernas sentada con respaldo.',
    progression:'Agrega 2.5kg cuando hagas todas las reps sin compensar con la espalda.'
  },
  'sentadilla-libre': {
    id:'sentadilla-libre', slug:'sentadilla-libre',
    easy:'Sentadilla con barra', technical:'Sentadilla libre',
    category:'piernas', primary_muscle:'Cuádriceps',
    secondary_muscles:['Glúteos','Isquiotibiales','Core'],
    equipment:'barra', level:'intermedio',
    video_status:'pending',
    video_url:'', thumbnail_url:'',
    video_path:'general/sentadilla-libre-16x9.mp4',
    arju_tip:'Rodillas siguen los pies. Pecho arriba. Baja hasta paralela o más.',
    common_mistake:'No dejes que las rodillas colapsen hacia adentro. Aprieta glúteos al subir.',
    setup:'Barra en trapecios. Pies al ancho de hombros. Puntas ligeramente afuera.',
    execution:'Baja como si te sentaras. Rodillas alineadas. Sube empujando el suelo.',
    breathing:'Inhala al bajar. Exhala al subir.',
    regression:'Sentadilla con peso corporal o goblet squat.',
    progression:'Agrega 5kg cuando la técnica sea perfecta en todas las reps.'
  },
  // ── Pancita / Full body extras ─────────────────────────────
  'bicho-muerto': { id:'bicho-muerto', easy:'Bicho muerto', technical:'Dead Bug', category:'core', primary_muscle:'Core', secondary_muscles:['Columna vertebral'], equipment:'sin equipo', level:'principiante', video_status:'pending', video_url:'', thumbnail_url:'', arju_tip:'Presiona la espalda baja contra el piso. Ahí está el 90% del trabajo.', common_mistake:'Dejar que la espalda se despegue del suelo.', setup:'Boca arriba. Rodillas a 90°. Brazos al techo.', execution:'Extiende brazo y pierna contrarios. Alterna.', breathing:'Exhala al extender.', regression:'Solo mover brazos.', progression:'Peso en muñecas.', video_path:'core/dead-bug-16x9.mp4', slug:'bicho-muerto' },
  'bird-dog': { id:'bird-dog', easy:'Perro pájaro', technical:'Bird Dog', category:'core', primary_muscle:'Core', secondary_muscles:['Glúteo Mayor'], equipment:'sin equipo', level:'principiante', video_status:'pending', video_url:'', thumbnail_url:'', arju_tip:'La cadera no debe rotar.', common_mistake:'Subir demasiado la pierna.', setup:'Cuatro puntos.', execution:'Extiende brazo y pierna opuestos. 2s. Alterna.', breathing:'Exhala al extender.', regression:'Solo mover brazos.', progression:'Pausa de 5s.', video_path:'core/bird-dog-16x9.mp4', slug:'bird-dog' },
  'sentadilla-copa': { id:'sentadilla-copa', easy:'Sentadilla copa', technical:'Goblet Squat', category:'pierna_gluteo', primary_muscle:'Cuádriceps', secondary_muscles:['Glúteo','Core'], equipment:'mancuerna', level:'principiante', video_status:'pending', video_url:'', thumbnail_url:'', arju_tip:'Rodillas hacia afuera. Pecho arriba.', common_mistake:'Dejar caer el pecho.', setup:'Mancuerna frente al pecho. Pies al ancho de hombros.', execution:'Baja hasta que los codos pasen las rodillas. Sube.', breathing:'Inhala al bajar.', regression:'Con silla detrás.', progression:'Más peso.', video_path:'legs/goblet-squat-16x9.mp4', slug:'sentadilla-copa' },
  'caminata-lateral': { id:'caminata-lateral', easy:'Caminata lateral', technical:'Lateral Band Walk', category:'gluteos', primary_muscle:'Glúteo Medio', secondary_muscles:['Cadera'], equipment:'banda', level:'principiante', video_status:'pending', video_url:'', thumbnail_url:'', arju_tip:'Banda siempre tensa.', common_mistake:'Rodillas entrando.', setup:'Banda en tobillos.', execution:'Pasos laterales controlados. 10-15 por lado.', breathing:'Natural.', regression:'Sin banda.', progression:'Pausa en apertura.', video_path:'glutes/lateral-walk-16x9.mp4', slug:'caminata-lateral' },
  'hollow-hold-mod': { id:'hollow-hold-mod', easy:'Hollow suave', technical:'Modified Hollow Hold', category:'core', primary_muscle:'Core', secondary_muscles:['Transverso abdominal'], equipment:'sin equipo', level:'principiante', video_status:'pending', video_url:'', thumbnail_url:'', arju_tip:'Lumbar pegada al piso siempre.', common_mistake:'Arquear la espalda.', setup:'Boca arriba.', execution:'Levanta cabeza, hombros y pies. Lumbar pegada.', breathing:'Exhala lento.', regression:'Rodillas dobladas.', progression:'Brazos sobre la cabeza.', video_path:'core/hollow-hold-16x9.mp4', slug:'hollow-hold-mod' }

};

// ── Helpers ───────────────────────────────────────────
window.EXERCISE_LIBRARY.getById = function(id) {
  return this[id] || null;
};

window.EXERCISE_LIBRARY.getByCategory = function(cat) {
  return Object.values(this).filter(e => typeof e === 'object' && e.category === cat);
};

window.EXERCISE_LIBRARY.getPendingVideos = function() {
  return Object.values(this)
    .filter(e => typeof e === 'object' && e.video_status === 'pending')
    .map(e => ({ id: e.id, easy: e.easy, technical: e.technical, path: e.video_path }));};
