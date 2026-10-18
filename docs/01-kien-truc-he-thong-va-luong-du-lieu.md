# 01. Kiến trúc hệ thống & luồng dữ liệu

Tài liệu cho lập trình viên mới vào dự án. Mọi đường dẫn file tính từ gốc repo.

## 1. Các tầng

```
Trình duyệt
   │
   ├── Trang  src/app/**/page.tsx          (đa số là client component, gọi API bằng fetch)
   └── API    src/app/api/**/route.ts      tự kiểm quyền, validate, gọi thẳng lib
                     │
                     ▼
              src/lib/                      auth · supabase · validation · mail · media
                     │
                     ▼
              Supabase (Postgres, Auth, Storage) · SMTP · SePay (gọi vào webhook)
```

- **Không có `proxy.ts` / middleware.** Mỗi route handler tự kiểm quyền:
  - thiệp: `hasGiftSession(req, scope, token)` trong `src/lib/auth/gift-session.ts`;
  - admin: `getAdminUser()` trong `src/lib/supabase/auth.ts` (Supabase Auth, chỉ user có `app_metadata.role === "admin"`).
- **Supabase luôn dùng service-role key** ở server (`src/lib/supabase/server.ts`). Các bảng bật RLS nhưng không có policy nào, nên anon key không đọc/ghi được gì; server là cổng duy nhất.
- **Chế độ bộ nhớ:** khi thiếu `NEXT_PUBLIC_SUPABASE_URL` hoặc `SUPABASE_SERVICE_ROLE_KEY`, `products.ts`, `chains.ts`, `attempts.ts` lưu trong bộ nhớ của process (mất khi restart). Ngoài production có sẵn thiệp demo `KP-2010-DEMO`.
- **Hàm thuần** (validation, `normalizeGift`, `layoutFor`, `embed.ts`...) không import framework và được test bằng `node --test` (`src/scripts/*.test.ts`). Chúng import lẫn nhau bằng đường dẫn tương đối có đuôi `.ts` để Node chạy trực tiếp được.

## 2. Dữ liệu

Schema: `supabase/schema.sql` (chạy lại nhiều lần vẫn an toàn).

| Bảng | Nội dung |
|---|---|
| `gift_products` | Một đơn = một thiệp. Thông tin khách, dây vòng, giá, `status` (`pending` chưa soạn / `completed` đã lưu thiệp), `gift_data` (JSON nội dung thiệp), `creator_key` và `unlock_pin` (hash scrypt, không bao giờ lưu plaintext), `deleted_at` (xóa mềm) |
| `access_attempts` | Đếm lần nhập sai theo khóa (`gift:open:<token>`, `admin:<email>`...). Thiệp: sai 5 lần khóa 15 phút; admin: sai 10 lần |
| `chains` | Dây vòng đang bán (tên, giá, màu), admin sửa ở tab "Sản phẩm" |
| `donations` | Giao dịch chuyển khoản vào quỹ, do webhook SePay ghi. `sepay_id` unique nên SePay gửi lại không bị ghi trùng |

- **Nội dung thiệp** (`gift_data`) có trường `blocks`: danh sách thông điệp người mua đã tích, theo thứ tự (`letter`, `photos`, `voice`, `video`, `music`, `anniversary`, `timeline`, `finalMessage`). Thiệp cũ không có `blocks` được suy ra khi đọc (`deriveBlocks`). Xem `docs/adr/0002-card-messages-skins-and-frames.md`.
- **Ảnh** được nén ở trình duyệt và nhúng base64 trong `gift_data` (tối đa 6 ảnh).
- **Ghi âm** nằm ở bucket riêng tư `gift-media` của Supabase Storage, đường dẫn `<token>/voice-<timestamp>.<ext>`, chỉ phát qua link ký có hạn 1 giờ. Bucket tự tạo lần đầu có người tải ghi âm.
- **Video, nhạc** chỉ lưu link (YouTube, Vimeo, Google Drive, Spotify, SoundCloud) và nhúng bằng `<iframe>` có `sandbox`; giai điệu có sẵn được tổng hợp bằng Web Audio, không có file.

## 3. Mã và phiên

| Mã | Dạng | Ai dùng | Lưu |
|---|---|---|---|
| Mã thiệp | `KP-2010-XXXXXX` | in trên thẻ, gửi email | plaintext (`token`) |
| OTP tạo thiệp | `TAO-XXXXXXXX` | người mua | hash scrypt |
| PIN xem thiệp | 4 số | người nhận (người mua có thể đổi trong studio) | hash scrypt |

