# SSG

Next.js (App Router, TypeScript) + Tailwind CSS. Backend services: Supabase (Postgres + seller auth), Cloudflare R2 (files), SMTP (email), Gemini (AI), Vercel (hosting).

Status: **project skeleton only**. Folders exist (kept by `.gitkeep`), no feature code yet.

## Structure

```
src/
  app/
    (marketing)/      landing page and other public pages
    (app)/compose/    compose a gift
    (app)/preorder/   pre-order flow
    g/[token]/        recipient page, opened by unguessable token
    seller/login/     seller sign-in
    seller/dashboard/ seller area
    admin/            admin area
    api/
      gifts/ orders/ uploads/ payments/ ai/   route handlers, one folder per resource
      payments/webhook/                       payment provider callbacks
      health/                                 uptime monitor endpoint (HEALTH_TOKEN)
  components/
    ui/               small generic parts (button, input, modal)
    layout/           header, footer, shells
    features/         parts tied to one feature
  lib/                one folder per external service client
    supabase/ r2/ mail/ gemini/ payments/
    validation/       zod schemas shared by API and forms
  server/services/    business logic called from route handlers (server only)
  server/auth/        seller/admin guards, recipient token checks
  types/              shared TypeScript types
  config/             constants, feature settings
supabase/migrations/  numbered SQL files (0001_*.sql ...), applied in order
supabase/seed.sql     small dev seed data, runs after migrations on db reset
docs/                 spec and decisions
.github/workflows/    CI, keep-alive, backups
```

Rules of thumb: route handlers stay thin (validate input, call `server/services`); service clients live in `lib/` and are imported only from server code; every new table gets Row Level Security in the same migration.

Note: `(marketing)/page.tsx` is still the create-next-app default page; replace it with the real landing page. Add `src/proxy.ts` (Next 16's replacement for `middleware.ts`) for the `/seller` and `/admin` guards.

## Run

```bash
cp .env.example .env.local   # fill in values as each service is set up
npm run dev
```

This project uses Next.js 16, whose conventions differ from older versions. Read `node_modules/next/dist/docs/` before writing framework code (see `AGENTS.md`).
