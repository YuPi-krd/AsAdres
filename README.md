# АсАдрес — агентство недвижимости

Проект включает публичный сайт, каталог, CRM, административную панель, FastAPI backend, PostgreSQL и две Telegram-интеграции (подтверждение входа и управление сессиями разработчиком).

## Локальный запуск

1. Установите Node.js 22 и Python 3.12.
2. Создайте `.env` на основе `.env.example` и задайте параметры PostgreSQL, `SECRET_KEY`, Telegram и Cloudinary.
3. Backend: `pip install -r requirements.txt`, затем `uvicorn app.main:app --reload --port 8000`.
4. Frontend: `npm ci`, затем `npm run dev`.
5. Откройте `http://localhost:3000`.

## VPS / Docker

См. `DEPLOYMENT_NOTES.md`. Для автоматического HTTPS используются `Caddyfile` и сервис Caddy в `docker-compose.yml`. Перед переключением на новую БД необходимо перенести дамп действующей PostgreSQL.

## Важные переменные

- `DATABASE_URL` формируется Docker Compose из параметров PostgreSQL.
- `PUBLIC_API_URL` — HTTPS-адрес backend, на который регистрируются оба Telegram webhook.
- `NEXT_PUBLIC_API_URL` — публичный URL API, встраивается в frontend при сборке.
- `TELEGRAM_*` — действующий бот подтверждения входа.
- `DEVELOPER_*` — отдельный бот разработчика для завершения сессий.
- `CLOUDINARY_*` — текущий сервис загрузки изображений.

Не добавляйте `.env`, токены, пароли или `.git` в публичный архив.