Nhập đúng mã thì server đặt cookie httpOnly ký HMAC bằng `AUTH_SECRET`: `kp_g_create_<token>` (6 giờ) hoặc `kp_g_open_<token>` (2 giờ), `path=/api/gifts`. Mã sai và mã thiệp không tồn tại trả cùng một thông báo để không dò được mã.

## 4. Luồng bán hàng tại quầy

1. Nhân viên đăng nhập `/admin` (`POST /api/admin/auth/login`).
2. Tab "Tạo đơn" gửi `POST /api/admin/create-product` với id dây vòng, tiền charm, thông tin khách. Giá dây lấy từ bảng `chains`, không tin số trình duyệt gửi lên.
3. `createGiftProductInDb` sinh 3 mã, lưu hash, rồi `sendGiftActivationEmail` gửi email qua SMTP (chưa cấu hình SMTP thì chỉ in ra log, đơn ghi "chưa gửi email").
4. Mã plaintext trả về **một lần duy nhất** trong hộp thoại cho nhân viên. "Gửi lại email" cấp **OTP tạo thiệp mới** (mã cũ không khôi phục được), giữ nguyên PIN.

## 5. Luồng soạn thiệp (người mua)

1. `/gift`: nhập mã thiệp + OTP tạo thiệp → `POST /api/gifts/verify` (`mode: "create"`) → cookie phiên create → chuyển tới `/create/[token]`.
2. Studio tải đơn bằng `GET /api/gifts/[token]?as=create` và dựng bản nháp (`src/components/studio/draft.ts`).
3. Ba bước: **Chọn** thông điệp → **Soạn** (tên người nhận bắt buộc; mỗi mục đã tích phải có nội dung; đổi thứ tự bằng Lên/Xuống) → **Hoàn tất** (chọn giao diện, đổi PIN, xem thử).
4. Ghi âm: `POST /api/gifts/[token]/voice` (định dạng đọc từ byte đầu file, tối đa 2MB / 120 giây).
5. Lưu: `POST /api/gifts/[token]/save`. `parseGiftData` (`src/lib/validation/gift.ts`) dựng lại thiệp chỉ từ các trường cho phép rồi **ghi đè toàn bộ** `gift_data`; file ghi âm không còn dùng bị dọn.

## 6. Luồng xem thiệp (người nhận)

1. Trang chủ: nhập mã thiệp ở form đầu trang → `/g/[token]`.
2. Chưa có phiên → `GET /api/gifts/[token]` trả 401 → trang hỏi PIN → `POST /api/gifts/verify` (`mode: "open"`) → cookie phiên open.
3. Có phiên → nhận `gift_data` (kèm link ký cho ghi âm) → `normalizeGift` → `GiftTemplateViewer`.
4. Viewer chọn khung **dọc** hoặc **ngang** theo kích thước khung chứa (`layoutFor`), lo điều hướng (nút, chấm, phím, vuốt) và nhạc; giao diện thiệp là một "skin" trong `src/components/gift-templates/skins/` (Storybook, Sổ Hoa Khô, Retro 90s, K&P Atelier) đặt lên các trang dùng chung trong `slides/`.
5. Thiệp chưa được lưu (`blocks` rỗng) → màn hình "Thiệp đang được chuẩn bị".

## 7. Quyên góp

- Trang chủ hiện mã VietQR của tài khoản quỹ (biến `NEXT_PUBLIC_DONATION_*`) và tổng tiền từ `GET /api/donations/summary`.
- SePay gọi `POST /api/sepay/webhook` với header `Authorization: Apikey <SEPAY_API_KEY>` mỗi khi tài khoản có biến động. Chỉ giao dịch tiền vào (`transferType: "in"`) được ghi vào `donations`.
- Admin xem sao kê ở tab "Quỹ".

## Tài liệu liên quan

- `docs/adr/0001-card-content-blocks-and-media-storage.md`, `docs/adr/0002-card-messages-skins-and-frames.md`
- `docs/specs/card-messages.md`, `docs/specs/card-studio.md`
- `docs/specs/KP_Atelier_Spec_AI_Condensed.md` (đặc tả sản phẩm gốc; nhiều phần như nút "Tặng", AI viết lời nhắn, bản lưu offline chưa làm)
