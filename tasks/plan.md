# Implementation Plan: Studio tạo thiệp theo khối

Đặc tả: `docs/specs/card-studio.md` · Quyết định: `docs/adr/0001-card-content-blocks-and-media-storage.md`

## Overview

Thay studio tạo thiệp hiện tại (một form cố định, nhiều phần giả lập) bằng studio theo khối: mỗi mẫu thiệp khai báo khối nó hỗ trợ, studio chỉ hiện khối đó. Thêm các khối mới (ảnh nổi bật, lời kết, ngày kỷ niệm, mốc thời gian, video, nhạc, ghi âm thật). Server kiểm tra và làm sạch toàn bộ dữ liệu bằng whitelist.

## Architecture decisions

- Dữ liệu = JSON theo khối trong `gift_data`, chỉ thêm trường tuỳ chọn (xem ADR 0001).
- Hợp đồng dữ liệu và validation đi trước, giao diện đi sau; validation là hàm thuần để test bằng `node:test`.
- Cắt theo lát dọc: mỗi nhiệm vụ để lại hệ thống chạy được và commit riêng.
- Trang xem thiệp **ngoài phạm vi** (giai đoạn sau).

## Dependency graph

```
types + template-config ─┬─> validation (parseGiftData) ──> save API ──┐
                         │                                              ├─> studio blocks ──> studio page
music presets ───────────┤                                              │
media lib (Storage) ─────┴─> voice API ─────────────────────────────────┘
```

## Task list (chi tiết + trạng thái: `tasks/todo.md`)

### Phase 1 — Hợp đồng và server
- T1 Kiểu dữ liệu, cấu hình mẫu, validation + test
- T2 Save API dùng whitelist
- Checkpoint A: `npm test`, `tsc`, API lưu/đọc/từ chối đúng

### Phase 2 — Studio (không cần Storage)
- T3 Khung studio: chọn mẫu, tên, thư, lời kết, lưu/khôi phục, bỏ thứ giả
- T4 Ảnh album + ảnh nổi bật
- T5 Ngày kỷ niệm + mốc thời gian + video
- T6 Nhạc (giai điệu có sẵn + link)
- Checkpoint B: điền mọi khối của từng mẫu, lưu, tải lại còn nguyên

### Phase 3 — Ghi âm thật
- T7 Thư viện media (bucket) + API voice + link ký trong GET
- T8 Khối ghi âm trong studio (MediaRecorder)
- Checkpoint C: tải lên, nghe lại, xoá, từ chối sai định dạng/quá lớn

### Phase 4 — Rà soát và đẩy lên
- T9 Rà soát bảo mật + hiệu năng (payload, kích thước)
- T10 Build, push; ghi lại việc còn lại (trang xem thiệp)

## Risks and mitigations

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Không test được micro/MediaRecorder tự động | Cao | Test API upload bằng file giả có đúng chữ ký; phần ghi âm trên giao diện để chủ dự án tự test, ghi rõ |
| Chrome kết nối với mình không mở được localhost | Cao | Kiểm tra qua API, HTML, chạy hàm thuần bằng Node; ghi rõ phần chưa xem bằng mắt |
| Hàng `gift_products` phình vì ảnh nhúng | Trung bình | Giới hạn tổng ký tự ảnh ở server; ghi ADR; chuyển Storage sau |
| Link ngoài độc hại | Trung bình | Chỉ `https` + allowlist máy chủ, lưu dạng chuỗi, không nhúng HTML |
| Upload file lạ giả làm âm thanh | Trung bình | Kiểm tra MIME + chữ ký (magic bytes) + giới hạn dung lượng + bucket riêng tư |
| Studio cũ có hành vi người dùng đã quen | Thấp | Giữ bố cục/kiểu dáng; chỉ bỏ phần giả (AI giả, nhãn sai, dữ liệu mẫu điền sẵn) |

## Open questions

Xem cuối đặc tả.
