'use strict';
/**
 * bodygraph.js v16
 * module.exports = { generateBodygraph }
 */

const PC = {
  bg:'#FAF4F1', cD:'#90734B', cU:'#EEE3D4', str:'#BEA582',
  chP:'#30302E', chR:'#A62B28',
  gG:'#EDD5A0', gGT:'#7A5020', gGS:'#C8A060',
  gW:'#FFFFFF',  gWT:'#A08060', gWS:'#C8B090',
  bS:'#D4C0A0',
};
const ZOD_COL = '#C8A060';
const T_J34 = 0.308;
const W = 900, H = 1010, CX = 450;

const THICK_P = new Set(['Moon','Mars','Venus']);
const MED_P   = new Set(['Sun','Earth','NorthNode','SouthNode','Mercury']);

const PS = {
  Sun:'☉', Earth:'⊕', NorthNode:'☊', 'North Node':'☊',
  SouthNode:'☋', 'South Node':'☋', Moon:'☽', Mercury:'☿',
  Venus:'♀', Mars:'♂', Jupiter:'♃', Saturn:'♄',
  Uranus:'♅', Neptune:'♆', Pluto:'♇',
};

// ── Джакстапозиция: таблица Рейв И-Цзин ─────────────────────
const ICHING = {"1":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Mars","fall":"Moon"},"4":{"ex":"Earth","fall":"Neptune"},"5":{"ex":"Mars","fall":"Uranus"},"6":{"ex":"Moon","fall":"Sun"}},"2":{"1":{"ex":"Venus","fall":"Mars"},"2":{"ex":"Moon","fall":"Pluto"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Venus","fall":"Saturn"},"6":{"ex":"Earth","fall":"Mercury"}},"3":{"1":{"ex":"Mercury","fall":"Jupiter"},"2":{"ex":"Moon","fall":"Mars"},"3":{"ex":"Mars","fall":"Neptune"},"4":{"ex":"Sun","fall":"Saturn"},"5":{"ex":"Venus","fall":"Mercury"},"6":{"ex":"Saturn","fall":"Moon"}},"4":{"1":{"ex":"Jupiter","fall":"Earth"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Mercury","fall":"Jupiter"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Mars","fall":"Neptune"},"6":{"ex":"Saturn","fall":"Venus"}},"5":{"1":{"ex":"Mars","fall":"Earth"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Moon","fall":"Jupiter"},"4":{"ex":"Sun","fall":"Saturn"},"5":{"ex":"Earth","fall":"Neptune"},"6":{"ex":"Saturn","fall":"Mars"}},"6":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Mercury"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Mercury","fall":"Pluto"},"5":{"ex":"Venus","fall":"Mars"},"6":{"ex":"Saturn","fall":"Moon"}},"7":{"1":{"ex":"Moon","fall":"Mars"},"2":{"ex":"Jupiter","fall":"Saturn"},"3":{"ex":"Venus","fall":"Mercury"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Mars","fall":"Moon"},"6":{"ex":"Neptune","fall":"Saturn"}},"8":{"1":{"ex":"Sun","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Mercury","fall":"Jupiter"},"4":{"ex":"Moon","fall":"Pluto"},"5":{"ex":"Mars","fall":"Venus"},"6":{"ex":"Saturn","fall":"Neptune"}},"9":{"1":{"ex":"Venus","fall":"Mars"},"2":{"ex":"Jupiter","fall":"Mercury"},"3":{"ex":"Moon","fall":"Saturn"},"4":{"ex":"Sun","fall":"Pluto"},"5":{"ex":"Mars","fall":"Neptune"},"6":{"ex":"Saturn","fall":"Moon"}},"10":{"1":{"ex":"Moon","fall":"Jupiter"},"3":{"ex":"Mars","fall":"Mercury"},"4":{"ex":"Sun","fall":"Saturn"},"5":{"ex":"Neptune","fall":"Mercury"},"6":{"ex":"Venus","fall":"Mars"}},"11":{"1":{"ex":"Jupiter","fall":"Mercury"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Venus","fall":"Mars"},"4":{"ex":"Mercury","fall":"Jupiter"},"5":{"ex":"Sun","fall":"Uranus"},"6":{"ex":"Saturn","fall":"Moon"}},"12":{"1":{"ex":"Earth","fall":"Neptune"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Mars","fall":"Moon"},"4":{"ex":"Venus","fall":"Mercury"},"5":{"ex":"Sun","fall":"Mars"},"6":{"ex":"Saturn","fall":"Jupiter"}},"13":{"1":{"ex":"Mars","fall":"Venus"},"2":{"ex":"Venus","fall":"Saturn"},"3":{"ex":"Moon","fall":"Jupiter"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Mercury","fall":"Neptune"},"6":{"ex":"Moon","fall":"Mars"}},"14":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Mercury"},"3":{"ex":"Neptune","fall":"Saturn"},"4":{"ex":"Sun","fall":"Pluto"},"5":{"ex":"Venus","fall":"Mars"},"6":{"ex":"Mars","fall":"Moon"}},"15":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Sun","fall":"Pluto"},"5":{"ex":"Mars","fall":"Saturn"},"6":{"ex":"Neptune","fall":"Moon"}},"16":{"1":{"ex":"Venus","fall":"Mercury"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Mars","fall":"Jupiter"},"4":{"ex":"Jupiter","fall":"Saturn"},"5":{"ex":"Sun","fall":"Uranus"},"6":{"ex":"Saturn","fall":"Neptune"}},"17":{"1":{"ex":"Jupiter","fall":"Mercury"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Moon","fall":"Saturn"},"4":{"ex":"Mercury","fall":"Pluto"},"5":{"ex":"Sun","fall":"Uranus"},"6":{"ex":"Mars","fall":"Neptune"}},"18":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Neptune"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Saturn","fall":"Moon"},"6":{"ex":"Venus","fall":"Mercury"}},"19":{"1":{"ex":"Venus","fall":"Saturn"},"2":{"ex":"Moon","fall":"Mars"},"3":{"ex":"Mars","fall":"Neptune"},"4":{"ex":"Sun","fall":"Pluto"},"5":{"ex":"Saturn","fall":"Mercury"},"6":{"ex":"Neptune","fall":"Mars"}},"20":{"1":{"ex":"Sun","fall":"Saturn"},"2":{"ex":"Moon","fall":"Mars"},"3":{"ex":"Venus","fall":"Mercury"},"4":{"ex":"Mars","fall":"Moon"},"5":{"ex":"Mercury","fall":"Jupiter"},"6":{"ex":"Saturn","fall":"Neptune"}},"21":{"1":{"ex":"Mars","fall":"Venus"},"2":{"ex":"Jupiter","fall":"Saturn"},"3":{"ex":"Sun","fall":"Uranus"},"4":{"ex":"Moon","fall":"Pluto"},"5":{"ex":"Venus","fall":"Mercury"},"6":{"ex":"Saturn","fall":"Moon"}},"22":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Sun","fall":"Pluto"},"5":{"ex":"Neptune","fall":"Saturn"},"6":{"ex":"Mars","fall":"Moon"}},"23":{"1":{"ex":"Mercury","fall":"Jupiter"},"2":{"ex":"Sun","fall":"Saturn"},"3":{"ex":"Venus","fall":"Mars"},"4":{"ex":"Saturn","fall":"Earth"},"5":{"ex":"Mars","fall":"Mercury"},"6":{"ex":"Saturn","fall":"Neptune"}},"24":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Mercury","fall":"Jupiter"},"3":{"ex":"Sun","fall":"Uranus"},"4":{"ex":"Venus","fall":"Mars"},"5":{"ex":"Saturn","fall":"Moon"},"6":{"ex":"Mars","fall":"Neptune"}},"25":{"1":{"ex":"Neptune","fall":"Saturn"},"2":{"ex":"Sun","fall":"Pluto"},"3":{"ex":"Moon","fall":"Mars"},"4":{"ex":"Venus","fall":"Mercury"},"5":{"ex":"Jupiter","fall":"Saturn"},"6":{"ex":"Mars","fall":"Moon"}},"26":{"1":{"ex":"Saturn","fall":"Neptune"},"2":{"ex":"Mars","fall":"Moon"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Venus","fall":"Saturn"},"5":{"ex":"Mars","fall":"Uranus"},"6":{"ex":"Moon","fall":"Saturn"}},"27":{"1":{"ex":"Venus","fall":"Saturn"},"2":{"ex":"Moon","fall":"Mars"},"3":{"ex":"Mars","fall":"Neptune"},"4":{"ex":"Jupiter","fall":"Saturn"},"5":{"ex":"Sun","fall":"Pluto"},"6":{"ex":"Saturn","fall":"Moon"}},"28":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Mars","fall":"Venus"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Uranus","fall":"Neptune"},"5":{"ex":"Sun","fall":"Pluto"},"6":{"ex":"Neptune","fall":"Saturn"}},"29":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Mars","fall":"Moon"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Venus","fall":"Mars"},"5":{"ex":"Sun","fall":"Uranus"},"6":{"ex":"Saturn","fall":"Neptune"}},"30":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Sun","fall":"Pluto"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Venus","fall":"Mercury"},"5":{"ex":"Jupiter","fall":"Saturn"},"6":{"ex":"Saturn","fall":"Moon"}},"31":{"1":{"ex":"Mars","fall":"Neptune"},"2":{"ex":"Sun","fall":"Saturn"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Moon","fall":"Pluto"},"5":{"ex":"Mercury","fall":"Mars"},"6":{"ex":"Saturn","fall":"Moon"}},"32":{"1":{"ex":"Saturn","fall":"Moon"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Neptune","fall":"Mercury"},"5":{"ex":"Jupiter","fall":"Uranus"},"6":{"ex":"Venus","fall":"Mars"}},"33":{"1":{"ex":"Sun","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Mercury"},"3":{"ex":"Moon","fall":"Pluto"},"4":{"ex":"Venus","fall":"Mars"},"5":{"ex":"Mars","fall":"Moon"},"6":{"ex":"Neptune","fall":"Saturn"}},"34":{"1":{"ex":"Mars","fall":"Moon"},"2":{"ex":"Sun","fall":"Saturn"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Venus","fall":"Mars"},"5":{"ex":"Saturn","fall":"Neptune"},"6":{"ex":"Moon","fall":"Pluto"}},"35":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mercury"},"3":{"ex":"Sun","fall":"Pluto"},"4":{"ex":"Mars","fall":"Moon"},"5":{"ex":"Jupiter","fall":"Saturn"},"6":{"ex":"Mercury","fall":"Neptune"}},"36":{"1":{"ex":"Saturn","fall":"Moon"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Venus","fall":"Mercury"},"6":{"ex":"Jupiter","fall":"Neptune"}},"37":{"1":{"ex":"Moon","fall":"Mars"},"2":{"ex":"Venus","fall":"Saturn"},"3":{"ex":"Sun","fall":"Pluto"},"4":{"ex":"Jupiter","fall":"Mercury"},"5":{"ex":"Mars","fall":"Moon"},"6":{"ex":"Saturn","fall":"Neptune"}},"38":{"1":{"ex":"Mars","fall":"Neptune"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Venus","fall":"Mars"},"5":{"ex":"Sun","fall":"Uranus"},"6":{"ex":"Saturn","fall":"Moon"}},"39":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Neptune"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Venus","fall":"Mercury"},"5":{"ex":"Sun","fall":"Pluto"},"6":{"ex":"Mercury","fall":"Mars"}},"40":{"1":{"ex":"Saturn","fall":"Moon"},"2":{"ex":"Mars","fall":"Venus"},"3":{"ex":"Sun","fall":"Saturn"},"4":{"ex":"Moon","fall":"Jupiter"},"5":{"ex":"Venus","fall":"Mars"},"6":{"ex":"Jupiter","fall":"Mercury"}},"41":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Mars","fall":"Moon"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Jupiter","fall":"Saturn"},"6":{"ex":"Neptune","fall":"Mercury"}},"42":{"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Saturn","fall":"Moon"},"4":{"ex":"Venus","fall":"Mars"},"5":{"ex":"Sun","fall":"Pluto"},"6":{"ex":"Mars","fall":"Neptune"}},"43":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Mercury","fall":"Jupiter"},"3":{"ex":"Mars","fall":"Venus"},"5":{"ex":"Venus","fall":"Mercury"},"6":{"ex":"Sun","fall":"Saturn"}},"44":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Mercury"},"3":{"ex":"Venus","fall":"Mars"},"4":{"ex":"Mars","fall":"Moon"},"5":{"ex":"Sun","fall":"Pluto"},"6":{"ex":"Pluto","fall":"Neptune"}},"45":{"1":{"ex":"Jupiter","fall":"Saturn"},"2":{"ex":"Moon","fall":"Mars"},"3":{"ex":"Mars","fall":"Moon"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Venus","fall":"Mercury"},"6":{"ex":"Saturn","fall":"Neptune"}},"46":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Sun","fall":"Pluto"},"4":{"ex":"Jupiter","fall":"Neptune"},"5":{"ex":"Saturn","fall":"Moon"},"6":{"ex":"Mars","fall":"Mercury"}},"47":{"1":{"ex":"Mars","fall":"Moon"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Venus","fall":"Mars"},"6":{"ex":"Neptune","fall":"Saturn"}},"48":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Mercury"},"3":{"ex":"Mars","fall":"Moon"},"4":{"ex":"Venus","fall":"Mercury"},"5":{"ex":"Sun","fall":"Pluto"},"6":{"ex":"Saturn","fall":"Neptune"}},"49":{"1":{"ex":"Moon","fall":"Sun"},"2":{"ex":"Mars","fall":"Venus"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Saturn","fall":"Moon"},"5":{"ex":"Sun","fall":"Uranus"},"6":{"ex":"Venus","fall":"Mars"}},"50":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Saturn","fall":"Moon"},"3":{"ex":"Mars","fall":"Neptune"},"4":{"ex":"Jupiter","fall":"Mercury"},"5":{"ex":"Venus","fall":"Mars"},"6":{"ex":"Sun","fall":"Pluto"}},"51":{"1":{"ex":"Mars","fall":"Earth"},"2":{"ex":"Sun","fall":"Saturn"},"3":{"ex":"Venus","fall":"Mars"},"4":{"ex":"Moon","fall":"Neptune"},"5":{"ex":"Jupiter","fall":"Mercury"},"6":{"ex":"Saturn","fall":"Moon"}},"52":{"1":{"ex":"Saturn","fall":"Moon"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Venus","fall":"Mars"},"4":{"ex":"Jupiter","fall":"Mercury"},"5":{"ex":"Sun","fall":"Uranus"},"6":{"ex":"Mars","fall":"Neptune"}},"53":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Mercury"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Sun","fall":"Pluto"},"5":{"ex":"Venus","fall":"Mars"},"6":{"ex":"Saturn","fall":"Moon"}},"54":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Sun","fall":"Uranus"},"4":{"ex":"Mars","fall":"Moon"},"5":{"ex":"Jupiter","fall":"Mercury"},"6":{"ex":"Saturn","fall":"Neptune"}},"55":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Mars","fall":"Venus"},"3":{"ex":"Jupiter","fall":"Saturn"},"4":{"ex":"Venus","fall":"Mercury"},"5":{"ex":"Sun","fall":"Pluto"},"6":{"ex":"Neptune","fall":"Moon"}},"56":{"1":{"ex":"Moon","fall":"Mars"},"2":{"ex":"Venus","fall":"Saturn"},"3":{"ex":"Saturn","fall":"Moon"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Jupiter","fall":"Mercury"},"6":{"ex":"Mars","fall":"Neptune"}},"57":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Jupiter","fall":"Mercury"},"3":{"ex":"Venus","fall":"Mars"},"4":{"ex":"Sun","fall":"Pluto"},"5":{"ex":"Mars","fall":"Moon"},"6":{"ex":"Saturn","fall":"Neptune"}},"58":{"1":{"ex":"Venus","fall":"Saturn"},"2":{"ex":"Moon","fall":"Mars"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Mars","fall":"Moon"},"6":{"ex":"Saturn","fall":"Mercury"}},"59":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Venus","fall":"Mars"},"3":{"ex":"Mars","fall":"Moon"},"4":{"ex":"Jupiter","fall":"Mercury"},"5":{"ex":"Sun","fall":"Pluto"},"6":{"ex":"Saturn","fall":"Neptune"}},"60":{"1":{"ex":"Moon","fall":"Saturn"},"2":{"ex":"Saturn","fall":"Moon"},"3":{"ex":"Mars","fall":"Neptune"},"4":{"ex":"Sun","fall":"Uranus"},"5":{"ex":"Venus","fall":"Mars"},"6":{"ex":"Jupiter","fall":"Mercury"}},"61":{"1":{"ex":"Neptune","fall":"Saturn"},"2":{"ex":"Moon","fall":"Mars"},"3":{"ex":"Jupiter","fall":"Mercury"},"4":{"ex":"Sun","fall":"Pluto"},"5":{"ex":"Venus","fall":"Mercury"},"6":{"ex":"Mars","fall":"Saturn"}},"62":{"1":{"ex":"Mercury","fall":"Jupiter"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Sun","fall":"Pluto"},"4":{"ex":"Mars","fall":"Moon"},"5":{"ex":"Venus","fall":"Mercury"},"6":{"ex":"Saturn","fall":"Neptune"}},"63":{"1":{"ex":"Saturn","fall":"Moon"},"2":{"ex":"Sun","fall":"Uranus"},"3":{"ex":"Moon","fall":"Saturn"},"4":{"ex":"Venus","fall":"Mars"},"5":{"ex":"Jupiter","fall":"Mercury"},"6":{"ex":"Mars","fall":"Neptune"}},"64":{"1":{"ex":"Saturn","fall":"Moon"},"2":{"ex":"Moon","fall":"Saturn"},"3":{"ex":"Mars","fall":"Venus"},"4":{"ex":"Venus","fall":"Mercury"},"5":{"ex":"Jupiter","fall":"Neptune"},"6":{"ex":"Sun","fall":"Pluto"}}};
// ── Гармонические ворота (канальные пары) ────────────────────
const HARMONICS={1:[8],2:[14],3:[60],4:[63],5:[15],6:[59],7:[31],8:[1],9:[52],10:[20],11:[56],12:[22],13:[33],14:[2],15:[5],16:[48],17:[62],18:[58],19:[49],20:[10,34,57],21:[45],22:[12],23:[43],24:[61],25:[51],26:[44],27:[50],28:[38],29:[46],30:[41],31:[7],32:[54],33:[13],34:[20,57],35:[36],36:[35],37:[40],38:[28],39:[55],40:[37],41:[30],42:[53],43:[23],44:[26],45:[21],46:[29],47:[64],48:[16],49:[19],50:[27],51:[25],52:[9],53:[42],54:[32],55:[39],56:[11],57:[20,34],58:[18],59:[6],60:[3],61:[24],62:[17],63:[4],64:[47]};
// Карта: номер ворот → Set планет (из всех активаций карты)
function buildGatePlanets(acts){
  var gp={};
  acts.forEach(function(a){
    var g=String(a.gate);
    if(!gp[g])gp[g]=new Set();
    gp[g].add(a.planet);
  });
  var keys=Object.keys(gp);
  var valid=keys.filter(function(k){return k&&k!=='undefined';});
  console.log('[GP] gates='+valid.length+' hasPlanets='+valid.some(function(k){var s=gp[k];return s&&[...s].some(function(p){return p&&p!=='undefined';});})+' sample='+valid.slice(0,3).map(function(k){return k+':['+[...gp[k]].join(',')+']';}).join(' '));
  return gp;
}
// Есть ли планета в воротах или их гармонических парах?
function inGateOrHarmonic(planet,gate,gp){
  if(!planet||planet==='undefined')return false;
  var sg=String(gate);
  if((gp[sg]||new Set()).has(planet))return true;
  var harm=HARMONICS[gate]||[];
  for(var i=0;i<harm.length;i++){if((gp[String(harm[i])]||new Set()).has(planet))return true;}
  return false;
}
// Символ для активации: ▲ экзальтация, ▼ падение, ✦ джакстапозиция
function getFixSym(gate,line,planet,gp){
  var sg=String(gate),sl=String(line),sp=String(planet||'');
  const l=(ICHING[sg]||{})[sl];
  if(!l)return'';
  const isExCtx =inGateOrHarmonic(l.ex,  gate,gp);
  const isDetCtx=inGateOrHarmonic(l.fall,gate,gp);
  const isThisEx =(l.ex  ===sp);
  const isThisDet=(l.fall===sp);
  var sym='';
  if((isThisEx&&isDetCtx)||(isThisDet&&isExCtx)||(isExCtx&&isDetCtx)) sym='✦';
  else if(isExCtx) sym='▲';
  else if(isDetCtx)sym='▼';
  if(sym)console.log('[FIX] gate='+sg+' line='+sl+' planet='+sp+' thisEx='+isThisEx+' thisDet='+isThisDet+' exCtx='+isExCtx+' detCtx='+isDetCtx+' → '+sym);
  else if(isExCtx||isDetCtx)console.log('[NEAR] gate='+sg+' line='+sl+' planet='+sp+' ex='+l.ex+'('+isExCtx+') fall='+l.fall+'('+isDetCtx+')');
  return sym;
}
// ─────────────────────────────────────────────────────────────

