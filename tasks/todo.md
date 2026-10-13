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
- [ ] **T5 Ngày kỷ niệm + mốc thời gian + video** (M).
- [ ] **T6 Nhạc**: giai điệu có sẵn (nghe thử) + link (M).

**Checkpoint B:** điền mọi khối của từng mẫu, lưu, tải lại còn nguyên.

## Phase 3 — Ghi âm thật

- [ ] **T7 Thư viện media + API voice + link ký** (M).
- [ ] **T8 Khối ghi âm trong studio** (M).

**Checkpoint C:** tải lên, nghe lại, xoá; sai định dạng/quá lớn bị từ chối.

## Phase 4 — Rà soát

- [ ] **T9 Rà soát bảo mật + hiệu năng** (S).
- [ ] **T10 Build, push, ghi chú việc còn lại** (S).

## Ngoài phạm vi (giai đoạn sau)

- Hiển thị các khối mới trong trang xem thiệp và 3 mẫu thiệp (Sổ Hoa Khô hiện còn dùng ảnh Unsplash gán cứng).
- Chuyển ảnh sang Storage, nút "Tặng" khóa thiệp, AI thật, OTP một lần.
