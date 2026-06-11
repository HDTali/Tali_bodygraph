/**
 * bodygraph.js v7
 * Canva-style: скруглённые углы, двойные линии каналов, цвета по брендбуку
 * Personality = #30302E (graphite), Design = #A62121 (red)
 * Active gates: graphite bg + white text
 * Inactive gates: cream bg + gold text
 */

const B = {
  graphite:  '#30302E',
  gold:      '#90734B',
  goldLight: '#B8956A',
  cream:     '#F5EDE8',
  white:     '#FFFFFF',
  red:       '#A62121',
  chanOff:   '#D4C4B8',
  gateBg:    '#EDE4DC',
  gateText:  '#90734B',
  silhouette:'#C8B8A8',
};

const PLANET_SYMBOLS = {
  'Sun': '&#9737;', 'Earth': '&#8853;',
  'NorthNode': '&#9738;', 'North Node': '&#9738;',
  'SouthNode': '&#9739;', 'South Node': '&#9739;',
  'Moon': '&#9789;', 'Mercury': '&#9791;',
  'Venus': '&#9792;', 'Mars': '&#9794;',
  'Jupiter': '&#9795;', 'Saturn': '&#9796;',
  'Uranus': '&#9797;', 'Neptune': '&#9798;', 'Pluto': '&#9799;',
};

const CENTER_GATES = {
  Head:        [64, 61, 63],
  Ajna:        [47, 24, 4, 17, 43, 11],
  Throat:      [62, 23, 56, 35, 12, 45, 20, 31, 8, 33, 16],
  G:           [1, 13, 25, 7, 10, 15, 2, 46],
  Ego:         [51, 21, 40, 26],
  Sacral:      [34, 5, 14, 29, 59, 9, 3, 42, 27],
  Root:        [53, 60, 52, 19, 39, 41, 58, 38, 54],
  Spleen:      [48, 57, 44, 50, 32, 28, 18],
  SolarPlexus: [36, 22, 37, 6, 49, 55, 30],
};

const GATE_OFFSETS = {
  Head:        [[61,-1,25],  [63,27,26],  [64,-27,26]],
  Ajna:        [[4,26,-21],  [11,18,6],   [17,-16,3],  [24,0,-19],  [43,0,27],   [47,-29,-20]],
  Throat:      [[8,-3,21],   [12,61,3],   [16,-44,-16],[20,-61,1],  [23,-1,-36], [31,-22,21],
                [33,18,22],  [35,45,-22], [45,42,20],  [56,24,-39], [62,-25,-38]],
  G:           [[1,-2,-38],  [2,1,37],    [7,-25,-25], [10,-45,1],  [13,21,-28],
                [15,-21,22], [25,45,1],   [46,28,18]],
  Ego:         [[21,-6,-26], [26,4,26],   [40,29,-5],  [51,-26,5]],
  Sacral:      [[3,2,48],    [5,-21,-42], [9,34,34],   [14,2,-41],  [27,-57,6],
                [29,28,-39], [34,-48,-28],[42,-35,34], [59,50,8]],
  Root:        [[19,73,-19], [38,-60,9],  [39,71,6],   [41,71,38],  [52,34,-16],
                [53,-29,-16],[54,-60,-17],[58,-59,43], [60,3,-19]],
  Spleen:      [[18,-12,24], [28,28,42],  [32,54,29],  [44,44,-46], [48,-38,-5],
                [50,50,-6],  [57,0,-28]],
  SolarPlexus: [[6,-55,-1],  [22,12,-20], [30,21,18],  [36,50,-1],  [37,-31,-35],
                [49,-48,46], [55,-15,34]],
};

const GATE_CENTER_MAP = {};
for (const [c, gs] of Object.entries(CENTER_GATES)) for (const g of gs) GATE_CENTER_MAP[g] = c;

