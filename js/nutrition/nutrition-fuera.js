
/* COMER FUERA v3 */
(function(){
var D=[{"id": "pollo-asado", "name": "Pollo asado", "emoji": "🍗", "category": "comida_colombiana", "goal_fit": ["glutes", "belly", "muscle_gain", "fat_loss"], "common_options": [{"name": "¼ pollo con arroz y ensalada", "calories": 620, "protein_g": 42, "carbs_g": 65, "fat_g": 18, "arju_tip": "Buena opción para cualquier objetivo. Pide ensalada en vez de papas fritas si estás en reducción."}, {"name": "Pechuga asada con papa y ensalada", "calories": 520, "protein_g": 48, "carbs_g": 45, "fat_g": 10, "arju_tip": "Alta proteína, bajo en grasa. Ideal para reto pancita o reducción de grasa."}]}, {"id": "menu-ejecutivo", "name": "Menú ejecutivo", "emoji": "🍽️", "category": "comida_colombiana", "goal_fit": ["glutes", "belly", "muscle_gain", "fat_loss"], "common_options": [{"name": "Sopa + seco con proteína + jugo natural", "calories": 750, "protein_g": 38, "carbs_g": 85, "fat_g": 20, "arju_tip": "Elige proteína magra (pollo, pescado) y controla el jugo azucarado. Es una comida completa."}, {"name": "Solo el seco: carne/pollo + arroz + ensalada", "calories": 580, "protein_g": 40, "carbs_g": 55, "fat_g": 16, "arju_tip": "Sin sopa: menor volumen y calorías. Bueno si tu objetivo es reducción."}]}, {"id": "hamburguesa", "name": "Hamburguesa", "emoji": "🍔", "category": "comida_rapida", "goal_fit": ["glutes", "muscle_gain"], "common_options": [{"name": "Hamburguesa simple con proteína", "calories": 650, "protein_g": 32, "carbs_g": 55, "fat_g": 28, "arju_tip": "Elige proteína sin duplicar. Acompañante de ensalada > papas fritas si estás en déficit."}, {"name": "Hamburguesa doble con ensalada", "calories": 780, "protein_g": 48, "carbs_g": 45, "fat_g": 32, "arju_tip": "Más proteína. Buena para masa muscular. Compensa con comida ligera en la cena."}]}, {"id": "sushi", "name": "Sushi", "emoji": "🍱", "category": "comida_japonesa", "goal_fit": ["belly", "fat_loss", "glutes"], "common_options": [{"name": "8-10 piezas de nigiri/maki de salmón o atún", "calories": 420, "protein_g": 26, "carbs_g": 55, "fat_g": 8, "arju_tip": "Una de las mejores opciones para comer fuera. Proteína y carbohidratos equilibrados."}, {"name": "Combo rolls 12 piezas", "calories": 580, "protein_g": 22, "carbs_g": 80, "fat_g": 14, "arju_tip": "Cuidado con rolls fritos o con salsas cremosas. El sushi simple es mejor opción."}]}, {"id": "ensalada-proteina", "name": "Ensalada con proteína", "emoji": "🥗", "category": "saludable", "goal_fit": ["belly", "fat_loss", "glutes"], "common_options": [{"name": "Ensalada grande con pollo/atún + aceite de oliva", "calories": 380, "protein_g": 30, "carbs_g": 20, "fat_g": 16, "arju_tip": "Excelente opción para cualquier objetivo. Pide la salsa aparte para controlar la cantidad."}, {"name": "Ensalada con aguacate y huevo", "calories": 450, "protein_g": 22, "carbs_g": 18, "fat_g": 28, "arju_tip": "Alta en grasas buenas. Muy saciante. Buena para reto pancita."}]}, {"id": "poke-bowl", "name": "Poke Bowl", "emoji": "🥣", "category": "saludable", "goal_fit": ["glutes", "belly", "fat_loss", "muscle_gain"], "common_options": [{"name": "Bowl base con proteína + arroz + vegetales", "calories": 550, "protein_g": 32, "carbs_g": 65, "fat_g": 14, "arju_tip": "Una de las mejores opciones para comer fuera. Proteína + carbos + vegetales en un bowl."}, {"name": "Bowl sin arroz (extra vegetales)", "calories": 380, "protein_g": 28, "carbs_g": 30, "fat_g": 16, "arju_tip": "Para reducción grasa o si ya comiste arroz antes. Más saciante con menos calorías."}]}, {"id": "arepa-rellena", "name": "Arepa rellena", "emoji": "🫓", "category": "comida_colombiana", "goal_fit": ["glutes", "belly", "muscle_gain"], "common_options": [{"name": "Arepa rellena de pollo desmechado", "calories": 480, "protein_g": 30, "carbs_g": 55, "fat_g": 12, "arju_tip": "Clásico colombiano con buena proteína. Complementa con agua en vez de jugos azucarados."}, {"name": "Arepa rellena de queso + huevo", "calories": 420, "protein_g": 20, "carbs_g": 50, "fat_g": 16, "arju_tip": "Buena opción para desayuno o merienda. Rápida y suficientemente nutritiva."}]}, {"id": "comida-mexicana", "name": "Comida mexicana", "emoji": "🌮", "category": "comida_internacional", "goal_fit": ["glutes", "muscle_gain", "belly"], "common_options": [{"name": "2 tacos de pollo/res con guacamole", "calories": 480, "protein_g": 28, "carbs_g": 42, "fat_g": 20, "arju_tip": "Pide tacos de maíz y elige proteína magra. El guacamole es grasa buena."}, {"name": "Bowl de burrito sin tortilla", "calories": 520, "protein_g": 36, "carbs_g": 55, "fat_g": 16, "arju_tip": "Sin la tortilla ahorras calorías y carbohidratos. Más proteína en un bowl."}]}, {"id": "desayuno-fuera", "name": "Desayuno fuera", "emoji": "🍳", "category": "desayuno", "goal_fit": ["glutes", "belly", "muscle_gain", "fat_loss"], "common_options": [{"name": "Huevos revueltos + arepa + jugo natural", "calories": 490, "protein_g": 26, "carbs_g": 50, "fat_g": 18, "arju_tip": "Clásico colombiano. Suficiente proteína para empezar. Elige jugo natural sin azúcar adicional."}, {"name": "Tostadas integrales con huevo y aguacate", "calories": 420, "protein_g": 18, "carbs_g": 40, "fat_g": 22, "arju_tip": "Moderno, equilibrado, saciante. Buen desayuno para cualquier objetivo."}]}, {"id": "comida-rapida", "name": "Comida rápida", "emoji": "🍟", "category": "comida_rapida", "goal_fit": ["glutes", "muscle_gain"], "common_options": [{"name": "Pollo a la plancha + ensalada (no frito)", "calories": 520, "protein_g": 38, "carbs_g": 40, "fat_g": 16, "arju_tip": "En comida rápida, elige a la plancha siempre. El frito duplica calorías con menos proteína."}, {"name": "Wrap de pollo con vegetales", "calories": 480, "protein_g": 30, "carbs_g": 48, "fat_g": 14, "arju_tip": "Mejor opción disponible en la mayoría de cadenas. Evita papas fritas si es posible."}]}, {"id": "el-corral", "name": "El Corral", "emoji": "🍔", "category": "comida_rapida", "goal_fit": ["glutes", "muscle_gain"], "common_options": [{"name": "Pechuga plancha en lechuga (sin pan)", "calories": 280, "protein_g": 31, "carbs_g": 4, "fat_g": 9, "arju_tip": "Pide la hamburguesa en lechuga. Sin pan ahorras ~200 kcal."}, {"name": "Ensalada con pollo plancha", "calories": 300, "protein_g": 28, "carbs_g": 12, "fat_g": 10, "arju_tip": "Mejor opción aquí. Sin salsas extras."}]}, {"id": "subway", "name": "Subway", "emoji": "🥖", "category": "comida_rapida", "goal_fit": ["glutes", "belly", "muscle_gain", "fat_loss"], "common_options": [{"name": "Sub de pollo 15cm en pan integral", "calories": 320, "protein_g": 24, "carbs_g": 38, "fat_g": 6, "arju_tip": "Pan integral + pollo + vegetales. Sin mayonesa. De las mejores en comida rápida."}, {"name": "Ensalada de atún", "calories": 220, "protein_g": 20, "carbs_g": 8, "fat_g": 9, "arju_tip": "Sin carbohidrato. Alta proteína. Ideal en reducción de grasa."}]}, {"id": "frisby", "name": "Frisby", "emoji": "🍗", "category": "comida_rapida", "goal_fit": ["glutes", "muscle_gain"], "common_options": [{"name": "Pechuga a la plancha SIN salsa", "calories": 300, "protein_g": 35, "carbs_g": 2, "fat_g": 8, "arju_tip": "Solo la pechuga plancha. Evita todo lo apanado. 90% de Frisby es frito."}]}, {"id": "sandwich-qbano", "name": "Sandwich Qbano", "emoji": "🥪", "category": "comida_rapida", "goal_fit": ["glutes", "belly", "muscle_gain"], "common_options": [{"name": "Pechuga en pan integral con mostaza", "calories": 380, "protein_g": 28, "carbs_g": 42, "fat_g": 6, "arju_tip": "Usa mostaza en vez de mayonesa. Reemplaza la papa por ensalada."}, {"name": "Atún con aguacate", "calories": 320, "protein_g": 22, "carbs_g": 30, "fat_g": 10, "arju_tip": "Grasas buenas del aguacate. Proteína del atún. Buena para cualquier objetivo."}]}, {"id": "domicilio-pollo", "name": "Pollo a domicilio", "emoji": "🛵", "category": "comida_colombiana", "goal_fit": ["glutes", "belly", "muscle_gain", "fat_loss"], "common_options": [{"name": "Pechuga asada + arroz + ensalada", "calories": 520, "protein_g": 48, "carbs_g": 45, "fat_g": 10, "arju_tip": "El combo más limpio a domicilio. Ensalada en vez de papas. Pollo asado, no apanado."}, {"name": "Pechuga + brócoli al vapor", "calories": 380, "protein_g": 45, "carbs_g": 15, "fat_g": 9, "arju_tip": "Ideal en reducción. Proteína alta, carbos bajos."}]}, {"id": "vegetariano", "name": "Restaurante vegetariano", "emoji": "🌿", "category": "saludable", "goal_fit": ["belly", "fat_loss", "glutes"], "common_options": [{"name": "Bandeja vegetariana con proteína de soya", "calories": 480, "protein_g": 22, "carbs_g": 62, "fat_g": 12, "arju_tip": "Agrega huevo o queso para subir proteína. Los carbos son de buena calidad aquí."}, {"name": "Sopa + ensalada + jugo natural sin azúcar", "calories": 320, "protein_g": 14, "carbs_g": 48, "fat_g": 6, "arju_tip": "Opción ligera. Pide el jugo sin azúcar."}]}];
var _city='cali',_cat='all';
var _ug=localStorage.getItem('af-selected-reto')||localStorage.getItem('af-product-type')||'glutes';
var GM={gluteos:'glutes',pancita:'belly',masa:'muscle_gain',definicion:'fat_loss',
  challenge_glutes:'glutes',challenge_belly:'belly',custom_muscle_gain:'muscle_gain',
  custom_fat_loss:'fat_loss',custom_plan:'muscle_gain',glutes:'glutes',belly:'belly'};
var goal=GM[_ug]||'glutes';
var TIPS={
  glutes:'Para glúteos: mínimo 30g de proteína por comida. Pollo, carne, huevo. El carbo es tu aliado.',
  belly:'Para bajar pancita: proteína magra, sin fritos, sin salsas. Ensalada siempre de acompañante.',
  muscle_gain:'En masa: no te preocupes por el carbo. Asegura mínimo 40g proteína y come completo.',
  fat_loss:'En definición: proteína primero, carbos moderados, cero fritos. Agua en vez de jugo.',
};
function filter(){return D.filter(function(r){return _cat==='all'||r.category===_cat;});}
function render(){
  var tip=document.getElementById('fuera-arju-tip');
  if(tip)tip.textContent=TIPS[goal]||'Prioriza proteína siempre.';
  var list=document.getElementById('fuera-list');
  if(!list)return;
  var fd=filter();
  if(!fd.length){list.innerHTML='<div style="text-align:center;padding:32px;color:rgba(255,255,255,.25);font-size:13px">No hay opciones aún 🌱</div>';return;}
  var CL={comida_colombiana:'🇨🇴 Colombiano',saludable:'🥗 Saludable',comida_rapida:'⚡ Rápido',
    desayuno:'☀️ Desayuno',comida_japonesa:'🍱 Japonés',comida_internacional:'🌍 Internacional'};
  list.innerHTML=fd.map(function(r,i){
    var ok=r.goal_fit&&r.goal_fit.includes(goal);
    var border=ok?'border:1.5px solid rgba(124,58,237,.35)':'border:1px solid rgba(255,255,255,.07)';
    var opts=r.common_options.map(function(o,oi){
      var sn=(o.name||'').replace(/'/g,"\'");
      return '<div class="f-opt"><div class="f-opt-name">'+(o.name||'')+'</div>'+
        '<div class="f-macros"><span class="f-cal">🔥 '+(o.calories||0)+' kcal</span>'+
        '<span class="f-prot">💪 '+(o.protein_g||0)+'g prot</span></div>'+
        (o.arju_tip?'<div class="f-tip">💜 '+o.arju_tip+'</div>':'')+
        '<button class="f-reg" onclick="fReg(\''+sn+'\','+(o.calories||0)+','+(o.protein_g||0)+')">+ Registrar</button></div>';
    }).join('');
    return '<div class="f-card" style="'+border+'">'+
      '<div class="f-top" onclick="fToggle('+i+')">'+
        '<div class="f-ico">'+(r.emoji||'🍽️')+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div class="f-name">'+r.name+'</div>'+
          '<span class="f-badge">'+(CL[r.category]||r.category)+'</span>'+
          (ok?'<div style="font-size:10px;color:#4ade80;margin-top:3px;font-weight:700">✓ Ideal para tu objetivo</div>':'')+'</div>'+
        '<span id="fch'+i+'" style="font-size:18px;color:rgba(255,255,255,.2)">›</span></div>'+
      '<div id="fb'+i+'" class="f-body">'+opts+
      '<div style="display:flex;gap:8px;padding:8px 16px 14px;border-top:1px solid rgba(255,255,255,.06)">'+
        '<a href="https://www.rappi.com.co/restaurantes?query='+encodeURIComponent(r.name)+'" target="_blank" '+
          'style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:9px 0;border-radius:10px;'+
          'background:rgba(255,106,0,.1);border:1px solid rgba(255,106,0,.25);text-decoration:none;'+
          'color:#fb923c;font-family:Outfit,sans-serif;font-size:11px;font-weight:700">'+
          '🛵 Rappi</a>'+
        '<a href="https://food.didiglobal.com/col/home?keyword='+encodeURIComponent(r.name)+'" target="_blank" '+
          'style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:9px 0;border-radius:10px;'+
          'background:rgba(255,200,0,.08);border:1px solid rgba(255,200,0,.2);text-decoration:none;'+
          'color:#fcd34d;font-family:Outfit,sans-serif;font-size:11px;font-weight:700">'+
          '🟡 DiDi Food</a>'+
      '</div>'+'</div></div>';
  }).join('');
}
window.fToggle=function(i){var b=document.getElementById('fb'+i),c=document.getElementById('fch'+i);
  if(!b)return;var o=b.style.display!=='none';b.style.display=o?'none':'block';if(c)c.textContent=o?'›':'⌄';};
window.fueraSelectCity=function(c){_city=c;localStorage.setItem('af-fuera-city',c);
  document.querySelectorAll('[id^="fc-"]').forEach(function(b){b.classList.remove('act-city');});
  var btn=document.getElementById('fc-'+c);if(btn)btn.classList.add('act-city');render();};
window.fueraSelectCat=function(c){_cat=c;
  document.querySelectorAll('[id^="fcat-"]').forEach(function(b){b.classList.remove('act-cat');});
  var btn=document.getElementById('fcat-'+c);if(btn)btn.classList.add('act-cat');render();};
window.fReg=function(name,cal,prot){
  var h=new Date().getHours();
  var m=h<11?'desayuno':h<15?'almuerzo':h<20?'cena':'snack';
  if(typeof saveFood==='function')saveFood(name,cal,prot,0,m);
  var t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:calc(90px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:9000;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);border-radius:14px;padding:10px 18px;font-size:13px;font-weight:600;color:#34d399;white-space:nowrap;font-family:Outfit,sans-serif';
  t.textContent='✅ '+name.slice(0,28)+' registrado';document.body.appendChild(t);setTimeout(function(){t.remove();},2500);
};
var _os=window.sw;
window.sw=function(id){if(_os)_os(id);if(id==='fuera')setTimeout(render,80);};
setTimeout(function(){var tc=document.getElementById('tc-fuera');if(tc&&getComputedStyle(tc).display!=='none')render();},600);
})();
