# Spec: Thiệp theo thông điệp tự chọn (card messages)

Trạng thái: thiết kế đã duyệt, chưa triển khai. Thay thế cách làm "mỗi mẫu quyết định khối nào có" trong `docs/specs/card-studio.md`; các giới hạn, kiểm tra link, ghi âm và bảo mật trong spec đó vẫn giữ.

## Objective

Mỗi người có một cách làm thiệp riêng: người có ghi âm, người có video, người chỉ có vài tấm ảnh. Studio (`/create/[token]`) vì vậy mở đầu bằng một bảng **"Bạn muốn gửi những gì?"**: người mua tích chọn các loại thông điệp trang hỗ trợ, chỉ những mục đã tích mới hiện khung soạn bên dưới, và tự sắp xếp thứ tự. Thiệp của người nhận hiển thị đúng các mục đó, đúng thứ tự, bằng giao diện của mẫu đã chọn.

Thành công = người mua tích, soạn, sắp xếp, xem thử, lưu; người nhận mở thiệp thấy đúng những gì đã tích (chữ, ảnh, nghe được ghi âm, xem được video, nghe được nhạc), không thấy nội dung mẫu nào do hệ thống tự điền.

## Quyết định đã chốt với chủ dự án

1. Mẫu thiệp (Storybook 20/10, Sổ Hoa Khô, Retro 90s) chỉ là **giao diện**; mẫu nào cũng hiển thị mọi loại thông điệp (Hướng 1: mỗi mẫu cung cấp cách vẽ cho từng loại).
2. Bắt buộc duy nhất: **tên người nhận**. Thư tay là một mục tích chọn như các mục khác.
3. 8 loại thông điệp. "Ảnh nổi bật" bị gộp vào album: ảnh đầu tiên là ảnh bìa.
4. Người mua **tự sắp xếp thứ tự** bằng nút Lên/Xuống (không thêm thư viện kéo thả).
5. Xem trước: giữ bưu thiếp mini **và** thêm nút **Xem thử** mở thiệp thật toàn màn hình với dữ liệu đang soạn.
6. Làm đủ studio, dữ liệu và cả 3 mẫu xem thiệp trong cùng một đợt.

## Các loại thông điệp

| Id | Tên cho người mua | Nội dung / giới hạn (giữ như spec cũ) |
|---|---|---|
| `letter` | Thư tay | tiêu đề, đề từ, nội dung ≤3.000, chữ ký |
| `photos` | Ảnh | ≤6 ảnh, mỗi ảnh nén; ảnh đầu = ảnh bìa; lời tựa + ngày mỗi ảnh |
| `voice` | Ghi âm | ≤120 giây, ≤2MB, lời thoại tuỳ chọn |
| `video` | Video | link YouTube / Vimeo / Google Drive |
| `music` | Nhạc | 1 trong 4 giai điệu có sẵn, hoặc link YouTube / Spotify / SoundCloud + tên bài, ca sĩ |
| `anniversary` | Ngày kỷ niệm | ngày hợp lệ + nhãn |
| `timeline` | Mốc thời gian | ≤5 mốc: ngày, tiêu đề, mô tả |
| `finalMessage` | Lời kết | ≤200 ký tự |

Khối "tên" (người nhận, người tặng, xưng hô, ẩn danh) luôn có, không nằm trong danh sách.

## Dữ liệu

`gift_products.gift_data` thêm trường tuỳ chọn `blocks: BlockId[]`: danh sách có thứ tự, không trùng, tối đa 8, mỗi phần tử thuộc 8 id ở trên. Thứ tự trong danh sách = thứ tự hiển thị. Chỉ thêm trường, không đổi trường cũ (ADR 0001).

`parseGiftData`:
- Chỉ giữ nội dung của các khối nằm trong `blocks`; nội dung của khối không được tích bị bỏ.
- Mục đã tích mà trống (không ảnh, không link, không chữ...) thì trả lỗi rõ, ví dụ "Mục Video đang trống, hãy điền hoặc bỏ tích".
- `blocks` rỗng thì trả lỗi "Hãy chọn ít nhất một thông điệp".
- `blocks` chứa id lạ, trùng, hoặc nhiều hơn 8 thì lỗi.
- Quy tắc ghi âm (đường dẫn thuộc thư mục thiệp, file tồn tại, dọn file thừa) giữ nguyên, chỉ áp dụng khi `voice` nằm trong `blocks`.
- Không còn lưu `momentPhotos`, `coverIllustrationUrl` cho thiệp mới. `template-config.ts` bỏ `blocks`, `highlightMax`, `templateHasBlock`; mẫu chỉ còn id, tên, biểu tượng, mô tả.

