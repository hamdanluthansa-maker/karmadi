/**
 * Helper untuk mengekstrak warna dominan dari gambar menggunakan Canvas
 */
export async function extractDominantColor(imageFileOrUrl) {
  return new Promise((resolve) => {
    if (!imageFileOrUrl) {
      resolve('#059669');
      return;
    }

    let objectUrl = null;
    let srcUrl = '';

    if (typeof imageFileOrUrl === 'string') {
      srcUrl = imageFileOrUrl;
    } else if (imageFileOrUrl instanceof Blob || imageFileOrUrl instanceof File) {
      try {
        objectUrl = URL.createObjectURL(imageFileOrUrl);
        srcUrl = objectUrl;
      } catch {
        srcUrl = '';
      }
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        const data = ctx.getImageData(0, 0, 64, 64).data;

        let bestColor = null;
        let maxScore = 0;

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a > 200) {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            const saturation = max === 0 ? 0 : delta / max;
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // Prioritaskan warna tajam khas brand (hijau, oranye, merah, biru, kuning)
            if (brightness > 20 && brightness < 235 && saturation > 0.25) {
              const score = saturation * 3 + (1 - Math.abs(brightness - 128) / 128);
              if (score > maxScore) {
                maxScore = score;
                bestColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
              }
            }
          }
        }

        if (objectUrl) URL.revokeObjectURL(objectUrl);
        if (bestColor) {
          resolve(bestColor);
          return;
        }
      } catch (err) {
        console.warn('Canvas color extraction error:', err);
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve('#059669');
    };
    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve('#059669');
    };
    img.src = srcUrl;
  });
}

/**
 * Daftar kamus posisi pekerjaan populer untuk pencocokan cerdas
 */
const KNOWN_JOB_POSITIONS = [
  'Standby Toko',
  'Terapis Baby Spa',
  'Baby Spa',
  'Pramuniaga',
  'Barista',
  'Crew Outlet',
  'Customer Service',
  'Staff Toko',
  'Admin Online',
  'Baker',
  'Pastry',
  'Pastry Chef',
  'Graphic Designer',
  'Desain Grafis',
  '3D Modeling / Product Development',
  '3D Modeling',
  'Sewing / Penjahit',
  'Penjahit',
  'Helper Dropping',
  'Admin Logistik',
  'Staff Lapangan',
  'Karyawati Toko',
  'Perawat (Nurse)',
  'Perawat',
  'Bidan',
  'Apoteker',
  'Tenaga Medis',
  'Dokter',
  'Staff Accounting',
  'Accounting Staff',
  'Staff Akuntansi',
  'Accounting',
  'Akuntansi',
  'Staff Keuangan',
  'Finance Staff',
  'Finance & Accounting',
  'Administrasi Keuangan',
  'Admin Keuangan',
  'Mekanik Forklift',
  'Operator Forklift',
  'Teknisi Forklift',
  'Mekanik Otomotif',
  'Mekanik Mesin',
  'Mekanik',
  'Checker Gudang',
  'Staff Gudang',
  'Operator Gudang',
  'Helper Gudang',
  'Kepala Gudang',
  'Driver Pengiriman',
  'Driver Operasional',
  'Driver Logistik',
  'Driver / Sopir',
  'Driver',
  'Sopir',
  'Sales Kanvas Motoris',
  'Sales Motoris',
  'Sales Kanvas',
  'Sales Executive',
  'Sales Representative',
  'Office Boy / Cleaning Service',
  'Office Boy',
  'Cleaning Service',
  'Tenaga Kebersihan',
  'Customer Service',
  'Kasir',
  'FL Kasir',
  'Pramuniaga Toko',
  'Crew Store',
  'Staff Administrasi',
  'Admin Gudang',
  'Admin Operasional',
  'Admin',
  'Teknisi Mekanikal & Kelistrikan',
  'Teknisi Listrik',
  'Teknisi Mesin',
  'Teknisi',
  'Quality Control Produksi',
  'Quality Control',
  'Digital Marketing & Content Creator',
  'Digital Marketing',
  'Content Creator',
  'Security / Satpam',
  'Security',
  'Barista',
  'Cook / Koki',
  'Waiter / Pelayan',
  'Operator Produksi',
  'Operator'
];