const SC = {
  Head:        {x:450,y:57,  shape:'tri-up',    s:52},
  Ajna:        {x:450,y:168, shape:'tri-down',  s:70},
  Throat:      {x:450,y:350, shape:'hex',       s:80},
  G:           {x:450,y:520, shape:'diamond',   dw:154,dh:134},
  Ego:         {x:556,y:568, shape:'circle',    r:34},
  SolarPlexus: {x:685,y:705, shape:'tri-left',  s:72},
  Sacral:      {x:450,y:713, shape:'circle',    r:76},
  Spleen:      {x:215,y:700, shape:'tri-right', s:72},
  Root:        {x:450,y:882, shape:'rect',      w:130,h:130,rx:14},
};

const GO = {
  Head:{61:[0,15],63:[25,16],64:[-25,16]},
  Ajna:{4:[25,-25],11:[27,4],17:[-27,4],24:[0,-25],43:[0,45],47:[-25,-25]},
  Throat:{8:[0,54],12:[53,0],16:[-53,-29],20:[-53,24],23:[0,-54],31:[-27,44],33:[27,44],35:[53,-29],45:[48,27],56:[27,-44],62:[-27,-44]},
  G:{1:[0,-39],2:[0,42],7:[-27,-19],10:[-49,0],13:[27,-19],15:[-26,23],25:[49,2],46:[25,22]},
  Ego:{21:[10,-14],26:[-11,13],40:[11,13],51:[-12,-11]},
  Sacral:{3:[0,57],5:[-25,-49],9:[26,51],14:[0,-56],27:[-55,15],29:[25,-51],34:[-47,-29],42:[-26,51],59:[57,15]},
  Root:{19:[46,-12],38:[-46,17],39:[45,17],41:[46,46],52:[26,-47],53:[-26,-47],54:[-46,-12],58:[-46,46],60:[0,-47]},
  Spleen:{18:[-22,39],28:[0,22],32:[26,12],44:[27,-13],48:[-21,-42],50:[54,0],57:[3,-27]},
  SolarPlexus:{6:[-54,0],22:[-3,-27],30:[21,37],36:[21,-42],37:[-26,-13],49:[-25,11],55:[-1,23]},
};

