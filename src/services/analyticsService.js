/**
 * Service Analitik Pengunjung & Performa Lowongan Kerja (KARMADI)
 * Mencatat aktivitas real-time pengunjung (Page Views, Unique Visitors, Klik Loker,
 * Klik Lamar WA/Email/Form, Share Loker, Distribusi Wilayah, Perangkat, dan Sumber Trafik).
 * Menyimpan data secara persisten di localStorage + sinkronisasi ke endpoint /api/analytics.
 */

import { getTodayDateString, addDays, formatDateIndo } from '../utils/dateUtils';
import { detectWilayah } from '../utils/regionUtils';

const ANALYTICS_STORAGE_KEY = 'karmadi_analytics_data_v1';
const VISITOR_SESSION_KEY = 'karmadi_visitor_id_v1';
const LAST_VISIT_DATE_KEY = 'karmadi_last_visit_date_v1';

/**
 * Membuat ID unik anonim untuk mengenali pengunjung unik di perangkat yang sama
 */
function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return 'server';
  let vid = localStorage.getItem(VISITOR_SESSION_KEY);
  if (!vid) {
    vid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem(VISITOR_SESSION_KEY, vid);
  }
  return vid;
}

/**
 * Mendeteksi jenis perangkat pengunjung
 */
function detectDeviceType() {
  if (typeof window === 'undefined') return 'mobile';
  const ua = window.navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Mendeteksi sumber kedatangan pengunjung (Referrer / UTM / Deep Link)
 */
function detectTrafficSource() {
  if (typeof window === 'undefined') return 'direct';
  const ref = (document.referrer || '').toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  const hasLokerParam = urlParams.has('loker') || urlParams.has('q');

  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  ) {
    return 'pwa';
  }
  if (ref.includes('whatsapp') || ref.includes('wa.me') || hasLokerParam) {
    return 'whatsapp';
  }
  if (ref.includes('facebook') || ref.includes('fb.com') || ref.includes('fb.me')) {
    return 'facebook';
  }
  if (ref.includes('instagram') || ref.includes('tiktok') || ref.includes('t.co')) {
    return 'social';
  }
  if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) {
    return 'search';
  }
  return 'direct';
}

/**
 * Struktur data default analitik
 */
function createDefaultAnalytics() {
  const today = getTodayDateString();
  const dailyHistory = {};

  // Inisialisasi slot 7 hari terakhir
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    dailyHistory[d] = {
      date: d,
      views: 0,
      uniqueVisitors: 0,
      jobClicks: 0,
      applyClicks: 0,
      shareClicks: 0,
    };
  }

  return {
    totalPageViews: 0,
    totalUniqueVisitors: 0,
    totalJobViews: 0,
    totalApplyClicks: 0,
    totalShareClicks: 0,
    applyBreakdown: {
      whatsapp: 0,
      email: 0,
      form: 0,
    },
    deviceBreakdown: {
      mobile: 0,
      desktop: 0,
    },
    sourceBreakdown: {
      whatsapp: 0,
      facebook: 0,
      social: 0,
      search: 0,
      pwa: 0,
      direct: 0,
    },
    regionViews: {
      'Kota Madiun': 0,
      'Kab. Madiun': 0,
      Magetan: 0,
      Ngawi: 0,
      Ponorogo: 0,
      Pacitan: 0,
    },
    jobStats: {}, // { [jobId]: { id, posisi, nama_perusahaan, wilayah, views, applies, shares, lastViewedAt } }
    dailyHistory,
    recentEvents: [], // Max 30 events terbaru
    updatedAt: Date.now(),
  };
}

/**
 * Membaca data analitik dari localStorage
 */
export function getAnalyticsData() {
  if (typeof window === 'undefined') return createDefaultAnalytics();
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultAnalytics();
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const base = createDefaultAnalytics();

    // Pastikan tanggal 7 hari terakhir selalu tersedia
    const mergedDaily = { ...base.dailyHistory, ...(parsed.dailyHistory || {}) };

    return {
      ...base,
      ...parsed,
      applyBreakdown: { ...base.applyBreakdown, ...(parsed.applyBreakdown || {}) },
      deviceBreakdown: { ...base.deviceBreakdown, ...(parsed.deviceBreakdown || {}) },
      sourceBreakdown: { ...base.sourceBreakdown, ...(parsed.sourceBreakdown || {}) },
      regionViews: { ...base.regionViews, ...(parsed.regionViews || {}) },
      jobStats: parsed.jobStats || {},
      dailyHistory: mergedDaily,
      recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents.slice(0, 30) : [],
    };
  } catch (err) {
    console.warn('Gagal membaca analitik:', err);
    return createDefaultAnalytics();
  }
}

