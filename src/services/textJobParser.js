import { detectWilayah } from '../utils/regionUtils';
import { getTodayDateString, addMonths } from '../utils/dateUtils';
import { getGeminiApiKey, getActiveGeminiModel } from './geminiService';

/**
 * textJobParser — Layanan Cerdas Pembedah Teks Loker Mentah (Broadcast WA, Facebook, Catatan)
 * Menghasilkan entitas loker terstruktur siap tampil di Live Preview dan diterbitkan.
 * 
 * Bekerja dengan 2 tingkatan:
 * 1. AI LLM (Gemini / Groq / OpenRouter) jika API Key tersedia di sistem
 * 2. Smart Regex & Local NLP Heuristic Parser (100% Offline, Cepat & Akurat Tanpa Kuota)
 */

/**
 * Parser Lokal Berbasis Heuristik Bahasa Indonesia
 */
export function parseRawJobTextLocally(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Teks loker tidak boleh kosong.');
  }

  const cleanText = rawText.trim();
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Ekstrak Kontak WhatsApp / Telepon
  let kontak_wa = '';
  const waMatch = cleanText.match(/(?:wa|whatsapp|hubungi|telp|hp|call|nomor|no)[\s:\-]*([+]?[0-9\s\-]{9,20})/i) ||
                  cleanText.match(/(\+62[0-9\s\-]{8,18}|08[0-9\s\-]{8,15})/);
  if (waMatch) {
    const rawNumber = waMatch[1] || waMatch[0];
    let cleaned = rawNumber.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      kontak_wa = cleaned;
    }
  }

  // 2. Ekstrak Email
  let email = '';
  const emailMatch = cleanText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  if (emailMatch) {
    email = emailMatch[1].toLowerCase();
  }

  // 3. Ekstrak Link Formulir / Pendaftaran Online
  let link_pendaftaran = '';
  const linkMatch = cleanText.match(/(https?:\/\/[^\s]+|forms\.gle\/[^\s]+|bit\.ly\/[^\s]+|linktr\.ee\/[^\s]+)/i);
  if (linkMatch) {
    let url = linkMatch[0].trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    link_pendaftaran = url;
  }

  // 4. Deteksi Tipe Pekerjaan (Full Time / Freelance / Part Time / Magang / Kontrak)
  let tipe = 'Full Time';
  const lowerText = cleanText.toLowerCase();
  const is_urgent = /urgent|segera|butuh cepat|dibutuhkan segera|asap|urgent recruitment|mendesak/i.test(lowerText);
  if (
    lowerText.includes('freelance') ||
    lowerText.includes('pocokan') ||
    lowerText.includes('serabutan') ||
    lowerText.includes('harian lepas') ||
    lowerText.includes('part-time') ||
    lowerText.includes('part time')
  ) {
    tipe = lowerText.includes('part time') || lowerText.includes('part-time') ? 'Part Time' : 'Freelance';
  } else if (lowerText.includes('magang') || lowerText.includes('internship')) {
    tipe = 'Magang';
  } else if (lowerText.includes('kontrak')) {
    tipe = 'Kontrak';
  }

  // 5. Deteksi Kategori Pekerjaan
  let kategori = 'Umum';
  if (/packing|gudang|checker|logistik|bongkar|muat/i.test(lowerText)) {
    kategori = 'Gudang';
  } else if (/kasir|cashier|retail/i.test(lowerText)) {
    kategori = 'Kasir';
  } else if (/sales|marketing|canvasser|motoris|promotor/i.test(lowerText)) {
    kategori = 'Sales';
  } else if (/barista|cook|chef|koki|kitchen|waiter|waitress|pelayan|resto|cafe|kuliner/i.test(lowerText)) {
    kategori = 'F&B';
  } else if (/admin|administrasi|sekretaris|input data/i.test(lowerText)) {
    kategori = 'Admin';
  } else if (/driver|sopir|pengemudi|kurir|ekspedisi/i.test(lowerText)) {
    kategori = 'Umum';
  } else if (/desain|design|editor|videografer|fotografer/i.test(lowerText)) {
    kategori = 'Desain';
  } else if (/teknisi|mekanik|listrik|bengkel|otomotif/i.test(lowerText)) {
    kategori = 'Teknik';
  } else if (/perawat|bidan|apoteker|klinik|dokter|farmasi/i.test(lowerText)) {
    kategori = 'Kesehatan';
  }

  // 6. Ekstrak Posisi Jabatan
  let posisi = '';
  // Cek baris pertama atau baris yang mengandung 'dibutuhkan', 'lowongan', 'dicari'
  for (const line of lines) {
    const matchPos = line.match(/(?:dibutuhkan|dicari|lowongan(?:\s+pekerjaan|\s+kerja)?|open recruitment|we are hiring)\s*[:\-]?\s*(.+)/i);
    if (matchPos && matchPos[1]) {
      let candidate = matchPos[1].trim();
      // Bersihkan imbuhan penutup seperti pocokan/freelance, titik, dll
      candidate = candidate
        .replace(/\b(?:pocokan|freelance|full\s*time|part\s*time)\b/gi, '')
        .replace(/[\.\,\:\;]+$/, '')
        .trim();
      if (candidate.length >= 3) {
        // Format Capitalize
        posisi = candidate.charAt(0).toUpperCase() + candidate.slice(1);
        break;
      }
    }
  }

  if (!posisi && lines.length > 0) {
    // Ambil baris pertama jika pendek (< 50 karakter)
    const firstLine = lines[0].replace(/^(loker|lowongan kerja|dibutuhkan)\s*[:\-]?\s*/i, '').trim();
    if (firstLine.length > 2 && firstLine.length < 50) {
      posisi = firstLine.charAt(0).toUpperCase() + firstLine.slice(1);
    } else {
      posisi = 'Tenaga Kerja ' + (kategori !== 'Umum' ? kategori : 'Operasional');
    }
  }

  // 7. Ekstrak Nama Perusahaan / Instansi / Toko
  let nama_perusahaan = '';
  const compMatch = cleanText.match(/(?:pt|cv|ud|toko|outlet|warung|cafe|restoran|kedai|klinik|apotek)\s+([a-zA-Z0-9\s&]+)/i);
  if (compMatch) {
    nama_perusahaan = compMatch[0].trim().split('\n')[0].replace(/[\.,]+$/, '');
  } else {
    // Cek kata kunci online shop
    if (/online shop|olshop|toko online/i.test(cleanText)) {
      nama_perusahaan = 'Online Shop Madiun';
    } else if (lowerText.includes('madiun')) {
      nama_perusahaan = 'Mitra Usaha Madiun';
    } else {
      nama_perusahaan = 'Perusahaan / Toko Mitra';
    }
  }

  // 8. Pisahkan Blok Syarat (Kualifikasi), Benefit (Gaji & Fasilitas), dan Catatan (Ketentuan Lain)
  const syaratList = [];
  const benefitList = [];
  const catatanLines = [];
  let currentSection = 'intro'; // 'intro' | 'syarat' | 'benefit' | 'keterangan' | 'kontak'

  for (const line of lines) {
    const l = line.trim();
    const lLower = l.toLowerCase();

    // Deteksi header bagian
    if (/^(syarat|kualifikasi|persyaratan|kriteria|requirement)/i.test(lLower)) {
      currentSection = 'syarat';
      continue;
    }
    if (/^(benefit|fasilitas|gaji|tunjangan|hak|benefit\s*&|upah)/i.test(lLower)) {
      currentSection = 'benefit';
      continue;
    }
    if (/^(keterangan|ketentuan|deskripsi|jobdesc|catatan|detail|jam kerja|sistem kerja)/i.test(lLower)) {
      currentSection = 'keterangan';
      continue;
    }
    if (/^(kirim|lamaran|kontak|hubungi|cara melamar|info)/i.test(lLower)) {
      currentSection = 'kontak';
      continue;
    }

    // Ekstraksi item berdasarkan seksi aktif
    const isBullet = /^[-*•–—]\s*|\d+[\.\)]\s*/.test(l);
    const cleanedItem = l.replace(/^[-*•–—]\s*|\d+[\.\)]\s*/, '').trim();

    // Cek apakah baris ini memuat benefit (gaji, uang makan, lembur, mess, bonus)
    const isBenefitItem = /gaji|upah|uang lembur|uang makan|insentif|bonus|komisi|tunjangan|bpjs|mess|fasilitas makan|dapat makan/i.test(cleanedItem);

    if (currentSection === 'syarat') {
      if (cleanedItem && !cleanedItem.startsWith('+62') && !cleanedItem.startsWith('08')) {
        syaratList.push(cleanedItem.charAt(0).toUpperCase() + cleanedItem.slice(1));
      }
    } else if (currentSection === 'benefit') {
      if (cleanedItem) {
        benefitList.push(cleanedItem.charAt(0).toUpperCase() + cleanedItem.slice(1));
      }
    } else if (currentSection === 'keterangan') {
      if (cleanedItem) {
        if (isBenefitItem) {
          benefitList.push(cleanedItem.charAt(0).toUpperCase() + cleanedItem.slice(1));
        } else {
          catatanLines.push(l);
        }
      }
    } else if (currentSection === 'intro' && isBullet) {
      if (isBenefitItem) {
        benefitList.push(cleanedItem.charAt(0).toUpperCase() + cleanedItem.slice(1));
      } else {
        syaratList.push(cleanedItem.charAt(0).toUpperCase() + cleanedItem.slice(1));
      }
    }
  }

  // Jika syarat kosong, buatkan syarat default dari baris yang masuk akal
  if (syaratList.length === 0) {
    syaratList.push('Pria / Wanita usia produktif');
    syaratList.push('Jujur, tekun, dan bertanggung jawab');
    syaratList.push('Siap bekerja sesuai jam kerja yang ditentukan');
  }

  // 9. Deteksi Wilayah & Lokasi
  const wilayah = detectWilayah(cleanText, syaratList);
  const lokasi = wilayah !== 'Luar Kota Lain' ? `${wilayah}, Karesidenan Madiun` : 'Kota Madiun';

  // 10. Tentukan Warna Primer
  let warna_primer = '#2B4CE0';
  if (tipe === 'Freelance') {
    warna_primer = '#7C3AED'; // Violet khas Freelance
  } else if (kategori === 'Sales' || kategori === 'F&B') {
    warna_primer = '#059669'; // Emerald
  } else if (kategori === 'Gudang' || kategori === 'Teknik') {
    warna_primer = '#1E293B'; // Navy Slate
  }

  return {
    posisi,
    nama_perusahaan,
    poster_url: '',
    logo_url: '',
    kategori,
    tipe,
    wilayah,
    lokasi,
    syarat: syaratList.join('\n'),
    benefit: benefitList.join('\n'),
    catatan: catatanLines.join('\n'),
    kontak_wa,
    email,
    link_pendaftaran,
    is_walk_in: /datang langsung|walk[- ]in|bawa berkas/i.test(lowerText),
    alamat_walk_in: '',
    warna_primer,
    is_urgent,
    tanggal_mulai: getTodayDateString(),
    tanggal_selesai: addMonths(getTodayDateString(), 1),
    is_manual: true,
  };
}