const STD_CH = [
  'Ajna:47|Head:64','Ajna:24|Head:61','Ajna:4|Head:63',
  'Ajna:17|Throat:62','Ajna:11|Throat:56','Ajna:43|Throat:23',
  'G:7|Throat:31','G:1|Throat:8','G:13|Throat:33',
  'Ego:21|Throat:45','SolarPlexus:22|Throat:12','SolarPlexus:36|Throat:35',
  'Spleen:48|Throat:16',
  'Ego:40|SolarPlexus:37','Ego:51|G:25',
  'G:15|Sacral:5','G:2|Sacral:14','G:46|Sacral:29',
  'Ego:26|Spleen:44',
  'Sacral:59|SolarPlexus:6','Sacral:27|Spleen:50',
  'Root:53|Sacral:42','Root:60|Sacral:3','Root:52|Sacral:9',
  'Root:19|SolarPlexus:49','Root:39|SolarPlexus:55','Root:41|SolarPlexus:30',
  'Root:58|Spleen:18','Root:38|Spleen:28','Root:54|Spleen:32',
];

const posMap = {ex:'▲',fall:'▼',jux:'✶'};
const posCol = {ex:'#D97706',fall:'#9CA3AF',jux:'#7C3AED'};
const PW = 108;

function norm(dx,dy){const l=Math.hypot(dx,dy);return l>0?[dx/l,dy/l]:[0,0];}