/**
 * Menyimpan data analitik ke localStorage & sinkronisasi ke backend lokal jika tersedia
 */
function saveAnalyticsData(data) {
  if (typeof window === 'undefined') return;
  try {
    data.updatedAt = Date.now();
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));

    // Non-blocking sync ke server lokal (/api/analytics)
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  } catch (err) {
    console.warn('Gagal menyimpan analitik:', err);
  }
}

/**
 * Sinkronisasi data analitik dari server (/api/analytics)
 */
export async function syncAnalyticsFromServer() {
  try {
    const res = await fetch('/api/analytics');
    if (!res.ok) return getAnalyticsData();
    const serverData = await res.json();
    const localData = getAnalyticsData();

    if (serverData && (serverData.totalPageViews || 0) > (localData.totalPageViews || 0)) {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(serverData));
      return getAnalyticsData();
    }
    return localData;
  } catch {
    return getAnalyticsData();
  }
}

/**
 * Helper memastikan bucket harian hari ini ada
 */
function ensureTodayBucket(data) {
  const today = getTodayDateString();
  if (!data.dailyHistory[today]) {
    data.dailyHistory[today] = {
      date: today,
      views: 0,
      uniqueVisitors: 0,
      jobClicks: 0,
      applyClicks: 0,
      shareClicks: 0,
    };
  }
  return data.dailyHistory[today];
}

/**
 * Helper menambahkan log aktivitas real-time
 */
function pushRecentEvent(data, type, label, detail = '') {
  const evt = {
    id: Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type, // 'visit' | 'view_job' | 'apply_wa' | 'apply_email' | 'apply_form' | 'share' | 'filter_region'
    label,
    detail,
    timestamp: Date.now(),
  };
  data.recentEvents = [evt, ...(data.recentEvents || [])].slice(0, 30);
}

/**
 * 1. Catat Kunjungan Halaman Beranda (Page View & Unique Visitor)
 */
export function trackPageVisit() {
  const data = getAnalyticsData();
  const today = getTodayDateString();
  const bucket = ensureTodayBucket(data);

  getOrCreateVisitorId();
  const lastVisitDate = localStorage.getItem(LAST_VISIT_DATE_KEY);
  const isNewUniqueToday = lastVisitDate !== today;

  data.totalPageViews = (data.totalPageViews || 0) + 1;
  bucket.views = (bucket.views || 0) + 1;

  if (isNewUniqueToday) {
    data.totalUniqueVisitors = (data.totalUniqueVisitors || 0) + 1;
    bucket.uniqueVisitors = (bucket.uniqueVisitors || 0) + 1;
    localStorage.setItem(LAST_VISIT_DATE_KEY, today);
  }

  const device = detectDeviceType();
  data.deviceBreakdown[device] = (data.deviceBreakdown[device] || 0) + 1;

  const source = detectTrafficSource();
  data.sourceBreakdown[source] = (data.sourceBreakdown[source] || 0) + 1;

  const sourceLabels = {
    whatsapp: 'Tautan Saluran / Chat WhatsApp',
    facebook: 'Grup Facebook Loker',
    social: 'Instagram / TikTok',
    search: 'Pencarian Google',
    pwa: 'Aplikasi Layar Utama HP',
    direct: 'Akses Langsung Browser',
  };

  pushRecentEvent(
    data,
    'visit',
    `Pengunjung membuka Beranda KARMADI`,
    `${device === 'mobile' ? '📱 HP' : '💻 Desktop'} • via ${sourceLabels[source] || 'Browser'}`
  );

  saveAnalyticsData(data);
}

/**
 * 2. Catat Klik / Buka Detail Lowongan Kerja
 */
