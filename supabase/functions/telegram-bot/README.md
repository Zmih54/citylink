# CityLink — Telegram-бот підтримки

Бот працює як **Supabase Edge Function** (webhook) і використовує ту саму базу,
що й сайт: таблиці `subscribers`, `tariffs`, `transactions` + нові `telegram_*`.

## Можливості

- **Команди:** `/start`, `/help`, `/balance`, `/tariff`, `/history`, `/pay [сума]`,
  `/link`, `/logout`, `/operator`, `/menu` + інтерактивне меню (inline-кнопки).
- **Прив'язка акаунта:** `/link` → номер договору + пароль (звіряється через RPC
  `subscriber_check_password`). Повідомлення з паролем бот одразу видаляє.
- **Дані рахунку:** баланс, тариф, історія операцій — для прив'язаного абонента.
- **ШІ (Claude Haiku):** на типові запитання (тарифи, оплата, підключення, базові
  несправності) бот відповідає сам. Складні/конкретні питання та прямі прохання
  «оператора» — автоматично передаються у чат операторів (`ADMIN_CHAT_ID`).
- **Відповідь оператора:** оператор у своєму чаті відповідає **reply** на переслане
  запитання — бот ретранслює відповідь користувачу.
- **Оплата:** `/pay` пропонує (1) посилання на Приват24 і (2) оплату карткою через
  LiqPay із миттєвим зарахуванням на баланс (через `liqpay-callback`).

## Налаштування (одноразово)

1. **Створіть бота** у @BotFather → отримайте `TELEGRAM_BOT_TOKEN`.
2. **Секрети функцій** (Supabase CLI):
   ```bash
   supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=... \
     ANTHROPIC_API_KEY=... ADMIN_CHAT_ID=-100... \
     LIQPAY_PUBLIC_KEY=... LIQPAY_PRIVATE_KEY=... \
     LIQPAY_CALLBACK_URL=https://<ref>.functions.supabase.co/liqpay-callback
   ```
   (`SUPABASE_URL` і `SUPABASE_SERVICE_ROLE_KEY` додаються платформою автоматично.)
3. **Деплой:**
   ```bash
   supabase db push                       # застосувати міграцію 0002_telegram.sql
   supabase functions deploy telegram-bot
   supabase functions deploy liqpay-callback
   ```
4. **Підключіть webhook Telegram:**
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d "url=https://<ref>.functions.supabase.co/telegram-bot" \
     -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
   ```
5. **Чат операторів:** додайте бота у вашу робочу групу, увімкніть йому доступ до
   повідомлень (або зробіть адміном), і впишіть ID групи в `ADMIN_CHAT_ID`
   (ID групи можна дізнатись, переславши будь-яке її повідомлення боту @userinfobot,
   або з логів функції).

## Безпека

- Webhook захищено секретним заголовком (`TELEGRAM_WEBHOOK_SECRET`).
- Сервісний ключ Supabase використовується лише на сервері (Edge Function), у
  фронтенд не потрапляє.
- LiqPay-колбек перевіряє підпис; баланс поповнюється лише після валідного платежу.
- Таблиці `telegram_*` закриті RLS — доступ лише через сервісну роль.

## Приват24 проти LiqPay

Приват24 не має відкритого API для оплати на довільного отримувача, тому бот, як і
сайт, дає посилання на `next.privat24.ua` з номером договору й сумою (зарахування —
вручну біллінгом). LiqPay (сервіс ПриватБанку) — це повноцінна оплата карткою з
автоматичним зарахуванням на баланс. Тому доступні обидва варіанти.
