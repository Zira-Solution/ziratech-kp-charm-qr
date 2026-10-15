# Implementation Plan: Thiệp theo thông điệp tự chọn

Đặc tả: `docs/specs/card-messages.md` · Kế hoạch trước (studio theo khối) đã xong, xem lịch sử git · Chi tiết task + trạng thái: `tasks/todo.md`

## Overview

Người mua tích chọn những loại thông điệp muốn gửi (thư, ảnh, ghi âm, video, nhạc, ngày kỷ niệm, mốc thời gian, lời kết), tự sắp xếp thứ tự, xem thử, rồi lưu. Thiệp của người nhận hiển thị đúng các mục đó, đúng thứ tự, bằng 1 trong 3 giao diện (Storybook, Retro 90s, Sổ Hoa Khô), có bộ phát ghi âm / video / nhạc thật. Dữ liệu thêm một trường `blocks` có thứ tự; thiệp cũ vẫn đọc được.

## Architecture decisions

- **`blocks` là nguồn sự thật** cho "tích gì" và "thứ tự". Mẫu thiệp chỉ là giao diện; `template-config` không còn khai báo khối.
- **Hàm thuần đi trước, giao diện đi sau** (như kế hoạch trước): `blocks.ts`, `parseGiftData`, `deriveBlocks`, `normalizeGift`, `embed.ts` đều là hàm thuần, test bằng `node:test`.
- **Hợp đồng mẫu thiệp:** `GiftTemplate` nhận `gift` (đã chuẩn hoá) + `blocks` (có thứ tự) và vẽ từng loại bằng bố cục riêng. Bộ phát (`media/`) dùng chung, mẫu chỉ truyền kiểu dáng.
- **Chuyển tiếp an toàn:** trong lúc 3 mẫu chưa chuyển xong, trang xem thiệp vẫn truyền thêm `data` kiểu cũ cho mẫu chưa chuyển; task dọn dẹp cuối cùng mới xoá `data` và `DEFAULT_GIFT_DATA`.
- **Mỗi mẫu tách thành thư mục** (`storybook/`, `retro/`, `vintage/`), mỗi loại thông điệp một file, file điều phối ngắn. Không sửa trong file 1.000 dòng.
- Không thêm thư viện (kéo thả bằng nút Lên/Xuống, nhúng bằng `<iframe>` thường).
- Trước khi viết code đụng tới Next (route, client component), đọc `node_modules/next/dist/docs/` theo AGENTS.md.

## Dependency graph

```
T0 tiêu chuẩn chất lượng
 └─ T1 blocks + validation ─┬─ T2 deriveBlocks/normalizeGift ─┬─ T3 API (kiểm DB thật)
                           │                                  │
                           └─ T4 draft (blocks) ── T5 studio UI ── T6 báo lỗi mục trống + PreviewCard   [Checkpoint B]
                                                                                 
T7 embed.ts ── T8 VoicePlayer+VideoEmbed ── T9 MusicPlayer+Anniversary+Timeline ──┐
T2 ───────────────────────────────────────────── T10 shell trang xem thiệp ──────┤  [Checkpoint C]
                                                                                  ▼
                       ┌─ T11 Storybook: khung động + mở/thư/ảnh/kết ─ T12 Storybook: video/nhạc/ghi âm ─ T13 Storybook: ngày KN/mốc
 song song sau C ──────┼─ T14 Retro: khung động + thư/ảnh/kết ─ T15 Retro: video/nhạc/ghi âm + ngày KN/mốc
                       └─ T16 Vintage: khung động + thư/ảnh/kết ─ T17 Vintage: ghi âm/video/nhạc + mốc/ngày KN   [Checkpoint D]
                                                                                  ▼
                       T18 Xem thử toàn màn hình ── T19 dọn dẹp ── T20 nghiệm thu                      [Checkpoint E]
```

## Task list (chi tiết: `tasks/todo.md`)

### Phase 0 — Nền
- T0 Chốt tiêu chuẩn chất lượng (CONSTRAINTS.md)

### Phase 1 — Dữ liệu và server
- T1 `blocks` + `parseGiftData` mới + test
- T2 `deriveBlocks` + `normalizeGift` + test
- T3 Kiểm tra API lưu/đọc trên DB thật (thiệp mới + thiệp cũ)
- **Checkpoint A**

### Phase 2 — Studio
- T4 Bản nháp có `blocks`
- T5 Bảng tích chọn + khung soạn Lên/Xuống/Bỏ
- T6 Báo lỗi mục trống + bưu thiếp mini theo `blocks`
- **Checkpoint B**

### Phase 3 — Bộ phát và khung xem
- T7 Đổi link thành địa chỉ nhúng + test
- T8 VoicePlayer + VideoEmbed
- T9 MusicPlayer + AnniversaryCounter + TimelineList
- T10 Khung trang xem thiệp (hợp đồng mẫu, bỏ đổi mẫu, bỏ `?tpl`)
- **Checkpoint C**

### Phase 4 — Ba mẫu (độc lập, làm song song)
- T11–T13 Storybook · T14–T15 Retro 90s · T16–T17 Sổ Hoa Khô
- **Checkpoint D**

### Phase 5 — Hoàn tất
- T18 Nút Xem thử toàn màn hình
- T19 Dọn dẹp (`DEFAULT_GIFT_DATA`, `data` cũ, `implemented.ts`, `/thamkhao`, tài liệu)
- T20 Nghiệm thu
- **Checkpoint E**

## Risks and mitigations

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Khối lượng lớn: 3 mẫu mỗi mẫu 640–1.030 dòng, mỗi mẫu có thêm bản mini cho chế độ Bản thảo | Cao | Tách thư mục, chuyển từng loại thông điệp một; làm song song 3 mẫu sau Checkpoint C; bỏ chế độ Bản thảo (xem câu hỏi mở) |
| Không tự nghe/xem được ghi âm, video, nhạc, hiệu ứng | Cao | Test hàm thuần tự động; checklist thử tay cho bạn ở Checkpoint C, D, E, ghi rõ phần chưa kiểm bằng mắt/tai |
| iPhone chặn tự phát nhạc/video | Trung bình | Nhạc có sẵn chỉ bắt đầu sau cú chạm "mở quà"; nhạc dạng link để người nhận tự bấm phát |
| Link nhúng bị YouTube/Drive chặn (video riêng tư, tắt nhúng) | Trung bình | Thông báo nhỏ kèm nút mở link gốc; ghi chú trong studio nhắc đặt video công khai |
| Thiệp cũ hiển thị sai sau khi đổi dữ liệu | Trung bình | `deriveBlocks` + test; kiểm tra bằng thiệp thật trên DB ở T3 |
| Link ghi âm hết hạn 1 giờ khi người nhận mở lâu | Thấp | Xin link mới một lần khi lỗi phát |
| Nhúng `<iframe>` bên thứ ba | Trung bình | Chỉ host cho phép, `sandbox`, `referrerpolicy`, địa chỉ nhúng dựng từ id đã tách (không dùng nguyên link khách dán) |

## Open questions (cần bạn quyết, mặc định đã ghi)

1. **Người nhận có được đổi mẫu thiệp không?** Hiện trang xem thiệp có thanh chọn 3 mẫu cho người nhận. *Mặc định:* bỏ, mẫu do người mua chọn.
2. **Chế độ "Bản thảo"** (xem 7 trang cùng lúc, mỗi mẫu có bản mini riêng) có giữ không? *Mặc định:* bỏ; giữ "Story" (lướt từng trang) và "Cuộn dọc".
