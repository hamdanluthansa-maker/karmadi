import jsQR from 'jsqr';

/**
 * Scanner Barcode & QR Code Multi-Pass Khusus Poster Lowongan Kerja (KARMADI)
 *
 * Masalah umum pada poster loker:
 * Ukuran QR Code di pojok poster seringkali kecil (hanya 10%-20% dari total luas poster)
 * atau menggunakan warna non-hitam-putih, sehingga pemindaian 1x gambar penuh sering gagal.
 *
 * Solusi Multi-Pass Engine ini:
 * 1. Native Browser BarcodeDetector API (jika didukung browser).
 * 2. Full-Image Scan via jsQR (normal + inverted).
 * 3. Smart Multi-Region Tiling (Pojok Kanan Bawah, Kiri Bawah, Tengah Bawah, Kanan Atas,
 *    Kiri Atas, Tengah, serta Grid 3x3) dengan pembesaran resolusi (upscaling).
 * 4. High-Contrast Binarization Pass untuk membaca QR Code berwarna/kontras rendah.
 */

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Normalisasi hasil teks barcode menjadi URL pendaftaran yang valid
 */
export function normalizeBarcodePayload(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  let url = '';
  let isWhatsAppUrl = false;
  let waNumber = '';

  // 1. Jika sudah diawali http:// atau https://
  if (/^https?:\/\//i.test(trimmed)) {
    url = trimmed;
  }
  // 2. Jika berupa shortlink / domain populer tanpa https:// (bit.ly, forms.gle, s.id, docs.google.com, dll)
  else if (
    /^(www\.|bit\.ly\/|forms\.gle\/|docs\.google\.com\/|s\.id\/|linktr\.ee\/|tinyurl\.com\/|tiny\.cc\/|gg\.gg\/|rebrand\.ly\/|wa\.me\/)/i.test(
      trimmed
    )
  ) {
    url = `https://${trimmed}`;
  }
  // 3. Jika di dalam teks terdapat URL (misal: "Daftar di: https://forms.gle/xyz")
  else {
    const urlMatch = trimmed.match(/(https?:\/\/[^\s"'<>]+)/i);
    if (urlMatch) {
      url = urlMatch[1];
    } else {
      const shortMatch = trimmed.match(
        /((?:bit\.ly|forms\.gle|s\.id|linktr\.ee|tinyurl\.com|docs\.google\.com\/forms)\/[^\s"'<>]+)/i
      );
      if (shortMatch) {
        url = `https://${shortMatch[1]}`;
      }
    }
  }

  // Cek apakah URL tersebut adalah link WhatsApp (wa.me atau api.whatsapp.com)
  if (url && /wa\.me\/|whatsapp\.com/i.test(url)) {
    isWhatsAppUrl = true;
    const phoneMatch = url.match(/(?:wa\.me\/|phone=)(\+?\d{9,15})/i);
    if (phoneMatch) {
      waNumber = phoneMatch[1].replace(/^\+/, '');
    }
  }

  return {
    rawValue: trimmed,
    url: url || (trimmed.includes('.') && !trimmed.includes(' ') ? `https://${trimmed}` : ''),
    isWhatsAppUrl,
    waNumber,
  };
}

/**
 * Terapkan filter peningkatan kontras (Thresholding) pada ImageData
 * agar QR code berwarna (misal biru tua di atas kuning/abu-abu) menjadi tajam hitam-putih
 */
function applyHighContrastThreshold(imageData, threshold = 140) {
  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    // Luminance standar
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const val = lum < threshold ? 0 : 255;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Mencoba memindai potongan area (crop region) dari gambar menggunakan jsQR
 */
function scanRegionWithJsQR(img, canvas, ctx, sx, sy, sw, sh, targetSize = 700) {
  if (sw <= 10 || sh <= 10) return null;

  const aspect = sw / sh;
  let dw = targetSize;
  let dh = targetSize;
  if (aspect > 1) {
    dh = Math.round(targetSize / aspect);
  } else {
    dw = Math.round(targetSize * aspect);
  }

  canvas.width = dw;
  canvas.height = dh;

  // Gambar dengan smoothing mati agar tepi piksel QR Code tetap tajam
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, dw, dh);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

  const imgData = ctx.getImageData(0, 0, dw, dh);

  // 1. Coba pindai langsung (normal & inverted)
  const code = jsQR(imgData.data, dw, dh, {
    inversionAttempts: 'attemptBoth',
  });
  if (code && code.data && code.data.trim()) {
    return code.data.trim();
  }

  // 2. Coba dengan High-Contrast Thresholding (135 & 170) untuk QR Code berwarna
  for (const thresh of [135, 175, 100]) {
    const contrasted = applyHighContrastThreshold(imgData, thresh);
    const codeContrast = jsQR(contrasted.data, dw, dh, {
      inversionAttempts: 'attemptBoth',
    });
    if (codeContrast && codeContrast.data && codeContrast.data.trim()) {
      return codeContrast.data.trim();
    }
  }

  return null;
}

/**
 * Fungsi Utama: Memindai QR Code / Barcode dari Gambar Poster Loker
 * @param {string} imageDataUrl Data URL atau URL gambar poster
 * @returns {Promise<{found: boolean, url: string, rawValue: string, isWhatsAppUrl: boolean, waNumber: string, region: string}>}
 */
export async function scanQrAndBarcodeFromImage(imageDataUrl) {
  const emptyResult = {
    found: false,
    url: '',
    rawValue: '',
    isWhatsAppUrl: false,
    waNumber: '',
    region: '',
  };

  if (!imageDataUrl || typeof window === 'undefined') {
    return emptyResult;
  }

  try {
    const img = await loadImageElement(imageDataUrl);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    if (!w || !h) return emptyResult;

    // ════════════════════════════════════════════════════════════════
    // PASS 1: Native Browser BarcodeDetector API (Jika Tersedia)
    // ════════════════════════════════════════════════════════════════
    if ('BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({
          formats: ['qr_code', 'aztec', 'data_matrix', 'pdf417', 'code_128'],
        });
        const barcodes = await detector.detect(img);
        if (barcodes && barcodes.length > 0) {
          for (const bc of barcodes) {
            const parsed = normalizeBarcodePayload(bc.rawValue);
            if (parsed && (parsed.url || parsed.rawValue)) {
              return {
                found: true,
                ...parsed,
                region: 'Native BarcodeDetector',
              };
            }
          }
        }
      } catch (nativeErr) {
        // Lanjut ke jsQR multi-region jika native BarcodeDetector gagal
      }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // ════════════════════════════════════════════════════════════════
    // PASS 2: Daftar Area Prioritas Poster Loker (Dari Paling Sering)
    // ════════════════════════════════════════════════════════════════
    // Pada poster loker, QR Code 90% berada di area bawah (Kanan Bawah, Kiri Bawah, Tengah Bawah)
    const regions = [
      // 1. Gambar Penuh (Resolusi Standar & Tinggi)
      { name: 'Full Poster (900px)', sx: 0, sy: 0, sw: w, sh: h, size: 900 },
      { name: 'Full Poster (1400px)', sx: 0, sy: 0, sw: w, sh: h, size: 1400 },

      // 2. Bagian Bawah Poster (Half Bottom & Third Bottom)
      { name: 'Paruh Bawah Poster', sx: 0, sy: h * 0.45, sw: w, sh: h * 0.55, size: 900 },
      { name: 'Sepertiga Bawah Poster', sx: 0, sy: h * 0.6, sw: w, sh: h * 0.4, size: 900 },

      // 3. Empat Kuadran Utama (Zoomed In)
      { name: 'Pojok Kanan Bawah', sx: w * 0.45, sy: h * 0.45, sw: w * 0.55, sh: h * 0.55, size: 800 },
      { name: 'Pojok Kiri Bawah', sx: 0, sy: h * 0.45, sw: w * 0.55, sh: h * 0.55, size: 800 },
      { name: 'Tengah Bawah', sx: w * 0.2, sy: h * 0.5, sw: w * 0.6, sh: h * 0.5, size: 800 },
      { name: 'Pojok Kanan Atas', sx: w * 0.45, sy: 0, sw: w * 0.55, sh: h * 0.55, size: 800 },
      { name: 'Pojok Kiri Atas', sx: 0, sy: 0, sw: w * 0.55, sh: h * 0.55, size: 800 },
      { name: 'Area Tengah Poster', sx: w * 0.15, sy: h * 0.2, sw: w * 0.7, sh: h * 0.6, size: 800 },

      // 4. Deep Zoom Pojok Ekstrem (Untuk QR Code berukuran sangat kecil di sudut poster)
      { name: 'Sudut Kanan Bawah (Zoom)', sx: w * 0.6, sy: h * 0.65, sw: w * 0.4, sh: h * 0.35, size: 700 },
      { name: 'Sudut Kiri Bawah (Zoom)', sx: 0, sy: h * 0.65, sw: w * 0.4, sh: h * 0.35, size: 700 },
      { name: 'Sudut Tengah Bawah (Zoom)', sx: w * 0.3, sy: h * 0.65, sw: w * 0.4, sh: h * 0.35, size: 700 },
    ];

    // Tambahkan Grid 3x3 Overlapping untuk menyapu seluruh bagian poster tanpa celah
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const sx = Math.max(0, col * (w * 0.3) - w * 0.05);
        const sy = Math.max(0, row * (h * 0.3) - h * 0.05);
        const sw = Math.min(w - sx, w * 0.45);
        const sh = Math.min(h - sy, h * 0.45);
        regions.push({
          name: `Grid [${row + 1},${col + 1}]`,
          sx,
          sy,
          sw,
          sh,
          size: 700,
        });
      }
    }

    for (const reg of regions) {
      const rawDetected = scanRegionWithJsQR(
        img,
        canvas,
        ctx,
        reg.sx,
        reg.sy,
        reg.sw,
        reg.sh,
        reg.size
      );

      if (rawDetected) {
        const parsed = normalizeBarcodePayload(rawDetected);
        if (parsed && (parsed.url || parsed.rawValue)) {
          return {
            found: true,
            ...parsed,
            region: reg.name,
          };
        }
      }
    }

    return emptyResult;
  } catch (err) {
    console.warn('Gagal memindai QR/Barcode dari gambar:', err);
    return emptyResult;
  }
}