Thiệp cũ (chưa có `blocks`): khi đọc, `deriveBlocks` suy ra từ nội dung đã điền theo thứ tự thư, ảnh, video, nhạc, ghi âm, ngày kỷ niệm, mốc thời gian, lời kết. Không migrate DB. Ảnh nổi bật cũ được đưa lên đầu album khi mở lại studio (vẫn tối đa 6).

## Studio

Ba bước, mỗi bước xác nhận bằng nút **Tiếp tục** (thanh nút Quay lại / Tiếp tục cố định ở đáy màn hình; thanh các bước ở đầu trang, bước đã qua mở lại được, bước chưa tới bị khoá):

1. **Chọn:** người nhận (bắt buộc) và người tặng, xưng hô, ẩn danh; rồi lưới 8 thẻ "Bạn muốn gửi những gì?" (bấm để tích; ban đầu chưa tích mục nào). Tích không làm trang cuộn.
2. **Soạn:** mỗi mục đã tích một khung theo đúng thứ tự, có nút Lên / Xuống / Bỏ mục này.
3. **Hoàn tất:** tóm tắt các mục đã chọn (có nút sửa), chọn giao diện thiệp (3 mẫu, mẫu nào cũng dùng được), đổi OTP xem thiệp, rồi **Lưu thiệp**.

Giao diện của studio: nền **trắng, không dark mode** (khai báo `colorScheme: light`), một font dễ đọc là **Be Vietnam Pro**, chữ không nhỏ hơn 13px, viền xám rõ ràng thay cho kính mờ màu hồng; phạm vi chỉ trong nhóm trang `/create` (lớp `studio-light`), các trang khác giữ giao diện riêng.

- Bỏ tích không xoá nội dung đã nhập; tích lại thì hiện lại. Chỉ mục đang tích được lưu.
- Các khung soạn tái sử dụng khối hiện có; khối ảnh nổi bật bị bỏ.
- Cột bên phải (màn hình rộng): bưu thiếp mini; nút Xem thử toàn màn hình sẽ nằm ở bước Hoàn tất (làm ở T18).
- Mỗi bước kiểm tra phần của nó trước khi cho đi tiếp (bước 1: tên người nhận, ít nhất một mục; bước 2: không mục nào trống); Lưu thiệp kiểm tra lại tất cả và đưa về đúng bước, đúng ô nếu có lỗi. Lỗi hiện ở thanh đáy, luôn nhìn thấy.
- `GiftDraft` thêm `blocks`; `draftFromSaved` / `draftToPayload` đọc và gửi `blocks`.

## Trang xem thiệp

- `normalizeGift(saved)` (hàm thuần, có test) tạo "thiệp để hiển thị": suy ra `blocks` cho thiệp cũ, **không trộn `DEFAULT_GIFT_DATA`**. Ô trống không hiển thị gì. Dữ liệu mẫu chỉ còn dùng ở `/thamkhao`.
- Mỗi mẫu nhận danh sách `blocks` theo thứ tự và vẽ từng mục bằng bố cục riêng của mẫu (khung và điều hướng theo thiết bị do một khung dùng chung lo, xem "Theo thiết bị"). Mục không có trong danh sách không xuất hiện.
- Tên người tặng, xưng hô, ẩn danh được dùng thật trong lời chào; ẩn danh thì không hiện tên.
- Bỏ tham số `?tpl=`; mẫu lấy từ dữ liệu đã lưu.
- **Storybook:** slide "Mở quà" đầu, mỗi mục một slide theo thứ tự, slide "Cảm ơn" cuối (hiện lời kết nếu có). Số slide thay đổi theo số mục. Slide ngày kỷ niệm và mốc thời gian là thiết kế mới.
- **Retro 90s:** các khu vực xếp dọc theo thứ tự; phần chưa có thì thiết kế thêm theo phong cách mẫu.
- **Sổ Hoa Khô:** thêm ghi âm, video, nhạc, mốc thời gian theo kiểu sổ dán.
- Mỗi mẫu tách thành nhiều file nhỏ (mỗi loại thông điệp một file) thay vì một file hàng trăm dòng.

### Theo thiết bị (quyết định 2026-10-16)

Người tạo và người nhận dùng điện thoại, iPad hoặc máy tính, nên cả studio và trang xem thiệp thích ứng theo ba cỡ. Bố cục "slide giữa + thanh điều hướng bên cạnh", áp dụng cho cả 3 mẫu (mỗi mẫu giữ nét riêng):

| Cỡ | Rộng | Trang xem thiệp |
|---|---|---|
| Điện thoại | dưới 640px | slide tràn màn hình, không viền khung; chấm điều hướng và vuốt |
| iPad | 640–1023px | slide lớn căn giữa (tối đa khoảng 640px), mũi tên trước/sau, chấm điều hướng |
| Máy tính | từ 1024px | cột trái: lời chào, bộ phát nhạc, danh sách mục bấm để nhảy; bên phải slide lớn (tối đa khoảng 720px) với nút trước/sau và phím mũi tên |

