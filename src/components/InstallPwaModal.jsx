import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, Share2, PlusSquare } from 'lucide-react';

/**
 * Modal Pop-Up Instal Aplikasi (PWA) KARMADI
 * Tampil saat pengunjung pertama kali membuka aplikasi web KARMADI,
 * dengan desain elegan persis seperti referensi pop-up instalasi aplikasi.
 */
export default function InstallPwaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Cek apakah pengguna sudah pernah menolak/menutup pop-up instalasi sebelumnya
    const dismissedAt = localStorage.getItem('karmadi_pwa_dismissed');
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    // Jika sudah terpasang sebagai aplikasi mandiri, jangan tampilkan pop-up
    if (isStandalone) {
      return;
    }

    // Tampilkan jika belum pernah ditutup, atau jika sudah lewat 3 hari sejak penutupan terakhir
    const shouldShow =
      !dismissedAt || Date.now() - parseInt(dismissedAt, 10) > 3 * 24 * 60 * 60 * 1000;

    // Deteksi perangkat iOS (Safari tidak mendukung beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    // Event penangkap instalasi PWA standar (Chrome Android / Edge / Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (shouldShow) {
        setTimeout(() => setIsOpen(true), 1200);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Jika di iOS dan belum ditutup, munculkan pop-up dengan panduan Add to Home Screen
    if (isAppleDevice && shouldShow) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    // Jika event beforeinstallprompt tidak terpanggil dalam 2.5 detik (misal browser non-Chromium)
    const fallbackTimer = setTimeout(() => {
      if (shouldShow && !isStandalone) {
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
    // Simpan status agar tidak mengganggu setiap kali refresh dalam waktu dekat
    localStorage.setItem('karmadi_pwa_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('karmadi_pwa_dismissed', Date.now().toString());
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      // Buka panduan khusus iOS
      setShowIosGuide(true);
    } else {
      // Browser modern yang menyembunyikan prompt instalasi otomatis
      alert(
        'Untuk memasang aplikasi KARMADI di HP Anda:\n\n1. Ketuk ikon titik tiga (⋮) di pojok kanan atas browser\n2. Pilih "Pasang Aplikasi" atau "Tambahkan ke Layar Utama" (Add to Home Screen).'
      );
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-6 sm:p-7 text-center border border-slate-100 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Pojok Kanan Atas */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* ── LOGO APPS (Berbentuk Kotak Rounded Mengkilap seperti Referensi) ── */}
        <div className="flex justify-center mt-2 mb-5">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#2B4CE0] via-[#1E3AB8] to-[#11247A] p-3.5 shadow-xl shadow-[#2B4CE0]/30 border-4 border-white flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <img
              src="/assets/logo-karmadi.png"
              alt="Logo KARMADI"
              className="w-full h-full object-contain drop-shadow-md relative z-10"
              onError={(e) => {
                e.currentTarget.src = '/assets/logo-karmadi.svg';
              }}
            />
          </div>
        </div>

        {/* ── JUDUL & DESKRIPSI ── */}
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Instal Aplikasi KARMADI
        </h3>

        <p className="text-xs sm:text-[13px] text-slate-500 mt-2.5 leading-relaxed px-1">
          Pasang aplikasi resmi di <strong className="text-slate-700">HP Anda</strong> untuk akses mudah, cepat, dan langsung dari layar utama tanpa repot membuka browser.
        </p>

        {/* Panduan Khusus iOS Safari jika terdeteksi */}
        {showIosGuide && (
          <div className="mt-4 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-left text-xs text-blue-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-[#2B4CE0]">
              <Smartphone className="w-4 h-4" />
              <span>Cara Pasang di iPhone / iPad:</span>
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-[11px]">
              <li>
                Ketuk tombol <strong>Share / Bagikan</strong> (<Share2 className="w-3 h-3 inline text-blue-600" />) di bilah bawah Safari.
              </li>
              <li>
                Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama"</strong> (<PlusSquare className="w-3 h-3 inline text-slate-700" />).
              </li>
              <li>Ketuk <strong>Tambah</strong> di pojok kanan atas. Selesai!</li>
            </ol>
          </div>
        )}

        {/* ── TOMBOL AKSI UTAMA (HIJAU TUA / GELAP ELEGAN PERSIS REFERENSI) ── */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-4 px-6 rounded-2xl bg-[#0B4A3F] hover:bg-[#073B32] active:scale-98 text-white font-black text-sm tracking-wide shadow-lg shadow-[#0B4A3F]/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#146052]"
          >
            <span className="text-base">📲</span>
            <span>Instal Aplikasi Sekarang</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Nanti Saja (Buka di Browser)
          </button>
        </div>
      </div>
    </div>
  );
}
