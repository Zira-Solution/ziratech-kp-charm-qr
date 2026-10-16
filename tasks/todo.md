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
- [x] **T6 Báo lỗi mục trống + bưu thiếp mini theo `blocks`** (S)
  - Acceptance: hàm thuần `blockProblems(draft)` (không có tên người nhận / chưa tích mục nào / mục đã tích còn trống) có test; lỗi cuộn tới đúng khung; `PreviewCard` hiện tóm tắt theo `blocks`.
  - Verify: `npm test`, `tsc`, thử tay.
  - Deps: T5 · Files: `studio/draft.ts`, `scripts/studio-draft.test.ts`, `studio/PreviewCard.tsx`, `app/create/[token]/page.tsx`
  - Đã làm: `emptyBlocks(draft)` (hàm thuần, có test), lỗi cuộn tới đúng khung / bảng tích chọn, bưu thiếp mini chỉ hiện thư khi đã tích. Test: 63/63; `tsc`, `eslint`, `next build` qua.
  - Đã xem bằng mắt (server bộ nhớ, trình duyệt desktop): tích/bỏ tích, Lên/Xuống, nút khoá ở hai đầu, lưu lỗi khi Video trống, lưu thành công, nạp lại đúng thứ tự, không lỗi console. **Chưa xem:** màn hình điện thoại (cửa sổ trình duyệt của tôi không thu nhỏ được), ghi âm, nén ảnh.

- [x] **T6b Studio trắng, font dễ đọc, 3 bước** (M) — theo yêu cầu của bạn sau khi thử
  - Đã làm: nền trắng, khoá sáng (`colorScheme: light`), font Be Vietnam Pro, viền xám rõ, chữ nhỏ nhất 13px, số bước trong vòng tròn; studio thành 3 bước Chọn → Soạn → Hoàn tất với thanh Quay lại / Tiếp tục cố định ở đáy, thanh các bước, mỗi bước kiểm tra riêng; tích không còn tự cuộn. Đã xem bằng mắt trên desktop; **chưa xem trên điện thoại**.
  - Files: `app/create/layout.tsx` (mới), `studio/Stepper.tsx` (mới), `globals.css` (`.studio-light`), `studio/ui.tsx`, `MessagePicker.tsx`, `TemplatePicker.tsx`, `app/create/[token]/page.tsx`, `docs/specs/card-messages.md`

**Checkpoint B:** tích, soạn, đổi thứ tự, lưu, tải lại → còn nguyên; thiệp cũ mở được trong studio; `tsc`, `eslint`, `npm test`, `next build` qua. **Bạn thử tay studio.**

## Phase 3 — Bộ phát và khung xem

- [x] **T7 Đổi link thành địa chỉ nhúng + test** (S)
  - Acceptance: `toVideoEmbed` (YouTube, Vimeo, Google Drive) và `toMusicEmbed` (YouTube, Spotify, SoundCloud) tách id từ link đã qua `parseHttpsLink`, dựng địa chỉ nhúng chính thức; link lạ → `null`; định dạng đối chiếu tài liệu chính thức của từng dịch vụ.
  - Verify: `npm test` (nhiều dạng link: watch, youtu.be, shorts, playlist, link lạ).
  - Deps: T1 · Files: `lib/media/embed.ts` (mới), `scripts/embed.test.ts` (mới)
  - Đã làm: đối chiếu tài liệu chính thức (nguồn ghi ở đầu `embed.ts`). Đã xác nhận: YouTube (+ miền youtube-nocookie), Vimeo, SoundCloud widget, Spotify `track`. **Chưa xác nhận bằng tài liệu chính thức:** Drive `/preview`, mã băm Vimeo riêng tư (bỏ), Spotify loại khác `track` và chiều cao, SoundCloud nhận link trang công khai; giữ nút "mở link gốc" dự phòng. Test: 71/71.
- [x] **T8 VoicePlayer + VideoEmbed** (M)
  - Acceptance: `VoicePlayer` phát `<audio>` thật (phát/dừng, tua, thời lượng), lỗi hoặc hết hạn → xin link mới một lần rồi thông báo; `VideoEmbed` dựng `<iframe>` (`sandbox`, `referrerpolicy`, `loading="lazy"`, `title`), không nhúng được thì hiện nút mở link gốc; nhận `className`/kiểu dáng từ mẫu.
  - Verify: `tsc`, `eslint`; thử tay (ghi âm thật, video YouTube công khai và riêng tư).
  - Deps: T7 · Files: `gift-templates/media/VoicePlayer.tsx`, `media/VideoEmbed.tsx`
  - Đã làm: `useVoicePlayer` (hook trạng thái, xin link mới một lần khi lỗi, chỉ tải khi bấm phát) + `VoicePlayer` mặc định + `VideoEmbed` (iframe `sandbox`, `referrerpolicy`, luôn có nút mở link gốc). `tsc`, `eslint` sạch. **Chưa nghe/xem thật** (cần ghi âm thật và video thật; kiểm ở T10/T12).