/**
 * Parser teks OCR menjadi entitas loker yang bersih dan terstruktur
 */
export function parsePosterText(rawText) {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Ekstrak Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emailMatch = rawText.match(emailRegex);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  // 1b. Ekstrak Link Pendaftaran / Formulir Online (bit.ly, forms.gle, linktr.ee, Google Form, web, dll)
  let link_pendaftaran = '';
  const linkLabelMatch = rawText.match(/(?:link\s*pendaftaran|link\s*formulir|link\s*daftar|daftar\s*online|formulir\s*pendaftaran|registrasi)[\s:\-]+([^\s\n\r]+)/i);
  if (linkLabelMatch && linkLabelMatch[1]) {
    link_pendaftaran = linkLabelMatch[1].trim();
  }

  if (!link_pendaftaran) {
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:bit\.ly|tinyurl\.com|forms\.gle|s\.id|linktr\.ee|forms\.office\.com|docs\.google\.com\/forms)[a-zA-Z0-9_\-\.\/\?=&%]+/gi;
    const urlMatch = rawText.match(urlPattern);
    if (urlMatch && urlMatch.length > 0) {
      link_pendaftaran = urlMatch[0].trim();
    }
  }

  if (link_pendaftaran) {
    link_pendaftaran = link_pendaftaran.replace(/[,\.;\)]+$/, '');
    if (!link_pendaftaran.startsWith('http://') && !link_pendaftaran.startsWith('https://')) {
      link_pendaftaran = `https://${link_pendaftaran}`;
    }
  }

  // 1c. Deteksi Lamaran Datang Langsung / Walk-In Interview / Kirim Berkas Fisik
  let is_walk_in = false;
  let alamat_walk_in = '';
  const walkInPattern = /(?:lamaran\s*ditujukan\s*ke|kirim(?:kan)?\s*lamaran\s*(?:ke|langsung|di)|antar\s*(?:lamaran|cv|berkas)\s*ke|datang\s*langsung\s*(?:ke|di)|walk[\s\-]in\s*interview|drop\s*(?:cv|lamaran|berkas)\s*(?:ke|di)|bawa\s*lamaran\s*ke)[\s:\-]+([^\n\r]+(?:\n[^\n\r]+)?)/i;
  const walkInMatch = rawText.match(walkInPattern);
  if (walkInMatch && walkInMatch[1]) {
    is_walk_in = true;
    alamat_walk_in = walkInMatch[1].replace(/[\*\_\#]/g, '').trim();
  } else if (/walk[\s\-]in\s*interview|datang\s*langsung|lamaran\s*ditujukan\s*ke|kirim\s*berkas\s*fisik/i.test(rawText)) {
    is_walk_in = true;
  }

  // 2. Ekstrak Nomor WhatsApp / HP (HANYA jika ada nomor HP asli Indonesia di poster)
  const phoneRegex = /(?:\+?62|0)8[1-9][0-9]{7,11}/g;
  const cleanForPhone = rawText.replace(/[-.\s\(\)]/g, '');
  const phoneMatch = cleanForPhone.match(phoneRegex);
  let kontak_wa = '';
  if (phoneMatch && phoneMatch.length > 0) {
    let p = phoneMatch[0];
    if (p.startsWith('08')) p = '62' + p.slice(1);
    else if (p.startsWith('+62')) p = p.slice(1);
    kontak_wa = p;
  }

  // 3. Deteksi Posisi Pekerjaan
  let posisi = '';

  // Prioritas A: Cek kamus posisi populer
  for (const job of KNOWN_JOB_POSITIONS) {
    const pattern = new RegExp(`\\b${job.replace('/', '\\/')}\\b`, 'i');
    if (pattern.test(rawText)) {
      posisi = job;
      break;
    }
  }

  // Prioritas B: Cek Baris Subjek Email / Lamaran (misal "(Subjek GRAPHIC DESIGNER)" atau "Subjek : STAF ACCOUNING")
  if (!posisi) {
    const subjekMatch = rawText.match(/(?:subjek|subject)[\s:\(]*([a-zA-Z\s]{4,30})(?:_|\s+nama|\s*\(|\)|08|\n|$)/i);
    if (subjekMatch && subjekMatch[1]) {
      const candidate = subjekMatch[1].trim();
      if (/accoun|akutan|akuntan/i.test(candidate)) {
        posisi = 'Staff Accounting';
      } else if (/graphic|desain|designer/i.test(candidate)) {
        posisi = 'Graphic Designer';
      } else if (isValidJobTitle(candidate)) {
        posisi = cleanJobTitle(candidate);
      }
    }
  }

  // Prioritas C: Cek konteks kualifikasi & kata kunci kuat
  if (!posisi) {
    if (/perawat|ners|btcls|str|ppni/i.test(rawText)) {
      posisi = 'Perawat (Nurse)';
    } else if (/akuntansi|akutansi|accounting|keuangan|laporan administrasi/i.test(rawText)) {
      posisi = 'Staff Accounting';
    } else if (/graphic|aphic\s*designer|desain\s*grafis|software\s*editing|photo\s*&\s*vector/i.test(rawText)) {
      posisi = 'Graphic Designer';
    } else if (/sewing|penjahit|menjahit/i.test(rawText)) {
      posisi = 'Sewing / Penjahit';
    } else if (/helper\s*dropping/i.test(rawText)) {
      posisi = 'Helper Dropping';
    } else if (/3d\s*modeling|rhinoceros/i.test(rawText)) {
      posisi = '3D Modeling / Product Development';
    } else if (/operator\s*produksi/i.test(rawText)) {
      posisi = 'Operator Produksi';
    }
  }

  // Prioritas D: Cari di sekitar kata kunci lowongan
  if (!posisi) {
    const triggerPhrases = ['lowongan kerja', 'lowongan pekerjaan', 'dibutuhkan', 'we are hiring', 'hiring', 'open recruitment', 'posisi'];
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();
      for (const phrase of triggerPhrases) {
        if (lineLower.includes(phrase)) {
          if (lines[i].includes(':')) {
            const afterColon = lines[i].split(':')[1].trim();
            if (isValidJobTitle(afterColon)) {
              posisi = cleanJobTitle(afterColon);
              break;
            }
          }
          for (let next = 1; next <= 3; next++) {
            if (i + next < lines.length && isValidJobTitle(lines[i + next])) {
              posisi = cleanJobTitle(lines[i + next]);
              break;
            }
          }
        }
        if (posisi) break;
      }
      if (posisi) break;
    }
  }

  // Fallback posisi
  if (!posisi || !isValidJobTitle(posisi)) {
    posisi = 'Staff Operasional';
  }

  // 4. Deteksi Nama Perusahaan / Brand
  let nama_perusahaan = '';

  // Cek merek / instansi yang dikenal
  if (/bakeshop|bakery/i.test(rawText)) {
    nama_perusahaan = 'Bakeshop Bakery Madiun';
  } else if (/yughost|vape/i.test(rawText)) {
    nama_perusahaan = 'Yughost Vape Madiun';
  } else if (/dhika|bookstore/i.test(rawText)) {
    nama_perusahaan = 'Dhika Bookstore (Toko Buku Dhika)';
  } else if (/mayda|parfum/i.test(rawText)) {
    nama_perusahaan = 'Mayda Parfum (Cabang Kebonsari)';
  } else if (/sehat\s*rukun|srs\s*peternakan/i.test(rawText)) {
    nama_perusahaan = 'PT Sehat Rukun Sentosa (SRS)';
  } else if (/semarak\s*dana/i.test(rawText)) {
    nama_perusahaan = 'KSP Semarak Dana Madiun';
  } else if (/crucil/i.test(rawText)) {
    nama_perusahaan = 'Crucil (CruCil)';
  } else if (/cns|ptcns/i.test(rawText)) {
    nama_perusahaan = 'PT CNS Ponorogo';
  } else if (/dwi\s*prima|dps/i.test(rawText)) {
    nama_perusahaan = 'PT Dwi Prima Sentosa III (DPS)';
  } else if (/hermina/i.test(rawText)) {
    nama_perusahaan = 'RS Hermina Madiun';
  } else if (/patzy|petshop/i.test(rawText)) {
    nama_perusahaan = 'Patzy Petshop Madiun';
  } else if (/yammy|ice\s*cream|go-day|goday/i.test(rawText)) {
    nama_perusahaan = 'CV. Yammy Ice Cream (Go-Day Madiun)';
  } else if (/asia\s*prima\s*konjac/i.test(rawText)) {
    nama_perusahaan = 'PT Asia Prima Konjac';
  } else if (/cahaya\s*adin\s*abadi/i.test(rawText) || /depo.*aqua/i.test(rawText)) {
    nama_perusahaan = 'PT Cahaya Adin Abadi (Depo AQUA Madiun)';
  } else if (/luck\s*milk/i.test(rawText)) {
    nama_perusahaan = 'Luck Milk Madiun';
  } else if (/surya\s*abadi\s*motor/i.test(rawText)) {
    nama_perusahaan = 'CV Surya Abadi Motor Madiun';
  } else if (/inka/i.test(rawText)) {
    nama_perusahaan = 'PT Industri Kereta Api (INKA) Persero';
  } else {
    // Cek frasa RS / Rumah Sakit / Klinik
    const hospitalMatch = rawText.match(/\b(?:rs|rsud|rumah\s*sakit|klinik|apotek)\s+([a-zA-Z\s]{3,30})/i);
    if (hospitalMatch) {
      nama_perusahaan = hospitalMatch[0].trim();
    }
  }

  // Cek frasa "drop di [Perusahaan/Toko] terdekat"
  if (!nama_perusahaan) {
    const dropMatch = rawText.match(/(?:drop di|kirim ke|datang langsung ke)\s+([a-zA-Z\s]+(?:petshop|toko|outlet|store|optik|cafe|resto|bengkel|klinik|kantor|depo))/i);
    if (dropMatch && dropMatch[1]) {
      nama_perusahaan = dropMatch[1].trim();
    }
  }

  // Cek alamat email
  if (!nama_perusahaan && email) {
    const emailCoMatch = email.match(/(?:career|karir|recruitment|rekrutmen|hrd|loker)(?:at|@|\.)([a-zA-Z0-9]+)\./i);
    if (emailCoMatch && emailCoMatch[1]) {
      const brand = emailCoMatch[1].charAt(0).toUpperCase() + emailCoMatch[1].slice(1);
      nama_perusahaan = `${brand} Madiun`;
    }
  }

  // Cek pola PT / CV di baris
  if (!nama_perusahaan) {
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (lineLower.includes('kirim') || lineLower.includes('email') || lineLower.includes('anda') || lineLower.includes('surat') || lineLower.includes('lamaran')) {
        continue;
      }
      if (/\bpt\b|\bcv\.\b|\bcv\s+[a-z]{3,}|\bud\b|\bpabrik\b|\bdepo\b|\brsud\b|\brs\b|\bklinik\b|\bdinas\b/i.test(lineLower)) {
        if (line.length > 4 && line.length < 65) {
          let cleaned = line
            .replace(/^[\s\/\*\,\|\:\-\d\.]+/, '')
            .replace(/[\s\/\*\,\|\:\-]+$/, '')
            .replace(/\bPB\s*:\s*-?/i, '')
            .trim();

          if (cleaned.length > 3) {
            nama_perusahaan = cleaned;
            break;
          }
        }
      }
    }
  }

  // Fallback perusahaan universal (netral)
  if (!nama_perusahaan) {
    nama_perusahaan = 'Perusahaan Mitra Kota Madiun';
  }

  // 5. Ekstraksi Persyaratan / Kualifikasi Bersih (Tanpa Header dan Tanpa Noise)
  const blacklistHeader = [
    'we\'re hiring', 'we\'re', 'we\'r e', 'hiring', 'hiring!', 'lowongan', 'lowongan kerja',
    'recruitment', 'open recruitment', 'dibutuhkan', 'kota madiun', 'madiun', 'poster resmi',
    'profil sdm', 'profil sdm :', 'kualifikasi', 'persyaratan', 'syarat', 'lokasi', 'kirim lamaran ke'
  ];

  const syarat = [];
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineLower = line.toLowerCase().trim();

    // Skip blacklist header
    if (blacklistHeader.some((b) => lineLower === b || lineLower === b + '!')) continue;

    // Skip nama posisi dan nama perusahaan yang tidak sengaja terbaca di baris
    if (posisi && lineLower === posisi.toLowerCase()) continue;
    if (lineLower === 'perawat' || lineLower === 'staff accounting') continue;
    if (nama_perusahaan && lineLower.includes(nama_perusahaan.toLowerCase())) continue;
    if (lineLower.includes('hermina') || lineLower.includes('rs hermina')) continue;

    // Skip baris sampah / noise OCR
    if (/^mn\s+un\s+uan/i.test(lineLower) || /^site\?/i.test(lineLower) || /^das\./i.test(lineLower)) continue;
    if (lineLower.length < 5) continue;

    // Syarat yang valid biasanya memiliki bullet point, label field seperti "Pendidikan :", atau kata kunci kualifikasi
    const hasBullet = /^[•\-\*\>\#\»\«\d\.\)\s]+/.test(line);
    const hasColonField = /^(pendidikan|pengalaman|pelatihan|sertifikasi|kualifikasi|syarat|usia|kriteria|ipk)\s*:/i.test(line);
    const hasKeyTerm = /\b(ners|str|ppni|btcls|ipk|profesi|s1|d3|sma|smk|pengalaman|fresh graduate|komunikasi|jujur|disiplin|tanggap|tanggung jawab|akuntansi|akutansi|excel|sheet|sim|pria|wanita|sehat|domisili)\b/i.test(line);

    if (hasBullet || hasColonField || hasKeyTerm) {
      let clean = line
        .replace(/^[•\-\*\>\#\»\«\d\.\)\s]+/, '')
        .replace(/[\:\-]+$/, '')
        .trim();

      // Sambung baris berikutnya jika terputus di kata 'serta' / 'dan' / 'atau'
      if (/(serta|dan|atau|,)$/i.test(clean) && idx + 1 < lines.length) {
        const nextClean = lines[idx + 1]
          .replace(/^[•\-\*\>\#\»\«\d\.\)\s]+/, '')
          .replace(/[\:\-]+$/, '')
          .trim();
        clean = `${clean} ${nextClean}`;
        idx++;
      }

      if (clean.length > 5 && !clean.includes('@')) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        clean = clean.replace(/30Tahun/i, '30 Tahun');
        clean = clean.replace(/D-Ill/i, 'D-III');
        clean = clean.replace(/Akutansi/g, 'Akuntansi');

        if (!syarat.some((s) => s.toLowerCase() === clean.toLowerCase())) {
          syarat.push(clean);
        }
      }
    }
  }

  return {
    nama_perusahaan,
    posisi,
    syarat:
      syarat.length > 0
        ? syarat
        : [
            'Pendidikan minimal sesuai kualifikasi jabatan',
            'Pria/Wanita usia produktif',
            'Jujur, disiplin, dan bertanggung jawab',
            'Sehat jasmani dan rohani'
          ],
    kontak_wa,
    email,
    link_pendaftaran,
    is_walk_in,
    alamat_walk_in
  };
}

function isValidJobTitle(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim();
  if (/^\d+$/.test(clean)) return false;
  if (clean.length < 4 || clean.length > 50) return false;
  if (/["“”©®™\[\]]/.test(clean)) return false;
  if (!/[a-zA-Z]{4,}/.test(clean)) return false;
  const blacklisted = [
    'lowongan',
    'poster resmi',
    'kualifikasi',
    'terverifikasi',
    'baru dipasang',
    'persyaratan',
    'dibutuhkan',
    'pekerjaan',
    'segera',
    'we are hiring',
    'hiring',
    'contact person',
    'penempatan'
  ];
  const lower = clean.toLowerCase();
  for (const b of blacklisted) {
    if (lower === b || lower.startsWith(b + ' ') || lower.endsWith(' ' + b)) return false;
  }
  return true;
}

function cleanJobTitle(text) {
  return text
    .replace(/^[\s\/\*\,\|\:\-\d\.]+/, '')
    .replace(/[\s\/\*\,\|\:\-]+$/, '');
}