function roundedPoly(pts,r){
  const n=pts.length;let d='';
  for(let i=0;i<n;i++){
    const cur=pts[i],prev=pts[(i+n-1)%n],next=pts[(i+1)%n];
    const tp=norm(prev[0]-cur[0],prev[1]-cur[1]);
    const tn=norm(next[0]-cur[0],next[1]-cur[1]);
    const p1=[cur[0]+tp[0]*r,cur[1]+tp[1]*r];
    const p2=[cur[0]+tn[0]*r,cur[1]+tn[1]*r];
    d+=(i===0?'M':'L')+p1[0].toFixed(1)+','+p1[1].toFixed(1);
    d+=' Q'+cur[0].toFixed(1)+','+cur[1].toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);
  }
  return d+'Z';
}

function centerPath(c,x,y){
  const r=12;
  switch(c.shape){
    case 'tri-up':    return roundedPoly([[x,y-c.s*1.15],[x-c.s,y+c.s*0.58],[x+c.s,y+c.s*0.58]],r);
    case 'tri-down':  return roundedPoly([[x-c.s,y-c.s*0.58],[x+c.s,y-c.s*0.58],[x,y+c.s*1.15]],r);
    case 'tri-left':  return roundedPoly([[x-c.s*1.15,y],[x+c.s*0.58,y-c.s],[x+c.s*0.58,y+c.s]],r);
    case 'tri-right': return roundedPoly([[x+c.s*1.15,y],[x-c.s*0.58,y-c.s],[x-c.s*0.58,y+c.s]],r);
    case 'hex':{const pts=Array.from({length:6},function(_,i){const a=Math.PI/6+i*Math.PI/3;return[x+c.s*Math.cos(a),y+c.s*Math.sin(a)];});return roundedPoly(pts,9);}
    case 'diamond':{const hw=c.dw/2,hh=c.dh/2;return roundedPoly([[x,y-hh],[x+hw,y],[x,y+hh],[x-hw,y]],14);}
    default:return null;
  }
}

