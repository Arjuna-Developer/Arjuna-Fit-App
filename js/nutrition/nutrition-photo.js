
function afNavRegister() {
  var btn = document.getElementById('af-reg-btn');
  var ripple = document.getElementById('af-ripple');
  btn.style.animation = 'none';
  btn.style.transform = 'scale(.88) rotate(-8deg)';
  setTimeout(function(){ btn.style.transform='scale(1.08) rotate(4deg)'; }, 120);
  setTimeout(function(){ btn.style.transform=''; btn.style.animation='nav-pulse 3s ease-in-out infinite'; }, 300);
  if (ripple) {
    for (var i=0;i<3;i++) {
      (function(d){ setTimeout(function(){
        var r=document.createElement('div');
        r.style.cssText='position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.3);top:50%;left:50%;animation:nav-ripple .6s ease-out forwards';
        ripple.appendChild(r); setTimeout(function(){ r.remove(); },700);
      },d); })(i*80);
    }
  }
  setTimeout(function(){
    openCamera();
  },150);
}
(function(){
  var path = window.location.pathname;
  var MAP = {
    'dashboard': { id:'nav-inicio', color:'#a78bfa', glow:'rgba(124,58,237,.5)' },
    'workout':   { id:'nav-entrena', color:'#c4b5fd', glow:'rgba(139,92,246,.5)' },
    'coach':     { id:'nav-coach',   color:'#93c5fd', glow:'rgba(59,130,246,.5)' },
    'nutrition': { id:'nav-nutr',    color:'#6ee7b7', glow:'rgba(16,185,129,.5)' },
  };
  var match = Object.keys(MAP).find(function(k){ return path.includes(k); });
  if (!match) return;
  var cfg = MAP[match];
  var el = document.getElementById(cfg.id);
  if (!el) return;
  var svg = el.querySelector('svg');
  var lbl = el.querySelector('span');
  var dot = el.querySelectorAll('div');
  if (svg) svg.setAttribute('stroke', cfg.color);
  if (lbl) { lbl.style.color=cfg.color; lbl.style.fontWeight='800'; }
  if (dot.length) { var d=dot[dot.length-1]; d.style.background=cfg.glow; d.style.boxShadow='0 0 6px '+cfg.glow; }
})();
function renderTodayFoods() {
  var list = document.getElementById('todayFoodList');
  if (!list) return;

  var dateKey = localDateKey();
  var foods = [];
  try { foods = JSON.parse(localStorage.getItem('af-food-' + dateKey) || '[]'); } catch(e){}

  var MEAL_ICONS = { desayuno:'🌅', almuerzo:'🌞', cena:'🌙', snack:'🍓' };
  var MEAL_COLORS = { desayuno:'rgba(74,222,128,.7)', almuerzo:'rgba(251,191,36,.7)', cena:'rgba(167,139,250,.7)', snack:'rgba(249,115,22,.7)' };
  var MEAL_BORDERS = { desayuno:'#4ade80', almuerzo:'#fbbf24', cena:'#a78bfa', snack:'#fb923c' };

  if (!foods.length) {
    list.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:13px;color:rgba(255,255,255,.25)">Aún no has registrado comidas hoy</div>';
    return;
  }

  list.innerHTML = foods.map(function(f, i) {
    var meal = (f.meal || 'desayuno').toLowerCase();
    var icon = MEAL_ICONS[meal] || '🍽️';
    var col  = MEAL_COLORS[meal] || 'rgba(196,181,253,.7)';
    var bord = MEAL_BORDERS[meal] || '#a78bfa';
    var time = f.time ? f.time.slice(0,5) : '';
    var meta = [f.protein?f.protein+'g prot':'', f.kcal?f.kcal+' cal':'', f.meal||'', time].filter(Boolean).join(' · ');
    return '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;' +
      'background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);' +
      'border-left:3px solid '+bord+';border-radius:0 18px 18px 0">' +
      '<div style="width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,.05);' +
        'display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">'+icon+'</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:14px;font-weight:800;color:#fff;letter-spacing:-.01em;' +
          'white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+f.name+'</div>' +
        '<div style="font-size:11px;color:'+col+';margin-top:3px;font-weight:600">'+meta+'</div>' +
      '</div>' +
      '<button onclick="deleteFoodEntry('+i+')" style="width:30px;height:30px;border-radius:9px;' +
        'border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);' +
        'color:rgba(255,255,255,.4);cursor:pointer;display:flex;align-items:center;' +
        'justify-content:center;font-size:14px;flex-shrink:0">×</button>' +
      '</div>';
  }).join('');
}

