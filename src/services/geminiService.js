import { detectWilayah } from '../utils/regionUtils';

/**
 * Multi-Provider AI Vision Integration (100% Free Tier Friendly & Auto-Discovery 2026)
 * Mendukung:
 * 1. Groq Cloud AI (gsk_...) -> Mendukung Native Vision & Hybrid Vision + Llama 3.3 70B (Anti Error "content must be a string")
 * 2. OpenRouter Vision (sk-or-...) -> Auto-Detect Model Vision :free aktif dari /api/v1/models
 * 3. Google Gemini Vision (AIzaSy...) -> Multimodal Google Gemini 2.5 Flash / Flash-Lite
 */

const STORAGE_KEY = 'karmadi_gemini_api_key';
const LEGACY_STORAGE_KEY = 'sicaker_gemini_api_key';
const STORAGE_MODEL_KEY = 'karmadi_gemini_active_model';
const LEGACY_STORAGE_MODEL_KEY = 'sicaker_gemini_active_model';

/**
 * Membuat gambar uji 64x64 piksel yang valid (karena Qwen-VL / Vision menolak gambar 1x1 piksel < 28px)
 */
function createValidTestImage() {
  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('LOKER', 6, 38);
      return canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (e) {}
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

export const POPULAR_GEMINI_MODELS = [
  // Groq Cloud (100% Gratis, Super Cepat, Otomatis Menyesuaikan Vision / Hybrid 70B di Akun Anda)
  {
    id: 'llama-3.3-70b-versatile',
    provider: 'groq',
    name: 'Groq: Llama 3.3 70B / Auto-Vision (100% Gratis • Super Cepat & Stabil)',
    badge: 'Terbaik Gratis',
    keyPrefix: 'gsk_',
    keyUrl: 'https://console.groq.com/keys'
  },
  // OpenRouter (Raja OCR Qwen VL / Gemma 3 Gratis)
  {
    id: 'qwen/qwen2.5-vl-72b-instruct:free',
    provider: 'openrouter',
    name: 'OpenRouter: Qwen VL / Gemma 3 Vision (:free • Auto-Detect)',
    badge: 'Raja OCR',
    keyPrefix: 'sk-or-',
    keyUrl: 'https://openrouter.ai/settings/keys'
  },
  {
    id: 'google/gemma-3-27b-it:free',
    provider: 'openrouter',
    name: 'OpenRouter: Google Gemma 3 27B Vision (100% Gratis)',
    badge: 'Gratis',
    keyPrefix: 'sk-or-',
    keyUrl: 'https://openrouter.ai/settings/keys'
  },
  // Google Gemini (Optimized Free Tier 2026)
  {
    id: 'gemini-3.8-flash',
    provider: 'gemini',
    name: 'Google: Gemini 3.8 Flash (Terbaru 2026 • Akurat & Cepat)',
    badge: 'Rekomendasi',
    keyPrefix: 'AQ.',
    keyUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    id: 'gemini-3.5-flash-lite',
    provider: 'gemini',
    name: 'Google: Gemini 3.5 Flash-Lite (Kuota Gratis Terbesar & Anti-Limit)',
    badge: 'Anti-Limit',
    keyPrefix: 'AQ.',
    keyUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    id: 'gemini-flash-latest',
    provider: 'gemini',
    name: 'Google: Gemini Flash Latest (Otomatis Versi Stabil Terbaru)',
    badge: 'Stabil',
    keyPrefix: 'AIzaSy',
    keyUrl: 'https://aistudio.google.com/app/apikey'
  }
];

export function detectProviderFromKey(apiKey, modelName = '') {
  const key = (apiKey || '').trim();
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('sk-or-')) return 'openrouter';
  if (key.startsWith('AIza') || key.startsWith('AQ.')) return 'gemini';
  if (
    modelName === 'llama-3.3-70b-versatile' ||
    modelName === 'qwen/qwen3.8-27b' ||
    (modelName.includes('llama') && !modelName.includes(':free'))
  ) {
    return 'groq';
  }
  if (modelName.includes(':free') || modelName.includes('/')) return 'openrouter';
  return 'gemini';
}

function getLocalAiConfigEndpoint() {
  if (typeof window === 'undefined') return '/api/ai-config';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal ? '/api/ai-config' : 'http://localhost:5173/api/ai-config';
}

