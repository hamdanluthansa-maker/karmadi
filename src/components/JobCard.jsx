import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  MessageCircle, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Bookmark, 
  Sparkles, 
  ExternalLink, 
  Mail, 
  Zap, 
  XCircle, 
  Footprints,
  Maximize2,
  FileText,
  X
} from 'lucide-react';
import SmartDraftModal from './SmartDraftModal';

/**
 * Komponen JobCard untuk menampilkan preview kartu lowongan kerja
 * yang akan dilihat oleh para pencari kerja di Kota Madiun.
 * 
 * Props:
 * - poster_url: string (URL gambar poster)
 * - nama_perusahaan: string (Nama perusahaan)
 * - posisi: string (Posisi jabatan)
 * - syarat: string[] | string (Persyaratan lowongan)
 * - warna_primer: string (Kode HEX warna dominan poster, cth: #10B981)
 * - kontak_wa: string (Nomor WhatsApp rekruter, cth: 6281234567890)
 * - email: string (Alamat email rekrutmen, opsional)
 * - lokasi: string (Opsional, default Kota Madiun)
 * - tipe_pekerjaan: string (Opsional, default Full Time)
 */
export default function JobCard({
  poster_url,
  nama_perusahaan = 'PT Contoh Madiun Industri',
  posisi = 'Staf Operasional',
  syarat = [],
  benefit = [],
  catatan = '',
  warna_primer = '#16a34a',
  kontak_wa = '6281234567890',
  email = '',
  link_pendaftaran = '',
  is_walk_in = false,
  alamat_walk_in = '',
  lokasi = 'Kota Madiun, Jawa Timur',
  tipe_pekerjaan = 'Full Time / Penuh Waktu',
  is_urgent = false
}) {
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Pastikan syarat dan benefit dalam bentuk array
  const syaratList = Array.isArray(syarat)
    ? syarat
    : typeof syarat === 'string'
    ? syarat.split('\n').filter(Boolean)
    : [];

  const benefitList = Array.isArray(benefit)
    ? benefit
    : typeof benefit === 'string'
    ? benefit.split('\n').filter(Boolean)
    : [];

  // Format link WhatsApp
  const cleanPhone = (kontak_wa || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${nama_perusahaan}, saya tertarik melamar posisi ${posisi} yang tertera di portal Karmadi.`)}`
    : '#';

  const primaryColor = warna_primer || '#2563eb';
  const hasPoster = Boolean(poster_url && typeof poster_url === 'string' && !poster_url.includes('logo-karmadi'));

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col">
      {/* Top Accent Strip with Extracted Primary Color */}
      <div 
        className="h-2 w-full transition-colors duration-500" 
        style={{ backgroundColor: primaryColor }}
      />

      {/* Header Info Bar */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lowongan Terverifikasi Resmi</span>
          </div>
          {is_urgent && (
            <div className="flex items-center gap-1 bg-rose-600 text-white font-black px-2.5 py-1 rounded-full border border-rose-400 shadow-xs animate-pulse">
              <span>🔥 URGENT</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Baru Dipasang
          </span>
          <button 
            type="button" 
            title="Simpan Lowongan"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 md:p-6 flex-1 flex flex-col">
        {/* Company & Position Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {nama_perusahaan}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {posisi}
            </h3>
            {is_urgent && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-600 border border-rose-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                <span>🔥 LOKER URGENT — SEGERA DIBUTUHKAN CEPAT</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {lokasi}
              </span>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-md border border-blue-100">
                {tipe_pekerjaan}
              </span>
              {warna_primer && (
                <span 
                  className="text-[11px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 bg-slate-50"
                  title="Warna tema terdeteksi AI dari poster"
                >
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: primaryColor }} />
                  {warna_primer}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Layout: Poster preview & Requirements list */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
          {/* Poster Column ATAU Visual Banner Tipografi Teks */}
          {hasPoster ? (
            <div 
              onClick={() => setShowImagePreview(true)}
              className="sm:col-span-5 relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner cursor-zoom-in"
              title="Klik untuk memperbesar poster"
            >
              <img 
                src={poster_url} 
                alt={`Poster loker ${posisi} - ${nama_perusahaan}`} 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-48 sm:h-56 object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImagePreview(true);
                }}
                className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px] cursor-zoom-in"
              >
                <Maximize2 className="w-4 h-4" />
                Buka Gambar Penuh
              </button>
              <div className="absolute top-2 left-2 bg-slate-900/70 text-white backdrop-blur text-[10px] font-semibold px-2 py-0.5 rounded">
                Poster Resmi
              </div>
              {is_urgent && (
                <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md animate-pulse border border-rose-400 z-10">
                  🔥 URGENT
                </div>
              )}
            </div>
          ) : (
            <div 
              className="sm:col-span-5 relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[190px] border border-white/20 select-none"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, #0F172A 100%)` 
              }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#2B4CE0] bg-white/95 px-2.5 py-0.5 rounded-full shadow-2xs">
                  Terverifikasi
                </span>
                <div className="flex items-center gap-1.5">
                  {is_urgent && (
                    <span className="text-[10px] font-black text-white bg-rose-600 px-2.5 py-0.5 rounded-full border border-rose-400 shadow-sm animate-pulse">
                      🔥 URGENT
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
                    {tipe_pekerjaan}
                  </span>
                </div>
              </div>
              <div className="relative z-10 my-auto py-2">
                <p className="text-[11px] font-bold text-white/85 uppercase tracking-wider mb-1 truncate">
                  {nama_perusahaan}
                </p>
                <h4 className="text-base sm:text-lg font-black text-white leading-tight line-clamp-2 drop-shadow-sm">
                  {posisi}
                </h4>
              </div>
              <div className="relative z-10 text-[10px] text-white/70 font-medium">
                Format Visual Kartu Publik
              </div>
            </div>
          )}

          {/* Requirements Column */}
          <div className="sm:col-span-7 flex flex-col justify-between h-full">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Kualifikasi & Persyaratan:
              </h4>
              <ul className="space-y-2">
                {syaratList.length > 0 ? (
                  syaratList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700 leading-relaxed">
                      <CheckCircle2 
                        className="w-4 h-4 shrink-0 mt-0.5" 
                        style={{ color: primaryColor }}
                      />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs italic text-slate-400">
                    Kualifikasi lengkap tertera pada poster loker atau konfirmasi via WhatsApp.
                  </li>
                )}
              </ul>

              {/* Benefit & Fasilitas (Gaji, Lembur, Mess, dsb) */}
              {benefitList.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Benefit & Fasilitas:</span>
                  </div>
                  <ul className="space-y-1 text-emerald-900 font-medium">
                    {benefitList.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Catatan & Ketentuan Tambahan */}
              {catatan && (
                <div className="mt-3 p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 space-y-1 text-xs">
                  <div className="font-bold text-blue-950 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Catatan & Ketentuan:</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed whitespace-pre-line font-medium">
                    {Array.isArray(catatan) ? catatan.join('\n') : catatan}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3 Tombol Aksi Lamaran (Preview) */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="space-y-0.5">
              <div>
                <span>WA: </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {cleanPhone ? `+${cleanPhone}` : '-'}
                </span>
              </div>
              {email && (
                <div>
                  <span>Email: </span>
                  <span className="font-semibold text-slate-800">
                    {email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* INFO BESAR: WAJIB DATANG LANGSUNG / WALK-IN INTERVIEW (JIKA ADA) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {is_walk_in && (
            <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-950 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-black text-xs text-amber-900 tracking-tight">
                <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>LAMARAN WAJIB DATANG LANGSUNG / WALK-IN</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Pengiklan lowongan meminta pelamar membawa berkas fisik langsung ke alamat:
              </p>
              <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs font-bold text-slate-800 flex items-start gap-1.5 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{alamat_walk_in || lokasi || 'Alamat tertera di poster'}</span>
              </div>
            </div>
          )}

          {/* Tombol Formulir / Link Pendaftaran Langsung (Jika Ada) */}
          {link_pendaftaran ? (
            <a
              href={link_pendaftaran}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 active:scale-95 transition-all text-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Isi Formulir Pendaftaran (Online)</span>
            </a>
          ) : null}

          {/* Tombol Buat Draf Lamaran Cepat (Smart Cover Letter) */}
          <button
            type="button"
            onClick={() => setShowDraftModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 active:scale-95 transition-all text-center cursor-pointer"
          >
            <span>Buat Draf Lamaran Cepat</span>
          </button>

          {/* Baris Sekunder: WhatsApp + Email */}
          {cleanPhone || email ? (
            <div className="flex items-center gap-2">
              {cleanPhone ? (
                <a
                  href={waUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Lamar via WhatsApp
                </a>
              ) : (
                <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WA Tidak Ada
                </span>
              )}

              {email ? (
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(`Lamaran Posisi ${posisi} — Karmadi`)}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Lamar via Email
                </a>
              ) : (
                <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed">
                  <Mail className="w-3.5 h-3.5" />
                  Email Tidak Ada
                </span>
              )}
            </div>
          ) : is_walk_in ? (
            <div className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-amber-800 bg-amber-50/80 rounded-lg border border-amber-200 text-center font-medium">
              <Footprints className="w-3.5 h-3.5 text-amber-600" />
              <span>Tidak ada kontak online (Wajib serahkan berkas ke alamat)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed">
                <MessageCircle className="w-3.5 h-3.5" />
                Lamar via WhatsApp
              </span>
              <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed">
                <Mail className="w-3.5 h-3.5" />
                Lamar via Email
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Karmadi • Info Lowongan Kerja Seputar Karesidenan Madiun</span>
        <span className="font-medium text-slate-500">Portal Karir Terpercaya</span>
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
          tipe: tipe_pekerjaan,
          syarat
        }}
      />

      {/* ── MODAL PREVIEW GAMBAR PENUH (LIGHTBOX) ── */}
      {showImagePreview && poster_url && (
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
            <button
              type="button"
              onClick={() => setShowImagePreview(false)}
              className="absolute -top-12 right-0 sm:-right-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-white/20 shadow-lg"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>

            <img
              src={poster_url}
              alt={`Poster Lengkap ${posisi}`}
              className="max-h-[84vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl border border-white/10 select-none bg-slate-900/60"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/logo-karmadi.png';
              }}
            />

            <div className="mt-3 text-white/60 text-xs flex items-center gap-2 select-none bg-black/40 px-3 py-1 rounded-full border border-white/10">
              <span>Klik di luar gambar atau tombol tutup untuk kembali</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