function deleteFoodEntry(idx) {
  var dateKey = localDateKey();
  var foods = [];
  try { foods = JSON.parse(localStorage.getItem('af-food-' + dateKey) || '[]'); } catch(e){}
  foods.splice(idx, 1);
  localStorage.setItem('af-food-' + dateKey, JSON.stringify(foods));
  // Refresh food list
  renderTodayFoods();
  // Refresh macros ring + dayStateLabel
  if (typeof updateMacroUI === 'function') {
    updateMacroUI(foods);
  }
  // Also trigger the full day state update if available
  if (typeof renderDayState === 'function') renderDayState();
  if (typeof initHoy === 'function') initHoy();
  // Refresh meal strip on home if open
  if (typeof window.refreshMealStrip === 'function') window.refreshMealStrip();
}

// Run on load and after any save
document.addEventListener('DOMContentLoaded', function() {
  renderTodayFoods();
  // Hook into saveFood to refresh list
  var origSave = window.saveFood;
  if (typeof origSave === 'function') {
    window.saveFood = function() {
      var result = origSave.apply(this, arguments);
      setTimeout(function() {
        renderTodayFoods();
        var dk = localDateKey();
        var fs = [];
        try { fs = JSON.parse(localStorage.getItem('af-food-' + dk) || '[]'); } catch(e){}
        if (typeof updateMacroUI === 'function') updateMacroUI(fs);
      }, 400);
      return result;
    };
  }
  // Also refresh when tab becomes visible
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) renderTodayFoods();
  });
});
// Also call directly in case DOMContentLoaded already fired
setTimeout(function() {
  renderTodayFoods();
  // Also refresh macros on load
  var dateKey = localDateKey();
  var foods = [];
  try { foods = JSON.parse(localStorage.getItem('af-food-' + dateKey) || '[]'); } catch(e){}
  if (typeof updateMacroUI === 'function') updateMacroUI(foods);
}, 500);
// MERCADO — Lista de compras
var MARKET_DATA = {
  proteinas: {
    label: 'PROTEÍNAS', icon: '🥩', color: '#f87171',
    items: [
      { id:'p1', name:'Pechuga de pollo',   qty:'500g',    emoji:'🍗' },
      { id:'p2', name:'Huevos',             qty:'12 uds',  emoji:'🥚' },
      { id:'p3', name:'Atún en agua',       qty:'4 latas', emoji:'🐟' },
      { id:'p4', name:'Yogur griego',       qty:'500g',    emoji:'🫙' },
      { id:'p5', name:'Fríjoles negros',    qty:'1 libra', emoji:'🫘' },
      { id:'p6', name:'Carne molida (res)', qty:'400g',    emoji:'🥩' },
    ]
  },
  carbohidratos: {
    label: 'CARBOHIDRATOS', icon: '🌾', color: '#fcd34d',
    items: [
      { id:'c1', name:'Arroz blanco',       qty:'1 kg',  emoji:'🍚' },
      { id:'c2', name:'Avena en hojuelas',  qty:'500g',  emoji:'🥣' },
      { id:'c3', name:'Papa criolla',       qty:'1 kg',  emoji:'🥔' },
      { id:'c4', name:'Pan integral',       qty:'1 und', emoji:'🍞' },
    ]
  },
  grasas: {
    label: 'GRASAS BUENAS', icon: '🥑', color: '#6ee7b7',
    items: [
      { id:'g1', name:'Aguacate',           qty:'4 uds', emoji:'🥑' },
      { id:'g2', name:'Aceite de oliva',    qty:'250ml', emoji:'🫙' },
      { id:'g3', name:'Almendras',          qty:'200g',  emoji:'🥜' },
    ]
  },
  vegetales: {
    label: 'VEGETALES', icon: '🥦', color: '#34d399',
    items: [
      { id:'v1', name:'Brócoli',            qty:'500g',  emoji:'🥦' },
      { id:'v2', name:'Espinaca',           qty:'250g',  emoji:'🥬' },
      { id:'v3', name:'Tomate',             qty:'500g',  emoji:'🍅' },
      { id:'v4', name:'Zanahoria',          qty:'500g',  emoji:'🥕' },
      { id:'v5', name:'Pepino',             qty:'2 uds', emoji:'🥒' },
    ]
  },
  lacteos: {
    label: 'LÁCTEOS', icon: '🥛', color: '#93c5fd',
    items: [
      { id:'l1', name:'Leche descremada',   qty:'1 litro', emoji:'🥛' },
      { id:'l2', name:'Queso cottage',      qty:'250g',    emoji:'🧀' },
    ]
  },
  extras: {
    label: 'EXTRAS FIT', icon: '✨', color: '#c4b5fd',
    items: [
      { id:'e1', name:'Proteína en polvo',  qty:'1 kg',  emoji:'💪' },
      { id:'e2', name:'Limones',            qty:'6 uds', emoji:'🍋' },
      { id:'e3', name:'Sal rosa del Himalaya', qty:'250g', emoji:'🧂' },
    ]
  }
};

