# 06. Triển khai trên AWS Amplify

App chạy trên **AWS Amplify Hosting** (Next.js SSR), theo cùng mẫu với Zoney.vn-Web. App Next.js nằm trong `src/`, nên Amplify được cấu hình với `appRoot: src`.

| File | Vai trò |
|---|---|
| `amplify.yml` (gốc repo) | Buildspec: hai cổng chặn (`NODE_ENV`, phiên bản Node), `npm ci`, ghi biến môi trường cho runtime, `npm run build`. Ghi đè Build settings trên Console |
| `customHttp.yml` (gốc repo) | Header `Cache-Control` cho ảnh và âm thanh trong `src/public/`. Amplify chỉ đọc file này ở gốc repo |
| `src/scripts/amplify-env.mjs` | Ghi biến Console vào `src/.env.production` để server Next.js đọc được lúc chạy (có test: `amplify-env.test.ts`) |

## Rủi ro đã chấp nhận

1. **Next.js 16 không nằm trong danh sách hỗ trợ của AWS.** Tài liệu Amplify (*Amplify support for Next.js*) ghi: *"You can deploy apps built with Next.js versions up through Next.js 15"*. Repo dùng Next.js 16.3.8, cùng phiên bản Zoney.vn-Web đang dùng trên Amplify. Nếu gặp lỗi riêng của Next 16 trên Amplify, AWS không có nghĩa vụ hỗ trợ.
2. **Secret nằm trong artifact build.** Amplify không đưa biến Console tới server lúc chạy; cách AWS hướng dẫn là ghi vào `.env.production` trước khi build. AWS cũng cảnh báo: *"any user with access to deployment artifacts can read them"*. Vì vậy chỉ cấp quyền Amplify cho người cần, và không dùng chung secret của dự án khác. (Cách sạch hơn là đọc secret từ AWS Secrets Manager qua IAM role của SSR compute, cần sửa code.)

Thêm: Amplify không hỗ trợ Next.js streaming, Edge runtime và `unstable_after` (app này không dùng hai cái sau; thiếu streaming chỉ làm trang trả về một lần thay vì từng phần). Tài liệu quota của Amplify không nêu giới hạn kích thước request; request lớn nhất của app là lưu thiệp (tối đa 3,5 MB), nên checklist có bước thử thiệp đủ 6 ảnh.

## 1. Tạo app

1. Mở AWS Console, chọn region **Asia Pacific (Singapore) `ap-southeast-1`** (cùng khu vực với Supabase) → **AWS Amplify** → tạo app mới, nguồn **GitHub**.
2. Cấp quyền cho Amplify đọc tổ chức `Zira-Solution`, chọn repo `ziratech-kp-charm-qr`, nhánh `main`.
3. Đánh dấu app là **monorepo** và nhập thư mục gốc của app: **`src`** (phải khớp `appRoot: src` trong `amplify.yml`).
4. Amplify nhận `amplify.yml` trong repo; không sửa build settings trên Console (file trong repo ghi đè Console).
5. Đặt biến môi trường (mục 3) **trước** lần build đầu, nếu không bản đầu chạy ở chế độ bộ nhớ.

## 2. Phiên bản Node.js

Next.js 16 cần Node.js ≥ 20.9. `amplify.yml` chặn build nếu Node cũ hơn. Đặt phiên bản (theo *Customizing the build image* của AWS):

**Hosting → Build settings → Build image settings → Edit → Live package updates → Add new → Package: Node.js, Version: `22`** → Save.

Phải ghi số cụ thể. AWS cảnh báo: *"Setting the Node.js version to latest causes builds to fail."*

## 3. Biến môi trường

