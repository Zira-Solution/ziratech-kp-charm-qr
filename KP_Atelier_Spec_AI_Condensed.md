# K&P Atelier — Functional & Technical Specification (AI Condensed)

> **Mục đích tài liệu:** Bản đặc tả kỹ thuật và nghiệp vụ cô đọng (tối ưu hóa token) dành cho AI/LLM làm việc trên codebase K&P Atelier. Giữ trọn 100% logic nghiệp vụ, ràng buộc, máy trạng thái và luồng xử lý từ bản gốc v10.

---

## 1. TỔNG QUAN HỆ THỐNG
- **Sản phẩm:** Web app di động đi kèm vòng tay charm (và hoa quà tặng). Mỗi sản phẩm kèm 1 thẻ chứa **Mã QR** và **Mã ngắn**.
- **Ý nghĩa:** Quét QR mở trang quà số do người mua tùy biến: Lời nhắn chữ (hỗ trợ AI), ghi âm giọng nói, album ảnh polaroid, nhạc nền cá nhân hóa, câu chuyện charm.
- **Mục tiêu gây quỹ:** 100% lợi nhuận ròng (*Doanh thu - Giá vốn*) đóng góp cho trạm cứu hộ động vật **Sân Nhà Nhiều Chó** (Thanh Oai, Hà Nội).
- **Chiến dịch:** Đặt trước vòng/hoa nhận ngày **20/10/2026** độc quyền trong khuôn viên Đại học FPT.
- **Vòng đời hệ thống:** Hoạt động đến **hết tháng 10/2026**, sau đó ngừng web, quà hết hạn, xóa dữ liệu trong 30 ngày (không gia hạn). Người dùng cần tải **Bản lưu trữ offline** trước thời hạn.
- **Phạm vi (In-Scope):** Landing page, luồng tạo quà, mã QR/PIN/mã ngắn, đặt trước 20/10, thanh toán (tiền mặt/VietQR/cổng online), module gây quỹ minh bạch, luồng mở quà cho người nhận, thông báo email, admin dashboard, xuất offline HTML/zip.
- **Ngoài phạm vi (Out-of-Scope):** Không dùng NFC, không in sẵn thẻ hàng loạt (in/tạo theo đơn), không chuyển chủ quyền vòng, không chat 2 chiều (chỉ 1 lời cảm ơn 1 lần từ người nhận), không ship ngoài FPT (không thu địa chỉ nhà), không yêu cầu đăng nhập cho khách, không làm app di động native.

---

## 2. ACTORS & PERMISSIONS MATRIX

| Hành động | Khách vãng lai | Người mua (Gifter) | Người nhận (Recipient) | Người bán (Admin) |
| :--- | :---: | :---: | :---: | :---: |
| Xem Landing Page & Quỹ | ✅ | ✅ | ✅ | ✅ |
| Đặt hàng trước 20/10 | ✅ | ✅ | ❌ | ✅ (xem/quản lý) |
| Soạn quà, đặt PIN, sửa nháp | ❌ | ✅ | ❌ | ❌ (không xem/sửa) |
| Bấm "Tặng" (Khóa chỉ xem) | ❌ | ✅ | ❌ | ❌ |
| Mở khóa quà sau khi đã "Tặng" | ❌ | ❌ (phải yêu cầu) | ❌ | ✅ (sau khi xác minh) |
| Quét QR / Nhập PIN mở quà | ❌ | ✅ (xem trước) | ✅ | ❌ (không xem quà khách) |
| Xem quà, nghe/tải nhạc | ❌ | ✅ | ✅ | ❌ |
| Tải bản lưu trữ offline (HTML/media) | ❌ | ✅ | ✅ | ❌ |
| Gửi lời cảm ơn (tối đa 1 lần) | ❌ | ❌ (chỉ nhận qua mail)| ✅ | ❌ |
| Xem mã PIN của khách | ❌ | ❌ (quên phải reset) | ❌ (nhận từ người tặng) | ❌ **(Lưu băm, cấm xem)** |
| In/cấp lại thẻ, gỡ nội dung vi phạm | ❌ | ❌ | ❌ | ✅ |

---

## 3. THẺ QR, MÃ NGẮN & BẢO MẬT PIN

