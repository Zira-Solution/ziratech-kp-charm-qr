# Chuẩn hóa cấu trúc repo — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa app Next.js vào `src/` (Vercel Root Directory = `src`), gom tài nguyên không chạy được vào `docs/` và `docs/archive/`, viết README + tài liệu deploy, mà không đổi hành vi app.

**Architecture:** Di chuyển bằng `git mv` để giữ lịch sử. Đường dẫn `src/app`, `src/components`, `src/lib`... không đổi; alias `@/*` đổi từ `./src/*` thành `./*` nên import `@/...` giữ nguyên. Mỗi task kết thúc bằng bộ kiểm tra so với kết quả gốc ở Task 1.

**Tech Stack:** Next.js 16.3.8, TypeScript, ESLint 9, `node --test` (strip-types), Git Bash trên Windows.

**Spec:** `docs/specs/2026-10-17-chuan-hoa-cau-truc-repo.md`. **Nhánh:** `chore/restructure-repo`.

**Quy ước commit:** tiếng Anh, một dòng ngắn, không có `Co-Authored-By`.

**Lưu ý môi trường:** máy này chưa cài `gitleaks` và `osv-scanner`. Các bước dùng chúng ghi "bỏ qua nếu chưa cài" và phải báo lại cho người dùng là chưa chạy.

---

## Bản đồ file

| Hiện tại | Đích | Ghi chú |
|---|---|---|
| `package.json`, `package-lock.json` | `src/` | sửa `check:fast` (gitleaks `--source ..`) |
| `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, `osv-scanner.toml`, `.env.example`, `AGENTS.md` | `src/` | `tsconfig` đổi `paths`; `eslint` bỏ 2 ignore |
| `public/` | `src/public/` | |
| `scripts/` | `src/scripts/` | test đổi import `../src/` thành `../`; `floor-guard` chạy git ở gốc repo |
| `.gitignore`, `CLAUDE.md`, `CONSTRAINTS.md`, `README.md`, `supabase/`, `.vscode/` | giữ ở gốc | `.gitignore` bỏ neo `/`; `CLAUDE.md` trỏ `src/AGENTS.md`; README viết lại |
| `KP_Atelier_Spec_AI_Condensed.md` | `docs/specs/` | |
| `K&P/`, `thamkhao/`, `scratch/`, `tasks/` | `docs/archive/` | |
| (mới) | `docs/01-...`, `docs/02-...`, `docs/06-trien-khai-vercel.md` | |

---

### Task 1: Ghi kết quả gốc trước khi di chuyển

**Files:** không sửa file nào trong repo. Kết quả ghi ra `$TEMP/kp-baseline/`.

- [ ] **Step 1: Cài dependency ở gốc**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && npm ci
```
Expected: kết thúc không lỗi, có thư mục `node_modules/`.

- [ ] **Step 2: Chạy 4 kiểm tra, lưu output**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && B="$TEMP/kp-baseline" && mkdir -p "$B" \
 && (npx tsc --noEmit > "$B/tsc.txt" 2>&1; echo "tsc exit $?" >> "$B/summary.txt") \
 && (npx eslint > "$B/eslint.txt" 2>&1; echo "eslint exit $?" >> "$B/summary.txt") \
 && (npm test > "$B/test.txt" 2>&1; echo "test exit $?" >> "$B/summary.txt") \
 && (npx next build > "$B/build.txt" 2>&1; echo "build exit $?" >> "$B/summary.txt") \
 && cat "$B/summary.txt" && grep -E "^ℹ (tests|pass|fail)" "$B/test.txt"
```
Expected: in ra 4 dòng exit code và `tests 80 / pass 80 / fail 0`. Nếu exit code của tsc/eslint/build khác 0 thì đó là trạng thái gốc: ghi lại, không sửa trong đợt này, và báo người dùng.

- [ ] **Step 3: Lưu danh sách route của bản build gốc**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && sed -n '/Route (app)/,$p' "$TEMP/kp-baseline/build.txt" > "$TEMP/kp-baseline/routes.txt" && wc -l "$TEMP/kp-baseline/routes.txt"
```
Expected: file có danh sách route (`/`, `/admin`, `/api/...`, `/g/[token]`...).

