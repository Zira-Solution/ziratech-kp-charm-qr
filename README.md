# SSG

Ứng dụng web viết bằng **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**.

Hạ tầng bên ngoài: Supabase (Postgres + đăng nhập seller), Cloudflare R2 (lưu file), SMTP (gửi email), Gemini (AI), Vercel (hosting).

> **Trạng thái:** mới có bộ khung thư mục, chưa có code tính năng. Các thư mục còn trống được giữ bằng `.gitkeep`. Khi thêm file thật vào thư mục nào thì xóa `.gitkeep` của thư mục đó.

> **Lưu ý cho cả người và AI agent:** Next.js 16 có nhiều thay đổi so với các bản cũ (ví dụ `middleware.ts` đã đổi tên thành `proxy.ts`). Trước khi viết code framework, hãy đọc `node_modules/next/dist/docs/` (xem `AGENTS.md`).

## Chạy dự án

```bash
npm install
cp .env.example .env.local   # điền giá trị khi nào cần dùng dịch vụ nào
npm run dev                  # http://localhost:3000
```

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint |

Không bao giờ commit `.env.local`. Trên Vercel, đặt cùng tên biến ở Project Settings → Environment Variables.

## Kiến trúc tổng quan

```
Trình duyệt
   │
   ▼
src/proxy.ts  ── chặn /seller, /admin, làm mới session Supabase   (chưa có, cần thêm)
   │
   ├── Trang (src/app/**/page.tsx)       giao diện, gọi component
   └── API   (src/app/api/**/route.ts)   nhận request, validate, gọi service
                    │
                    ▼
            src/server/services/         logic nghiệp vụ (chỉ chạy ở server)
                    │
                    ▼
            src/lib/<dịch vụ>/           client của dịch vụ ngoài
               supabase · r2 · mail · gemini · payments
                    │
                    ▼
            Supabase · Cloudflare R2 · SMTP · Gemini · cổng thanh toán
```

Phụ thuộc chỉ đi **một chiều từ trên xuống**. Tầng dưới không được import tầng trên.

### Cấu trúc thư mục

```
src/
  app/                          routing (mỗi thư mục là một URL)
    (marketing)/                trang công khai, landing page
    (app)/compose/              soạn quà
    (app)/preorder/             luồng đặt trước
    g/[token]/                  trang của người nhận, mở bằng token không đoán được
    seller/login/               đăng nhập seller
    seller/dashboard/           khu vực seller
    admin/                      khu vực admin
    api/
      gifts/ orders/ uploads/ payments/ ai/    route handler, mỗi resource một thư mục
      payments/webhook/                        callback từ cổng thanh toán
      health/                                  endpoint cho uptime monitor (HEALTH_TOKEN)
  components/
    ui/                         thành phần nhỏ dùng chung (button, input, modal)
    layout/                     header, footer, khung trang
    features/                   thành phần gắn với một tính năng cụ thể
  lib/                          mỗi dịch vụ ngoài một thư mục client
    supabase/ r2/ mail/ gemini/ payments/
    validation/                 schema zod dùng chung cho API và form
  server/
    services/                   logic nghiệp vụ, được route handler gọi
    auth/                       guard seller/admin, kiểm tra token của người nhận
  types/                        kiểu TypeScript dùng chung
  config/                       hằng số, cấu hình tính năng
supabase/
  migrations/                   file SQL đánh số (0001_*.sql ...), chạy theo thứ tự
  seed.sql                      dữ liệu mẫu nhỏ cho dev, chạy sau migration khi db reset
docs/                           tài liệu đặc tả và các quyết định
.github/workflows/              CI, keep-alive, backup
public/                         file tĩnh
```

### Mỗi tầng làm gì

| Tầng | Được làm | Không được làm |
|---|---|---|
| `app/**/page.tsx` | Dựng giao diện, gọi component | Gọi thẳng Supabase, R2, Gemini |
| `app/api/**/route.ts` | Đọc request, validate bằng zod, gọi service, trả response | Chứa logic nghiệp vụ |
| `server/services` | Logic nghiệp vụ, kết hợp nhiều client trong `lib/` | Import từ `app/` hay `components/` |
| `lib/<dịch vụ>` | Bọc SDK của một dịch vụ ngoài | Chứa logic nghiệp vụ |
| `lib/validation` | Schema zod, dùng được ở cả server lẫn client | Import code chỉ chạy ở server |

### Quy tắc bắt buộc

1. **Route handler luôn mỏng:** validate input, gọi `server/services`, trả kết quả.
2. **Client dịch vụ chỉ import từ code server.** Với client dùng khóa bí mật, thêm `import "server-only"` ở đầu file để lỗi ngay khi build nếu lỡ import vào code chạy trên trình duyệt.
3. **`SUPABASE_SERVICE_ROLE_KEY` bỏ qua Row Level Security.** Chỉ dùng ở server và không bao giờ đặt tên có tiền tố `NEXT_PUBLIC_`.
4. **Mỗi bảng mới phải bật RLS ngay trong cùng migration** tạo ra nó.
5. **Phân quyền kiểm tra ở hai chỗ:** ở `proxy.ts` (chặn sớm) và ngay trong code server (`server/auth`). Không chỉ dựa vào proxy.
6. **Trang người nhận `g/[token]`** chỉ truy cập được bằng token không đoán được. Cần đặt `noindex` để công cụ tìm kiếm không lập chỉ mục.
7. **Validate ở biên hệ thống:** input từ API và form đều qua zod. Không validate lại giữa các hàm nội bộ.

### Biến môi trường

Danh sách đầy đủ và cách lấy từng giá trị nằm trong `.env.example`. Các nhóm chính:

| Nhóm | Biến |
|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Cloudflare R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` |
| Gemini | `GEMINI_API_KEY`, `GEMINI_MODEL` |
| Giám sát | `HEALTH_TOKEN` |

Chỉ biến có tiền tố `NEXT_PUBLIC_` mới lộ ra trình duyệt. Mọi biến còn lại là bí mật của server.

## Thêm một tính năng mới

Ví dụ thêm tính năng "gifts", đi từ dưới lên:

1. **DB:** thêm `supabase/migrations/000X_gifts.sql`, bật RLS trong cùng file.
2. **Schema:** `src/lib/validation/gifts.ts` (zod) và kiểu liên quan trong `src/types/`.
3. **Service:** `src/server/services/gifts.service.ts`, gọi client trong `lib/`.
4. **API:** `src/app/api/gifts/route.ts`, chỉ validate rồi gọi service.
5. **Giao diện:** trang trong `src/app/...`, component riêng của tính năng trong `src/components/features/`.

Đặt tên file theo dạng `<domain>.service.ts`, `<domain>.ts` (schema) để sau này nếu tách theo domain thì chỉ cần di chuyển file.

## Việc cần làm tiếp

Các mục dưới đây chưa có trong repo:

- Thay `(marketing)/page.tsx` (hiện vẫn là trang mặc định của create-next-app) bằng landing page thật, và sửa title/description trong `src/app/layout.tsx`.
- Thêm `src/proxy.ts` cho guard `/seller`, `/admin`.
- Thêm `layout.tsx` cho từng khu vực (`(marketing)`, `(app)`, `seller`, `admin`).
- Validate biến môi trường bằng zod trong `src/config/`.
- Thêm script `typecheck`, test runner và CI trong `.github/workflows/`.
- Ghi các quyết định kiến trúc (nhà cung cấp thanh toán, cơ chế token của người nhận, cách đăng nhập admin) vào `docs/`, vì hiện chưa có tài liệu nào về chúng trong repo.
