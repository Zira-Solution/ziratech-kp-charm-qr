import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SERVER_VARS, buildEnvFile, encodeValue } from "./amplify-env.mjs";

// Read the file back with the same loader Next.js uses, so the test proves what the app will see.
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");

function readBack(content: string, keys: string[]): Record<string, string | undefined> {
  const dir = mkdtempSync(join(tmpdir(), "kp-amplify-env-"));
  writeFileSync(join(dir, ".env.production"), content);
  for (const k of keys) delete process.env[k];
  loadEnvConfig(dir, false, { info() {}, error() {} }, true);
  return Object.fromEntries(keys.map((k) => [k, process.env[k]]));
}

test("values survive the Next.js env loader unchanged", () => {
  const cases: Record<string, string> = {
    KP_T_DOLLAR: "ab$cd#ef",
    KP_T_BRACE: "${HOME}x",
    KP_T_HASH: "x #not a comment",
    KP_T_QUOTES: `"K&P Atelier" <no-reply@example.vn>`,
    KP_T_SINGLE: "it's",
    KP_T_BACKSLASH: "C:\\path\\to",
    KP_T_SPACES: "  lead and trail  ",
    KP_T_EQUALS: "a=b==c",
    KP_T_NEWLINE: "line1\nline2",
    KP_T_NEWLINE_DOLLAR: "a$b\nc'd`e",
    KP_T_BACKTICK: "run `cmd` $x",
    KP_T_BACKTICK_DQ: `say "hi" with \`tick\` and $money`,
    KP_T_SINGLE_DQ: `'single' "double" $x \\ mid`,
    KP_T_BASE64: "Zm9vYmFy+/=",
  };
  const content = Object.entries(cases).map(([k, v]) => `${k}=${encodeValue(v)}`).join("\n") + "\n";
  assert.deepEqual(readBack(content, Object.keys(cases)), cases);
});

test("values that cannot be written safely are refused with a reason", () => {
  assert.throws(() => encodeValue("ends with \\"), /backslash/);
  assert.throws(() => encodeValue(`all ' " \` three`), /three quote/);
  assert.throws(() => encodeValue('line\n"quoted"'), /line break/);
});

test("a refused value names its variable", () => {
  assert.throws(() => buildEnvFile({ SMTP_PASS: "bad\\" }), /SMTP_PASS/);
});

test("only the server allowlist and NEXT_PUBLIC_ variables are written", () => {
  const file = buildEnvFile({
    SUPABASE_SERVICE_ROLE_KEY: "sb_secret_x",
    AUTH_SECRET: "a".repeat(64),
    NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
    AWS_SECRET_ACCESS_KEY: "must-not-leak",
    PATH: "/usr/bin",
    NODE_ENV: "production",
  });
  const names = file.trim().split("\n").map((line) => line.split("=")[0]);
  assert.deepEqual(names, ["AUTH_SECRET", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  assert.doesNotMatch(file, /must-not-leak|\/usr\/bin/);
});

test("unset and empty variables are left out", () => {
  assert.equal(buildEnvFile({ SMTP_PASS: "", SEPAY_API_KEY: undefined }), "");
});

test("the allowlist covers every server-only variable the app reads", () => {
  for (const name of ["SUPABASE_SERVICE_ROLE_KEY", "AUTH_SECRET", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "SEPAY_API_KEY"]) {
    assert.ok(SERVER_VARS.includes(name), `${name} is missing from SERVER_VARS`);
  }
});