/**
 * Ekstraksi Cerdas menggunakan LLM AI jika API Key tersedia, dengan fallback instan ke Parser Lokal
 */
export async function extractJobFromRawText(rawText) {
  const apiKey = getGeminiApiKey();

  // Jika tidak ada API Key, gunakan parser lokal yang super cepat & akurat
  if (!apiKey) {
    return parseRawJobTextLocally(rawText);
  }

  try {
    const activeModel = getActiveGeminiModel() || 'gemini-2.5-flash';
    const systemPrompt = `Kamu adalah sistem AI parser lowongan kerja profesional untuk portal loker Karesidenan Madiun (Karmadi).
Tugasmu: Bedah teks lowongan kerja mentah berikut dan kembalikan HANYA JSON murni (tanpa markdown, tanpa \`\`\`json) dengan format objek berikut:
{
  "posisi": "Nama posisi pekerjaan yang jelas dan spesifik (contoh: Tenaga Packing Online Shop, Barista, Staff Gudang)",
  "nama_perusahaan": "Nama toko / perusahaan / pemilik usaha (jika tidak ada sebutkan nama jenis toko misal Online Shop Madiun)",
  "kategori": "Salah satu dari: Admin | Sales | Kasir | Gudang | F&B | Teknik | IT | Kesehatan | Desain | Umum",
  "tipe": "Salah satu dari: Full Time | Freelance | Part Time | Magang | Kontrak",
  "wilayah": "Salah satu dari: Kota Madiun | Kab Madiun | Magetan | Ngawi | Ponorogo | Pacitan | Luar Kota Lain",
  "lokasi": "Detail lokasi atau penempatan kerja",
  "syarat": ["Poin syarat 1", "Poin syarat 2", "Poin syarat 3"],
  "benefit": ["Poin gaji harian/bulanan", "Uang lembur & makan", "Mess dsb jika ada"],
  "catatan": "Keterangan tambahan dan ketentuan lain seperti jam kerja, hari panggilan masuk, sistem kerja dsb",
  "kontak_wa": "Nomor WhatsApp (hanya angka, diawali 62)",
  "email": "Alamat email jika ada",
  "link_pendaftaran": "URL formulir online jika ada",
  "is_walk_in": false
}`;

    // Panggil Gemini REST API jika key adalah Google Gemini
    if (apiKey.startsWith('AIza')) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: `Teks Lowongan Mentah:\n${rawText}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const jsonStr = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr.replace(/```json/g, '').replace(/```/g, '').trim());
          return {
            posisi: parsed.posisi || 'Posisi Lowongan',
            nama_perusahaan: parsed.nama_perusahaan || 'Perusahaan Mitra',
            poster_url: '',
            logo_url: '',
            kategori: parsed.kategori || 'Umum',
            tipe: parsed.tipe || 'Full Time',
            wilayah: parsed.wilayah || 'Kota Madiun',
            lokasi: parsed.lokasi || 'Kota Madiun',
            syarat: Array.isArray(parsed.syarat) ? parsed.syarat.join('\n') : (parsed.syarat || ''),
            benefit: Array.isArray(parsed.benefit) ? parsed.benefit.join('\n') : (parsed.benefit || ''),
            catatan: typeof parsed.catatan === 'string' ? parsed.catatan : (Array.isArray(parsed.catatan) ? parsed.catatan.join('\n') : ''),
            kontak_wa: (parsed.kontak_wa || '').replace(/[^0-9]/g, ''),
            email: parsed.email || '',
            link_pendaftaran: parsed.link_pendaftaran || '',
            is_walk_in: Boolean(parsed.is_walk_in),
            alamat_walk_in: '',
            warna_primer: parsed.tipe === 'Freelance' ? '#7C3AED' : '#2B4CE0',
            is_urgent: Boolean(parsed.is_urgent) || /urgent|segera|butuh cepat/i.test(rawText),
            tanggal_mulai: getTodayDateString(),
            tanggal_selesai: addMonths(getTodayDateString(), 1),
            is_manual: true,
          };
        }
      }
    }

    // Jika provider Groq / OpenRouter atau terjadi masalah, gunakan parser lokal
    return parseRawJobTextLocally(rawText);
  } catch (err) {
    console.warn('AI LLM parse error, fallback to local parser:', err);
    return parseRawJobTextLocally(rawText);
  }
}
