// ═══════════════════════════════════════════════════════
// ArjunaFit — Base Nutricional Local LATAM
// Fuente: USDA + ICBF Colombia + valores estándar
// ═══════════════════════════════════════════════════════
(function () {
'use strict';

const LOCAL_DB = [
  // ── Proteínas ──────────────────────────────────────────
  { id:'huevo',          aliases:['huevos','huevo frito','huevo cocido','huevo pericos','huevos revueltos'], name:'Huevo',              cal:155, prot:13,  carb:1,  fat:11, srv:60,  unit:'unidad' },
  { id:'pechuga-pollo',  aliases:['pollo','pechuga','pollo asado','pollo a la plancha'],                  name:'Pechuga de pollo',   cal:165, prot:31,  carb:0,  fat:3,  srv:100, unit:'g' },
  { id:'carne-molida',   aliases:['carne','carne res','res molida'],                                       name:'Carne molida',       cal:250, prot:26,  carb:0,  fat:15, srv:100, unit:'g' },
  { id:'atun',           aliases:['atun en lata','atun agua'],                                             name:'Atún en lata',       cal:116, prot:25,  carb:0,  fat:1,  srv:85,  unit:'g' },
  { id:'salmon',         aliases:['salmon'],                                                                name:'Salmón',             cal:208, prot:20,  carb:0,  fat:13, srv:100, unit:'g' },
  { id:'frijoles',       aliases:['frijoles negros','frijoles rojos','frijoles antioqueños'],              name:'Frijoles',           cal:130, prot:8,   carb:23, fat:0,  srv:100, unit:'g' },
  { id:'lentejas',       aliases:['sopa lentejas','lentejas cocidas'],                                     name:'Lentejas',           cal:116, prot:9,   carb:20, fat:0,  srv:100, unit:'g' },
  { id:'yogur-griego',   aliases:['yogur','yoghurt','yogurt griego'],                                      name:'Yogur griego',       cal:100, prot:17,  carb:6,  fat:0,  srv:150, unit:'g' },
  // ── Carbohidratos ──────────────────────────────────────
  { id:'arroz',          aliases:['arroz blanco','arroz cocido'],                                          name:'Arroz blanco',       cal:130, prot:2,   carb:28, fat:0,  srv:100, unit:'g' },
  { id:'arepa',          aliases:['arepa blanca','arepa de choclo','arepa boyacense'],                     name:'Arepa',              cal:200, prot:4,   carb:40, fat:2,  srv:80,  unit:'unidad' },
  { id:'papa',           aliases:['papas','papa cocida','papa hervida'],                                   name:'Papa',               cal:87,  prot:2,   carb:20, fat:0,  srv:100, unit:'g' },
  { id:'platano',        aliases:['plátano','banano','banana','plátano maduro','plátano verde'],           name:'Plátano',            cal:89,  prot:1,   carb:23, fat:0,  srv:120, unit:'unidad' },
  { id:'yuca',           aliases:['yuca cocida'],                                                          name:'Yuca',               cal:160, prot:1,   carb:38, fat:0,  srv:100, unit:'g' },
  { id:'avena',          aliases:['avena en hojuelas','avena integral','porridge'],                        name:'Avena',              cal:370, prot:13,  carb:66, fat:7,  srv:40,  unit:'g' },
  { id:'pan-integral',   aliases:['pan','pan tajado','pan blanco'],                                        name:'Pan tajado',         cal:250, prot:9,   carb:48, fat:3,  srv:30,  unit:'tajada' },
  // ── Lácteos ────────────────────────────────────────────
  { id:'queso-campesino',aliases:['queso','queso blanco','queso costeño','queso fresco'],                  name:'Queso campesino',    cal:300, prot:20,  carb:2,  fat:23, srv:30,  unit:'g' },
  { id:'leche',          aliases:['leche entera','leche descremada','leche deslactosada'],                 name:'Leche',              cal:61,  prot:3,   carb:5,  fat:3,  srv:240, unit:'ml' },
  // ── Verduras ───────────────────────────────────────────
  { id:'brocoli',        aliases:['brócoli','brocoli cocido'],                                             name:'Brócoli',            cal:35,  prot:2,   carb:7,  fat:0,  srv:80,  unit:'g' },
  { id:'tomate',         aliases:['tomate'],                                                                name:'Tomate',             cal:18,  prot:1,   carb:4,  fat:0,  srv:100, unit:'g' },
  { id:'zanahoria',      aliases:['zanahoria cocida','zanahoria cruda'],                                   name:'Zanahoria',          cal:41,  prot:1,   carb:10, fat:0,  srv:80,  unit:'g' },
  { id:'espinaca',       aliases:['espinacas','lechuga'],                                                  name:'Espinaca',           cal:23,  prot:3,   carb:4,  fat:0,  srv:80,  unit:'g' },
  // ── Frutas ─────────────────────────────────────────────
  { id:'aguacate',       aliases:['aguacate hass','palta'],                                                name:'Aguacate',           cal:160, prot:2,   carb:9,  fat:15, srv:75,  unit:'unidad' },
  { id:'mango',          aliases:['mango tommy','mango verde'],                                            name:'Mango',              cal:60,  prot:1,   carb:15, fat:0,  srv:100, unit:'g' },
  { id:'guayaba',        aliases:['guayaba'],                                                              name:'Guayaba',            cal:68,  prot:2,   carb:14, fat:1,  srv:80,  unit:'g' },
  { id:'papaya',         aliases:['papaya'],                                                               name:'Papaya',             cal:43,  prot:1,   carb:11, fat:0,  srv:100, unit:'g' },
  // ── Snacks / extras ─────────────────────────────────────
  { id:'mani',           aliases:['maní','cacahuate','mantequilla de maní','crema de maní'],               name:'Maní',               cal:567, prot:26,  carb:16, fat:49, srv:30,  unit:'g' },
  { id:'nueces',         aliases:['nueces','almendras','mix frutos secos'],                                name:'Nueces',             cal:654, prot:15,  carb:14, fat:65, srv:28,  unit:'g' },
  { id:'pan-de-bono',    aliases:['pan de bono','pandebono'],                                              name:'Pan de bono',        cal:320, prot:8,   carb:45, fat:12, srv:50,  unit:'unidad' },
  { id:'chocolate',      aliases:['chocolate negro','cocoa'],                                              name:'Chocolate negro',    cal:550, prot:5,   carb:60, fat:31, srv:30,  unit:'g' },
  // ── Bebidas ────────────────────────────────────────────
  { id:'aguapanela',     aliases:['agua de panela','aguapanela'],                                          name:'Aguapanela',         cal:60,  prot:0,   carb:15, fat:0,  srv:250, unit:'ml' },
  { id:'cafe',           aliases:['café','café negro','tinto'],                                            name:'Café negro',         cal:2,   prot:0,   carb:0,  fat:0,  srv:240, unit:'ml' },
];

// ── Text parser ──────────────────────────────────────────
// "2 huevos y 1 arepa" → [{food, qty, unit}]
function parseText(text) {
  const out = [];
  // Pattern: optional number + optional unit + food name
  const parts = text.toLowerCase()
    .split(/[,y\+\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    const numMatch = part.match(/^(\d+(?:\.\d+)?)\s*(?:g|ml|unidades?|porciones?|tazas?|cdas?\.?)?\s*/);
    const qty   = numMatch ? parseFloat(numMatch[1]) : 1;
    const clean = part.replace(/^\d+(?:\.\d+)?\s*(?:g|ml|unidades?|porciones?|tazas?|cdas?\.?)?\s*/, '').trim();
    const food  = resolveFood(clean);
    if (food) out.push({ food, qty, unit: food.unit });
  }
  return out;
}

// ── Resolver ─────────────────────────────────────────────
function resolveFood(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  // Exact ID match
  let hit = LOCAL_DB.find(f => f.id === q);
  if (hit) return hit;

  // Alias match
  hit = LOCAL_DB.find(f =>
    f.aliases.some(a => q.includes(a) || a.includes(q))
  );
  if (hit) return hit;

  // Name fuzzy match
  hit = LOCAL_DB.find(f =>
    f.name.toLowerCase().includes(q) || q.includes(f.name.toLowerCase().split(' ')[0])
  );
  return hit || null;
}

// ── Macro calculator ─────────────────────────────────────
function calcMacros(food, qty = 1) {
  // qty is number of servings (default: 1 serving)
  const factor = qty;
  return {
    cal:  Math.round(food.cal  * factor),
    prot: Math.round(food.prot * factor),
    carb: Math.round(food.carb * factor),
    fat:  Math.round(food.fat  * factor),
  };
}

// ── Quick search (for search UI) ─────────────────────────
function searchLocal(query, limit = 6) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return LOCAL_DB
    .filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.aliases.some(a => a.includes(q) || q.includes(a.split(' ')[0]))
    )
    .slice(0, limit);
}

// ── Normalizer — unified resolver ────────────────────────
function resolveFoodNutrition(input, qty = 1) {
  const food = resolveFood(input);
  if (!food) return null;
  const m = calcMacros(food, qty);
  return {
    food_name:    input,
    matched_name: food.name,
    source:       'local_latam',
    quantity:     qty,
    unit:         food.unit,
    grams:        food.srv * qty,
    calories:     m.cal,
    protein_g:    m.prot,
    carbs_g:      m.carb,
    fat_g:        m.fat,
    confidence:   food.aliases.some(a => a.includes(input.toLowerCase())) ? 0.95 : 0.80,
  };
}

// ── getDailyNutritionSummary — reads from localStorage ──────────
  function getDailyNutritionSummary(dateKey) {
    var key = 'af-food-' + (dateKey || new Date().toISOString().split('T')[0]);
    var entries = [];
    try { entries = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
    var totCal = 0, totProt = 0, totCarb = 0, totFat = 0;
    entries.forEach(function(e) {
      var c = e.cal || Math.round((e.prot||0)*4 + (e.carb||0)*4 + (e.fat||0)*9);
      totCal += c; totProt += (e.prot||0); totCarb += (e.carb||0); totFat += (e.fat||0);
    });
    return { calories:Math.round(totCal), protein:Math.round(totProt), carbs:Math.round(totCarb), fat:Math.round(totFat), meals_logged:entries.length, entries };
  }

  function toGrams(quantity, unit, foodItem) {
    var srv = foodItem ? (foodItem.srv || 100) : 100;
    var u = (unit || '').toLowerCase();
    if (u === 'g' || u === 'gramos' || u === 'gr') return quantity;
    if (u === 'kg') return quantity * 1000;
    if (u === 'taza') return quantity * 240;
    if (u === 'cucharada') return quantity * 15;
    if (u === 'scoop') return quantity * (foodItem && foodItem.srv || 30);
    return quantity * srv;
  }

  function calculateMacros(foodItem, quantity, unit) {
    if (!foodItem) return { cal:0, prot:0, carb:0, fat:0 };
    var grams = toGrams(quantity || 1, unit || (foodItem && foodItem.unit) || 'unidad', foodItem);
    var factor = grams / 100;
    return {
      cal:  Math.round((foodItem.cal||0)  * factor),
      prot: Math.round((foodItem.prot||0) * factor),
      carb: Math.round((foodItem.carb||0) * factor),
      fat:  Math.round((foodItem.fat||0)  * factor),
    };
  }

  // ── Expose ───────────────────────────────────────────────
window.FoodDB = { LOCAL_DB, resolveFood, resolveFood, parseText, calcMacros, searchLocal, resolveFoodNutrition, getDailyNutritionSummary, calculateMacros, toGrams };
window.AF_FoodDB = window.FoodDB; // alias
console.log(`[FoodDB] ${LOCAL_DB.length} alimentos LATAM listos`);

})();
