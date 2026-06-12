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

app.get('/health', function(req, res) {
  res.json({ ok: true, service: 'bodygraph-generator' });
});

async function svgToPng(svgString) {
  const buf = Buffer.from(svgString, 'utf-8');
  return await sharp(buf, { density: 150 }).png().toBuffer();
}

app.post('/bodygraph/svg', function(req, res) {
  try {
    const data = req.body;
    if (!data || !data.centers || !data.gates) {
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
    const data = req.body;
    if (!data || !data.centers || !data.gates) {
      return res.status(400).json({ error: 'Нужен полный JSON от THD API (с полями centers и gates)' });
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