- [ ] **Step 4: Dọn artifact build gốc**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && rm -rf .next next-env.d.ts tsconfig.tsbuildinfo && git status --short
```
Expected: chỉ còn `?? .codegraph/` (và `node_modules/` không hiện vì đã ignore). Không commit gì ở task này.

---

### Task 2: Chuyển app vào `src/` và sửa cấu hình

**Files:**
- Move: `package.json`, `package-lock.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, `osv-scanner.toml`, `.env.example`, `AGENTS.md`, `public/`, `scripts/` → `src/`
- Modify: `src/tsconfig.json`, `src/package.json`, `src/eslint.config.mjs`, `src/scripts/*.test.ts`, `src/scripts/floor-guard.mjs`, `src/.env.example`, `.gitignore`, `CLAUDE.md`

- [ ] **Step 1: Di chuyển bằng git mv**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" \
 && git mv package.json package-lock.json next.config.ts postcss.config.mjs eslint.config.mjs tsconfig.json osv-scanner.toml .env.example AGENTS.md src/ \
 && git mv public src/public \
 && git mv scripts src/scripts \
 && mv node_modules src/node_modules \
 && git status --short | head -20
```
Expected: các dòng `R  <cũ> -> src/<mới>`.

- [ ] **Step 2: Sửa alias trong `src/tsconfig.json`**

Thay:
```json
    "paths": {
      "@/*": ["./src/*"]
    }
```
bằng:
```json
    "paths": {
      "@/*": ["./*"]
    }
```

- [ ] **Step 3: Sửa import trong test**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr/src/scripts" && sed -i 's#"\.\./src/#"../#g' *.test.ts && grep -n '"\.\./' *.test.ts | grep -v '"\.\./\(lib\|components\)/'
```
Expected: lệnh `grep` cuối không in gì (mọi import đều trỏ `../lib/` hoặc `../components/`). Hai chuỗi `"../../etc"` và `` `${TOKEN}/../...` `` trong `gift-validation.test.ts` là dữ liệu test, không bị sed đổi vì không bắt đầu bằng `"../src/`.

- [ ] **Step 4: Sửa `check:fast` trong `src/package.json`**

Thay:
```json
    "check:fast": "tsc --noEmit && eslint && node scripts/floor-guard.mjs && gitleaks detect --redact --no-banner",
```
bằng:
```json
    "check:fast": "tsc --noEmit && eslint && node scripts/floor-guard.mjs && gitleaks detect --source .. --redact --no-banner",
```
Lý do: gitleaks quét đúng gốc repo dù lệnh chạy trong `src/`.

- [ ] **Step 5: Bỏ ignore thừa trong `src/eslint.config.mjs`**

Thay:
```js
    "next-env.d.ts",
    "scratch/**",
    "test-tw.*",
    "K&P/**",
  ]),
```
bằng:
```js
    "next-env.d.ts",
    "test-tw.*",
  ]),
```

- [ ] **Step 6: `floor-guard` chạy git từ gốc repo**

Trong `src/scripts/floor-guard.mjs`, thay khối:
```js
const git = (args, { diffExit = false } = {}) => {
  try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return diffExit && e.status === 1 && typeof e.stdout === 'string' ? e.stdout : null; }
};
const bail = (msg) => { console.error('floor-guard: ' + msg); process.exit(2); };
```
bằng:
```js
// The app lives in src/, but the floor covers the whole repository (docs/, CONSTRAINTS.md), so every
// git command runs from the repository root wherever the guard is started.
const root = (() => {
  try { return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim(); }
  catch { return null; }
})();
const git = (args, { diffExit = false } = {}) => {
  try { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return diffExit && e.status === 1 && typeof e.stdout === 'string' ? e.stdout : null; }
};
const bail = (msg) => { console.error('floor-guard: ' + msg); process.exit(2); };
if (!root) bail('not inside a git repository');
```
Và sửa dòng 3 của chú thích đầu file từ `// Usage: node scripts/floor-guard.mjs [--base <ref>]` thành `// Usage (from src/): node scripts/floor-guard.mjs [--base <ref>]`.

- [ ] **Step 7: `.gitignore` không neo gốc**