export async function syncAiConfigFromLocalServer() {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(getLocalAiConfigEndpoint());
    const ct = res.headers.get('content-type') || '';
    if (!res.ok || !ct.includes('application/json')) return null;
    const data = await res.json();
    const serverModel = data?.activeModel || data?.model || '';
    const currentLocalKey = getGeminiApiKey();
    if (!currentLocalKey && data?.apiKey) {
      localStorage.setItem(STORAGE_KEY, data.apiKey);
      if (serverModel) {
        localStorage.setItem(STORAGE_MODEL_KEY, JSON.stringify({ model: serverModel, version: 'v1beta' }));
      }
      return { apiKey: data.apiKey, activeModel: serverModel || 'gemini-3.8-flash' };
    }
    if (currentLocalKey && !data?.apiKey) {
      fetch(getLocalAiConfigEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: currentLocalKey, activeModel: getActiveGeminiModel() }),
      }).catch(() => {});
    }
    return data;
  } catch (e) {
    return null;
  }
}

export function getGeminiApiKey() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(STORAGE_KEY) ||
    localStorage.getItem(LEGACY_STORAGE_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  ).trim();
}

export function setGeminiApiKey(key) {
  if (typeof window === 'undefined') return;
  const cleanKey = (key || '').trim();
  if (!cleanKey) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, cleanKey);
  }
  fetch(getLocalAiConfigEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: cleanKey, activeModel: getActiveGeminiModel() }),
  }).catch(() => {});
}

export function getActiveGeminiModel() {
  if (typeof window === 'undefined') return 'gemini-3.8-flash';
  try {
    const stored =
      localStorage.getItem(STORAGE_MODEL_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_MODEL_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const modelStr = typeof parsed === 'string' ? parsed : parsed?.model;
      if (
        modelStr === 'gemini-2.5-flash' ||
        modelStr === 'gemini-2.0-flash' ||
        modelStr === 'gemini-1.5-flash'
      ) {
        return 'gemini-3.8-flash';
      }
      if (modelStr === 'gemini-2.5-flash-lite' || modelStr === 'gemini-2.0-flash-lite') {
        return 'gemini-3.5-flash-lite';
      }
      if (modelStr) return modelStr;
    }
  } catch (e) {}
  return 'gemini-3.8-flash';
}

export function setActiveGeminiModel(modelName) {
  if (typeof window === 'undefined') return;
  const clean = (modelName || 'gemini-3.8-flash').trim().replace(/^models\//, '');
  localStorage.setItem(STORAGE_MODEL_KEY, JSON.stringify({ model: clean, version: 'v1beta' }));
  fetch(getLocalAiConfigEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: getGeminiApiKey(), activeModel: clean }),
  }).catch(() => {});
}

