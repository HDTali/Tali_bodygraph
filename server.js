'use strict';
/**
 * server.js
 * Express: принимает JSON от THD API -> PNG бодиграфа
 * POST /bodygraph     -- возвращает image/png
 * POST /bodygraph/svg -- возвращает image/svg+xml (для теста)
 * GET  /health        -- проверка
 */

const express = require('express');
const sharp   = require('sharp');
const { generateBodygraph } = require('./bodygraph');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// ─── THD API → internal format mapping ───────────────────────────────────────

const PLANET_ORDER = ['Sun','Earth','NorthNode','SouthNode','Moon','Mercury',
                      'Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

const ZOD_SYM = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓'
};

const CENTER_MAP = {
  head:'Head', ajna:'Ajna', throat:'Throat',
  g:'G', identity:'G', heart:'Ego', ego:'Ego',
  sacral:'Sacral', solar_plexus:'SolarPlexus', solarplexus:'SolarPlexus',
  spleen:'Spleen', root:'Root'
};

const VERSION = 'v20260614-fix33';

/**
 * Конвертирует personality/design в map {planet: obj}.
 * THD API может вернуть массив [{planet:"Sun",...}] ИЛИ объект {Sun:{...}}.
 */
function toActMap(src) {
  if (!src) return {};
  if (Array.isArray(src)) {
    var m = {};
    src.forEach(function(item){ if (item && item.planet) m[item.planet] = item; });
    return m;
  }
  return src; // уже объект
}

/**
 * Получить данные активации из объекта планеты.
 * Поддерживает плоский {gate,line,color,...} и вложенный {activation:{gate,...}}.
 */
function getAct(obj) {
  if (!obj) return null;
  var a = (obj.activation && obj.activation.gate != null) ? obj.activation : obj;
  return (a && a.gate != null) ? a : null;
}

/**
 * Вычислить variable из разных форматов THD API.
 */
function computeVariable(src) {
  var vt = (src.chart && src.chart.variableType) || '';
  if (vt.length >= 7) {
    return {
      personalityMotivation:  vt[1] === 'L' ? 'Left' : 'Right',
      personalityPerspective: vt[2] === 'L' ? 'Left' : 'Right',
      designDigestion:        vt[5] === 'L' ? 'Left' : 'Right',
      designEnvironment:      vt[6] === 'L' ? 'Left' : 'Right'
    };
  }
  return {
    designDigestion:        src.phs && src.phs.digestionOrientation,
    designEnvironment:      src.phs && src.phs.environmentOrientation,
    personalityMotivation:  src.ravePsychology && src.ravePsychology.motivationOrientation,
    personalityPerspective: src.ravePsychology && src.ravePsychology.perspectiveOrientation
  };
}

function addCtbToActs(acts) {
  return (acts || []).map(function(a) {
    var ctb = a.ctb;
    if (!ctb && a.color != null) ctb = a.color + '.' + a.tone + '.' + a.base;
    return Object.assign({}, a, {
      ctb: ctb || '',
      fixingState: a.fixingState || null,
      isRetrograde: a.isRetrograde || false
    });
  });
}

