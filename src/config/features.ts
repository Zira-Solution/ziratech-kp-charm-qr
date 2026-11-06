// Feature switches for the admin. Change a value here and redeploy to apply it.

/**
 * Sends the activation e-mail (creator key + card code) to the buyer.
 * While false:
 *  - the "gửi lại email" button in the admin is disabled and the API refuses (no key is re-issued),
 *  - creating a bracelet still works but sends nothing; the codes are shown to staff instead.
 * Set to true to turn e-mail back on (SMTP must be configured).
 */
export const EMAIL_SENDING_ENABLED = false;

export const EMAIL_DISABLED_MESSAGE = "Đang tạm tắt gửi email. Bật lại bằng EMAIL_SENDING_ENABLED trong src/config/features.ts.";