- [x] **T9 MusicPlayer + AnniversaryCounter + TimelineList** (M)
  - Acceptance: `MusicPlayer` — giai điệu có sẵn dùng `musicPlayerSynth`, chỉ bắt đầu sau thao tác người dùng, có nút tạm dừng; link dùng khung nhúng, người nhận tự bấm phát; `AnniversaryCounter` đếm ngày (dùng `daysSince`); `TimelineList` hiện tối đa 5 mốc theo ngày.
  - Verify: `tsc`, `eslint`; thử tay trên điện thoại.
  - Deps: T7 · Files: `media/MusicPlayer.tsx`, `media/AnniversaryCounter.tsx`, `media/TimelineList.tsx`, `studio/draft.ts` (dùng lại `daysSince`)
  - Đã làm: `useMusicPlayer` + `MusicPlayer` (giai điệu có sẵn: nút bấm; link: khung nhúng sandbox, người nhận tự bấm phát, luôn có link gốc), `AnniversaryCounter`, `TimelineList`, và phần logic thuần `media/format.ts` (có test, 74/74). `tsc`, `eslint` sạch. **Chưa nghe/xem thật** (kiểm ở Checkpoint C).
- [x] **T10 Khung trang xem thiệp** (M)
  - Acceptance: `/g/[token]` dùng `normalizeGift`, truyền `gift` + `blocks` cho mẫu (và `data` kiểu cũ cho mẫu chưa chuyển); mẫu lấy từ dữ liệu đã lưu, bỏ `?tpl=`; bỏ thanh đổi mẫu và chế độ "Bản thảo" cho người nhận (xem câu hỏi mở trong plan); tên người tặng / xưng hô / ẩn danh dùng thật; giữ chế độ Story + Cuộn dọc.
  - **Thêm (theo thiết bị):** khung dùng chung đo bề rộng **khung chứa** (container query Tailwind v4, đối chiếu tài liệu chính thức) và chọn ba bố cục: điện thoại (slide tràn), iPad (slide lớn căn giữa + mũi tên), máy tính (cột trái lời chào/nhạc/danh sách mục + slide lớn bên phải, phím mũi tên). Nhận prop bề rộng ép sẵn để xem thử dùng được.
  - Verify: `tsc`, `eslint`, `next build`; mở thiệp thật ở cả 3 mẫu, không hỏng; xem ở 390 / 768 / 1280px.
  - Đã làm: khung `GiftTemplateViewer` mới (đo bề rộng khung chứa, ba bố cục, phím/vuốt/chấm/danh sách, thông báo cho trình đọc màn hình, nhạc có sẵn tự bắt đầu khi mở), hợp đồng `GiftTemplate` (`template-contract.ts`), bộ chuyển tiếp `legacy-templates.tsx` bọc ba mẫu cũ (bảy trang cố định, vẫn lấp nội dung mẫu cho tới khi từng mẫu được chuyển ở T11–T17), `/g/[token]` dùng `normalizeGift` và xin lại link ghi âm khi hết hạn; nút "Lưu kỷ vật" giả (hứa lưu offline mà không có) bị bỏ. Đã chụp và xem bằng Chrome giả lập thật ở 390 / 768 / 1400px: đúng bố cục từng cỡ. **Chưa kiểm** trên `/g/[token]` thật (cần cử chỉ giữ tim để mở khoá) và chưa nghe/xem thật âm thanh, video.
  - Deps: T2, T8, T9 · Files: `gift-templates/GiftTemplateViewer.tsx`, `gift-templates/types.ts`, `app/g/[token]/page.tsx`

