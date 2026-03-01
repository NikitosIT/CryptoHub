# Telegram bot webhook setup

Telegram sends updates to a **public HTTPS URL**. Your `telegram-bot` Edge Function is that endpoint. You must tell Telegram where to send updates using **setWebhook**.

---

## Where to see logs

- **Production (Supabase hosted):** [Dashboard](https://supabase.com/dashboard) → your project → **Edge Functions** → select `telegram-bot` → **Logs**. You’ll see `console.log`, errors, and request info.
- **Local:** The function runs in the **Edge Runtime** container. To see logs:
  1. **Docker Desktop** → **Containers** → select **supabase_edge_runtime_tg-botik** → **Logs** tab. All `console.log` / `console.error` from `telegram-bot` appear here when a request hits the function.
  2. Or in a terminal: `supabase functions serve telegram-bot` (with `supabase start` in another). Logs stream in that terminal.

  Look for lines starting with `[telegram-bot]`: missing env, upsert errors, or "upsert ok".

## Production (Supabase hosted)

Your function URL is:

```
https://figtowlbngryusuutsfo.supabase.co/functions/v1/telegram-bot
```

Set the webhook (run once, or when you change the URL):

```bash
# Replace YOUR_BOT_TOKEN with your real bot token (from @BotFather)
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://figtowlbngryusuutsfo.supabase.co/functions/v1/telegram-bot"
```

Check that it’s set:

```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

Remove the webhook (e.g. to switch back to polling):

```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook"
```

**Required:** Set these secrets on the Supabase project so the function can run:

- `TELEGRAM_BOT_TOKEN` – from @BotFather
- `MY_SUPABASE_URL` – your project URL (e.g. `https://figtowlbngryusuutsfo.supabase.co`)
- `MY_SUPABASE_SERVICE_ROLE_KEY` – project Service Role key (Dashboard → Settings → API)

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=your_token
supabase secrets set MY_SUPABASE_URL=https://figtowlbngryusuutsfo.supabase.co
supabase secrets set MY_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Local development

Telegram **cannot** call `http://127.0.0.1:56001`. You need a tunnel that exposes your local function with a **public HTTPS** URL.

### 1. Start Supabase (function is already served)

```bash
supabase start
```

Your function is at `http://127.0.0.1:56001/functions/v1/telegram-bot` (use the **API port** from `supabase status` if different).

### 2. Expose it with a tunnel

**Option A – ngrok**

```bash
# Install ngrok, then (use the API port from supabase status, e.g. 56001):
ngrok http 56001
```

Use the HTTPS URL ngrok gives you (e.g. `https://abc123.ngrok-free.app`). The full webhook URL is:

`https://abc123.ngrok-free.app/functions/v1/telegram-bot`

**Option B – Cloudflare Tunnel (cloudflared)**

```bash
cloudflared tunnel --url http://127.0.0.1:56001
```

Use the generated `https://xxx.trycloudflare.com` plus path:  
`https://xxx.trycloudflare.com/functions/v1/telegram-bot`

### 3. Set the webhook to the tunnel URL

```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_TUNNEL_URL/functions/v1/telegram-bot"
```

### 4. Local env for the function (required for posts to hit local DB)

In `supabase/.env` set **all three**; otherwise the function returns 200 but does **not** write to the DB:

- `TELEGRAM_BOT_TOKEN` – from @BotFather
- `MY_SUPABASE_URL` – use **`http://host.docker.internal:56001`** (replace `56001` with your API port from `supabase status`). The function runs inside Docker; `127.0.0.1` would point to the container, so `host.docker.internal` is required to reach the API on the host.
- `MY_SUPABASE_SERVICE_ROLE_KEY` – **Secret** key from `supabase status` (not "Publishable")

If either is missing, logs show: `[telegram-bot] Missing env: ... Posts will NOT be saved.`

Each time you restart the tunnel you get a **new URL**, so you must call **setWebhook** again with the new URL. For stable local testing, use ngrok’s reserved domain or keep the same tunnel session.