function getMarketChecked() {
  try { return JSON.parse(localStorage.getItem('af-market-checked') || '{}'); } catch(e) { return {}; }
}
function saveMarketChecked(obj) {
  localStorage.setItem('af-market-checked', JSON.stringify(obj));
}


function renderRestaurants(){var list=document.getElementById('restaurantList');if(!list)return;var data=(RESTAURANTS[_selCity]&&RESTAURANTS[_selCity][_selMealType])||[];if(!data.length){list.innerHTML='<div style="text-align:center;padding:24px;font-size:13px;color:rgba(255,255,255,.25)">Próximamente en esta ciudad</div>';return;}list.innerHTML=data.map(function(r){return'<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:18px;overflow:hidden"><div style="display:flex;align-items:center;gap:12px;padding:14px 16px"><div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">'+r.e+'</div><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:3px">'+r.n+'</div><div style="font-size:12px;color:rgba(255,255,255,.4)">'+r.d+' · '+r.dist+'</div></div></div><div style="padding:0 16px 14px"><div style="font-size:11px;font-weight:700;color:#a78bfa;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px">🤖 Pide:</div><div style="font-size:13px;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:8px">'+r.p+'</div><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(124,58,237,.15);color:#c4b5fd;font-weight:700">'+r.m+'</span><a href="https://www.google.com/maps/search/'+encodeURIComponent(r.n)+'" target="_blank" style="font-size:12px;color:rgba(167,139,250,.6);font-weight:600;text-decoration:none">📍 Ver →</a></div></div></div>';}).join('');}

// Hook into sw() 
(function(){var _origSw=window.sw;if(typeof _origSw==='function'){window.sw=function(id){_origSw(id);if(id==='fuera')setTimeout(function(){renderRestaurants();},60);};}})();
setTimeout(function(){if(document.getElementById('tc-fuera')&&document.getElementById('tc-fuera').classList.contains('on'))renderRestaurants();},300);