- [x] **T10b Khung dọc / ngang tràn màn hình + bố cục chia đôi dùng chung** (M) — sửa theo phản hồi: iPad và máy tính phải là khung ngang tràn màn hình, không phải khung điện thoại nằm giữa nền to
  - Acceptance: `layoutFor(width, height)` chọn `portrait` / `landscape` (ngang khi rộng ≥ 640 và rộng ≥ 1,15 × cao) có test; `GiftTemplateViewer` bỏ cột danh sách bên cạnh và khung giữa, khung chiếm hết khung chứa (cao 100%), thanh điều hướng (mũi tên, chấm, số trang) nằm đáy; `TemplateContext` thêm `height` và `layout: "portrait" | "landscape"`; `SlideLayout` (hình/minh họa + nội dung, dọc: trên/dưới, ngang: trái/phải, nội dung dài cuộn trong vùng của nó); các mẫu cũ bọc bằng bộ chuyển tiếp vẫn mở được (kéo giãn tạm, chưa đẹp); `PreviewOverlay` dùng Điện thoại 390×844, iPad 1024×768, Máy tính 1280×720; `/g/[token]` cao 100dvh.
  - Verify: `npm test` (layout), `tsc`, `eslint`, `next build`; chụp bằng Chrome giả lập ở 390×844, 820×1180, 1024×768, 1440×900.
  - Deps: T10 · Files: `layout.ts`, `scripts/layout.test.ts`, `GiftTemplateViewer.tsx`, `viewer-nav.tsx`, `template-contract.ts`, `SlideLayout.tsx` (mới), `legacy-templates.tsx`, `studio/PreviewOverlay.tsx`, `app/g/[token]/page.tsx`

**Checkpoint C:** bộ phát chạy với dữ liệu thật; khung xem truyền đúng dữ liệu; 3 mẫu hiện tại vẫn mở được. **Bạn thử tay nghe ghi âm, xem video, phát nhạc.**

## Phase 4 — Ba mẫu (làm song song sau Checkpoint C; mỗi mẫu một nhánh, không đụng file của mẫu khác)

### Storybook 20/10
- [x] **T11 Storybook: khung động + mở quà / thư / ảnh / lời kết** (M) — dùng `SlideLayout`, đẹp ở khung dọc (390×844, 820×1180) và ngang (1024×768, 1280×720, 1440×900)
  - Acceptance: slide "Mở quà" đầu, mỗi mục tích một slide đúng thứ tự, slide "Cảm ơn" cuối (hiện lời kết); số slide theo `blocks`, điều hướng hoạt động với N slide; ảnh album chỉ dùng ảnh khách (1–6 ảnh, bố cục thích ứng, không còn ảnh Unsplash mẫu); mã tách thành `storybook/*Slide.tsx`.
  - Verify: `tsc`, `eslint`, `next build`; thử tay với thiệp chỉ có thư; thiệp chỉ có ảnh; thiệp đủ mục.
  - Deps: C · Files: `StorybookSunsetTemplate.tsx`, `storybook/OpenSlide.tsx`, `LetterSlide.tsx`, `PhotosSlide.tsx`, `ClosingSlide.tsx`
- [x] **T12 Storybook: video / nhạc / ghi âm** (M)
  - Acceptance: slide dùng `VideoEmbed`, `MusicPlayer`, `VoicePlayer` thật (bỏ đồng hồ giả và giai điệu cố định); giữ giao diện hiện có.
  - Verify: `tsc`, `eslint`; thử tay.
  - Deps: T11 · Files: `storybook/VideoSlide.tsx`, `MusicSlide.tsx`, `VoiceSlide.tsx`, `StorybookSunsetTemplate.tsx`
- [x] **T13 Storybook: ngày kỷ niệm / mốc thời gian** (S)
  - Acceptance: hai slide mới đúng phong cách mẫu, hiện đúng dữ liệu.
  - Deps: T11 · Files: `storybook/AnniversarySlide.tsx`, `TimelineSlide.tsx`, `StorybookSunsetTemplate.tsx`

  - **Đã làm T10b–T13 cùng lúc (Storybook), theo cách gọn hơn kế hoạch:** thay vì mỗi mẫu một thư mục slide riêng, các trang (mở quà, thư, ảnh, video, nhạc, ghi âm, ngày kỷ niệm, mốc thời gian, lời cảm ơn) viết **một lần** trong `gift-templates/slides/` trên bố cục chia đôi `SlideLayout`; mỗi mẫu chỉ là một **skin** (`skins/*.tsx`: màu, font, khung ảnh, tiêu đề, tranh minh họa). `makeTemplate(skin)` ghép lại. Storybook xong: khung dọc 390×844, khung ngang 1024×768 và 1280×720 đã chụp và xem bằng Chrome; ảnh chọn được, video YouTube nhúng chạy thật. Lời kết hiện ở trang cảm ơn (không có trang riêng). **Chưa kiểm:** ghi âm thật (cần Supabase Storage), nghe nhạc, khung 820×1180 (iPad dọc).
  - Retro (T14–T15) và Sổ Hoa Khô (T16–T17) giờ chỉ còn là viết skin; chưa làm.

