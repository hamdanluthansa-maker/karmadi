import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Clock,
  ShieldCheck,
  Zap,
  MessageCircle,
  Mail,
  X,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Share2,
  Calendar,
  Briefcase,
  ExternalLink,
  Globe,
  XCircle,
  Footprints,
  Maximize2,
  FileText,
  Hourglass,
  Flag,
} from 'lucide-react';
import SmartDraftModal from './SmartDraftModal';
import { detectWilayah } from '../utils/regionUtils';
import { getJobShareUrl, formatJobTeaserShareText } from '../utils/shareUtils';
import { getJobExpiryStatus, formatDateIndo } from '../utils/dateUtils';

/**
 * Modal Detail Pekerjaan saat kartu diklik
 */
export default function JobDetailModal({ job, onClose, onApplyClick }) {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  if (!job) return null;

  // Tutup lightbox preview gambar jika tombol Esc ditekan tanpa menutup modal loker
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showImagePreview) {
        e.stopPropagation();
        setShowImagePreview(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImagePreview]);

  // Intercept tombol Back HP (Gesture swipe kiri / back button Android) agar menutup modal daripada keluar dari web
  useEffect(() => {
    const stateId = `loker-modal-${job.id || Date.now()}`;
    // Dorong history state baru saat modal loker aktif terbuka
    window.history.pushState({ modalOpen: true, stateId }, '');

    const handlePopState = (event) => {
      // Jika pengguna menekan back pada HP, jalankan penutupan modal loker
      if (onClose) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Jika modal ditutup lewat tombol X atau klik luar (bukan dari gesture back HP),
      // kembalikan state history agar tidak meninggalkan jejak back palsu
      if (window.history.state?.modalOpen && window.history.state?.stateId === stateId) {
        window.history.back();
      }
    };
  }, [job?.id, onClose]);

  const displayWilayah = job.wilayah || detectWilayah(job.lokasi, job.syarat);
  const color = job.warna_primer || '#2563eb';
  const cleanPhone = (job.kontak_wa || '').replace(/[^0-9]/g, '');
  const hasPoster = Boolean(
    !job.is_manual &&
    job.poster_url &&
    typeof job.poster_url === 'string' &&
    !job.poster_url.includes('logo-karmadi')
  );
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Halo ${job.nama_perusahaan}, saya tertarik melamar posisi ${job.posisi} yang tertera di portal Karmadi.`
      )}`
    : '';

  const emailUrl = job.email
    ? `mailto:${job.email}?subject=${encodeURIComponent(
        `Lamaran Posisi ${job.posisi} — Portal Karmadi`
      )}&body=${encodeURIComponent(
        `Yth. HRD ${job.nama_perusahaan},\n\nDengan hormat, saya bermaksud melamar posisi ${job.posisi} yang tercantum pada portal Karmadi.\n\nHormat saya,\n[Nama Lengkap]`
      )}`
    : '';

  const syaratList = Array.isArray(job.syarat)
    ? job.syarat
    : typeof job.syarat === 'string'
    ? job.syarat.split('\n').filter(Boolean)
    : [];

  const benefitList = Array.isArray(job.benefit)
    ? job.benefit
    : typeof job.benefit === 'string'
    ? job.benefit.split('\n').filter(Boolean)
    : [];

  const handleShare = async () => {
    const shareUrl = getJobShareUrl(job);
    const teaserText = formatJobTeaserShareText(job);

    // 1. Coba gunakan Web Share API bawaan HP / Browser (jika didukung)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Loker ${job.posisi} - ${job.nama_perusahaan}`,
          text: teaserText,
          url: shareUrl,
        });
        setShareFeedback('Berhasil dibagikan!');
        setTimeout(() => setShareFeedback(''), 2500);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // Pengguna membatalkan dialog share
      }
    }

    // 2. Fallback: Salin teks teaser menarik beserta tautan web ke Clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(teaserText);
        setCopied(true);
        setShareFeedback('Teks & Link Loker Tersalin!');
        setTimeout(() => {
          setCopied(false);
          setShareFeedback('');
        }, 3000);
      } catch (e) {
        // Fallback klasik jika clipboard API ditolak
        const textArea = document.createElement('textarea');
        textArea.value = teaserText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setShareFeedback('Teks & Link Loker Tersalin!');
        setTimeout(() => {
          setCopied(false);
          setShareFeedback('');
        }, 3000);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Aksen & Tombol Tutup */}
        <div
          className="h-2.5 w-full shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* ── AREA KONTEN YANG DAPAT DI-SCROLL ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 overscroll-contain">
          {/* Top Bar */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-[#EEF2FF] text-[#2B4CE0] text-xs font-bold px-3 py-1 rounded-full border border-[#2B4CE0]/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Terverifikasi Resmi
              </span>
              <span
                className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs bg-[#0F172A]"
              >
                {job.tipe || 'Full Time'}
              </span>
              {job.is_urgent && (
                <span className="flex items-center gap-1 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md animate-pulse border border-rose-400">
                  🔥 URGENT / CEPAT
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className={`py-1.5 px-3 rounded-full transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                  copied || shareFeedback
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#2B4CE0] border-slate-200 hover:border-blue-300'
                }`}
                title="Bagikan Loker Menarik Ini"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{shareFeedback || 'Bagikan'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Posisi & Perusahaan */}
          <div className="flex items-start gap-3.5">
            {job.logo_url && (
              <img
                src={job.logo_url}
                alt={job.nama_perusahaan}
                className="w-12 h-12 rounded-2xl object-contain bg-slate-50 border border-slate-200 p-1.5 shadow-2xs shrink-0 mt-0.5"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{job.nama_perusahaan}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 leading-snug">
                {job.posisi}
              </h2>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1 font-bold text-[#2B4CE0] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#2B4CE0]/25">
                  <MapPin className="w-3.5 h-3.5" />
                  {displayWilayah}
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  {job.lokasi || 'Kota Madiun'}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Diposting {formatDateIndo(job.tanggal_mulai || job.tanggal)}
                </span>
                {(() => {
                  const expiry = getJobExpiryStatus(job);
                  return (
                    <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full border ${expiry.badgeColor}`}>
                      <Hourglass className="w-3 h-3" />
                      <span>Masa Tayang s.d. {formatDateIndo(job.tanggal_selesai)} ({expiry.label})</span>
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* URGENT Banner Alert */}
          {job.is_urgent && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-300 shadow-xs flex items-start gap-3.5 text-rose-900">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 text-xl shadow-md animate-bounce">
                🔥
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide text-rose-700">
                  LOKER URGENT — SEGERA DIBUTUHKAN CEPAT!
                </h4>
                <p className="text-xs text-rose-700/90 mt-0.5 leading-relaxed font-semibold">
                  Posisi ini memerlukan pengisian tenaga kerja secepatnya. Mohon segera kirimkan berkas lamaran atau hubungi kontak perusahaan sekarang juga.
                </p>
              </div>
            </div>
          )}

          {/* Poster & Kualifikasi */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
            {hasPoster && (
              <div
                onClick={() => setShowImagePreview(true)}
                className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner group relative cursor-zoom-in transition-all hover:shadow-md"
                title="Klik untuk memperbesar gambar"
              >
                <img
                  src={job.poster_url}
                  alt={`Poster ${job.posisi}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-auto max-h-72 object-contain mx-auto transition-transform duration-300 group-hover:scale-102"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImagePreview(true);
                  }}
                  className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-xs gap-1.5 cursor-zoom-in"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Buka Gambar Penuh</span>
                </button>
              </div>
            )}

            <div className={hasPoster ? 'md:col-span-7 space-y-4' : 'md:col-span-12 space-y-4'}>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Kualifikasi & Persyaratan:
                </h4>
                <ul className="space-y-2">
                  {syaratList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{ color }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefit & Fasilitas (Khusus jika ada) */}
              {benefitList.length > 0 && (
                <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 space-y-2 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="uppercase tracking-wider font-extrabold text-[11px]">Benefit & Fasilitas:</span>
                  </div>
                  <ul className="space-y-1.5 text-emerald-900 font-medium">
                    {benefitList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-black">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Catatan / Ketentuan Lain (Khusus jika ada) */}
              {job.catatan && (
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-1.5 text-xs">
                  <div className="font-bold text-blue-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="uppercase tracking-wider font-extrabold text-[11px]">Catatan & Ketentuan Lain:</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed whitespace-pre-line font-medium">
                    {Array.isArray(job.catatan) ? job.catatan.join('\n') : job.catatan}
                  </p>
                </div>
              )}

              {/* Kontak & Link Pendaftaran info */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-700">Kontak & Tautan Pendaftaran:</div>
                {job.link_pendaftaran && (
                  <div className="text-slate-600 flex items-start gap-1.5 flex-wrap">
                    <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700">Link Formulir:</span>
                    <a
                      href={job.link_pendaftaran}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline break-all inline-flex items-center gap-1"
                    >
                      {job.link_pendaftaran}
                      <ExternalLink className="w-3 h-3 inline shrink-0" />
                    </a>
                  </div>
                )}
                {cleanPhone && (
                  <div className="text-slate-600">
                    WhatsApp: <span className="font-mono font-semibold text-slate-800">+{cleanPhone}</span>
                  </div>
                )}
                {job.email && (
                  <div className="text-slate-600">
                    Email: <span className="font-semibold text-slate-800">{job.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* INFO BESAR: WAJIB DATANG LANGSUNG / WALK-IN INTERVIEW (JIKA ADA) */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {job.is_walk_in && (
              <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl text-amber-950 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-black text-sm text-amber-900 tracking-tight">
                  <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>LAMARAN WAJIB DATANG LANGSUNG / WALK-IN INTERVIEW</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Pengiklan lowongan kerja ini mewajibkan pelamar untuk membawa / menyerahkan berkas surat lamaran fisik langsung ke alamat tujuan:
                </p>
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs font-bold text-slate-900 flex items-start gap-2 shadow-2xs">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-sm leading-snug">{job.alamat_walk_in || job.lokasi || 'Alamat tertera pada poster'}</span>
                </div>
              </div>
            )}

            {/* ── KEAMANAN PELAMAR & TOMBOL LAPORKAN KEJANGGALAN LOKER ── */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Keamanan Pelamar KARMADI:</span> Jangan pernah mentransfer uang (biaya admin, seragam, atau pelatihan) kepada pihak mana pun dalam proses melamar kerja.
              </div>
              <a
                href={`https://wa.me/6285119491567?text=${encodeURIComponent(
                  `Halo Admin KARMADI, saya ingin melaporkan info lowongan kerja:\n\n• Posisi: ${job.posisi}\n• Perusahaan: ${job.nama_perusahaan}\n• Wilayah: ${displayWilayah}\n\nAlasan laporan (pilih/jelaskan): [Loker Sudah Tutup / Meminta Biaya Pungli / Informasi Tidak Sesuai]`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition cursor-pointer"
                title="Laporkan ke Admin KARMADI jika lowongan ini sudah tutup atau mencurigakan"
              >
                <Flag className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Laporkan Loker Ini</span>
              </a>
            </div>
          </div>

        {/* ── TOMBOL AKSI MENEMPEL DI BAWAH (STICKY BOTTOM BAR - LANGSUNG TERLIHAT TANPA SCROLL) ── */}
        <div className="shrink-0 p-3 sm:px-6 sm:py-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] space-y-2 z-20">
          {/* Tombol Utama Link Pendaftaran (Jika ada) */}
          {job.link_pendaftaran && (
            <a
              href={job.link_pendaftaran}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 sm:py-3 rounded-xl text-white font-black text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#A3F742]" />
              <span>Buka & Isi Formulir Pendaftaran Online</span>
            </a>
          )}

          {/* Tombol Buat Draf Lamaran Cepat (Smart Cover Letter) */}
          <button
            type="button"
            onClick={() => setShowDraftModal(true)}
            className="w-full py-2.5 sm:py-3 rounded-xl text-white font-black text-xs sm:text-sm bg-[#2B4CE0] hover:bg-[#203db8] shadow-md shadow-[#2B4CE0]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Buat Draf Lamaran Cepat (Smart Cover Letter)</span>
          </button>

          {/* Tombol Saluran Kontak: WhatsApp & Email */}
          {cleanPhone || job.email ? (
            <div className="grid grid-cols-2 gap-2">
              {cleanPhone ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Lamar via WhatsApp</span>
                </a>
              ) : (
                <button
                  disabled
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">WA Tidak Ada</span>
                </button>
              )}

              {job.email ? (
                <a
                  href={emailUrl}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Lamar via Email</span>
                </a>
              ) : (
                <button
                  disabled
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Email Tidak Ada</span>
                </button>
              )}
            </div>
          ) : job.is_walk_in ? (
            <div className="py-2 px-3 bg-amber-50 rounded-xl border border-amber-300 text-center text-xs text-amber-900 font-bold flex items-center justify-center gap-1.5">
              <Footprints className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Lamaran Fisik Langsung: Bawa Berkas ke Alamat di Atas</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled
                className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="truncate">WA Tidak Ada</span>
              </button>
              <button
                disabled
                className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">Email Tidak Ada</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] sm:text-[11px] text-slate-400 shrink-0">
          Karmadi • Info Lowongan Kerja Seputar Karesidenan Madiun
        </div>
      </div>

      {/* ── MODAL SMART COVER LETTER / DRAF LAMARAN CEPAT ── */}
      <SmartDraftModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        job={job}
      />

      {/* ── MODAL PREVIEW GAMBAR PENUH (LIGHTBOX) ── */}
      {showImagePreview && job.poster_url && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in cursor-zoom-out"
          onClick={(e) => {
            e.stopPropagation();
            setShowImagePreview(false);
          }}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] flex flex-col items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Tutup Mengambang */}
            <button
              type="button"
              onClick={() => setShowImagePreview(false)}
              className="absolute -top-12 right-0 sm:-right-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-white/20 shadow-lg"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>

            {/* Gambar Penuh */}
            <img
              src={job.poster_url}
              alt={`Poster Lengkap ${job.posisi}`}
              className="max-h-[84vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl border border-white/10 select-none bg-slate-900/60"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/logo-karmadi.png';
              }}
            />

            {/* Petunjuk Klik Luar */}
            <div className="mt-3 text-white/60 text-xs flex items-center gap-2 select-none bg-black/40 px-3 py-1 rounded-full border border-white/10">
              <span>Klik di luar gambar atau tekan Esc untuk kembali ke info loker</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
