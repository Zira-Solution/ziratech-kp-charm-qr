# ADR 0001: Nội dung thiệp theo khối và nơi lưu file media

- Trạng thái: chấp nhận
- Liên quan: `docs/specs/card-studio.md`

## Bối cảnh

Thiệp cần nhiều loại nội dung (chữ, ảnh, giọng nói, nhạc, video, ngày kỷ niệm, mốc thời gian) và mỗi mẫu thiệp hiển thị một tập khác nhau. Dự án chạy trên gói miễn phí (Supabase, Vercel), nên dung lượng và băng thông bị giới hạn chặt. Khách không có tài khoản; quyền truy cập đi qua mã thiệp + OTP và cookie phiên có chữ ký.

## Quyết định

1. **Nội dung thiệp là JSON theo khối** trong `gift_products.gift_data` (cột đã có). Không thêm bảng hay cột. Mỗi khối là trường tuỳ chọn, chỉ thêm không đổi, để thiệp cũ vẫn đọc được.
2. **Mẫu khai báo khối của nó** trong `template-config.ts`. Studio chỉ hiện khối của mẫu đang chọn. Thêm mẫu mới = thêm một dòng cấu hình + một component hiển thị.
3. **Server làm sạch bằng whitelist**: `parseGiftData` dựng lại object từ từng trường đã kiểm tra, không nhận trường lạ (trước đây `...giftFields` cho phép khách ghi trường tuỳ ý).
4. **Ghi âm lưu ở Supabase Storage**, bucket **riêng tư** `gift-media`, đường dẫn `<token>/voice-<ts>.<ext>`, đọc bằng **link ký hết hạn 1 giờ** được tạo ở server sau khi kiểm tra phiên. Một bản ghi/thiệp; bản mới thay bản cũ. Bucket tự tạo bằng service-role key, không cần chạy SQL.
5. **Ảnh vẫn nhúng dạng data URL đã nén** (≤~250KB/ảnh, ≤6 ảnh + ≤2 ảnh nổi bật, tổng ≤2,5M ký tự). Chấp nhận phí tổn: GET thiệp nặng hơn. Chuyển ảnh sang Storage là việc sau, khi cần.
6. **Nhạc không lưu file**: giai điệu tổng hợp có sẵn (Web Audio, không dính bản quyền) hoặc link ngoài theo danh sách cho phép. Tránh phải lưu và chịu trách nhiệm bản quyền file nhạc.
7. **Video chỉ nhận link** (YouTube, Vimeo, Google Drive), không tải file.
8. **Danh sách cho phép (allowlist) máy chủ** cho link nhạc/video; chỉ `https`.

## Hệ quả

- Dữ liệu thiệp nằm trong một cột JSON: dễ thêm khối, nhưng không truy vấn/lọc theo khối được (chưa cần).
- Link ký 1 giờ: trang xem thiệp phải gọi API mỗi lần mở để lấy link mới.
- Ảnh nhúng làm hàng `gift_products` lớn hơn (~2MB tối đa); nếu số thiệp lớn hoặc cần tải nhanh hơn thì chuyển ảnh sang Storage (một ADR sau).
- Bản ghi âm không còn truy cập được khi thiệp bị xoá mềm; dọn file thật khi xoá vĩnh viễn là việc sau.
- Trang xem thiệp phải được cập nhật để hiển thị các khối mới (giai đoạn sau).

## Phương án đã cân nhắc

- Bảng riêng cho từng khối: linh hoạt hơn nhưng cần SQL và nhiều truy vấn; quá nặng cho quy mô hiện tại.
- Lưu ghi âm dạng base64 trong JSON: đơn giản nhưng 2 phút ghi âm ≈ vài trăm KB đến MB, làm phình mỗi lần đọc thiệp; Storage tách riêng tốt hơn.
- Cho tải mp3: cần quản lý dung lượng và bản quyền; bỏ trong bản đầu theo lựa chọn của chủ dự án.