### 3.1. Cấu trúc định danh & Bảo mật
- **Gift ID:** Chuỗi ngẫu nhiên, độ dài cao (UUID/nanoid), không tuần tự, nhúng vào link QR (`https://domain/gift/{gift_id}`).
- **Mã ngắn dự phòng (Shortcode):** 8 ký tự alphanumeric loại trừ ký tự dễ nhầm lẫn (`0/O`, `1/I/l`), dùng nhập tay khi QR mờ/xước.
- **Mã PIN:** 4 chữ số do người mua đặt (tùy chọn).
  - *Lưu trữ:* Bắt buộc băm (Hash: bcrypt/argon2/sha256). Admin tuyệt đối không xem được PIN.
  - *Không in:* Tuyệt đối không in PIN lên thẻ và không ghi PIN trong email gửi link quà.
  - *Cảnh báo:* Nếu bỏ qua PIN, hệ thống cảnh báo công khai: ai có link/thẻ đều xem được quà.
  - *Chống Brute-force:* Nhập sai **5 lần** -> Khóa tạm thời thẻ **15 phút**.
  - *Quên PIN:* Nếu có email -> gửi link reset (hạn 30 phút); nếu không có email -> Admin hỗ trợ reset sau khi đối soát SĐT + Mã đơn.

### 3.2. Phương thức phát hành thẻ (Chọn 1 trong 2 khi đặt hàng)
1. **Phương án B (In theo đơn):** Tạo thẻ với ID ngẫu nhiên -> In thẻ vật lý (QR + mã ngắn) -> Kèm vòng tay giao cho khách.
2. **Phương án C (Gửi qua email):** Bắt buộc nhập & xác nhận email -> Hệ thống gửi ảnh QR, link mở quà, mã ngắn dự phòng qua email. Người mua tự chuyển tiếp hoặc tự in.

### 3.3. Cấp lại thẻ khi mất
- Hủy/khóa thẻ cũ (`Đã thay thế`).
- Tạo thẻ mới với Gift ID mới, chuyển toàn bộ dữ liệu quà sang thẻ mới.

---

## 4. LUỒNG SOẠN QUÀ (NGƯỜI MUA)
> Truy cập bằng cách quét QR trên thẻ hoặc mở link email. Tự động lưu nháp (Auto-save) theo thẻ. Không bắt buộc điền đủ mọi trường (có thể để trống tùy ý).

1. **Chọn đối tượng nhận (5 nhóm):**
   - *Cho nàng*, *Cho chàng*, *Cho mẹ kính yêu*, *Cho bạn thân tri kỷ*, *Cho người tôi thầm thương*.
   - Hiệu ứng: Dấu tim, highlight nền, đổi câu trích dẫn gợi ý tương ứng.
2. **Thông tin định danh:**
   - Ô nhập: *Tên/danh xưng người tặng*, *Tên người nhận*, *Xưng hô* (Anh - Em, Tớ - Cậu...).
   - Tùy chọn: **Ẩn danh người tặng** (Checkbox).
3. **Lời nhắn & Trợ lý AI:**
   - 4 nút chức năng:
     - `AI viết giúp`: Tạo lời nhắn 2–3 câu (tối đa 60 từ).
     - `Gợi ý ý tưởng`: Trả về 3 ý tưởng ngắn -> bấm để bung thành lời nhắn.
     - `Trau chuốt`: Viết lại mượt mà dựa trên nội dung hiện có.
     - `Không để lời nhắn`: Toggle ẩn khung soạn tin, khóa 3 nút AI.
   - **Ràng buộc AI:**
     - Modal đồng ý chia sẻ dữ liệu (tên, xưng hô, văn bản) xuất hiện ở lần bấm đầu tiên. Khách từ chối -> AI đóng, tự viết tay.
     - Giới hạn gọi AI: Tối đa **10 lần/quà** (tránh lạm dụng token/chi phí). Lỗi hiển thị "AI đang bận, vui lòng thử lại".
4. **Lời nhắn giọng nói (Voice Note):**
   - Giới hạn: Tối đa **02:00** phút.
   - UI: Sóng âm 12 vạch, đồng hồ đếm ngược/xuôi. Nút: *Ghi lại* (reset 00:00), *Thu âm / Dừng*, *Nghe thử*. Xin quyền micro trình duyệt lịch sự.
