# Task list: Thiệp theo thông điệp tự chọn

Chú thích: `[ ]` chưa làm · `[x]` xong. Mỗi task = 1 commit nhỏ, không có co-author. Kế hoạch: `tasks/plan.md` · Đặc tả: `docs/specs/card-messages.md`.
Lệnh kiểm chứng chung: `npx tsc --noEmit` · `npx eslint` · `npm test` · `npx next build`.

## Phase 0 — Nền

- [x] **T0 Chốt tiêu chuẩn chất lượng** (XS)
  - Acceptance: có `CONSTRAINTS.md` ghi ngưỡng đã thống nhất với bạn (a11y cho khung soạn và bộ phát, kích thước dữ liệu thiệp, kiểm tra bắt buộc: tsc/eslint/test/build); không tắt lint hay bỏ test để qua.
  - Verify: bạn đọc và đồng ý.
  - Đã làm: sàn + tsc/eslint/test/secret chặn ngay; bảo mật, a11y, hiệu năng chỉ cảnh báo đến 2026-10-30 rồi chặn. Lệnh: `npm run check:fast | check:task | check:web | check:full`. Semgrep chưa bật (chưa có CI).
  - Deps: không · Files: `CONSTRAINTS.md`

## Phase 1 — Dữ liệu và server

- [x] **T1 `blocks` + `parseGiftData` mới + test** (M)
  - Acceptance:
    - `src/components/gift-templates/blocks.ts`: `BlockId` (8 loại), `BLOCK_LABELS`, `BLOCK_ORDER_DEFAULT`, `isBlockId`.
    - `parseGiftData` nhận `blocks`: lỗi khi rỗng / id lạ / trùng / quá 8; chỉ giữ nội dung của khối có trong `blocks`; khối đã tích mà trống → lỗi nêu tên mục; chỉ tên người nhận là bắt buộc (thư không còn bắt buộc).
    - Không còn lưu `momentPhotos`, `coverIllustrationUrl`; `template-config.ts` bỏ `blocks`/`highlightMax`/`templateHasBlock`.
    - Test cập nhật + test mới cho từng quy tắc trên.
  - Verify: `npm test`, `npx tsc --noEmit`.
  - Deps: T0 · Files: `blocks.ts` (mới), `template-config.ts`, `types.ts`, `lib/validation/gift.ts`, `scripts/gift-validation.test.ts`
  - Đã làm (khác kế hoạch một chút): `deriveBlocks` nằm trong `blocks.ts` (không phải T2) để payload của studio cũ chưa có `blocks` vẫn lưu được; `template-config.ts` giữ nguyên tới T19 vì `PreviewCard`/`TemplatePicker`/trang tạo thiệp còn dùng; bỏ `MAX_TOTAL_PHOTO_CHARS` (6 ảnh × giới hạn mỗi ảnh không thể vượt). Test: 47/47.
- [x] **T2 `deriveBlocks` + `normalizeGift` + test** (S)
  - Acceptance: `deriveBlocks(saved)` suy ra danh sách cho thiệp chưa có `blocks` theo thứ tự mặc định, chỉ lấy mục có nội dung; `normalizeGift(saved)` trả thiệp để hiển thị (tên, người tặng/xưng hô/ẩn danh, `blocks`, nội dung từng loại) và **không trộn dữ liệu mẫu**; ảnh nổi bật cũ được đưa lên đầu album (tối đa 6).
  - Verify: `npm test` với thiệp mới, thiệp cũ đủ trường, thiệp cũ thiếu trường, dữ liệu hỏng.
  - Deps: T1 · Files: `gift-templates/normalize.ts` (mới), `scripts/normalize.test.ts` (mới)
- [x] **T3 Kiểm tra API lưu/đọc trên DB thật** (S)
  - Acceptance: lưu thiệp mới có `blocks` → đọc lại đúng thứ tự; thiệp cũ (không `blocks`) đọc vẫn ra; lưu bị `400` với thông báo rõ cho các lỗi ở T1; ghi âm chỉ được giữ khi `voice` nằm trong `blocks`.
  - Verify: curl trên dev server (port 5000) với DB thật, dọn dữ liệu thử sau test.
  - Deps: T1, T2 · Files: chỉ sửa `api/gifts/[token]/save/route.ts` nếu phát hiện lệch
  - Đã làm: chạy dev server riêng (port 5002) với biến Supabase để trống, dùng kho bộ nhớ + bản ghi demo `KP-2010-DEMO`, **không động vào DB thật** (sự kiện đang diễn ra, đơn thử sẽ hiện trong danh sách của nhân viên). 12/12 trường hợp đúng (401 thiếu phiên, 200 lưu đúng thứ tự, 400 cho rỗng / id lạ / mục trống / host lạ / thiếu tên, payload cũ không có `blocks` vẫn lưu, PIN mới có hiệu lực, người nhận không vào được studio). **Chưa kiểm:** ghi âm trên Supabase Storage và đọc một thiệp cũ thật trong DB; kiểm khi bạn đồng ý dùng đơn thử.