Thay các dòng:
```
/node_modules
/.pnp
```
```
/coverage
```
```
/.next/
/out/
```
```
/build
```
lần lượt bằng:
```
node_modules/
.pnp
```
```
coverage/
```
```
.next/
out/
```
```
build/
```
và thêm cuối file:
```

# codegraph index (local tool)
.codegraph/
```

- [ ] **Step 8: `CLAUDE.md` trỏ tới `src/AGENTS.md`**

Nội dung mới của `CLAUDE.md`:
```markdown
@src/AGENTS.md

The Next.js app lives in `src/` (run every npm command there). Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.
```

- [ ] **Step 9: Đánh dấu biến chưa dùng trong `src/.env.example`**

Thay:
```
# --- Gemini (a dedicated key with billing enabled, not a free-tier key) ---
```
bằng:
```
# --- Gemini (NOT USED YET: no code reads these) ---
```
và thay:
```
# --- Monitoring ---
# Long random string. The uptime monitor calls /api/health?token=<this>.
```
bằng:
```
# --- Monitoring (NOT USED YET: /api/health does not exist) ---
# Long random string. The uptime monitor calls /api/health?token=<this>.
```

- [ ] **Step 10: Chạy lại 4 kiểm tra trong `src/` và so với gốc**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr/src" && A="$TEMP/kp-after2" && rm -rf "$A" && mkdir -p "$A" \
 && (npx tsc --noEmit > "$A/tsc.txt" 2>&1; echo "tsc exit $?" >> "$A/summary.txt") \
 && (npx eslint > "$A/eslint.txt" 2>&1; echo "eslint exit $?" >> "$A/summary.txt") \
 && (npm test > "$A/test.txt" 2>&1; echo "test exit $?" >> "$A/summary.txt") \
 && (npx next build > "$A/build.txt" 2>&1; echo "build exit $?" >> "$A/summary.txt") \
 && diff "$TEMP/kp-baseline/summary.txt" "$A/summary.txt" && echo SUMMARY_SAME \
 && grep -E "^ℹ (tests|pass|fail)" "$A/test.txt" \
 && sed -n '/Route (app)/,$p' "$A/build.txt" | diff "$TEMP/kp-baseline/routes.txt" - && echo ROUTES_SAME
```
Expected: `SUMMARY_SAME`, `tests 80 / pass 80 / fail 0`, `ROUTES_SAME`. Nếu eslint gốc có cảnh báo, so `eslint.txt` hai bên: số lỗi không được tăng.

- [ ] **Step 11: Thử chạy bản build**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr/src" && (npx next start -p 5003 > "$TEMP/kp-start.log" 2>&1 &) && sleep 8 \
 && for p in / /gift /admin /api/donations/summary /thamkhao/bg.jpg /images/vong_charm_san.png; do echo "$p $(curl -s -o /dev/null -w '%{http_code}' http://localhost:5003$p)"; done
```
Expected: mọi dòng `200`. Sau đó dừng server:
```bash
powershell -Command "Get-NetTCPConnection -LocalPort 5003 -State Listen | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force }"
```

- [ ] **Step 12: floor-guard**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr/src" && node scripts/floor-guard.mjs
```
Expected: `floor-guard: clean`.

- [ ] **Step 13: Dọn artifact và commit**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && git status --short | grep -v '^R ' ; git add -A && git status --short | grep -v '^R ' ; git commit -q -m "chore: move next app into src" && git log --oneline -1
```
Expected: không có file lạ ngoài các file đã sửa ở Step 2–9 (`.next/`, `node_modules/`, `next-env.d.ts`, `*.tsbuildinfo` phải bị ignore). Nếu thấy chúng trong danh sách thì `.gitignore` sai: sửa trước khi commit.

---

### Task 3: Sắp xếp `docs/` và `docs/archive/`

**Files:**
- Move: `KP_Atelier_Spec_AI_Condensed.md` → `docs/specs/`; `K&P/`, `thamkhao/`, `scratch/`, `tasks/` → `docs/archive/`

- [ ] **Step 1: Di chuyển**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && mkdir -p docs/archive \
 && git mv KP_Atelier_Spec_AI_Condensed.md docs/specs/ \
 && git mv "K&P" "docs/archive/K&P" \
 && git mv thamkhao docs/archive/thamkhao \
 && git mv scratch docs/archive/scratch \
 && git mv tasks docs/archive/tasks \
 && ls -A
