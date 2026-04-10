# Прокси для отзывов

Браузер с GitHub Pages **не может** безопасно хранить `X-API-Key` и часто получает **Failed to fetch** из‑за **CORS** при прямом запросе на другой домен.

Этот сервис:

1. Принимает `POST /feedback` с телом `{"tool_name","session_id","is_useful","comment"}` (как у upstream `POST /api/external/feedback`) **без** ключа.
2. Подставляет `X-API-Key` из **`FEEDBACK_API_KEY`** (только на сервере).
3. Пересылает запрос на `UPSTREAM_FEEDBACK_URL` (по умолчанию `https://ap-experiment-zone.onrender.com/api/external/feedback`).

## Локально

```bash
cd feedback-proxy
cp .env.example .env
# Впишите FEEDBACK_API_KEY в .env
npm install
npm start
```

Откройте **http://127.0.0.1:8787/** — в `index.html` задайте (в `<head>`):

```js
window.FEEDBACK_PROXY_BASE = 'http://127.0.0.1:8787';
```

## Деплой (Render)

1. New **Web Service**, root directory: `feedback-proxy`.
2. Build: `npm install` · Start: `npm start`.
3. Environment: **`FEEDBACK_API_KEY`** = ваш ключ (как в спецификации API).
4. Опционально **`ALLOWED_ORIGINS`** = `https://ваш-логин.github.io` (если не задано — разрешены все origins).

В **`index.html`** в `<head>` задано `window.FEEDBACK_PROXY_BASE` (сейчас продакшен: **`https://build-quiz.onrender.com`**). Запросы отзывов идут на `…/feedback` этого же хоста. В корне репозитория **`render.yaml`** с сервисом **`build-quiz`** — при деплое из Blueprint URL должен совпадать; если имя сервиса другое, обновите `FEEDBACK_PROXY_BASE` в `index.html`.

Файл **`.env` не коммитьте** — он уже в `.gitignore` в корне репозитория.