const EXTRACTION_SYSTEM_PROMPT = `Kamu adalah sistem AI Karmadi, platform info lowongan kerja seputar Karesidenan Madiun & rekrutmen swasta profesional.
Analisis poster lowongan kerja ini dengan SANGAT TELITI dan AKURAT (100% berdasarkan teks dan informasi yang benar-benar tertulis di poster).
JANGAN PERNAH mengarang atau menambahkan data dari poster lain yang tidak ada dalam poster ini.

Instruksi Khusus:
1. PISAHKAN POSISI HANYA JIKA POSTER INI SECARA NYATA MEMUAT LEBIH DARI 1 LOWONGAN BERBEDA:
   Jika dalam satu poster terdapat 2 atau lebih posisi yang berbeda (misalnya Kasir dan Driver), buat objek terpisah di dalam array JSON.
   Jika hanya ada 1 lowongan kerja, kembalikan array dengan TEPAT 1 objek saja.
2. Identifikasi data murni dari teks poster:
   - "nama_perusahaan": Nama resmi perusahaan/brand/toko/instansi yang tertera di poster.
   - "posisi": Judul posisi pekerjaan yang dicari dalam poster (perbaiki jika ada salah eja OCR).
   - "kategori": Kategori pekerjaan (Desain / Manufaktur / Retail / F&B / Keuangan / Accounting / Driver / Kasir / Gudang / Sales / Medis / Teknik / Umum).
   - "syarat": Array semua poin kualifikasi dan persyaratan yang tertulis di poster tanpa simbol bullet (contoh: Pria/Wanita, Min SMA, Tidak merokok, Pengalaman packing, dll.).
   - "benefit": Array semua benefit, gaji/upah, tunjangan, uang makan, uang lembur, insentif, komisi, mess, bonus, BPJS, dll. yang tertulis di poster jika ada, contoh: ["Gaji 145rb per hari", "Ada uang lembur dan makan", "Tidak ada mess"]. Beri [] jika tidak ada.
   - "catatan": String keterangan tambahan atau ketentuan lain di luar kualifikasi umum (contoh: jam kerja 09:00-17:00, dalam 1 minggu dipanggil 2-3 hari saat pesanan banyak, masa training, penempatan cabang, pakaian rapi, dll.). Beri "" jika tidak ada.
   - "warna_primer": Kode warna HEX dominan poster (#RRGGBB).
   - "kontak_wa": Nomor WhatsApp resmi jika ada (format angka murni diawali 62, misal "628123456789"), atau "" jika tidak ada.
   - "email": Alamat email pendaftaran/rekrutmen jika ada, atau "" jika tidak ada.
   - "link_pendaftaran": Link/URL formulir pendaftaran langsung jika tertera di poster (contoh: bit.ly/..., forms.gle/..., docs.google.com/forms/..., s.id/..., atau web pendaftaran resmi). Sertakan awalan https:// jika belum ada, atau "" jika tidak ada.
   - "is_walk_in": Boolean (true jika poster mengharuskan pelamar datang langsung membawa berkas fisik / walk-in interview / berkas ditujukan ke alamat fisik tertentu seperti "Lamaran ditujukan ke...", "Drop CV di...", "Datang langsung ke...", false jika online).
   - "alamat_walk_in": Alamat fisik lengkap tujuan penyerahan berkas fisik atau lokasi walk in interview jika diminta datang langsung, contoh "Bakeshop Bakery H.A.Salim 128 Madiun", atau "" jika tidak ada.
   - "wilayah": Klasifikasikan wilayah penempatan ke salah satu dari: "Kota Madiun", "Kab. Madiun", "Magetan", "Ngawi", "Ponorogo", "Pacitan", atau "Luar Kota Lain" (jika di luar Karesidenan Madiun).
   - "lokasi": Alamat atau kota penempatan kerja yang tertulis.
   - "tipe": "Full Time" (atau "Part Time" / "Freelance" / "Magang" sesuai poster).

KEMBALIKAN HANYA FORMAT RAW JSON ARRAY VALID TANPA TEKS PEMBUKA/PENUTUP:
[
  {
    "nama_perusahaan": "string",
    "posisi": "string",
    "kategori": "string",
    "wilayah": "Kota Madiun",
    "syarat": ["string"],
    "benefit": ["string"],
    "catatan": "string",
    "warna_primer": "#0284c7",
    "kontak_wa": "string",
    "email": "string",
    "link_pendaftaran": "string",
    "is_walk_in": false,
    "alamat_walk_in": "string",
    "lokasi": "string",
    "tipe": "Full Time"
  }
]`;

/**
 * Mengambil daftar model aktif langsung dari akun Groq pengguna (/openai/v1/models)
 * Memisahkan kandidat Vision murni dan kandidat LLM 70B/32B (string content)
 */
export async function getGroqAccountModels(apiKey) {
  let allIds = [];
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (res.status === 401) {
      throw new Error('INVALID_GROQ_KEY');
    }
    if (res.ok) {
      const data = await res.json();
      allIds = (data.data || [])
        .filter((m) => m.active !== false)
        .map((m) => m.id)
        .filter((id) => !/whisper|tts|guard|safeguard|embed|rerank|playai|orpheus/i.test(id));
    }
  } catch (e) {
    if (e.message === 'INVALID_GROQ_KEY') throw e;
    console.warn('Gagal mengambil daftar model Groq:', e);
  }

  // Kandidat model yang khusus mendukung Vision (input gambar langsung)
  const visionRegex = /qwen3\.8|vl|vision|pixtral|llava|scout|maverick/i;
  const visionModels = allIds.filter((id) => visionRegex.test(id));

  // Kandidat model LLM pintar (70B/32B) yang menerima string (pasti aktif di semua akun Free Tier Groq)
  const preferredTextOrder = [
    'llama-3.3-70b-versatile',
    'qwen/qwen3-32b',
    'openai/gpt-oss-120b',
    'llama-3.1-8b-instant',
    'gemma2-9b-it'
  ];
  const textModels = [
    ...preferredTextOrder.filter((id) => allIds.includes(id)),
    ...allIds.filter((id) => !visionRegex.test(id)),
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant'
  ];

  return {
    visionModels: [...new Set(visionModels)],
    textModels: [...new Set(textModels)]
  };
}

/**
 * Mengambil daftar model Vision :free aktif langsung dari OpenRouter (/api/v1/models)
 */