Đặt trong **Hosting → Environment variables** của app. Bảng đầy đủ (bắt buộc hay không, thiếu thì sao, cách lấy) ở [02 — mục 2](02-cai-dat-va-moi-truong.md#2-biến-môi-trường).

| Bắt buộc | Nên có |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `NEXT_PUBLIC_DONATION_BANK`, `NEXT_PUBLIC_DONATION_ACCOUNT`, `NEXT_PUBLIC_DONATION_NAME`, `SEPAY_API_KEY` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` |

Cách biến tới được server:
- `src/scripts/amplify-env.mjs` chỉ ghi các biến server trong danh sách `SERVER_VARS` và mọi biến `NEXT_PUBLIC_*`; các biến khác của máy build không bị chép.
- Mỗi giá trị được bọc trong một loại dấu nháy mà nó không chứa, và `$` được escape. Lý do: bộ đọc env của Next.js thay thế `$TEN` và cắt ở ` #`, nên `env | grep >> .env.production` (cách AWS ví dụ) biến mật khẩu `ab$cd#ef` thành `ab`. Đã kiểm bằng chạy thật: webhook nhận đúng key `ab$cd#ef x`, còn key bị cắt `ab` bị từ chối.
- Giá trị **không được** kết thúc bằng `\`, chứa cả ba loại nháy `` ` `` `"` `'`, hoặc vừa xuống dòng vừa có `"`. Gặp các trường hợp đó build dừng và nêu tên biến.
- Build log có dòng `amplify-env: wrote N variable(s) ...` kèm tên (không in giá trị), và dòng `WARNING missing ...` nếu thiếu biến Supabase hoặc `AUTH_SECRET`.

Lưu ý:
- **Không đặt `NODE_ENV`.** Build sẽ bị chặn ngay (`npm ci` bỏ devDependencies khi `NODE_ENV=production`, sự cố Zoney 07/2026).
- Thêm biến server mới trong code thì phải thêm tên vào `SERVER_VARS` trong `src/scripts/amplify-env.mjs`, nếu không biến chỉ tồn tại lúc build. Test `amplify-env.test.ts` kiểm danh sách hiện tại.
- Đổi biến chỉ có hiệu lực ở lần build sau: **Redeploy** nhánh `main`.

## 4. Domain

Sau build đầu, app có domain dạng `https://main.<app-id>.amplifyapp.com`. Domain riêng: **Hosting → Custom domains → Add domain**, rồi tạo bản ghi DNS theo hướng dẫn Amplify hiển thị.

## 5. Việc làm một lần sau deploy đầu tiên

1. Chạy `supabase/schema.sql` trên project Supabase production (xem [02 — mục 3](02-cai-dat-va-moi-truong.md#3-database)).
2. Tạo tài khoản admin bằng `src/scripts/create-admin.mjs`, chạy ở máy local với `src/.env.local` trỏ cùng project Supabase.
3. SePay → Webhooks: URL `https://<domain>/api/sepay/webhook`, xác thực **API Key** trùng `SEPAY_API_KEY`.

## 6. Checklist sau mỗi lần deploy

| # | Kiểm tra | Kỳ vọng |
|---|---|---|
| 0 | Build log | Không có `BUILD BI CHAN`; có `amplify-env: wrote ...`, không có `WARNING missing` |
| 1 | Mở `/` | Trang tải được, khối quỹ hiện số tiền (0đ nếu chưa có giao dịch) |
| 2 | Quét QR quyên góp | Đúng ngân hàng, số tài khoản, tên thật, **không phải `0868888888`** |
| 3 | `curl -I https://<domain>/thamkhao/gift_box.png` | Có `cache-control: public, max-age=86400, ...` |
| 4 | `/admin` | Đăng nhập được |
| 5 | Tạo đơn thử | Email tới hộp thư khách |
| 6 | `/gift` với mã + OTP vừa nhận, tạo thiệp **đủ 6 ảnh** + ghi âm, lưu | Lưu thành công (kiểm giới hạn kích thước request) |
| 7 | `/g/<mã>` ở trình duyệt khác, nhập PIN | Thấy đúng nội dung, nghe được ghi âm |
| 8 | Xóa đơn thử | Đơn vào thùng rác, không tính vào báo cáo |

## 7. Sự cố thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Build dừng với `BUILD BI CHAN: NODE_ENV ...` | Có biến `NODE_ENV` trên Console | Xóa biến, build lại |
| Build dừng với `BUILD BI CHAN: Node.js ... qua cu` | Image dùng Node < 20.9 | Mục 2: Live package updates → Node.js `22` |
| Build dừng với `amplify-env: X cannot be written ...` | Giá trị có ký tự không ghi an toàn được (mục 3) | Đổi giá trị trên Console |
| `Cannot find module '@tailwindcss/postcss'` | `NODE_ENV=production` lọt qua (ví dụ đặt ở tầng khác) | Gỡ `NODE_ENV` ở mọi nơi |
| Build không tìm thấy `package.json` | App chưa khai là monorepo với root `src` | Sửa thư mục gốc app thành `src` |
| Nhập đúng mã thiệp báo lỗi hệ thống (500) | Thiếu `AUTH_SECRET` | Đặt biến → Redeploy |
| Đơn tạo xong rồi biến mất | Thiếu biến Supabase server, app chạy bằng bộ nhớ | Đặt `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` → Redeploy |
| Admin báo "chưa cấu hình Supabase" (503) | Thiếu `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Đặt biến → Redeploy |
| Biến mới thêm trong code luôn `undefined` khi chạy | Chưa có trong `SERVER_VARS` | Thêm vào `src/scripts/amplify-env.mjs` |
| Webhook SePay 401 / 503 | Key lệch / thiếu `SEPAY_API_KEY` | Sửa cho trùng / đặt biến → Redeploy |
| Lưu thiệp nhiều ảnh lỗi 413 hoặc 5xx | Có thể vượt giới hạn request của Amplify (chưa có số liệu chính thức) | Báo lại để giảm `MAX_PHOTO_CHARS` hoặc chuyển ảnh sang Storage |

## Nguồn

Tài liệu AWS, đọc ngày 2026-10-17: *Amplify support for Next.js* (`ssr-amplify-support`), *Making environment variables accessible to server-side runtimes* (`ssr-environment-variables`), *Customizing the build image* (`custom-build-image`), *Custom header YAML reference*, *Amplify Hosting service quotas*. Kinh nghiệm vận hành: `Zoney.vn-Web/docs/audit/DEPLOY-AMPLIFY.md`.
