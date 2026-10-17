# 06. Triển khai trên Vercel

App Next.js nằm trong `src/`, nên project Vercel phải trỏ **Root Directory = `src`**. Ngoài setting đó, preset Next.js của Vercel tự lo phần còn lại; repo không cần `vercel.json`.

Nguồn đối chiếu (tài liệu Vercel, đọc ngày 2026-10-17):
- *Configuring a Build* — Root Directory đặt trong Project Settings → Build and Deployment; app **không đọc được file ngoài thư mục này** và không dùng được `..`; bước install cài cả `devDependencies`; đổi setting chỉ áp dụng từ lần deploy sau.
- *Environment variables* — biến đặt trên dashboard có sẵn lúc build và lúc chạy function; đổi biến chỉ áp dụng cho deploy mới; tổng dung lượng biến tối đa 64 KB.

Mọi thứ cần để build (`package.json`, cấu hình, `public/`) đều nằm trong `src/`. `docs/`, `supabase/` và `CONSTRAINTS.md` ở ngoài và không tham gia build.

## 1. Tạo project

1. Vercel → **Add New → Project** → import repo `Zira-Solution/ziratech-kp-charm-qr`.
2. **Framework Preset:** Next.js (Vercel tự nhận).
3. **Root Directory:** `src`.
4. Build / Install / Output Command: để mặc định (`npm run build`, `npm ci`/`npm install`, `.next`).
5. Project Settings → **Node.js Version:** 22.x trở lên.
6. Đặt biến môi trường (mục 2) **trước** lần deploy đầu, nếu không bản đầu sẽ chạy ở chế độ bộ nhớ.

## 2. Biến môi trường

Bảng đầy đủ (biến nào bắt buộc, thiếu thì sao) ở [02 — mục 2](02-cai-dat-va-moi-truong.md#2-biến-môi-trường). Tóm tắt cho **Production**:

| Bắt buộc | Nên có |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `NEXT_PUBLIC_DONATION_BANK`, `NEXT_PUBLIC_DONATION_ACCOUNT`, `NEXT_PUBLIC_DONATION_NAME`, `SEPAY_API_KEY` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` |

- Đặt `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `SMTP_PASS`, `SEPAY_API_KEY` kiểu **Secret**.
- **Preview** (deploy từ nhánh khác `main`): nên trỏ tới một project Supabase riêng, hoặc để trống Supabase để chạy bằng bộ nhớ, tránh đơn thử lẫn vào danh sách đơn thật của nhân viên.
- **Không** đặt `NODE_ENV`; Next.js tự quản lý.
- Đổi biến xong phải **Redeploy** thì mới có hiệu lực.

## 3. Việc làm một lần sau deploy đầu tiên

1. Chạy `supabase/schema.sql` trên project Supabase của Production (xem [02 — mục 3](02-cai-dat-va-moi-truong.md#3-database)).
2. Tạo tài khoản admin bằng `scripts/create-admin.mjs`, chạy ở máy local với `src/.env.local` trỏ cùng project Supabase.
3. SePay → Webhooks: URL `https://<domain>/api/sepay/webhook`, kiểu xác thực API Key, giá trị trùng `SEPAY_API_KEY`.
4. Gắn domain trong Vercel → Settings → Domains (nếu có).

## 4. Checklist sau mỗi lần deploy

| # | Kiểm tra | Kỳ vọng |
|---|---|---|
| 1 | Mở `/` | Trang tải được, khối quỹ hiện số tiền (0đ nếu chưa có giao dịch) |
| 2 | Xem mã QR quyên góp | Đúng ngân hàng, số tài khoản, tên thật, **không phải `0868888888`** |
| 3 | `/admin` | Đăng nhập được bằng tài khoản admin |
| 4 | Tạo một đơn thử ở tab "Tạo đơn" | Email tới hộp thư khách (hộp thoại không báo "chưa gửi được email") |
| 5 | `/gift` với mã thiệp + OTP vừa nhận | Vào được studio; ghi âm thử tải lên được |
| 6 | Lưu thiệp, mở `/g/<mã>` ở trình duyệt khác, nhập PIN | Thấy đúng các mục đã soạn, nghe được ghi âm |
| 7 | Tab "Đơn hàng" → xóa đơn thử | Đơn vào thùng rác, không còn tính vào báo cáo |

## 5. Sự cố thường gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách sửa |
|---|---|---|
| Build báo không tìm thấy `package.json` hoặc không nhận Next.js | Root Directory chưa là `src` | Settings → Build and Deployment → Root Directory = `src`, redeploy |
| Nhập đúng mã thiệp nhưng báo "lỗi hệ thống" (500) | Thiếu `AUTH_SECRET` hoặc ngắn hơn 32 ký tự | Đặt `AUTH_SECRET`, redeploy |
| Đơn vừa tạo biến mất sau một lúc, log có `SUPABASE_SERVICE_ROLE_KEY is missing` | Thiếu biến Supabase server | Đặt `NEXT_PUBLIC_SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`, redeploy |
| Đăng nhập admin báo "chưa cấu hình Supabase" (503) | Thiếu `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Đặt biến, redeploy |
| Đăng nhập đúng mật khẩu vẫn bị từ chối | Tài khoản không có `role: admin` | Chạy lại `create-admin.mjs` với email đó |
| Ghi âm báo "Chưa cấu hình nơi lưu ghi âm" (503) | Thiếu `SUPABASE_SERVICE_ROLE_KEY` | Đặt biến, redeploy |
| Webhook SePay trả 401 | API key trên SePay khác `SEPAY_API_KEY` | Sửa cho trùng |
| Webhook SePay trả 503 | Thiếu `SEPAY_API_KEY` | Đặt biến, redeploy |
| Trang tải chậm trên 4G | Font Material Symbols (~3,9 MB) và ảnh lớn trong `src/public/` | Việc tối ưu riêng, xem phần Targets trong `CONSTRAINTS.md` |
