/**
 * Helper pembuat URL dan Teks Siar Menarik (Click-Through Oriented)
 * Dirancang agar audiens tertarik membuka web app Karmadi,
 * tanpa membocorkan kontak WA/Email/link pendaftaran langsung di chat.
 */

export function getJobShareUrl(job) {
  if (typeof window === 'undefined') {
    return 'https://karmadi.vercel.app';
  }
  const origin = window.location.origin;
  const jobId = job?.id || '';
  if (jobId) {
    return `${origin}/?loker=${encodeURIComponent(jobId)}`;
  }
  if (job?.posisi) {
    return `${origin}/?q=${encodeURIComponent(job.posisi)}`;
  }
  return origin;
}

/**
 * Membuat teks pengumuman teaser yang sangat persuasif & memicu kunjungan (traffic driver)
 */
export function formatJobTeaserShareText(job) {
  if (!job) return '';
  const posisi = (job.posisi || 'Lowongan Kerja').toUpperCase();
  const perusahaan = job.nama_perusahaan || 'Perusahaan Mitra';
  const wilayah = job.wilayah || job.lokasi || 'Karesidenan Madiun';
  const tipe = job.tipe || 'Full Time';
  const isUrgent = Boolean(job.is_urgent);

  const syarat = Array.isArray(job.syarat)
    ? job.syarat
    : typeof job.syarat === 'string'
    ? job.syarat.split('\n').filter(Boolean)
    : [];

  const topSyarat = syarat.slice(0, 3);
  const syaratPreview =
    topSyarat.length > 0
      ? topSyarat.map((s) => `  • ${s.replace(/^[•\-\*]\s*/, '')}`).join('\n')
      : '  • Kualifikasi lengkap tertera di portal';

  const shareUrl = getJobShareUrl(job);

  return (
    `${isUrgent ? '🔥 *DIBUTUHKAN SEGERA (URGENT)!*\n' : '⚡ *INFO LOKER TERBARU SEPUTAR MADIUN RAYA*\n'}` +
    `\n` +
    `🏢 *Perusahaan*: ${perusahaan}\n` +
    `💼 *Posisi*: *${posisi}*\n` +
    `📍 *Penempatan*: ${wilayah} (${tipe})\n` +
    `\n` +
    `📋 *Sekilas Kualifikasi*:\n` +
    `${syaratPreview}\n` +
    (syarat.length > 3 ? `  _...dan ${syarat.length - 3} kriteria lainnya_\n` : '') +
    `\n` +
    `✨ *Cara Lamar & Info Lengkap*:\n` +
    `Untuk menjaga keaslian kontak resmi & menghindari loker kedaluwarsa, seluruh detail kontak rekruter (WA/Email/Link) serta fitur *Lamar Cepat 1-Klik* dapat diakses langsung melalui tautan resmi ini:\n` +
    `\n` +
    `👉 *Buka & Lamar Langsung di Sini*:\n` +
    `${shareUrl}\n` +
    `\n` +
    `💡 _Tersedia Asisten AI Pembuat Surat Lamaran (Smart Cover Letter) otomatis siap kirim di dalam portal!_`
  );
}

/**
 * Format teaser untuk sekumpulan loker (Batch Siaran Saluran WhatsApp Admin)
 */
export function formatBatchJobsTeaserText(jobs) {
  if (!jobs || jobs.length === 0) return '';
  if (jobs.length === 1) return formatJobTeaserShareText(jobs[0]);

  const listHeader = `🔥 *UPDATE ${jobs.length} LOWONGAN KERJA BARU SEPUTAR MADIUN RAYA*\n\n` +
    `Halo rekan pencari kerja! Baru saja tayang ${jobs.length} peluang karir pilihan:\n\n`;

  const items = jobs
    .map((j, i) => {
      const pos = (j.posisi || 'Staff').toUpperCase();
      const pt = j.nama_perusahaan || 'Perusahaan Mitra';
      const wil = j.wilayah || j.lokasi || 'Madiun';
      const url = getJobShareUrl(j);
      return `*#${i + 1} ${pos}*\n` +
        `🏢 ${pt} — 📍 ${wil}\n` +
        `🔗 Lamar Cepat: ${url}`;
    })
    .join('\n\n');

  const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ *Kelebihan Melamar di Portal KARMADI*:\n` +
    `• Kontak HRD/Rekruter terverifikasi 100% transparan\n` +
    `• Lamar via WhatsApp & Email Cepat 1x Klik\n` +
    `• Tersedia AI Pembuat Draf Surat Lamaran Kerja Otomatis!\n\n` +
    `🌐 *Kunjungi Portal Lengkap*: https://karmadi.vercel.app`;

  return listHeader + items + footer;
}