**Checkpoint A:** `npm test`, `tsc`, `eslint` sạch; API lưu/đọc/từ chối đúng trên DB thật.

## Phase 2 — Studio

- [x] **T4 Bản nháp có `blocks`** (S)
  - Acceptance: `GiftDraft.blocks`; `draftFromSaved` dùng `blocks` đã lưu hoặc `deriveBlocks`, gộp ảnh nổi bật cũ vào album; `draftToPayload` gửi `blocks`; mở studio mới thì `blocks` rỗng; bỏ tích không xoá nội dung trong bản nháp; bỏ `implemented.ts`.
  - Verify: `npm test` (cập nhật `studio-draft.test.ts`), `tsc`.
  - Deps: T1, T2 · Files: `studio/draft.ts`, `studio/implemented.ts` (xoá), `scripts/studio-draft.test.ts`
  - Đã làm: `GiftDraft.blocks`, bỏ `highlights`; `draftFromSaved` gộp ảnh nổi bật cũ vào đầu album; `draftToPayload` luôn gửi `blocks`. `implemented.ts` chưa xoá (trang tạo thiệp còn dùng, xoá ở T5). Trang tạo thiệp có đoạn tạm tự suy ra `blocks` từ nội dung (xoá ở T5). Test: 60/60.
- [x] **T5 Bảng tích chọn + khung soạn Lên/Xuống/Bỏ** (M)
  - Acceptance: trang `/create/[token]` theo thứ tự: Gửi cho ai → Bạn muốn gửi những gì? (lưới 8 thẻ, bàn phím và đọc màn hình dùng được) → khung soạn theo `blocks` có nút Lên / Xuống / Bỏ mục này → Giao diện thiệp (3 mẫu luôn dùng được) → OTP xem thiệp; khối ảnh nổi bật bị bỏ, ảnh đầu album ghi "ảnh bìa".
  - Verify: `tsc`, `eslint`, `next build`; thử tay ở 390 / 768 / 1280px.
  - Deps: T4 · Files: `studio/MessagePicker.tsx` (mới), `studio/ui.tsx` (BlockFrame), `app/create/[token]/page.tsx`, `studio/TemplatePicker.tsx`, `studio/blocks/PhotosBlock.tsx`
  - Đã làm: `MessagePicker` (lưới 8 thẻ, `role=checkbox`), `BlockFrame` (nút Lên/Xuống/Bỏ qua context, có nhãn đọc màn hình + thông báo vị trí), trang tạo thiệp theo thứ tự Gửi cho ai → Chọn → Soạn → Giao diện → OTP; xoá `implemented.ts`; `PreviewCard` đã đọc `draft.blocks` (làm trước phần của T6). Chưa xem bằng mắt.
- [ ] **T6 Báo lỗi mục trống + bưu thiếp mini theo `blocks`** (S)
  - Acceptance: hàm thuần `blockProblems(draft)` (không có tên người nhận / chưa tích mục nào / mục đã tích còn trống) có test; lỗi cuộn tới đúng khung; `PreviewCard` hiện tóm tắt theo `blocks`.
  - Verify: `npm test`, `tsc`, thử tay.
  - Deps: T5 · Files: `studio/draft.ts`, `scripts/studio-draft.test.ts`, `studio/PreviewCard.tsx`, `app/create/[token]/page.tsx`

**Checkpoint B:** tích, soạn, đổi thứ tự, lưu, tải lại → còn nguyên; thiệp cũ mở được trong studio; `tsc`, `eslint`, `npm test`, `next build` qua. **Bạn thử tay studio.**

## Phase 3 — Bộ phát và khung xem

