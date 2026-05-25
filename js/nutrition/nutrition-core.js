
window.sw = window.sw || function(id) {
  ['hoy','recetas','mercado','fuera'].forEach(function(k) {
    var tc  = document.getElementById('tc-'+k);
    var btn = document.getElementById('t-'+k);
    if (tc) tc.style.display = (k===id) ? 'flex' : 'none';
  });
};
(function() {
  var h = new Date().getHours();
  var lbl = h<11?'Registrar desayuno con foto':
              h<15?'Registrar almuerzo con foto':
              h<19?'Registrar cena con foto':
              h<21?'Registrar snack con foto':'Registrar comida con foto';
  var el = document.getElementById('photoMainLabel');
  if (el) el.textContent = lbl;
})();
var days  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
var months= ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
var now   = new Date();
var _hdrDate = document.getElementById('hdrDate');
if (_hdrDate) _hdrDate.textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
let _sb = null, _uid = null;
try {
  _sb = window.supabase?.createClient(
    'https://egswsqymkxmbtcpnozcq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM',
    { auth: { persistSession:true, storageKey:'arjunafit-auth' } }
  );
} catch(e) {}
var TIPS = [
  'Prioriza proteína en cada comida. Es lo más importante para el reto.',
  'Agua primero. El hambre entre comidas a veces es sed disfrazada.',
  'El arroz, fríjoles y aguacate son tus aliados sin exagerar.',
  'No hay alimentos prohibidos. Hay porciones más inteligentes.',
  'Come despacio. La saciedad llega 15 minutos después del primer bocado.',
  'Un batido de banano + avena + proteína es el desayuno del reto.',
  'Preparar la comida el domingo cambia toda la semana.',
];
var _tip = document.getElementById('nutriTip'); if (_tip) _tip.textContent = TIPS[now.getDay() % TIPS.length];

var REC_BY_TIME = {
  desayuno: [
    { id:'huevos-aguacate', emoji:'🍳', name:'Desayuno que sí llena', desc:'Rápido, proteína real, sin complicarse.' },
    { id:'avena-banano',    emoji:'🥣', name:'Avena que te sostiene',  desc:'La energía que necesitas para empezar.' },
    { id:'omelette',        emoji:'🥚', name:'Omelette en 8 minutos',  desc:'Alta proteína antes de que empiece el día.' },
  ],
  almuerzo: [
    { id:'pechuga-arroz',  emoji:'🍗', name:'Almuerzo base del reto',  desc:'Simple, completo y listo en 20 minutos.' },
    { id:'atun-frijoles',  emoji:'🥗', name:'Sin cocción y listo',      desc:'5 minutos. Proteína alta. Sin excusas.' },
    { id:'arroz-pollo',    emoji:'🍲', name:'El clásico que funciona',  desc:'Rendidor, proteína suficiente, económico.' },
  ],
  cena: [
    { id:'lentejas',       emoji:'🍲', name:'Cena ligera que reconforta', desc:'Caliente, saciante y sin pasarte.' },
    { id:'caldo-papa',     emoji:'🍵', name:'Caldo para cerrar bien',     desc:'Para noches de recuperación y descanso.' },
    { id:'omelette',       emoji:'🥚', name:'Cena rápida y proteica',     desc:'Lo que necesitas sin complicarte la noche.' },
  ],
  snack: [
    { id:'yogur-fruta',    emoji:'🫙', name:'Snack que no te arrepientes', desc:'Dulce, proteico y listo en 2 minutos.' },
    { id:'banano-mani',    emoji:'🍌', name:'Para no llegar con hambre',   desc:'Carbohidratos + proteína. Combinación ganadora.' },
    { id:'huevos-cocidos', emoji:'🥚', name:'Snack prep del domingo',      desc:'Cocina 6 hoy y tienes para toda la semana.' },
  ],
};

let _currentRecId = 'pechuga-arroz';

function initRecipeRec() {
  var h = new Date().getHours();
  var meal = h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 19 ? 'cena' : 'snack';
  var labels = { desayuno:'¿Qué desayunar hoy?', almuerzo:'¿Qué almorzar hoy?',
                   cena:'¿Qué cenar hoy?', snack:'¿Qué comer ahora?' };
  var pool = REC_BY_TIME[meal] || REC_BY_TIME.almuerzo;
  var rec  = pool[new Date().getDay() % pool.length];

  _currentRecId = rec.id;

  var el = id => document.getElementById(id);
  if (el('recTimeLabel')) el('recTimeLabel').textContent = labels[meal];
  if (el('recEmoji'))     el('recEmoji').textContent = rec.emoji;
  if (el('recName'))      el('recName').textContent  = rec.name;
  if (el('recDesc'))      el('recDesc').textContent  = rec.desc;

  // Pills from RECIPES data
  var r = RECIPES[rec.id];
  var pills = el('recPills');
  if (pills && r) {
    pills.innerHTML = `
      <span style="font-size:10px;background:rgba(124,58,237,.15);color:#c4b5fd;
        padding:2px 9px;border-radius:12px;font-weight:600">💪 ${r.prot}g prot</span>
      <span style="font-size:10px;background:rgba(245,158,11,.1);color:#fcd34d;
        padding:2px 9px;border-radius:12px;font-weight:600">⏱ ${r.time} min</span>
      <span style="font-size:10px;background:rgba(255,255,255,.07);color:rgba(240,238,248,.4);
        padding:2px 9px;border-radius:12px">Fácil</span>
    `;
  }
}

function openRecipeFromRec() {
  // Microvictory
  if (window.MV) window.MV.show('Comer mejor empieza por hacerlo más fácil.',
    { emoji:'🍳', color:'rgba(249,115,22,.35)' });
  openRecipeDetail(_currentRecId);
}

// Meal type selector before saving recipe
function saveRecipeAsMeal(presetMeal) {
  var r = RECIPES[_currentRecId || _currentDetailId];
  if (!r) return;
  if (presetMeal) { _doSaveRecipe(r, presetMeal); return; }
  var h = new Date().getHours();
  var suggested = h<11?'desayuno':h<15?'almuerzo':h<19?'snack':'cena';
  var MEAL_LABELS = { desayuno:'🌅 Desayuno', almuerzo:'🌞 Almuerzo', snack:'🍎 Snack', cena:'🌙 Cena' };
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(8,5,17,.92);display:flex;align-items:flex-end;justify-content:center;padding:0 0 env(safe-area-inset-bottom)';
  ov.innerHTML = '<div style="width:100%;max-width:430px;background:#130d22;border:1px solid rgba(255,255,255,.08);border-radius:24px 24px 0 0;padding:24px 20px">' +
    '<div style="font-size:15px;font-weight:700;color:#f1f0f4;margin-bottom:16px;text-align:center">¿A qué comida vas a agregar?</div>' +

  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) {
    var btn = e.target.closest('.meal-sel-btn');
    var cancel = e.target.closest('.meal-sel-cancel');
    if (btn) { document.body.removeChild(ov); saveRecipeAsMeal(btn.dataset.meal); }
    if (cancel) { document.body.removeChild(ov); }
  });
}

function _doSaveRecipe(r, meal) {
  var portions = parseFloat(localStorage.getItem('af-recipe-portions') || '1');
  var pCal  = Math.round((r.cal  || 0) * portions);
  var pProt = Math.round((r.prot || 0) * portions);
  var pCarb = Math.round((r.carb || 0) * portions);
  var pFat  = Math.round((r.fat  || 0) * portions);
  saveFood(r.name, pCal, pProt, pFat, meal);
  if (window.AF) AF.track('recipe_added_to_day', { recipe_id: _currentRecId || _currentDetailId, meal, cal: pCal, protein: pProt, product: localStorage.getItem('af-product-type') || '' });
  if (window.MV) window.MV.show('Ya tienes una decisión menos que pensar hoy.',
    { emoji:'✅', color:'rgba(34,197,94,.35)' });
  localStorage.removeItem('af-recipe-portions');
}

// Recipe favorites
var _favs = [];
(function loadFavs() {
  try { _favs = JSON.parse(localStorage.getItem('af-recipe-favs') || '[]'); } catch(e) {}
})();
function toggleFavorite(id) {
  var idx = _favs.indexOf(id);
  if (idx >= 0) { _favs.splice(idx,1); } else { _favs.push(id); }
  localStorage.setItem('af-recipe-favs', JSON.stringify(_favs));
  var btn = document.getElementById('fav-btn-' + id);
  if (btn) btn.textContent = _favs.includes(id) ? '⭐' : '☆';
  if (window.AF) AF.track(_favs.includes(id) ? 'recipe_favorited' : 'recipe_unfavorited', { recipe_id: id });
}

// Get recommended recipe by product + time
function getRecommendedRecipe() {
  var productType = localStorage.getItem('af-product-type') || '';
  var reto = localStorage.getItem('af-selected-reto') || '';
  var h = new Date().getHours();
  var mealTime = h<11 ? 'desayuno' : h<15 ? 'almuerzo' : h<19 ? 'snack' : 'cena';
  
  // Product-aware priority tags
  var priorityTags = ['high_protein'];
  if (reto === 'gluteos' || productType === 'custom_muscle_gain')    priorityTags = ['high_protein','muscle','post_workout'];
  if (reto === 'pancita' || productType === 'custom_fat_loss')       priorityTags = ['light','satiety','vegetarian'];
  
  var candidates = Object.entries(RECIPES).filter(function(entry) {
    var r = entry[1];
    if (!r || !r.tags) return true;
    // Match meal time
    if (mealTime === 'desayuno' && r.tags.includes('almuerzo') && !r.tags.includes('desayuno')) return false;
    if (mealTime === 'cena'     && r.tags.includes('almuerzo') && !r.tags.includes('cena'))     return false;
    return true;
  });
  
  // Prefer high protein for any reto/plan
  candidates.sort(function(a, b) { return (b[1].prot || 0) - (a[1].prot || 0); });
  return candidates[0] ? candidates[0][0] : 'pechuga-arroz';
}

function sw(id) {
  var TABS = ['hoy','recetas','mercado','fuera','guia'];
  var COLORS = {
    hoy:      'linear-gradient(135deg,#7c3aed,#a855f7)',
    recetas:  'linear-gradient(135deg,#f97316,#fb923c)',
    mercado:  'linear-gradient(135deg,#10b981,#059669)',
    fuera:    'linear-gradient(135deg,#3b82f6,#6366f1)',
    guia:     'linear-gradient(135deg,#8b5cf6,#a78bfa)',
  };
  TABS.forEach(k => {
    var btn = document.getElementById('t-'+k);
    var tc  = document.getElementById('tc-'+k);
    if (tc) tc.classList.toggle('on', k === id);
    if (btn) {
      if (k === id) {
        btn.style.background = COLORS[k] || COLORS.hoy;
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.fontWeight = '700';
        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,.3)';
      } else {
        btn.style.background = 'rgba(255,255,255,.05)';
        btn.style.color = 'rgba(255,255,255,.5)';
        btn.style.border = '1px solid rgba(255,255,255,.08)';
        btn.style.fontWeight = '600';
        btn.style.boxShadow = 'none';
      }
    }
  });
  // Build dynamic content per tab
  if (id === 'recetas') { initRecipeRec(); setTimeout(renderRecetario, 50); }
  if (id === 'mercado') setTimeout(buildShop, 50);
  if (id === 'hoy')     loadToday();
  // Set tab top position from actual header height
  var hdr = document.querySelector('.hdr');
  var hdrH = hdr ? (hdr.getBoundingClientRect().bottom || hdr.offsetHeight) : 105;
  // Scroll tab content to top
  var tc = document.getElementById('tc-' + id);
  if (tc) {
    tc.style.top = hdrH + 'px';
    tc.scrollTop = 0;
  }
  // Render dynamic tabs
  if (id === 'mercado') setTimeout(renderMarket, 60);
  if (id === 'recetas') setTimeout(function(){ filterByMeal(window._activeRecipeFilter||'todo'); }, 60);
}
function renderRecetario() {
  // No-op if grid already in DOM (static HTML)
  // Just ensure filters reset and search is cleared
  var searchEl = document.getElementById('recipeSearch');
  if (searchEl) searchEl.value = '';
  document.querySelectorAll('.rc').forEach(function(c) { c.classList.remove('hidden'); });
  document.querySelectorAll('.rf').forEach(function(b) { b.classList.toggle('on', b.dataset.cat === 'all'); });
}

