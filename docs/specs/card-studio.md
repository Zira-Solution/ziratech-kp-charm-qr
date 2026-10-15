# Spec: Studio tạo thiệp theo khối (card studio)

> Phần "khối theo mẫu" trong spec này sẽ được thay bởi cách người mua tự tích chọn thông điệp: xem `docs/specs/card-messages.md`.

Trạng thái: đang triển khai. Phạm vi: **phía tạo thiệp** (studio + API lưu). Việc hiển thị các khối mới trong trang xem thiệp (`/g/[token]`) là giai đoạn sau.

## Objective

Người mua (đã có **mã thiệp** + **OTP tạo thiệp**) vào `/create/[token]`, chọn một mẫu thiệp và điền nội dung. Mỗi mẫu chỉ hiện những **khối thông tin** mà nó hỗ trợ. Nội dung lưu vào `gift_products.gift_data`.

Thành công = người mua điền được đủ các khối của mẫu đã chọn, lưu thành công, mở lại studio thấy đúng dữ liệu đã lưu, và dữ liệu hỏng/độc hại bị từ chối với thông báo rõ ràng.

### Các khối thông tin

| Khối | Khách nhập | Giới hạn |
|---|---|---|
| `names` (luôn có) | Tên người tặng, tên người nhận (bắt buộc), cách xưng hô, ẩn danh người tặng | tên ≤100 ký tự |
| `letter` | Tiêu đề, đề từ, nội dung, chữ ký | nội dung ≤3.000 |
| `photos` | Album ảnh: ảnh + lời tựa + ngày | ≤6 ảnh, mỗi ảnh nén ≤~250KB |
| `highlight` | Ảnh nổi bật / ảnh bìa + lời tựa | ≤2 (tuỳ mẫu: 1 hoặc 2) |
| `finalMessage` | Một câu kết | ≤200 ký tự |
| `music` | Không dùng / giai điệu có sẵn / link YouTube, Spotify, SoundCloud + tên bài, ca sĩ | link `https` thuộc danh sách cho phép |
| `voice` | Ghi âm thật bằng micro + lời thoại tuỳ chọn | ≤120 giây, ≤2MB, 1 bản ghi/thiệp |
| `video` | Link YouTube, Vimeo, Google Drive | link `https` thuộc danh sách cho phép |
| `anniversary` | Ngày kỷ niệm + nhãn ("Ngày mình bên nhau") | ngày hợp lệ 1900–2100 |
| `timeline` | Mốc kỷ niệm: ngày, tiêu đề, mô tả | ≤5 mốc |

### Khối theo mẫu

| Mẫu | Khối |
|---|---|
| Sổ Hoa Khô (`vintage-scrapbook`) | names, letter, photos, finalMessage, anniversary |
| Retro 90s (`retro-nostalgia`) | names, letter, photos, highlight(2), finalMessage, music, voice, video |
| Sunset Anime (`storybook-sunset`) | names, letter, photos, highlight(1), finalMessage, music, voice, video, timeline |

## Assumptions (đã nêu để người duyệt sửa)

1. Ứng dụng web, ưu tiên điện thoại (360px), trình duyệt hiện đại (có `MediaRecorder`, `createImageBitmap`).
2. Không thêm thư viện mới. Âm thanh lưu ở **Supabase Storage** (bucket riêng tư `gift-media`), tự tạo bằng service-role key.
3. Ảnh vẫn lưu dạng data URL đã nén trong `gift_data` (đã chạy ổn); chuyển ảnh sang Storage để sau.
4. Nhạc **không** lưu file: chỉ giai điệu tổng hợp có sẵn hoặc link ngoài.
5. Chưa phải OTP thật (vẫn là mã cố định); không đổi cơ chế xác thực.
6. Trang xem thiệp chưa hiển thị khối mới → nội dung mới lưu được nhưng chưa thấy trong thiệp cho đến giai đoạn xem thiệp.

## Commands

```
Typecheck : npx tsc --noEmit
Lint      : npx eslint src scripts
Test      : npm test            # node:test, chạy trực tiếp file .ts (Node >= 22.6)
Build     : npx next build
Dev       : npx next dev -p 3001
```

## Project structure

```
src/components/gift-templates/types.ts            kiểu dữ liệu thiệp (RecipientGiftData)
src/components/gift-templates/template-config.ts  mẫu nào có khối nào
src/components/gift-templates/music-presets.ts    giai điệu có sẵn
src/components/studio/                            các khối giao diện của studio
src/lib/validation/gift.ts                        kiểm tra + làm sạch dữ liệu thiệp (thuần, có test)
src/lib/supabase/media.ts                         Storage: bucket, tải lên, link ký
src/app/api/gifts/[token]/save|voice/route.ts     API
scripts/gift-validation.test.ts                   test cho validation
docs/specs, docs/adr, tasks/                      đặc tả, quyết định, kế hoạch
```

## API contract