- [ ] **T7 Đổi link thành địa chỉ nhúng + test** (S)
  - Acceptance: `toVideoEmbed` (YouTube, Vimeo, Google Drive) và `toMusicEmbed` (YouTube, Spotify, SoundCloud) tách id từ link đã qua `parseHttpsLink`, dựng địa chỉ nhúng chính thức; link lạ → `null`; định dạng đối chiếu tài liệu chính thức của từng dịch vụ.
  - Verify: `npm test` (nhiều dạng link: watch, youtu.be, shorts, playlist, link lạ).
  - Deps: T1 · Files: `lib/media/embed.ts` (mới), `scripts/embed.test.ts` (mới)
- [ ] **T8 VoicePlayer + VideoEmbed** (M)
  - Acceptance: `VoicePlayer` phát `<audio>` thật (phát/dừng, tua, thời lượng), lỗi hoặc hết hạn → xin link mới một lần rồi thông báo; `VideoEmbed` dựng `<iframe>` (`sandbox`, `referrerpolicy`, `loading="lazy"`, `title`), không nhúng được thì hiện nút mở link gốc; nhận `className`/kiểu dáng từ mẫu.
  - Verify: `tsc`, `eslint`; thử tay (ghi âm thật, video YouTube công khai và riêng tư).
  - Deps: T7 · Files: `gift-templates/media/VoicePlayer.tsx`, `media/VideoEmbed.tsx`
- [ ] **T9 MusicPlayer + AnniversaryCounter + TimelineList** (M)
  - Acceptance: `MusicPlayer` — giai điệu có sẵn dùng `musicPlayerSynth`, chỉ bắt đầu sau thao tác người dùng, có nút tạm dừng; link dùng khung nhúng, người nhận tự bấm phát; `AnniversaryCounter` đếm ngày (dùng `daysSince`); `TimelineList` hiện tối đa 5 mốc theo ngày.
  - Verify: `tsc`, `eslint`; thử tay trên điện thoại.
  - Deps: T7 · Files: `media/MusicPlayer.tsx`, `media/AnniversaryCounter.tsx`, `media/TimelineList.tsx`, `studio/draft.ts` (dùng lại `daysSince`)
- [ ] **T10 Khung trang xem thiệp** (M)
  - Acceptance: `/g/[token]` dùng `normalizeGift`, truyền `gift` + `blocks` cho mẫu (và `data` kiểu cũ cho mẫu chưa chuyển); mẫu lấy từ dữ liệu đã lưu, bỏ `?tpl=`; bỏ thanh đổi mẫu và chế độ "Bản thảo" cho người nhận (xem câu hỏi mở trong plan); tên người tặng / xưng hô / ẩn danh dùng thật; giữ chế độ Story + Cuộn dọc.
  - Verify: `tsc`, `eslint`, `next build`; mở thiệp thật ở cả 3 mẫu, không hỏng.
  - Deps: T2, T8, T9 · Files: `gift-templates/GiftTemplateViewer.tsx`, `gift-templates/types.ts`, `app/g/[token]/page.tsx`

**Checkpoint C:** bộ phát chạy với dữ liệu thật; khung xem truyền đúng dữ liệu; 3 mẫu hiện tại vẫn mở được. **Bạn thử tay nghe ghi âm, xem video, phát nhạc.**

## Phase 4 — Ba mẫu (làm song song sau Checkpoint C; mỗi mẫu một nhánh, không đụng file của mẫu khác)

### Storybook 20/10
- [ ] **T11 Storybook: khung động + mở quà / thư / ảnh / lời kết** (M)
  - Acceptance: slide "Mở quà" đầu, mỗi mục tích một slide đúng thứ tự, slide "Cảm ơn" cuối (hiện lời kết); số slide theo `blocks`, điều hướng hoạt động với N slide; ảnh album chỉ dùng ảnh khách (1–6 ảnh, bố cục thích ứng, không còn ảnh Unsplash mẫu); mã tách thành `storybook/*Slide.tsx`.
  - Verify: `tsc`, `eslint`, `next build`; thử tay với thiệp chỉ có thư; thiệp chỉ có ảnh; thiệp đủ mục.
  - Deps: C · Files: `StorybookSunsetTemplate.tsx`, `storybook/OpenSlide.tsx`, `LetterSlide.tsx`, `PhotosSlide.tsx`, `ClosingSlide.tsx`
- [ ] **T12 Storybook: video / nhạc / ghi âm** (M)
  - Acceptance: slide dùng `VideoEmbed`, `MusicPlayer`, `VoicePlayer` thật (bỏ đồng hồ giả và giai điệu cố định); giữ giao diện hiện có.
  - Verify: `tsc`, `eslint`; thử tay.
  - Deps: T11 · Files: `storybook/VideoSlide.tsx`, `MusicSlide.tsx`, `VoiceSlide.tsx`, `StorybookSunsetTemplate.tsx`
