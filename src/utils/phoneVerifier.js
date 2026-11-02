/**
 * Utility Verifikasi & Deteksi Keamanan Nomor WhatsApp Perekrut KARMADI
 * Menganalisis keabsahan nomor ponsel Indonesia, mendeteksi operator seluler,
 * serta mendeteksi kata kunci modus penipuan lowongan kerja (scam detection).
 */

export function cleanPhoneNumber(raw) {
  if (!raw || typeof raw !== 'string') return '';
  // Hilangkan spasi, tanda strip, kurung, titik
  let cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, '');
  
  // Format nomor WhatsApp: Jika diawali 08, ubah ke 628
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function formatToLocal08(cleanNumber) {
  if (!cleanNumber) return '';
  if (cleanNumber.startsWith('62')) {
    return '0' + cleanNumber.substring(2);
  }
  return cleanNumber;
}

export function detectOperator(phone) {
  const local = formatToLocal08(cleanPhoneNumber(phone));
  if (!local.startsWith('08')) {
    if (cleanPhoneNumber(phone).startsWith('62')) return 'Indonesia (Seluler)';
    return 'Luar Negeri / Bukan Nomor Indonesia Biasa';
  }

  const prefix4 = local.substring(0, 4);

  // Telkomsel (Termasuk By.U, Halo)
  if (['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'].includes(prefix4)) {
    return 'Telkomsel (By.U / SimPATI / Halo)';
  }
  // Indosat Ooredoo IM3
  if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix4)) {
    return 'Indosat Ooredoo (IM3)';
  }
  // XL Axiata & AXIS
  if (['0817', '0818', '0819', '0859', '0877', '0878', '0831', '0832', '0833', '0838'].includes(prefix4)) {
    return 'XL Axiata / AXIS';
  }
  // Tri (3)
  if (['0895', '0896', '0897', '0898', '0899'].includes(prefix4)) {
    return 'Tri (3 / Indosat)';
  }
  // Smartfren
  if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(prefix4)) {
    return 'Smartfren';
  }

  return 'Operator Indonesia';
}

/**
 * Analisis Risiko Penipuan Loker Berdasarkan Nomor & Isi Konten
 */
export function analyzeScamRisk(phone, jobData = {}) {
  const clean = cleanPhoneNumber(phone);
  const local = formatToLocal08(clean);
  const operator = detectOperator(clean);

  const warnings = [];
  const greenFlags = [];
  let riskLevel = 'SAFE'; // 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK'

  // 1. Uji Kelayakan Nomor
  if (!clean) {
    return {
      isValid: false,
      riskLevel: 'EMPTY',
      cleanNumber: '',
      localNumber: '',
      operator: '-',
      warnings: ['Nomor WhatsApp belum diisi.'],
      greenFlags: [],
    };
  }

  // Cek nomor luar negeri (biasanya sindikat scam task freelance / like tiktok internasional)
  if (!clean.startsWith('62')) {
    riskLevel = 'HIGH_RISK';
    warnings.push(
      'Nomor WhatsApp BUKAN berasal dari Indonesia (bukan +62). Waspada sindikat penipuan freelance/tugas daring internasional!'
    );
  } else {
    greenFlags.push('Kode negara resmi Indonesia (+62).');
  }

  // Cek panjang digit nomor seluler Indonesia (normalnya 10-13 digit setelah 08)
  if (local.length < 10) {
    riskLevel = 'HIGH_RISK';
    warnings.push(`Jumlah digit terlalu pendek (${local.length} digit). Nomor ponsel tidak lengkap/salah.`);
  } else if (local.length > 14) {
    riskLevel = 'SUSPICIOUS';
    warnings.push(`Jumlah digit terlalu panjang (${local.length} digit). Kemungkinan nomor virtual.`);
  } else {
    greenFlags.push(`Format digit valid (${local.length} digit).`);
  }

  // 2. Analisis Konten Teks Loker Terhadap Modus Penipuan Umum
  const fullText = [
    jobData.posisi || '',
    jobData.perusahaan || '',
    jobData.deskripsi || '',
    jobData.syarat || '',
    jobData.benefit || '',
    jobData.catatan || '',
  ]
    .join(' ')
    .toLowerCase();

  // Kata Kunci Bahaya: Pungutan Biaya / Travel Scam
  const moneyScamKeywords = [
    'uang seragam',
    'biaya seragam',
    'biaya pendaftaran',
    'uang pendaftaran',
    'tiket travel',
    'travel agent',
    'biaya akomodasi',
    'penggantian tiket',
    'uang jaminan',
    'biaya materai',
    'biaya tes kesehatan',
  ];
  for (const kw of moneyScamKeywords) {
    if (fullText.includes(kw)) {
      riskLevel = 'HIGH_RISK';
      warnings.push(`Terdeteksi kata mencurigakan: "${kw}". Loker resmi TIDAK BOLEH memungut biaya apapun!`);
      break;
    }
  }

  // Kata Kunci Bahaya: Modus Task Scam / Like-Follow Berbayar / Deposit
  const taskScamKeywords = [
    'like video',
    'follow tiktok',
    'tugas harian',
    'komisi harian',
    'modal hp',
    'deposit',
    'penghasilan 500rb per hari',
    'ketik 2 jam sehari',
  ];
  for (const kw of taskScamKeywords) {
    if (fullText.includes(kw)) {
      riskLevel = 'HIGH_RISK';
      warnings.push(`Terdeteksi indikasi modus Tugas/Like-Follow online: "${kw}". Berpotensi penipuan deposit.`);
      break;
    }
  }

  if (warnings.length === 0) {
    greenFlags.push('Tidak terdeteksi kata kunci pungutan biaya atau skema penipuan.');
  }

  return {
    isValid: clean.length >= 10 && clean.startsWith('62'),
    riskLevel,
    cleanNumber: clean,
    localNumber: local,
    operator,
    warnings,
    greenFlags,
  };
}

/**
 * URL Generator untuk Pemeriksaan Eksternal
 */
export function getWaChatUrl(cleanNumber, companyName = '') {
  const greeting = companyName
    ? `Halo HRD ${companyName}, saya Admin KARMADI ingin konfirmasi informasi lowongan kerja yang dibuka.`
    : `Halo, saya Admin KARMADI ingin konfirmasi informasi lowongan kerja yang dibuka.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(greeting)}`;
}

export function getKredibelSearchUrl(localNumber) {
  return `https://www.kredibel.co.id/search/phone/${localNumber}`;
}

export function getGoogleSearchUrl(localNumber, cleanNumber) {
  // Query telusur jejak rekam penipuan di Google
  const query = `"${localNumber}" OR "${cleanNumber}" penipu OR scam OR bodong OR loker`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function getTruecallerSearchUrl(cleanNumber) {
  return `https://www.truecaller.com/search/id/${cleanNumber}`;
}
