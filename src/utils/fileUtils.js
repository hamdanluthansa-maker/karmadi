import { isCloudinaryConfigured, uploadImageToCloudinary } from '../services/cloudinaryService';

/**
 * Mengubah file gambar menjadi URL permanen (Cloudinary HTTPS URL jika terkonfigurasi,
 * atau Base64 terkompresi efisien jika offline/tanpa Cloudinary).
 */
export async function fileToPersistentDataUrl(file) {
  if (!file) {
    return '/assets/logo-karmadi.png';
  }

  // Jika sudah berupa path statis atau URL web online
  if (typeof file === 'string') {
    if (file.startsWith('blob:')) {
      return '/assets/logo-karmadi.png';
    }
    // Jika sudah berupa Cloudinary URL atau HTTPS URL
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return file;
    }
    // Jika sudah berupa data base64 dan Cloudinary aktif, unggah langsung ke Cloudinary
    if (file.startsWith('data:image/') && isCloudinaryConfigured()) {
      const res = await uploadImageToCloudinary(file);
      if (res.success && res.url) {
        return res.url;
      }
    }
    return file;
  }

  // Jika Cloudinary sudah dikonfigurasi, prioritaskan upload langsung ke Cloud
  if (isCloudinaryConfigured()) {
    try {
      const res = await uploadImageToCloudinary(file);
      if (res.success && res.url) {
        return res.url;
      }
    } catch (err) {
      console.warn('Gagal upload langsung ke Cloudinary, fallback ke kompresi lokal:', err);
    }
  }

  // Fallback kompresi lokal berkualitas tinggi namun hemat memori (maxDim: 800px, quality: 0.75)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // Ukuran optimal untuk kartu loker & modal tanpa boros kuota

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Simpan sebagai JPEG efisien 0.75
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compress error:', err);
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve('/assets/logo-karmadi.png');
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('/assets/logo-karmadi.png');
    reader.readAsDataURL(file);
  });
}
