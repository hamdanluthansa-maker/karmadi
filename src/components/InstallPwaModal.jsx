import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Zap,
  Feather,
  Download,
  Share2,
  PlusSquare,
} from 'lucide-react';

/**
 * Komponen Pasang Aplikasi KARMADI ke Layar Utama HP (PWA)
 * - Modal otomatis saat pengunjung pertama kali membuka web.
 * - Tombol mengambang (Floating Action Button) di pojok kiri bawah agar
 *   pengguna kapan saja bisa membuka saran instalasi ke layar utama HP.
 * - Bahasa awam & ramah pengguna tanpa istilah teknis "PWA".
 */
export default function InstallPwaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Cek apakah pengguna sudah menjalankan web sebagai aplikasi mandiri (standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const dismissedAt = localStorage.getItem('karmadi_install_dismissed');
    const shouldAutoShow =
      !dismissedAt || Date.now() - parseInt(dismissedAt, 10) > 3 * 24 * 60 * 60 * 1000;

    // Deteksi iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    // Event standar instalasi browser modern (Chrome Android / Edge / Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (shouldAutoShow) {
        setTimeout(() => setIsOpen(true), 1200);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Deteksi ketika aplikasi berhasil dipasang
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsOpen(false);
      localStorage.setItem('karmadi_install_dismissed', Date.now().toString());
    });

    // Auto-show fallback untuk iOS Safari jika belum pernah ditutup
    if (isAppleDevice && shouldAutoShow) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    // Auto-show fallback untuk browser umum yang menunda event
    const fallbackTimer = setTimeout(() => {
      if (shouldAutoShow && !isStandalone) {
        setIsOpen(true);
      }
    }, 2000);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setShowIosGuide(false);
    // Simpan status agar tidak mengganggu otomatis saat refresh
    localStorage.setItem('karmadi_install_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('karmadi_install_dismissed', Date.now().toString());
        setIsOpen(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Panduan manual jika browser belum siap memicu prompt native
      alert(
        'Untuk memasang aplikasi KARMADI di HP Anda:\n\n1. Ketuk ikon titik tiga (⋮) di pojok kanan atas browser\n2. Pilih "Pasang Aplikasi" atau "Tambahkan ke Layar Utama" (Add to Home screen).'
      );
      handleClose();
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════ */}
      {/* TOMBOL FLOATING / MENGAMBANG "PASANG APLIKASI"      */}
      {/* ═══════════════════════════════════════════════════ */}
      {!isInstalled && (
        <button
          type="button"
          onClick={() => {
            setShowIosGuide(false);
            setIsOpen(true);
          }}
          className="fixed bottom-6 left-5 z-40 group flex items-center gap-2.5 bg-[#00875A] hover:bg-[#00704A] text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-xl shadow-emerald-950/30 border border-emerald-300/40 active:scale-95 transition-all duration-300 cursor-pointer animate-fade-in"
          title="Pasang Aplikasi ke Layar Utama HP"
          aria-label="Pasang Aplikasi ke Layar Utama HP"
        >
          {/* Indikator Ping Kuning Keemasan */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>

          <Download className="w-4 h-4 stroke-[2.5]" />
          <span className="text-xs font-black tracking-wide">Pasang Aplikasi</span>
        </button>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* MODAL SARAN PASANG APLIKASI (PERSIS REFERENSI)      */}
      {/* ═══════════════════════════════════════════════════ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 sm:p-7 text-center border border-slate-100 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Tutup Pojok Kanan Atas */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* ── IKON APLIKASI TERPUSAT (BORDER TEAL/MINT HALUS) ── */}
            <div className="flex justify-center mt-1 mb-4">
              <div className="w-20 h-20 rounded-3xl border-2 border-emerald-400/35 p-1.5 flex items-center justify-center bg-emerald-50/60 shadow-inner">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#00875A] to-[#046142] p-2.5 shadow-md shadow-emerald-900/25 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 opacity-30 group-hover:opacity-60 transition-opacity" />
                  <img
                    src="/assets/logo-karmadi.png"
                    alt="Logo KARMADI"
                    className="w-full h-full object-contain drop-shadow brightness-0 invert relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <Zap className="w-7 h-7 text-amber-300 fill-amber-300 relative z-10" />
                </div>
              </div>
            </div>

            {/* ── BADGE KUNING SARAN PASANG APLIKASI ── */}
            <div className="inline-block bg-[#F59E0B] text-slate-950 font-black text-[11px] sm:text-xs px-4 py-1.5 rounded-full shadow-sm tracking-wider uppercase">
              SARAN PASANG APLIKASI
            </div>

            {/* ── SUBTITLE ── */}
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-3 mb-4 leading-relaxed px-1">
              Akses lebih cepat langsung dari layar utama HP Anda!
            </p>

            {/* ── 3 POIN KEUNGGULAN (KOTAK HIJAU MUDA ELEGAN) ── */}
            <div className="space-y-2.5 text-left mb-5">
              {/* Poin 1 */}
              <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-emerald-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00875A] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Zap className="w-4 h-4 fill-white text-white" />
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 font-bold block mb-0.5">
                    Buka Cepat Sekali Ketuk:
                  </strong>
                  <span className="text-slate-600 text-[11px] leading-relaxed">
                    Buka instan dari layar utama HP tanpa perlu ketik alamat di browser.
                  </span>
                </div>
              </div>

              {/* Poin 2 */}
              <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-emerald-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00875A] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 font-bold block mb-0.5">
                    Tampilan Full Screen:
                  </strong>
                  <span className="text-slate-600 text-[11px] leading-relaxed">
                    Layar penuh layaknya aplikasi native tanpa address bar browser.
                  </span>
                </div>
              </div>

              {/* Poin 3 */}
              <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-emerald-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00875A] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Feather className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 font-bold block mb-0.5">
                    Hemat Kuota & Sangat Ringan:
                  </strong>
                  <span className="text-slate-600 text-[11px] leading-relaxed">
                    Ukuran &lt; 1 MB, hemat kuota internet dan tidak membebani HP.
                  </span>
                </div>
              </div>
            </div>

            {/* Panduan Khusus iOS Safari jika terdeteksi */}
            {showIosGuide && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-left text-xs text-emerald-950 space-y-2 animate-fade-in">
                <p className="font-bold flex items-center gap-1.5 text-[#00875A]">
                  <Smartphone className="w-4 h-4" />
                  <span>Cara Pasang di iPhone / iPad:</span>
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-[11px]">
                  <li>
                    Ketuk tombol <strong>Share / Bagikan</strong> (
                    <Share2 className="w-3 h-3 inline text-blue-600" />) di bilah bawah Safari.
                  </li>
                  <li>
                    Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama"</strong> (
                    <PlusSquare className="w-3 h-3 inline text-slate-700" />
                    ).
                  </li>
                  <li>Ketuk <strong>Tambah</strong> di pojok kanan atas. Selesai!</li>
                </ol>
              </div>
            )}

            {/* ── TOMBOL AKSI UTAMA ── */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#00875A] hover:bg-[#00704A] active:scale-[0.98] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-600/40"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Pasang Aplikasi Sekarang (Gratis)</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
