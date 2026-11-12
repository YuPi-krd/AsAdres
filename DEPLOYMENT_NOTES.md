# АсАдрес: подготовка к Docker/VPS

## Что добавлено в этой копии

- `Dockerfile.frontend` — сборка Next.js в standalone-режиме.
- `Dockerfile.backend` — FastAPI + Python 3.12.
- `docker-compose.yml` — PostgreSQL, backend, frontend и Caddy с автоматическим HTTPS.
- `.env.example` — список переменных без реальных секретов.
- `requirements.txt` перекодирован из UTF-16 в UTF-8, чтобы `pip` мог читать его в Linux.
- `app/database.py`: проверка `DATABASE_URL`, `pool_pre_ping`, без печати строки подключения.
- `app/main.py`: миграции схемы останавливают запуск при ошибке; добавлен лимит загрузки изображений 15 МБ; CORS можно дополнить через `CORS_ORIGINS`.
- CRM-формы продажи и аренды добавляют Bearer-токен к операциям создания/изменения объекта, публикации и загрузки/синхронизации фотографий.
- Прямые ссылки frontend на `https://doma-nq4u.onrender.com` переведены на `NEXT_PUBLIC_API_URL`; резервный адрес для локальной разработки — `http://localhost:8000`.

## Важно перед запуском

1. Не запускайте compose с пустыми секретами. Скопируйте `.env.example` в `.env`, задайте `POSTGRES_PASSWORD`, `SECRET_KEY`, реальные домены и ключи.
2. Новые фотографии сохраняются в постоянный Docker volume `property_images`; Cloudinary для новых загрузок не требуется. Старые Cloudinary URL в существующих записях останутся внешними ссылками и сами на диск не перенесутся.
3. В `docker-compose.yml` создаётся отдельная PostgreSQL на VPS. Если проект запускается с нуля и старые данные не нужны, перенос из Neon/Render не требуется. Если нужно сохранить старые объекты, заявки и пользователей — сделайте backup/restore до переключения сайта.
4. До production-публикации требуется настроить DNS и HTTPS: в архив добавлены `Caddyfile` и сервис Caddy, который получает TLS-сертификаты автоматически. Откройте на VPS порты 80/443; PostgreSQL не публикуется наружу.
5. `NEXT_PUBLIC_API_URL` встраивается в frontend при сборке. После его изменения frontend нужно пересобрать.
6. Архив исходного проекта содержал `.git` и `.env.local`. Они не включены в эту исправленную копию. Не публикуйте `.git` и не коммитьте реальные `.env`-файлы.

## Проверки

- Python-файлы прошли `compile()` без синтаксических ошибок.
- TS/TSX-файлы прошли проверку синтаксического преобразования TypeScript без синтаксических diagnostics.
- Полный `npm ci`/`next build` не удалось завершить в этой среде из-за тайм-аута загрузки зависимостей.
- Реальная PostgreSQL, авторизация с действующими Telegram-ботами и браузерные сценарии ещё не проверялись. Переменные обоих Telegram-ботов теперь проброшены в Docker backend; webhook URL берётся из `PUBLIC_API_URL`.

## Защищённая серверная сессия админки

После успешного подтверждения входа frontend проверяет токен через backend `/me` и сохраняет его в HttpOnly cookie `doma_admin_session` через `POST /api/auth/session`. Серверные страницы `/admin/*` используют `lib/serverApi.ts`, который добавляет этот токен к запросам backend. При выходе cookie очищается через `DELETE /api/auth/session`. Не ослабляйте backend middleware и не открывайте административные API без Bearer-токена.

## Telegram на VPS

Сохраните прежние значения `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_ADMIN_USER_ID`, `TELEGRAM_WEBHOOK_SECRET`, `DEVELOPER_BOT_TOKEN`, `DEVELOPER_TELEGRAM_ID` и `DEVELOPER_BOT_SECRET` в серверном `.env`. Укажите `PUBLIC_API_URL=https://api.ВАШ-ДОМЕН` и настройте HTTPS reverse proxy до backend. При запуске backend регистрирует оба webhook на этом адресе. Токены не помещайте в Git и не отправляйте в публичные сообщения.

## Данные и фотографии

Docker Compose создаёт новую PostgreSQL базу в томе `postgres_data`. Новые фотографии сохраняются в постоянный том `property_images`; отдельный Cloudinary-аккаунт не требуется. При создании резервной копии сохраняйте оба тома. Если база будет пустой с самого начала, перенос из Neon/Render не нужен. Если в старой базе есть нужные объекты или заявки, потребуется отдельно перенести данные и скачать старые Cloudinary-фотографии на VPS.

## Запуск на VPS

1. Скопируйте `.env.example` в `.env` и заполните домены, секреты, ключ Яндекс Карт и оба набора Telegram-переменных.
2. Создайте DNS A-записи `FRONTEND_DOMAIN` и `API_DOMAIN` на IPv4 VPS. Разрешите входящие TCP 80/443.
3. Если начинаете с пустой базы, просто запустите PostgreSQL через Docker Compose. Если нужно сохранить старые объекты и заявки, сначала сделайте backup старой БД и восстановите его в локальную PostgreSQL. Новые изображения сохраняются в `property_images`; для резервной копии сохраняйте и `postgres_data`, и `property_images`.
4. Соберите и запустите: `docker compose up -d --build`.
5. Проверьте `https://FRONTEND_DOMAIN`, `https://API_DOMAIN/health`, вход в админку, заявки, объекты и оба Telegram webhook.
6. Не удаляйте старую базу/хостинг, пока не проверены все данные и сценарии на VPS.

Для входа админки используется HttpOnly cookie `doma_admin_session`. Серверный helper `lib/serverApi.ts` прикладывает токен к SSR-запросам. Backend продолжает проверять Bearer-токен и Telegram 2FA; защита API не отключалась.