5. **Album ảnh kỷ niệm:**
   - Giới hạn: Tối đa **6 ảnh**, mỗi ảnh nén phía client **< 2MB**.
   - UI: Lưới kiểu Polaroid, có trường nhập Tiêu đề + Ghi chú cho từng ảnh.
6. **Bài nhạc kỷ niệm:**
   - Định dạng: `.mp3` hoặc `.m4a`, dung lượng **<= 10MB**.
   - Pháp lý: Bắt buộc tick chọn *"Tôi có quyền sử dụng tệp nhạc này"* trước khi upload.
   - UI: Nhập tên bài hát, player nghe thử. Người nhận được nghe và **được phép tải về**.
7. **Gắn Charm:**
   - Nếu đơn pre-order: Tự điền charm đã mua.
   - Nếu mua tại quầy: Người mua tự chọn các charm trên vòng để trang hiển thị câu chuyện của từng charm. Bỏ qua -> hiện thông điệp mặc định.
8. **Email nhận thông báo (Tùy chọn):**
   - Nhập email để nhận thông báo: Quà đã mở, lời cảm ơn từ người nhận, nhắc hết hạn (trước 7 ngày), link sao lưu, reset PIN.
9. **Xem trước & Tặng ("Tặng"):**
   - Chế độ xem trước mô phỏng 100% giao diện người nhận.
   - Bấm `Tặng` -> Modal xác nhận *"Sau khi tặng bạn không sửa được nữa"* -> Quà chuyển sang trạng thái **Chỉ đọc (Read-only)**.
   - Cho phép tải Bản lưu trữ offline ngay sau khi hoàn tất.

---

## 5. LUỒNG MỞ QUÀ (NGƯỜI NHẬN)
> Chỉ xem, không có quyền sửa/xóa nội dung hoặc đổi charm.

1. **Quét QR / Nhập mã ngắn:** Mở URL qua trình duyệt mobile.
2. **Xác thực PIN (nếu quà có PIN):** Nhập 4 chữ số. Sai 5 lần -> khóa 15 phút.
3. **Màn hình chờ (Welcome Screen):**
   - Hiển thị tên người tặng (hoặc ẩn danh), danh sách charm, nút CTA **"Chạm để mở quà"**.
   - *Lý do kỹ thuật:* Cần user gesture chạm màn hình để kích hoạt phát nhạc trên mobile (bỏ qua chặn autoplay của Safari/Chrome).
4. **Hiệu ứng mở quà:**
   - Hiệu ứng tim/mở hộp bung ra, nhạc nền tự động phát.
5. **Thứ tự trải nghiệm nội dung:**
   1. Câu chuyện các charm.
   2. Trình phát nhạc kỷ niệm (có nút tạm dừng/tải về).
   3. Lời nhắn văn bản.
   4. Album ảnh Polaroid.
   5. Lời nhắn giọng nói (nghe/tua).
   *(Mục nào người mua bỏ trống -> ẩn hoàn toàn khối đó, không để khoảng trắng).*
6. **Khu vực chân trang & Tương tác kết thúc:**
   - **Gửi lời cảm ơn:** Chỉ hiển thị nếu người mua có cung cấp email. Nhập tự do hoặc chọn mẫu có sẵn. **Chỉ gửi tối đa 1 lần/quà**.
   - **Tải bản lưu trữ offline:** Tải file `.html` standalone kèm media.
   - **Liên kết xã hội:** Nút tìm hiểu về Sân Nhà Nhiều Chó và link về Landing page K&P để mua thêm.

---

## 6. ĐẶT TRƯỚC 20/10 (PRE-ORDER) & THANH TOÁN

### 6.1. Quy tắc bán hàng
- **Thời gian nhận:** Duy nhất ngày **20/10/2026**.
- **Địa điểm:** Chỉ trong khuôn viên trường FPT (Bàn nhận cố định hoặc giao tận phòng/lớp theo ghi chú). **Không thu địa chỉ nhà ngoài trường**.
- **Hạn chót đặt (Deadline):** Trước ngày **18/10/2026**. Sau hạn chót: Đóng nút đặt, không cho hủy/đổi đơn.
- **Sản phẩm:** Vòng tay charm (kèm thẻ QR), Hoa, Thẻ QR rời kèm hoa (tùy chọn). Giá dao động 40.000 – 70.000 VNĐ/món.
- **Giới hạn khung giờ:** Mỗi khung giờ nhận hàng có hạn mức đơn; khi đầy tự ẩn.