const ALL_CHANNELS = {
  '64-47':['Head','Ajna'],    '61-24':['Head','Ajna'],    '63-4':['Head','Ajna'],
  '17-62':['Ajna','Throat'],  '43-23':['Ajna','Throat'],  '11-56':['Ajna','Throat'],
  '35-36':['Throat','SolarPlexus'], '12-22':['Throat','SolarPlexus'],
  '45-21':['Throat','Ego'],   '33-13':['Throat','G'],     '8-1':['Throat','G'],
  '31-7':['Throat','G'],      '20-10':['Throat','G'],     '20-34':['Throat','Sacral'],
  '20-57':['Throat','Spleen'],'16-48':['Throat','Spleen'],
  '25-51':['G','Ego'],        '10-57':['G','Spleen'],
  '10-34':['G','Sacral'],     '15-5':['G','Sacral'],      '2-14':['G','Sacral'],
  '46-29':['G','Sacral'],     '26-44':['Ego','Spleen'],   '40-37':['Ego','SolarPlexus'],
  '9-52':['Sacral','Root'],   '3-60':['Sacral','Root'],   '42-53':['Sacral','Root'],
  '27-50':['Sacral','Spleen'],'34-57':['Sacral','Spleen'],'59-6':['Sacral','SolarPlexus'],
  '19-49':['Root','SolarPlexus'],'39-55':['Root','SolarPlexus'],'41-30':['Root','SolarPlexus'],
  '58-18':['Root','Spleen'],  '38-28':['Root','Spleen'],  '54-32':['Root','Spleen'],
};

const GATE_TO_CHANNEL = {};
for (const [id, cs] of Object.entries(ALL_CHANNELS)) {
  const [g1,g2] = id.split('-').map(Number);
  GATE_TO_CHANNEL[g1] = {id,centers:cs};
  GATE_TO_CHANNEL[g2] = {id,centers:cs};
}

