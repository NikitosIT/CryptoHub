# <span style="color: #fff">Crypto</span><span style="color: #fb923c">Hub</span>

**CryptoHub** is a cryptocurrency news platform that integrates with Telegram and OpenAI to automatically publish posts on the website.
Using AI, the system automatically detects which cryptocurrency a post is related to, allowing users to easily filter posts by a specific coin. Users can interact with posts by leaving reactions, which are instantly reflected in their profile.

- **Stack:** React 19, Vite 7, TypeScript, TanStack Router, React Query, Supabase (auth + API), MUI, Tailwind CSS
- **Features:** Auth (Google + email OTP), two-factor authentication, profile with avatar, posts feed with reactions/favorites, comments with media, token and author filters

---

## Setup & install

From the project root (e.g. where `package.json` is):

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

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Other commands:

```bash
npm run lint      # run ESLint
npm run test      # run Vitest
npm run router:gen   # regenerate TanStack Router route tree
```

---

## Environment

Create a `.env` (or `.env.local`) in `frontend/` with your Supabase URL and anon key so auth and API calls work:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from your [Supabase](https://supabase.com) project (Settings → API).