### 6.2. Thu thập dữ liệu đơn hàng
- **Bắt buộc:** Tên người nhận, SĐT người đặt, Khung giờ nhận, Cách nhận thẻ QR (In hay Email), Phương thức thanh toán.
- **Tùy chọn:** Ghi chú vị trí trong trường (tòa/phòng), Email người đặt (bắt buộc nếu nhận QR qua email), Checkbox ẩn tên người tặng, Mã PIN 4 chữ số.

### 6.3. Thanh toán
1. **Tiền mặt khi nhận (COD 20/10):** Đơn ghi nhận `Chờ thu tiền`, thu tiền thực tế khi giao.
2. **Chuyển khoản (VietQR):** Hiển thị QR thanh toán kèm mã đơn. Admin đối chiếu thủ công -> Đánh dấu `Đã thanh toán`. Đơn chưa thanh toán trước 18/10 bị **tự động hủy**.
3. **Cổng thanh toán Online:** Tích hợp webhook cập nhật tự động (áp dụng chính sách miễn phí 100 đơn đầu).

### 6.4. State Machine: Đơn hàng & Thanh toán
- **Trạng thái đơn (Order Status):** `Đã đặt` ➔ `Đã xác nhận` ➔ `Đang chuẩn bị` ➔ `Sẵn sàng giao` ➔ `Đã giao` (hoặc `Đã hủy`).
- **Trạng thái thanh toán (Payment Status):** `Chờ thu tiền` / `Chờ chuyển khoản` ➔ `Đã thanh toán` (hoặc `Hoàn tiền`).
- Khách tra cứu tiến độ đơn bằng **Mã đơn hàng + Số điện thoại**.

---

## 7. GÂY QUỸ & MINH BẠCH (SÂN NHÀ NHIỀU CHÓ)
- **Đơn vị thụ hưởng:** Trạm cứu hộ chó mèo Sân Nhà Nhiều Chó (Thanh Oai, Hà Nội). Đã có văn bản/tin nhắn đồng ý chính thức.
- **Công thức tính quỹ:**
  $$\text{Tiền quỹ đơn} = \text{Giá bán} - \text{Giá vốn (COGS)}$$
  *(Giá vốn = Chi phí vòng/hoa + Chi phí in thẻ + Phí cổng thanh toán từ đơn 101 trở đi).*
- **Đơn bị hủy:** Trừ ngược phần tiền đóng góp ra khỏi quỹ.
- **Công khai minh bạch trên Landing page:**
  - Real-time: Tổng doanh thu, Tổng giá vốn, Tổng tiền quỹ tích lũy, Số đơn đóng góp.
  - Sau chiến dịch (hết tháng 10): Công bố biên lai / ảnh chụp chứng từ chuyển khoản toàn bộ số tiền quỹ sang trạm.

---

## 8. QUẢN TRỊ VIÊN (ADMIN DASHBOARD)
- **Bảo mật:** Tách biệt trang khách, có xác thực tài khoản riêng, ghi **Audit Log** toàn bộ thao tác nhạy cảm.
- **Tính năng chính:**
  1. *Quản lý đơn hàng:* Xem/lọc theo khung giờ, trạng thái; xác nhận, hủy đơn, cập nhật thanh toán/giao hàng.
  2. *Phát hành thẻ:* Sinh Gift ID ngẫu nhiên, in thẻ (QR + shortcode) hoặc trigger gửi email QR (Phương án C).
  3. *Tra cứu thẻ:* Tìm theo Mã đơn, Mã ngắn, SĐT. **Không cho phép xem PIN hay nội dung riêng tư**.
  4. *Cấp lại thẻ:* Tạo thẻ mới, liên kết quà cũ, thu hồi thẻ cũ.
  5. *Mở khóa quà:* Cho phép người mua sửa lại quà đã bấm "Tặng" sau khi xác minh danh tính.
  6. *Hỗ trợ đặt lại PIN:* Reset thủ công cho khách không có email (xác minh qua SĐT + Mã đơn).
  7. *Kiểm duyệt & Xử lý vi phạm:* Gỡ thủ công nội dung quà nếu nhận được báo cáo vi phạm bản quyền/thuần phong mỹ tục.
  8. *Quản lý danh mục & Giá vốn:* Thiết lập danh mục hoa, charm, giá bán, giá vốn (COGS), hạn mức đơn theo khung giờ.
  9. *Cập nhật quỹ:* Nhập số liệu đối soát, tải ảnh ủy nhiệm chi/chứng từ chuyển khoản cho Sân Nhà Nhiều Chó.
  10. *Xử lý xóa dữ liệu:* Xóa toàn bộ dữ liệu quà theo yêu cầu GDPR/chính sách quyền riêng tư.