- [ ] **T13 Storybook: ngày kỷ niệm / mốc thời gian** (S)
  - Acceptance: hai slide mới đúng phong cách mẫu, hiện đúng dữ liệu.
  - Deps: T11 · Files: `storybook/AnniversarySlide.tsx`, `TimelineSlide.tsx`, `StorybookSunsetTemplate.tsx`

### Retro 90s
- [ ] **T14 Retro: khung động + thư / ảnh / lời kết** (M)
  - Acceptance: các khu vực theo thứ tự `blocks`; ảnh album 1–6 ảnh không phụ thuộc ảnh nổi bật hay ảnh mẫu; bỏ chế độ mini; tách thư mục `retro/`.
  - Verify: `tsc`, `eslint`, `next build`; thử tay.
  - Deps: C · Files: `RetroNostalgiaTemplate.tsx`, `retro/*`
- [ ] **T15 Retro: video / nhạc / ghi âm + ngày KN / mốc** (M)
  - Acceptance: cassette cho nhạc và ghi âm dùng bộ phát thật; video dùng `VideoEmbed`; ngày kỷ niệm và mốc thời gian theo phong cách mẫu.
  - Deps: T14 · Files: `retro/*`, `RetroNostalgiaTemplate.tsx`

### Sổ Hoa Khô
- [ ] **T16 Vintage: khung động + thư / ảnh / lời kết** (M)
  - Acceptance: trang sổ theo thứ tự `blocks`; album dùng ảnh khách (hết Unsplash gán cứng); đề từ, chữ ký, lời kết hiện đúng; bỏ ảnh vòng tay mặc định (`braceletImg`); tách `vintage/`.
  - Deps: C · Files: `VintageScrapbookTemplate.tsx`, `vintage/*`
- [ ] **T17 Vintage: ghi âm / video / nhạc + mốc / ngày KN** (M)
  - Acceptance: các mục kiểu sổ dán (washi tape, polaroid) dùng bộ phát thật; ngày kỷ niệm hiện đếm ngày.
  - Deps: T16 · Files: `vintage/*`, `VintageScrapbookTemplate.tsx`

**Checkpoint D:** cả 3 mẫu hiển thị đúng 3 loại thiệp thử: chỉ thư; chỉ ảnh + nhạc; đủ 8 mục theo thứ tự đảo. **Bạn xem trên điện thoại (nhất là iPhone).**

## Phase 5 — Hoàn tất

- [ ] **T18 Nút Xem thử toàn màn hình** (S)
  - Acceptance: nút "Xem thử" (cột bên phải và thanh dưới trên điện thoại) mở lớp phủ toàn màn hình dùng đúng trang xem thiệp với dữ liệu đang soạn (chưa cần lưu); đóng bằng nút và phím Esc, trả focus; ghi âm trong bản nháp nghe được.
  - Verify: `tsc`, `eslint`; thử tay.
  - Deps: D · Files: `studio/PreviewOverlay.tsx` (mới), `app/create/[token]/page.tsx`
- [ ] **T19 Dọn dẹp** (S)
  - Acceptance: bỏ `DEFAULT_GIFT_DATA` khỏi đường xem thiệp và `data` kiểu cũ trong 3 mẫu; dữ liệu mẫu chỉ ở `/thamkhao`; bỏ mã thừa còn lại (highlight, `templateHasBlock`...); cập nhật `docs/specs/card-studio.md`, `docs/adr/0001`.
  - Verify: đồ thị import không còn file chết; `tsc`, `eslint`, `npm test`, `next build`.
  - Deps: T18 · Files: nhiều file nhỏ (mỗi nhóm một commit)
- [ ] **T20 Nghiệm thu** (S)
  - Acceptance: đủ 7 tiêu chí trong `docs/specs/card-messages.md`; bảng "đã tự kiểm" và "bạn cần tự thử" ghi rõ.
  - Verify: `tsc`, `eslint`, `npm test`, `next build` + curl API + checklist thử tay.
  - Deps: T19

**Checkpoint E:** bạn xác nhận trên thiết bị thật (micro, nhạc, video, iPhone), sau đó mới push.

## Ngoài phạm vi

Nút "Tặng" khoá thiệp, AI viết lời nhắn, email thông báo, tải bản offline, chuyển ảnh sang Storage, tự lưu nháp, lời cảm ơn của người nhận, quyết định PIN in trên thẻ.