function gXY(cn,g){const c=SC[cn],o=(GO[cn]||{})[g]||[0,0];return[c.x+o[0],c.y+o[1]];}

function chanPerp(dx,dy,off){
  const len=Math.hypot(dx,dy);if(len<1)return[[0,0],[0,0]];
  const p1x=-dy/len*off,p1y=dx/len*off,p2x=dy/len*off,p2y=-dx/len*off;
  const r1=(p1y>p2y+0.001)||(Math.abs(p1y-p2y)<=0.001&&p1x>=p2x);
  return r1?[[p1x,p1y],[p2x,p2y]]:[[p2x,p2y],[p1x,p1y]];
}

function drawGateStub(gx,gy,tx,ty,g,pG,dG){
  const mx=(gx+tx)/2,my=(gy+ty)/2;
  const dx=mx-gx,dy=my-gy;
  if(Math.hypot(dx,dy)<2)return'';
  const sw=4.5,OFF=sw/2;
  const perp=chanPerp(dx,dy,OFF);
  const f=function(v){return v.toFixed(1);};
  const isP=pG.has(g),isD=dG.has(g);
  function ln(ox,oy,col,op){
    return'<line x1="'+f(gx+ox)+'" y1="'+f(gy+oy)+'" x2="'+f(mx+ox)+'" y2="'+f(my+oy)+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="butt" opacity="'+op+'"/>';
  }
  if(isP&&isD){
    return ln(perp[1][0],perp[1][1],PC.chP,0.9)+ln(perp[0][0],perp[0][1],PC.chR,0.9);
  }else if(isD){
    return ln(perp[1][0],perp[1][1],PC.chR,0.9)+ln(perp[0][0],perp[0][1],PC.chR,0.9);
  }else if(isP){
    return ln(perp[1][0],perp[1][1],PC.chP,0.9)+ln(perp[0][0],perp[0][1],PC.chP,0.9);
  }else{
    return ln(perp[1][0],perp[1][1],PC.chP,0.08)+ln(perp[0][0],perp[0][1],PC.chP,0.08);
  }
}

function lineIntersect(x1,y1,x2,y2,x3,y3,x4,y4){
  const d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
  if(Math.abs(d)<0.001)return null;
  const t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/d;
  return[x1+t*(x2-x1),y1+t*(y2-y1)];
}

