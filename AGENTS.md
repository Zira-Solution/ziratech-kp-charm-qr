# AGENTS.md

Instructions for every AI coding agent working in this repository (Claude, Codex, Cursor, Gemini...). This file is the single source: other agent files (`CLAUDE.md`) only point here. `src/AGENTS.md` holds the Next.js rules that `next dev` manages; they apply too.

## Project

K&P Atelier: a web app for a charm-bracelet stall at FPT University HCMC (event 16–20/10/2026). Each order gets a card code, a creator OTP for the buyer and a 4-digit PIN for the recipient. The buyer composes a digital card (letter, photos, voice, video, music...) in a studio; the recipient opens it with the PIN. Profits go to the Sân Nhà Nhiều Chó animal shelter. Deployed on AWS Amplify (`amplify.yml`, `appRoot: src`).

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres, Auth, Storage), nodemailer, SePay webhook.

## Communication

- Talk to the team in **Vietnamese**. User-facing UI text and API error messages are Vietnamese; code comments are English.
- Do not present guesses as facts. If something is not in the code or docs, look it up or ask.

## Layout

```
AGENTS.md  CLAUDE.md  CONSTRAINTS.md  README.md
amplify.yml    Amplify buildspec (gates, env file, build); customHttp.yml: cache headers
supabase/      schema.sql, seed.sql (run by hand in the Supabase SQL Editor)
docs/          01 architecture, 02 setup & env, 06 Amplify deploy, adr/, specs/, plans/, archive/
src/           the Next.js app root (Amplify appRoot)
  app/         routes: pages and API route handlers
  components/  gift-templates (card viewer), studio (card editor), admin, home, ui
  lib/         auth, supabase, validation, mail, media
  config/ types/ public/
  scripts/     tests (*.test.ts) and check tools
```

Read `docs/01-kien-truc-he-thong-va-luong-du-lieu.md` before changing data flow, auth or storage.

## Commands

All npm commands run inside `src/` (where `package.json` is).

```bash
cd src
npm ci
npm run dev           # http://localhost:3000; empty Supabase vars = in-memory store with demo card KP-2010-DEMO / TAO-2010 / PIN 2010
npm run check:fast    # tsc --noEmit, eslint, floor guard, gitleaks
npm test              # node --test on scripts/*.test.ts
npx next build
```

## Rules

1. **Read `CONSTRAINTS.md` before writing code.** Never weaken it to make a change pass. The floor forbids new checker-suppression comments, empty catch blocks, to-do markers standing in for code, skipped or deleted tests, removed assertions and secrets in source (exact list in `CONSTRAINTS.md`). `node scripts/floor-guard.mjs` enforces it on every changed line, docs included.
2. **Next.js 16 is not the Next.js you know.** Read the relevant guide in `src/node_modules/next/dist/docs/` before writing framework code (see `src/AGENTS.md`).
3. **Verify before claiming done:** `tsc`, `eslint`, `npm test`, `next build` must pass. Report anything you could not run.
4. **Ask first** before adding a dependency, changing the database schema, or changing the OTP / PIN / session mechanism.

## Code conventions

- **Every route handler checks its own access.** There is no middleware: gift routes use `hasGiftSession` (`src/lib/auth/gift-session.ts`), admin routes use `getAdminUser` (`src/lib/supabase/auth.ts`).
- **Server-only modules start with `import "server-only"`.** `SUPABASE_SERVICE_ROLE_KEY` and other secrets never get a `NEXT_PUBLIC_` prefix.
- **A new server-only env var must be added to `SERVER_VARS` in `src/scripts/amplify-env.mjs`**, or it exists at build time but is `undefined` on Amplify at runtime. Also add it to `src/.env.example` and the table in `docs/02-cai-dat-va-moi-truong.md`.
- **Validate at the boundary.** Card data is rebuilt from allowlisted fields by `parseGiftData` (`src/lib/validation/gift.ts`); parsers return `Parsed<T>` (`{ ok, value } | { ok, error }`) with a Vietnamese message instead of throwing.
- **Pure modules stay framework-free** (validation, `blocks.ts`, `normalize.ts`, `layout.ts`, `studio/draft.ts`, `lib/media/embed.ts`...). They import each other by relative path **with the `.ts` extension** so `node --test` can run them directly; add or update a test in `src/scripts/` when you change one.
- **Codes are never stored in plaintext.** Creator keys and PINs are scrypt hashes; plaintext codes are returned once, when issued.
- **No `dangerouslySetInnerHTML`** for user content. Video and music embeds are built only through `src/lib/media/embed.ts` and rendered in sandboxed iframes.
- Cards render through `GiftTemplateViewer`; a new look is a new skin in `src/components/gift-templates/skins/`, not a new page set (see `docs/adr/0002-card-messages-skins-and-frames.md`).
- Use the theme tokens in `src/app/globals.css` (`text-primary`, `bg-surface-container-low`...) rather than new hard-coded colours.

## Git

- Work on a branch, never directly on `main`. Do not push or merge unless asked.
- Commit messages: **English, one short line**, conventional prefix (`feat:`, `fix:`, `chore:`, `docs:`, `test:`). **No `Co-Authored-By` or other AI attribution.**
