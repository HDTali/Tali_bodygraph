# Деплой и настройка n8n для бодиграфа

## Что делает этот сервис

Принимает JSON от THD API → рисует SVG бодиграфа → конвертирует в PNG → отдаёт картинку.

Конвертация SVG→PNG: **sharp** (Node.js, не требует ImageMagick).

---

## Шаг 1. Деплой на Railway

1. Зайди на [railway.app](https://railway.app) → войди через GitHub
2. New Project → Deploy from GitHub repo → выбери репозиторий
3. Railway должен автоматически найти папку `bodygraph-service` как корень сервиса  
   (если нет — укажи Root Directory: `bodygraph-service`)
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Railway сам даст URL вида: `https://bodygraph-service-xxx.railway.app`

**Проверь:** открой `https://твой-url.railway.app/health` — должно вернуть `{"ok":true}`

---

## Шаг 2. Настройка в n8n

### Полная схема workflow:

```
Telegram Trigger
      ↓
Code Node (извлечь дату/время/место)
      ↓
HTTP Request → THD API (получить данные карты)
      ↓
HTTP Request → bodygraph-service (получить PNG)
      ↓
Telegram (отправить sendPhoto)
      ↓
Code Node (сформировать текст с типом, профилем, стратегией)
      ↓
Telegram (отправить текстовое сообщение)
```

---

## Шаг 3. Ноды n8n подробно

### HTTP Request → bodygraph-service

- **Method:** POST
- **URL:** `https://твой-url.railway.app/bodygraph`
- **Body Type:** JSON
- **Body:** `{{ $json }}` (передаём весь ответ от THD API)
- **Response Format:** File

### Telegram: sendPhoto

- **Operation:** Send Photo
- **Chat ID:** `{{ $('Telegram Trigger').item.json.message.chat.id }}`
- **Binary Property:** data (из предыдущего HTTP Request)
- **Caption:** 
```
🔮 Твоя карта Human Design готова!

Тип: Generator
Профиль: 1/4 — Исследователь Оппортунист
Стратегия: Ждать отклика
Авторитет: Эмоциональный
```

---

## Эндпоинты сервиса

| Эндпоинт | Метод | Возвращает | Для чего |
|---|---|---|---|
| `/health` | GET | JSON `{ok:true}` | Проверка работы |
| `/bodygraph` | POST | image/png | Основной (для Telegram) |
| `/bodygraph/svg` | POST | image/svg+xml | Тест в браузере |
| `/bodygraph?mode=debug` | POST | image/png | Программный рендерер |

---

## Тест локально

```bash
cd bodygraph-service
npm install
node server.js

# В другом терминале — тест SVG (открыть в браузере):
curl -X POST http://localhost:3000/bodygraph/svg \
  -H "Content-Type: application/json" \
  -d @test_data.json \
  --output bodygraph.svg

# Тест PNG:
curl -X POST http://localhost:3000/bodygraph \
  -H "Content-Type: application/json" \
  -d @test_data.json \
  --output bodygraph.png
```

---

## Зависимости

- **express** — HTTP сервер
- **sharp** — SVG → PNG конвертация (librsvg, не требует системных пакетов)

Никаких apt-get или системных зависимостей не нужно — sharp включает нативные бинарники.