---

## 9. VÒNG ĐỜI TRẠNG THÁI THẺ & QUÀ (LIFECYCLE)

```
[Đã tạo (Created)] 
       │ (Người mua quét QR, đặt PIN)
       ▼
[Đang soạn (Draft)] ─── (Người nhận quét) ───► Hiện "Quà đang chuẩn bị" (ẩn nội dung)
       │ (Người mua bấm "Tặng")
       ▼
[Đã tặng (Gifted/Read-only)] ─── (Người nhận quét) ───► Mở quà xem bình thường
       │                                                      │
       ├─ (Nhập sai PIN 5 lần) ──► [Khóa tạm (15 min)]        │
       ├─ (Mất thẻ / cấp lại)   ──► [Đã thay thế (Revoked)]   │
       ├─ (Hết tháng 10/2026)   ──► [Hết hạn (Expired)] ◄─────┘
       └─ (Yêu cầu / Sau 30 ngày) ──► [Đã xóa (Purged)]
```

---

## 10. BẢO MẬT, QUYỀN RIÊNG TƯ & PHI CHỨC NĂNG

### 10.1. Dữ liệu & Pháp lý (Luật BV Dữ liệu cá nhân 2025 / NĐ 356/2025)
- **Tối thiểu hóa dữ liệu (Data Minimization):** Không thu địa chỉ nhà, không ép tạo tài khoản.
- **Thời hạn lưu giữ:**
  - Tên & SĐT người đặt: Xóa sau 30 ngày kể từ khi kết thúc đợt giao 20/10.
  - Lời nhắn, ảnh, giọng nói, nhạc, PIN (hash): Xóa sau khi hết hạn web (trong vòng 30 ngày sau 31/10/2026).
  - Nhật ký truy cập (Access Logs): Lưu 30 ngày.
- **Quyền người dùng:** Quyền yêu cầu xóa dữ liệu, quyền rút lại sự đồng ý nhận email thông qua form liên hệ.

### 10.2. Bản lưu trữ Offline (Offline Export)
- Gồm: Lời nhắn chữ (text), Voice note (`.mp3/.wav`), Album ảnh (nén), Nhạc cá nhân (`.mp3/.m4a`) và 1 file **`index.html` tự chứa (standalone)** có thể mở xem trên trình duyệt mà không cần internet/server.

### 10.3. Ràng buộc kỹ thuật & Phi chức năng
- **Mobile-first:** Ưu tiên Safari iOS và Chrome Android, màn hình chuẩn từ **360px**.
- **Hiệu năng:** Tải nội dung chính < 3 giây trên kết nối 4G. Tải ảnh lazy-load, chỉ phát nhạc/giọng nói khi đã tải đủ buffer.
- **Giới hạn tài nguyên (Tránh vượt Free Tier):**
  - Ảnh: Max 6 ảnh, < 2MB/ảnh.
  - Voice: Max 2 phút.
  - Nhạc: Max 10MB.
  - Lượt gọi AI: Max 10 lượt/quà.
- **Bảo mật:** Toàn bộ trang chạy HTTPS; Link gửi email có hạn dùng (expirable token); Mã PIN băm an toàn; Chặn brute-force IP/Card ID.
- **Ngôn ngữ:** Tiếng Việt có dấu, font hỗ trợ đầy đủ UTF-8 Unicode.