export async function getOpenRouterVisionCandidates(preferredModel = '') {
  const defaultFreeVision = [
    'qwen/qwen2.5-vl-72b-instruct:free',
    'google/gemma-3-27b-it:free',
    'google/gemma-3-12b-it:free',
    'qwen/qwen2.5-vl-32b-instruct:free',
    'mistralai/mistral-small-3.1-24b-instruct:free'
  ];

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (res.ok) {
      const data = await res.json();
      const models = data.data || [];
      const liveFreeVision = models
        .filter((m) => {
          const isFree = m.id?.endsWith(':free');
          const inputs = m.architecture?.input_modalities || [];
          const modality = m.architecture?.modality || '';
          const supportsImage =
            inputs.includes('image') ||
            modality.includes('image') ||
            /vl|vision|gemma-3|pixtral/i.test(m.id);
          return isFree && supportsImage;
        })
        .map((m) => m.id);

      return [...new Set([preferredModel, ...liveFreeVision, ...defaultFreeVision].filter(Boolean))];
    }
  } catch (e) {
    console.warn('Gagal mengambil daftar model OpenRouter:', e);
  }

  return [...new Set([preferredModel, ...defaultFreeVision].filter(Boolean))];
}

/**
 * Mengambil daftar nama model aktual yang didukung oleh API Key ini dari Google
 */
export async function getAvailableModelsFromGoogle(apiKey) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (res.ok) {
      const data = await res.json();
      const models = data.models || [];
      return models
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => ({
          model: m.name.replace(/^models\//, ''),
          displayName: m.displayName || m.name,
          version: 'v1beta'
        }));
    }
  } catch (err) {
    console.warn('Gagal memuat ListModels:', err);
  }
  return [];
}

/**
 * Uji coba validitas API Key (Anti-Error untuk Groq, OpenRouter, & Google Gemini)
 */
