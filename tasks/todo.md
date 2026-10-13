# Task list: Studio tạo thiệp theo khối

Chú thích: `[ ]` chưa làm · `[x]` xong. Mỗi nhiệm vụ = 1 commit nhỏ.

## Phase 1 — Hợp đồng và server

- [x] **T1 Kiểu dữ liệu, cấu hình mẫu, validation + test** (M)
  - Acceptance: `RecipientGiftData` có trường mới tuỳ chọn; `template-config.ts` khai báo khối theo mẫu; `parseGiftData` làm sạch toàn bộ thiệp theo whitelist, link allowlist, ngày hợp lệ, ảnh, mốc, giai điệu; `npm test` chạy test cho từng quy tắc.
  - Verify: `npm test`, `npx tsc --noEmit`.
  - Files: `components/gift-templates/types.ts`, `template-config.ts`, `lib/validation/gift.ts`, `scripts/gift-validation.test.ts`, `package.json`.
- [x] **T2 Save API dùng whitelist** (S)
  - Acceptance: `/save` dựng `gift_data` chỉ từ `parseGiftData`; trường lạ bị bỏ; lỗi `400` nêu rõ mục sai; `braceletTitle` lấy từ đơn.
  - Verify: curl lưu/đọc/từ chối trên DB thật.
  - Files: `app/api/gifts/[token]/save/route.ts`.

**Checkpoint A:** ✅ `npm test` 22/22, `tsc` sạch, API lưu/đọc/từ chối đúng trên DB thật.

## Phase 2 — Studio

- [x] **T3 Khung studio** (M): chọn mẫu, tên (xưng hô, ẩn danh), thư, lời kết, lưu/khôi phục; bỏ dữ liệu mẫu điền sẵn, AI giả, nhãn sai; câu mẫu có xác nhận trước khi ghi đè.
- [x] **T4 Ảnh album + ảnh nổi bật** (M).
- [x] **T5 Ngày kỷ niệm + mốc thời gian + video** (M).
- [x] **T6 Nhạc**: giai điệu có sẵn (nghe thử) + link (M).

**Checkpoint B:** ✅ bài test đầu-cuối: lưu bằng payload của studio, đọc lại còn nguyên (chữ, ảnh, nổi bật, lời kết, mốc, video, nhạc), PIN không lưu trong thiệp, đổi mẫu thì bỏ khối không hỗ trợ.

## Phase 3 — Ghi âm thật

- [x] **T7 Thư viện media + API voice + link ký** (M).
- [x] **T8 Khối ghi âm trong studio** (M). Ghi âm bằng MediaRecorder (tối đa 120 giây, tự dừng), tải lên, nghe lại, bỏ ghi âm (chỉ xoá khỏi bản nháp), thử tải lại khi lỗi mạng; phần thuần có test (`scripts/recorder.test.ts`).

**Checkpoint C:** ✅ API 22/22 trên Supabase thật; khối ghi âm đã vào studio. `npm test` 38/38, `tsc`, `eslint`, `next build` đều qua. Micro thật + nén ảnh chưa chạy trong trình duyệt thật → bạn tự test.

## Phase 4 — Rà soát

- [x] **T9 Rà soát bảo mật + hiệu năng** (S). Đã sửa: `save` giờ từ chối body >3,5 MB (413) và JSON hỏng/null/mảng (400) thay vì 500; kiểm bằng script thật (6/6). Đã rà và ổn: mọi route gifts đều cần phiên đúng phạm vi, voice kiểm byte đầu file + giới hạn 2 MB + chỉ link ký 1 giờ trên bucket riêng, đường dẫn ghi âm khoá theo thư mục thiệp, link nhạc/video https + danh sách host, không dùng `dangerouslySetInnerHTML`. Ghi nhận chưa sửa: (1) giới hạn tốc độ nằm trong bộ nhớ và dựa vào `x-forwarded-for` → khi chạy nhiều instance cần kho dùng chung; (2) GET thiệp trả cả ảnh inline (tới ~2,5 MB) → chuyển ảnh sang Storage sẽ giải quyết; (3) OTP vẫn là mã cố định.
- [x] **T10 Build, push, ghi chú việc còn lại** (S). `npm test` 38/38, `tsc`, `eslint`, `next build` qua; đã quét commit chưa push: không có secret/co-author.

## Ngoài phạm vi (giai đoạn sau)

- Hiển thị các khối mới trong trang xem thiệp và 3 mẫu thiệp (Sổ Hoa Khô hiện còn dùng ảnh Unsplash gán cứng).
- Chuyển ảnh sang Storage, nút "Tặng" khóa thiệp, AI thật, OTP một lần.