```
Expected: gốc chỉ còn `.codegraph .git .gitignore .vscode CLAUDE.md CONSTRAINTS.md README.md docs src supabase`.

- [ ] **Step 2: Sửa đường dẫn cũ trỏ tới file đã chuyển**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && grep -rn "tasks/plan.md\|tasks/todo.md\|KP_Atelier_Spec_AI_Condensed" --include=*.md . | grep -v "^./docs/archive/\|^./docs/plans/\|^./docs/specs/2026-10-17"
```
Với mỗi dòng in ra, đổi `tasks/plan.md` → `docs/archive/tasks/plan.md`, `tasks/todo.md` → `docs/archive/tasks/todo.md`. Nếu không in gì thì bỏ qua.

- [ ] **Step 3: Kiểm lại**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr/src" && npx tsc --noEmit && npx eslint && npm test 2>&1 | grep -E "^ℹ (pass|fail)" && node scripts/floor-guard.mjs
```
Expected: không lỗi, `pass 80 / fail 0`, `floor-guard: clean`.

- [ ] **Step 4: Commit**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && git add -A && git commit -q -m "chore: move design assets to docs/archive" && git log --oneline -1
```

---

### Task 4: README và tài liệu deploy

**Files:**
- Modify: `README.md`, `CONSTRAINTS.md` (chỉ thêm một câu)
- Create: `docs/01-kien-truc-he-thong-va-luong-du-lieu.md`, `docs/02-cai-dat-va-moi-truong.md`, `docs/06-trien-khai-vercel.md`

Tài liệu viết tiếng Việt, cho lập trình viên mới vào dự án. Mọi dữ kiện phải lấy từ code; không viết điều chưa kiểm.

- [ ] **Step 1: `CONSTRAINTS.md` — thêm câu về thư mục chạy lệnh**

Ngay dưới dòng `Rollout: the floor and the fast checks ...`, thêm dòng mới:
```markdown
Every command below runs inside `src/` (the Next.js app root).
```
Không đổi chữ nào khác (floor-guard so ngưỡng theo từng dòng).

- [ ] **Step 2: Viết lại `README.md`**

Các mục, theo thứ tự:
1. Tiêu đề `# K&P Atelier — Vòng charm & thiệp số 20/10` + 2 câu: quầy bán vòng charm ở ĐH FPT TP.HCM (16–20/10/2026), mỗi đơn có mã thiệp + OTP tạo thiệp + PIN xem thiệp; lợi nhuận góp trạm cứu hộ Sân Nhà Nhiều Chó.
2. **Công nghệ:** Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Supabase (Postgres, Auth, Storage), nodemailer, SePay webhook, deploy Vercel.
3. **Cấu trúc repo:** cây thư mục như phần "Cấu trúc đích" của spec (thay dòng README cho đúng).
4. **Bảng route:** `/` trang chủ (public) · `/gift` nhập mã + OTP tạo thiệp · `/create/[token]` studio (phiên create) · `/g/[token]` xem thiệp (phiên open, hỏi PIN nếu chưa có) · `/admin` quản trị (Supabase Auth, role admin) · `/messenger` demo chạy ở client · `/thamkhao` mẫu thiết kế cũ · `/api/gifts/*`, `/api/admin/*`, `/api/sepay/webhook`, `/api/donations/summary`.
5. **Khởi động nhanh:**
   ```bash
   cd src
   cp .env.example .env.local   # để trống Supabase = chạy bằng bộ nhớ, có thiệp demo KP-2010-DEMO / TAO-2010 / PIN 2010
   npm ci
   npm run dev                  # http://localhost:3000
   ```
6. **Lệnh kiểm tra** (chạy trong `src/`): `npm run check:fast`, `npm test`, `npm run check:task`, `npm run check:web`, `npm run check:cards`; nhắc đọc `CONSTRAINTS.md`.
7. **Tài liệu:** bảng link tới `docs/01`, `docs/02`, `docs/06`, `docs/adr/`, `docs/specs/`, `docs/archive/`.
8. **Việc còn mở:** T21 studio theo thiết bị (`docs/archive/tasks/todo.md`); chưa kiểm ghi âm thật trên Supabase Storage và iPhone/Safari.