export async function testGeminiApiKey(key, requestedModel = null) {
  const apiKey = (key || getGeminiApiKey()).trim();
  if (!apiKey) {
    return { success: false, message: 'API Key belum diisi' };
  }

  const provider = detectProviderFromKey(apiKey, requestedModel || '');
  const validTestImg = createValidTestImage();

  // ════════════════════════════════════════════════════════════════════
  // 1. UJI GROQ CLOUD API (gsk_...)
  // ════════════════════════════════════════════════════════════════════
  if (provider === 'groq') {
    let visionModels = [];
    let textModels = [];
    try {
      const discovered = await getGroqAccountModels(apiKey);
      visionModels = discovered.visionModels;
      textModels = discovered.textModels;
    } catch (err) {
      if (err.message === 'INVALID_GROQ_KEY') {
        return {
          success: false,
          message: 'API Key Groq tidak valid (401 Unauthorized). Pastikan menyalin key gsk_... dengan benar.'
        };
      }
    }

    // Tahap 1A: Coba model Vision murni jika tersedia di akun Groq pengguna (dengan gambar 64x64px valid)
    for (const vModel of visionModels.slice(0, 4)) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: vModel,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Jawab OK' },
                  { type: 'image_url', image_url: { url: validTestImg } }
                ]
              }
            ],
            max_tokens: 10
          })
        });

        if (res.ok) {
          setActiveGeminiModel(vModel);
          return {
            success: true,
            activeModel: vModel,
            message: `Koneksi Groq Vision Berhasil! Model "${vModel}" aktif & siap membaca poster.`
          };
        }
      } catch (e) {}
    }

    // Tahap 1B: Gunakan Model Flagship Groq Llama 3.3 70B (Hybrid Vision OCR + 70B AI Reasoning)
    // Mengirimkan content berupa STRING murni agar tidak pernah terkena error "messages[0].content must be a string"
    for (const tModel of textModels.slice(0, 4)) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: tModel,
            messages: [{ role: 'user', content: 'Jawab singkat: OK' }],
            max_tokens: 10
          })
        });

        if (res.ok) {
          setActiveGeminiModel(tModel);
          return {
            success: true,
            activeModel: tModel,
            message: `Koneksi Groq Berhasil! Model "${tModel}" aktif (Mode Hybrid Vision + AI 70B Super Cepat).`
          };
        }
      } catch (e) {}
    }

    return {
      success: false,
      message: 'Gagal menghubungi server Groq. Periksa koneksi internet atau API Key Anda.'
    };
  }

  // ════════════════════════════════════════════════════════════════════
  // 2. UJI OPENROUTER API (sk-or-...) + AUTO-DISCOVERY MODEL VISION FREE
  // ════════════════════════════════════════════════════════════════════
  if (provider === 'openrouter') {
    const candidates = await getOpenRouterVisionCandidates(
      requestedModel && requestedModel.includes('/') ? requestedModel : 'qwen/qwen2.5-vl-72b-instruct:free'
    );

    let lastErrorMsg = '';
    for (const orModel of candidates.slice(0, 8)) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
            'X-Title': 'Karmadi - Info Loker Karesidenan Madiun'
          },
          body: JSON.stringify({
            model: orModel,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Jawab OK' },
                  { type: 'image_url', image_url: { url: validTestImg } }
                ]
              }
            ],
            max_tokens: 10
          })
        });

        if (res.ok) {
          setActiveGeminiModel(orModel);
          return {
            success: true,
            activeModel: orModel,
            message: `Koneksi OpenRouter Vision Berhasil! Model "${orModel}" aktif & siap digunakan.`
          };
        }
        const errData = await res.json().catch(() => ({}));
        lastErrorMsg = errData.error?.message || `OpenRouter HTTP ${res.status}`;
        if (res.status === 401) {
          return { success: false, message: 'API Key OpenRouter tidak valid (401 Unauthorized).' };
        }
      } catch (e) {
        lastErrorMsg = e.message;
      }
    }

    return {
      success: false,
      message: lastErrorMsg || 'Gagal menghubungi OpenRouter Vision.'
    };
  }

  // ════════════════════════════════════════════════════════════════════
  // 3. UJI GOOGLE GEMINI API (AQ.... / AIzaSy...)
  // ════════════════════════════════════════════════════════════════════
  const sanitizedModel =
    requestedModel &&
    requestedModel !== 'gemini-2.5-flash' &&
    requestedModel !== 'gemini-2.0-flash' &&
    requestedModel !== 'gemini-1.5-flash' &&
    !requestedModel.includes('/')
      ? requestedModel
      : 'gemini-3.8-flash';

  const candidateModels = [
    sanitizedModel,
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash'
  ];
  const uniqueModels = [...new Set(candidateModels)].filter((m) => m !== 'gemini-2.0-flash');
  let primaryErrorMsg = '';
  let lastErrorMsg = '';

  for (let idx = 0; idx < uniqueModels.length; idx++) {
    const m = uniqueModels[idx];
    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Halo' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setActiveGeminiModel(m);
        return {
          success: true,
          activeModel: m,
          message: `Koneksi Google Gemini Berhasil! Model ${m} aktif & siap digunakan.`
        };
      }

      const errData = await res.json().catch(() => ({}));
      const currentErrMsg = errData.error?.message || `HTTP ${res.status}`;
      if (idx === 0) primaryErrorMsg = currentErrMsg;
      lastErrorMsg = currentErrMsg;

      // Jika key invalid atau ditolak (400 atau 403), laporkan segera tanpa tertimpa fallback lain
      if (
        res.status === 400 &&
        (currentErrMsg.includes('API_KEY_INVALID') ||
          currentErrMsg.includes('API key not valid') ||
          currentErrMsg.includes('key is invalid'))
      ) {
        return {
          success: false,
          message: 'API Key Google Gemini tidak valid. Silakan buat atau salin key baru dari Google AI Studio.'
        };
      }

      if (res.status === 403 || errData.error?.status === 'PERMISSION_DENIED') {
        return {
          success: false,
          message:
            'Akses Google Gemini ditolak (Permission Denied). Pastikan Generative Language API aktif di Google Cloud/AI Studio, atau gunakan Groq Cloud (gsk_...) yang 100% gratis & bebas limit.'
        };
      }
    } catch (e) {
      const errMsg = e.name === 'AbortError' ? 'Koneksi timeout ke server Google' : e.message;
      if (idx === 0) primaryErrorMsg = errMsg;
      lastErrorMsg = errMsg;
    }
  }

  const errorToReport = primaryErrorMsg || lastErrorMsg;

  if (
    errorToReport.includes('high demand') ||
    errorToReport.includes('quota') ||
    errorToReport.includes('RESOURCE_EXHAUSTED')
  ) {
    setActiveGeminiModel('gemini-3.5-flash-lite');
    return {
      success: true,
      activeModel: 'gemini-3.5-flash-lite',
      message: `API Key Valid! Otomatis dialihkan ke gemini-3.5-flash-lite agar hemat kuota & bebas limit.`
    };
  }

  return {
    success: false,
    message: errorToReport || 'Gagal menghubungi server Google Gemini.'
  };
}

