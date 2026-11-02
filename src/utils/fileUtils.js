/**
 * Mengubah file gambar menjadi Data URL Base64 yang dikompres berkualitas tinggi
 * agar tersimpan permanen di localStorage dan TIDAK PERNAH RUSAK saat reload!
 */
export async function fileToPersistentDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve('/assets/logo-karmadi.png');
      return;
    }

    // Jika sudah berupa path statis (seperti /assets/...) atau data:
    if (typeof file === 'string') {
      if (file.startsWith('blob:')) {
        resolve('/assets/logo-karmadi.png');
      } else {
        resolve(file);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Resolusi 1080px tajam dan jernih, tetap efisien untuk localStorage
          const maxDim = 1080;

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

          // Simpan sebagai JPEG berkualitas tinggi (0.85)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
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
