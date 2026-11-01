/**
 * Region Utilities — Pengelompokan & Filter Wilayah Karesidenan Madiun
 * Cakupan:
 * 1. Kota Madiun
 * 2. Kab. Madiun
 * 3. Magetan
 * 4. Ngawi
 * 5. Ponorogo
 * 6. Pacitan
 * 7. Luar Kota Lain (Luar Karesidenan Madiun)
 */

export const WILAYAH_OPTIONS = [
  { id: 'all', label: 'Semua Wilayah', value: '' },
  { id: 'kota_madiun', label: 'Kota Madiun', value: 'Kota Madiun' },
  { id: 'kab_madiun', label: 'Kab. Madiun', value: 'Kab. Madiun' },
  { id: 'magetan', label: 'Magetan', value: 'Magetan' },
  { id: 'ngawi', label: 'Ngawi', value: 'Ngawi' },
  { id: 'ponorogo', label: 'Ponorogo', value: 'Ponorogo' },
  { id: 'pacitan', label: 'Pacitan', value: 'Pacitan' },
  { id: 'luar_kota', label: 'Luar Kota Lain', value: 'Luar Kota Lain' },
];

export const WILAYAH_NAMES = [
  'Kota Madiun',
  'Kab. Madiun',
  'Magetan',
  'Ngawi',
  'Ponorogo',
  'Pacitan',
  'Luar Kota Lain',
];

/**
 * Mendeteksi secara cerdas wilayah dari teks alamat / penempatan
 */
export function detectWilayah(lokasiText = '', syaratList = []) {
  const combined = `${lokasiText} ${(Array.isArray(syaratList) ? syaratList.join(' ') : syaratList)}`.toLowerCase();

  // 1. Pacitan
  if (
    combined.includes('pacitan') ||
    combined.includes('donorojo') ||
    combined.includes('punung') ||
    combined.includes('arjosari')
  ) {
    return 'Pacitan';
  }

  // 2. Ponorogo
  if (
    combined.includes('ponorogo') ||
    combined.includes('babadan') ||
    combined.includes('jenangan') ||
    combined.includes('siman')
  ) {
    return 'Ponorogo';
  }

  // 3. Ngawi
  if (
    combined.includes('ngawi') ||
    combined.includes('geneng') ||
    combined.includes('paron') ||
    combined.includes('jogorogo') ||
    combined.includes('kendal ngawi')
  ) {
    return 'Ngawi';
  }

  // 4. Magetan
  if (
    combined.includes('magetan') ||
    combined.includes('maospati') ||
    combined.includes('plaosan') ||
    combined.includes('kawedanan')
  ) {
    return 'Magetan';
  }

  // 5. Kab. Madiun (Caruban, Mejayan, Saradan, Jiwan, Balerejo, Dolopo, Geger, Dagangan, dll)
  if (
    combined.includes('kab. madiun') ||
    combined.includes('kabupaten madiun') ||
    combined.includes('caruban') ||
    combined.includes('mejayan') ||
    combined.includes('balerejo') ||
    combined.includes('saradan') ||
    combined.includes('dolopo') ||
    combined.includes('geger') ||
    combined.includes('dagangan')
  ) {
    return 'Kab. Madiun';
  }

  // 6. Kota Madiun
  if (
    combined.includes('kota madiun') ||
    combined.includes('suncity') ||
    combined.includes('pahlawan') ||
    combined.includes('h.a. salim') ||
    combined.includes('ha salim') ||
    combined.includes('manguharjo') ||
    combined.includes('taman') ||
    combined.includes('kartoharjo') ||
    combined.includes('madiun')
  ) {
    return 'Kota Madiun';
  }

  // 7. Jika alamat secara spesifik menunjukkan luar Karesidenan Madiun
  if (
    combined.includes('tangerang') ||
    combined.includes('jakarta') ||
    combined.includes('surabaya') ||
    combined.includes('solo') ||
    combined.includes('semarang') ||
    combined.includes('jogja') ||
    combined.includes('bandung') ||
    combined.includes('malang') ||
    combined.includes('kediri')
  ) {
    return 'Luar Kota Lain';
  }

  // Default fallback untuk platform Karmadi
  return 'Kota Madiun';
}

/**
 * Mengecek apakah sebuah loker cocok dengan filter wilayah terpilih
 */
export function jobMatchesWilayah(job, targetWilayah) {
  if (!targetWilayah) return true;

  const jobWilayah = job.wilayah || detectWilayah(job.lokasi, job.syarat);

  // Jika cocok langsung dengan wilayah terdaftar
  if (jobWilayah === targetWilayah) return true;

  // Mendukung multi-penempatan (misal loker yang memiliki cabang di beberapa kota se-karesidenan)
  const fullText = `${job.lokasi || ''} ${(Array.isArray(job.syarat) ? job.syarat.join(' ') : '')}`.toLowerCase();

  if (targetWilayah === 'Kota Madiun' && (fullText.includes('kota madiun') || fullText.includes('suncity') || fullText.includes('madiun'))) return true;
  if (targetWilayah === 'Kab. Madiun' && (fullText.includes('kab. madiun') || fullText.includes('caruban') || fullText.includes('mejayan'))) return true;
  if (targetWilayah === 'Magetan' && fullText.includes('magetan')) return true;
  if (targetWilayah === 'Ngawi' && fullText.includes('ngawi')) return true;
  if (targetWilayah === 'Ponorogo' && fullText.includes('ponorogo')) return true;
  if (targetWilayah === 'Pacitan' && fullText.includes('pacitan')) return true;

  if (targetWilayah === 'Luar Kota Lain') {
    // True jika loker bukan bagian dari Karesidenan Madiun
    const isMadiunRaya =
      fullText.includes('madiun') ||
      fullText.includes('magetan') ||
      fullText.includes('ngawi') ||
      fullText.includes('ponorogo') ||
      fullText.includes('pacitan');
    return !isMadiunRaya || jobWilayah === 'Luar Kota Lain';
  }

  return false;
}