- Cỡ được quyết định theo **bề rộng khung chứa** (đo bằng `ResizeObserver`, hàm thuần `layoutFor` có test), không theo bề rộng cửa sổ, để khung "iPad" hay "Điện thoại" trong phần xem thử hiển thị đúng ngay trên màn hình máy tính. Mỗi mẫu nhận `layout` và `width` qua `TemplateContext`.
- Trang xem thiệp bỏ chế độ "Bản thảo" và "Cuộn dọc": mỗi thiết bị dùng một kiểu điều hướng slide (chấm / mũi tên / danh sách), cộng phím mũi tên và vuốt.
- Mỗi slide của mẫu phải đẹp ở 390 / 640 / 720px (chữ, ảnh, khoảng cách co giãn theo bề rộng).
- Xem thử trong studio có công tắc **Điện thoại / iPad / Máy tính**.
- Studio: ba bước dùng được ở cả ba cỡ; thanh nút đáy không che nội dung; trên điện thoại và iPad bản xem trước là nút Xem thử (không có cột bên).

### Bộ phát dùng chung (mẫu chỉ chỉnh kiểu dáng)

- **Ghi âm:** `<audio>` phát bản ghi thật từ link ký 1 giờ; hết hạn thì tự xin link mới một lần.
- **Video:** link được đổi thành địa chỉ nhúng, hiện trong `<iframe>` chỉ với host cho phép, có `sandbox` và `referrerpolicy`.
- **Nhạc:** giai điệu có sẵn dùng bộ tổng hợp Web Audio hiện có, bắt đầu khi người nhận chạm "mở quà", có nút tạm dừng. Nhạc dạng link dùng khung nhúng và người nhận tự bấm phát (trình duyệt chặn tự phát của bên thứ ba).
- **Ngày kỷ niệm** (đếm ngày bên nhau) và **mốc thời gian**.
- Lỗi phát: thông báo nhỏ kèm nút mở link gốc, không làm vỡ thiệp. Ảnh lỗi giữ nguyên khung.

## Bảo mật (giữ nguyên rào hiện có)

Server whitelist trường và kiểm tra host link; khung nhúng chỉ cho host cho phép; không dùng `dangerouslySetInnerHTML`; ghi âm vẫn ở bucket riêng tư, đọc qua link ký.

## Kiểm thử

- `npm test`: kiểm tra `blocks` (rỗng, trùng, id lạ, quá 8), mục tích mà trống, nội dung khối không tích bị bỏ, `deriveBlocks` cho thiệp cũ, `normalizeGift`, đổi link thành địa chỉ nhúng và kiểm tra host.
- `tsc`, `eslint`, `next build` sau mỗi lát.
- Bạn tự thử trên máy thật: ghi âm bằng micro, phát nhạc, video, xem 3 mẫu trên điện thoại (nhất là iPhone). Phần này không tự động hoá được.

## Lát giao việc (chi tiết ở bước lập kế hoạch)

1. Dữ liệu, kiểm tra và test.
2. Studio: bảng tích chọn, khung soạn có Lên / Xuống.
3. Bộ phát dùng chung và `normalizeGift`.
4. Ba mẫu xem thiệp (độc lập nhau sau lát 3, làm song song được).
5. Nút Xem thử toàn màn hình, dọn `DEFAULT_GIFT_DATA` và `?tpl=`.

## Ngoài phạm vi

Nút "Tặng" khoá thiệp, AI viết lời nhắn, email thông báo, tải bản offline, chuyển ảnh sang Storage, tự lưu nháp, lời cảm ơn của người nhận, quyết định về PIN in trên thẻ.

## Success criteria

1. Mở studio: chưa mục nào được tích; tích xong bấm Tiếp tục thì sang bước soạn, mỗi mục đã tích một khung; bỏ tích thì khung ẩn, nội dung đã nhập không mất.
2. Đổi thứ tự bằng Lên / Xuống, lưu, mở lại: thứ tự giữ nguyên.
3. Lưu bị từ chối với thông báo rõ khi: không có tên người nhận, không mục nào được tích, mục đã tích còn trống.
4. Thiệp của người nhận chỉ hiện các mục đã tích, đúng thứ tự, ở cả 3 mẫu; không có ảnh, tên hay video mẫu nào do hệ thống tự điền.
5. Ghi âm nghe được, video xem được, nhạc có sẵn phát được, nhạc dạng link bấm phát được.
6. Thiệp đã lưu trước đây vẫn mở và hiển thị đúng.
7. `tsc`, `eslint`, `npm test`, `next build` đều qua.
