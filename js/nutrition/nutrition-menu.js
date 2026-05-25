
/* ════════════════════════════════════════════
   MENÚ SEMANAL IA — ArjunaFit
   Genera plan 5 días con Arju + lista mercado
════════════════════════════════════════════ */
(function(){

var _menu = null;
var _menuDay = 0;
var DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
var COMIDAS = ['desayuno','almuerzo','cena'];
var ICONS = {desayuno:'🌅',almuerzo:'🌞',cena:'🌙'};
var LABELS = {desayuno:'Desayuno',almuerzo:'Almuerzo',cena:'Cena'};

// Cargar menú guardado
function loadSaved(){
  try{
    var s = localStorage.getItem('af-weekly-menu');
    if(s){ _menu = JSON.parse(s); renderMenu(); }
  }catch(e){}
}

// Generar menú con IA
window.menuGenerar = async function(){
  var btn = document.getElementById('menuGenerarBtn');
  var empty = document.getElementById('menuEmpty');
  var loading = document.getElementById('menuLoading');
  var content = document.getElementById('menuContent');
  var loadTxt = document.getElementById('menuLoadingTxt');

  if(btn) btn.disabled = true;
  if(empty) empty.style.display = 'none';
  if(loading){ loading.style.display = 'block'; }
  if(content) content.style.display = 'none';

  var msgs = ['Arju está creando tu menú...','Calculando tus macros...','Eligiendo recetas colombianas...','Ajustando porciones...','Casi listo...'];
  var mi = 0;
  var interval = setInterval(function(){
    mi = (mi+1)%msgs.length;
    if(loadTxt) loadTxt.textContent = msgs[mi];
  }, 1400);

  try{
    var reto = localStorage.getItem('af-selected-reto') || localStorage.getItem('af-product-type') || 'glutes';
    var kcal = localStorage.getItem('af-kcal-goal') || '2000';
    var prot = localStorage.getItem('af-prot-goal') || '120';
    var nombre = localStorage.getItem('af-user-name') || 'amiga';

    var goalText = {
      gluteos:'tonificar glúteos y piernas',
      pancita:'bajar grasa abdominal',
      challenge_glutes:'tonificar glúteos y piernas',
      challenge_belly:'bajar grasa abdominal',
      custom_muscle_gain:'ganar masa muscular',
      custom_fat_loss:'reducción de grasa corporal',
      custom_plan:'transformación corporal'
    }[reto] || 'transformación física';

    var prompt = "Eres Arju, nutricionista de ArjunaFit. Genera un menú semanal de 5 días (Lunes a Viernes) para "+nombre+" cuyo objetivo es "+goalText+". Meta: "+kcal+" kcal/día y "+prot+"g proteína/día. Usa alimentos colombianos y latinoamericanos reales: pollo, carne, huevo, arroz, fríjoles, arepa, papa, plátano, aguacate, etc. Responde SOLO con este JSON (sin texto extra):\n{\"dias\":[{\"nombre\":\"Lunes\",\"desayuno\":{\"nombre\":\"nombre del plato\",\"descripcion\":\"ingredientes breves\",\"kcal\":400,\"prot\":30,\"ingredientes\":[\"item 1\",\"item 2\"]},\"almuerzo\":{\"nombre\":\"\",\"descripcion\":\"\",\"kcal\":550,\"prot\":40,\"ingredientes\":[]},\"cena\":{\"nombre\":\"\",\"descripcion\":\"\",\"kcal\":400,\"prot\":30,\"ingredientes\":[]}},{\"nombre\":\"Martes\",...},{\"nombre\":\"Miércoles\",...},{\"nombre\":\"Jueves\",...},{\"nombre\":\"Viernes\",...}]}";

    var authToken = '';
    try{
      var raw = localStorage.getItem('sb-egswsqymkxmbtcpnozcq-auth-token') || localStorage.getItem('arjunafit-auth');
      if(raw) authToken = JSON.parse(raw)?.access_token || '';
    }catch(e){}

    var res = await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+authToken},
      body:JSON.stringify({
        system:'Eres Arju, nutricionista de ArjunaFit. Responde SOLO con JSON válido, sin texto extra, sin markdown.',
        messages:[{role:'user',content:prompt}],
        max_tokens:2000
      })
    });

    var data = await res.json();
    var raw2 = data.choices?.[0]?.message?.content || data.reply || '';
    var clean = raw2.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    var parsed = JSON.parse(clean);

    if(!parsed.dias || !Array.isArray(parsed.dias)) throw new Error('formato incorrecto');

    _menu = parsed;
    localStorage.setItem('af-weekly-menu', JSON.stringify(_menu));
    clearInterval(interval);
    renderMenu();

  }catch(err){
    clearInterval(interval);
    console.error('[Menu]', err);
    // Fallback menu
    _menu = menuFallback(reto||'gluteos');
    localStorage.setItem('af-weekly-menu', JSON.stringify(_menu));
    renderMenu();
  }finally{
    if(btn) btn.disabled = false;
    if(loading) loading.style.display = 'none';
  }
};