export function trackJobView(job) {
  if (!job || !job.id) return;
  const data = getAnalyticsData();
  const bucket = ensureTodayBucket(data);

  data.totalJobViews = (data.totalJobViews || 0) + 1;
  bucket.jobClicks = (bucket.jobClicks || 0) + 1;

  const wilayah = detectWilayah(job) || 'Kota Madiun';
  if (data.regionViews[wilayah] !== undefined) {
    data.regionViews[wilayah] = (data.regionViews[wilayah] || 0) + 1;
  }

  const jobId = String(job.id);
  const existing = data.jobStats[jobId] || {
    id: job.id,
    posisi: job.posisi || 'Lowongan Kerja',
    nama_perusahaan: job.nama_perusahaan || 'Perusahaan Mitra',
    wilayah,
    views: 0,
    applies: 0,
    shares: 0,
  };

  existing.posisi = job.posisi || existing.posisi;
  existing.nama_perusahaan = job.nama_perusahaan || existing.nama_perusahaan;
  existing.wilayah = wilayah;
  existing.views = (existing.views || 0) + 1;
  existing.lastViewedAt = Date.now();

  data.jobStats[jobId] = existing;

  pushRecentEvent(
    data,
    'view_job',
    `Melihat loker: ${existing.posisi}`,
    `${existing.nama_perusahaan} (${wilayah})`
  );

  saveAnalyticsData(data);
}

/**
 * 3. Catat Klik Tombol Melamar (WhatsApp / Email / Formulir Online)
 */
export function trackJobApply(job, channel = 'whatsapp') {
  const data = getAnalyticsData();
  const bucket = ensureTodayBucket(data);

  data.totalApplyClicks = (data.totalApplyClicks || 0) + 1;
  bucket.applyClicks = (bucket.applyClicks || 0) + 1;

  const cleanChannel = ['whatsapp', 'email', 'form'].includes(channel) ? channel : 'whatsapp';
  data.applyBreakdown[cleanChannel] = (data.applyBreakdown[cleanChannel] || 0) + 1;

  if (job && job.id) {
    const jobId = String(job.id);
    const wilayah = detectWilayah(job) || 'Kota Madiun';
    const existing = data.jobStats[jobId] || {
      id: job.id,
      posisi: job.posisi || 'Lowongan Kerja',
      nama_perusahaan: job.nama_perusahaan || 'Perusahaan Mitra',
      wilayah,
      views: 1,
      applies: 0,
      shares: 0,
    };
    existing.applies = (existing.applies || 0) + 1;
    existing.lastAppliedAt = Date.now();
    data.jobStats[jobId] = existing;
  }

  const channelLabel =
    cleanChannel === 'whatsapp'
      ? 'WhatsApp Cepat'
      : cleanChannel === 'email'
      ? 'Email Rekrutmen'
      : 'Formulir Online';

  pushRecentEvent(
    data,
    `apply_${cleanChannel}`,
    `Pelamar klik Lamar via ${channelLabel}`,
    job ? `${job.posisi} — ${job.nama_perusahaan}` : 'Katalog KARMADI'
  );

  saveAnalyticsData(data);
}

/**
 * 4. Catat Klik Bagikan Loker (Share)
 */
export function trackJobShare(job) {
  const data = getAnalyticsData();
  const bucket = ensureTodayBucket(data);

  data.totalShareClicks = (data.totalShareClicks || 0) + 1;
  bucket.shareClicks = (bucket.shareClicks || 0) + 1;

  if (job && job.id) {
    const jobId = String(job.id);
    const wilayah = detectWilayah(job) || 'Kota Madiun';
    const existing = data.jobStats[jobId] || {
      id: job.id,
      posisi: job.posisi || 'Lowongan Kerja',
      nama_perusahaan: job.nama_perusahaan || 'Perusahaan Mitra',
      wilayah,
      views: 1,
      applies: 0,
      shares: 0,
    };
    existing.shares = (existing.shares || 0) + 1;
    data.jobStats[jobId] = existing;
  }

  pushRecentEvent(
    data,
    'share',
    `Membagikan tautan loker`,
    job ? `${job.posisi} (${job.nama_perusahaan})` : 'Tautan KARMADI'
  );

  saveAnalyticsData(data);
}

/**
 * 5. Catat Filter Wilayah
 */
export function trackRegionFilter(wilayah) {
  if (!wilayah) return;
  const data = getAnalyticsData();
  if (data.regionViews[wilayah] !== undefined) {
    data.regionViews[wilayah] = (data.regionViews[wilayah] || 0) + 1;
    saveAnalyticsData(data);
  }
}

/**
 * Reset seluruh data analitik ke 0
 */
export function resetAnalyticsData() {
  const fresh = createDefaultAnalytics();
  saveAnalyticsData(fresh);
  return fresh;
}