function drawIntChannels(pG,dG){
  const g20=gXY('Throat',20),g57=gXY('Spleen',57);
  const g34=gXY('Sacral',34);
  const sw=4.5,OFF=sw/2;
  const f=function(v){return v.toFixed(1);};
  var s='';
  const spDx=g20[0]-g57[0],spDy=g20[1]-g57[1];
  const spLen2=spDx*spDx+spDy*spDy;
  if(spLen2<1)return'';
  const sp=chanPerp(spDx,spDy,OFF);
  const g10cx=SC.G.x-SC.G.dw/2, g10cy=SC.G.y;
  const t10=Math.max(0.01,Math.min(0.99,(g10cy-g57[1])/(spDy||1)));
  const j10x=g57[0]+t10*spDx, j10y=g10cy;
  const j34x=g57[0]+T_J34*spDx, j34y=g57[1]+T_J34*spDy;
  const isP57=pG.has(57),isD57=dG.has(57);
  const isP20=pG.has(20),isD20=dG.has(20);
  const isP10=pG.has(10),isD10=dG.has(10);
  const isP34=pG.has(34),isD34=dG.has(34);
  function seg(x1,y1,x2,y2,isP,isD){
    const dx=x2-x1,dy=y2-y1;
    if(Math.hypot(dx,dy)<1)return'';
    const perp=chanPerp(dx,dy,OFF);
    function ln(ox,oy,col,op){
      return'<line x1="'+f(x1+ox)+'" y1="'+f(y1+oy)+'" x2="'+f(x2+ox)+'" y2="'+f(y2+oy)+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="butt" opacity="'+op+'"/>';
    }
    if(isP&&isD)return ln(perp[1][0],perp[1][1],PC.chP,0.9)+ln(perp[0][0],perp[0][1],PC.chR,0.9);
    if(isD)    return ln(perp[1][0],perp[1][1],PC.chR,0.9)+ln(perp[0][0],perp[0][1],PC.chR,0.9);
    if(isP)    return ln(perp[1][0],perp[1][1],PC.chP,0.9)+ln(perp[0][0],perp[0][1],PC.chP,0.9);
    return         ln(perp[1][0],perp[1][1],PC.chP,0.08)+ln(perp[0][0],perp[0][1],PC.chP,0.08);
  }
  s+=seg(g57[0],g57[1],j34x,j34y,isP57,isD57);
  s+=seg(j34x,j34y,j10x,j10y,isP57||isP34,isD57||isD34);
  s+=seg(j10x,j10y,g20[0],g20[1],isP20,isD20);
  const br10x=j10x-g10cx, br10y=j10y-g10cy, br10L=Math.hypot(br10x,br10y)||1;
  const g10sx=g10cx-(br10x/br10L)*15, g10sy=g10cy-(br10y/br10L)*15;
  const br10Perp=chanPerp(br10x,br10y,OFF);
  const iA=lineIntersect(
    g10sx+br10Perp[0][0],g10sy+br10Perp[0][1],
    j10x+br10Perp[0][0], j10y+br10Perp[0][1],
    j10x+sp[1][0],j10y+sp[1][1],
    j10x+sp[1][0]+spDx,j10y+sp[1][1]+spDy
  )||[j10x+br10Perp[0][0],j10y+br10Perp[0][1]];
  const iB=lineIntersect(
    g10sx+br10Perp[1][0],g10sy+br10Perp[1][1],
    j10x+br10Perp[1][0], j10y+br10Perp[1][1],
    j10x+sp[1][0],j10y+sp[1][1],
    j10x+sp[1][0]+spDx,j10y+sp[1][1]+spDy
  )||[j10x+br10Perp[1][0],j10y+br10Perp[1][1]];
  function g10lnA(col,op){return'<line x1="'+f(g10sx+br10Perp[0][0])+'" y1="'+f(g10sy+br10Perp[0][1])+'" x2="'+f(iA[0])+'" y2="'+f(iA[1])+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="butt" opacity="'+op+'"/>';}
  function g10lnB(col,op){return'<line x1="'+f(g10sx+br10Perp[1][0])+'" y1="'+f(g10sy+br10Perp[1][1])+'" x2="'+f(iB[0])+'" y2="'+f(iB[1])+'" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="butt" opacity="'+op+'"/>';}
  if(isP10&&isD10) s+=g10lnB(PC.chP,0.9)+g10lnA(PC.chR,0.9);
  else if(isD10)   s+=g10lnB(PC.chR,0.9)+g10lnA(PC.chR,0.9);
  else if(isP10)   s+=g10lnB(PC.chP,0.9)+g10lnA(PC.chP,0.9);
  else             s+=g10lnB(PC.chP,0.08)+g10lnA(PC.chP,0.08);
  const brDx=j34x-g34[0],brDy=j34y-g34[1],brLen=Math.hypot(brDx,brDy)||1;
  s+=seg(g34[0],g34[1],j34x+(brDx/brLen)*sw,j34y+(brDy/brLen)*sw,isP34,isD34);
  return s;
}

function drawJuxtSym(cx,cy,col){
  const r=5.5,h=r*0.5,w=r*0.866;
  const f=function(v){return v.toFixed(1);};
  const pu=f(cx)+','+f(cy-r)+' '+f(cx-w)+','+f(cy+h)+' '+f(cx+w)+','+f(cy+h);
  const pd=f(cx)+','+f(cy+r)+' '+f(cx-w)+','+f(cy-h)+' '+f(cx+w)+','+f(cy-h);
  return '<polygon points="'+pu+'" fill="none" stroke="'+col+'" stroke-width="1.2"/>'+
         '<polygon points="'+pd+'" fill="none" stroke="'+col+'" stroke-width="1.2"/>';
}

function symAttrs(planet,col){
  if(THICK_P.has(planet))return' stroke="'+col+'" stroke-width="1.2" paint-order="stroke"';
  if(MED_P.has(planet))  return' stroke="'+col+'" stroke-width="0.75" paint-order="stroke"';
  return'';
}

function drawPlanetPanel(acts,isDes,px,gp){
  if(!acts||!acts.length)return'';
  const col=isDes?PC.chR:PC.chP;
  const rH=54,hH=58,pH=acts.length*rH+hH-10;
  var r='<rect x="'+px+'" y="44" width="'+PW+'" height="'+pH+'" rx="8" fill="#FFF" opacity="0.45"/>';
  r+='<text x="'+(px+PW/2)+'" y="40" text-anchor="middle" font-family="Arial" font-size="15" font-weight="bold" fill="'+col+'">'+(isDes?'Design':'Personality')+'</text>';
  acts.forEach(function(a,i){
    const yt=hH+i*rH,yg=yt+22,yc=yt+37;
    const sym=PS[a.planet]||'?',fsym=a.planet==='Sun'?28:(a.planet==='Venus'||a.planet==='Mars')?33:23;
    const gl=String(a.gate||''),ln=String(a.line||'');
    const ctb=a.ctb||'',zod=a.zodiac||'';
    const glW=gl.length*8+14;
    const sa=symAttrs(a.planet,col);
    const fixSymVal=getFixSym(a.gate,a.line,a.planet,gp||{});
    const isJuxt=fixSymVal==='✦';
    const fixSym=isJuxt?'':fixSymVal;
    const retSym=a.isRetrograde?'℞':'';
    if(isDes){
      r+='<text x="'+(px+13)+'" y="'+(yg+2)+'" text-anchor="middle" font-family="Arial" font-size="'+fsym+'" fill="'+col+'"'+sa+'>'+sym+'</text>';
      r+='<text x="'+(px+31)+'" y="'+yg+'" font-family="Arial" font-size="13" fill="'+col+'"><tspan font-weight="700">'+gl+'</tspan><tspan font-weight="700">.'+ln+'</tspan>'+(fixSym?'<tspan font-size="10" font-weight="bold" dx="2">'+fixSym+'</tspan>':'')+(retSym?'<tspan font-size="9" dx="1" opacity="0.7">'+retSym+'</tspan>':'')+'</text>';
      if(isJuxt)r+=drawJuxtSym(px+31+glW+9,yg-4,col);
      r+='<text x="'+(px+31)+'" y="'+yc+'" font-family="Arial" font-size="11" fill="'+col+'" opacity="0.85">'+ctb+'</text>';
      r+='<text x="'+(px+PW-3)+'" y="'+yg+'" text-anchor="end" font-family="Arial" font-size="11" fill="'+ZOD_COL+'" opacity="0.5">'+zod+'</text>';
    } else {
      const glEnd=px+PW-31;
      r+='<text x="'+(px+PW-13)+'" y="'+(yg+2)+'" text-anchor="middle" font-family="Arial" font-size="'+fsym+'" fill="'+col+'"'+sa+'>'+sym+'</text>';
      r+='<text x="'+glEnd+'" y="'+yg+'" text-anchor="end" font-family="Arial" font-size="13" fill="'+col+'">'+(retSym?'<tspan font-size="9" dx="-1" opacity="0.7">'+retSym+'</tspan>':'')+(fixSym?'<tspan font-size="10" font-weight="bold" dx="-2">'+fixSym+'</tspan>':'')+'<tspan font-weight="700">'+gl+'</tspan><tspan font-weight="700">.'+ln+'</tspan></text>';
      if(isJuxt)r+=drawJuxtSym(glEnd-glW-(retSym?10:0)-9,yg-4,col);
      r+='<text x="'+glEnd+'" y="'+yc+'" text-anchor="end" font-family="Arial" font-size="11" fill="'+col+'" opacity="0.85">'+ctb+'</text>';
      r+='<text x="'+(px+3)+'" y="'+yg+'" font-family="Arial" font-size="11" fill="'+ZOD_COL+'" opacity="0.5">'+zod+'</text>';
    }
    if(i<acts.length-1)r+='<line x1="'+(px+5)+'" y1="'+(yt+rH-2)+'" x2="'+(px+PW-5)+'" y2="'+(yt+rH-2)+'" stroke="#E8DDD0" stroke-width="0.5"/>';
  });
  return r;
}

function drawVariables(data){
  const hx=SC.Head.x,hy=SC.Head.y;
  const varD=data.variable||{};
  function isLeft(o){return(o||'').toLowerCase()==='left';}

  const dActs=(data.activations&&data.activations.design)||[];
  const pActs=(data.activations&&data.activations.personality)||[];
  function planetCtb(acts,name){
    const p=acts.find(function(a){return a.planet===name;});
    if(!p||!p.ctb)return[null,null,null];
    return p.ctb.split('.').map(Number);
  }
  const dCtbSun=planetCtb(dActs,'Sun');
  const pCtbSun=planetCtb(pActs,'Sun');
  const dCtbNode=planetCtb(dActs,'NorthNode');
  const pCtbNode=planetCtb(pActs,'NorthNode');

  const rows={
    leftUp: [hx-168,hy+36],  leftDown: [hx-168,hy+90],
    rightUp:[hx+168,hy+36],  rightDown:[hx+168,hy+90]
  };
  var s='';

  function arrow(ax,ay,leftDir,col){
    const hw=9,hh=7,tw=22,th=3,half=(hw+tw)/2;
    function f(v){return v.toFixed(1);}
    var tip,neck,end;
    if(leftDir){ tip=ax-half; neck=ax-half+hw; end=ax+half; }
    else        { tip=ax+half; neck=ax+half-hw; end=ax-half; }
    var pts=f(tip)+','+f(ay)+' '+f(neck)+','+f(ay-hh)+' '+f(neck)+','+f(ay-th)+' '+f(end)+','+f(ay-th)+' '+f(end)+','+f(ay+th)+' '+f(neck)+','+f(ay+th)+' '+f(neck)+','+f(ay+hh);
    s+='<polygon points="'+pts+'" fill="'+col+'" opacity="0.92"/>';
  }

  function shapes(ax,ay,isDesign,ctb){
    const col=isDesign?PC.chR:PC.chP;
    const dir=isDesign?-1:1;
    const sp=44,r=15;
    const [cv,tv,bv]=ctb;
    const lbOp=' opacity="0.6"';
    if(cv!=null){
      const cx=ax+dir*sp;
      s+='<circle cx="'+cx+'" cy="'+ay+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="1.6"/>';
      s+='<text x="'+cx+'" y="'+(ay+5)+'" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="'+col+'">'+cv+'</text>';
      s+='<text x="'+cx+'" y="'+(ay+r+10)+'" text-anchor="middle" font-family="Arial" font-size="7.5" fill="'+col+'"'+lbOp+'>color</text>';
    }
    if(tv!=null){
      const tx=ax+dir*sp*2,tr=15,ty=ay+2;
      s+='<polygon points="'+tx+','+(ty-tr)+' '+(tx-tr)+','+(ty+tr*0.6)+' '+(tx+tr)+','+(ty+tr*0.6)+'" fill="none" stroke="'+col+'" stroke-width="1.6"/>';
      s+='<text x="'+tx+'" y="'+(ty+5)+'" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="'+col+'">'+tv+'</text>';
      s+='<text x="'+tx+'" y="'+(ty+tr*0.6+10)+'" text-anchor="middle" font-family="Arial" font-size="7.5" fill="'+col+'"'+lbOp+'>tone</text>';
    }
    if(bv!=null){
      const bx=ax+dir*sp*3,br=15;
      var pts='';
      for(var i=0;i<5;i++){const a=Math.PI*(-0.5+i*0.4);pts+=+(bx+br*Math.cos(a)).toFixed(1)+','+(ay+br*Math.sin(a)).toFixed(1)+' ';}
      s+='<polygon points="'+pts.trim()+'" fill="none" stroke="'+col+'" stroke-width="1.6"/>';
      s+='<text x="'+bx+'" y="'+(ay+5)+'" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="'+col+'">'+bv+'</text>';
      s+='<text x="'+bx+'" y="'+(ay+br+10)+'" text-anchor="middle" font-family="Arial" font-size="7.5" fill="'+col+'"'+lbOp+'>base</text>';
    }
  }

  arrow(rows.leftUp[0],rows.leftUp[1],   isLeft(varD.designDigestion),PC.chR);
  shapes(rows.leftUp[0],rows.leftUp[1],  true, dCtbSun);
  arrow(rows.leftDown[0],rows.leftDown[1],isLeft(varD.designEnvironment),PC.chR);
  shapes(rows.leftDown[0],rows.leftDown[1],true, dCtbNode);

  arrow(rows.rightUp[0],rows.rightUp[1],   isLeft(varD.personalityMotivation),PC.chP);
  shapes(rows.rightUp[0],rows.rightUp[1],  false, pCtbSun);
  arrow(rows.rightDown[0],rows.rightDown[1],isLeft(varD.personalityPerspective),PC.chP);
  shapes(rows.rightDown[0],rows.rightDown[1],false, pCtbNode);

  return s;
}

function drawBodySilhouette(){
  var p='';
  p+='M '+CX+',8 ';
  p+='C '+(CX+65)+',8 '+(CX+80)+',68 '+(CX+76)+',120 ';
  p+='C '+(CX+70)+',168 '+(CX+52)+',228 '+(CX+38)+',268 ';
  p+='C '+(CX+39)+',285 '+(CX+190)+',299 '+(CX+192)+',330 ';
  p+='C '+(CX+194)+',360 '+(CX+226)+',430 '+(CX+250)+',530 ';
  p+='C '+(CX+264)+',615 '+(CX+274)+',700 '+(CX+276)+',790 ';
  p+='C '+(CX+276)+',858 '+(CX+264)+',920 '+(CX+240)+',955 ';
  p+='C '+(CX+207)+',979 '+(CX+142)+',984 '+CX+',984 ';
  p+='C '+(CX-142)+',984 '+(CX-207)+',979 '+(CX-240)+',955 ';
  p+='C '+(CX-264)+',920 '+(CX-276)+',858 '+(CX-276)+',790 ';
  p+='C '+(CX-274)+',700 '+(CX-264)+',615 '+(CX-250)+',530 ';
  p+='C '+(CX-226)+',430 '+(CX-194)+',360 '+(CX-192)+',330 ';
  p+='C '+(CX-190)+',299 '+(CX-39)+',285 '+(CX-38)+',268 ';
  p+='C '+(CX-52)+',228 '+(CX-70)+',168 '+(CX-76)+',120 ';
  p+='C '+(CX-80)+',68 '+(CX-65)+',8 '+CX+',8 Z';
  return '<path d="'+p+'" fill="'+PC.bS+'" opacity="0.2"/>';
}

function generateBodygraph(data){
  const defined=new Set((data.centers&&data.centers.defined)||[]);
  const pG=new Set((data.gates&&data.gates.personalityGates)||[]);
  const dG=new Set((data.gates&&data.gates.designGates)||[]);
  const dActs=(data.activations&&data.activations.design)||[];
  const pActs=(data.activations&&data.activations.personality)||[];
  const chart=data.chart||{};

  var s='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">';
  s+='<rect width="'+W+'" height="'+H+'" fill="'+PC.bg+'"/>';
  s+=drawBodySilhouette();

  STD_CH.forEach(function(ck){
    const parts=ck.split('|');
    const ap=parts[0].split(':'),bp=parts[1].split(':');
    const cn1=ap[0],g1=parseInt(ap[1]),cn2=bp[0],g2=parseInt(bp[1]);
    const p1=gXY(cn1,g1),p2=gXY(cn2,g2);
    s+=drawGateStub(p1[0],p1[1],p2[0],p2[1],g1,pG,dG);
    s+=drawGateStub(p2[0],p2[1],p1[0],p1[1],g2,pG,dG);
  });
  s+=drawIntChannels(pG,dG);

  Object.entries(SC).forEach(function(entry){
    const name=entry[0],c=entry[1];
    const fill=defined.has(name)?PC.cD:PC.cU,sw=2.5;
    const d=centerPath(c,c.x,c.y);
    if(d)s+='<path d="'+d+'" fill="'+fill+'" stroke="'+PC.str+'" stroke-width="'+sw+'"/>';
    else if(c.shape==='circle')s+='<circle cx="'+c.x+'" cy="'+c.y+'" r="'+c.r+'" fill="'+fill+'" stroke="'+PC.str+'" stroke-width="'+sw+'"/>';
    else s+='<rect x="'+(c.x-c.w/2)+'" y="'+(c.y-c.h/2)+'" width="'+c.w+'" height="'+c.h+'" rx="'+c.rx+'" fill="'+fill+'" stroke="'+PC.str+'" stroke-width="'+sw+'"/>';
  });

  Object.entries(GO).forEach(function(entry){
    const cn=entry[0],gates=entry[1];
    const c=SC[cn],isDef=defined.has(cn);
    Object.entries(gates).forEach(function(ge){
      const g=parseInt(ge[0]),off=ge[1];
      const gx=c.x+off[0],gy=c.y+off[1];
      const r=11,fs=g>=10?11:12;
      const gold=pG.has(g)||dG.has(g);
      const fill=gold?PC.gG:(isDef?PC.cD:PC.cU);
      const tf=gold?PC.gGT:(isDef?'#5C3A10':'#A08060');
      const st=gold?PC.gGS:(isDef?PC.str:PC.gWS);
      s+='<circle cx="'+gx.toFixed(1)+'" cy="'+gy.toFixed(1)+'" r="'+r+'" fill="'+fill+'" stroke="'+st+'" stroke-width="1.2"/>';
      s+='<text x="'+gx.toFixed(1)+'" y="'+(gy+3.8).toFixed(1)+'" text-anchor="middle" font-family="Arial" font-size="'+fs+'" font-weight="700" fill="'+tf+'">'+g+'</text>';
    });
  });

  s+=drawVariables(data);
  const gp=buildGatePlanets(dActs.concat(pActs));
  s+=drawPlanetPanel(dActs,true,22,gp);
  s+=drawPlanetPanel(pActs,false,W-22-PW,gp);

  if(chart.type){
    s+='<rect x="0" y="'+(H-48)+'" width="'+W+'" height="48" fill="'+PC.chP+'" opacity="0.9"/>';
    s+='<text x="'+CX+'" y="'+(H-26)+'" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" letter-spacing="1.5" fill="#FFF">'+chart.type.toUpperCase()+' · '+(chart.profile||'')+'</text>';
    s+='<text x="'+CX+'" y="'+(H-8)+'" text-anchor="middle" font-family="Arial" font-size="10" fill="#EDD8B0">'+(chart.authority||'')+' · '+(chart.definition||'')+'</text>';
  }
  s+='<text x="16" y="'+(H-8)+'" font-family="Arial" font-size="9" fill="'+PC.str+'" opacity="0.7">Designed by Nataly Popovych</text>';
  s+='</svg>';
  return s;
}

module.exports = {generateBodygraph: generateBodygraph};
