import React, { useState } from 'react';
import {
  MessageCircle,
  Zap,
  MapPin,
  Building2,
  Clock,
  ShieldCheck,
  Mail,
  LogIn,
  X,
  User,
  Lock,
  CheckCircle,
  Eye,
  ExternalLink,
  Globe,
  XCircle,
  AlertCircle,
  Footprints,
  Sparkles,
  Hourglass,
} from 'lucide-react';
import SmartDraftModal from './SmartDraftModal';
import { detectWilayah } from '../utils/regionUtils';
import { getJobExpiryStatus, formatDateIndo } from '../utils/dateUtils';

/**
 * JobCardPublic — Kartu loker yang dilihat oleh pencari kerja di halaman Beranda.
 * Ketika area kartu diklik, membuka popup detail lengkap loker.
 */
export default function JobCardPublic({
  poster_url,
  logo_url = '',
  posisi = 'Posisi Pekerjaan',
  nama_perusahaan = 'Nama Perusahaan',
  warna_primer = '#16a34a',
  kontak_wa = '',
  email = '',
  link_pendaftaran = '',
  is_walk_in = false,
  alamat_walk_in = '',
  wilayah = '',
  lokasi = 'Kota Madiun',
  tipe = 'Full Time',
  tanggal_mulai = '',
  tanggal_selesai = '',
  tanggal,
  syarat = [],
  benefit = [],
  catatan = '',
  is_manual = false,
  is_urgent = false,
  onCardClick,
}) {
  const [showDraftModal, setShowDraftModal] = useState(false);

  const displayWilayah = wilayah || detectWilayah(lokasi, syarat);
  const color = warna_primer || '#2B4CE0';
  const cleanPhone = (kontak_wa || '').replace(/[^0-9]/g, '');
  const expiry = getJobExpiryStatus({ tanggal_mulai, tanggal_selesai, tanggal });
  const hasPoster = Boolean(
    !is_manual &&
    poster_url &&
    typeof poster_url === 'string' &&
    !poster_url.includes('logo-karmadi')
  );

  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Halo ${nama_perusahaan}, saya tertarik melamar posisi ${posisi} yang tertera di portal Karmadi. Terima kasih.`
      )}`
    : '';

  const emailUrl = email
    ? `mailto:${email}?subject=${encodeURIComponent(
        `Lamaran Posisi ${posisi} — Portal Karmadi`
      )}&body=${encodeURIComponent(
        `Yth. HRD ${nama_perusahaan},\n\nDengan hormat, saya bermaksud melamar posisi ${posisi} yang tercantum pada portal Karmadi.\n\nBerikut saya lampirkan berkas lamaran saya.\n\nTerima kasih atas perhatiannya.\n\nHormat saya,\n[Nama Lengkap]`
      )}`
    : '';

  // Format tanggal relatif
  const formatTanggal = (dateStr) => {
    if (!dateStr) return 'Baru';
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff <= 0) return 'Hari ini';
    if (diff === 1) return '1 hari lalu';
    if (diff < 7) return `${diff} hari lalu`;
    return `${Math.floor(diff / 7)} minggu lalu`;
  };

  return (
    <>
      <div
        onClick={() => onCardClick && onCardClick()}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border-2 hover:-translate-y-1 cursor-pointer"
        style={{ borderColor: `${color}35` }}
      >
        {/* ── Visual Banner: Poster Gambar ATAU Banner Tipografi Teks (Loker Mandiri) ── */}
        {hasPoster ? (
          <div className="relative overflow-hidden bg-slate-100 h-36">
            <img
              src={poster_url}
              alt={`Poster loker ${posisi}`}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Badge Terverifikasi & Urgent */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs text-[#2B4CE0] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                <ShieldCheck className="w-3 h-3 text-[#2B4CE0]" />
                Terverifikasi
              </div>
              {is_urgent && (
                <div className="flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md animate-pulse border border-rose-400">
                  <span>🔥 URGENT</span>
                </div>
              )}
            </div>

            {/* Badge Tipe Pekerjaan */}
            <div
              className={`absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-xs border ${
                (tipe || '').toLowerCase().includes('free')
                  ? 'bg-[#A3F742] text-slate-950 font-black border-[#A3F742] shadow-xs'
                  : 'bg-[#0F172A]/80 text-white border-white/20'
              }`}
            >
              {(tipe || '').toLowerCase().includes('free') ? (
                <span className="flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
                  <span>Freelance</span>
                </span>
              ) : (
                tipe
              )}
            </div>

            {/* Klik untuk detail hint */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
              <Eye className="w-3 h-3 text-[#A3F742]" />
              Klik lihat detail
            </div>

            {/* Accent strip */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2B4CE0]" />
          </div>
        ) : (
          <div
            className="relative overflow-hidden h-36 p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-300 group-hover:brightness-105 select-none"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, #0F172A 100%)`,
            }}
          >
            {/* Subtle background texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs text-[#2B4CE0] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-[#2B4CE0]" />
                  Terverifikasi
                </div>
                {is_urgent && (
                  <div className="flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md animate-pulse border border-rose-400">
                    <span>🔥 URGENT</span>
                  </div>
                )}
              </div>

              <div
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-xs border ${
                  (tipe || '').toLowerCase().includes('free')
                    ? 'bg-[#A3F742] text-slate-950 font-black border-[#A3F742]'
                    : 'bg-black/40 text-white border-white/20'
                }`}
              >
                {(tipe || '').toLowerCase().includes('free') ? (
                  <span className="flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
                    <span>Freelance</span>
                  </span>
                ) : (
                  tipe
                )}
              </div>
            </div>

            {/* Center / Body: Nama Perusahaan di atas & Tulisan BESAR Posisi yang Dibutuhkan */}
            <div className="relative z-10 mt-auto pt-2">
              <div className="flex items-center gap-1.5 mb-1 min-w-0">
                {logo_url ? (
                  <img
                    src={logo_url}
                    alt={nama_perusahaan}
                    className="w-4 h-4 rounded-md object-contain bg-white/90 p-0.5 shrink-0 shadow-2xs"
                  />
                ) : (
                  <Building2 className="w-3 h-3 text-white/70 shrink-0" />
                )}
                <span className="text-[11px] font-bold text-white/90 tracking-wide uppercase truncate drop-shadow-xs">
                  {nama_perusahaan}
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-black text-white leading-tight line-clamp-2 drop-shadow-md tracking-tight group-hover:text-[#A3F742] transition-colors">
                {posisi}
              </h4>
            </div>

            {/* Klik untuk detail hint */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs z-10">
              <Eye className="w-3 h-3 text-[#A3F742]" />
              Klik lihat detail
            </div>

            {/* Accent strip */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ backgroundColor: color }}
            />
          </div>
        )}

        {/* ── Info Content ── */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#2B4CE0] transition-colors">
            {posisi}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-semibold">{nama_perusahaan}</span>
          </div>

          {/* Badge URGENT jika lowongan mendesak */}
          {is_urgent && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 w-fit">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
              <span>🔥 SEGERA DIBUTUHKAN CEPAT</span>
            </div>
          )}

          {/* Badge Wilayah Karesidenan Madiun */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {displayWilayah === 'Luar Kota Lain' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                <Globe className="w-2.5 h-2.5 text-amber-600" />
                Luar Karesidenan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EEF2FF] text-[#2B4CE0] border border-[#2B4CE0]/25 shadow-2xs">
                <MapPin className="w-2.5 h-2.5 text-[#2B4CE0]" />
                {displayWilayah}
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]" title={lokasi}>
              {lokasi}
            </span>
          </div>

          {/* Badge Benefit / Fasilitas jika ada */}
          {benefit && (Array.isArray(benefit) ? benefit.length > 0 : String(benefit).trim().length > 0) && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 w-fit line-clamp-1 truncate max-w-full">
              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">
                {Array.isArray(benefit) ? benefit[0] : String(benefit).split('\n')[0]}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatDateIndo(tanggal_mulai || tanggal)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${expiry.badgeColor}`}>
              <Hourglass className="w-2.5 h-2.5" />
              <span>{expiry.label}</span>
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* ══════════════════════════════════════════════ */}
          {/* TOMBOL AKSI LAMARAN                           */}
          {/* ══════════════════════════════════════════════ */}
          <div className="mt-2 space-y-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
            {/* Tombol Formulir / Link Pendaftaran Langsung (Jika Tersedia di Poster) */}
            {link_pendaftaran ? (
              <a
                href={link_pendaftaran}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2B4CE0] hover:bg-[#2342D8] text-white text-xs font-bold shadow-md shadow-[#2B4CE0]/25 transition-all duration-200 active:scale-[0.97]"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#A3F742]" />
                <span>Isi Formulir Pendaftaran</span>
              </a>
            ) : null}

            {/* Tombol Buat Draf Lamaran Cepat (Smart Cover Letter) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDraftModal(true);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all duration-200 bg-[#2B4CE0] hover:bg-[#2342D8] shadow-md shadow-[#2B4CE0]/25 hover:shadow-lg active:scale-[0.97] cursor-pointer"
            >
              <span>Buat Draf Lamaran Cepat</span>
            </button>

            {/* Baris bawah: Tombol WhatsApp & Email Seragam */}
            <div className="flex items-center gap-2">
              {cleanPhone ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 active:scale-[0.97]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              ) : (
                <span className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </span>
              )}

              {email ? (
                <a
                  href={emailUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 bg-[#EEF2FF] text-[#2B4CE0] hover:bg-[#E0E7FF] border border-[#2B4CE0]/30 active:scale-[0.97]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              ) : (
                <span className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL SMART COVER LETTER / DRAF LAMARAN CEPAT ── */}
      <SmartDraftModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        job={{
          posisi,
          nama_perusahaan,
          kontak_wa,
          email,
          link_pendaftaran,
          is_walk_in,
          alamat_walk_in,
          lokasi,
          tipe,
          syarat
        }}
      />
    </>
  );
}
