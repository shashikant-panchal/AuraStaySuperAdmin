/**
 * Aggressively compresses and resizes an uploaded image into a compact WebP/JPEG
 * Data URL (target <= 22 KB) to minimize Supabase Free Plan storage and bandwidth.
 */
export function compressLogoImageFile(file, maxDim = 180, maxBytes = 22 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const encodeWithBudget = (mimeType) => {
          for (let q = 0.72; q >= 0.32; q -= 0.1) {
            const url = canvas.toDataURL(mimeType, Number(q.toFixed(2)));
            if (url.length <= maxBytes * 1.37) {
              return url;
            }
          }
          return canvas.toDataURL(mimeType, 0.3);
        };

        const webpUrl = encodeWithBudget('image/webp');
        if (webpUrl.startsWith('data:image/webp')) {
          resolve(webpUrl);
          return;
        }
        resolve(encodeWithBudget('image/jpeg'));
      };
      img.onerror = () => resolve(resultStr);
      img.src = resultStr;
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
