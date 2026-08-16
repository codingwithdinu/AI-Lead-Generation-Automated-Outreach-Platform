# AI Lead Generation & Automated Outreach Platform

An **AI-powered lead generation + automated outreach** platform for exporters, importers, MSMEs and trade chambers. It helps you **discover business opportunities, build a lead pipeline, and automatically run outreach** across **Email, WhatsApp & AI voice calls** — then book discovery meetings — all with minimal manual work.

> Original product brand: **TradeConnect AI**

---

## ✨ Features

- **AI Opportunity Discovery** — Find & match export/import opportunities for your business.
- **Lead Pipeline** — Capture, score & manage leads (`Hot`, `Warm`, `Cold`, etc.).
- **Automated Outreach** — AI-written messages delivered over Email, WhatsApp and Calls.
- **AI Call Scripts & Pre-Call Briefs** — Groq generates a talk-track and lead brief before every call.
- **Follow-up Sequences** — Automated multi-step follow-up plans.
- **Discovery Calls** — Schedule & track meetings automatically via a Calendly webhook.
- **Reports & Dashboard** — Funnel analytics and reporting.
- **Auth & Database** — Supabase (Postgres) + built-in authentication.
- **Marketing Landing Page** — Includes hero, how-it-works, features, pricing & contact sections.

---

## 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS, React Router, shadcn/ui, TanStack Query, Recharts |
| AI | Groq API (llama-3.3-70b) for scripts, briefs & follow-ups |
| Backend | Node.js, Express, TypeScript (controllers / services / routes pattern) |
| Email | Resend (REST API via native `fetch`) |
| Calls | Twilio (REST API via native `fetch`) |
| Database & Auth | Supabase (Postgres + Auth) |
| Edge Functions | Supabase Functions (Calendly webhook) |
| Monorepo | pnpm workspaces + React `@/` path alias |

---

## 📁 Project Structure

```
.
├── frontend/            # React + Vite SPA
│   ├── src/
│   │   ├── routes/      # Pages (Dashboard, Leads, Outreach, Calls, Reports, ...)
│   │   ├── components/  # Reusable UI (shadcn-style) + app layout
│   │   ├── lib/         # AI (Groq), email, utils, constants
│   │   └── integrations/supabase/  # Supabase client + generated types
│   └── .env             # VITE_* public env vars
├── backend/             # Express API (TypeScript)
│   ├── src/
│   │   ├── controllers/ # HTTP request handling
│   │   ├── services/    # Twilio & Resend business logic
│   │   ├── routes/      # /api/email, /api/call
│   │   └── config/      # Reads .env into typed config
│   ├── server.ts        # Entry point
│   └── .env             # Backend secrets (never commit)
├── supabase/            # Config, SQL migrations, edge functions
│   ├── migrations/      # Postgres schema
│   └── functions/calendly-webhook/
├── vercel.json          # Vercel frontend deploy config
└── netlify.toml         # Netlify frontend deploy config (with SPA redirects)
```

---

## 🔑 Environment Variables

Copy `.env.example` → `.env` in both `frontend/` and `backend/` and fill your values.

### Frontend — `frontend/.env`

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon / publishable key |
| `VITE_GROQ_API_KEY` | Groq API key (AI generation) |
| `VITE_BACKEND_URL` | Running backend URL (local or hosted) |

### Backend — `backend/.env`

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend key (sends emails) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio outbound caller ID |
| `PORT` | Server port (default `5000`) |
| `EMAIL_FROM` | Optional sender address for Resend |

---

## 🚀 Run Locally

### 1. Install dependencies

```bash
pnpm install
```

### 2. Setup Supabase
Create a free project at [supabase.com](https://supabase.com). Run the SQL in `supabase/migrations/` (SQL Editor or `supabase db push`), then fill the URL + key in `frontend/.env`.

### 3. Run the backend

```bash
cd backend
pnpm install
pnpm dev      # → http://localhost:5000
```

### 4. Run the frontend (in another terminal)

```bash
cd frontend
pnpm install
pnpm dev      # → http://localhost:5173
```

**Backend API** (mounted under `/api`):
- `POST /api/email` — send an email via Resend
- `POST /api/call` — place an AI voice call via Twilio

---

## 📦 Deployment Steps

This monorepo deploys to **three** services:

| Service | What it hosts | Where |
|---------|---------------|-------|
| Frontend SPA | `frontend/dist` | Vercel or Netlify |
| Backend API | `backend/dist/server.js` | Render |
| Database / Auth / Webhook | Postgres + edge functions | Supabase |

### 1) Supabase — database, auth & webhook

1. Create a free project at [supabase.com](https://supabase.com).
2. Apply the schema: paste the SQL from `supabase/migrations/` into the **SQL Editor** (or run `supabase db push` after linking).
3. Copy your **Project URL** and **anon / publishable key** — these become `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Deploy the Calendly webhook edge function:
   ```bash
   cd supabase
   supabase functions deploy calendly-webhook
   ```
   Set its secrets: `PROJECT_URL` and `SERVICE_ROLE_KEY`.

### 2) Frontend — Vercel

1. On [vercel.com](https://vercel.com) → **Add New → Project**, import `AI-Lead-Generation-Automated-Outreach-Platform`. The included `vercel.json` already sets the correct build (`cd frontend && pnpm build`, output `frontend/dist`, Node 20).
2. Add **environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_GROQ_API_KEY`
   - `VITE_BACKEND_URL` → your Render backend URL (e.g. `https://yourapp.onrender.com`)
3. Click **Deploy**. It auto-redeploys on every push.

> **Netlify option:** `netlify.toml` is already configured (build + SPA redirects). Import the repo on [netlify.com](https://netlify.com) and set the same `VITE_*` env vars.

### 3) Backend — Render

1. On [render.com](https://render.com) → **New → Web Service**, connect the repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node dist/server.js`
5. Add **environment variables**:
   - `RESEND_API_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `PORT=5000`
6. **Deploy**, then copy the `https://<name>.onrender.com` URL into `VITE_BACKEND_URL` on Vercel/Netlify and redeploy the frontend.

**Ordering tip:** deploy the backend (and set the public URL) *before* the final frontend build, and keep CORS enabled (already done via `app.use(cors())`).

---

## 🛟 Troubleshooting

- **`Unsupported engine: node` (wanted 22.x, current 20.x)** — not fatal; the backend uses native `fetch` and runs fine on Node 20+.
- **`Cannot find module './src/app.js'` in dev** — fixed: backend relative imports are extensionless so both `ts-node` (dev) and compiled `dist/` (prod) resolve correctly.
- **Build scripts error during install** — run `pnpm install --no-frozen-lockfile` or `pnpm approve-builds`.
- **`Missing Supabase environment variable(s)` in the browser** — `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` were not set on the hosting provider before the build.

---

## 📄 License

Private / internal project. Contact the maintainer before reusing or selling.
