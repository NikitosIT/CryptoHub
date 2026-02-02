**CryptoHub**

CryptoHub is a cryptocurrency news platform that integrates with Telegram and OpenAI to automatically publish posts on the website.

Using AI, the system automatically detects which cryptocurrency a post is related to, allowing users to easily filter posts by a specific coin. Users can interact with posts by leaving reactions, which are instantly reflected in their profile.

**Authentication & Security**

1. Email registration with OTP code confirmation
2. Google authentication for quick and easy sign-in
3. Optional Two-Factor Authentication (2FA) for enhanced security
4. When enabled, 2FA is required on every login

**Features**

1. AI-powered cryptocurrency detection for posts
2. Filtering posts by cryptocurrency
3. Optimistic UI updates for comments
4. Secure authentication with optional 2FA
5. Clean and modern UI with responsive design
6. Pagination for posts

**Tech Stack**
Frontend

1. State management (server state): TanStack Query
2. Filters & client state: Zustand
3. Forms & inputs: React Hook Form
4. Validation: Zod
5. UI components: MUI
6. Styling: Tailwind CSS
7. Routing: TanStack Router
8. Testing: Vitest

Backend

1. Backend & Auth: Supabase
2. AI integration: OpenAI

---Setup & run---

**Setup**

1. Clone the repo and go to the frontend folder:
   cd frontend

2. Install dependencies:
   npm install

3. Start the dev server:
   npm run dev

   The app will be available at the port shown in the terminal.

**Other commands**

- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run test` — run tests (Vitest)
- `npm run lint` — run ESLint
- `npm run router:gen` — regenerate TanStack Router route tree