function mapTHDData(raw) {
  // Уже в internal format — добавляем variable и CTB если их нет
  if (raw.gates && raw.gates.personalityGates) {
    var variable = raw.variable || computeVariable(raw);
    console.log('[EARLY] variable=' + JSON.stringify(variable));
    var acts = raw.activations || {};
    var p0 = acts.personality && acts.personality[0];
    console.log('[EARLY] p0planet=' + (p0 && p0.planet) + ' p0gate=' + (p0 && p0.gate));
    return Object.assign({}, raw, {
      variable: variable,
      activations: {
        personality: addCtbToActs(acts.personality),
        design:      addCtbToActs(acts.design)
      }
    });
  }

  // Unwrap { success, data:{...} } или { data:{...} } → берём data если есть chart/personality
  const d = (raw.data && (raw.data.chart || raw.data.personality)) ? raw.data : raw;

  console.log('[MAP] version=' + VERSION +
    ' pType=' + (Array.isArray(d.personality) ? 'array['+d.personality.length+']' : typeof d.personality) +
    ' dType=' + (Array.isArray(d.design) ? 'array['+d.design.length+']' : typeof d.design));

  // Конвертируем personality/design в map {планета: объект}
  var pMap = toActMap(d.personality);
  var dMap = toActMap(d.design);

  // Centers
  const defined = (d.centers && d.centers.defined || [])
    .map(function(n){ return CENTER_MAP[n.toLowerCase()] || n; });

  const pActs = [], dActs = [], pGates = [], dGates = [];

  PLANET_ORDER.forEach(function(pl) {
    var pObj = pMap[pl];
    var a = getAct(pObj);
    if (a) {
      pGates.push(Number(a.gate));
      var pSign = (pObj.astrology && pObj.astrology.sign) || pObj.sign || a.sign || '';
      pActs.push({
        planet: pl,
        gate: a.gate,
        line: a.line,
        ctb: (a.color != null) ? a.color + '.' + a.tone + '.' + a.base : '',
        zodiac: ZOD_SYM[pSign] || '',
        fixingState: a.fixingState || null,
        isRetrograde: a.isRetrograde || false
      });
    }

    var dObj = dMap[pl];
    var b = getAct(dObj);
    if (b) {
      dGates.push(Number(b.gate));
      var dSign = (dObj.astrology && dObj.astrology.sign) || dObj.sign || b.sign || '';
      dActs.push({
        planet: pl,
        gate: b.gate,
        line: b.line,
        ctb: (b.color != null) ? b.color + '.' + b.tone + '.' + b.base : '',
        zodiac: ZOD_SYM[dSign] || '',
        fixingState: b.fixingState || null,
        isRetrograde: b.isRetrograde || false
      });
    }
  });

  console.log('[MAP] pActs=' + pActs.length + ' dActs=' + dActs.length +
    ' p0planet=' + (pActs[0] && pActs[0].planet) + ' p0gate=' + (pActs[0] && pActs[0].gate));

  // Variable: из variableType строки, иначе из phs/ravePsychology
  var variable;
  var vt = (d.chart && d.chart.variableType) || '';
  if (vt.length >= 7) {
    variable = {
      personalityMotivation:  vt[1] === 'L' ? 'Left' : 'Right',
      personalityPerspective: vt[2] === 'L' ? 'Left' : 'Right',
      designDigestion:        vt[5] === 'L' ? 'Left' : 'Right',
      designEnvironment:      vt[6] === 'L' ? 'Left' : 'Right'
    };
  } else {
    variable = {
      designDigestion:        d.phs && d.phs.digestionOrientation,
      designEnvironment:      d.phs && d.phs.environmentOrientation,
      personalityMotivation:  d.ravePsychology && d.ravePsychology.motivationOrientation,
      personalityPerspective: d.ravePsychology && d.ravePsychology.perspectiveOrientation
    };
  }
  console.log('[MAP] vt="' + vt + '" variable=' + JSON.stringify(variable));

  return {
    centers:     { defined: defined },
    gates:       { personalityGates: pGates, designGates: dGates },
    activations: { personality: pActs, design: dActs },
    channels:    d.channels || [],
    chart: {
      type:       d.chart && d.chart.type,
      profile:    d.chart && d.chart.profile,
      authority:  d.chart && d.chart.authority,
      definition: d.chart && d.chart.definition
    },
    variable: variable
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/health', function(req, res) {
  res.json({ ok: true, service: 'bodygraph-generator', version: VERSION });
});

// Диагностика: показывает структуру данных без генерации картинки
app.post('/inspect', function(req, res) {
  try {
    const raw = req.body || {};
    const d = (raw.data && (raw.data.chart || raw.data.personality)) ? raw.data : raw;
    const pSrc = d.personality;
    const dSrc = d.design;
    const pMap = toActMap(pSrc);
    const dMap = toActMap(dSrc);
    const sunP = pMap['Sun'];
    const sunA = getAct(sunP);
    res.json({
      version: VERSION,
      personalityType: Array.isArray(pSrc) ? 'array['+pSrc.length+']' : typeof pSrc,
      designType: Array.isArray(dSrc) ? 'array['+dSrc.length+']' : typeof dSrc,
      pMapKeys: Object.keys(pMap).slice(0,5),
      sunPersonality: sunP ? JSON.stringify(sunP).slice(0,200) : null,
      sunActivation: sunA ? JSON.stringify(sunA).slice(0,200) : null,
      variableType: d.chart && d.chart.variableType,
      phs: d.phs,
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

async function svgToPng(svgString) {
  const buf = Buffer.from(svgString, 'utf-8');
  return await sharp(buf, { density: 150 }).png().toBuffer();
}

app.post('/bodygraph/svg', function(req, res) {
  try {
    const data = mapTHDData(req.body || {});
    if (!data.centers || !data.gates) {
      return res.status(400).json({ error: 'Нужны поля centers и gates' });
    }
    const svg = generateBodygraph(data);
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/bodygraph', async function(req, res) {
  try {
    const raw = req.body || {};
    const d = (raw.data && (raw.data.chart || raw.data.personality)) ? raw.data : raw;
    console.log('[DBG] variableType:', d.chart && d.chart.variableType);
    const data = mapTHDData(raw);
    console.log('[DBG] variable after map:', JSON.stringify(data.variable));
    if (!data.centers || !data.gates) {
      return res.status(400).json({ error: 'Нужен полный JSON от THD API' });
    }
    const svg = generateBodygraph(data);
    const png = await svgToPng(svg);
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    console.error('Ошибка:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, function() {
  console.log('Bodygraph service started: http://localhost:' + PORT);
});