function addToLog(rid) {
  // Find recipe data
  var RECIPE_DATA = {
    'bowl-huevos':    {name:'Bowl de huevos y aguacate',  cal:380, prot:28, fat:18, carb:22},
    'pechuga-arroz':  {name:'Pechuga con arroz y brócoli',cal:420, prot:45, fat:8,  carb:40},
    'atun-frijoles':  {name:'Atún con frijoles negros',   cal:310, prot:35, fat:4,  carb:28},
    'huevos-espinaca':{name:'Huevos revueltos con espinaca',cal:280,prot:22,fat:16, carb:8},
    'lentejas':       {name:'Lentejas con vegetales',     cal:320, prot:18, fat:3,  carb:52},
    'batido':         {name:'Batido proteína y banana',   cal:290, prot:30, fat:4,  carb:38},
    'avena-proteina': {name:'Avena con proteína y banana',cal:350, prot:30, fat:6,  carb:52},
    'salmon-espinaca':{name:'Salmón con espinaca',        cal:390, prot:42, fat:20, carb:8},
  };
  var r = RECIPE_DATA[rid];
  if (!r) { if(typeof openQuickLog==='function') openQuickLog(); return; }
  
  var h = new Date().getHours();
  var meal = h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 20 ? 'cena' : 'snack';
  
  if (typeof saveFood === 'function') {
    saveFood(r.name, r.cal, r.prot, r.fat || 0, meal);
    var modal = document.querySelector('[style*="inset:0"]');
    if (modal) modal.remove();
  }
}
function openMealDetail(meal) {
  window._quickLogMeal = meal;
  if (typeof openQuickLog === 'function') openQuickLog();
}
window._activeRecipeFilter = 'todo';
function filterByMeal(meal) {
  window._activeRecipeFilter = meal || 'todo';
  ['todo','desayuno','almuerzo','cena','snack'].forEach(function(k) {
    var btn = document.getElementById('rf-' + k);
    if (!btn) return;
    var active = (k === window._activeRecipeFilter);
    btn.style.background = active ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,.05)';
    btn.style.color      = active ? '#fff' : 'rgba(255,255,255,.6)';
    btn.style.border     = active ? 'none' : '1px solid rgba(255,255,255,.1)';
    btn.style.boxShadow  = active ? '0 3px 10px rgba(124,58,237,.35)' : 'none';
  });
  ['recipeListFallback'].forEach(function(lid) {
    var list = document.getElementById(lid);
    if (!list) return;
    list.querySelectorAll('[data-meal]').forEach(function(card) {
      card.style.display = (window._activeRecipeFilter === 'todo' || card.dataset.meal === window._activeRecipeFilter) ? '' : 'none';
    });
  });
}


var MARKET_DATA = {
  proteinas:     { label:'PROTEÍNAS',     icon:'🥩', color:'#f87171',
    items: [{id:'p1',name:'Pechuga de pollo',qty:'500g',emoji:'🍗'},{id:'p2',name:'Huevos',qty:'12 uds',emoji:'🥚'},{id:'p3',name:'Atún en agua',qty:'4 latas',emoji:'🐟'},{id:'p4',name:'Yogur griego',qty:'500g',emoji:'🫙'},{id:'p5',name:'Fríjoles negros',qty:'1 libra',emoji:'🫘'},{id:'p6',name:'Carne molida',qty:'400g',emoji:'🥩'}]},
  carbohidratos: { label:'CARBOHIDRATOS', icon:'🌾', color:'#fcd34d',
    items: [{id:'c1',name:'Arroz blanco',qty:'1 kg',emoji:'🍚'},{id:'c2',name:'Avena en hojuelas',qty:'500g',emoji:'🥣'},{id:'c3',name:'Papa criolla',qty:'1 kg',emoji:'🥔'},{id:'c4',name:'Pan integral',qty:'1 und',emoji:'🍞'}]},
  grasas:        { label:'GRASAS BUENAS', icon:'🥑', color:'#6ee7b7',
    items: [{id:'g1',name:'Aguacate',qty:'4 uds',emoji:'🥑'},{id:'g2',name:'Aceite de oliva',qty:'250ml',emoji:'🫙'},{id:'g3',name:'Almendras',qty:'200g',emoji:'🥜'}]},
  vegetales:     { label:'VEGETALES',     icon:'🥦', color:'#34d399',
    items: [{id:'v1',name:'Brócoli',qty:'500g',emoji:'🥦'},{id:'v2',name:'Espinaca',qty:'250g',emoji:'🥬'},{id:'v3',name:'Tomate',qty:'500g',emoji:'🍅'},{id:'v4',name:'Zanahoria',qty:'500g',emoji:'🥕'}]},
  lacteos:       { label:'LÁCTEOS',       icon:'🥛', color:'#93c5fd',
    items: [{id:'l1',name:'Leche descremada',qty:'1 litro',emoji:'🥛'},{id:'l2',name:'Queso cottage',qty:'250g',emoji:'🧀'}]},
  extras:        { label:'EXTRAS FIT',    icon:'✨', color:'#c4b5fd',
    items: [{id:'e1',name:'Proteína en polvo',qty:'1 kg',emoji:'💪'},{id:'e2',name:'Limones',qty:'6 uds',emoji:'🍋'},{id:'e3',name:'Sal rosa',qty:'250g',emoji:'🧂'}]}
};