### Retro 90s
- [ ] **T14 Retro: khung động + thư / ảnh / lời kết** (M) — dùng `SlideLayout`, đẹp ở khung dọc và ngang như T11
  - Acceptance: các khu vực theo thứ tự `blocks`; ảnh album 1–6 ảnh không phụ thuộc ảnh nổi bật hay ảnh mẫu; bỏ chế độ mini; tách thư mục `retro/`.
  - Verify: `tsc`, `eslint`, `next build`; thử tay.
  - Deps: C · Files: `RetroNostalgiaTemplate.tsx`, `retro/*`
- [ ] **T15 Retro: video / nhạc / ghi âm + ngày KN / mốc** (M)
  - Acceptance: cassette cho nhạc và ghi âm dùng bộ phát thật; video dùng `VideoEmbed`; ngày kỷ niệm và mốc thời gian theo phong cách mẫu.
  - Deps: T14 · Files: `retro/*`, `RetroNostalgiaTemplate.tsx`

### Sổ Hoa Khô
- [ ] **T16 Vintage: khung động + thư / ảnh / lời kết** (M) — dùng `SlideLayout`, đẹp ở khung dọc và ngang như T11
  - Acceptance: trang sổ theo thứ tự `blocks`; album dùng ảnh khách (hết Unsplash gán cứng); đề từ, chữ ký, lời kết hiện đúng; bỏ ảnh vòng tay mặc định (`braceletImg`); tách `vintage/`.
  - Deps: C · Files: `VintageScrapbookTemplate.tsx`, `vintage/*`
- [ ] **T17 Vintage: ghi âm / video / nhạc + mốc / ngày KN** (M)
  - Acceptance: các mục kiểu sổ dán (washi tape, polaroid) dùng bộ phát thật; ngày kỷ niệm hiện đếm ngày.
  - Deps: T16 · Files: `vintage/*`, `VintageScrapbookTemplate.tsx`

**Checkpoint D:** cả 3 mẫu hiển thị đúng 3 loại thiệp thử: chỉ thư; chỉ ảnh + nhạc; đủ 8 mục theo thứ tự đảo. **Bạn xem trên điện thoại (nhất là iPhone).**

## Phase 5 — Hoàn tất

- [x] **T18 Xem thử toàn màn hình theo thiết bị** (M)
  - Acceptance: hoàn thiện lớp phủ xem thử đang dở trong thư mục làm việc (chưa commit): bỏ hết dữ liệu mẫu (`DEFAULT_GIFT_DATA`, ảnh vòng tay và câu trích cố định, ảnh/video mẫu), dựng từ `normalizeGift(draftToPayload(draft))` nên hiện đúng mục đã tích, đúng thứ tự, đúng mẫu đang chọn; có công tắc **Điện thoại / iPad / Máy tính** (ép bề rộng khung chứa 390 / 768 / 1280); nút "Xem thử" có ở bước Hoàn tất và trên điện thoại; đóng bằng nút và phím Esc, giữ focus trong hộp thoại rồi trả focus; ghi âm trong bản nháp nghe được; trên điện thoại thật thì chiếm toàn màn hình.
  - Verify: `tsc`, `eslint`, `next build`; thử tay ở ba cỡ.
  - Đã làm: `studio/PreviewOverlay.tsx` (thay lớp phủ dở dang): dựng từ `normalizeGift(draftToPayload(draft))` không còn dữ liệu mẫu ở phần soạn; công tắc mẫu và thiết bị (Điện thoại 390 / iPad 768 / Máy tính 1280, mặc định theo màn hình đang dùng); khoá cuộn nền, giữ focus trong hộp thoại, Esc, trả focus. Lưu ý: ba mẫu cũ vẫn lấp nội dung mẫu cho phần chưa soạn (xong khi chuyển mẫu).
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

- [ ] **T21 Studio theo thiết bị** (S)
  - Acceptance: ba bước của studio xem ổn ở 390 / 768 / 1280px (thanh nút đáy không che ô nhập, lưới 8 thẻ và khung soạn không tràn ngang, chữ không nhỏ hơn 13px); iPad có bố cục hợp lý (không bỏ trống nửa màn hình); bản xem trước ở cột bên chỉ hiện từ 1024px, dưới đó là nút Xem thử.
  - Verify: xem ở ba cỡ (khung xem thử trình duyệt hoặc thiết bị thật); `tsc`, `eslint`.
  - Deps: T6b · Files: `app/create/[token]/page.tsx`, `studio/*`, `globals.css`

## Ngoài phạm vi

Nút "Tặng" khoá thiệp, AI viết lời nhắn, email thông báo, tải bản offline, chuyển ảnh sang Storage, tự lưu nháp, lời cảm ơn của người nhận, quyết định PIN in trên thẻ.
