# Spec: Chuẩn hóa cấu trúc repo để deploy Vercel

Trạng thái: đã duyệt thiết kế (2026-10-17), chưa triển khai. Nhánh: `chore/restructure-repo`.
Mẫu tham khảo: `Zoney.vn/Zoney.vn-Web` (gốc repo là "vỏ", app Next.js nằm trọn trong `src/`).

## Mục tiêu

Repo deploy được lên Vercel với Root Directory = `src`, gốc repo chỉ còn tài liệu và cấu hình dùng chung, tài nguyên không chạy được gom vào `docs/`. Không đổi hành vi của app: mọi route, API, test giữ nguyên kết quả.

Thành công = trong `src/`: `npx tsc --noEmit`, `npx eslint`, `npm test` (80 test), `npx next build` cho kết quả giống hệt trước khi di chuyển; `node scripts/floor-guard.mjs` sạch; `next start` phục vụ được `/`, `/gift`, `/api/donations/summary` và ảnh trong `public/`.

## Quyết định đã chốt

1. Nền tảng: **Vercel** (không dùng Amplify như Zoney). Repo chưa có project Vercel nào.
2. Bám sát Zoney: `package.json` và mọi cấu hình app chuyển vào `src/`; không có `package.json` ở gốc.
3. Mọi thứ không phải code chạy vào `docs/`; thứ không còn cần thiết vào `docs/archive/`.
4. Tài liệu đợt này: `README.md` (viết lại, giữ ở gốc), `docs/01`, `docs/02`, `docs/06`. Các số 03–05 để đợt sau.
5. Không đổi tên file hay quy tắc code (kebab-case, Prettier của Zoney): ngoài phạm vi.
6. Commit bằng tiếng Anh, ngắn, không có co-author.

## Cấu trúc đích

```
ziratech-kp-charm-qr/
├── README.md                 README chính (viết lại, không dùng .github/)
├── .vscode/
├── .gitignore
├── CLAUDE.md                  trỏ tới src/AGENTS.md và CONSTRAINTS.md
├── CONSTRAINTS.md             chính sách chất lượng cho cả repo
├── supabase/                  schema.sql, seed.sql (chạy tay trên Supabase)
├── docs/
│   ├── 01-kien-truc-he-thong-va-luong-du-lieu.md
│   ├── 02-cai-dat-va-moi-truong.md
│   ├── 06-trien-khai-vercel.md
│   ├── adr/
│   ├── specs/                 + KP_Atelier_Spec_AI_Condensed.md
│   └── archive/
│       ├── K&P/               file thiết kế, .docx, ảnh draw
│       ├── thamkhao/          ảnh tham khảo ở gốc cũ
│       ├── scratch/           script nháp
│       └── tasks/             plan.md, todo.md của đợt card-messages
└── src/                       app root, Vercel Root Directory
    ├── package.json  package-lock.json  next.config.ts  tsconfig.json
    ├── eslint.config.mjs  postcss.config.mjs  osv-scanner.toml  .env.example
    ├── app/  components/  config/  lib/  types/
    ├── public/
    └── scripts/               test (*.test.ts) và công cụ kiểm
```

Đường dẫn `src/app`, `src/components`, `src/lib`... không đổi, nên import `@/...` không phải sửa.

## Thay đổi cấu hình đi kèm

| File | Thay đổi |
|---|---|
| `src/tsconfig.json` | `paths`: `"@/*": ["./*"]` |
| `src/package.json` | script `test` vẫn là `scripts/*.test.ts`, chạy từ `src/` |
| `src/scripts/*.test.ts` | import `../src/...` thành `../...` |
| `src/scripts/*.mjs` | đường dẫn tương đối tới file khác (nếu có) chỉnh theo vị trí mới |
| `src/eslint.config.mjs` | bỏ `scratch/**`, `K&P/**` khỏi `globalIgnores` |
| `.gitignore` | mẫu không neo gốc: `node_modules/`, `.next/`, `out/`, `build/`, `next-env.d.ts`, `*.tsbuildinfo`; thêm `.codegraph/`; giữ quy tắc `.env*` / `!.env.example` |
| `src/scripts/floor-guard.mjs` | chạy git từ gốc repo (`git rev-parse --show-toplevel`) để vẫn thấy file chưa track ngoài `src/`; không nới quy tắc nào |
| `CLAUDE.md` | `@src/AGENTS.md`; nhắc đọc `CONSTRAINTS.md` |
| `AGENTS.md` | chuyển vào `src/` (do `next dev` sinh cạnh `package.json`) |
| `.env.example` | chuyển vào `src/`; đánh dấu `GEMINI_*`, `HEALTH_TOKEN` là "chưa dùng" |
| `osv-scanner.toml` | chuyển vào `src/` |
| `CONSTRAINTS.md` | cập nhật đường dẫn lệnh (chạy trong `src/`); không đổi ngưỡng nào |

Cần xác minh khi làm: `gitleaks detect` chạy từ `src/` có quét cả repo không. Nếu không, `check:fast` gọi gitleaks với `--source ..`.

## Deploy Vercel

- Không thêm `vercel.json`: preset Next.js tự nhận `npm run build` và output `.next`.
- Project Settings: Root Directory = `src`; Node.js 22.x trở lên.
- Biến môi trường đặt trên dashboard có sẵn lúc build và lúc chạy function (tài liệu Vercel *Environment variables*), không cần bước chép biến như Amplify.
- App không đọc được file ngoài Root Directory (tài liệu Vercel *Configuring a Build*); mọi thứ build cần đều ở `src/`.

## Tài liệu

- `README.md` (gốc): sản phẩm, bảng route, khởi động nhanh (`cd src && npm ci && npm run dev`), lệnh kiểm tra, mục lục `docs/`, việc còn mở (T21 studio theo thiết bị).
- `docs/01`: các tầng, 4 bảng DB, luồng bán hàng / soạn thiệp / xem thiệp, webhook SePay, phiên và mã.
- `docs/02`: Node, `src/.env.local`, bảng biến môi trường (bắt buộc hay không, thiếu thì sao), chế độ bộ nhớ khi chưa có Supabase, tạo tài khoản admin.
- `docs/06`: tạo project Vercel, biến cho Production/Preview, checklist sau deploy, xử lý sự cố. Cảnh báo rõ: thiếu `AUTH_SECRET` thì production ném lỗi; thiếu `NEXT_PUBLIC_DONATION_*` thì QR quyên góp trỏ tới tài khoản giả `0868888888`.

## Thứ tự thực hiện (mỗi bước một commit)

1. `npm ci` ở gốc, ghi kết quả gốc của tsc / eslint / test / build.
2. Chuyển app vào `src/` + sửa cấu hình. Kiểm lại toàn bộ; giống kết quả gốc mới commit.
3. Sắp xếp `docs/` và `docs/archive/`. Kiểm `floor-guard`.
4. Viết README và `docs/01`, `02`, `06`.

## Ngoài phạm vi

Sửa các lỗi đã biết (xem trước ghi âm, link `#keepsake`, `/heart`, admin tải `gift_data`, tài khoản quyên góp mặc định), tối ưu LCP, đổi tên file, Prettier, tài liệu 03–05, tạo project Vercel thật.