function renderMarket() {
  var list = document.getElementById('marketList');
  if (!list) return;
  var checked = getMarketChecked();
  var html = '';
  Object.keys(MARKET_DATA).forEach(function(catKey) {
    var cat = MARKET_DATA[catKey];
    var doneCount = cat.items.filter(function(it){ return !!checked[it.id]; }).length;
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px;overflow:hidden;margin-bottom:10px">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px">';
    html += '<div style="display:flex;align-items:center;gap:8px"><span>' + cat.icon + '</span>';
    html += '<span style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:' + cat.color + '">' + cat.label + '</span></div>';
    html += '<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.4);font-weight:600">';
    html += (doneCount > 0 ? doneCount + '/' : '') + cat.items.length + ' productos</span></div>';
    cat.items.forEach(function(item) {
      var isDone = !!checked[item.id];
      html += '<div data-mid="' + item.id + '" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-top:1px solid rgba(255,255,255,.05);cursor:pointer;-webkit-tap-highlight-color:transparent;' + (isDone ? 'opacity:.45;' : '') + '">';
      html += '<div style="width:22px;height:22px;border-radius:7px;border:1.5px solid ' + (isDone ? cat.color : 'rgba(124,58,237,.4)') + ';display:flex;align-items:center;justify-content:center;font-size:11px;color:white">' + (isDone ? '✓' : '') + '</div>';
      html += '<div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">' + item.emoji + '</div>';
      html += '<div style="flex:1;font-size:14px;font-weight:700;color:' + (isDone ? 'rgba(255,255,255,.4)' : '#fff') + ';text-decoration:' + (isDone ? 'line-through' : 'none') + '">' + item.name + '</div>';
      html += '<span style="font-size:13px;color:rgba(255,255,255,.4);font-weight:600">' + item.qty + '</span>';
      html += '</div>';
    });
    html += '</div>';
  });
  list.innerHTML = html;
  list.onclick = function(e) {
    var el = e.target;
    while (el && el !== list) {
      if (el.getAttribute && el.getAttribute('data-mid')) {
        toggleMarketItem(el.getAttribute('data-mid'));
        return;
      }
      el = el.parentElement;
    }
  };
}


