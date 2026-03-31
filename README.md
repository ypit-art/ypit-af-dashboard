# YPIT AF — Registrations admin dashboard

Read-only Next.js admin UI that lists rows from the Supabase Postgres table `registrations`, protected by HTTP Basic Auth. The **service role** key is only used on the server (API route); it is never exposed to the browser.

## Security

1. **Rotate your Supabase service role key** if it has ever been shared or committed. In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **API**, roll the `service_role` secret and update deployment env vars.
2. Do not commit `.env` or `.env.local`. Copy `.env.example` to `.env.local` for local development.
3. Use a strong, unique `ADMIN_PASSWORD` in production.

## Local setup

```bash
cp .env.example .env.local
# Edit .env.local with real values

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The browser will prompt for Basic Auth (use `ADMIN_USER` / `ADMIN_PASSWORD`).

## Deploy on Vercel

1. Push this repo to GitHub (or connect your Git provider).
2. In [Vercel](https://vercel.com) → **New Project** → import the repo.
3. Under **Environment Variables**, add:

   | Name | Notes |
   | ----- | ----- |
   | `SUPABASE_URL` | Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (server-only) |
   | `ADMIN_USER` | Basic Auth username |
   | `ADMIN_PASSWORD` | Basic Auth password |

4. Deploy, then open the production URL and sign in when prompted.

## Data

- **Table**: `registrations`
- **Limit**: up to 2000 rows per request (see [`src/app/api/registrations/route.ts`](src/app/api/registrations/route.ts)).
- Ordering tries `id` ascending, then `created_at` descending, then unordered if those columns are missing.

If your table name differs, change the `.from('registrations')` call in the API route.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production build locally
- `npm run lint` — ESLint
