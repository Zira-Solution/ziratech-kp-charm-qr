#!/usr/bin/env node
// amplify-env.mjs — writes .env.production for the Amplify build (run from src/, before `npm run build`).
//
// Amplify Console variables reach the build but not the Next.js server at runtime, so they have to be
// written into an env file Next.js loads. `env | grep >> .env.production` is not enough: Next.js expands
// `$NAME` in values and cuts at ` #`, so a password such as `ab$cd#ef` would arrive as `ab`. The loader
// only understands two escapes: `\$` (any quotes) and `\n` (double quotes); `\"` and `\\` stay as typed.
// So every `$` is escaped and the value is wrapped in a quote character it does not contain
// (checked against the real loader by amplify-env.test.ts). A value that cannot be written safely stops
// the build with its name rather than reaching the app changed.
//
// Only the server variables below and NEXT_PUBLIC_* are written; nothing else from the build machine.
// Names are printed, values never are.
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Server-only variables the app reads at runtime (keep in sync with docs/02-cai-dat-va-moi-truong.md). */
export const SERVER_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'AUTH_SECRET',
  'ADMIN_JWT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM',
  'SEPAY_API_KEY',
];

/**
 * A value as a quoted dotenv string that the Next.js loader reads back unchanged.
 * Throws when no quoting keeps it intact: a trailing backslash (it would escape the closing quote),
 * all three quote characters at once, or a line break together with a double quote.
 */
export function encodeValue(value) {
  if (value.endsWith('\\')) throw new Error('ends with a backslash');
  const body = value.replace(/\$/g, '\\$');
  if (/[\r\n]/.test(value)) {
    if (value.includes('"')) throw new Error('has both a line break and a double quote');
    return `"${body.replace(/\r?\n/g, '\\n')}"`;
  }
  const quote = ['`', '"', "'"].find((q) => !value.includes(q));
  if (!quote) throw new Error('contains all three quote characters');
  return `${quote}${body}${quote}`;
}

/** The .env.production content for `env`: allowlisted and NEXT_PUBLIC_ names, sorted, empty ones left out. */
export function buildEnvFile(env) {
  const names = Object.keys(env)
    .filter((name) => SERVER_VARS.includes(name) || name.startsWith('NEXT_PUBLIC_'))
    .filter((name) => typeof env[name] === 'string' && env[name] !== '')
    .sort();
  return names
    .map((name) => {
      try {
        return `${name}=${encodeValue(env[name])}\n`;
      } catch (err) {
        throw new Error(`${name} cannot be written to .env.production: its value ${err.message}`);
      }
    })
    .join('');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let content;
  try {
    content = buildEnvFile(process.env);
  } catch (err) {
    console.error(`amplify-env: ${err.message}. Change the value in the Amplify Console and build again.`);
    process.exit(1);
  }
  writeFileSync('.env.production', content);
  const names = content.split('\n').filter(Boolean).map((line) => line.slice(0, line.indexOf('=')));
  console.log(`amplify-env: wrote ${names.length} variable(s) to .env.production: ${names.join(', ') || '(none)'}`);
  const missing = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'AUTH_SECRET'].filter(
    (name) => !names.includes(name),
  );
  if (missing.length) console.log(`amplify-env: WARNING missing ${missing.join(', ')} (see docs/06-trien-khai-amplify.md)`);
}
