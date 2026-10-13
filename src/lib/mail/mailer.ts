import nodemailer from "nodemailer";

interface SendActivationEmailParams {
  customerName: string;
  customerEmail: string;
  token: string;
  creatorKey: string;
  /** Omitted when resending: the PIN is hashed and may already be printed on the physical card. */
  unlockPin?: string;
  chainName: string;
  siteUrl?: string;
}

// Customer-supplied text goes into an HTML email, so escape it.
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function sendGiftActivationEmail({
  customerName,
  customerEmail,
  token,
  creatorKey,
  unlockPin,
  chainName,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
}: SendActivationEmailParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const activationUrl = `${siteUrl}/gift?token=${token}`;
  const safeName = escapeHtml(customerName);
  const safeChainName = escapeHtml(chainName);

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã Thiệp & OTP Tạo Thiệp 20/10 — K&P Atelier</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fceae6; font-family: 'Merriweather', Georgia, serif; color: #443a36;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fceae6; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 45px rgba(84, 1, 20, 0.12); border: 1px solid #ffd8d2;">
          
          <!-- Atelier Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #721a28 0%, #540114 50%, #30010c 100%); padding: 36px 30px; text-align: center;">
              <span style="display: inline-block; padding: 5px 14px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 215, 0, 0.5); border-radius: 50px; font-size: 11px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-bottom: 12px;">
                ✦ K&amp;P ATELIER • 20 THÁNG 10
              </span>
              <h1 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: -0.5px; line-height: 1.3;">
                Bộ 2 Mã Kích Hoạt Quà Tặng Số
              </h1>
              <p style="margin: 8px 0 0 0; color: #fed7d7; font-size: 13px;">
                1 mã để bạn thiết kế thiệp — 1 mã trao người thương mở quà
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #2e1d1b;">
                Thân gửi <strong>${safeName}</strong>,
              </p>
              <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.6; color: #564243;">
                Cảm ơn bạn đã lựa chọn món quà thủ công tại quầy <strong>K&amp;P Atelier</strong> (ĐH FPT). Dưới đây là <strong>mã thiệp và 2 mã OTP riêng biệt</strong> để bạn thiết kế thiệp và trao tặng cho người nhận:
              </p>

              <!-- Order Summary Card -->
              <table role="presentation" width="100%" style="background-color: #fff6f7; border-radius: 18px; border: 1px solid #ffd6dc; padding: 18px; margin-bottom: 25px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #721a28; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                      ✦ Thông tin vòng tay tại quầy
                    </span>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #3d2c2b;">
                      <strong>Mã thiệp:</strong> <span style="font-family: monospace; font-weight: bold; color: #540114;">${token}</span>
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #3d2c2b;">
                      <strong>Dây vòng:</strong> ${safeChainName}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- 2 Separate Security Codes Grid -->
              <table role="presentation" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <!-- CODE 1: Creator Key (For Buyer) -->
                  <td width="48%" style="background: #fff8f5; border: 2px dashed #934841; border-radius: 18px; padding: 18px; text-align: center; vertical-align: top;">
                    <span style="font-size: 11px; font-weight: bold; color: #721a28; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                      ✍️ OTP TẠO THIỆP
                    </span>
                    <span style="font-size: 10px; color: #765e55; display: block; margin-bottom: 10px;">
                      (Dành riêng cho bạn - Người mua)
                    </span>
                    <div style="background-color: #540114; color: #ffd700; font-family: monospace; font-size: 20px; font-weight: bold; padding: 8px 14px; border-radius: 10px; border: 1px solid #ffd700;">
                      ${creatorKey}
                    </div>
                    <span style="font-size: 10.5px; color: #897172; display: block; margin-top: 8px; line-height: 1.4;">
                      Nhập cùng mã thiệp tại <strong>/gift</strong> để tự tay thiết kế thư tay, ảnh &amp; voice note.
                    </span>
                  </td>

                  <td width="4%">&nbsp;</td>

                  <!-- CODE 2: Unlock PIN (For Recipient) -->
                  <td width="48%" style="background: #f7faf7; border: 2px dashed #2e7d32; border-radius: 18px; padding: 18px; text-align: center; vertical-align: top;">
                    <span style="font-size: 11px; font-weight: bold; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                      🎁 OTP XEM THIỆP
                    </span>
                    <span style="font-size: 10px; color: #765e55; display: block; margin-bottom: 10px;">
                      (Dành cho Người nhận xem thiệp)
                    </span>
                    <div style="background-color: #1b5e20; color: #ffffff; font-family: monospace; font-size: 20px; font-weight: bold; padding: 8px 14px; border-radius: 10px; border: 1px solid #81c784;">
                      ${unlockPin ?? "Đã in trên thẻ"}
                    </div>
                    <span style="font-size: 10.5px; color: #897172; display: block; margin-top: 8px; line-height: 1.4;">
                      In kèm thẻ nhung trao cho người nhận để mở thiệp 3D.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- 1-Click CTA Button -->
              <table role="presentation" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${activationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #721a28 0%, #934841 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 16px 36px; border-radius: 50px; box-shadow: 0 8px 24px rgba(114, 26, 40, 0.35); text-transform: uppercase; letter-spacing: 1px;">
                      ⚡ Vào Trang Tạo Thiệp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Step-by-step Guide -->
              <div style="background-color: #faf5eb; border-radius: 16px; padding: 18px 20px; border: 1px solid #ebd9c8;">
                <span style="font-size: 12px; font-weight: bold; color: #540114; display: block; margin-bottom: 10px;">
                  📝 Hướng dẫn dùng mã thiệp và 2 OTP:
                </span>
                <ol style="margin: 0; padding-left: 20px; font-size: 12.5px; line-height: 1.7; color: #564243;">
                  <li><strong>Bạn (Người mua):</strong> Truy cập <strong>${siteUrl}/gift</strong>, nhập Mã thiệp (${token}) và OTP tạo thiệp (${creatorKey}).</li>
                  <li><strong>Thiết kế:</strong> Tải ảnh Polaroid, ghi âm thì thầm và chọn template thiệp yêu thích.</li>
                  <li><strong>Người nhận:</strong> Khi nhận được vòng và thẻ quà tặng, vào <strong>${siteUrl}</strong> (trang chủ), nhập Mã thiệp và OTP xem thiệp${unlockPin ? ` (${unlockPin})` : " in trên thẻ"} để chiêm ngưỡng cuốn thiệp 3D!</li>
                </ol>
              </div>

              <p style="margin: 25px 0 0 0; font-size: 12px; color: #8c736e; text-align: center; line-height: 1.5;">
                Nếu gặp bất kỳ khó khăn nào, vui lòng liên hệ nhân viên trực quầy K&amp;P Atelier hoặc nhắn tin fanpage.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf5f3; padding: 20px 30px; text-align: center; border-top: 1px solid #f0e0dc;">
              <p style="margin: 0; font-size: 11px; color: #897172;">
                © 2026 K&amp;P Atelier • Dự án gây quỹ Trạm Cứu Hộ Sân Nhà Nhiều Chó
              </p>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #b39b98;">
                Đại học FPT • Hotline hỗ trợ: 0900-KP-ATELIER
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Check if SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_FROM || `"K&P Atelier" <${smtpUser}>`,
        to: customerEmail,
        subject: `[K&P Atelier] Mã thiệp & OTP tạo thiệp 20/10: ${token}`,
        html: htmlContent,
      });

      return { success: true };
    } catch (err: any) {
      console.error("[Mailer] SMTP Send Error:", err);
      return { success: false, error: err.message };
    }
  }

  // Fallback: Simulated mode for local development
  console.log(`\n======================================================`);
  console.log(`[MAILER SIMULATION] To: ${customerEmail}`);
  console.log(`[MAILER SIMULATION] Mã thiệp: ${token}`);
  // Codes are only echoed outside production so secrets never end up in production logs.
  const reveal = process.env.NODE_ENV !== "production";
  console.log(`[MAILER SIMULATION] OTP tạo thiệp (Người Mua): ${reveal ? creatorKey : "(hidden)"}`);
  console.log(`[MAILER SIMULATION] OTP xem thiệp (Người Nhận): ${reveal ? (unlockPin ?? "(unchanged)") : "(hidden)"}`);
  console.log(`[MAILER SIMULATION] Trang tạo thiệp: ${activationUrl}`);
  console.log(`======================================================\n`);

  return {
    success: true,
    simulated: true,
  };
}
