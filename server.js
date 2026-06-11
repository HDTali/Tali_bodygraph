/**
 * server.js
 * Express-сервер: принимает JSON от THD API, возвращает PNG бодиграфа
 *
 * POST /bodygraph  — body = полный JSON от THD API → отдаёт image/png
 * GET  /health     — проверка работоспособности
 */

const express = require('express');
const fs        = require('fs');
const path      = require('path');
const sharp     = require('sharp');

// Canva-шаблонный рендерер (основной)
const { renderBodygraph } = require('./render_canva');
// Программный рендерер (fallback / debug)
const { generateBodygraph } = require('./bodygraph');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// ─── Healthcheck ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'bodygraph-generator' });
});

// ─── Убираем дублированные id= перед конвертацией ────────────────────────────
// Canva SVG содержит элементы с двумя id= (технически невалидно).
// sharp/librsvg могут не пережевать такой файл — убираем второй id= из каждого тега.
function sanitizeSvg(svgString) {
  // Для каждого тега: если есть два id="...", удаляем второй
  return svgString.replace(
    /(<[a-zA-Z][^>]*?\sid="[^"]*")((?:[^>]*?)\s)(id="[^"]*")/g,
    '$1$2'
  );
}

// ─── SVG → PNG через sharp ────────────────────────────────────────────────────
async function svgToPng(svgString) {
  const clean = sanitizeSvg(svgString);
  const buf   = Buffer.from(clean, 'utf-8');
  return await sharp(buf, { density: 150 }).png().toBuffer();
}

// ─── SVG-превью (без ImageMagick, для тестирования) ──────────────────────────
app.post('/bodygraph/svg', (req, res) => {
  try {
    const data = req.body;
    if (!data?.centers || !data?.gates) {
      return res.status(400).json({ error: 'Нужны поля centers и gates' });
    }
    const svg = renderBodygraph(data);
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Генерация PNG ────────────────────────────────────────────────────────────
app.post('/bodygraph', async (req, res) => {
  try {
    const data = req.body;

console.log('CENTERS:', JSON.stringify(data.centers));
console.log('CHANNELS[0]:', JSON.stringify(data.channels?.[0]));
console.log('GATES keys:', JSON.stringify(Object.keys(data.gates || {})));
    if (!data?.centers || !data?.gates) {
      return res.status(400).json({
        error: 'Нужен полный JSON от THD API (с полями centers и gates)'
      });
    }

    // mode=debug → программный рендерер; по умолчанию → Canva-шаблон
    const useDebug = req.query.mode === 'debug';
    const svg = useDebug ? generateBodygraph(data) : renderBodygraph(data);
    const png = await svgToPng(svg);

    res.set('Content-Type', 'image/png');
    res.send(png);

  } catch (err) {
    console.error('Ошибка:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Bodygraph service запущен: http://localhost:${PORT}`);
});
