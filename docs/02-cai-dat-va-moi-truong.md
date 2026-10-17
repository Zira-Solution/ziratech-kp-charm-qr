# 02. Cài đặt & môi trường

## 1. Yêu cầu

- **Node.js 22.6 trở lên** (`npm test` dùng `node --experimental-strip-types` để chạy file `.ts` trực tiếp). Đã chạy được trên Node 24.
- npm (repo dùng `package-lock.json`, cài bằng `npm ci`).
- **Mọi lệnh npm chạy trong `src/`**, nơi có `package.json`.

```bash
cd src
cp .env.example .env.local
npm ci
npm run dev        # http://localhost:3000
```

Next.js đọc biến môi trường từ thư mục app, nên file là **`src/.env.local`** (không phải ở gốc repo). Không bao giờ commit file này; `.gitignore` đã chặn mọi `.env*` trừ `.env.example`.

## 2. Biến môi trường

Chỉ biến có tiền tố `NEXT_PUBLIC_` bị đưa vào bundle trình duyệt; mọi biến khác chỉ server đọc. Khi deploy, đặt các biến này trên Amplify Console; `amplify.yml` ghi chúng vào `src/.env.production` cho server đọc (xem [06](06-trien-khai-amplify.md)).

| Biến | Dùng ở | Bắt buộc ở production? | Thiếu thì sao |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | mọi truy vấn DB và Storage (server) | **Có** | Đơn, dây vòng, khóa nhập sai chỉ lưu trong bộ nhớ và **mất khi restart** (production in lỗi ra log); ghi âm trả 503 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | đăng nhập admin (Supabase Auth) | **Có** | Đăng nhập admin trả 503 "chưa cấu hình Supabase" |
| `AUTH_SECRET` (≥ 32 ký tự; `ADMIN_JWT_SECRET` là tên cũ vẫn đọc được) | ký cookie phiên thiệp | **Có** | Production: nhập mã thiệp trả 500, không ai vào được studio hay xem thiệp. Dev: dùng khóa ngẫu nhiên, mọi phiên mất khi restart |
| `SMTP_HOST`, `SMTP_PORT` (mặc định 587), `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | gửi mã cho khách | Nên có | Email chỉ được in ra log; đơn ghi "chưa gửi email", nhân viên phải đưa mã tận tay |
| `SEPAY_API_KEY` | xác thực webhook SePay | Có nếu nhận quyên góp | Webhook trả 503, SePay sẽ gửi lại sau |
| `NEXT_PUBLIC_DONATION_BANK`, `NEXT_PUBLIC_DONATION_ACCOUNT`, `NEXT_PUBLIC_DONATION_NAME` | mã VietQR quyên góp ở trang chủ | **Có** | ⚠️ QR dùng giá trị mặc định trong `src/components/home/Shelter.tsx`: **tài khoản giả `0868888888`** |
| `NEXT_PUBLIC_SITE_URL` | link trong email khi không có origin | Không | Gần như không dùng: các route luôn truyền origin của request |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `HEALTH_TOKEN` | chưa có code nào đọc | Không | Không ảnh hưởng |

Sinh `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Database

1. Tạo project trên Supabase.
2. Mở **SQL Editor**, chạy toàn bộ `supabase/schema.sql` (ở gốc repo). File dùng `if not exists` / `on conflict do nothing`, chạy lại nhiều lần vẫn an toàn. Nó tạo 4 bảng, bật RLS, thu quyền `anon`/`authenticated` và nạp 4 dây vòng mặc định.
3. Không cần tạo bucket: `gift-media` (riêng tư, tối đa 2MB/file) tự tạo lần đầu có người tải ghi âm.

## 4. Tài khoản admin

Nhân viên đăng nhập bằng Supabase Auth. Tạo tài khoản (chạy trong `src/`):

```bash
node --env-file=.env.local scripts/create-admin.mjs <username|email> --password <ít nhất 10 ký tự>
```

- Bỏ `--password` thì script sinh mật khẩu ngẫu nhiên và in ra **một lần**.
- Username không có `@` được đổi thành `<username>@example.com` (miền dành riêng, không ai đăng ký được); khi đăng nhập chỉ cần gõ username.
- Xóa tài khoản: `node --env-file=.env.local scripts/create-admin.mjs <email> --delete`.
- Trong Supabase Dashboard → Authentication, **tắt "Allow new users to sign up"** để không ai tự đăng ký được.

## 5. Chạy không cần Supabase

Để trống các biến Supabase trong `src/.env.local` là đủ để làm giao diện và test luồng:

- Có sẵn thiệp demo: mã `KP-2010-DEMO`, OTP tạo thiệp `TAO-2010`, PIN `2010` (trang `/gift` có nút "Điền mẫu thử nghiệm" khi chạy dev).
- Dây vòng lấy từ `src/config/catalog.ts` và sửa được trong bộ nhớ.
- Không đăng nhập được admin (cần Supabase Auth) và không ghi âm được (cần Storage).
- `npm run check:cards` cần đúng chế độ này (xem đầu `src/scripts/accept-cards.mjs`).

## 6. Kiểm tra trước khi commit

Chạy trong `src/`, theo `CONSTRAINTS.md`:

```bash
npm run check:fast   # tsc, eslint, floor guard, gitleaks
npm test             # 80 test hàm thuần
```

`gitleaks` và `osv-scanner` là công cụ ngoài, cần cài riêng (không có trong `node_modules`).
