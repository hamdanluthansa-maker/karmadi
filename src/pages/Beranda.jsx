import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  X,
  Receipt,
  Truck,
  Package,
  Building,
  Palette,
  Wrench,
  HeartPulse,
  Utensils,
  Laptop,
  Layers,
  ShieldCheck,
  MessageCircle,
  Lock,
  Zap,
  ArrowUp,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import JobCardPublic from '../components/JobCardPublic';
import JobDetailModal from '../components/JobDetailModal';
import AdminLoginModal from '../components/AdminLoginModal';
import PasangLokerModal from '../components/PasangLokerModal';
import InstallPwaModal from '../components/InstallPwaModal';
import { WILAYAH_OPTIONS, jobMatchesWilayah } from '../utils/regionUtils';
import { isJobActive } from '../utils/dateUtils';

/* ── Kategori chips dengan FLATICON SVG Elegan (Bukan Emoticon) ── */
const KATEGORI_LIST = [
  { label: 'Semua',     icon: Layers,     value: '' },
  { label: 'Kasir',     icon: Receipt,    value: 'Kasir' },
  { label: 'Driver',    icon: Truck,      value: 'Driver' },
  { label: 'Gudang',    icon: Package,    value: 'Gudang' },
  { label: 'Sales',     icon: TrendingUp, value: 'Sales' },
  { label: 'Teknik',    icon: Wrench,     value: 'Teknik' },
  { label: 'Admin',     icon: Briefcase,  value: 'Admin' },
  { label: 'Office Boy',icon: Building,   value: 'Umum' },
  { label: 'Desain',    icon: Palette,    value: 'Desain' },
  { label: 'Kesehatan', icon: HeartPulse, value: 'Kesehatan' },
  { label: 'F&B',       icon: Utensils,   value: 'F&B' },
  { label: 'IT',        icon: Laptop,     value: 'IT' },
];

