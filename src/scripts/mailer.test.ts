import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl, sendGiftSurpriseRecipientEmail, sendGiftActivationEmail } from "../lib/mail/mailer.ts";

test("resolveSiteUrl falls back to localhost when no env is set", () => {
  const url = resolveSiteUrl();
  assert.ok(url.startsWith("http"));
});

test("sendGiftSurpriseRecipientEmail executes successfully in simulation mode", async () => {
  const res = await sendGiftSurpriseRecipientEmail({
    recipientEmail: "test.recipient@example.com",
    recipientName: "Em Bé",
    senderName: "Anh Người Yêu",
    token: "KP-2010-TEST",
    unlockPin: "2010",
    requirePin: true,
    customMessage: "Món quà bí mật dành cho em!",
    siteUrl: "https://kp-atelier.vn",
  });

  assert.equal(res.success, true);
  assert.equal(res.simulated, true);
});

test("sendGiftSurpriseRecipientEmail handles direct open without PIN", async () => {
  const res = await sendGiftSurpriseRecipientEmail({
    recipientEmail: "test.recipient@example.com",
    recipientName: "Bạn Thân",
    token: "KP-2010-DIRECT",
    requirePin: false,
    siteUrl: "https://kp-atelier.vn",
  });

  assert.equal(res.success, true);
  assert.equal(res.simulated, true);
});

test("sendGiftActivationEmail executes successfully without initial unlockPin", async () => {
  const res = await sendGiftActivationEmail({
    customerEmail: "customer@example.com",
    customerName: "Khách Mua",
    token: "KP-2010-NEW",
    creatorKey: "TAO-TEST1234",
    chainName: "Dây Bạc Charm Hoa",
    siteUrl: "https://kp-atelier.vn",
  });

  assert.equal(res.success, true);
  assert.equal(res.simulated, true);
});