// Скруглённый многоугольник через квадратичные кривые Безье
function roundedPoly(pts, r) {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i-1+n)%n];
    const curr = pts[i];
    const next = pts[(i+1)%n];
    const v1 = [prev[0]-curr[0], prev[1]-curr[1]];
    const v2 = [next[0]-curr[0], next[1]-curr[1]];
    const l1 = Math.hypot(v1[0],v1[1]);
    const l2 = Math.hypot(v2[0],v2[1]);
    const rr = Math.min(r, l1/2, l2/2);
    const p1 = [curr[0]+v1[0]*rr/l1, curr[1]+v1[1]*rr/l1];
    const p2 = [curr[0]+v2[0]*rr/l2, curr[1]+v2[1]*rr/l2];
    if (i===0) d += `M${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
    else       d += ` L${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
    d += ` Q${curr[0]},${curr[1]} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
}

function getCenters(cx) {
  return {
    Head:        { cx, cy:56,  shape:'rpoly', r:18, pts:[[cx,12],[cx-56,100],[cx+56,100]] },
    Ajna:        { cx, cy:140, shape:'rpoly', r:18, pts:[[cx-56,106],[cx+56,106],[cx,194]] },
    Throat:      { cx, cy:244, shape:'rpoly', r:14,
                   pts:[[cx+22,205],[cx+45,244],[cx+22,283],[cx-22,283],[cx-45,244],[cx-22,205]] },
    G:           { cx, cy:335, shape:'rpoly', r:16, pts:[[cx,290],[cx+65,335],[cx,380],[cx-65,335]] },
    Ego:         { cx:cx+100, cy:324, shape:'circle', r:34 },
    Sacral:      { cx, cy:436, shape:'circle', r:52 },
    Root:        { cx, cy:541, shape:'rect', x:cx-75, y:496, w:150, h:90, rx:16 },
    Spleen:      { cx:cx-144, cy:436, shape:'rpoly', r:22,
                   pts:[[cx-200,390],[cx-200,490],[cx-88,436]] },
    SolarPlexus: { cx:cx+144, cy:436, shape:'rpoly', r:22,
                   pts:[[cx+200,390],[cx+88,436],[cx+200,490]] },
  };
}

function getPoints(cx) {
  return {
    Head:        { bottom:[cx,100] },
    Ajna:        { top:[cx,106], bottom:[cx,194] },
    Throat:      { top:[cx,205], bottom:[cx,283], left:[cx-45,244], right:[cx+45,244] },
    G:           { top:[cx,290], bottom:[cx,380], left:[cx-65,335], right:[cx+65,335] },
    Ego:         { left:[cx+66,324], top:[cx+100,290] },
    Sacral:      { top:[cx,384], bottom:[cx,488], left:[cx-52,436], right:[cx+52,436] },
    Root:        { top:[cx,496], left:[cx-75,541], right:[cx+75,541] },
    Spleen:      { top:[cx-170,404], right:[cx-88,436], bottom:[cx-170,468] },
    SolarPlexus: { top:[cx+170,404], left:[cx+88,436], bottom:[cx+170,468] },
  };
}

function drawCenter(c, fill, stroke) {
  const sw = 1.5;
  if (c.shape==='circle')
    return `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  if (c.shape==='rect')
    return `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  // rpoly — скруглённый многоугольник
  return `<path d="${roundedPoly(c.pts, c.r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

// Двойная параллельная линия канала (gap=3)
function dualLine(x1,y1,x2,y2,color,width) {
  const dx = x2-x1, dy = y2-y1;
  const len = Math.hypot(dx,dy);
  if (len===0) return '';
  const gap = 3;
  const nx = -dy/len*gap/2, ny = dx/len*gap/2;
  const attr = `stroke="${color}" stroke-width="${width}" stroke-linecap="round"`;
  return `<line x1="${(x1+nx).toFixed(1)}" y1="${(y1+ny).toFixed(1)}" x2="${(x2+nx).toFixed(1)}" y2="${(y2+ny).toFixed(1)}" ${attr}/>` +
         `<line x1="${(x1-nx).toFixed(1)}" y1="${(y1-ny).toFixed(1)}" x2="${(x2-nx).toFixed(1)}" y2="${(y2-ny).toFixed(1)}" ${attr}/>`;
}

function drawGate(gate, gx, gy, isP, isD) {
  let fill, textFill;
  if (isP || isD) { fill=B.graphite; textFill=B.white; }
  else            { fill=B.gateBg;   textFill=B.gold; }
  const fs = gate>=10 ? 8 : 9;
  const stroke = isD && !isP ? B.red : (isP && !isD ? B.graphite : (isP&&isD ? B.gold : '#C8B8A8'));
  return `<circle cx="${gx}" cy="${gy}" r="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
         `<text x="${gx}" y="${gy+3}" text-anchor="middle" font-family="Arimo,Arial,sans-serif" font-size="${fs}" font-weight="bold" fill="${textFill}">${gate}</text>`;
}

function drawPlanetPanel(activations, isDesign, px, pw, startY, activeGates) {
  if (!activations || !activations.length) return '';
  const out = [];
  const titleClr = isDesign ? B.red     : B.graphite;
  const gClr     = isDesign ? B.red     : B.graphite;
  const sClr     = isDesign ? '#C44040' : '#555550';
  const pcx = px + pw/2, rowH = 29;
  const panelH = activations.length * rowH + 44;
  out.push(`<rect x="${px}" y="${startY-30}" width="${pw}" height="${panelH}" rx="8" fill="${B.white}" opacity="0.55"/>`);
  out.push(`<text x="${pcx}" y="${startY-12}" text-anchor="middle" font-family="Arimo,Arial,sans-serif" font-size="8" font-weight="bold" letter-spacing="1.8" fill="${titleClr}">${isDesign?'DESIGN':'PERSONALITY'}</text>`);
  out.push(`<line x1="${px+6}" y1="${startY-6}" x2="${px+pw-6}" y2="${startY-6}" stroke="${titleClr}" stroke-width="0.5" opacity="0.35"/>`);
  activations.forEach((act,i) => {
    const y = startY + i*rowH + 14;
    const sym = PLANET_SYMBOLS[act.planet] || act.planet[0];
    const gateStr = `${act.gate}.${act.line}`;
    const active = activeGates && activeGates.has(Number(act.gate));
    const gc = active ? gClr : '#A89080';
    const sc = active ? sClr : '#BBA898';
    if (isDesign) {
      out.push(`<text x="${px+18}" y="${y}" text-anchor="middle" font-family="serif" font-size="12" fill="${sc}">${sym}</text>`);
      out.push(`<text x="${px+pw-6}" y="${y}" text-anchor="end" font-family="Arimo,Arial,sans-serif" font-size="10.5" font-weight="bold" fill="${gc}">${gateStr}</text>`);
    } else {
      out.push(`<text x="${px+6}" y="${y}" text-anchor="start" font-family="Arimo,Arial,sans-serif" font-size="10.5" font-weight="bold" fill="${gc}">${gateStr}</text>`);
      out.push(`<text x="${px+pw-18}" y="${y}" text-anchor="middle" font-family="serif" font-size="12" fill="${sc}">${sym}</text>`);
    }
    if (i < activations.length-1)
      out.push(`<line x1="${px+6}" y1="${y+8}" x2="${px+pw-6}" y2="${y+8}" stroke="${titleClr}" stroke-width="0.3" opacity="0.15"/>`);
  });
  return out.join('\n');
}

function generateBodygraph(data) {
  const definedCenters   = new Set(data.centers.defined);
  const personalityGates = new Set((data.gates&&data.gates.personalityGates)||[]);
  const designGates      = new Set((data.gates&&data.gates.designGates)||[]);
  const hangingGates     = new Set([
    ...((data.gates&&data.gates.hangingOpen)||[]),
    ...((data.gates&&data.gates.hangingClosed)||[]),
  ]);
  const allActiveGates = new Set([...personalityGates,...designGates]);

  const activeChannelIds = new Set();
  for (const ch of data.channels) {
    const id = ch.id||ch.gates||'';
    activeChannelIds.add(id);
    activeChannelIds.add(id.split('-').reverse().join('-'));
  }

  const W=800, H=660, cx=400;
  const C = getCenters(cx);
  const P = getPoints(cx);

  const channelEP = {
    'Head-Ajna':          [P.Head.bottom,   P.Ajna.top],
    'Ajna-Throat':        [P.Ajna.bottom,   P.Throat.top],
    'Throat-SolarPlexus': [P.Throat.right,  P.SolarPlexus.top],
    'Throat-Ego':         [P.Throat.right,  P.Ego.top],
    'Throat-G':           [P.Throat.bottom, P.G.top],
    'Throat-Sacral':      [P.Throat.bottom, P.Sacral.top],
    'Throat-Spleen':      [P.Throat.left,   P.Spleen.top],
    'G-Ego':              [P.G.right,       P.Ego.left],
    'G-Spleen':           [P.G.left,        P.Spleen.right],
    'G-Sacral':           [P.G.bottom,      P.Sacral.top],
    'Ego-Spleen':         [P.Ego.left,      P.Spleen.right],
    'Ego-SolarPlexus':    [P.Ego.left,      P.SolarPlexus.top],
    'Sacral-Root':        [P.Sacral.bottom, P.Root.top],
    'Sacral-Spleen':      [P.Sacral.left,   P.Spleen.right],
    'Sacral-SolarPlexus': [P.Sacral.right,  P.SolarPlexus.left],
    'Root-SolarPlexus':   [P.Root.right,    P.SolarPlexus.bottom],
    'Root-Spleen':        [P.Root.left,     P.Spleen.bottom],
  };

  const activePairs = new Set();
  for (const [id,[a,b]] of Object.entries(ALL_CHANNELS)) {
    if (activeChannelIds.has(id)||activeChannelIds.has(id.split('-').reverse().join('-')))
      activePairs.add(a+'-'+b);
  }

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  out.push(`<defs>
  <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FEFCFA"/>
    <stop offset="100%" stop-color="${B.cream}"/>
  </linearGradient>
  <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${B.goldLight}"/>
    <stop offset="100%" stop-color="${B.gold}"/>
  </linearGradient>
  <filter id="sh" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="${B.graphite}" flood-opacity="0.08"/>
  </filter>
</defs>`);

  out.push(`<rect width="${W}" height="${H}" fill="url(#bgG)"/>`);
  out.push(`<rect x="32" y="15" width="${W-64}" height="1" fill="${B.gold}" opacity="0.3"/>`);

  // Силуэт
  out.push(`<g opacity="0.18" fill="${B.silhouette}">`);
  out.push(`<ellipse cx="${cx}" cy="52" rx="38" ry="48"/>`);
  out.push(`<path d="M${cx-58},100 C${cx-78},128 ${cx-92},168 ${cx-96},218 C${cx-100},272 ${cx-96},330 ${cx-86},384 C${cx-76},434 ${cx-62},482 ${cx-54},526 C${cx-44},562 ${cx-34},596 ${cx},606 C${cx+34},596 ${cx+44},562 ${cx+54},526 C${cx+62},482 ${cx+76},434 ${cx+86},384 C${cx+96},330 ${cx+100},272 ${cx+96},218 C${cx+92},168 ${cx+78},128 ${cx+58},100 C${cx+32},106 ${cx+16},110 ${cx},110 C${cx-16},110 ${cx-32},106 ${cx-58},100 Z"/>`);
  out.push(`</g>`);

  // Планетные панели
  const dActs = (data.activations&&data.activations.design)||[];
  const pActs = (data.activations&&data.activations.personality)||[];
  out.push(drawPlanetPanel(dActs, true,  8,   118, 115, allActiveGates));
  out.push(drawPlanetPanel(pActs, false, 674, 118, 115, allActiveGates));

  // ── 1. Неактивные каналы (двойные серые) ──
  for (const [key,[[x1,y1],[x2,y2]]] of Object.entries(channelEP)) {
    if (activePairs.has(key)) continue;
    out.push(dualLine(x1,y1,x2,y2,B.chanOff,1.5));
  }

  // ── 2. Hanging gate half-channels ──
  for (const gate of hangingGates) {
    const gCenter = GATE_CENTER_MAP[gate];
    const chInfo  = GATE_TO_CHANNEL[gate];
    if (!gCenter||!chInfo) continue;
    const [centerA,centerB] = chInfo.centers;
    const ep = channelEP[centerA+'-'+centerB];
    if (!ep) continue;
    const [[x1,y1],[x2,y2]] = ep;
    let sx,sy,ex,ey;
    if (gCenter===centerA) { sx=x1;sy=y1;ex=x1+(x2-x1)*0.44;ey=y1+(y2-y1)*0.44; }
    else                   { sx=x2;sy=y2;ex=x2+(x1-x2)*0.44;ey=y2+(y1-y2)*0.44; }
    const isP=personalityGates.has(gate), isD=designGates.has(gate);
    const col = (isP&&isD)?B.gold : isP?B.graphite : isD?B.red : B.chanOff;
    out.push(dualLine(sx,sy,ex,ey,col,2.5));
  }

  // ── 3. Активные каналы ──
  for (const key of activePairs) {
    const ep = channelEP[key];
    if (!ep) continue;
    const [[x1,y1],[x2,y2]] = ep;
    let chGates=null;
    for (const [id,cs] of Object.entries(ALL_CHANNELS))
      if (cs[0]+'-'+cs[1]===key) { chGates=id.split('-').map(Number); break; }
    const anyP = chGates&&(personalityGates.has(chGates[0])||personalityGates.has(chGates[1]));
    const anyD = chGates&&(designGates.has(chGates[0])||designGates.has(chGates[1]));
    const col = (anyP&&anyD)?B.graphite : anyP?B.graphite : anyD?B.red : B.gold;
    const w   = (anyP&&anyD) ? 2.5 : 2.5;
    if (anyP&&anyD) {
      out.push(dualLine(x1,y1,x2,y2,B.graphite,w));
      out.push(dualLine(x1,y1,x2,y2,B.red,w));
    } else {
      out.push(dualLine(x1,y1,x2,y2,col,w));
    }
  }

  // ── 4. Центры ──
  for (const [name,c] of Object.entries(C)) {
    const isDef  = definedCenters.has(name);
    const fill   = isDef ? 'url(#goldG)' : B.cream;
    const stroke = isDef ? B.gold        : '#C0AEA0';
    out.push(`<g filter="url(#sh)">${drawCenter(c,fill,stroke)}</g>`);
  }

  // ── 5. Ворота ──
  for (const [name,c] of Object.entries(C)) {
    for (const [gate,dx,dy] of (GATE_OFFSETS[name]||[])) {
      const gx = c.shape==='rect' ? c.x+c.w/2+dx : c.cx+dx;
      const gy = c.shape==='rect' ? c.y+c.h/2+dy : c.cy+dy;
      out.push(drawGate(gate,gx,gy,personalityGates.has(gate),designGates.has(gate)));
    }
  }

  // ── Footer ──
  const t = data.chart;
  out.push(`<rect x="0" y="${H-62}" width="${W}" height="62" fill="${B.graphite}"/>`);
  out.push(`<rect x="32" y="${H-62}" width="${W-64}" height="1" fill="${B.gold}" opacity="0.4"/>`);
  out.push(`<text x="${cx}" y="${H-38}" text-anchor="middle" font-family="Arimo,Arial,sans-serif" font-size="14" font-weight="bold" letter-spacing="1.5" fill="${B.cream}">${t.type.toUpperCase()} · ${t.profile}</text>`);
  out.push(`<text x="${cx}" y="${H-18}" text-anchor="middle" font-family="Arimo,Arial,sans-serif" font-size="10" letter-spacing="0.8" fill="${B.goldLight}">${t.authority} · ${t.definition}</text>`);

  out.push(`</svg>`);
  return out.join('\n');
}

module.exports = { generateBodygraph };