/**
 * Sanitasi & Parsing JSON Tahan Banting dari Respons LLM
 * Mampu memperbaiki literal newline di dalam string ("catatan"), trailing comma, dan markdown fence
 */
export function repairAndParseJson(rawText) {
  let cleaned = (rawText || '').trim();
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Cari blok array JSON [...] atau objek JSON {...} yang mengandung struktur objek loker
  const arrayObjMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayObjMatch) {
    cleaned = arrayObjMatch[0];
  } else {
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      cleaned = objMatch[0];
    }
  }

  // Sanitasi karakter newline/tab mentah di dalam string literal JSON agar tidak memicu SyntaxError
  let sanitized = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (isEscaped) {
      sanitized += ch;
      isEscaped = false;
      continue;
    }
    if (ch === '\\') {
      sanitized += ch;
      isEscaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      sanitized += ch;
      continue;
    }
    if (inString) {
      if (ch === '\n') {
        sanitized += '\\n';
        continue;
      }
      if (ch === '\r') {
        continue;
      }
      if (ch === '\t') {
        sanitized += ' ';
        continue;
      }
    }
    sanitized += ch;
  }

  // Hapus trailing comma sebelum ] atau }
  sanitized = sanitized.replace(/,\s*([\]}])/g, '$1');

  return JSON.parse(sanitized);
}

/**
 * Helper mem-parsing JSON array dari teks respons LLM apa pun
 */
function parseJobsJsonResponse(rawText, engineLabel, fallbackColor = '#0284c7') {
  const parsed = repairAndParseJson(rawText);
  const jobsArray = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.jobs)
    ? parsed.jobs
    : Array.isArray(parsed?.lowongan)
    ? parsed.lowongan
    : [parsed];

  return jobsArray.map((j) => {
    let rawLink = (j.link_pendaftaran || j.link || j.link_daftar || j.url || '').trim();
    if (rawLink && !rawLink.startsWith('http://') && !rawLink.startsWith('https://')) {
      rawLink = `https://${rawLink}`;
    }

    return {
      nama_perusahaan: j.nama_perusahaan || 'Perusahaan Rekrutmen Mitra',
      posisi: j.posisi || 'Staff Operasional',
      kategori: j.kategori || 'Umum',
      syarat:
        Array.isArray(j.syarat) && j.syarat.length > 0
          ? j.syarat
          : typeof j.syarat === 'string' && j.syarat.trim()
          ? j.syarat.split('\n').map((s) => s.trim()).filter(Boolean)
          : ['Kualifikasi dapat ditanyakan langsung ke kontak perusahaan'],
      benefit: Array.isArray(j.benefit)
        ? j.benefit
        : typeof j.benefit === 'string' && j.benefit.trim()
        ? j.benefit.split('\n').map((b) => b.trim()).filter(Boolean)
        : [],
      catatan:
        typeof j.catatan === 'string'
          ? j.catatan
          : Array.isArray(j.catatan)
          ? j.catatan.join('\n')
          : '',
      warna_primer: /^#[0-9A-Fa-f]{6}$/.test(j.warna_primer) ? j.warna_primer : fallbackColor,
      kontak_wa: j.kontak_wa ? String(j.kontak_wa).replace(/[^0-9]/g, '') : '',
      email: j.email || '',
      link_pendaftaran: rawLink,
      is_walk_in: Boolean(j.is_walk_in || j.walk_in || (j.alamat_walk_in && String(j.alamat_walk_in).trim().length > 3)),
      alamat_walk_in: j.alamat_walk_in || j.alamat_tujuan || j.alamat_fisik || '',
      wilayah: j.wilayah || detectWilayah(j.lokasi || j.alamat_walk_in, j.syarat),
      lokasi: j.lokasi || 'Kota Madiun',
      tipe: j.tipe || 'Full Time',
      engine_used: engineLabel
    };
  });
}

/**
 * Ekstraksi loker multimodal (Mendukung Groq Vision / Hybrid 70B, OpenRouter Vision, dan Google Gemini)
 */
