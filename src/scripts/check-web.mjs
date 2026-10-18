#!/usr/bin/env node
// check-web.mjs — Lighthouse ratchet for performance and accessibility (CONSTRAINTS.md).
//   node scripts/check-web.mjs            compare the running site with scripts/web-baseline.json
//   node scripts/check-web.mjs --update   record the current numbers as the new baseline
// Site: PREVIEW_URL (default http://localhost:5001, i.e. `next build && next start -p 5001`).
// Never measure `next dev`: its numbers are not the production numbers.
// Until ENFORCE_FROM a regression only warns (exit 0); from that date it blocks (exit 1).
// Exit 2 = could not measure.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_BASE = process.env.PREVIEW_URL ?? 'http://localhost:5001';
const PATHS = ['/', '/gift', '/thamkhao'];
const BASELINE = new URL('./web-baseline.json', import.meta.url);
const ENFORCE_FROM = '2026-10-30';
// One Lighthouse run is noisy, so a regression has to clear this much before it counts.
const TOL = { score: 3, lcpRatio: 1.15, cls: 0.02 };

const LIGHTHOUSE = join(process.cwd(), 'node_modules', 'lighthouse', 'cli', 'index.js');
if (!existsSync(LIGHTHOUSE)) { console.error('check-web: lighthouse is not installed (npm install)'); process.exit(2); }

const dir = mkdtempSync(join(tmpdir(), 'kp-lh-'));
function measure(path) {
  const out = join(dir, 'r.json');
  const run = spawnSync(process.execPath, [LIGHTHOUSE, URL_BASE + path, '--output=json', `--output-path=${out}`, '--quiet',
    '--only-categories=performance,accessibility', '--form-factor=mobile', '--chrome-flags=--headless=new --no-sandbox'], { stdio: 'ignore' });
  if (run.status !== 0 || !existsSync(out)) { console.error(`check-web: could not measure ${URL_BASE}${path}`); process.exit(2); }
  const r = JSON.parse(readFileSync(out, 'utf8'));
  const a = r.audits;
  const failing = r.categories.accessibility.auditRefs
    .filter((ref) => ref.weight > 0 && a[ref.id].score !== null && a[ref.id].score < 1).map((ref) => ref.id).sort();
  return {
    perf: Math.round(r.categories.performance.score * 100),
    a11y: Math.round(r.categories.accessibility.score * 100),
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
    a11yFailing: failing,
  };
}

const current = {};
for (const p of PATHS) current[p] = measure(p);
rmSync(dir, { recursive: true, force: true });

if (process.argv.includes('--update')) {
  writeFileSync(BASELINE, JSON.stringify({ measuredOn: new Date().toISOString().slice(0, 10), pages: current }, null, 2) + '\n');
  console.log('check-web: baseline updated'); console.table(Object.fromEntries(Object.entries(current).map(([k, v]) => [k, { ...v, a11yFailing: v.a11yFailing.join(',') }])));
  process.exit(0);
}

if (!existsSync(BASELINE)) { console.error('check-web: no baseline; run with --update first'); process.exit(2); }
const base = JSON.parse(readFileSync(BASELINE, 'utf8')).pages;

const problems = [];
for (const p of PATHS) {
  const b = base[p], c = current[p];
  if (!b) { problems.push(`${p}: no baseline`); continue; }
  if (c.perf < b.perf - TOL.score) problems.push(`${p}: performance ${c.perf} < ${b.perf} (-${TOL.score} allowed)`);
  if (c.a11y < b.a11y - TOL.score) problems.push(`${p}: accessibility ${c.a11y} < ${b.a11y}`);
  if (c.lcp > b.lcp * TOL.lcpRatio) problems.push(`${p}: LCP ${c.lcp}ms > ${b.lcp}ms x${TOL.lcpRatio}`);
  if (c.cls > b.cls + TOL.cls) problems.push(`${p}: CLS ${c.cls} > ${b.cls} +${TOL.cls}`);
  const fresh = c.a11yFailing.filter((id) => !b.a11yFailing.includes(id));
  if (fresh.length) problems.push(`${p}: new accessibility failures: ${fresh.join(', ')}`);
}

if (!problems.length) { console.log('check-web: no regression against the baseline'); process.exit(0); }
const enforcing = new Date().toISOString().slice(0, 10) >= ENFORCE_FROM;
console.error(`check-web: ${problems.length} regression(s) ${enforcing ? '(blocking)' : `(warning only until ${ENFORCE_FROM})`}:`);
for (const m of problems) console.error('  ' + m);
process.exit(enforcing ? 1 : 0);
