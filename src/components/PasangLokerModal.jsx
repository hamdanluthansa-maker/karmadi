import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  MessageCircle,
  Award,
} from 'lucide-react';

const ADMIN_WA_NUMBER = '6285119491567';

const PAKET_LIST = [
  {
    id: 'standar',
    nama: 'Paket Standar UMKM',
    harga: 'Gratis (Rp 0)',
    badge: 'Khusus UMKM Mikro',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    borderColor: 'border-slate-200 hover:border-slate-300',
    activeRing: 'ring-2 ring-slate-800 border-slate-800 bg-slate-50/70',
    icon: Building2,
    iconColor: 'text-slate-600 bg-slate-100',
    fitur: [
      'Tayang aktif 30 hari di katalog reguler KARMADI',
      'Tombol Lamar Cepat via WhatsApp & Smart Cover Letter',
      'Cocok untuk usaha mikro, warung, dan toko rintisan',
      'Verifikasi antrean reguler oleh tim Admin',
    ],
  },
  {
    id: 'reguler',
    nama: 'Reguler Terverifikasi',
    harga: 'Rp 25.000',
    satuan: '/ loker',
    badge: 'Paling Diminati',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    activeRing: 'ring-2 ring-[#2B4CE0] border-[#2B4CE0] bg-blue-50/40',
    icon: ShieldCheck,
    iconColor: 'text-emerald-600 bg-emerald-100',
    recommended: true,
    fitur: [
      'Lencana Hijau "Terverifikasi Resmi" (Meningkatkan kepercayaan pelamar)',
      'Terima beres: Cukup kirim foto poster/teks WA, dirapikan AI & Admin',
      'Tayang 30 hari penuh + bebas revisi data kapan saja',
      'Disebarkan ke Saluran & Komunitas Info Loker KARMADI',
    ],
  },
  {
    id: 'urgent',
    nama: 'Prioritas URGENT',
    harga: 'Rp 50.000',
    satuan: '/ loker',
    badge: '🔥 Cepat Dapat Karyawan',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    borderColor: 'border-rose-200 hover:border-rose-400',
    activeRing: 'ring-2 ring-rose-600 border-rose-600 bg-rose-50/40',
    icon: Zap,
    iconColor: 'text-rose-600 bg-rose-100',
    fitur: [
      'Lencana Merah Menyala "URGENT" + Lencana "Terverifikasi Resmi"',
      'Posisi disorot menonjol & menarik perhatian utama pelamar',
      '2x Broadcast Prioritas ke jaringan pencari kerja Madiun Raya',
      'Garansi bantu sundul ulang jika dalam 7 hari belum dapat kandidat',
    ],
  },
];

export default function PasangLokerModal({ isOpen, onClose }) {
  const [selectedPaket, setSelectedPaket] = useState('reguler');
  const [namaUsaha, setNamaUsaha] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activePaketObj = PAKET_LIST.find((p) => p.id === selectedPaket) || PAKET_LIST[1];

  const handleKirimWA = (e) => {
    e.preventDefault();
    const usahaClean = namaUsaha.trim() || '(Nama Usaha Menyusul di Chat)';

    const message =
      `Halo Admin *KARMADI*, saya ingin memasang iklan lowongan kerja:\n\n` +
      `• *Nama Perusahaan / Usaha*: ${usahaClean}\n` +
      `• *Paket Pilihan*: ${activePaketObj.nama} (${activePaketObj.harga})\n\n` +
      `Berikut akan saya kirimkan gambar poster / rincian ketentuan lowongannya. Mohon dibantu proses tayangnya. Terima kasih!`;

    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER MODAL ── */}
        <div className="shrink-0 bg-linear-to-r from-[#0F172A] via-[#1E293B] to-[#2B4CE0] text-white px-5 py-4 sm:px-7 sm:py-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#A3F742]/20 border border-[#A3F742]/40 text-[#A3F742] text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Solusi Rekrutmen Cepat Se-Karesidenan Madiun
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Pasang Info Lowongan Kerja di KARMADI
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Cukup kirim poster atau ketikan syarat via WhatsApp. Sistem AI & Tim KARMADI otomatis merapikan loker Anda agar siap dilamar kandidat terbaik di Madiun, Magetan, Ngawi, Ponorogo & Pacitan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── ISI SCROLLABLE ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
          {/* Keunggulan Singkat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2B4CE0] flex items-center justify-center shrink-0 font-black">
                1
              </div>
              <div>
                <div className="font-bold text-slate-800">Terima Beres (Bantu Input)</div>
                <div className="text-[11px] text-slate-500">Kirim poster/teks, kami ekstrak otomatis</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-black">
                2
              </div>
              <div>
                <div className="font-bold text-slate-800">Pelamar Lebih Sopan & Rapi</div>
                <div className="text-[11px] text-slate-500">Dilengkapi fitur Smart Cover Letter WA</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-black">
                3
              </div>
              <div>
                <div className="font-bold text-slate-800">Filter Spesifik 6 Kota/Kab</div>
                <div className="text-[11px] text-slate-500">Menjangkau talenta lokal Madiun Raya</div>
              </div>
            </div>
          </div>

          {/* ── PILIHAN PAKET (RATE CARD) ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#2B4CE0]" />
                1. Pilih Paket Tayang Lowongan
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Klik kartu paket untuk memilih
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {PAKET_LIST.map((paket) => {
                const IconComp = paket.icon;
                const isSelected = selectedPaket === paket.id;
                return (
                  <div
                    key={paket.id}
                    onClick={() => setSelectedPaket(paket.id)}
                    className={`relative rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected ? paket.activeRing : `${paket.borderColor} bg-white`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${paket.badgeColor}`}
                        >
                          {paket.badge}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#2B4CE0] border-[#2B4CE0] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`p-2 rounded-xl ${paket.iconColor}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                            {paket.nama}
                          </h4>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-base font-black text-[#2B4CE0]">
                              {paket.harga}
                            </span>
                            {paket.satuan && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                {paket.satuan}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                        {paket.fitur.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── FORM SINGKAT: CUKUP NAMA PERUSAHAAN + TOMBOL WA ── */}
          <form onSubmit={handleKirimWA} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2B4CE0]" />
                2. Nama Perusahaan / Toko / UMKM Anda
              </label>
              <span className="text-[11px] text-slate-500">
                Paket terpilih:{' '}
                <strong className="text-[#2B4CE0]">
                  {activePaketObj.nama} ({activePaketObj.harga})
                </strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={namaUsaha}
                  onChange={(e) => setNamaUsaha(e.target.value)}
                  placeholder="Ketik nama usaha (Contoh: Toko Berkah Madiun / PT Maju Jaya)..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B4CE0]"
                />
              </div>

              <button
                type="submit"
                className="shrink-0 px-5 py-2.5 bg-[#2B4CE0] hover:bg-[#1E3AC8] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#2B4CE0]/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-[#A3F742]" />
                <span>Lanjut Kirim Poster / Syarat di WA</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