export async function extractWithGeminiVision(base64DataUrl, onProgress, getOcrDataFn = null) {
  let apiKey = getGeminiApiKey();
  if (!apiKey) {
    const synced = await syncAiConfigFromLocalServer();
    if (synced?.apiKey) {
      apiKey = synced.apiKey;
    }
  }
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const selectedModel = getActiveGeminiModel();
  const provider = detectProviderFromKey(apiKey, selectedModel);

  // ════════════════════════════════════════════════════════════════════
  // A. PROVIDER 1: GROQ CLOUD (Native Vision ATAU Hybrid OCR + Llama 3.3 70B)
  // ════════════════════════════════════════════════════════════════════
  if (provider === 'groq') {
    const { visionModels, textModels } = await getGroqAccountModels(apiKey);
    const groqVisionList = [
      ...new Set([
        ...visionModels,
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'meta-llama/llama-4-maverick-17b-128e-instruct',
      ]),
    ];

    // 1. Coba model Vision murni di akun Groq pengguna terlebih dahulu
    for (const vModel of groqVisionList.slice(0, 4)) {
      try {
        if (onProgress) onProgress(`Memindai gambar dengan Groq Vision (${vModel.split('/')[1] || vModel})...`);
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: vModel,
            temperature: 0.1,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: EXTRACTION_SYSTEM_PROMPT },
                  { type: 'image_url', image_url: { url: base64DataUrl } }
                ]
              }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            setActiveGeminiModel(vModel);
            return parseJobsJsonResponse(content, `Groq Vision (${vModel.split('/')[1] || vModel})`);
          }
        }
      } catch (e) {}
    }

    // 2. Hybrid Vision + Groq Llama 3.3 70B (Menggunakan string content sehingga 100% bebas error)
    if (getOcrDataFn) {
      if (onProgress) onProgress('Membaca teks visual poster untuk dianalisis Groq Llama 3.3 70B...');
      const ocrData = await getOcrDataFn();
      const rawOcrText = (ocrData?.rawText || '').trim();
      const domColor = ocrData?.dominantColor || '#0284c7';

      if (rawOcrText.length > 5) {
        let lastErr = '';
        for (const tModel of textModels.slice(0, 3)) {
          try {
            if (onProgress) onProgress(`Menyusun data loker dengan Groq AI (${tModel})...`);
            const hybridPrompt = `${EXTRACTION_SYSTEM_PROMPT}

Warna dominan poster yang terdeteksi dari gambar: "${domColor}"
Nama file poster: "${ocrData?.fileName || 'poster.jpg'}"

Berikut adalah hasil pembacaan teks mentah (OCR) dari gambar poster lowongan kerja tersebut. Perbaiki jika ada huruf yang salah terbaca oleh kamera/OCR, abaikan simbol sampah, dan ekstrak seluruh informasi lowongan kerja secara akurat sesuai isi teks di bawah ini:
"""
${rawOcrText}
"""`;

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: tModel,
                temperature: 0.1,
                messages: [
                  {
                    role: 'user',
                    content: hybridPrompt
                  }
                ]
              })
            });

            if (res.ok) {
              const data = await res.json();
              const content = data.choices?.[0]?.message?.content;
              if (content) {
                setActiveGeminiModel(tModel);
                return parseJobsJsonResponse(content, `Groq AI (${tModel})`, domColor);
              }
            } else {
              const err = await res.json().catch(() => ({}));
              lastErr = err.error?.message || `HTTP ${res.status}`;
            }
          } catch (e) {
            lastErr = e.message;
          }
        }
        throw new Error(lastErr || 'Gagal mengekstrak dengan Groq AI.');
      }
    }

    throw new Error('Gagal membaca gambar dengan Groq.');
  }

  // ════════════════════════════════════════════════════════════════════
  // B. PROVIDER 2: OPENROUTER FREE VISION (Auto-Discovery :free Vision)
  // ════════════════════════════════════════════════════════════════════
  if (provider === 'openrouter') {
    const preferred = selectedModel.includes('/') ? selectedModel : 'qwen/qwen2.5-vl-72b-instruct:free';
    const uniqueOr = await getOpenRouterVisionCandidates(preferred);
    let lastErr = '';

    for (const m of uniqueOr.slice(0, 6)) {
      try {
        if (onProgress) onProgress(`Memindai gambar dengan OpenRouter (${m.split('/')[1] || m})...`);
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
            'X-Title': 'Karmadi - Info Loker Karesidenan Madiun'
          },
          body: JSON.stringify({
            model: m,
            temperature: 0.1,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: EXTRACTION_SYSTEM_PROMPT },
                  { type: 'image_url', image_url: { url: base64DataUrl } }
                ]
              }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            setActiveGeminiModel(m);
            return parseJobsJsonResponse(content, `OpenRouter (${m.split('/')[1] || m})`);
          }
        } else {
          const err = await res.json().catch(() => ({}));
          lastErr = err.error?.message || `HTTP ${res.status}`;
        }
      } catch (e) {
        lastErr = e.message;
      }
    }
    throw new Error(lastErr || 'Gagal mengekstrak dengan OpenRouter Vision.');
  }

  // ════════════════════════════════════════════════════════════════════
  // C. PROVIDER 3: GOOGLE GEMINI VISION (Mode Cepat Anti-Timeout)
  // ════════════════════════════════════════════════════════════════════
  const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  let mimeType = 'image/jpeg';
  let cleanBase64 = base64DataUrl;

  if (matches) {
    mimeType = matches[1];
    cleanBase64 = matches[2];
  }

  const cleanSelected =
    selectedModel &&
    selectedModel !== 'gemini-2.5-flash' &&
    selectedModel !== 'gemini-2.0-flash' &&
    selectedModel !== 'gemini-1.5-flash' &&
    !selectedModel.includes('/')
      ? selectedModel
      : 'gemini-3.8-flash';
  const candidateModels = [
    cleanSelected,
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash'
  ];
  const uniqueModels = [...new Set(candidateModels)].filter(
    (m) => m !== 'gemini-2.0-flash' && m !== 'gemini-1.5-flash'
  );

  let rawText = '';
  let lastError = null;
  let successfulModel = cleanSelected;

  for (let idx = 0; idx < uniqueModels.length; idx++) {
    const currentModel = uniqueModels[idx];
    try {
      if (onProgress) onProgress(`Memindai dengan Google Gemini (${currentModel})...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: EXTRACTION_SYSTEM_PROMPT },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: cleanBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const answerPart = parts.find((p) => !p.thought && p.text) || parts[0];
        const candidateText = answerPart?.text;
        if (candidateText) {
          rawText = candidateText;
          successfulModel = currentModel;
          setActiveGeminiModel(currentModel);
          break;
        }
      } else {
        const err = await res.json().catch(() => ({}));
        lastError = err.error?.message || `HTTP ${res.status}`;
        if (res.status === 429) {
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
    } catch (e) {
      lastError = e.name === 'AbortError' ? `Timeout menghubungkan ke model ${currentModel}` : e.message;
    }
  }

  if (!rawText) {
    throw new Error(lastError || 'Gagal mengekstrak poster dengan model Gemini yang tersedia.');
  }

  return parseJobsJsonResponse(rawText, `Gemini Vision (${successfulModel})`);
}

/**
 * Ekstraksi Teks Loker Mentah Menggunakan AI (Mendukung Groq, OpenRouter, & Google Gemini)
 */
export async function extractJobTextWithAI(rawText, systemPrompt) {
  let apiKey = getGeminiApiKey();
  if (!apiKey) {
    const synced = await syncAiConfigFromLocalServer();
    if (synced?.apiKey) apiKey = synced.apiKey;
  }
  if (!apiKey) return null;

  const selectedModel = getActiveGeminiModel();
  const provider = detectProviderFromKey(apiKey, selectedModel);
  const fullPrompt = `${systemPrompt}\n\nTeks Lowongan Mentah:\n"""\n${rawText}\n"""`;

  if (provider === 'groq') {
    const { textModels } = await getGroqAccountModels(apiKey);
    for (const tModel of textModels.slice(0, 3)) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: tModel,
            temperature: 0.1,
            messages: [{ role: 'user', content: fullPrompt }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return repairAndParseJson(content);
        }
      } catch (e) {}
    }
    return null;
  }

  if (provider === 'openrouter') {
    const candidates = await getOpenRouterVisionCandidates(
      selectedModel.includes('/') ? selectedModel : 'google/gemma-3-27b-it:free'
    );
    for (const m of candidates.slice(0, 4)) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
            'X-Title': 'Karmadi - Info Loker Karesidenan Madiun'
          },
          body: JSON.stringify({
            model: m,
            temperature: 0.1,
            messages: [{ role: 'user', content: fullPrompt }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return repairAndParseJson(content);
        }
      } catch (e) {}
    }
    return null;
  }

  // Google Gemini
  const cleanSelected =
    selectedModel &&
    selectedModel !== 'gemini-2.5-flash' &&
    selectedModel !== 'gemini-2.0-flash' &&
    selectedModel !== 'gemini-1.5-flash' &&
    !selectedModel.includes('/')
      ? selectedModel
      : 'gemini-3.8-flash';
  const models = [
    ...new Set([
      cleanSelected,
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash'
    ])
  ];

  for (const m of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const answerPart = parts.find((p) => !p.thought && p.text) || parts[0];
        if (answerPart?.text) {
          return repairAndParseJson(answerPart.text);
        }
      }
    } catch (e) {}
  }

  return null;
}
