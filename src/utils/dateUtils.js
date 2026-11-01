/**
 * Utility Pengelolaan Tanggal & Masa Tayang Lowongan (Karmadi)
 */

export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Menambahkan jumlah bulan ke tanggal (default 1 bulan / 30 hari maks postingan)
 */
export function addMonths(dateStr, months = 1) {
  if (!dateStr) dateStr = getTodayDateString();
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() + months);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Menambahkan hari ke tanggal tertentu
 */
export function addDays(dateStr, days = 30) {
  if (!dateStr) dateStr = getTodayDateString();
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const BULAN_INDO = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Format tanggal YYYY-MM-DD menjadi format bahasa Indonesia ringkas (misal: 31 Okt 2026)
 */
export function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  const bulan = BULAN_INDO[m - 1] || '';
  return `${d} ${bulan} ${y}`;
}

/**
 * Format rentang tanggal tayang (misal: 1 Nov – 1 Des 2026)
 */
export function formatDateRange(startStr, endStr) {
  if (!startStr && !endStr) return 'Maks 1 Bulan';
  const start = formatDateIndo(startStr);
  const end = formatDateIndo(endStr);
  return `${start} – ${end}`;
}

/**
 * Menghitung sisa hari dan status kedaluwarsa sebuah loker
 */
export function getJobExpiryStatus(job) {
  const todayStr = getTodayDateString();
  const start = job.tanggal_mulai || job.tanggal || todayStr;
  const end = job.tanggal_selesai || addMonths(start, 1);

  // Bandingkan dengan akhir hari tanggal_selesai
  const today = new Date(todayStr + 'T00:00:00');
  const endDate = new Date(end + 'T23:59:59');

  const diffMs = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isExpired = diffDays <= 0;

  let label = '';
  let badgeColor = '';

  if (isExpired) {
    label = 'Kedaluwarsa';
    badgeColor = 'bg-rose-100 text-rose-700 border-rose-200';
  } else if (diffDays === 1) {
    label = 'Hari Terakhir';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (diffDays <= 3) {
    label = `Sisa ${diffDays} hari`;
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    label = `Sisa ${diffDays} hari`;
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return {
    isExpired,
    diffDays,
    daysLeft: Math.max(0, diffDays),
    start,
    end,
    label,
    badgeColor
  };
}

/**
 * Mengecek apakah loker saat ini aktif (belum kedaluwarsa)
 */
export function isJobActive(job) {
  const status = getJobExpiryStatus(job);
  return !status.isExpired;
}
