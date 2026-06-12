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

/**
 * Accepts either raw THD API response OR already-mapped internal format.
 * Returns internal format: { centers, gates, activations, channels, chart, variables }
 */
function mapTHDData(raw) {
  // Already in internal format?
  if (raw.activations || (raw.gates && raw.gates.personalityGates)) return raw;

  // Raw THD API — may be wrapped in { success, data } or be the data object directly
  const d = (raw.success !== undefined && raw.data) ? raw.data : raw;

  // Centers
  const defined = (d.centers && d.centers.defined || [])
    .map(function(n){ return CENTER_MAP[n.toLowerCase()] || n; });

  // Activations & gates
  const pActs = [], dActs = [], pGates = [], dGates = [];

  PLANET_ORDER.forEach(function(pl) {
    var pObj = d.personality && d.personality[pl];
    if (pObj && pObj.activation) {
      var a = pObj.activation;
      pGates.push(Number(a.gate));
      pActs.push({
        planet: pl,
        gate: a.gate,
        line: a.line,
        ctb: a.color + '.' + a.tone + '.' + a.base,
        zodiac: ZOD_SYM[pObj.astrology && pObj.astrology.sign] || ''
      });
    }
    var dObj = d.design && d.design[pl];
    if (dObj && dObj.activation) {
      var b = dObj.activation;
      dGates.push(Number(b.gate));
      dActs.push({
        planet: pl,
        gate: b.gate,
        line: b.line,
        ctb: b.color + '.' + b.tone + '.' + b.base,
        zodiac: ZOD_SYM[dObj.astrology && dObj.astrology.sign] || ''
      });
    }
  });

  return {
    centers:     { defined: defined },
    gates:       { personalityGates: pGates, designGates: dGates },
    activations: { personality: pActs, design: dActs },
    channels:    d.channels || [],
    chart: {
      type:       d.chart && d.chart.type,
      profile:    d.chart && d.chart.profile,
      authority:  d.chart && d.chart.authority,
      definition: d.chart && d.chart.definition,
      variable:   d.chart && d.chart.variable
    }
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/health', function(req, res) {
  res.json({ ok: true, service: 'bodygraph-generator' });
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
    const data = mapTHDData(req.body || {});
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
