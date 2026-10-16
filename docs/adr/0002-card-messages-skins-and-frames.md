# ADR 0002: Thiệp theo thông điệp tự chọn, mẫu là "skin", khung dọc hoặc ngang

- Trạng thái: chấp nhận
- Thay thế: quyết định 2 và 5 của ADR 0001
- Liên quan: `docs/specs/card-messages.md`

## Bối cảnh

Mỗi người làm thiệp một kiểu: người có ghi âm, người có video, người chỉ có vài tấm ảnh. Cách cũ để từng mẫu quyết định nó hiển thị khối nào buộc mọi người đi qua cùng một biểu mẫu và lấp chỗ trống bằng nội dung mẫu. Người nhận lại mở thiệp trên điện thoại, iPad hoặc máy tính, trong khi ba mẫu cũ là bảy trang cố định theo khung điện thoại.

## Quyết định

1. **Người mua tích chọn thông điệp.** Dữ liệu có trường `blocks`: danh sách có thứ tự gồm tối đa 8 loại (thư, ảnh, ghi âm, video, nhạc, ngày kỷ niệm, mốc thời gian, lời kết). Chỉ tên người nhận là bắt buộc. Mục đã tích mà trống bị từ chối với tên mục. Thiệp cũ chưa có `blocks` được suy ra từ nội dung khi đọc (`deriveBlocks`), không migrate DB. "Ảnh nổi bật" bị gộp vào album (ảnh đầu là ảnh bìa).
2. **Mẫu là skin, không quyết định nội dung.** Các trang (mở quà, thư, ảnh, video, nhạc, ghi âm, ngày kỷ niệm, mốc thời gian, cảm ơn) viết một lần trên bố cục chia đôi `SlideLayout` (hình/minh họa + nội dung). Mỗi mẫu chỉ là một `Skin` (màu, font, khung ảnh, tiêu đề, tranh minh họa). Thêm mẫu mới = thêm một file skin.
3. **Khung theo hình dạng của khung chứa, tràn màn hình.** Dọc (điện thoại, iPad dọc): hình trên, nội dung dưới. Ngang (iPad ngang, máy tính): hình trái, nội dung phải. Quyết định bằng `layoutFor(width, height)` từ kích thước đo được của khung chứa (không theo cửa sổ), nên xem thử mô phỏng được từng thiết bị.
4. **Khung xem thiệp dùng chung** lo điều hướng (nút, chấm, phím, vuốt), thông báo cho trình đọc màn hình, nhạc có sẵn bắt đầu khi mở; mẫu chỉ vẽ trang được giao (`GiftTemplate`).
5. **Không có dữ liệu mẫu trong thiệp thật.** `normalizeGift` chỉ dựng từ dữ liệu đã lưu; mục không có nội dung thì vắng mặt. Dữ liệu mẫu chỉ còn ở `/thamkhao`.
6. **Nhúng media:** địa chỉ nhúng dựng từ id tách ra từ link (YouTube dùng miền riêng tư `youtube-nocookie.com`, Vimeo, Google Drive, Spotify, SoundCloud), trong `<iframe>` có `sandbox`; luôn có nút mở link gốc. Ghi âm phát bằng `<audio>` từ link ký 1 giờ, tự xin link mới một lần khi lỗi.

## Hệ quả

- Thêm hoặc đổi thứ tự thông điệp không cần đổi mẫu; thêm loại thông điệp mới = thêm id vào `blocks.ts`, một trang trong `slides/`, một dòng tiêu đề và tranh trong mỗi skin.
- Ba mẫu cũ (bảy trang cố định, tên và ảnh mẫu) đã bị xoá; link `?tpl=` không còn tác dụng.
- Một số phần chưa xác nhận bằng tài liệu chính thức (liệt kê trong `src/lib/media/embed.ts`): Google Drive `/preview`, mã băm Vimeo riêng tư, các loại Spotify ngoài `track`, SoundCloud nhận link trang công khai. Nút mở link gốc là dự phòng.
- Ảnh vẫn nhúng base64 trong `gift_data` (ADR 0001, quyết định 5 phần ảnh): nặng khi mở lại thiệp, chuyển sang Storage khi cần.
- Tranh minh họa là các ảnh PNG lớn (0,4 đến 1,5 MB) trong `public/thamkhao/`: nên nén lại nếu thiệp tải chậm trên 4G.

## Phương án đã cân nhắc

- Giữ ba mẫu bảy trang cố định và chỉ ẩn trang không có nội dung: không đáp ứng việc tự sắp xếp thứ tự và khung ngang.
- Vẽ riêng từng slide ngang cho từng mẫu (hơn 20 bản): đẹp nhất nhưng quá tốn công; bố cục chia đôi dùng chung cho kết quả đồng nhất với công sức vừa phải.
- Khung điện thoại căn giữa trên màn hình lớn: người dùng nhận xét là sai ý (chỉ nền tràn màn hình).