export default function Beranda() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs } = useJobs();
  const [search, setSearch] = useState('');
  const [activeKategori, setActiveKategori] = useState('');
  const [activeWilayah, setActiveWilayah] = useState(''); // '' | 'Kota Madiun' | 'Kab. Madiun' | 'Magetan' | 'Ngawi' | 'Ponorogo' | 'Pacitan' | 'Luar Kota Lain'
  const [activeTipe, setActiveTipe] = useState(''); // '' | 'Full Time' | 'Freelance'
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showPasangLoker, setShowPasangLoker] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const chipScrollRef = useRef(null);

  // Monitor posisi scroll untuk menampilkan tombol Floating "Kembali ke Atas"
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY =
        window.pageYOffset ||
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setShowBackToTop(currentScrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-open modal jika URL memuat parameter loker (?loker=... atau ?q=...)
  useEffect(() => {
    const targetLokerId = searchParams.get('loker');
    const query = searchParams.get('q');

    if (targetLokerId && jobs && jobs.length > 0) {
      const found = jobs.find((j) => String(j.id) === String(targetLokerId));
      if (found) {
        setSelectedJob(found);
        return;
      }
    }

    if (query && !search) {
      setSearch(query);
    }
  }, [searchParams, jobs]);

  // Hanya loker yang masih aktif dalam masa tenggat (maks 1 bulan atau sesuai custom tanggal tayang)
  const activeJobs = useMemo(() => jobs.filter(isJobActive), [jobs]);

  /* ── Hitung jumlah loker per wilayah ── */
  const wilayahCounts = useMemo(() => {
    const counts = {};
    WILAYAH_OPTIONS.forEach((opt) => {
      if (!opt.value) {
        counts[opt.id] = activeJobs.length;
      } else {
        counts[opt.id] = activeJobs.filter((j) => jobMatchesWilayah(j, opt.value)).length;
      }
    });
    return counts;
  }, [activeJobs]);

  /* ── Hitung jumlah loker per tipe pekerjaan ── */
  const tipeCounts = useMemo(() => {
    let ft = 0;
    let fl = 0;
    activeJobs.forEach((j) => {
      const t = (j.tipe || 'Full Time').toLowerCase();
      if (t.includes('full')) ft++;
      if (t.includes('free') || t.includes('part') || t.includes('remote') || t.includes('proyek') || t.includes('magang')) fl++;
    });
    return { fullTime: ft, freelance: fl };
  }, [activeJobs]);

  /* ── Filter jobs berdasarkan pencarian, kategori, wilayah & tipe pekerjaan ── */
  const filteredJobs = useMemo(() => {
    return activeJobs.filter((job) => {
      const matchSearch =
        !search ||
        (job.posisi && job.posisi.toLowerCase().includes(search.toLowerCase())) ||
        (job.nama_perusahaan && job.nama_perusahaan.toLowerCase().includes(search.toLowerCase())) ||
        (job.lokasi && job.lokasi.toLowerCase().includes(search.toLowerCase())) ||
        (job.syarat && JSON.stringify(job.syarat).toLowerCase().includes(search.toLowerCase()));

      const matchKategori =
        !activeKategori ||
        (job.kategori && job.kategori.toLowerCase() === activeKategori.toLowerCase()) ||
        (job.posisi && job.posisi.toLowerCase().includes(activeKategori.toLowerCase()));

      const matchWilayah = !activeWilayah || jobMatchesWilayah(job, activeWilayah);

      const matchTipe =
        !activeTipe ||
        (activeTipe === 'Full Time'
          ? (job.tipe || 'Full Time').toLowerCase().includes('full')
          : (job.tipe || '').toLowerCase().includes('free') ||
            (job.tipe || '').toLowerCase().includes('part') ||
            (job.tipe || '').toLowerCase().includes('proyek') ||
            (job.tipe || '').toLowerCase().includes('magang'));

      return matchSearch && matchKategori && matchWilayah && matchTipe;
    });
  }, [activeJobs, search, activeKategori, activeWilayah, activeTipe]);

  const scrollChips = (direction) => {
    if (chipScrollRef.current) {
      chipScrollRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ═══════════════════════════════════════════════════ */}
      {/* NAVBAR PENCARI KERJA (DENGAN TOMBOL MASUK & DAFTAR) */}
      {/* ═══════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo Brand Karmadi */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/assets/logo-karmadi.svg"
                alt="Logo Karmadi"
                className="w-10 h-10 rounded-2xl shadow-sm transition-transform group-hover:scale-105"
              />
              <div>
                <span className="font-black text-xl text-[#2B4CE0] tracking-tight">
                  Karmadi
                </span>
                <p className="text-[10px] text-slate-500 font-bold -mt-0.5 leading-tight">
                  Info Lowongan Kerja Seputar Karesidenan Madiun
                </p>
              </div>
            </Link>

            {/* Navigasi & Action Kanan */}
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
                <Link to="/" className="text-[#2B4CE0] font-black border-b-2 border-[#2B4CE0] pb-0.5">
                  Beranda
                </Link>
                <a href="#loker" className="hover:text-[#2B4CE0] transition-colors">
                  Daftar Lowongan
                </a>
                <a
                  href="https://whatsapp.com/channel/0029Vb93m90F6sn4i0hag42j"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>Saluran WA</span>
                </a>
              </nav>

              {/* Tombol Pasang Loker (Modal Rate Card & Pengajuan WA) */}
              <button
                type="button"
                onClick={() => setShowPasangLoker(true)}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black bg-[#2B4CE0] hover:bg-[#2342D8] text-white shadow-sm shadow-[#2B4CE0]/30 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95"
                title="Pasang Loker Perusahaan / UMKM Anda di KARMADI"
              >
                <Building2 className="w-3.5 h-3.5 text-[#A3F742]" />
                <span>Pasang Loker</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* HERO SECTION                                        */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="relative bg-[#2B4CE0] text-white overflow-hidden shadow-inner">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-[#0F172A]/40 backdrop-blur-md text-[#A3F742] text-xs font-extrabold px-4 py-1.5 rounded-full border border-[#A3F742]/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#A3F742] animate-pulse" />
              Karmadi • Info Lowongan Kerja Seputar Karesidenan Madiun
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              Cari Lowongan Kerja
              <br />
              <span className="text-[#A3F742] drop-shadow-xs">Seputar Karesidenan Madiun</span>
            </h1>

            <p className="text-sm md:text-base text-blue-100 max-w-lg mx-auto leading-relaxed font-medium">
              Pusat info loker terpercaya, terlengkap, dan terupdate untuk wilayah Madiun, Magetan, Ngawi, Ponorogo, dan sekitarnya.
            </p>

            {/* Kolom Pencarian Besar */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2 max-w-xl mx-auto border-2 border-white/20">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder='Cari posisi, misal: "Kasir", "Driver", "Mekanik"...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent py-2.5"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button className="bg-[#A3F742] hover:bg-[#8EF122] text-[#0F172A] text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-md shadow-[#A3F742]/30 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95">
                <Search className="w-4 h-4 stroke-[2.5]" />
                Cari
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-blue-100 pt-2 font-medium">
              <span className="flex items-center gap-1.5 bg-[#0F172A]/25 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10">
                <Briefcase className="w-3.5 h-3.5 text-[#A3F742]" />
                <strong className="text-white font-extrabold">{activeJobs.length}</strong> Loker Aktif
              </span>
              <span className="flex items-center gap-1.5 bg-[#0F172A]/25 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-[#A3F742]" />
                <strong className="text-[#A3F742] font-black">Terverifikasi</strong> Mitra Swasta
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* KATEGORI CHIPS DENGAN FLATICON ELEGAN               */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 sticky top-18 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollChips('left')}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={chipScrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {KATEGORI_LIST.map((kat) => {
                const IconComponent = kat.icon;
                const isActive = activeKategori === kat.value;
                return (
                  <button
                    key={kat.label}
                    onClick={() =>
                      setActiveKategori(
                        activeKategori === kat.value ? '' : kat.value
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#2B4CE0] text-white border-[#2B4CE0] shadow-sm shadow-[#2B4CE0]/30'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-[#EEF2FF] hover:text-[#2B4CE0] hover:border-[#2B4CE0]/40'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-[#A3F742]' : 'text-slate-400 group-hover:text-[#2B4CE0]'}`} />
                    <span>{kat.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollChips('right')}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* GRID DAFTAR LOWONGAN KERJA                          */}
      {/* ═══════════════════════════════════════════════════ */}
      <main id="loker" className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <TrendingUp className="w-5 h-5 text-[#2B4CE0] shrink-0" />
                <span>{activeKategori ? `Lowongan ${activeKategori}` : 'Daftar Lowongan Karir'}</span>
                {activeWilayah && (
                  <span className="text-xs font-black text-[#2B4CE0] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#2B4CE0]/30 shadow-2xs">
                    📍 {activeWilayah}
                  </span>
                )}
                {activeTipe && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                    activeTipe === 'Freelance'
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-[#EEF2FF] text-[#2B4CE0] border-[#2B4CE0]/30'
                  }`}>
                    {activeTipe === 'Freelance' ? (
                      <Zap className="w-3 h-3 text-purple-600 fill-purple-600" />
                    ) : (
                      <Briefcase className="w-3 h-3 text-[#2B4CE0]" />
                    )}
                    <span>{activeTipe}</span>
                  </span>
                )}
                {search && <span className="text-sm font-normal text-slate-400">— "{search}"</span>}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 whitespace-nowrap">
                <span className="hidden sm:inline">Klik kartu untuk membuka kualifikasi lengkap • </span>
                <span>Menampilkan <strong className="text-slate-600 font-bold">{filteredJobs.length}</strong> lowongan aktif</span>
              </p>
            </div>

            {/* Segmented Filter: Semua | Full Time | Freelance & Quick Reset */}
            <div className="w-full sm:w-auto flex items-center gap-2">
              <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center p-1 sm:p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 shadow-2xs gap-1">
                {/* Tab: Semua */}
                <button
                  type="button"
                  onClick={() => setActiveTipe('')}
                  className={`group flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    !activeTipe
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${!activeTipe ? 'text-[#2B4CE0]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>Semua</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold ${
                    !activeTipe ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/70 text-slate-500'
                  }`}>
                    {activeJobs.length}
                  </span>
                </button>

                {/* Tab: Full Time */}
                <button
                  type="button"
                  onClick={() => setActiveTipe(activeTipe === 'Full Time' ? '' : 'Full Time')}
                  className={`group flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeTipe === 'Full Time'
                      ? 'bg-[#2B4CE0] text-white shadow-sm shadow-[#2B4CE0]/25 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Briefcase className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${activeTipe === 'Full Time' ? 'text-[#A3F742]' : 'text-slate-400 group-hover:text-[#2B4CE0]'}`} />
                  <span>Full Time</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold ${
                    activeTipe === 'Full Time' ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {tipeCounts.fullTime}
                  </span>
                </button>

                {/* Tab: Freelance */}
                <button
                  type="button"
                  onClick={() => setActiveTipe(activeTipe === 'Freelance' ? '' : 'Freelance')}
                  className={`group flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeTipe === 'Freelance'
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/25 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${activeTipe === 'Freelance' ? 'text-white fill-white' : 'text-slate-400 group-hover:text-purple-600'}`} />
                  <span>Freelance</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold ${
                    activeTipe === 'Freelance' ? 'bg-white/20 text-white' : 'bg-purple-100/80 text-purple-700'
                  }`}>
                    {tipeCounts.freelance}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* BAR PENGELOMPOKAN WILAYAH KARESIDENAN MADIUN        */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2B4CE0] shrink-0" />
                <span className="hidden sm:inline">Pilih Kota / Kabupaten (Karesidenan Madiun)</span>
                <span className="sm:hidden">Pilih Kota / Kab (Karesidenan Madiun)</span>
              </span>
              {activeWilayah && (
                <button
                  type="button"
                  onClick={() => setActiveWilayah('')}
                  className="text-[10px] sm:text-[11px] font-bold text-[#2B4CE0] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="hidden sm:inline">Tampilkan Semua Wilayah</span>
                  <span className="sm:hidden">Semua Wilayah</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {WILAYAH_OPTIONS.map((opt) => {
                const isActive = activeWilayah === opt.value;
                const count = wilayahCounts[opt.id] ?? 0;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setActiveWilayah(isActive ? '' : opt.value)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#2B4CE0] text-white border-[#2B4CE0] shadow-md shadow-[#2B4CE0]/25 scale-[1.02]'
                        : opt.value === 'Luar Kota Lain'
                        ? 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-[#EEF2FF] hover:text-[#2B4CE0] hover:border-[#2B4CE0]/30'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-[#A3F742] text-[#0F172A]'
                          : opt.value === 'Luar Kota Lain'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job) => (
                <JobCardPublic
                  key={job.id}
                  poster_url={job.poster_url}
                  logo_url={job.logo_url}
                  posisi={job.posisi}
                  nama_perusahaan={job.nama_perusahaan}
                  warna_primer={job.warna_primer}
                  kontak_wa={job.kontak_wa}
                  email={job.email}
                  link_pendaftaran={job.link_pendaftaran}
                  is_walk_in={job.is_walk_in}
                  alamat_walk_in={job.alamat_walk_in}
                  wilayah={job.wilayah}
                  lokasi={job.lokasi}
                  tipe={job.tipe}
                  tanggal_mulai={job.tanggal_mulai}
                  tanggal_selesai={job.tanggal_selesai}
                  tanggal={job.tanggal}
                  syarat={job.syarat}
                  benefit={job.benefit}
                  catatan={job.catatan}
                  is_manual={job.is_manual}
                  is_urgent={Boolean(job.is_urgent)}
                  onCardClick={() => setSelectedJob(job)}
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2B4CE0] flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Belum Ada Lowongan Aktif</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Database lowongan sedang disiapkan dan diperbarui oleh pengelola.
              </p>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 text-base">Tidak ada lowongan ditemukan</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau reset filter wilayah & kategori.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveKategori('');
                  setActiveWilayah('');
                }}
                className="mt-4 text-xs font-semibold text-[#2B4CE0] hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════ */}
      {/* BANNER KOMUNITAS WA & PASANG LOKER UMKM (RETENTION) */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E3AB8] via-[#2B4CE0] to-[#1E3AB8] text-white p-6 sm:p-8 shadow-xl shadow-blue-900/15 border border-blue-400/25">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#A3F742]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[#A3F742] text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Komunitas Pencari Kerja & UMKM Madiun Raya
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug text-white">
                Jangan Ketinggalan Info Loker Terbaru Se-Karesidenan Madiun!
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Dapatkan notifikasi lowongan kerja terverifikasi dari Kota/Kab. Madiun, Magetan, Ngawi, Ponorogo & Pacitan langsung di WhatsApp Anda, atau pasang iklan loker usaha Anda <strong className="text-[#A3F742] font-black">100% Gratis (Promo s/d Akhir Tahun 2026)</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href="https://whatsapp.com/channel/0029Vb93m90F6sn4i0hag42j"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-white hover:bg-blue-50 text-[#1E3AB8] font-black text-xs sm:text-sm shadow-xl shadow-blue-950/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                <span>Gabung Saluran WA KARMADI</span>
              </a>

              <button
                type="button"
                onClick={() => setShowPasangLoker(true)}
                className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 backdrop-blur-xs"
              >
                <Building2 className="w-4 h-4 text-[#A3F742]" />
                <span>Pasang Loker</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* MODAL DETAIL LOKER                                  */}
      {/* ═══════════════════════════════════════════════════ */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {/* ── MODAL PASANG LOKER (RATE CARD & PENGAJUAN WA) ── */}
      <PasangLokerModal
        isOpen={showPasangLoker}
        onClose={() => setShowPasangLoker(false)}
      />

      {/* ── POP-UP INSTAL APLIKASI (PWA) PERSIS CONTOH REFERENSI ── */}
      <InstallPwaModal />

      {/* ── TOMBOL FLOATING "KEMBALI KE ATAS" (STANDAR APLIKASI MODERN) ── */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-5 z-40 p-3.5 rounded-full bg-[#2B4CE0] hover:bg-[#1E3AB8] text-white shadow-xl shadow-[#2B4CE0]/35 transition-all duration-300 animate-scale-up cursor-pointer active:scale-95 flex items-center justify-center border border-white/20"
          title="Kembali ke atas"
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* FOOTER                                              */}
      {/* ═══════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-karmadi.png" alt="Logo" className="h-8 w-auto rounded-lg" />
            <span>
              © {new Date().getFullYear()} <strong>Karmadi</strong> • Info Lowongan Kerja Seputar Karesidenan Madiun.
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href="https://whatsapp.com/channel/0029Vb93m90F6sn4i0hag42j"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-colors"
            >
              Saluran WhatsApp Resmi
            </a>
            <span className="text-slate-300">•</span>
            <span>Pusat Info Loker Karesidenan Madiun</span>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => {
                const isAuthed = localStorage.getItem('karmadi_admin_auth') === 'true';
                if (isAuthed) {
                  navigate('/admin');
                } else {
                  setShowAdminLogin(true);
                }
              }}
              className="text-slate-400 hover:text-[#2B4CE0] transition-colors flex items-center gap-1.5 cursor-pointer font-medium py-1 px-2 rounded-lg hover:bg-slate-50"
              title="Akses Khusus Tim Pengelola Portal"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Akses Pengelola</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ── MODAL LOGIN KHUSUS PENGELOLA / ADMIN ── */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
    </div>
  );
}