- [ ] **Step 3: Viết `docs/01-kien-truc-he-thong-va-luong-du-lieu.md`**

Các mục:
1. **Tầng:** route handler (`src/app/api/**/route.ts`) gọi thẳng `src/lib/supabase/*`; mỗi route tự kiểm quyền (`hasGiftSession` cho thiệp, `getAdminUser` cho admin). Không có `proxy.ts`/middleware. Supabase dùng service-role key; khi thiếu biến Supabase, `products.ts`, `chains.ts`, `attempts.ts` dùng bộ nhớ của process.
2. **Dữ liệu** (`supabase/schema.sql`): `gift_products` (đơn + `gift_data` JSON, `creator_key`/`unlock_pin` là hash scrypt, xóa mềm `deleted_at`), `access_attempts` (khóa 15 phút sau 5 lần sai), `chains` (dây vòng), `donations` (`sepay_id` unique). RLS bật, không policy. Ghi âm ở bucket riêng tư `gift-media`, đường dẫn `<token>/voice-<ts>.<ext>`, đọc bằng link ký 1 giờ. Ảnh nhúng base64 trong `gift_data`.
3. **Luồng bán hàng:** `POST /api/admin/create-product` → giá lấy từ `chains` → `createGiftProductInDb` sinh `KP-2010-XXXXXX`, `TAO-XXXXXXXX`, PIN 4 số, chỉ lưu hash → email (SMTP, hoặc log khi chưa cấu hình) → mã plaintext trả về đúng một lần.
4. **Luồng soạn thiệp:** `/gift` → `POST /api/gifts/verify` (mode `create`) → cookie `kp_g_create_<token>` 6 giờ → `/create/[token]` 3 bước → ghi âm `POST /api/gifts/[token]/voice` → lưu `POST /api/gifts/[token]/save` (`parseGiftData` dựng lại từ trường cho phép, ghi đè `gift_data`).
5. **Luồng xem thiệp:** form ở `#hero` trang chủ → `/g/[token]` → 401 thì hỏi PIN → `verify` (mode `open`) → cookie 2 giờ → `GET /api/gifts/[token]` → `normalizeGift` → `GiftTemplateViewer` (khung dọc/ngang theo `layoutFor`, skin trong `components/gift-templates/skins/`).
6. **Quyên góp:** SePay gọi `POST /api/sepay/webhook` với `Authorization: Apikey <SEPAY_API_KEY>` → `recordDonation`; trang chủ đọc `GET /api/donations/summary`.
7. Link tới `docs/adr/0001`, `0002` và `docs/specs/card-messages.md` cho mô hình thiệp.

- [ ] **Step 4: Viết `docs/02-cai-dat-va-moi-truong.md`**

Các mục:
1. **Yêu cầu:** Node 22.6+ (test dùng `--experimental-strip-types`), npm. Mọi lệnh chạy trong `src/`.
2. **Biến môi trường** (`src/.env.local` khi chạy local; dashboard Vercel khi deploy) — bảng 4 cột *Biến · Dùng ở · Bắt buộc ở production? · Thiếu thì sao*:
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` · server · Có · chạy bằng bộ nhớ, dữ liệu mất khi restart (production log lỗi)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` · đăng nhập admin · Có · admin không đăng nhập được (503)
   - `AUTH_SECRET` (≥ 32 ký tự) · ký cookie thiệp · Có · **production ném lỗi** khi verify/đọc thiệp; dev dùng khóa ngẫu nhiên, mất phiên khi restart
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` · gửi mã · Nên có · email chỉ được log, nhân viên phải đưa mã tay
   - `SEPAY_API_KEY` · webhook · Có nếu nhận quyên góp · webhook trả 503
   - `NEXT_PUBLIC_DONATION_BANK`, `NEXT_PUBLIC_DONATION_ACCOUNT`, `NEXT_PUBLIC_DONATION_NAME` · QR trang chủ · Có · **QR trỏ tới tài khoản giả `0868888888`**
   - `NEXT_PUBLIC_SITE_URL` · link trong email khi không có origin · Không · dùng `http://localhost:3000`
   - `GEMINI_API_KEY`, `GEMINI_MODEL`, `HEALTH_TOKEN` · chưa dùng · Không · không ảnh hưởng
