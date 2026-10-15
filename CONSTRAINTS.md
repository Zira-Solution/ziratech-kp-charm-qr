# Constraints

Last reviewed: 2026-10-16 by @ANDEV09

Read this before writing code. Do not weaken it to make a change pass: tightening is silent, loosening needs an Exceptions row below.
Rollout: the floor and the fast checks block from day one. Accessibility, performance and security only **warn until 2026-10-30**, then block.

## Floor (always enforced)

- No new suppression comments: `@ts-ignore`, `eslint-disable`, `istanbul ignore`, `nosemgrep`, `gitleaks:allow`
- No unimplemented stubs: `throw new Error("Not implemented")`, empty `catch {}`, `TODO` standing where code should be
- No skipped or deleted tests, no assertion removed from a test that stayed
- No secrets in source
- This file does not get weakened to make a change pass

Checked by `node scripts/floor-guard.mjs` (diff against `origin/main`, or against `HEAD` while there is no remote). Exit 1 blocks the change.

## Enforced with numbers

| Dimension | Rule | Checked by | Runs at |
|-----------|------|-----------|---------|
| Types | Zero type errors | `npx tsc --noEmit` | every edit |
| Lint | Zero errors from `eslint.config.mjs` | `npx eslint` | every edit |
| Floor | Zero violations | `node scripts/floor-guard.mjs` | every edit |
| Secrets | No secrets in source or history | `gitleaks detect --redact --no-banner` | every edit |
| Tests | All pass | `npm test` | task end, CI |
| Security: deps | Nothing at high or above, except tracked exceptions | `osv-scanner scan source -r .` | task end, CI (warn until 2026-10-30) |
| Accessibility | No new failing Lighthouse accessibility audit; score must not fall more than 3 points | `npm run check:web` | checkpoint (warn until 2026-10-30) |
| Performance | LCP must not grow more than 15%; CLS must not grow more than 0.02; score must not fall more than 3 points | `npm run check:web` | checkpoint (warn until 2026-10-30) |

Why these numbers: types, lint, secrets and tests have no tolerance because a pass is cheap to keep. Web numbers are a ratchet (hold today's value) because the site misses the public targets by a wide margin today; a hard target would be red forever. The 15% / 0.02 / 3-point tolerances absorb the noise of a single Lighthouse run.

`npm run check:web` needs the production build running: `npm run build` then `npx next start -p 5001`. Never measure `next dev`.
Accessibility is judged by Lighthouse's accessibility audits, which run axe-core. Pages behind a session (`/create/[token]`, `/g/[token]`, `/admin`) are not covered by it; check those by hand or with a browser test.

## Targets (not yet met; the ratchet holds today's value until they are)

| Metric | Today (2026-10-16, `/`) | Target |
|--------|-------------------------|--------|
| LCP | 27865 ms | <= 2500 ms (Core Web Vitals "good") |
| CLS | 0.063 | <= 0.1 (already met) |
| Accessibility score | 95 | 100, zero failing audits |

Largest causes of the LCP: the Material Symbols icon font (3.9 MB) and `public/images/vong_charm_san.png` (841 KB). Fixing them is a separate task.

## Declared, not yet enabled

| Dimension | Why not yet |
|-----------|-------------|
| Security: code (`semgrep scan --config p/default`) | No CI exists, and Semgrep may not run natively on Windows (unverified). Enable in CI when a pipeline is added. |
| Test coverage of changed lines | Not chosen at setup. `node --experimental-test-coverage` is available when wanted. |

## Exceptions

| ID | Rule | Path | Reason | Owner | Expires |
|----|------|------|--------|-------|---------|
| W1 | Security: deps (GHSA-vfj7-8cjw-p6xm, `braces` 3.0.3) | `package-lock.json` (dev only, via eslint-config-next) | No fixed version published; registered in `osv-scanner.toml` | @ANDEV09 | 2027-01-14 |