function toggleMarketItem(id) {
  var c = {};
  try { c = JSON.parse(localStorage.getItem('af-market-checked') || '{}'); } catch(e){}
  c[id] = !c[id];
  var done = c[id];
  localStorage.setItem('af-market-checked', JSON.stringify(c));
  var chk = document.getElementById('chk-' + id);
  var row = document.querySelector('[data-mid="' + id + '"]');
  var nameEl = document.querySelector('.mkt-name-' + id);
  if (chk) { chk.textContent = done ? '✓' : ''; chk.style.background = done ? 'rgba(124,58,237,.25)' : 'transparent'; chk.style.borderColor = done ? '#7c3aed' : 'rgba(255,255,255,.15)'; }
  if (row) row.style.opacity = done ? '0.42' : '1';
  if (nameEl) nameEl.style.textDecoration = done ? 'line-through' : 'none';
}
function resetMarket() {
  localStorage.removeItem('af-market-checked');
  document.querySelectorAll('[data-mid]').forEach(function(row) {
    var id = row.getAttribute('data-mid');
    var chk = document.getElementById('chk-' + id);
    if (chk) { chk.textContent = ''; chk.style.background = 'transparent'; chk.style.borderColor = 'rgba(255,255,255,.15)'; }
    row.style.opacity = '1';
    var nm = document.querySelector('.mkt-name-' + id);
    if (nm) nm.style.textDecoration = 'none';
  });
}
function addMarketItem() {
  var name = prompt('Nombre del producto:');
  if (!name) return;
  var qty = prompt('Cantidad:') || '—';
  var list = document.getElementById('marketList');
  if (!list) return;
  var id = 'cx' + Date.now();
  var div = document.createElement('div');
  div.setAttribute('data-mid', id);
  div.onclick = function(){ toggleMarketItem(id); };
  div.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-top:1px solid rgba(255,255,255,.06);cursor:pointer';
  div.innerHTML = '<div id="chk-' + id + '" style="width:24px;height:24px;border-radius:8px;border:1.5px solid rgba(255,255,255,.15);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px"></div><div style="width:44px;height:44px;border-radius:13px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">🛒</div><div class="mkt-name-' + id + '" style="flex:1;font-size:14px;font-weight:700;color:#fff">' + name + '</div><span style="font-size:13px;color:rgba(255,255,255,.4)">' + qty + '</span>';
  list.appendChild(div);
}
document.addEventListener('DOMContentLoaded', function() {
  var c = {};
  try { c = JSON.parse(localStorage.getItem('af-market-checked') || '{}'); } catch(e){}
  Object.keys(c).forEach(function(id) { if (c[id]) toggleMarketItem(id); });
});
var SUGGESTION_DATA = {
  'pechuga-arroz':  {name:'Pechuga con arroz y brócoli', cal:420, prot:45, fat:8,  carb:40},
  'arroz-pollo':    {name:'Arroz con pollo',              cal:450, prot:38, fat:10, carb:52},
  'lentejas':       {name:'Lentejas con vegetales',       cal:320, prot:18, fat:3,  carb:52},
  'atun-frijoles':  {name:'Atún con frijoles negros',     cal:310, prot:35, fat:4,  carb:28},
  'batido-banano':  {name:'Batido de banano y proteína',  cal:290, prot:30, fat:4,  carb:38},
  'avena-banano':   {name:'Avena con banano y canela',    cal:310, prot:12, fat:6,  carb:52},
  'huevos-aguacate':{name:'Bowl de huevos y aguacate',    cal:380, prot:28, fat:18, carb:22},
  'omelette':       {name:'Omelette de vegetales',        cal:280, prot:22, fat:16, carb:8},
  'caldo-papa':     {name:'Caldo de papa y pollo',        cal:240, prot:20, fat:4,  carb:32},
};

function addSuggestion(id) {
  var d = SUGGESTION_DATA[id] || {name: id, cal:300, prot:25, fat:8, carb:30};
  var h = new Date().getHours();
  var meal = h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 20 ? 'cena' : 'snack';
  if (typeof saveFood === 'function') {
    saveFood(d.name, d.cal, d.prot, d.fat || 0, meal, d.carb || 0);
    // Visual feedback
    showSaveToast(d.name);
  }
}

function addFeaturedToLog() {
  // Add whatever is in the featured card
  var featuredName = document.querySelector('#featuredRecipe .recipe-name, #featuredRecipe [style*="font-weight:800"]');
  var name = featuredName ? featuredName.textContent.trim() : 'Receta destacada';
  var h = new Date().getHours();
  var meal = h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 20 ? 'cena' : 'snack';
  if (typeof saveFood === 'function') {
    saveFood(name, 380, 32, 10, meal, 35);
    showSaveToast(name);
  }
}

function showSaveToast(name) {
  var existing = document.getElementById('save-toast');
  if (existing) existing.remove();
  var t = document.createElement('div');
  t.id = 'save-toast';
  t.style.cssText = 'position:fixed;top:calc(20px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:600;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);border-radius:14px;padding:10px 20px;font-family:Outfit,sans-serif;font-size:13px;font-weight:700;color:#34d399;white-space:nowrap;backdrop-filter:blur(10px)';
  t.textContent = '✅ ' + name.slice(0,30) + ' registrado';
  document.body.appendChild(t);
  setTimeout(function(){ t.remove(); }, 2500);
  // Refresh today list
  setTimeout(function(){
    if (typeof renderTodayFoods === 'function') renderTodayFoods();
    if (typeof updateMacroUI === 'function') {
      var dk = localDateKey();
      var fs = [];
      try { fs = JSON.parse(localStorage.getItem('af-food-'+dk)||'[]'); } catch(e){}
      updateMacroUI(fs);
    }
  }, 300);
}