Mọi lỗi của nhóm `/api/gifts/*`: `{ "error": "<tiếng Việt>" }` + mã HTTP. Chỉ **thêm** trường mới, không đổi trường cũ.

| Endpoint | Quyền | Vào | Ra / lỗi |
|---|---|---|---|
| `POST /api/gifts/[token]/save` | phiên **create** | `{ giftData }` | `200 {success, message, viewUrl}`; `400` dữ liệu sai; `401` chưa xác thực |
| `POST /api/gifts/[token]/voice` | phiên **create** | `multipart/form-data`: `audio` (file), `durationSec` | `200 {success, voice:{audioPath,durationSec,audioUrl}}`; `400`, `401`, `413` quá lớn, `415` sai định dạng (đọc từ byte đầu file), `429`, `503` chưa cấu hình Storage |
| `GET /api/gifts/[token]` | create/open | – | như cũ, thêm `giftData.voiceNote.audioUrl` (link ký, hết hạn sau 1 giờ) khi có ghi âm |

Lưu thiệp **ghi đè toàn bộ** `gift_data` bằng bản đã làm sạch (whitelist trường, không nhận trường lạ).

Ghi âm: không có endpoint xoá. "Bỏ ghi âm" trong studio chỉ xoá khỏi bản nháp; file không còn được thiệp dùng sẽ bị dọn **lúc lưu thiệp** (và lúc tải bản mới lên, trừ bản đang được thiệp đã lưu dùng). Lý do: xoá ngay khi tải bản mới sẽ làm thiệp đã lưu mất giọng nói nếu khách chưa lưu. Lúc lưu, đường dẫn ghi âm phải thuộc thư mục của thiệp và file phải thật sự tồn tại.

## Code style

```ts
// Hàm thuần, trả kết quả có kiểu thay vì ném lỗi; thông báo lỗi tiếng Việt, nêu số thứ tự mục.
export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseTimeline(input: unknown): Parsed<TimelineItem[]> {
  if (input == null) return { ok: true, value: [] };
  if (!Array.isArray(input)) return { ok: false, error: "Danh sách mốc thời gian không hợp lệ" };
  if (input.length > MAX_TIMELINE) return { ok: false, error: `Tối đa ${MAX_TIMELINE} mốc kỷ niệm` };
  // ...
}
```

Quy ước: tên component PascalCase, một khối = một file ≤ ~200 dòng, giao diện dùng token theme (`text-primary`, `bg-secondary`...), không dùng màu hex cứng.

## Testing strategy

- **Unit (node:test):** toàn bộ hàm validation thuần (`parseGiftData`, link allowlist, ngày, ảnh, mốc). Viết test trước khi viết hàm.
- **API (curl, DB thật):** lưu/đọc lại từng khối, từ chối dữ liệu sai, ranh giới phiên create/open, upload âm thanh đúng/sai định dạng/quá lớn.
- **Tĩnh:** `tsc`, `eslint`, `next build` sau mỗi nhiệm vụ.
- **Giao diện:** kiểm tra truy cập (nhãn, vai trò, focus), responsive 390/768/1280. Ghi âm bằng micro thật không tự động hoá được → bạn tự test.

## Boundaries

- **Always:** kiểm tra dữ liệu ở biên (server), thông báo lỗi nói rõ lỗi ở mục nào, dọn dữ liệu thử sau test, commit nhỏ không có co-author.
- **Ask first:** thêm thư viện, đổi cấu trúc bảng DB, đổi cơ chế OTP/xác thực.
- **Never:** lưu file âm thanh công khai, tin dữ liệu từ trình duyệt mà không kiểm tra lại, đưa khoá/mật khẩu vào code hoặc chat, hiển thị nội dung người dùng bằng `dangerouslySetInnerHTML`.

## Success criteria

1. Chọn từng mẫu → studio hiện đúng bộ khối ở bảng trên.
2. Điền mọi khối, lưu, tải lại trang → mọi giá trị còn nguyên (kể cả ảnh, ngày, mốc, link).
3. Chữ có `& < > " ' /` lưu và đọc lại y nguyên.
4. Link không `https`, sai máy chủ cho phép, ngày không tồn tại, >5 mốc, >6 ảnh, ảnh sai định dạng/quá lớn đều bị `400` kèm thông báo rõ.
5. Ghi âm: tải lên được, nghe lại được sau khi tải lại trang, xoá được, không tải được nếu thiếu phiên create, link nghe hết hạn.
6. Không còn dữ liệu mẫu điền sẵn vào thiệp của khách; không còn nút "AI" giả.
7. `tsc`, `eslint`, `npm test`, `next build` đều qua.

## Open questions

- Có cần bản ghi âm tối đa dài hơn 2 phút? (hiện theo spec gốc: 2 phút)
- Danh sách "giai điệu có sẵn" cần bao nhiêu bài và phong cách nào? (mặc định 4: lofi, piano, hộp nhạc, guitar)