function renderMenu(){
  var empty = document.getElementById('menuEmpty');
  var loading = document.getElementById('menuLoading');
  var content = document.getElementById('menuContent');
  if(!_menu||!content) return;
  if(empty) empty.style.display='none';
  if(loading) loading.style.display='none';
  content.style.display='block';

  // Tabs de días
  var tabs = document.getElementById('menuDayTabs');
  if(tabs){
    tabs.innerHTML = (_menu.dias||[]).map(function(d,i){
      return '<button class="menu-day-tab'+(i===_menuDay?' act':'')+'" onclick="menuSelectDay('+i+')">'+d.nombre+'</button>';
    }).join('');
  }

  renderDayContent();
}

window.menuSelectDay = function(idx){
  _menuDay = idx;
  document.querySelectorAll('.menu-day-tab').forEach(function(b,i){
    b.classList.toggle('act', i===idx);
  });
  renderDayContent();
};

function renderDayContent(){
  var el = document.getElementById('menuDayContent');
  if(!el||!_menu) return;
  var day = _menu.dias[_menuDay];
  if(!day){ el.innerHTML=''; return; }

  el.innerHTML = COMIDAS.map(function(c){
    var m = day[c];
    if(!m) return '';
    return '<div class="menu-meal-card">'+
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px">'+
        '<div style="display:flex;align-items:center;gap:6px">'+
          '<span style="font-size:16px">'+ICONS[c]+'</span>'+
          '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.4)">'+LABELS[c]+'</span>'+
        '</div>'+
        '<div style="display:flex;gap:6px">'+
          '<span style="font-size:10px;padding:2px 7px;border-radius:12px;background:rgba(245,158,11,.12);color:#fcd34d;font-weight:700">🔥 '+(m.kcal||0)+'</span>'+
          '<span style="font-size:10px;padding:2px 7px;border-radius:12px;background:rgba(74,222,128,.1);color:#4ade80;font-weight:700">💪 '+(m.prot||0)+'g</span>'+
        '</div>'+
      '</div>'+
      '<div style="font-size:14px;font-weight:800;color:#f1f0f4;letter-spacing:-.02em;margin-bottom:3px">'+(m.nombre||'')+'</div>'+
      '<div style="font-size:12px;color:rgba(255,255,255,.45);line-height:1.5">'+(m.descripcion||'')+'</div>'+
      (typeof saveFood==='function'?
        '<button onclick="menuRegistrar(''+_menuDay+'',''+c+'')" style="margin-top:8px;width:100%;padding:8px;border-radius:10px;border:1px solid rgba(124,58,237,.2);background:rgba(124,58,237,.08);color:#a78bfa;font-family:Outfit,sans-serif;font-size:11px;font-weight:700;cursor:pointer">+ Registrar esta comida</button>'
      :'')+
    '</div>';
  }).join('');
}

window.menuRegistrar = function(dayIdx, comida){
  var day = _menu&&_menu.dias[dayIdx];
  var m = day&&day[comida];
  if(!m) return;
  var h = new Date().getHours();
  var meal = comida||( h<11?'desayuno':h<15?'almuerzo':'cena' );
  if(typeof saveFood==='function'){
    saveFood(m.nombre, m.kcal||0, m.prot||0, 0, meal);
    var t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:calc(90px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:9000;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);border-radius:14px;padding:10px 18px;font-size:13px;font-weight:600;color:#34d399;white-space:nowrap;font-family:Outfit,sans-serif';
    t.textContent='✅ '+m.nombre.slice(0,28)+' registrado';
    document.body.appendChild(t);
    setTimeout(function(){t.remove();},2500);
  }
};

// Agregar ingredientes al mercado
window.menuAgregarMercado = function(){
  if(!_menu) return;
  var allIngredients = {};
  (_menu.dias||[]).forEach(function(d){
    COMIDAS.forEach(function(c){
      ((d[c]&&d[c].ingredientes)||[]).forEach(function(ing){
        allIngredients[ing] = true;
      });
    });
  });

  var list = Object.keys(allIngredients);
  if(!list.length){ alert('Sin ingredientes disponibles'); return; }

  var marketList = document.getElementById('marketList');
  if(!marketList){ sw('mercado'); setTimeout(menuAgregarMercado,300); return; }

  // Crear sección IA en el mercado
  var existing = document.getElementById('market-ai-section');
  if(existing) existing.remove();

  var section = document.createElement('div');
  section.id = 'market-ai-section';
  section.style.cssText = 'background:rgba(255,255,255,.03);border:1px solid rgba(124,58,237,.2);border-radius:22px;overflow:hidden;margin-bottom:10px';
  section.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.05)">'+
      '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">✨</span>'+
        '<span style="font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#a78bfa">MENÚ IA — Esta semana</span></div>'+
      '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.4)">'+list.length+' ingredientes</span>'+
    '</div>'+
    list.map(function(ing){
      var id = 'mai-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
      return '<div data-mid="'+id+'" onclick="toggleMarketItem(''+id+'')" style="display:flex;align-items:center;gap:12px;padding:13px 16px;border-top:1px solid rgba(255,255,255,.05);cursor:pointer;-webkit-tap-highlight-color:transparent">'+
        '<div id="chk-'+id+'" style="width:22px;height:22px;border-radius:7px;border:2px solid rgba(255,255,255,.2);background:transparent;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s"></div>'+
        '<span style="font-size:13px;color:rgba(240,238,248,.8);font-weight:500">'+ing+'</span>'+
      '</div>';
    }).join('');

  marketList.prepend(section);
  localStorage.setItem('af-market-ai', JSON.stringify(list));

  // Cambiar al tab mercado
  if(typeof sw==='function') sw('mercado');

  // Toast
  setTimeout(function(){
    var t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:calc(90px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:9000;background:rgba(124,58,237,.2);border:1px solid rgba(124,58,237,.4);border-radius:14px;padding:10px 18px;font-size:13px;font-weight:600;color:#c4b5fd;white-space:nowrap;font-family:Outfit,sans-serif';
    t.textContent='🛒 '+list.length+' ingredientes agregados al mercado';
    document.body.appendChild(t);
    setTimeout(function(){t.remove();},3000);
  },400);
};

