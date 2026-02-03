# CryptoHub

**CryptoHub** is a cryptocurrency news platform that integrates with **Telegram** and **OpenAI** to automatically publish posts on the website.

Using AI, the system detects which cryptocurrency a post is related to, allowing users to easily filter content by a specific token. Users can interact with posts by leaving reactions and comments, which are instantly reflected in their profile.

The project uses **Supabase as a backend** — authentication, database, API, and storage are handled there.

---

## 🧱 Tech stack

### Frontend

- React
- Vite
- JavaScript
- TypeScript
- TanStack Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- MUI
- Tailwind CSS

### Backend (Supabase)

- Authentication (Email OTP + Google OAuth)
- PostgreSQL
- Row Level Security (RLS)
- Storage (avatars, media)
- RPC functions
- Edge Functions

---

## ✨ Features

- 🔐 Authentication (Google OAuth + Email OTP)
- 🔑 Optional Two-Factor Authentication (TOTP)
- 📰 Telegram posts feed with pagination
- 🤖 AI-based token detection (OpenAI)
- 👍 Reactions & favorites (optimistic updates)
- 💬 Comments with media attachments
- 🔍 Filters by token and author
- 👤 User profile with avatar

---

## 🚀 Setup & install

From the project root:

```bash
cd frontend

```

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Other commands:

```bash
npm run build       # production build
npm run preview     # preview production build
npm run lint        # ESLint
npm run test        # Vitest
npm run router:gen  # regenerate TanStack Router tree

```

---

## Environment

Create a `.env` (or `.env.local`) in `frontend/` with your Supabase URL and anon key so auth and API calls work:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from your [Supabase](https://supabase.com) project (Settings → API).

## 🗄️ Supabase setup

**This project expects the Supabase backend to have:**
Auth enabled (Email + Google)
Required database tables
RLS policies
Storage buckets (user_avatars, comment media, tg_media)
RPC / Edge Functions
⚠️ The SQL schema and functions are not auto-provisioned yet and must be set up manually.
