# K&P Atelier — Vòng charm & thiệp số 20/10

Web app cho quầy bán vòng charm của K&P Atelier tại ĐH FPT TP.HCM (sự kiện 16–20/10/2026). Mỗi đơn có một **mã thiệp**, một **OTP tạo thiệp** cho người mua và một **PIN 4 số** cho người nhận: người mua tự soạn thiệp số (thư, ảnh, ghi âm, video, nhạc...), người nhận mở thiệp bằng PIN. Lợi nhuận được góp cho trạm cứu hộ Sân Nhà Nhiều Chó.

**Công nghệ:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres, Auth, Storage), nodemailer (SMTP), SePay webhook. Deploy trên Vercel.

> Next.js 16 khác nhiều so với các bản cũ. Trước khi viết code framework, đọc `src/node_modules/next/dist/docs/` (xem `src/AGENTS.md`) và `CONSTRAINTS.md`.

## Cấu trúc repo

```
├── README.md
├── CLAUDE.md              hướng dẫn cho AI agent
├── CONSTRAINTS.md         tiêu chuẩn chất lượng bắt buộc (kiểm tra nào chặn, ngưỡng bao nhiêu)
├── supabase/              schema.sql, seed.sql (chạy tay trong Supabase SQL Editor)
├── docs/
│   ├── 01-kien-truc-he-thong-va-luong-du-lieu.md
│   ├── 02-cai-dat-va-moi-truong.md
│   ├── 06-trien-khai-vercel.md
│   ├── adr/               các quyết định kiến trúc
│   ├── specs/             đặc tả tính năng
│   ├── plans/             kế hoạch triển khai
│   └── archive/           file thiết kế, ảnh tham khảo, script nháp, task list cũ
└── src/                   app Next.js (Vercel Root Directory)
    ├── app/               route: trang và API
    ├── components/        gift-templates (xem thiệp), studio (soạn thiệp), admin, home, ui
    ├── lib/               auth, supabase, validation, mail, media
    ├── config/  types/
    ├── public/            ảnh, âm thanh
    └── scripts/           test (*.test.ts) và công cụ kiểm tra
```

## Route

| Route | Mục đích | Quyền |
|---|---|---|
| `/` | Trang chủ, form nhập mã thiệp cho người nhận, quyên góp | Public |
| `/gift` | Người mua nhập mã thiệp + OTP tạo thiệp | Public |
| `/create/[token]` | Studio soạn thiệp (3 bước) | Cookie phiên `create` |
| `/g/[token]` | Người nhận xem thiệp (hỏi PIN nếu chưa có phiên) | Cookie phiên `open` |
| `/admin` | Tạo đơn tại quầy, đơn hàng, dây vòng, báo cáo, sao kê quỹ | Supabase Auth, role `admin` |
| `/messenger` | Bản demo "thiệp kiểu Messenger", chạy hoàn toàn ở trình duyệt | Public |
| `/thamkhao` | Mẫu thiệp Storybook cũ (tham khảo thiết kế) | Public |
| `/api/gifts/*` | Xác thực mã, đọc / lưu thiệp, tải ghi âm | Phiên thiệp |
| `/api/admin/*` | API của trang quản trị | Admin |
| `/api/sepay/webhook` | Nhận giao dịch quyên góp | `Authorization: Apikey ...` |
| `/api/donations/summary` | Tổng tiền quỹ công khai | Public |

## Khởi động nhanh

```bash
cd src
cp .env.example .env.local   # để trống Supabase = chạy bằng bộ nhớ, có thiệp demo
npm ci
npm run dev                  # http://localhost:3000
```

Khi chưa cấu hình Supabase, app dùng dữ liệu trong bộ nhớ và có sẵn thiệp demo: mã `KP-2010-DEMO`, OTP tạo thiệp `TAO-2010`, PIN `2010`. Chi tiết biến môi trường: [docs/02](docs/02-cai-dat-va-moi-truong.md).

## Kiểm tra

Chạy trong `src/`. Ngưỡng và lý do nằm ở [CONSTRAINTS.md](CONSTRAINTS.md).

| Lệnh | Làm gì |
|---|---|
| `npm run check:fast` | `tsc`, `eslint`, floor guard, gitleaks |
| `npm test` | test các hàm thuần (`scripts/*.test.ts`) |
| `npm run check:task` | `check:fast` + `npm test` |
| `npm run check:web` | Lighthouse so với `scripts/web-baseline.json` (cần `npm run build && npx next start -p 5001`) |
| `npm run check:cards` | nghiệm thu studio và trang xem thiệp qua Chrome (xem đầu `scripts/accept-cards.mjs`) |

## Tài liệu

| Tài liệu | Nội dung |
|---|---|
| [01. Kiến trúc & luồng dữ liệu](docs/01-kien-truc-he-thong-va-luong-du-lieu.md) | Các tầng, database, luồng bán hàng / soạn thiệp / xem thiệp, quyên góp |
| [02. Cài đặt & môi trường](docs/02-cai-dat-va-moi-truong.md) | Biến môi trường, database, tài khoản admin, chế độ bộ nhớ |
| [06. Triển khai Vercel](docs/06-trien-khai-vercel.md) | Tạo project, biến môi trường, checklist sau deploy, sự cố thường gặp |
| [docs/adr/](docs/adr/) | Quyết định về khối nội dung thiệp, nơi lưu media, skin và khung dọc/ngang |
| [docs/specs/](docs/specs/) | Đặc tả studio, thiệp theo thông điệp, đặc tả sản phẩm gốc |

## Việc còn mở

- **T21 – Studio theo thiết bị:** kiểm studio ở 390 / 768 / 1280px (xem [docs/archive/tasks/todo.md](docs/archive/tasks/todo.md)).
- Chưa kiểm trên môi trường thật: ghi âm qua Supabase Storage, phát âm thanh trên iPhone/Safari, mở một thiệp cũ có thật trong DB.
