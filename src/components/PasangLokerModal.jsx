import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  MessageCircle,
  User,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Info,
} from 'lucide-react';

const ADMIN_WA_NUMBER = '6285119491567';

const WILAYAH_LIST = [
  'Kota Madiun',
  'Kab. Madiun',
  'Magetan',
  'Ngawi',
  'Ponorogo',
  'Pacitan',
];

export default function PasangLokerModal({ isOpen, onClose }) {
  const [namaUsaha, setNamaUsaha] = useState('');
  const [namaPenyedia, setNamaPenyedia] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [wilayah, setWilayah] = useState('Kota Madiun');
  const [alamatDetail, setAlamatDetail] = useState('');
  const [posisi, setPosisi] = useState('');
  const [tipeKerja, setTipeKerja] = useState('Full Time');
  const [kualifikasiSingkat, setKualifikasiSingkat] = useState('');
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const fileInputRef = useRef(null);

  // Tangani tombol Back HP & Escape agar menutup modal, bukan keluar browser
  useEffect(() => {
    if (!isOpen) return;

    const modalStateKey = 'karmadi_pasang_loker_modal';
    window.history.pushState({ [modalStateKey]: true }, '');

    const handlePopState = () => {
      onClose();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPosterPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKirimWA = async (e) => {
    e.preventDefault();

    const lokasiLengkap = alamatDetail.trim()
      ? `${alamatDetail.trim()}, ${wilayah}`
      : wilayah;

    const adaPoster = Boolean(posterFile);

    const message =
      `Halo Admin *KARMADI*, saya ingin pasang info lowongan kerja (*PROMO GRATIS S/D AKHIR TAHUN 2026*):\n\n` +
      `🏢 *Nama Usaha / PT*: ${namaUsaha.trim()}\n` +
      `👤 *Nama Penyedia / PIC*: ${namaPenyedia.trim()}\n` +
      `📱 *Nomor HP / WA Aktif*: ${nomorHp.trim()}\n` +
      `📍 *Lokasi Penempatan*: ${lokasiLengkap}\n` +
      `💼 *Posisi yang Dicari*: ${posisi.trim() || '(Sesuai Poster)'} (${tipeKerja})\n` +
      (kualifikasiSingkat.trim()
        ? `📋 *Syarat / Keterangan Singkat*:\n${kualifikasiSingkat.trim()}\n\n`
        : `\n`) +
      (adaPoster
        ? `🖼️ *Gambar Poster Loker*: Sudah saya siapkan (${posterFile.name}), berikut saya lampirkan fotonya di chat ini.\n\n`
        : `📝 *Gambar Poster*: Belum ada poster, mohon dibantu buatkan kartu loker otomatis di KARMADI.\n\n`) +
      `Mohon dibantu verifikasi dan penayangannya di KARMADI. Terima kasih!`;

    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER MODAL ── */}
        <div className="shrink-0 bg-gradient-to-r from-[#1E3AB8] via-[#2B4CE0] to-[#1E3AB8] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-start justify-between gap-4 border-b border-blue-400/20">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#A3F742] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950" />
              Bebas Biaya 100% s/d 31 Desember 2026
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Pasang Loker disini GRATIS!!! sampai akhir tahun
            </h2>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Isi formulir singkat di bawah ini untuk menayangkan lowongan kerja usaha/perusahaan Anda di KARMADI & Saluran WhatsApp Madiun Raya.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── ISI FORMULIR SCROLLABLE ── */}
        <form
          onSubmit={handleKirimWA}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4"
        >
          {/* Banner Keuntungan Gratis */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2B4CE0] text-[#A3F742] flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-black text-slate-900 block">
                  Fasilitas Tayang Gratis yang Anda Dapatkan:
                </span>
                <span className="text-[11px] text-slate-600 leading-snug">
                  Tayang 30 hari penuh • Lencana Terverifikasi • Tombol Lamar WA Cepat • Broadcast ke Saluran WA
                </span>
              </div>
            </div>
            <span className="self-start sm:self-auto shrink-0 px-2.5 py-1 rounded-full bg-[#A3F742] text-slate-950 font-black text-[10px] uppercase tracking-wider">
              Rp 0 (Gratis)
            </span>
          </div>

          {/* ── BARIS 1: NAMA USAHA & NAMA PENYEDIA ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nama Usaha / PT */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#2B4CE0]" />
                <span>Nama Usaha / PT / Toko <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                value={namaUsaha}
                onChange={(e) => setNamaUsaha(e.target.value)}
                placeholder="Contoh: Toko Berkah / PT Maju Jaya"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0]"
              />
            </div>

            {/* Nama Penyedia Lowongan (PIC / HRD / Owner) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2B4CE0]" />
                <span>Nama Penyedia Loker (PIC/Owner) <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                value={namaPenyedia}
                onChange={(e) => setNamaPenyedia(e.target.value)}
                placeholder="Contoh: Bpk. Budi (Owner) / Ibu Sari (HRD)"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0]"
              />
            </div>
          </div>

          {/* ── BARIS 2: NOMOR HP/WA & WILAYAH LOKASI ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nomor HP / WhatsApp */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2B4CE0]" />
                <span>Nomor HP / WhatsApp Aktif <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="tel"
                required
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0]"
              />
            </div>

            {/* Pilih Kota / Kabupaten */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2B4CE0]" />
                <span>Kota / Kabupaten Penempatan <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={wilayah}
                onChange={(e) => setWilayah(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0] cursor-pointer"
              >
                {WILAYAH_LIST.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detail Lokasi / Alamat Singkat */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Detail Lokasi / Kecamatan / Jalan <span className="text-slate-400 font-normal">(Opsional)</span></span>
            </label>
            <input
              type="text"
              value={alamatDetail}
              onChange={(e) => setAlamatDetail(e.target.value)}
              placeholder="Contoh: Jl. Pahlawan No. 12, Kec. Kartoharjo (Dekat Alun-Alun)"
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0]"
            />
          </div>

          {/* ── BARIS 3: POSISI YANG DICARI & TIPE KERJA (TAMBAHAN PELENGKAP) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#2B4CE0]" />
                <span>Posisi Pekerjaan yang Dibutuhkan <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                value={posisi}
                onChange={(e) => setPosisi(e.target.value)}
                placeholder="Contoh: Kasir, Barista, Admin Sosmed, Kurir, Pramuniaga"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#2B4CE0]" />
                <span>Tipe Kerja</span>
              </label>
              <select
                value={tipeKerja}
                onChange={(e) => setTipeKerja(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0] cursor-pointer"
              >
                <option value="Full Time">Full Time</option>
                <option value="Freelance">Freelance / Part Time</option>
              </select>
            </div>
          </div>

          {/* ── SYARAT SINGKAT (OPSIONAL) ── */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2B4CE0]" />
              <span>Syarat & Info Gaji Singkat <span className="text-slate-400 font-normal">(Opsional jika sudah ada gambar poster)</span></span>
            </label>
            <textarea
              rows={2}
              value={kualifikasiSingkat}
              onChange={(e) => setKualifikasiSingkat(e.target.value)}
              placeholder="Contoh: Pria/Wanita max 27 thn, min. SMA/SMK, jujur & ramah. Gaji Rp 2.000.000 + bonus makan."
              className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0]"
            />
          </div>

          {/* ── UPLOAD GAMBAR POSTER LOKER (OPSIONAL) ── */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#2B4CE0]" />
                <span>Upload Gambar Poster Loker <span className="text-slate-400 font-normal">(Opsional jika sudah punya gambarnya)</span></span>
              </span>
            </label>

            {!posterPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-[#2B4CE0] bg-blue-50/40 hover:bg-blue-50/80 rounded-2xl p-4 text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-white text-[#2B4CE0] shadow-xs border border-blue-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Klik untuk pilih gambar poster dari HP / Komputer
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Format JPG / PNG. Jika belum punya poster, lewati saja (kami buatkan otomatis).
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={posterPreview}
                    alt="Preview Poster"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {posterFile?.name || 'Poster_Loker.jpg'}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Gambar siap dikirim bersama draf WA</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePoster}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer shrink-0"
                  title="Hapus Gambar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {posterPreview && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Saat chat WhatsApp Admin terbuka, cukup <strong>lampirkan gambar poster ini</strong> sekali di ruang chat agar langsung diproses AI kami.
                </span>
              </div>
            )}
          </div>

          {/* ── TOMBOL KIRIM PENGAJUAN ── */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-5 bg-[#2B4CE0] hover:bg-[#1E3AB8] text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#2B4CE0]/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 border border-blue-400/30"
            >
              <MessageCircle className="w-4 h-4 text-[#A3F742] fill-[#A3F742]" />
              <span>Kirim & Tayangkan Loker Sekarang (GRATIS)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
