/**
 * Service Integrasi Cloudinary untuk KARMADI
 * Menyimpan gambar poster lowongan kerja di cloud storage gratis Cloudinary
 * sehingga database jobs.json menyusut drastis dari 9.1 MB menjadi ~30 KB.
 */

const CLOUDINARY_STORAGE_KEY = 'karmadi_cloudinary_config_v1';

export function getCloudinaryConfig() {
  if (typeof window === 'undefined') {
    return { cloudName: '', uploadPreset: '' };
  }
  try {
    const stored = localStorage.getItem(CLOUDINARY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.cloudName && parsed.uploadPreset) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Gagal membaca config Cloudinary:', e);
  }

  // Fallback ke Vite env jika tersedia
  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  };
}

export function saveCloudinaryConfig(cloudName, uploadPreset) {
  if (typeof window === 'undefined') return;
  const config = {
    cloudName: (cloudName || '').trim(),
    uploadPreset: (uploadPreset || '').trim(),
    updatedAt: Date.now(),
  };
  localStorage.setItem(CLOUDINARY_STORAGE_KEY, JSON.stringify(config));
  return config;
}

export function isCloudinaryConfigured() {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  return Boolean(cloudName && uploadPreset);
}

/**
 * Optimalkan URL Cloudinary agar otomatis menggunakan format WebP dan kompresi cerdas
 * Contoh: https://res.cloudinary.com/demo/image/upload/sample.jpg
 * -> https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1000,c_limit/sample.jpg
 */
export function optimizeCloudinaryUrl(url, maxWidth = 1000) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return url;
  }
  if (url.includes('/f_auto,q_auto')) {
    return url;
  }
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${maxWidth},c_limit/`);
}

/**
 * Unggah gambar (File objek atau string Base64 Data URL) ke Cloudinary
 */
export async function uploadImageToCloudinary(fileOrDataUrl) {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    return {
      success: false,
      error: 'Konfigurasi Cloudinary belum diatur (Cloud Name & Upload Preset kosong).',
      url: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '',
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', fileOrDataUrl);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'karmadi/posters');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${res.status}: Gagal mengunggah gambar`);
    }

    const data = await res.json();
    const secureUrl = optimizeCloudinaryUrl(data.secure_url || data.url);

    return {
      success: true,
      url: secureUrl,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan saat mengunggah ke Cloudinary.',
      url: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '',
    };
  }
}

/**
 * Migrasikan seluruh loker yang masih menyimpan Base64 poster ke Cloudinary secara bertahap
 */
export async function migrateJobsPostersToCloudinary(jobs, onProgress) {
  if (!Array.isArray(jobs) || !isCloudinaryConfigured()) {
    return { updatedJobs: jobs, migratedCount: 0, failedCount: 0 };
  }

  const updatedJobs = [];
  let migratedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = { ...jobs[i] };
    const poster = job.poster_url;

    // Hanya upload jika berupa Base64 (data:image/...)
    if (poster && typeof poster === 'string' && poster.startsWith('data:image/')) {
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: jobs.length,
          posisi: job.posisi,
          perusahaan: job.nama_perusahaan,
        });
      }

      const res = await uploadImageToCloudinary(poster);
      if (res.success && res.url) {
        job.poster_url = res.url;
        migratedCount++;
      } else {
        failedCount++;
      }
    }

    updatedJobs.push(job);
  }

  return { updatedJobs, migratedCount, failedCount };
}
