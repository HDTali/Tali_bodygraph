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

// ─── Фоновый PNG (извлечён из Canva-шаблона) ─────────────────────────────────
const BACKGROUND_PATH = path.join(__dirname, 'background.png');
const BACKGROUND_BUF  = fs.existsSync(BACKGROUND_PATH)
  ? fs.readFileSync(BACKGROUND_PATH)
  : null;

// ─── SVG → PNG через sharp + compositing с фоном ─────────────────────────────
async function svgToPng(svgString) {
  // Убираем embedded <image> из SVG — фон подкладываем отдельно
  const noImg = svgString.replace(/<image[^>]*\/>/g, '').replace(/<image[^>]*>[\s\S]*?<\/image>/g, '');
  const clean = sanitizeSvg(noImg);
  const buf   = Buffer.from(clean, 'utf-8');

  // Рендерим прозрачный SVG-оверлей
  const overlay = await sharp(buf, { density: 150 }).png().toBuffer();
  const { width, height } = await sharp(overlay).metadata();

  if (!BACKGROUND_BUF) {
    // Нет фона — возвращаем просто SVG как PNG
    return overlay;
  }

  // Масштабируем фон под размер оверлея
  // Видимая область фонового PNG: первые ~850px по ширине и высоте (SVG viewBox = 850.5)
  const CROP_W = 850, CROP_H = 850;
  const bg = await sharp(BACKGROUND_BUF)
    .extract({ left: 0, top: 0, width: CROP_W, height: CROP_H })
    .resize(width, height)
    .png()
    .toBuffer();

  // Склеиваем: фон + оверлей
  return await sharp(bg)
    .composite([{ input: overlay, blend: 'over' }])
    .png()
    .toBuffer();
}

// ─── SVG-превью (без ImageMagick, для тестирования) ──────────────────────────
app.post('/bodygraph/svg', (req, res) => {
  try {
    const data = req.body;
    if (!data?.centers || !data?.gates) {
      return