// Set header height for tab positioning
(function(){
  function setHdrH(){
    var hdr = document.querySelector('.hdr');
    if(hdr) document.documentElement.style.setProperty('--hdr-h', hdr.offsetHeight+'px');
  }
  setHdrH();
  window.addEventListener('resize', setHdrH);
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(setHdrH, 50); });
})();

// Set initial tab top from header height
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var hdr = document.querySelector('.hdr');
    var hdrH = hdr ? (hdr.getBoundingClientRect().bottom || hdr.offsetHeight) : 105;
    document.querySelectorAll('.tc.on').forEach(function(tc) {
      tc.style.top = hdrH + 'px';
    });
  }, 100);
});

// Measure and set header height for tab positioning
function updateNutrHdr() {
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var h = hdr.getBoundingClientRect().height || hdr.offsetHeight;
    document.documentElement.style.setProperty('--nutr-hdr', h + 'px');
  }
}
updateNutrHdr();
document.addEventListener('DOMContentLoaded', function() { setTimeout(updateNutrHdr, 50); });
window.addEventListener('resize', updateNutrHdr);

// Patch renderTodayFoods to show/hide empty state
var _origRenderTodayFoods = window.renderTodayFoods;
window.renderTodayFoods = function(foods) {
  var list = document.getElementById('todayFoodList');
  var empty = document.getElementById('foodListEmpty');
  if (_origRenderTodayFoods) _origRenderTodayFoods(foods);
  if (list && empty) {
    var hasFoods = list.children.length > 1 || (foods && foods.length > 0);
    empty.style.display = hasFoods ? 'none' : 'block';
  }
};
// openCamera — foto IA in-page (no navegar a otro lugar)
function openCamera(meal) {
  if (typeof openPhotoLog === "function") openPhotoLog(meal);
}

async function handlePhotoSelected(input, meal) {
  var file = input.files[0];
  if (!file) return;

  // Show preview
  var reader = new FileReader();
  reader.onload = function(e) {
    var preview = document.getElementById('photoPreview');
    if (preview) {
      preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:18px">';
    }
  };
  reader.readAsDataURL(file);

  // Show loading
  document.getElementById('photoLoading').style.display = 'block';
  document.getElementById('photoResults').style.display = 'none';

  try {
    // Validate size (4MB max)
    if (file.size > 4 * 1024 * 1024) {
      throw new Error('La foto es muy grande. Máximo 4MB.');
    }

    // Convert to base64
    var b64 = await new Promise(function(res, rej) {
      var r = new FileReader();
      r.onload  = function() { res(r.result.split(',')[1]); };
      r.onerror = rej;
      r.readAsDataURL(file);
    });

    // Get auth token
    var authToken = '';
    try {
      var raw = localStorage.getItem('sb-egswsqymkxmbtcpnozcq-auth-token');
      if (raw) authToken = JSON.parse(raw)?.access_token || '';
    } catch(e) {}

    // Send to food-photo function
    var resp = await fetch('/api/food-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      },
      body: JSON.stringify({
        image:     b64,
        mediaType: file.type,
        meal:      meal || (function() {
          var h = new Date().getHours();
          return h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 19 ? 'cena' : 'snack';
        })()
      })
    });

    var data = await resp.json();
    document.getElementById('photoLoading').style.display = 'none';

    if (!resp.ok || !data.foods) {
      throw new Error(data.error || 'Error analizando la foto');
    }

    // Show results
    showPhotoResults(data, meal);

  } catch(err) {
    document.getElementById('photoLoading').style.display = 'none';
    var results = document.getElementById('photoResults');
    results.style.display = 'block';
    results.innerHTML = '<div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:16px;padding:16px;text-align:center;color:rgba(255,100,100,.9);font-size:13px;font-weight:600">' +
      '⚠️ ' + (err.message || 'Error al procesar la foto') + '</div>';
  }
}

