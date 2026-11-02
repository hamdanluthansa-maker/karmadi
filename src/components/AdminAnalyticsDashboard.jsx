import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
  Share2,
  MapPin,
  Smartphone,
  Monitor,
  RefreshCw,
  Download,
  Trash2,
  TrendingUp,
  MessageCircle,
  Mail,
  Globe,
  Activity,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  Building2,
  Search,
} from 'lucide-react';
import {
  getAnalyticsData,
  syncAnalyticsFromServer,
  resetAnalyticsData,
} from '../services/analyticsService';
import { useJobs } from '../context/JobContext';
import { detectWilayah } from '../utils/regionUtils';
import { getTodayDateString, addDays } from '../utils/dateUtils';

const WILAYAH_LIST = [
  'Kota Madiun',
  'Kab. Madiun',
  'Magetan',
  'Ngawi',
  'Ponorogo',
  'Pacitan',
];

function formatRelativeTime(timestamp) {
  if (!timestamp) return '-';
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 15) return 'Baru saja';
  if (diffSec < 60) return `${diffSec} detik lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

function formatShortDayLabel(dateStr) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const hari = dt.toLocaleDateString('id-ID', { weekday: 'short' });
    const tgl = dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    return `${hari}, ${tgl}`;
  } catch {
    return dateStr;
  }
}

export default function AdminAnalyticsDashboard() {
  const { jobs } = useJobs();
  const [analytics, setAnalytics] = useState(() => getAnalyticsData());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('views'); // 'views' | 'applies' | 'ctr'
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const loadAnalytics = async () => {
    setIsRefreshing(true);
    const synced = await syncAnalyticsFromServer();
    setAnalytics(synced);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(() => {
      setAnalytics(getAnalyticsData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = getTodayDateString();
  const todayStats = analytics.dailyHistory?.[todayStr] || {
    views: 0,
    uniqueVisitors: 0,
    jobClicks: 0,
    applyClicks: 0,
    shareClicks: 0,
  };

  // Data grafik 7 hari terakhir berurutan
  const last7DaysData = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(todayStr, -i);
      const bucket = analytics.dailyHistory?.[d] || {
        date: d,
        views: 0,
        uniqueVisitors: 0,
        jobClicks: 0,
        applyClicks: 0,
        shareClicks: 0,
      };
      result.push({
        ...bucket,
        date: d,
        label: formatShortDayLabel(d),
        isToday: d === todayStr,
      });
    }
    return result;
  }, [analytics.dailyHistory, todayStr]);

  const maxDailyValue = useMemo(() => {
    let max = 10;
    last7DaysData.forEach((item) => {
      if (item.views > max) max = item.views;
      if (item.jobClicks > max) max = item.jobClicks;
      if (item.applyClicks > max) max = item.applyClicks;
    });
    return max;
  }, [last7DaysData]);

  // Rasio Konversi Melamar dari Total Klik Loker
  const conversionRate = useMemo(() => {
    const views = analytics.totalJobViews || 0;
    const applies = analytics.totalApplyClicks || 0;
    if (views === 0) return '0.0';
    return Math.min(100, (applies / views) * 100).toFixed(1);
  }, [analytics.totalJobViews, analytics.totalApplyClicks]);

  // Gabungkan statistik per loker dengan daftar lowongan aktif di database
  const rankedJobs = useMemo(() => {
    const statsMap = { ...(analytics.jobStats || {}) };
    const combined = [];
    const seenIds = new Set();

    jobs.forEach((job) => {
      const idStr = String(job.id);
      seenIds.add(idStr);
      const st = statsMap[idStr] || {};
      const views = st.views || 0;
      const applies = st.applies || 0;
      const shares = st.shares || 0;
      const ctr = views > 0 ? Math.min(100, (applies / views) * 100) : 0;

      combined.push({
        id: job.id,
        posisi: job.posisi || 'Lowongan Kerja',
        nama_perusahaan: job.nama_perusahaan || 'Perusahaan Mitra',
        wilayah: job.wilayah || detectWilayah(job) || 'Kota Madiun',
        tipe: job.tipe || 'Full Time',
        is_urgent: Boolean(job.is_urgent),
        views,
        applies,
        shares,
        ctr,
        lastViewedAt: st.lastViewedAt || null,
        isActive: true,
      });
    });

    // Masukkan juga loker yang ada di histori analitik meski sudah dihapus
    Object.entries(statsMap).forEach(([idStr, st]) => {
      if (!seenIds.has(idStr)) {
        const views = st.views || 0;
        const applies = st.applies || 0;
        const shares = st.shares || 0;
        const ctr = views > 0 ? Math.min(100, (applies / views) * 100) : 0;
        combined.push({
          id: st.id || idStr,
          posisi: st.posisi || 'Lowongan Terarsip',
          nama_perusahaan: st.nama_perusahaan || 'Perusahaan Mitra',
          wilayah: st.wilayah || 'Kota Madiun',
          tipe: 'Full Time',
          is_urgent: false,
          views,
          applies,
          shares,
          ctr,
          lastViewedAt: st.lastViewedAt || null,
          isActive: false,
        });
      }
    });

    const filtered = combined.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.posisi.toLowerCase().includes(q) ||
        item.nama_perusahaan.toLowerCase().includes(q) ||
        item.wilayah.toLowerCase().includes(q)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'applies') {
        if (b.applies !== a.applies) return b.applies - a.applies;
        return b.views - a.views;
      }
      if (sortBy === 'ctr') {
        if (b.ctr !== a.ctr) return b.ctr - a.ctr;
        return b.applies - a.applies;
      }
      if (b.views !== a.views) return b.views - a.views;
      return b.applies - a.applies;
    });
  }, [jobs, analytics.jobStats, sortBy, searchQuery]);

  // Statistik Distribusi Wilayah (Minat Pengunjung vs Jumlah Loker)
  const regionStats = useMemo(() => {
    const totalRegionViews = Object.values(analytics.regionViews || {}).reduce(
      (acc, v) => acc + (v || 0),
      0
    );

    const jobCountByRegion = {};
    WILAYAH_LIST.forEach((w) => {
      jobCountByRegion[w] = 0;
    });
    jobs.forEach((j) => {
      const w = j.wilayah || detectWilayah(j) || 'Kota Madiun';
      if (jobCountByRegion[w] !== undefined) {
        jobCountByRegion[w] += 1;
      }
    });

    return WILAYAH_LIST.map((wilayah) => {
      const views = analytics.regionViews?.[wilayah] || 0;
      const pct = totalRegionViews > 0 ? Math.round((views / totalRegionViews) * 100) : 0;
      return {
        wilayah,
        views,
        pct,
        jobCount: jobCountByRegion[wilayah] || 0,
      };
    }).sort((a, b) => b.views - a.views || b.jobCount - a.jobCount);
  }, [analytics.regionViews, jobs]);

  // Breakdown Perangkat
  const deviceStats = useMemo(() => {
    const mobile = analytics.deviceBreakdown?.mobile || 0;
    const desktop = analytics.deviceBreakdown?.desktop || 0;
    const total = mobile + desktop;
    return {
      mobile,
      desktop,
      mobilePct: total > 0 ? Math.round((mobile / total) * 100) : 0,
      desktopPct: total > 0 ? Math.round((desktop / total) * 100) : 0,
    };
  }, [analytics.deviceBreakdown]);

  // Breakdown Sumber Trafik
  const sourceStats = useMemo(() => {
    const sb = analytics.sourceBreakdown || {};
    const items = [
      { key: 'whatsapp', label: 'WhatsApp (Saluran / Grup / Share)', count: sb.whatsapp || 0, color: 'bg-emerald-500' },
      { key: 'direct', label: 'Akses Langsung Browser', count: sb.direct || 0, color: 'bg-[#2B4CE0]' },
      { key: 'pwa', label: 'Aplikasi Terpasang (PWA HP)', count: sb.pwa || 0, color: 'bg-indigo-600' },
      { key: 'facebook', label: 'Facebook Grup Loker', count: sb.facebook || 0, color: 'bg-blue-500' },
      { key: 'social', label: 'Instagram / TikTok', count: sb.social || 0, color: 'bg-pink-500' },
      { key: 'search', label: 'Pencarian Google', count: sb.search || 0, color: 'bg-amber-500' },
    ];
    const total = items.reduce((acc, i) => acc + i.count, 0);
    return items.map((item) => ({
      ...item,
      pct: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  }, [analytics.sourceBreakdown]);

  // Ekspor CSV Laporan Analitik Loker
  const handleExportCsv = () => {
    const headers = [
      'Peringkat',
      'Posisi Lowongan',
      'Nama Perusahaan',
      'Wilayah',
      'Tipe Kerja',
      'Jumlah Dilihat (Views)',
      'Jumlah Klik Lamar (Applies)',
      'Jumlah Dibagikan (Shares)',
      'Rasio Konversi (%)',
    ];
    const rows = rankedJobs.map((j, idx) => [
      idx + 1,
      `"${(j.posisi || '').replace(/"/g, '""')}"`,
      `"${(j.nama_perusahaan || '').replace(/"/g, '""')}"`,
      `"${j.wilayah}"`,
      `"${j.tipe}"`,
      j.views,
      j.applies,
      j.shares,
      `${j.ctr.toFixed(1)}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Analitik_KARMADI_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    const fresh = resetAnalyticsData();
    setAnalytics(fresh);
    setConfirmReset(false);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER DASHBOARD & TOMBOL AKSI ── */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#2B4CE0] text-[11px] font-black uppercase tracking-wider border border-[#2B4CE0]/20">
            <Activity className="w-3.5 h-3.5 text-[#2B4CE0]" />
            <span>Real-Time Visitor & Job Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Analisa Pengunjung & Performa Loker
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Pantau trafik kunjungan beranda, minat wilayah Karesidenan Madiun, hingga jumlah klik lamaran di setiap lowongan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={loadAnalytics}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2B4CE0]' : ''}`} />
            <span>Segarkan Data</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#2B4CE0] hover:bg-[#1E3AB8] text-white shadow-sm shadow-[#2B4CE0]/25 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#A3F742]" />
            <span>Unduh Laporan CSV</span>
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
              title="Reset seluruh angka statistik kembali ke 0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 px-2.5 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-rose-800">Yakin reset?</span>
              <button
                type="button"
                onClick={handleReset}
                className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-black cursor-pointer"
              >
                Ya, Hapus
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 rounded-lg bg-white text-slate-600 text-[11px] font-bold border border-slate-200 cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 4 KARTU METRIK UTAMA (KPI CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Kunjungan Beranda */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kunjungan Beranda
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2B4CE0] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {(analytics.totalPageViews || 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{todayStats.views || 0} kunjungan hari ini</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pengunjung Unik */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pengunjung Unik
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {(analytics.totalUniqueVisitors || 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>+{todayStats.uniqueVisitors || 0} orang baru hari ini</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Loker Dilihat */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Detail Loker Dibuka
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {(analytics.totalJobViews || 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-amber-700">
              <span>+{todayStats.jobClicks || 0} loker diklik hari ini</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Klik Melamar & Konversi */}
        <div className="bg-gradient-to-br from-[#2B4CE0] to-[#1E3AB8] p-5 rounded-3xl text-white shadow-md shadow-[#2B4CE0]/20 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Total Klik Melamar
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#A3F742] text-slate-950 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white">
                {(analytics.totalApplyClicks || 0).toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#A3F742] text-slate-950">
                CTR {conversionRate}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-blue-100 font-medium">
              <span>+{todayStats.applyClicks || 0} lamaran hari ini</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#A3F742]">
                <Share2 className="w-3 h-3" /> {analytics.totalShareClicks || 0}x Share
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRAFIK TREN 7 HARI TERAKHIR & SALURAN LAMARAN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik Tren 7 Hari Terakhir */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#2B4CE0]" />
                <span>Tren Trafik & Lamaran (7 Hari Terakhir)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan harian antara kunjungan beranda, klik detail loker, dan aksi melamar kerja
              </p>
            </div>

            {/* Legenda Grafik */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-[#2B4CE0] inline-block" />
                Kunjungan
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                Klik Loker
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                Klik Lamar
              </span>
            </div>
          </div>

          {/* Area Diagram Batang */}
          <div className="pt-6 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-4 px-1 border-b border-slate-200">
              {last7DaysData.map((day) => {
                const viewHeight = Math.max(6, Math.round((day.views / maxDailyValue) * 100));
                const clickHeight = Math.max(6, Math.round((day.jobClicks / maxDailyValue) * 100));
                const applyHeight = Math.max(6, Math.round((day.applyClicks / maxDailyValue) * 100));

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-14 z-20 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                      <div>{day.label}</div>
                      <div className="text-blue-300">👁️ {day.views} Kunjungan</div>
                      <div className="text-amber-300">👆 {day.jobClicks} Klik Loker</div>
                      <div className="text-emerald-300">🚀 {day.applyClicks} Lamar</div>
                    </div>

                    {/* Angka Ringkas di Atas Batang */}
                    <div className="text-[10px] font-bold text-slate-500 mb-1">
                      {day.views > 0 || day.jobClicks > 0 ? day.views : ''}
                    </div>

                    {/* 3 Bar berdampingan */}
                    <div className="w-full max-w-[54px] flex items-end justify-center gap-1 h-36">
                      <div
                        style={{ height: `${ day.views > 0 ? viewHeight : 4 }%` }}
                        className="flex-1 bg-[#2B4CE0] rounded-t-md transition-all duration-300 hover:brightness-110"
                        title={`Kunjungan: ${day.views}`}
                      />
                      <div
                        style={{ height: `${ day.jobClicks > 0 ? clickHeight : 4 }%` }}
                        className="flex-1 bg-amber-400 rounded-t-md transition-all duration-300 hover:brightness-110"
                        title={`Klik Loker: ${day.jobClicks}`}
                      />
                      <div
                        style={{ height: `${ day.applyClicks > 0 ? applyHeight : 4 }%` }}
                        className="flex-1 bg-emerald-500 rounded-t-md transition-all duration-300 hover:brightness-110"
                        title={`Klik Lamar: ${day.applyClicks}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Label Hari di Bawah Sumbu X */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2.5 text-center">
              {last7DaysData.map((day) => (
                <div key={day.date} className="flex flex-col items-center">
                  <span
                    className={`text-[10px] sm:text-xs font-bold leading-tight ${
                      day.isToday ? 'text-[#2B4CE0] font-black' : 'text-slate-500'
                    }`}
                  >
                    {day.label}
                  </span>
                  {day.isToday && (
                    <span className="mt-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#EEF2FF] text-[#2B4CE0] rounded-full">
                      Hari Ini
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Saluran Lamaran & Perangkat Pengunjung */}
        <div className="lg:col-span-4 space-y-6">
          {/* Breakdown Saluran Melamar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Saluran Melamar Favorit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Metode yang paling sering diklik pelamar saat mengirim lamaran
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">Lamar via WhatsApp</div>
                    <div className="text-[11px] text-slate-500">Tombol WA & Smart Cover Letter</div>
                  </div>
                </div>
                <span className="text-base font-black text-emerald-700">
                  {analytics.applyBreakdown?.whatsapp || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">Formulir Online / QR</div>
                    <div className="text-[11px] text-slate-500">Tautan Google Form / Rekrutmen</div>
                  </div>
                </div>
                <span className="text-base font-black text-indigo-700">
                  {analytics.applyBreakdown?.form || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">Lamar via Email HRD</div>
                    <div className="text-[11px] text-slate-500">Kirim berkas ke alamat email</div>
                  </div>
                </div>
                <span className="text-base font-black text-blue-700">
                  {analytics.applyBreakdown?.email || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Perangkat Pengunjung */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Perangkat Pengunjung
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#2B4CE0] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500">HP / Mobile</div>
                  <div className="text-base font-black text-slate-900">
                    {deviceStats.mobilePct}%{' '}
                    <span className="text-xs font-semibold text-slate-400">
                      ({deviceStats.mobile})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500">Laptop / PC</div>
                  <div className="text-base font-black text-slate-900">
                    {deviceStats.desktopPct}%{' '}
                    <span className="text-xs font-semibold text-slate-400">
                      ({deviceStats.desktop})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PERINGKAT LOKER TERPOPULER (TOP PERFORMING JOBS) ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2B4CE0]" />
              <span>Analisa Performa Setiap Lowongan Kerja ({rankedJobs.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bandingkan lowongan mana yang paling banyak menyedot perhatian dan lamaran pencari kerja
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pencarian cepat loker */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posisi / perusahaan..."
                className="pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4CE0]"
              />
            </div>

            {/* Urutkan berdasarkan */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSortBy('views')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  sortBy === 'views'
                    ? 'bg-[#2B4CE0] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Terbanyak Dilihat
              </button>
              <button
                type="button"
                onClick={() => setSortBy('applies')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  sortBy === 'applies'
                    ? 'bg-[#2B4CE0] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Terbanyak Dilamar
              </button>
              <button
                type="button"
                onClick={() => setSortBy('ctr')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  sortBy === 'ctr'
                    ? 'bg-[#2B4CE0] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Konversi Tertinggi
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Posisi & Perusahaan</th>
                <th className="py-3.5 px-4">Wilayah</th>
                <th className="py-3.5 px-4 text-center">Dilihat (Views)</th>
                <th className="py-3.5 px-4 text-center">Klik Lamar</th>
                <th className="py-3.5 px-4 text-center">Dibagikan</th>
                <th className="py-3.5 px-4 text-center">Rasio Lamar (CTR)</th>
                <th className="py-3.5 px-4 text-right">Terakhir Dilihat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rankedJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                    Belum ada data lowongan yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                rankedJobs.slice(0, 15).map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-black">
                      {idx < 3 ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900'
                              : 'bg-amber-700/20 text-amber-900'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="text-slate-400">{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{item.posisi}</span>
                        {item.is_urgent && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-100 text-rose-700 rounded-md">
                            URGENT
                          </span>
                        )}
                        {!item.isActive && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-500 rounded-md">
                            Terarsip
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{item.nama_perusahaan}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#2B4CE0]">
                        <MapPin className="w-3 h-3" />
                        {item.wilayah}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-slate-800 text-sm">
                        {item.views.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-black text-emerald-700 bg-emerald-50 border border-emerald-200">
                        {item.applies.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                      {item.shares.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-extrabold ${
                          item.ctr >= 25
                            ? 'text-emerald-600'
                            : item.ctr > 0
                            ? 'text-[#2B4CE0]'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.ctr.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                      {formatRelativeTime(item.lastViewedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3 PANEL BAWAH: DISTRIBUSI 6 WILAYAH, SUMBER TRAFIK, & LIVE ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Distribusi Minat 6 Wilayah Karesidenan Madiun */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2B4CE0]" />
              <span>Minat Wilayah Madiun Raya</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Wilayah dengan interaksi pencarian & klik loker tertinggi
            </p>
          </div>

          <div className="space-y-3.5">
            {regionStats.map((reg) => (
              <div key={reg.wilayah} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{reg.wilayah}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({reg.jobCount} loker aktif)
                    </span>
                    <span className="font-black text-[#2B4CE0]">
                      {reg.views} klik ({reg.pct}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2B4CE0] to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, reg.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Sumber Kedatangan Pengunjung (Traffic Sources) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#2B4CE0]" />
              <span>Sumber Trafik Pengunjung</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Asal kedatangan pelamar yang membuka portal KARMADI
            </p>
          </div>

          <div className="space-y-3.5">
            {sourceStats.map((src) => (
              <div key={src.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 truncate pr-2">{src.label}</span>
                  <span className="font-black text-slate-900 shrink-0">
                    {src.count} ({src.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${src.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(4, src.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Live Activity Feed (Aktivitas Terkini) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Aktivitas Pengunjung Terkini</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Log interaksi real-time di beranda publik
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {!analytics.recentEvents || analytics.recentEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Belum ada aktivitas tercatat. Coba buka beranda atau klik salah satu kartu loker.
              </div>
            ) : (
              analytics.recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 truncate">{evt.label}</div>
                    {evt.detail && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {evt.detail}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
                    {formatRelativeTime(evt.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
