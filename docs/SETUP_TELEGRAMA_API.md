В данной статье я хочу поделиться тем, как можно взаимодействовать С Telegram через свой Backend, в моем случае это Express.js + Prisma, но поняв что я сейчас обьясню вы сможете это реализовать на чем угодно.
Перед мной стояла задача добавлять различные посты в свою тг группу, с которой посты должны были автоматически добавляться в базу данных

1. Создание бота. Зайдите в телеграм и найдите BotFather, создайте своего бота и получите уникальный токен, который вам нужно положить в .env

```bash
TELEGRAM_BOT_TOKEN=<YOUR_BOT_TOKEN>
```

2. Создайте Telegram группу, не имеет значение приватную или публичную и сделайте админом бота которого вы создали ранее.

3. Так как мы работаем в локалке, то нам нужен тунель, делать можно через cloudfare or ngrok, я буду делать через ngrok, если хотите делать сразу для прода, тогда нужен домен , но пока мы разбираем именно локальную разработку. пишем ngrok http <Your Port> он выдаст бесплатный url который впоследствиее выдаст что вроде такого "Forwarding  https://worshippingly-heartless-mora.ngrok-free.dev -> http://localhost:5000"  

Это Url подставляем сюда - curl "https://api.telegram.org/<BOT_TOKEN>/setWebhook?url=<YOUR TUNNEL>", После введения команды в терминале вы должны увидеть такое сообщенияе - 

Пример curl "https://api.telegram.org/7220733969:AAGP_nVS_lRDc2WpqGNbpYLa0Hfzl7b-N3s/setWebhook?url=https://worshippingly-heartless-mora.ngrok-free.dev/api/telegram" Не забываем указать роут в конце

"{"ok":true,"result":true,"description":"Webhook is already set"}" значит вы успешно подключились

Проверить установлен ли вебхук curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
Удалить связь curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"



