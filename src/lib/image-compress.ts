/**
 * Shrinks a photo in the browser so it can be stored inside the card.
 * Longest side is capped, the image is re-encoded as JPEG, and quality/size are lowered step by step
 * until the data URL fits `maxChars` (the server rejects anything larger than its own limit).
 */
export async function compressImageToDataUrl(file: File, maxChars = 250_000): Promise<string> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("Không đọc được ảnh này. Hãy chọn ảnh JPEG, PNG hoặc WebP.");

  try {
    let maxSide = 1280;
    let quality = 0.82;

    for (let attempt = 0; attempt < 12; attempt++) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");
      ctx.fillStyle = "#ffffff"; // JPEG has no transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const url = canvas.toDataURL("image/jpeg", quality);
      if (url.length <= maxChars) return url;

      if (quality > 0.55) {
        quality -= 0.1;
      } else {
        quality = 0.7;
        maxSide = Math.round(maxSide * 0.8);
      }
      if (maxSide < 320) break;
    }
    throw new Error("Không nén được ảnh xuống dung lượng cho phép. Hãy chọn ảnh khác.");
  } finally {
    bitmap.close();
  }
}