function showPhotoResults(data, meal) {
  var results = document.getElementById('photoResults');
  if (!results) return;
  results.style.display = 'block';
  window._lastPhotoData = data;

  var foods = data.foods || [];
  var total = {
    cal:  data.total_calories || 0,
    prot: data.total_protein  || 0,
    carb: data.total_carbs    || 0,
    fat:  data.total_fat      || 0
  };

  var foodsHtml = foods.map(function(f) {
    return [
      '<div style="display:flex;justify-content:space-between;align-items:center;',
      'padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)">',
      '<div>',
        '<div style="font-size:13px;font-weight:700;color:#fff">' + (f.name || '') + '</div>',
        '<div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px">' + (f.amount || '') + '</div>',
      '</div>',
      '<div style="text-align:right">',
        '<div style="font-size:13px;font-weight:800;color:#a78bfa">' + Math.round(f.calories || 0) + ' cal</div>',
        '<div style="font-size:11px;color:rgba(255,255,255,.4)">' + Math.round(f.protein || 0) + 'g prot</div>',
      '</div>',
      '</div>'
    ].join('');
  }).join('');

  var html = [
    '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);',
    'border-radius:20px;padding:16px;width:100%">',
      '<div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;',
      'color:rgba(255,255,255,.4);margin-bottom:12px">Detectado por IA</div>',
      foodsHtml,
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px;',
      'padding-top:12px;border-top:1px solid rgba(255,255,255,.08)">',
        '<div style="text-align:center"><div style="font-size:16px;font-weight:900;color:#fff">' + Math.round(total.cal) + '</div><div style="font-size:10px;color:rgba(255,255,255,.4)">kcal</div></div>',
        '<div style="text-align:center"><div style="font-size:16px;font-weight:900;color:#a78bfa">' + Math.round(total.prot) + 'g</div><div style="font-size:10px;color:rgba(255,255,255,.4)">prot</div></div>',
        '<div style="text-align:center"><div style="font-size:16px;font-weight:900;color:#fcd34d">' + Math.round(total.carb) + 'g</div><div style="font-size:10px;color:rgba(255,255,255,.4)">carb</div></div>',
        '<div style="text-align:center"><div style="font-size:16px;font-weight:900;color:#6ee7b7">' + Math.round(total.fat) + 'g</div><div style="font-size:10px;color:rgba(255,255,255,.4)">grasas</div></div>',
      '</div>',
    '</div>',
    '<button onclick="savePhotoMealFromBtn(this)" data-meal="' + (meal || '') + '"',
    ' style="width:100%;padding:16px;border-radius:18px;border:none;cursor:pointer;margin-top:12px;',
    'background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;',
    'font-family:sans-serif;font-size:15px;font-weight:800;letter-spacing:-.01em;',
    'box-shadow:0 4px 20px rgba(124,58,237,.4)">Agregar al registro</button>'
  ].join('');

  results.innerHTML = html;
}

async function savePhotoMeal(data, meal) {
  if (!meal) {
    var h = new Date().getHours();
    meal = h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 19 ? 'cena' : 'snack';
  }
  var entry = {
    name:     (data.foods||[]).map(function(f){return f.name;}).join(', ') || 'Comida IA',
    cal:      Math.round(data.total_calories||0),
    prot:     Math.round(data.total_protein||0),
    carb:     Math.round(data.total_carbs||0),
    fat:      Math.round(data.total_fat||0),
    meal:     meal,
    source:   'foto_ia'
  };

  if (window.FoodLog) {
    await window.FoodLog.saveFoodLog(entry);
  } else {
    saveFood(entry);
  }

  // Close overlay
  var ov = document.getElementById('photoOverlay');
  if (ov) ov.remove();

  // Show success and refresh UI
  showSaveToast && showSaveToast('📷 Registrado con IA ✓');
  renderTodayFoods && renderTodayFoods();
}

// Spin animation for loading
if (!document.getElementById('spinStyle')) {
  var s = document.createElement('style');
  s.id = 'spinStyle';
  s.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
}

function closePhotoOverlay(){var ov=document.getElementById('photo-ov');if(ov)ov.remove();document.body.style.overflow='';}