// Menú fallback si la IA falla
function menuFallback(reto){
  var esGluteos = reto.includes('glute');
  var base = {dias:[
    {nombre:'Lunes',
      desayuno:{nombre:'Avena con banano y huevo',descripcion:'Avena 50g + banano + 2 huevos revueltos',kcal:420,prot:28,ingredientes:['Avena en hojuelas','Banano','Huevos','Leche']},
      almuerzo:{nombre:'Pechuga con arroz y ensalada',descripcion:'Pechuga 200g plancha + arroz integral + tomate',kcal:560,prot:48,ingredientes:['Pechuga de pollo','Arroz integral','Tomate','Lechuga','Aceite de oliva']},
      cena:{nombre:'Sopa de lentejas',descripcion:'Lentejas + zanahoria + cebolla + papa',kcal:380,prot:22,ingredientes:['Lentejas','Zanahoria','Cebolla','Papa']}
    },
    {nombre:'Martes',
      desayuno:{nombre:'Huevos con arepa y aguacate',descripcion:'2 huevos + arepa de maíz + ½ aguacate',kcal:440,prot:26,ingredientes:['Huevos','Arepa de maíz','Aguacate']},
      almuerzo:{nombre:'Atún con fríjoles y arroz',descripcion:'Atún en agua + fríjoles negros + arroz',kcal:520,prot:42,ingredientes:['Atún en agua','Fríjoles negros','Arroz blanco','Limón']},
      cena:{nombre:'Pechuga en ensalada',descripcion:'Pechuga fría + lechuga + pepino + tomate',kcal:340,prot:38,ingredientes:['Pechuga de pollo','Lechuga','Pepino','Tomate']}
    },
    {nombre:'Miércoles',
      desayuno:{nombre:'Yogur griego con fruta',descripcion:'Yogur griego 200g + moras + miel',kcal:320,prot:22,ingredientes:['Yogur griego','Moras o fresas','Miel']},
      almuerzo:{nombre:'Carne molida con papa y ensalada',descripcion:'Carne magra + papa criolla + ensalada',kcal:580,prot:44,ingredientes:['Carne molida','Papa criolla','Tomate','Cebolla','Aceite']},
      cena:{nombre:'Huevos revueltos con espinaca',descripcion:'3 huevos + espinaca + queso fresco',kcal:360,prot:30,ingredientes:['Huevos','Espinaca','Queso fresco']}
    },
    {nombre:'Jueves',
      desayuno:{nombre:'Batido de proteína natural',descripcion:'Leche + banano + mantequilla de maní + avena',kcal:400,prot:28,ingredientes:['Leche descremada','Banano','Mantequilla de maní','Avena']},
      almuerzo:{nombre:'Pollo asado con plátano y ensalada',descripcion:'¼ pollo asado + plátano maduro + ensalada verde',kcal:600,prot:45,ingredientes:['Pollo','Plátano maduro','Lechuga','Tomate']},
      cena:{nombre:'Sopa de pollo con verduras',descripcion:'Pechuga + zanahoria + cebolla + cilantro',kcal:350,prot:32,ingredientes:['Pechuga de pollo','Zanahoria','Cebolla','Papa','Cilantro']}
    },
    {nombre:'Viernes',
      desayuno:{nombre:'Tostadas integrales con huevo',descripcion:'2 tostadas + 2 huevos + tomate',kcal:380,prot:24,ingredientes:['Pan integral','Huevos','Tomate','Aceite de oliva']},
      almuerzo:{nombre:'Tilapia con arroz y brócoli',descripcion:'Tilapia 200g al vapor + arroz + brócoli',kcal:520,prot:46,ingredientes:['Tilapia','Arroz','Brócoli','Limón']},
      cena:{nombre:'Ensalada completa con atún',descripcion:'Atún + lechuga + aguacate + huevo duro',kcal:380,prot:36,ingredientes:['Atún','Lechuga','Aguacate','Huevos']}
    }
  ]};
  return base;
}

// Init
loadSaved();

})();