function searchRecipes(val) {
  var q = val.toLowerCase().trim();
  document.querySelectorAll('.rc').forEach(function(card) {
    var name = (card.querySelector('.rc-name')?.textContent || '').toLowerCase();
    var tags = (card.dataset.tags || '').toLowerCase();
    var visible = !q || name.includes(q) || tags.includes(q);
    card.classList.toggle('hidden', !visible);
  });
  var visible = document.querySelectorAll('.rc:not(.hidden)').length;
  var emptyEl = document.getElementById('recEmptyState');
  if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
}
function filterRecipes(cat, btn) {
  // Update filter buttons
  document.querySelectorAll('.rf').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  // Show/hide recipe cards
  document.querySelectorAll('.rc').forEach(card => {
    var tags = card.dataset.tags || '';
    if (cat === 'all' || tags.includes(cat)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}
var RECIPES = {
  'bowl-huevos':     {name:'Bowl de huevos y aguacate',      cat:'desayuno', cal:380, prot:28, fat:18, carb:22, time:'10 min', emoji:'🥗',
    ing:['3 huevos','1/2 aguacate','1 tomate','Espinaca','Sal y pimienta'],
    steps:['Cocina los huevos al gusto (revueltos o pochados)','Corta el aguacate y el tomate en cubos','Arma el bowl con espinaca de base','Agrega los huevos encima con el aguacate y tomate','Sazona con sal, pimienta y limón']},
  'huevos-espinaca': {name:'Huevos revueltos con espinaca',  cat:'desayuno', cal:280, prot:22, fat:16, carb:8,  time:'7 min',  emoji:'🥚',
    ing:['3 huevos','1 taza espinaca','1/2 cebolla','Aceite de oliva','Sal'],
    steps:['Saltea la cebolla en aceite 2 min','Agrega la espinaca hasta que reduzca','Bate los huevos y vierte sobre la mezcla','Revuelve a fuego medio-bajo','Sirve caliente']},
  'avena-proteina':  {name:'Avena con proteína y banana',    cat:'desayuno', cal:350, prot:30, fat:6,  carb:52, time:'8 min',  emoji:'🥣',
    ing:['1/2 taza avena','1 scoop proteína','1 banana','200ml leche','Canela'],
    steps:['Cocina la avena con la leche 3-4 min','Retira del fuego y mezcla la proteína','Agrega la banana en rodajas encima','Espolvorea canela al gusto','Sirve tibio o frío']},
  'tostadas-salmon': {name:'Tostadas de salmón y aguacate',  cat:'desayuno', cal:320, prot:25, fat:14, carb:26, time:'5 min',  emoji:'🍞',
    ing:['2 tostadas integrales','100g salmón ahumado','1/2 aguacate','Alcaparras','Limón'],
    steps:['Tuesta el pan integral','Machaca el aguacate con limón y sal','Unta el aguacate en las tostadas','Coloca el salmón encima','Decora con alcaparras']},
  'pancakes-prot':   {name:'Pancakes de avena y proteína',   cat:'desayuno', cal:420, prot:35, fat:8,  carb:48, time:'15 min', emoji:'🥞',
    ing:['1 taza avena molida','2 huevos','1 scoop proteína','1/2 taza leche','1 cdta polvo hornear'],
    steps:['Mezcla todos los ingredientes hasta tener masa homogénea','Calienta sartén antiadherente a fuego medio','Vierte 1/4 taza de masa por pancake','Cocina 2 min por lado','Sirve con fruta fresca']},
  'yogur-frutas':    {name:'Yogur griego con frutas y miel', cat:'desayuno', cal:260, prot:20, fat:4,  carb:34, time:'3 min',  emoji:'🫙',
    ing:['200g yogur griego 0%','1/2 taza frutas mixtas','1 cdta miel','Granola (opcional)'],
    steps:['Sirve el yogur en un bowl','Agrega las frutas encima','Rocía la miel','Agrega granola si deseas','Consume de inmediato']},
  'arepa-huevo':     {name:'Arepa con huevo y aguacate',     cat:'desayuno', cal:340, prot:18, fat:14, carb:38, time:'12 min', emoji:'🫓',
    ing:['1 arepa mediana','2 huevos','1/2 aguacate','Sal al gusto'],
    steps:['Calienta la arepa en plancha 5 min por lado','Fríe o pochas los huevos','Machaca el aguacate con sal y limón','Abre la arepa y rellena con huevo y aguacate']},
  'smoothie-prot':   {name:'Smoothie verde proteico',        cat:'desayuno', cal:290, prot:28, fat:6,  carb:30, time:'4 min',  emoji:'🥤',
    ing:['1 scoop proteína vainilla','1 banana congelada','1 taza espinaca','300ml leche de almendras','Hielo'],
    steps:['Coloca todos los ingredientes en la licuadora','Licúa 60 segundos a velocidad alta','Sirve inmediatamente','Puedes agregar semillas de chía']},
  'tortilla-vegetal':{name:'Tortilla de vegetales',          cat:'desayuno', cal:310, prot:24, fat:16, carb:18, time:'10 min', emoji:'🍳',
    ing:['3 huevos','1/2 pimentón','1/4 cebolla','Champiñones','Aceite oliva'],
    steps:['Saltea los vegetales 3 min','Bate los huevos con sal','Vierte sobre los vegetales en sartén','Cocina 3 min sin revolver','Dobla y sirve']},
  'bowl-frutas':     {name:'Bowl de frutas con granola fit', cat:'desayuno', cal:290, prot:12, fat:8,  carb:42, time:'5 min',  emoji:'🍓',
    ing:['1 taza frutas mixtas','1/2 taza granola baja en azúcar','150g yogur griego','Miel'],
    steps:['Coloca el yogur como base','Agrega las frutas','Esparce la granola encima','Rocía con miel']},
  'wrap-pechuga':    {name:'Wrap de pechuga y vegetales',    cat:'desayuno', cal:370, prot:32, fat:10, carb:38, time:'8 min',  emoji:'🌯',
    ing:['1 tortilla integral','120g pechuga cocida','Lechuga','Tomate','Mostaza'],
    steps:['Calienta la tortilla 30 seg','Coloca la pechuga desmenuzada','Agrega lechuga y tomate','Añade mostaza','Enrolla y sirve']},
  'cottage-frutas':  {name:'Cottage con frutas y almendras', cat:'desayuno', cal:250, prot:22, fat:8,  carb:20, time:'3 min',  emoji:'🧀',
    ing:['200g queso cottage','1/2 taza fresas','20g almendras','1 cdta miel'],
    steps:['Sirve el cottage en un bowl','Corta las fresas y agrega encima','Esparce las almendras','Rocía con miel']},
  'tostadas-atun':   {name:'Tostadas integrales con atún',   cat:'desayuno', cal:300, prot:26, fat:8,  carb:28, time:'5 min',  emoji:'🐟',
    ing:['2 tostadas integrales','1 lata atún en agua','1/4 aguacate','Limón','Cebolla morada'],
    steps:['Escurre el atún','Mezcla con aguacate machacado y limón','Corta cebolla morada finamente','Unta en las tostadas','Sirve de inmediato']},
  'chia-mango':      {name:'Pudín de chía con mango',        cat:'desayuno', cal:240, prot:14, fat:8,  carb:30, time:'5 min',  emoji:'🥭',
    ing:['3 cdas semillas chía','200ml leche coco','1/2 mango','Miel','Vainilla'],
    steps:['Mezcla chía con leche de coco y vainilla','Deja reposar 8h en nevera','En la mañana revuelve bien','Sirve con mango en cubos encima']},
  'burrito-huevo':   {name:'Burrito de huevo y frijoles',    cat:'desayuno', cal:410, prot:29, fat:14, carb:44, time:'12 min', emoji:'🌮',
    ing:['1 tortilla grande','2 huevos','1/4 taza frijoles','Salsa','Queso']},
  'pechuga-arroz':   {name:'Pechuga con arroz y brócoli',    cat:'almuerzo', cal:420, prot:45, fat:8,  carb:40, time:'20 min', emoji:'🍗',
    ing:['150g pechuga','1 taza arroz cocido','1 taza brócoli','Aceite oliva','Ajo y sal'],
    steps:['Sazona la pechuga con ajo, sal y pimienta','Cocina en sartén 6 min por lado','Cocina el brócoli al vapor 5 min','Sirve con el arroz y el brócoli']},
  'arroz-pollo':     {name:'Arroz con pollo colombiano',     cat:'almuerzo', cal:450, prot:38, fat:10, carb:52, time:'30 min', emoji:'🍲',
    ing:['150g pollo','1.5 tazas arroz','1/2 pimentón','Cilantro','Comino'],
    steps:['Sofríe el pollo con pimentón y comino','Agrega el arroz y 3 tazas de agua','Cocina 20 min a fuego bajo','Sirve con cilantro fresco']},
  'lentejas':        {name:'Lentejas con vegetales',         cat:'almuerzo', cal:320, prot:18, fat:3,  carb:52, time:'25 min', emoji:'🫘',
    ing:['1 taza lentejas','1 zanahoria','1/2 cebolla','Tomate','Comino'],
    steps:['Remoja las lentejas 30 min si tienes tiempo','Sofríe cebolla y tomate','Agrega lentejas y 2 tazas de agua','Cocina 20 min','Sazona con comino y sal']},
  'atun-frijoles':   {name:'Atún con frijoles negros',       cat:'almuerzo', cal:310, prot:35, fat:4,  carb:28, time:'5 min',  emoji:'🐟',
    ing:['1 lata atún','1/2 taza frijoles cocidos','Limón','Cilantro','Sal'],
    steps:['Escurre el atún','Mezcla con los frijoles','Agrega limón y cilantro','Sirve frío o caliente']},
  'salmon-espinaca': {name:'Salmón con espinaca salteada',   cat:'almuerzo', cal:390, prot:42, fat:20, carb:8,  time:'15 min', emoji:'🐟',
    ing:['150g salmón','2 tazas espinaca','Ajo','Aceite oliva','Limón'],
    steps:['Sazona el salmón con sal y limón','Cocina en sartén caliente 4 min por lado','Saltea espinaca con ajo 2 min','Sirve juntos']},
  'quinoa-pollo':    {name:'Quinoa con pollo y vegetales',   cat:'almuerzo', cal:430, prot:40, fat:10, carb:44, time:'20 min', emoji:'🍚',
    ing:['150g pechuga','1 taza quinoa cocida','Pimentón','Espinaca','Aceite oliva'],
    steps:['Cocina la quinoa según instrucciones','Cocina el pollo en sartén','Saltea los vegetales','Mezcla todo y sirve']},
  'sancocho-light':  {name:'Sancocho de pollo light',        cat:'almuerzo', cal:370, prot:36, fat:6,  carb:40, time:'35 min', emoji:'🍵',
    ing:['200g pollo','1 papa','1 trozo yuca','Cilantro','Ajo'],
    steps:['Cocina el pollo en agua con ajo','Agrega papa y yuca en trozos','Cocina 25 min a fuego medio','Sirve con cilantro fresco']},
  'wrap-turkey':     {name:'Wrap de pavo y mostaza dijon',   cat:'almuerzo', cal:340, prot:32, fat:8,  carb:34, time:'8 min',  emoji:'🌯',
    ing:['1 tortilla','120g pavo','Lechuga','Mostaza dijon','Tomate']},
  'bowl-buda':       {name:'Buddha bowl fitness',            cat:'almuerzo', cal:380, prot:28, fat:14, carb:42, time:'15 min', emoji:'🥙',
    ing:['1/2 taza quinoa','1/2 taza garbanzos','Aguacate','Zanahoria','Vinagreta']},
  'pasta-integral':  {name:'Pasta integral con pollo',       cat:'almuerzo', cal:440, prot:35, fat:8,  carb:58, time:'20 min', emoji:'🍝',
    ing:['100g pasta integral','150g pechuga','Salsa de tomate natural','Albahaca','Ajo']},
  'sopa-proteina':   {name:'Sopa de proteína y vegetales',   cat:'almuerzo', cal:290, prot:30, fat:4,  carb:28, time:'20 min', emoji:'🍜',
    ing:['150g pollo','Zanahoria','Apio','Papa','Caldo bajo en sodio']},
  'bistec-yuca':     {name:'Bistec con yuca y ensalada',     cat:'almuerzo', cal:480, prot:45, fat:14, carb:40, time:'25 min', emoji:'🥩',
    ing:['150g bistec','150g yuca cocida','Ensalada mixta','Limón','Sal']},
  'ensalada-pollo':  {name:'Ensalada de pollo mediterránea', cat:'almuerzo', cal:350, prot:38, fat:12, carb:18, time:'10 min', emoji:'🥗',
    ing:['150g pechuga cocida','Lechuga','Aceitunas','Tomate cherry','Aceite oliva']},
  'tacos-pollo':     {name:'Tacos de pollo con maíz',        cat:'almuerzo', cal:400, prot:33, fat:10, carb:44, time:'15 min', emoji:'🌮',
    ing:['2 tortillas maíz','120g pollo','Maíz','Pico de gallo','Cilantro']},
  'cazuela-res':     {name:'Cazuela de res con papa',        cat:'almuerzo', cal:460, prot:40, fat:16, carb:38, time:'40 min', emoji:'🫕',
    ing:['150g carne res','1 papa','Zanahoria','Cebolla','Tomate']},
  'sopa-lentejas':   {name:'Sopa de lentejas',               cat:'cena',     cal:280, prot:18, fat:3,  carb:44, time:'20 min', emoji:'🍵',
    ing:['1/2 taza lentejas','Zanahoria','Tomate','Cebolla','Comino']},
  'pechuga-grillada':{name:'Pechuga grillada y vegetales',   cat:'cena',     cal:340, prot:42, fat:8,  carb:18, time:'15 min', emoji:'🍗',
    ing:['150g pechuga','Brócoli','Zanahoria al vapor','Aceite oliva','Limón']},
  'huevos-noche':    {name:'Revuelto nocturno de claras',    cat:'cena',     cal:200, prot:30, fat:6,  carb:6,  time:'8 min',  emoji:'🍳',
    ing:['5 claras de huevo','Espinaca','Ajo','Aceite oliva','Sal']},
  'ensalada-atun':   {name:'Ensalada de atún y aguacate',    cat:'cena',     cal:290, prot:32, fat:14, carb:12, time:'5 min',  emoji:'🥗',
    ing:['1 lata atún','1/2 aguacate','Lechuga','Tomate','Limón']},
  'brocoli-pollo':   {name:'Brócoli con pollo al vapor',     cat:'cena',     cal:310, prot:38, fat:6,  carb:20, time:'15 min', emoji:'🥦',
    ing:['150g pechuga','2 tazas brócoli','Ajo','Aceite oliva','Sal']},
  'tortilla-claras': {name:'Tortilla de claras con espinaca',cat:'cena',     cal:220, prot:26, fat:6,  carb:8,  time:'8 min',  emoji:'🍳',
    ing:['5 claras','1 taza espinaca','1/4 cebolla','Aceite oliva','Sal']},
  'batido':          {name:'Batido de proteína y banana',    cat:'snack',    cal:290, prot:30, fat:4,  carb:38, time:'3 min',  emoji:'🍌',
    ing:['1 scoop proteína','1 banana','250ml leche','Hielo']},
  'manzana-mantequilla':{name:'Manzana con mantequilla maní',cat:'snack',   cal:200, prot:8,  fat:12, carb:22, time:'2 min',  emoji:'🍎',
    ing:['1 manzana mediana','2 cdas mantequilla maní natural']},
  'huevo-cocido':    {name:'Huevos cocidos con sal rosa',    cat:'snack',    cal:140, prot:12, fat:8,  carb:2,  time:'10 min', emoji:'🥚',
    ing:['2 huevos','Sal rosa del Himalaya','Agua']},
  'nueces-frutas':   {name:'Mix de nueces y fruta seca',     cat:'snack',    cal:180, prot:6,  fat:14, carb:14, time:'1 min',  emoji:'🥜',
    ing:['30g nueces mixtas','20g fruta seca (arándanos o pasas)']}
};

function openRecipeDetail(id) {
  var r = RECIPES[id];
  if (!r) return;

  // Remove any existing overlay
  document.getElementById('recipe-detail-ov')?.remove();

  var ov = document.createElement('div');
  ov.id = 'recipe-detail-ov';
  ov.style.cssText = `
    position:fixed;inset:0;z-index:999;
    background:var(--bg);overflow-y:auto;overflow-x:hidden;
    -webkit-overflow-scrolling:touch;
    padding:0;font-family:var(--font);
  `;

  // Prevent body scroll while overlay is open
  document.body.style.overflow = 'hidden';

  function closeDetail() {
    document.getElementById('recipe-detail-ov')?.remove();
    document.body.style.overflow = '';
  }

  ov.innerHTML = `
    <!-- Sticky back bar -->
    <div style="position:sticky;top:0;z-index:10;
      background:rgba(8,5,17,.95);backdrop-filter:blur(12px);
      padding:calc(env(safe-area-inset-top,12px) + 8px) 16px 10px;
      display:flex;align-items:center;gap:12px;
      border-bottom:1px solid rgba(255,255,255,.06)">
      <button onclick="document.getElementById('recipe-detail-ov')?.remove();document.body.style.overflow=''" style="
        display:flex;align-items:center;gap:6px;padding:8px 12px;
        border-radius:12px;border:1px solid rgba(255,255,255,.1);
        background:rgba(255,255,255,.05);color:rgba(240,238,248,.7);
        font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer">
        ← Volver</button>
      <div style="font-size:14px;font-weight:700;color:#f1f0f4;
        flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.name}</div>
    </div>

    <!-- Content -->
    <div style="max-width:430px;margin:0 auto;padding:20px 16px calc(40px + env(safe-area-inset-bottom))">
      <div style="font-size:52px;margin-bottom:12px">${r.emoji}</div>
      <div style="font-size:22px;font-weight:800;color:#f1f0f4;letter-spacing:-.02em;
        margin-bottom:16px">${r.name}</div>
      <div style="display:flex;gap:8px;margin-bottom:24px">
        <div style="flex:1;background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.2);
          border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:20px;font-weight:800;color:#c4b5fd">${r.prot}g</div>
          <div style="font-size:9px;color:rgba(196,181,253,.4);font-weight:700;
            text-transform:uppercase;letter-spacing:.05em;margin-top:2px">Proteína</div>
        </div>
        <div style="flex:1;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15);
          border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:20px;font-weight:800;color:#fcd34d">${r.cal}</div>
          <div style="font-size:9px;color:rgba(252,211,77,.4);font-weight:700;
            text-transform:uppercase;letter-spacing:.05em;margin-top:2px">Calorías</div>
        </div>
        <div style="flex:1;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.15);
          border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:20px;font-weight:800;color:#6ee7b7">${r.time}</div>
          <div style="font-size:9px;color:rgba(110,231,183,.4);font-weight:700;
            text-transform:uppercase;letter-spacing:.05em;margin-top:2px">Minutos</div>
        </div>
      </div>

      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
        color:rgba(240,238,248,.35);margin-bottom:10px">Ingredientes</div>
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);
        border-radius:14px;padding:14px;margin-bottom:20px">
        ${(r.ing||[]).map(i=>`
          <div style="display:flex;align-items:center;gap:10px;padding:5px 0;
            font-size:13px;color:rgba(240,238,248,.8)">
            <div style="width:6px;height:6px;border-radius:50%;
              background:rgba(124,58,237,.6);flex-shrink:0"></div>${i}
          </div>`).join('')}
      </div>

      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
        color:rgba(240,238,248,.35);margin-bottom:10px">Preparación</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
        ${(r.steps||[]).map((s,i)=>`
          <div style="display:flex;gap:12px;background:rgba(255,255,255,.03);
            border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px">
            <div style="width:24px;height:24px;border-radius:8px;flex-shrink:0;
              background:rgba(124,58,237,.2);display:flex;align-items:center;
              justify-content:center;font-size:11px;font-weight:700;color:#c4b5fd">${i+1}</div>
            <div style="font-size:13px;color:rgba(240,238,248,.8);line-height:1.6;
              padding-top:2px">${s}</div>
          </div>`).join('')}
      </div>

      <div style="background:rgba(124,58,237,.06);border:1px solid rgba(196,181,253,.12);
        border-radius:14px;padding:14px;display:flex;gap:10px;margin-bottom:20px">
        <span style="font-size:20px">💡</span>
        <span style="font-size:13px;color:rgba(196,181,253,.7);line-height:1.6">
          <b style="color:#c4b5fd">Tip:</b> ${r.tip}</span>
      </div>

      <!-- Add to meal -->
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
        color:rgba(240,238,248,.35);margin-bottom:10px">Agregar a mi día</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${['Desayuno','Almuerzo','Cena','Snack'].map(m=>`
          <button onclick="saveFood('${r.name}',${r.cal},${r.prot},0,'${m.toLowerCase()}');
            document.getElementById('recipe-detail-ov')?.remove();
            document.body.style.overflow='';
            showGuardardToast('${r.name}')" style="
            padding:11px;border-radius:12px;border:1px solid rgba(255,255,255,.1);
            background:rgba(255,255,255,.04);color:rgba(240,238,248,.7);
            font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer">
            ${m==='Desayuno'?'🌅':m==='Almuerzo'?'🌞':m==='Cena'?'🌙':'🍎'} ${m}
          </button>`).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(ov);
  ov.scrollTop = 0;
}
function toggleGuide(card) {
  var body = card.querySelector('.gc-body');
  var arrow = card.querySelector('.gc-title span');
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (arrow) arrow.textContent = isOpen ? '›' : '‹';
}
function toggleShop(el, key) {
  el.classList.toggle('ck');
  localStorage.setItem(key, el.classList.contains('ck') ? '1' : '0');
}
function resetShop() {
  document.querySelectorAll('.shop-item').forEach(el => {
    el.classList.remove('ck');
  });
  Object.keys(localStorage).filter(k => k.startsWith('sh-')).forEach(k => localStorage.removeItem(k));
}
// Restore checkmarks from localStorage on load
document.querySelectorAll('.shop-item').forEach(el => {
  var key = el.getAttribute('onclick')?.match(/'(sh-[^']+)'/)?.[1];
  if (key && localStorage.getItem(key) === '1') el.classList.add('ck');
});
var QUICK_FOODS = {
  'Desayuno': [
    {name:'Bowl de huevos y aguacate',     cal:380, prot:28, id:'huevos-aguacate',   emoji:'🍳'},
    {name:'Avena con banano y canela',      cal:310, prot:12, id:'avena-banano',      emoji:'🥣'},
    {name:'Batido banano + avena',          cal:350, prot:30, id:'batido-banano',     emoji:'🥤'},
    {name:'Omelette de proteína',           cal:280, prot:25, id:'omelette',          emoji:'🥚'},
    {name:'Tostadas aguacate + huevo',      cal:310, prot:18, id:'tostadas-aguacate', emoji:'🥑'},
  ],
  'Almuerzo': [
    {name:'Pechuga con arroz y brócoli',   cal:420, prot:45, id:'pechuga-arroz',   emoji:'🍗'},
    {name:'Atún con fríjoles negros',       cal:310, prot:35, id:'atun-frijoles',   emoji:'🥗'},
    {name:'Carne molida con papa',          cal:480, prot:32, id:'carne-papa',      emoji:'🥩'},
    {name:'Arroz con pollo',                cal:450, prot:38, id:'arroz-pollo',     emoji:'🍲'},
    {name:'Tortilla de atún',               cal:350, prot:30, id:'tortilla-atun',   emoji:'🌮'},
  ],
  'Cena': [
    {name:'Sopa de lentejas',               cal:290, prot:22, id:'lentejas',        emoji:'🍲'},
    {name:'Pechuga + ensalada',             cal:320, prot:38, id:'pechuga-arroz',   emoji:'🥗'},
    {name:'Caldo de papa con pollo',        cal:280, prot:25, id:'caldo-papa',      emoji:'🍵'},
    {name:'Fríjoles con arroz y plátano',   cal:430, prot:18, id:'frijoles-arroz',  emoji:'🫘'},
    {name:'Arroz con huevos revueltos',     cal:370, prot:22, id:'arroz-huevos',    emoji:'🍚'},
  ],
  'Snack': [
    {name:'Yogur griego con frutas',        cal:180, prot:15, id:'yogur-fruta',     emoji:'🫙'},
    {name:'Huevos cocidos',                 cal:140, prot:12, id:'huevos-cocidos',  emoji:'🥚'},
    {name:'Banano + mantequilla de maní',   cal:220, prot:8,  id:'banano-mani',     emoji:'🍌'},
    {name:'Nueces mixtas',                  cal:190, prot:6,  id:null,             emoji:'🥜'},
  ],
};

function openQuickLog(meal) {
  var h = new Date().getHours();
  if (!meal) meal = h < 11 ? 'Desayuno' : h < 15 ? 'Almuerzo' : h < 19 ? 'Cena' : 'Snack';
  var icon = {Desayuno:'🌅',Almuerzo:'🌞',Cena:'🌙',Snack:'🍎'}[meal] || '🍽️';
  var options = QUICK_FOODS[meal] || [];

  var ov = document.createElement('div');
  ov.style.cssText = `position:fixed;inset:0;z-index:999;
    background:rgba(8,5,17,.88);backdrop-filter:blur(16px);
    display:flex;align-items:flex-end;font-family:var(--font);`;
  ov.innerHTML = `
    <div style="width:100%;max-width:430px;margin:0 auto;
      padding:20px 16px calc(20px + env(safe-area-inset-bottom));
      background:rgba(14,7,26,.98);border-radius:24px 24px 0 0;
      border-top:1px solid rgba(255,255,255,.08)">
      <div style="display:flex;justify-content:space-between;
        align-items:center;margin-bottom:16px">
        <div style="font-size:17px;font-weight:700;color:#f1f0f4">
          ${icon} ${meal}</div>
        <button onclick="this.closest('[style*=inset]').remove()" style="
          padding:6px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.04);color:rgba(240,238,248,.5);
          font-family:var(--font);font-size:12px;cursor:pointer">Cerrar</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${options.map(r => `
          <button onclick="saveFood('${r.name}',${r.cal},${r.prot},0,'${meal.toLowerCase()}');
            this.closest('[style*=inset]').remove()" style="
            display:flex;align-items:center;gap:12px;padding:12px 14px;
            border-radius:14px;border:1px solid rgba(255,255,255,.07);
            background:rgba(255,255,255,.03);width:100%;text-align:left;
            cursor:pointer;-webkit-tap-highlight-color:transparent">
            <span style="font-size:26px">${r.emoji}</span>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;color:#f1f0f4">${r.name}</div>
              <div style="font-size:11px;color:rgba(240,238,248,.4);margin-top:2px">
                ${r.prot}g prot · ${r.cal} cal</div>
            </div>
          </button>`).join('')}
      </div>
    </div>
  `;
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
}

function logThisRecipe(id) {
  var entry = Object.values(QUICK_FOODS).flat().find(f => f.id === id);
  if (!entry) return;
  var h = new Date().getHours();
  var meal = h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 19 ? 'cena' : 'snack';
  saveFood(entry.name, entry.cal, entry.prot, 0, meal);
}

function localDateKey() {
  var d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

var GOALS = { cal: 2000, prot: 120, carbs: 200, fat: 55 };
function macroMessage(protPct) {
  if (protPct >= 90) return '✓ Proteína cubierta hoy. Buen trabajo.';
  if (protPct >= 60) return 'Vas bien en proteína. Sigue así.';
  if (protPct >= 30) return 'Hoy podemos sumar algo más en proteína.';
  return 'Te faltan opciones altas en proteína hoy.';
}

var MEAL_CONFIG = [
  { key:'desayuno', icon:'🌅', name:'Desayuno',  start:6,  end:11 },
  { key:'almuerzo', icon:'🌞', name:'Almuerzo',  start:11, end:15 },
  { key:'cena',     icon:'🌙', name:'Cena',      start:15, end:21 },
  { key:'snack',    icon:'🍎', name:'Snack',     start:0,  end:24 },
];

// Microcopy by state
var EMPTY_COPIES = [
  'Hoy todavía no hay comidas registradas. Empecemos.',
  'Tu progreso también necesita energía. Registra tu primera comida.',
  'La constancia empieza por una primera decisión simple.',
  'Arju puede ayudarte mejor si registras lo que comes hoy.',
];

function renderMealRhythm(entries) {
  var el = document.getElementById('mealRhythm');
  if (!el) return;
  var h = new Date().getHours();
  var loggedMeals = new Set(entries.map(e => e.meal));

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:7px">
      ${MEAL_CONFIG.map(m => {
        var done = loggedMeals.has(m.key);
        var current = !done && h >= m.start && h < m.end;
        var foods = entries.filter(e=>e.meal===m.key);
        var totProt = foods.reduce((s,f)=>s+(f.prot||0),0);
        var totCal  = foods.reduce((s,f)=>s+(f.cal||0),0);
        var cls = done?'done':current?'current':'empty';
        var sub = done
          ? `${Math.round(totProt)}g prot · ${Math.round(totCal)} kcal`
          : current
          ? 'Momento ideal para comer'
          : m.start > h ? 'Más tarde' : 'Sin registrar';
        return `
          <div class="meal-slot ${cls}" onclick="openQuickLog('${m.name}')">
            <div class="meal-slot-icon">${m.icon}</div>
            <div class="meal-slot-body">
              <div class="meal-slot-name">${m.name}</div>
              <div class="meal-slot-sub">${sub}</div>
            </div>
            <div class="meal-slot-check">${done?'✓':current?'·':''}</div>
          </div>`;
      }).join('')}
    </div>
  `;
}
function updateCardState(calPct, proteinPct, mealsCount) {
  var card = document.getElementById('macroCard');
  var label = document.getElementById('dayStateLabel');
  var calPctEl = document.getElementById('calPct');
  var tip = document.getElementById('nutriTip');

  let state, stateText, tipText;

  if (mealsCount === 0) {
    state = 'state-empty';
    stateText = 'Tu nutrición aún no empieza';
    tipText = EMPTY_COPIES[new Date().getDay() % EMPTY_COPIES.length];
    // Show empty state illustration
    var emptyIll = document.getElementById('emptyStateIll');
    if (emptyIll) emptyIll.style.display = 'block';
  } else if (calPct < 30) {
    state = 'state-partial';
    stateText = 'Ya empezaste. Sigamos simple.';
    tipText = 'Buen inicio. Mantener proteína alta hoy puede ayudarte a controlar el hambre.';
  } else if (calPct < 70) {
    state = 'state-partial';
    stateText = 'HOY · EN PROGRESO';
    tipText = 'Tu constancia esta semana está mejorando. Sigue así.';
  } else if (calPct < 95) {
    state = 'state-good';
    stateText = 'HOY · CASI COMPLETO';
    tipText = proteinPct >= 80
      ? 'Proteína cubierta. Excelente decisión nutricional hoy.'
      : 'Ya casi. Suma algo de proteína para cerrar bien el día.';
  } else {
    state = 'state-complete';
    stateText = '✓ HOY COMPLETO';
    tipText = 'Tu cuerpo responde mejor cuando comes con más regularidad. Hoy lo lograste.';
  }

  if (card) {
    card.className = 'macros-card ' + state;
  }
  if (label) label.textContent = stateText;
  if (tip && mealsCount >= 0) {
    tip.style.opacity = '0';
    setTimeout(() => { tip.textContent = tipText; tip.style.opacity = '1'; }, 150);
  }

  // Streak pill
  var streak = parseInt(localStorage.getItem('af-streak')||'0');
  var streakEl = document.getElementById('dayStreakPill');
  if (streakEl && streak >= 3) {
    streakEl.style.display = 'block';
    streakEl.textContent = streak + ' días seguidos';
  }
}

function updateMacroUI(entries) {
  var totCal  = entries.reduce((s,e) => {
    // Use stored cal, or estimate from macros if cal is 0/missing
    var cal = e.cal || Math.round((e.prot||0)*4 + (e.carb||0)*4 + (e.fat||0)*9);
    return s + cal;
  }, 0);
  var totProt = entries.reduce((s,e) => s + (e.prot||0), 0);
  var totCarb = entries.reduce((s,e) => s + (e.carb||0), 0);
  var totFat  = entries.reduce((s,e) => s + (e.fat||0), 0);
  var calPct  = GOALS.cal > 0 ? Math.min(100, Math.round((totCal / GOALS.cal) * 100)) : 0;
  var calDescEl = document.getElementById('calDesc');
  if (calDescEl) calDescEl.textContent = GOALS.cal > 0 ? `de ${GOALS.cal} kcal meta` : 'Completa tu perfil';

  // Ring
  // Update ring
  var crNumEl = document.getElementById('crNum');
  if (crNumEl) crNumEl.textContent = Math.round(totCal) || '0';
  document.getElementById('calPct').textContent  = calPct + '%';
  document.getElementById('calDesc').textContent = `de ${GOALS.cal} kcal meta`;
  setTimeout(() => {
    document.getElementById('crFill').style.strokeDashoffset =
      201.1 - (calPct / 100) * 201.1;
    document.getElementById('bProt').style.width =
      Math.min(100, Math.round((totProt / GOALS.prot) * 100)) + '%';
    document.getElementById('bCarb').style.width =
      Math.min(100, Math.round((totCarb / GOALS.carbs) * 100)) + '%';
    document.getElementById('bFat').style.width =
      Math.min(100, Math.round((totFat / GOALS.fat) * 100)) + '%';
  }, 100);

  // Macro values
  document.getElementById('vProt').textContent = Math.round(totProt) + 'g';
  document.getElementById('vCarb').textContent = Math.round(totCarb) + 'g';
  document.getElementById('vFat').textContent  = Math.round(totFat)  + 'g';

  // Coach tip based on progress
  var tip = document.getElementById('nutriTip');
  if (tip) {
    var h = new Date().getHours();
    var mealLabel = h<11?'desayuno':h<15?'almuerzo':h<19?'cena':'snack';
    
    let msg, showBtns;
    if (entries.length === 0) {
      msg = 'Tu nutrición aún no empieza. Empecemos con algo simple.';
      showBtns = true;
    } else {
      msg = macroMessage(Math.round((totProt / GOALS.prot) * 100));
      showBtns = totProt < GOALS.prot * 0.5; // show action if protein < 50%
    }
    
    if (showBtns) {
      tip.innerHTML = `<div style="margin-bottom:10px">${msg}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button onclick="openPhotoLog()" style="
            padding:8px 14px;border-radius:11px;border:none;cursor:pointer;
            background:linear-gradient(135deg,#8b5cf6,#ec4899);
            color:#fff;font-family:var(--font);font-size:12px;font-weight:700">
            📷 Registrar con foto
          </button>
          <button onclick="sw('recetas')" style="
            padding:8px 14px;border-radius:11px;cursor:pointer;
            border:1px solid rgba(249,115,22,.3);background:rgba(249,115,22,.08);
            color:rgba(253,186,116,.8);font-family:var(--font);font-size:12px;font-weight:600">
            Ver receta
          </button>
        </div>`;
    } else {
      tip.textContent = msg;
    }
  }

  // Smart suggestions
  showSmartSuggestions(Math.max(0, GOALS.prot - totProt), Math.max(0, GOALS.cal - totCal));

  // Render log list
  renderLogList(entries);
  renderMealRhythm(entries);
  updateCardState(calPct, Math.min(100, Math.round((totProt/GOALS.prot)*100)), entries.length);
}
function showSmartSuggestions(remProt, remCal) {
  var el = document.getElementById('smartSuggestions');
  if (!el) return;
  if (remProt < 10 && remCal < 100) {
    el.innerHTML = `<div style="font-size:12px;color:rgba(196,181,253,.4);
      text-align:center;padding:8px">✓ Nutrición del día cubiertos para hoy.</div>`;
    return;
  }
  var h = new Date().getHours();
  var timeHint = h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : 'cena';
  var suggestions = Object.values(QUICK_FOODS).flat()
    .filter(r => r.prot <= remProt + 15)
    .sort((a,b) => b.prot - a.prot)
    .slice(0, 2);
  if (!suggestions.length) return;
  el.innerHTML = `
    <div style="font-size:11px;font-weight:700;letter-spacing:.06em;
      text-transform:uppercase;color:rgba(196,181,253,.35);margin-bottom:8px">
      <span style="display:inline-flex;width:20px;height:20px;border-radius:6px;background:linear-gradient(135deg,#7c3aed,#ec4899);vertical-align:middle;margin-right:5px"></span>Arju sugiere para completar tu día
    </div>
    ${suggestions.map(r => `
      <div style="display:flex;align-items:center;gap:11px;padding:11px 13px;
        background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
        border-radius:14px;margin-bottom:6px;cursor:pointer"
        onclick="saveFood('${r.name}',${r.cal},${r.prot},0,'${timeHint}')">
        <div style="font-size:24px">${r.emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:#f1f0f4">${r.name}</div>
          <div style="display:flex;gap:5px;margin-top:4px">
            <span style="font-size:10px;background:rgba(124,58,237,.15);
              color:#c4b5fd;padding:2px 8px;border-radius:12px;font-weight:600">
              ${r.prot}g prot</span>
            <span style="font-size:10px;background:rgba(245,158,11,.1);
              color:#fcd34d;padding:2px 8px;border-radius:12px;font-weight:600">
              ${r.cal} cal</span>
          </div>
        </div>
        <span style="font-size:11px;color:rgba(196,181,253,.5);font-weight:600">+ Agregar</span>
      </div>`).join('')}
  `;
}
function renderLogList(entries) {
  var el = document.getElementById('logList');
  if (!el) return;
  if (!entries.length) { el.style.display = 'none'; return; }
  el.style.display = 'flex';

  var MEAL_ICONS = { desayuno:'🌅', almuerzo:'🌞', cena:'🌙', snack:'🍎' };
  el.innerHTML = `
    <div style="font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
      color:var(--t3);margin-bottom:4px">Registrado hoy</div>
    ${entries.map((e, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:11px 13px;
        background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
        border-radius:14px">
        <span style="font-size:20px">${MEAL_ICONS[e.meal] || '🍽️'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:#f1f0f4;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.name}</div>
          <div style="font-size:11px;color:var(--t3);margin-top:2px">
            ${e.prot}g prot · ${e.cal} cal ·
            <span style="text-transform:capitalize">${e.meal}</span> ·
            ${new Date(e.ts).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'})}
          </div>
        </div>
        <button onclick="deleteFood(${i})" style="
          width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.04);color:rgba(240,238,248,.35);
          font-size:13px;cursor:pointer;flex-shrink:0;
          display:flex;align-items:center;justify-content:center">×</button>
      </div>`).join('')}
  `;
}
async function saveFood(name, cal, prot, fat = 0, meal, carb = 0) {
  // Track first meal and meal confirmed
  try {
    var _fk = 'af-food-' + localDateKey();
    var _fe = JSON.parse(localStorage.getItem(_fk) || '[]');
    if (_fe.length === 0) {
      if (window.AF) AF.track('first_meal_logged', { source: meal || 'entry', name: name });
      if (window.MV && window.MV.onFirstMealLogged) window.MV.onFirstMealLogged();
    }
    if (window.AF) AF.track('meal_confirmed', { name: name, meal: meal });
  } catch(e) {}
  // Ensure calories are never 0 — estimate from macros if missing
  var safeCal  = cal > 0 ? Math.round(cal) : Math.round((prot||0)*4 + (fat||0)*9 + 50); // 50 baseline for carbs
  var safeProt = Math.round(prot || 0);
  var safeFat  = Math.round(fat  || 0);
  var carb     = Math.max(0, Math.round((safeCal - safeProt*4 - safeFat*9) / 4));

  var key  = `af-food-${localDateKey()}`;
  var local = JSON.parse(localStorage.getItem(key) || '[]');
  local.push({ name, cal:safeCal, prot:safeProt, carb, fat:safeFat, meal, ts:Date.now() });
  localStorage.setItem(key, JSON.stringify(local));

  // Update UI immediately — all surfaces
  updateMacroUI(local);

  // Save to Supabase nutrition_logs (non-blocking)
  (async function() {
    try {
      var _sb2 = window.supabase ? window.supabase.createClient(
        'https://egswsqymkxmbtcpnozcq.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnc3dzcXlta3htYnRjcG5vemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzODIsImV4cCI6MjA5Mjg5NjM4Mn0.yIcQ7c4QF8wv0Dvtvaien5e-gi12CiruOBbYTeQRusM'
      ) : null;
      if (!_sb2) return;
      var { data:{ session } } = await _sb2.auth.getSession();
      if (!session?.user?.id) return;
      await _sb2.from('nutrition_logs').insert({
        user_id:        session.user.id,
        date:           localDateKey(),
        meal_type:      meal || 'otro',
        source_type:    'manual',
        food_items_json: JSON.stringify([{ name, cal:safeCal, prot:safeProt, carb, fat:safeFat }]),
        total_calories: safeCal,
        total_protein:  safeProt,
        total_carbs:    carb,
        total_fat:      safeFat,
        created_at:     new Date().toISOString(),
        updated_at:     new Date().toISOString(),
      });
    } catch(e) { console.warn('[Nutrition] Supabase log failed:', e.message); }
  })();
  (function() {
    var retoCurrent = localStorage.getItem('af-selected-reto') || '';
    var productType = localStorage.getItem('af-product-type') || '';
    var msgs = [];
    if (safeProt < 10) msgs.push('En la próxima comida podemos subir un poco la proteína sin complicarnos.');
    if (retoCurrent === 'gluteos' || productType === 'custom_muscle_gain')
      msgs.push('Buena base. La proteína y la recuperación también cuentan para glúteos y masa.');
    if (retoCurrent === 'pancita' || productType === 'custom_fat_loss')
      msgs.push('Buen paso. Buscamos comida clara y sostenible, no castigo.');
    if (!msgs.length) msgs.push(safeProt >= 20 ? 'Buena proteína en esta comida. Eso ayuda.' : 'Registrado. Una comida anotada ya nos da dirección.');
    var bubble = document.querySelector('[data-arju-bubble]') || document.getElementById('arjuNutBubble');
    if (bubble) { bubble.textContent = msgs[0]; bubble.style.display = 'block'; }
    if (window.AF) AF.track('nutrition_microvictory_shown', { product: productType, reto: retoCurrent, protein: safeProt });
  })();
  showGuardardToast(name, meal);
  if (window.CoachCtx) window.CoachCtx.afterFoodLogged(name, meal);
  if (window.MV) window.MV.onFoodLogged(meal);

  // Sync to Supabase in background (non-blocking)
  if (_sb && _uid) {
    _sb.from('day_logs').insert({
      user_id:    _uid,
      meal_type:  meal,
      food_name:  name,
      calories:   safeCal,
      protein_g:  safeProt,
      created_at: new Date().toISOString(),
    }).catch(e => console.warn('[Nutrition] Supabase:', e.message));
  }
}
function deleteFood(idx) {
  var today = localDateKey();
  var key   = `af-food-${today}`;
  var local = JSON.parse(localStorage.getItem(key) || '[]');
  local.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(local));
  updateMacroUI(local);
}
var USDA_KEY = 'DEMO_KEY'; // Replace with real key from api.nal.usda.gov

function openUSDASearch() {
  // Upgrade: show local LATAM search first, USDA as fallback
  var ov = document.createElement('div');
  ov.id = 'usda-ov';
  ov.style.cssText = `position:fixed;inset:0;z-index:400;
    background:rgba(8,5,17,.9);backdrop-filter:blur(20px);
    display:flex;align-items:flex-end;font-family:var(--font)`;

  var h = new Date().getHours();
  var meal = h<11?'desayuno':h<15?'almuerzo':h<19?'cena':'snack';

  ov.innerHTML = `
    <div style="width:100%;max-width:430px;margin:0 auto;
      padding:20px 16px calc(24px + env(safe-area-inset-bottom));
      background:rgba(12,6,24,.99);border-radius:28px 28px 0 0;
      border-top:1px solid rgba(255,255,255,.08)">

      <div style="font-size:16px;font-weight:800;color:#f1f0f4;margin-bottom:14px">
        🔍 Buscar alimento</div>

      <input id="foodSearchInput" type="text" placeholder="Ej: huevo, arroz, pechuga..."
        style="width:100%;padding:12px 14px;border-radius:14px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.06);
          color:#f1f0f4;font-family:var(--font);font-size:14px;
          outline:none;margin-bottom:10px;box-sizing:border-box"
        oninput="searchFoodInput(this.value,'${meal}')">

      <div id="foodSearchResults" style="display:flex;flex-direction:column;gap:6px;
        max-height:280px;overflow-y:auto;scrollbar-width:none"></div>

      <button onclick="document.getElementById('usda-ov').remove()" style="
        width:100%;margin-top:12px;padding:12px;border-radius:12px;
        border:1px solid rgba(255,255,255,.08);background:transparent;
        color:rgba(240,238,248,.3);font-family:var(--font);font-size:13px;cursor:pointer">
        Cancelarar</button>
    </div>`;

  ov.addEventListener('click', e => { if(e.target===ov) ov.remove(); });
  document.body.appendChild(ov);
  setTimeout(()=>document.getElementById('foodSearchInput')?.focus(), 200);
}

function searchFoodInput(query, meal) {
  var res = document.getElementById('foodSearchResults');
  if (!res) return;

  if (!query.trim()) { res.innerHTML = ''; return; }

  // Local DB first
  var local = window.FoodDB ? window.FoodDB.searchLocal(query, 8) : [];

  if (!local.length) {
    res.innerHTML = `<div style="font-size:13px;color:rgba(255,255,255,.3);text-align:center;padding:20px 0">
      No encontrado. Prueba con otro nombre.</div>`;
    return;
  }

  res.innerHTML = local.map(f => `
    <button onclick="addFoodFromDB('${f.id}',1,'${meal}')" style="
      display:flex;align-items:center;justify-content:space-between;
      padding:11px 14px;border-radius:13px;
      border:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.03);
      width:100%;text-align:left;cursor:pointer;
      -webkit-tap-highlight-color:transparent">
      <div>
        <div style="font-size:14px;font-weight:600;color:#f1f0f4">${f.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">
          ${f.cal} kcal · ${f.prot}g prot · por ${f.srv}${f.unit}</div>
      </div>
      <span style="font-size:12px;color:rgba(196,181,253,.5);font-weight:600">+ Agregar</span>
    </button>`).join('');
}

function addFoodFromDB(id, qty, meal) {
  if (!window.FoodDB) return;
  var food = window.FoodDB.LOCAL_DB.find(f => f.id === id);
  if (!food) return;
  var macros = window.FoodDB.calcMacros(food, qty);
  document.getElementById('usda-ov')?.remove();
  saveFood(food.name, macros.cal, macros.prot, macros.fat, meal);
}

function openUSDAItem(nameEnc, cal100, prot100, carb100, fat100) {
  var name = decodeURIComponent(nameEnc);
  var ov = mkOverlay('usda-item-ov');
  ov.innerHTML = `
    ${stickyBack('usda-item-ov', name.slice(0,30) + '...')}
    <div style="padding:20px 16px;max-width:430px;margin:0 auto">
      <div style="font-size:16px;font-weight:700;color:#f1f0f4;margin-bottom:16px">${name}</div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:8px">Valores por 100g</div>
      <div style="display:flex;gap:8px;margin-bottom:20px">
        <div style="flex:1;background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.2);
          border-radius:12px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:800;color:#c4b5fd">${prot100}g</div>
          <div style="font-size:9px;color:rgba(196,181,253,.4);font-weight:700;
            text-transform:uppercase;margin-top:2px">Prot.</div>
        </div>
        <div style="flex:1;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15);
          border-radius:12px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:800;color:#fcd34d">${cal100}</div>
          <div style="font-size:9px;color:rgba(252,211,77,.4);font-weight:700;
            text-transform:uppercase;margin-top:2px">Cal.</div>
        </div>
        <div style="flex:1;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.15);
          border-radius:12px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:800;color:#6ee7b7">${carb100}g</div>
          <div style="font-size:9px;color:rgba(110,231,183,.4);font-weight:700;
            text-transform:uppercase;margin-top:2px">Carbs</div>
        </div>
      </div>

      <div style="font-size:13px;font-weight:600;color:#f1f0f4;margin-bottom:8px">
        ¿Cuántos gramos?</div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <input id="usda-grams" type="number" value="150" min="1" max="2000" step="10"
          inputmode="numeric" style="
            width:100px;background:rgba(255,255,255,.06);
            border:1.5px solid rgba(124,58,237,.4);border-radius:12px;
            padding:11px 14px;font-family:var(--font);font-size:18px;
            font-weight:700;color:#f1f0f4;outline:none;text-align:center;"
          oninput="updateUSDACalc(${cal100},${prot100},${carb100},${fat100})">
        <div style="flex:1" id="usda-calc">
          <div style="font-size:13px;color:var(--t2)" id="usda-calc-text">150g = ${Math.round(cal100*1.5)} cal · ${Math.round(prot100*1.5)}g prot</div>
        </div>
      </div>

      <div style="font-size:13px;font-weight:600;color:#f1f0f4;margin-bottom:8px">Agregar a:</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${['Desayuno','Almuerzo','Cena','Snack'].map(m=>`
          <button onclick="addUSDAFood('${nameEnc}',${cal100},${prot100},${carb100},${fat100},'${m.toLowerCase()}')"
            style="padding:11px;border-radius:12px;border:1px solid rgba(255,255,255,.1);
              background:rgba(255,255,255,.04);color:rgba(240,238,248,.7);
              font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer">
            ${m==='Desayuno'?'🌅':m==='Almuerzo'?'🌞':m==='Cena'?'🌙':'🍎'} ${m}
          </button>`).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(ov);
}

function updateUSDACalc(cal100, prot100, carb100, fat100) {
  var g = parseFloat(document.getElementById('usda-grams')?.value) || 100;
  var f = g / 100;
  var el = document.getElementById('usda-calc-text');
  if (el) el.textContent = `${g}g = ${Math.round(cal100*f)} cal · ${Math.round(prot100*f)}g prot`;
}

function addUSDAFood(nameEnc, cal100, prot100, carb100, fat100, meal) {
  var name = decodeURIComponent(nameEnc);
  var g = parseFloat(document.getElementById('usda-grams')?.value) || 100;
  var f = g / 100;
  saveFood(name + ` (${g}g)`, Math.round(cal100*f), Math.round(prot100*f),
           Math.round(fat100*f), meal);
  document.getElementById('usda-item-ov')?.remove();
  document.getElementById('usda-ov')?.remove();
  document.body.style.overflow = '';
}

function usda_localFallback(q) {
  var lower = q.toLowerCase();
  var matches = Object.values(QUICK_FOODS).flat()
    .filter(f => f.name.toLowerCase().includes(lower))
    .slice(0, 3);
  if (!matches.length) return '<div style="color:var(--t3);font-size:12px">Sin coincidencias locales</div>';
  return matches.map(r => `
    <div onclick="saveFood('${r.name}',${r.cal},${r.prot},0,'almuerzo')" style="
      padding:11px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);
      border-radius:12px;cursor:pointer;text-align:left;margin-bottom:6px">
      <div style="font-size:13px;font-weight:600;color:#f1f0f4">${r.emoji} ${r.name}</div>
      <div style="font-size:11px;color:var(--t3)">${r.prot}g prot · ${r.cal} cal</div>
    </div>`).join('');
}
function openPhotoLog() {
  var ov = mkOverlay('photo-ov');
  ov.innerHTML = `
    ${stickyBack('photo-ov', 'Foto de Comida')}
    <div style="padding:20px 16px;max-width:430px;margin:0 auto">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px;margin-bottom:12px">📷</div>
        <div style="font-size:16px;font-weight:700;color:#f1f0f4;margin-bottom:6px">
          Arju analiza tu comida</div>
        <div style="font-size:13px;color:var(--t3);line-height:1.6;max-width:280px;margin:0 auto">
          Toma una foto o sube una imagen. La IA estima los macros automáticamente.</div>
      </div>

      <!-- Upload area -->
      <label for="food-img-input" style="
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:12px;border:2px dashed rgba(124,58,237,.3);border-radius:20px;
        padding:32px 16px;cursor:pointer;background:rgba(124,58,237,.04);
        margin-bottom:16px;-webkit-tap-highlight-color:transparent">
        <div id="photo-preview" style="font-size:40px">🍽️</div>
        <div id="photo-label" style="font-size:13px;color:rgba(196,181,253,.6);
          font-weight:500">Toca para subir foto</div>
        <input type="file" id="food-img-input" accept="image/*" capture="environment"
          style="display:none" onchange="handleFoodPhoto(this)">
      </label>

      <div id="photo-result" style="display:none;flex-direction:column;gap:10px">
        <!-- filled by handleFoodPhoto -->
      </div>

      <div style="font-size:11px;color:rgba(240,238,248,.25);text-align:center;
        margin-top:12px;line-height:1.5">
        ⚠️ Estimación aproximada. Siempre puedes ajustar antes de guardar.
      </div>
    </div>
  `;
  document.body.appendChild(ov);
}

async function handleFoodPhoto(input) {
  var file = input.files?.[0];
  if (!file) return;

  // Preview
  var reader = new FileReader();
  reader.onload = async (e) => {
    var base64 = e.target.result.split(',')[1];
    var mimeType = file.type || 'image/jpeg';

    // Show preview
    var preview = document.getElementById('photo-preview');
    var label   = document.getElementById('photo-label');
    if(label) label.style.transition = 'opacity .15s';
    var result  = document.getElementById('photo-result');
    if (preview) {
      preview.innerHTML = `<img src="${e.target.result}" style="
        width:140px;height:140px;object-fit:cover;border-radius:16px">`;
    }
    if (label) {
      label.textContent = 'Arju está revisando tu comida…';
      var msgs = ['Detectando alimentos…','Estimando porciones…','Calculando proteína y energía…','Preparando recomendación…'];
      let mi = 0;
      var _mt = setInterval(() => {
        mi = (mi+1) % msgs.length;
        if(label) { label.style.opacity='0'; setTimeout(()=>{if(label){label.textContent=msgs[mi];label.style.opacity='1';}},150); }
        else clearInterval(_mt);
      }, 1800);
      window._photoMsgTimer = _mt;
    }
    if (result) { result.style.display = 'none'; }

    try {
      // 5s slow warning
      var _slowTimer = setTimeout(() => {
        if(label) label.textContent = 'Tardando un poco más de lo normal…';
      }, 5000);

      var res = await fetch('/api/food-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error('Error ' + res.status);
      clearTimeout(_slowTimer);
      var data = await res.json();

      if (data.error && data.fallback) {
        if (label) label.textContent = 'No pude analizar bien. Ingresa manualmente.';
        if (result) {
          result.style.display = 'flex';
          result.innerHTML = `<div style="text-align:center;padding:16px 0">
            <div style="font-size:13px;color:rgba(240,238,248,.5);margin-bottom:12px">
              No pude identificar los alimentos. Puedes registrarlo manualmente.</div>
            <button onclick="document.getElementById('photo-ov')?.remove();openManualLog()"
              style="padding:10px 20px;border-radius:12px;border:none;cursor:pointer;
              background:rgba(124,58,237,.15);color:#c4b5fd;
              font-family:var(--font);font-size:13px;font-weight:600">
              Ingresar manualmente</button></div>`;
        }
        return;
      }

      if (label) label.textContent = '✓ Análisis completado';
      if(window._photoMsgTimer) clearInterval(window._photoMsgTimer);
      renderPhotoResult(data);

    } catch(e) {
      if (label) label.textContent = 'Error — agrega manualmente';
      console.warn('[photo]', e.message);
      showManualAfterPhotoFail();
    }
  };
  reader.readAsDataURL(file);
}

function renderPhotoResult(data) {
  var el = document.getElementById('photo-result');
  if (!el) return;
  el.style.display = 'flex';

  var foods = data.foods || [];
  var total = data.total || { cal: 0, prot: 0, carb: 0, fat: 0 };
  var h = new Date().getHours();
  var defaultMeal = h<11?'desayuno':h<15?'almuerzo':h<19?'cena':'snack';

  // Totales calculados
  var totCal  = Math.round(total.cal  || foods.reduce((s,f)=>s+(f.cal||0),0));
  var totProt = Math.round(total.prot || foods.reduce((s,f)=>s+(f.prot||0),0));

  var humanMsg = totProt >= 25
    ? 'Buen aporte de proteína. Esta comida sostiene tu energía.'
    : totProt >= 12
    ? 'En la próxima agrega un poco más de proteína si puedes.'
    : 'Registrado. Intenta agregar proteína en la próxima comida.';

  el.innerHTML = `
    <!-- Mensaje Arju -->
    <div style="background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.2);
      border-radius:14px;padding:10px 14px;font-size:13px;color:rgba(196,181,253,.9);line-height:1.5">
      💜 ${humanMsg}
    </div>

    <!-- Totales prominentes -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
        border-radius:14px;padding:14px;text-align:center">
        <div style="font-size:26px;font-weight:800;color:#f1f0f4">${totCal}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">kcal totales</div>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
        border-radius:14px;padding:14px;text-align:center">
        <div style="font-size:26px;font-weight:800;color:#4ade80">${totProt}g</div>
        <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">proteína</div>
      </div>
    </div>

    <!-- Lista compacta de alimentos -->
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
      border-radius:14px;overflow:hidden">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
        color:rgba(255,255,255,.25);padding:10px 14px 6px">Detectado</div>
      ${foods.map((f,i)=>`
        <div style="display:flex;justify-content:space-between;align-items:center;
          padding:8px 14px;border-top:1px solid rgba(255,255,255,.04)">
          <span style="font-size:13px;color:rgba(255,255,255,.75)">${f.name}</span>
          <span style="font-size:12px;color:rgba(255,255,255,.35);white-space:nowrap;margin-left:8px">
            ${Math.round(f.cal||0)} cal · ${Math.round(f.prot||0)}g prot</span>
        </div>`).join('')}
    </div>

    <!-- Asignar a comida -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      ${['desayuno','almuerzo','cena','snack'].map(m=>`
        <button id="pfm-${m}" onclick="selectPhotoMeal('${m}')" style="
          padding:8px 4px;border-radius:10px;cursor:pointer;font-family:var(--font);
          font-size:11px;font-weight:600;text-align:center;
          border:1px solid ${m===defaultMeal?'rgba(139,92,246,.5)':'rgba(255,255,255,.08)'};
          background:${m===defaultMeal?'rgba(139,92,246,.2)':'transparent'};
          color:${m===defaultMeal?'#c4b5fd':'rgba(240,238,248,.4)'};
          -webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;
          align-items:center;gap:2px">
          <span>${m==='desayuno'?'🌅':m==='almuerzo'?'🌞':m==='cena'?'🌙':'🍎'}</span>
          <span>${m==='desayuno'?'Desay.':m==='almuerzo'?'Almuerzo':m==='cena'?'Cena':'Snack'}</span>
        </button>`).join('')}
    </div>

    <button onclick="confirmPhotoGuardar(${foods.length},${totCal},${totProt})" style="
      width:100%;padding:14px;border-radius:14px;border:none;cursor:pointer;
      background:linear-gradient(135deg,#8b5cf6,#ec4899);
      color:#fff;font-family:var(--font);font-size:15px;font-weight:800;
      -webkit-tap-highlight-color:transparent">
      ✓ Guardar comida
    </button>
  `;

  window._photoMeal = defaultMeal;
  window._photoFoodsCount = foods.length;
  window._photoTotals = { cal: totCal, prot: totProt };
}

function selectPhotoMeal(meal) {
  window._photoMeal = meal;
  ['desayuno','almuerzo','cena','snack'].forEach(m => {
    var btn = document.getElementById(`pfm-${m}`);
    if (!btn) return;
    var active = m === meal;
    btn.style.borderColor = active ? 'rgba(139,92,246,.5)' : 'rgba(255,255,255,.1)';
    btn.style.background  = active ? 'rgba(139,92,246,.2)' : 'rgba(255,255,255,.04)';
    btn.style.color       = active ? '#c4b5fd' : 'rgba(240,238,248,.5)';
  });
}

function confirmPhotoGuardar(foodCount, totCal, totProt) {
  var meal = window._photoMeal || 'almuerzo';
  // Usar totales pre-calculados o leerlos del estado guardado
  var cal  = totCal  || window._photoTotals?.cal  || 0;
  var prot = totProt || window._photoTotals?.prot || 0;
  var name = 'Foto IA · ' + meal.charAt(0).toUpperCase() + meal.slice(1);
  document.getElementById('photo-ov')?.remove();
  document.body.style.overflow = '';
  saveFood(name, cal, prot, 0, meal);
}

function showManualAfterPhotoFail() {
  var el = document.getElementById('photo-result');
  if (!el) return;
  el.style.display = 'flex';
  el.innerHTML = `
    <div style="text-align:center;padding:10px">
      <div style="font-size:13px;color:var(--t3);margin-bottom:12px">
        No pude analizar la foto. Agrega manualmente:</div>
      <button onclick="document.getElementById('photo-ov')?.remove();
        document.body.style.overflow='';openManualLog()" style="
        padding:12px 24px;border-radius:14px;border:none;
        background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;
        font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer">
        Agregar manualmente</button>
    </div>
  `;
}
function openManualLog() {
  var ov = mkOverlay('manual-ov');
  var h = new Date().getHours();
  var defaultMeal = h<11?'desayuno':h<15?'almuerzo':h<19?'cena':'snack';
  ov.innerHTML = `
    ${stickyBack('manual-ov', 'Registrar comida')}
    <div style="padding:20px 16px;max-width:430px;margin:0 auto;
      display:flex;flex-direction:column;gap:14px">

      <!-- Text parser — natural language input -->
      <div>
        <label style="font-size:12px;font-weight:600;color:rgba(196,181,253,.5);
          text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:6px">
          ¿Qué comiste?</label>
        <input id="m-text-parse" type="text" placeholder="Ej: 2 huevos y una arepa" style="
          width:100%;background:rgba(124,58,237,.08);
          border:1.5px solid rgba(124,58,237,.3);border-radius:14px;
          padding:12px 14px;font-family:var(--font);font-size:14px;
          color:#f1f0f4;outline:none;-webkit-appearance:none;box-sizing:border-box"
          oninput="liveParseFood(this.value)">
        <div id="parse-preview" style="margin-top:8px;display:flex;flex-direction:column;gap:6px"></div>
        <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:6px">
          Escribe en español natural — Arju lo interpreta</div>
      </div>

      <div style="display:flex;align-items:center;gap:10px;margin:2px 0">
        <div style="flex:1;height:1px;background:rgba(255,255,255,.07)"></div>
        <span style="font-size:10px;color:rgba(255,255,255,.2);font-weight:600;text-transform:uppercase">O manualmente</span>
        <div style="flex:1;height:1px;background:rgba(255,255,255,.07)"></div>
      </div>

      <div>
        <label style="font-size:12px;font-weight:600;color:var(--t3);
          text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:6px">
          Nombre</label>
        <input id="m-name" type="text" placeholder="Ej: Arroz con pollo" style="
          width:100%;background:rgba(255,255,255,.06);
          border:1.5px solid rgba(255,255,255,.1);border-radius:12px;
          padding:11px 14px;font-family:var(--font);font-size:14px;
          color:#f1f0f4;outline:none;-webkit-appearance:none;box-sizing:border-box">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--t3);
            text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:6px">
            Calorías</label>
          <input id="m-cal" type="number" placeholder="350" inputmode="numeric"
            min="0" step="10" style="width:100%;background:rgba(255,255,255,.06);
            border:1.5px solid rgba(255,255,255,.1);border-radius:12px;
            padding:11px 14px;font-family:var(--font);font-size:14px;
            color:#f1f0f4;outline:none;text-align:center;">
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--t3);
            text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:6px">
            Proteína (g)</label>
          <input id="m-prot" type="number" placeholder="25" inputmode="decimal"
            min="0" step="1" style="width:100%;background:rgba(255,255,255,.06);
            border:1.5px solid rgba(255,255,255,.1);border-radius:12px;
            padding:11px 14px;font-family:var(--font);font-size:14px;
            color:#f1f0f4;outline:none;text-align:center;">
        </div>
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--t3);
          text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:6px">
          Comida</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${['desayuno','almuerzo','cena','snack'].map(m=>`
            <button id="mb-${m}" onclick="selectMeal('${m}')" style="
              padding:8px 16px;border-radius:12px;font-family:var(--font);
              font-size:13px;font-weight:600;cursor:pointer;
              border:1px solid ${m===defaultMeal?'rgba(124,58,237,.5)':'rgba(255,255,255,.1)'};
              background:${m===defaultMeal?'rgba(124,58,237,.2)':'rgba(255,255,255,.04)'};
              color:${m===defaultMeal?'#c4b5fd':'rgba(240,238,248,.6)'};
              ">
              ${m.charAt(0).toUpperCase()+m.slice(1)}</button>`).join('')}
        </div>
      </div>
      <button onclick="submitManual()" style="
        width:100%;padding:14px;border-radius:14px;border:none;
        background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;
        font-family:var(--font);font-size:15px;font-weight:700;cursor:pointer;
        margin-top:4px">Agregar</button>
    </div>
  `;
  window._selectedMeal = defaultMeal;
  document.body.appendChild(ov);
  setTimeout(() => document.getElementById('m-name')?.focus(), 200);
}

function selectMeal(meal) {
  window._selectedMeal = meal;
  ['desayuno','almuerzo','cena','snack'].forEach(m => {
    var btn = document.getElementById(`mb-${m}`);
    if (!btn) return;
    btn.style.borderColor = m===meal ? 'rgba(124,58,237,.5)' : 'rgba(255,255,255,.1)';
    btn.style.background  = m===meal ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.04)';
    btn.style.color       = m===meal ? '#c4b5fd' : 'rgba(240,238,248,.6)';
  });
}

// Live food text parser
function liveParseFood(text) {
  var preview = document.getElementById('parse-preview');
  if (!preview || !window.FoodDB) return;
  if (!text.trim()) { preview.innerHTML = ''; return; }

  var results = window.FoodDB.parseText(text);
  if (!results.length) {
    preview.innerHTML = `<div style="font-size:12px;color:rgba(255,255,255,.3);padding:8px 0">
      No reconocí ese alimento. Puedes ingresar los datos manualmente.</div>`;
    return;
  }

  // Show parsed items and fill form
  var totals = results.reduce((acc, r) => {
    var m = window.FoodDB.calcMacros(r.food, r.qty);
    acc.cal += m.cal; acc.prot += m.prot; acc.carb += m.carb; acc.fat += m.fat;
    return acc;
  }, { cal:0, prot:0, carb:0, fat:0 });

  preview.innerHTML = results.map(r => {
    var m = window.FoodDB.calcMacros(r.food, r.qty);
    return `<div style="display:flex;justify-content:space-between;align-items:center;
      padding:8px 12px;border-radius:11px;background:rgba(34,197,94,.07);
      border:1px solid rgba(34,197,94,.15)">
      <div style="font-size:13px;font-weight:600;color:#f1f0f4">
        ${r.qty > 1 ? r.qty + ' × ' : ''}${r.food.name}</div>
      <div style="font-size:11px;color:rgba(52,211,153,.7)">
        ${m.prot}g prot · ${m.cal} kcal</div>
    </div>`;
  }).join('') + `
  <div style="display:flex;justify-content:space-between;padding:6px 12px;
    font-size:12px;font-weight:700">
    <span style="color:rgba(255,255,255,.5)">Total estimado</span>
    <span style="color:#c4b5fd">${totals.prot}g prot · ${totals.cal} kcal</span>
  </div>
  <button onclick="saveFromParser()" style="width:100%;padding:11px;border-radius:13px;
    border:none;cursor:pointer;background:linear-gradient(135deg,#22c55e,#16a34a);
    color:#fff;font-family:var(--font);font-size:13px;font-weight:700;margin-top:2px">
    ✓ Guardar ${results.length > 1 ? results.length + ' alimentos' : results[0].food.name}
  </button>`;

  // Fill numeric fields
  var calEl = document.getElementById('m-cal');
  var protEl = document.getElementById('m-prot');
  var nameEl = document.getElementById('m-name');
  if (calEl)  calEl.value  = totals.cal;
  if (protEl) protEl.value = totals.prot;
  if (nameEl) nameEl.value = results.map(r=>`${r.qty>1?r.qty+'× ':''}${r.food.name}`).join(', ');
  window._parsedFoodFat = totals.fat;
}

function saveFromParser() {
  var h = new Date().getHours();
  var meal = document.querySelector('[id^="mb-"][style*="rgba(124"]')?.id.replace('mb-','')
    || (h<11?'desayuno':h<15?'almuerzo':h<19?'cena':'snack');
  var name = document.getElementById('m-name')?.value;
  var cal  = parseFloat(document.getElementById('m-cal')?.value) || 0;
  var prot = parseFloat(document.getElementById('m-prot')?.value) || 0;
  var fat  = window._parsedFoodFat || 0;
  if (!name) return;
  document.getElementById('manual-ov')?.remove();
  saveFood(name, cal, prot, fat, meal);
}

function submitManual() {
  var name = document.getElementById('m-name')?.value?.trim();
  var cal  = parseFloat(document.getElementById('m-cal')?.value)  || 0;
  var prot = parseFloat(document.getElementById('m-prot')?.value) || 0;
  if (!name) { document.getElementById('m-name').focus(); return; }
  saveFood(name, cal, prot, 0, window._selectedMeal || 'snack');
  document.getElementById('manual-ov')?.remove();
  document.body.style.overflow = '';
}
function mkOverlay(id) {
  document.getElementById(id)?.remove();
  var ov = document.createElement('div');
  ov.id = id;
  ov.style.cssText = `position:fixed;inset:0;z-index:99999;background:var(--bg);
    overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:var(--font);`;
  document.body.style.overflow = 'hidden';
  ov.addEventListener('click', e => { if (e.target===ov) { ov.remove(); document.body.style.overflow=''; } });
  return ov;
}

function stickyBack(ovId, title) {
  return `<div style="position:sticky;top:0;z-index:10;
    background:rgba(8,5,17,.96);backdrop-filter:blur(12px);
    padding:calc(env(safe-area-inset-top,12px) + 8px) 16px 10px;
    display:flex;align-items:center;gap:12px;
    border-bottom:1px solid rgba(255,255,255,.06)">
    <button onclick="document.getElementById('${ovId}')?.remove();document.body.style.overflow=''" style="
      display:flex;align-items:center;gap:6px;padding:7px 12px;
      border-radius:12px;border:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.05);color:rgba(240,238,248,.7);
      font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer">
      ← Volver</button>
    <div style="font-size:14px;font-weight:700;color:#f1f0f4;
      flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title}</div>
  </div>`;
}
function loadToday() {
  var localKey = `af-food-${localDateKey()}`;
  var utcKey   = `af-food-${localDateKey()}`;
  // Try local date first, fall back to UTC key (handles old saved data)
  let local = JSON.parse(localStorage.getItem(localKey) || '[]');
  if (!local.length && localKey !== utcKey) {
    local = JSON.parse(localStorage.getItem(utcKey) || '[]');
  }
  updateMacroUI(local);
}

function showGuardardToast(name, meal) {
  var MEAL_LABELS = { desayuno:'desayuno', almuerzo:'almuerzo', cena:'cena', snack:'snack' };
  var t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:calc(84px + env(safe-area-inset-bottom));
    left:50%;transform:translateX(-50%);z-index:400;
    background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);
    border-radius:14px;padding:10px 18px;font-family:var(--font);
    font-size:13px;font-weight:600;color:#6ee7b7;
    box-shadow:0 4px 20px rgba(0,0,0,.3);white-space:nowrap;`;
  t.textContent = `✓ Agregado a tu ${MEAL_LABELS[meal] || meal}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
// 1. Hide spinner RIGHT NOW, no waiting
var _ldr = document.getElementById('ldr');
if (_ldr) _ldr.classList.add('off');

// Init recipe recommendation on load
initRecipeRec();

// Dynamic photo CTA on load
(function(){
  var h = new Date().getHours();
  var lbl = h<11?'Registrar desayuno con foto':
              h<15?'Registrar almuerzo con foto':
              h<19?'Registrar cena con foto':
              h<21?'Registrar snack con foto':'Registrar comida con foto';
  var el = document.getElementById('photoMainLabel');
  if (el) el.textContent = lbl;
})();

// Auto-open camera if navigated from home with ?camera=1
if (location.search.includes('camera=1')) {
  setTimeout(() => { if(typeof openPhotoLog==='function') openPhotoLog(); }, 500);
  history.replaceState({}, '', location.pathname);
}

// Auto-open recipe if navigated from home with ?recipe=id
var _recipeParam = new URLSearchParams(location.search).get('recipe');
if (_recipeParam) {
  setTimeout(() => { if(typeof openRecipeDetail==='function') openRecipeDetail(_recipeParam); }, 500);
  history.replaceState({}, '', location.pathname);
}

// 2. Load local data immediately
loadToday();

// 3. Supabase loads in background — never blocks UI
(async () => {
  try {
    var authRes = await Promise.race([
      _sb?.auth.getSession(),
      new Promise(r => setTimeout(() => r({ data:{ session:null } }), 3000))
    ]) || { data:{ session:null } };
    var session = authRes?.data?.session;
    if (!session?.user) return;
    _uid = session.user.id;

    var profileRes = await Promise.race([
      _sb.from('profiles').select('*').eq('id',_uid).single(),
      new Promise(r => setTimeout(() => r({ data: null }), 2000))
    ]);
    if (profileRes?.data) {
      var p = profileRes.data;
      if (p.calorias_objetivo) GOALS.cal   = p.calorias_objetivo;
      if (p.proteina_g)        GOALS.prot  = p.proteina_g;
      if (p.carbs_g)           GOALS.carbs = p.carbs_g;
      if (p.grasas_g)          GOALS.fat   = p.grasas_g;
    }
    var today = localDateKey();
    // Use created_at range (works even if 'date' column doesn't exist)
    // Colombia is UTC-5, so today starts at 05:00 UTC
    let logsRes = { data: [] };
    try {
      var startUTC = `${today}T00:00:00`;
      var endUTC   = `${today}T23:59:59`;
      var r = await Promise.race([
        _sb.from('day_logs').select('*')
          .eq('user_id', _uid)
          .gte('created_at', startUTC)
          .lte('created_at', endUTC),
        new Promise(res => setTimeout(() => res({ data:[] }), 3000))
      ]);
      if (r?.data) logsRes = r;
    } catch(e) {
      console.warn('[Nutrition] day_logs query skipped:', e.message);
    }
    if (logsRes?.data?.length) {
      var entries = logsRes.data.map(r => ({
        name: r.food_name, cal: r.calories||0, prot: r.protein_g||0,
        carb: 0, fat: 0, meal: r.meal_type, ts: new Date(r.created_at).getTime()
      }));
      updateMacroUI(entries);
    } else {
      loadToday();
    }
  } catch(e) {
    console.warn('[Nutrition] Background init error:', e.message);
    loadToday();
  }
})();
async function openRecipeFromJSON(recipeId) {
  try {
    if (!window._AF_RECIPES_CACHE) {
      var res = await fetch('/data/recipes/recipes.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      window._AF_RECIPES_CACHE = await res.json();
    }
    var recipes = Array.isArray(window._AF_RECIPES_CACHE)
      ? window._AF_RECIPES_CACHE
      : (window._AF_RECIPES_CACHE.recipes || []);
    var recipe = recipes.find(function(r) { return r.id === recipeId; });
    if (!recipe) { openRecipeDetail(recipeId); return; }

    // Map JSON recipe to existing modal format
    var m = recipe.approx_macros || {};
    var mapped = {
      emoji: '🍽️',
      name:  recipe.name || 'Receta ArjunaFit',
      prot:  m.protein_g  || 0,
      cal:   m.calories   || 0,
      time:  recipe.prep_time_minutes || 15,
      dif:   recipe.difficulty  || 'Fácil',
      ingredients: recipe.ingredients || [],
      steps:       recipe.steps       || [],
      tip:         recipe.arju_tip    || 'Una comida simple también cuenta.',
      meal:        recipe.category    || 'comida',
    };
    RECIPES[recipeId] = mapped;
    openRecipeDetail(recipeId);
  } catch(e) {
    console.warn('[Recipes] openRecipeFromJSON failed:', e.message);
    openRecipeDetail(recipeId);
  }
}
var _restaurants = null;
var _selRest = null;

async function loadRestaurants() {
  if (_restaurants) return _restaurants;
  try {
    var res = await fetch('/data/nutrition/restaurant-options.json', { cache:'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    _restaurants = await res.json();
    return _restaurants;
  } catch(e) {
    console.warn('[Restaurants] load failed:', e.message);
    return [];
  }
}

async function buildRestaurantGrid() {
  var grid = document.getElementById('restaurantGrid');
  if (!grid || grid.children.length > 0) return;
  var data = await loadRestaurants();
  if (!data.length) {
    grid.innerHTML = '<p style="color:rgba(255,255,255,.35);font-size:13px;text-align:center;grid-column:1/-1">No se cargaron opciones.</p>';
    return;
  }
  var html = data.map(function(r, idx) {
    return '<button onclick="openRestaurant(' + idx + ')" ' +
      'style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:16px;' +
      'padding:16px 12px;text-align:center;cursor:pointer;font-family:var(--font)">' +
      '<div style="font-size:28px;margin-bottom:6px">' + r.emoji + '</div>' +
      '<div style="font-size:12px;font-weight:700;color:#f5f3ff;line-height:1.3">' + r.name + '</div>' +
      '</button>';
  }).join('');
  grid.innerHTML = html;
}

async function openRestaurant(idx) {
  var data = await loadRestaurants();
  var restaurant = data[idx];
  if (!restaurant) return;
  _selRest = { restaurant: restaurant, idx: idx };

  var grid = document.getElementById('restaurantGrid');
  var optPanel = document.getElementById('restaurantOptions');
  var title = document.getElementById('restaurantOptionsTitle');
  var list = document.getElementById('restaurantOptionsList');
  var tip = document.getElementById('restaurantArjuTip');

  if (grid) grid.style.display = 'none';
  if (optPanel) optPanel.style.display = 'block';
  if (title) title.textContent = restaurant.emoji + ' ' + restaurant.name;

  var product = localStorage.getItem('af-product-type') || '';
  if (tip) tip.textContent = getRestTip(restaurant, product);

  if (list) {
    list.innerHTML = restaurant.common_options.map(function(opt, oi) {
      return '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);' +
        'border-radius:16px;padding:14px 16px;margin-bottom:10px">' +
        '<div style="font-size:14px;font-weight:700;color:#f5f3ff;margin-bottom:4px">' + opt.name + '</div>' +
        '<div style="display:flex;gap:12px;margin-bottom:8px">' +
          '<span style="font-size:11px;color:rgba(196,181,253,.7)">~' + opt.calories + ' cal</span>' +
          '<span style="font-size:11px;color:rgba(196,181,253,.7)">~' + opt.protein_g + 'g prot.</span>' +
        '</div>' +
        '<div style="font-size:12px;color:rgba(240,238,248,.45);margin-bottom:10px;font-style:italic">' + (opt.arju_tip || '') + '</div>' +
        '<button onclick="addRestMeal(' + idx + ',' + oi + ')" ' +
          'style="width:100%;padding:11px;background:linear-gradient(135deg,#8b5cf6,#a855f7,#ec4899);' +
          'border:none;border-radius:12px;color:#fff;font-size:13px;font-weight:700;cursor:pointer">' +
          'Agregar a mi día' +
        '</button>' +
      '</div>';
    }).join('');
  }
}

function closeRestaurantOptions() {
  var grid = document.getElementById('restaurantGrid');
  var optPanel = document.getElementById('restaurantOptions');
  if (grid) grid.style.display = 'grid';
  if (optPanel) optPanel.style.display = 'none';
  _selRest = null;
}

function getRestTip(r, product) {
  if (product === 'challenge_glutes')   return 'Reto glúteos: elige ' + r.name + ' con buena proteína y carbohidratos para energía.';
  if (product === 'challenge_belly')    return 'Reto pancita: proteína + vegetales, porción moderada de carbohidratos. Sin bebidas azucaradas.';
  if (product === 'custom_muscle_gain') return 'Masa muscular: elige la opción más completa. Necesitas comer suficiente.';
  if (product === 'custom_fat_loss')    return 'Reducción grasa: proteína magra + ensalada + carbohidrato moderado. Sin extras calóricos.';
  return 'Elige proteína + carbohidrato + vegetal. Macros son estimaciones. Lo importante es mantener el hábito.';
}

async function addRestMeal(restaurantIdx, optIdx) {
  var data = await loadRestaurants();
  var r = data[restaurantIdx];
  var opt = r && r.common_options[optIdx];
  if (!r || !opt) return;

  var meals = ['desayuno','almuerzo','cena','snack'];
  var mealLabels = ['Desayuno','Almuerzo','Cena','Snack'];
  var picked = prompt('¿Agregar como? Escribe: desayuno, almuerzo, cena o snack', 'almuerzo');
  var mealKey = (picked || '').toLowerCase().trim();
  if (!meals.includes(mealKey)) mealKey = 'almuerzo';
  var mealLabel = mealLabels[meals.indexOf(mealKey)];

  var tip = document.getElementById('restaurantArjuTip');

  var entry = {
    meal_type: mealKey,
    food_name: opt.name + ' (' + r.name + ')',
    portion_description: 'Comer fuera — estimación aproximada',
    calories:  opt.calories  || 0,
    protein_g: opt.protein_g || 0,
    carbs_g:   opt.carbs_g   || 0,
    fat_g:     opt.fat_g     || 0,
    source:    'restaurant',
    log_date:  localDateKey(),
  };

  // Try save via Supabase
  var sb = window._sb;
  var uid = localStorage.getItem('af-uid');
  if (sb && uid) {
    sb.from('nutrition_logs').insert(Object.assign({ user_id: uid }, entry))
      .then(function() {
        if (tip) { tip.style.color='#86efac'; tip.textContent = mealLabel + ' registrado ✓ — comer fuera también suma al proceso.'; }
      }).catch(function() {
        if (tip) { tip.style.color='#86efac'; tip.textContent = mealLabel + ' registrado ✓ (modo offline).'; }
      });
  } else {
    if (tip) { tip.style.color='#86efac'; tip.textContent = mealLabel + ' registrado ✓ — comer fuera también suma al proceso.'; }
  }

  if (window.AF) window.AF.track('restaurant_meal_added', { restaurant: r.id, meal: mealKey });
  setTimeout(function() {
    if (tip) { tip.style.color=''; tip.textContent='Selecciona otra opción o tipo de restaurante.'; }
  }, 4000);
}

// Hook sw() to load grid when fuera tab is opened
(function() {
  var _origSw2 = window.sw;
  if (_origSw2) {
    window.sw = function(id) {
      _origSw2(id);
      if (id === 'fuera') buildRestaurantGrid();
    };
  }
})();


// Deep link: nutrition.html#mercado o ?tab=mercado
(function() {
  function tryDeepLink() {
    var hash = (window.location.hash||'').replace('#','').toLowerCase();
    var param = new URLSearchParams(window.location.search).get('tab')||'';
    var target = hash || param;
    var valid = ['hoy','recetas','mercado','fuera','guia'];
    if (target && valid.includes(target) && typeof sw === 'function') {
      sw(target);
      // Scroll to top of content
      var sc = document.getElementById('scroll') || document.querySelector('.scroll');
      if (sc) sc.scrollTop = 0;
      return true;
    }
    return false;
  }
  // Try immediately, then on load, then after init
  if (!tryDeepLink()) {
    document.addEventListener('DOMContentLoaded', function() {
      if (!tryDeepLink()) setTimeout(tryDeepLink, 600);
    });
  }
})();