3. **Database:** chạy `supabase/schema.sql` trong SQL Editor (chạy lại nhiều lần an toàn); bucket `gift-media` tự tạo lần đầu tải ghi âm.
4. **Tài khoản admin:** `cd src && node --env-file=.env.local scripts/create-admin.mjs <username|email> --password <≥10 ký tự>`; tắt "Allow new users to sign up" trong Supabase Auth.
5. **Chế độ bộ nhớ:** để trống biến Supabase → có thiệp demo `KP-2010-DEMO` (OTP `TAO-2010`, PIN `2010`); ghi âm không dùng được (503).

- [ ] **Step 5: Viết `docs/06-trien-khai-vercel.md`**

Các mục:
1. **Tạo project:** Import repo `Zira-Solution/ziratech-kp-charm-qr` → Framework Preset Next.js → **Root Directory = `src`** → Node.js 22.x trở lên. Không cần `vercel.json`. Nguồn: Vercel docs *Configuring a Build* (Root Directory chỉ đặt trong Project Settings; app không đọc được file ngoài thư mục này) và *Environment variables* (biến có sẵn lúc build và lúc chạy function).
2. **Biến môi trường:** đặt đủ các biến "Bắt buộc ở production" của `docs/02` cho Production; Preview dùng project Supabase riêng nếu có, tránh ghi đơn thử vào DB thật. `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `SMTP_PASS`, `SEPAY_API_KEY` đặt kiểu Secret. Đổi biến chỉ có hiệu lực từ lần deploy sau.
3. **Sau deploy lần đầu:** đặt webhook SePay trỏ `https://<domain>/api/sepay/webhook` với API key trùng `SEPAY_API_KEY`; tạo admin bằng `create-admin.mjs` (chạy local với `.env.local` trỏ cùng project Supabase).
4. **Checklist sau mỗi lần deploy:** `/` tải được và hiện số tiền quỹ; QR quyên góp đúng tài khoản thật; `/gift` nhập mã thử được; `/admin` đăng nhập được; tạo một đơn thử → nhận email → soạn → xem bằng PIN → xóa mềm đơn thử.
5. **Sự cố thường gặp:** build không thấy `package.json` → Root Directory chưa là `src`; 500 khi mở thiệp → thiếu `AUTH_SECRET`; admin báo chưa cấu hình Supabase → thiếu `NEXT_PUBLIC_SUPABASE_ANON_KEY`; ghi âm 503 → thiếu `SUPABASE_SERVICE_ROLE_KEY`; webhook 401 → API key lệch.

- [ ] **Step 6: Kiểm link trong tài liệu**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && grep -ohE '\]\(([^)#]+)' README.md docs/0*.md | sed 's/](//' | grep -v '^http' | while read -r l; do for base in . docs; do [ -e "$base/$l" ] && continue 2; done; echo "BROKEN $l"; done; echo DONE
```
Expected: chỉ in `DONE`, không có dòng `BROKEN`.

- [ ] **Step 7: Kiểm toàn bộ lần cuối**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr/src" && npx tsc --noEmit && npx eslint && npm test 2>&1 | grep -E "^ℹ (pass|fail)" && node scripts/floor-guard.mjs && (command -v gitleaks >/dev/null && gitleaks detect --source .. --redact --no-banner || echo "gitleaks chưa cài: bỏ qua")
```
Expected: không lỗi, `pass 80 / fail 0`, `floor-guard: clean`, gitleaks sạch hoặc thông báo chưa cài.

- [ ] **Step 8: Commit**

```bash
cd "E:/Ziratech/ziratech-kp-charm-qr" && git add -A && git commit -q -m "docs: readme and vercel deploy guide" && git log --oneline -4
```

---

## Sau khi xong

Báo người dùng: các commit trên nhánh, kết quả so với gốc, những gì chưa chạy được (gitleaks, osv-scanner, check-web nếu không chạy), và việc cần làm trên Vercel (tạo project, Root Directory = `src`, đặt biến). Không push, không merge khi chưa được yêu cầu.
