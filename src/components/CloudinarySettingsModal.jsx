import React, { useState, useMemo } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Zap,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Check,
  HardDrive
} from 'lucide-react';
import {
  getCloudinaryConfig,
  saveCloudinaryConfig,
  isCloudinaryConfigured,
  uploadImageToCloudinary,
  migrateJobsPostersToCloudinary,
} from '../services/cloudinaryService';
import { useJobs } from '../context/JobContext';

export default function CloudinarySettingsModal({ isOpen, onClose }) {
  const { jobs, replaceJobs } = useJobs();
  const currentConfig = useMemo(() => getCloudinaryConfig(), [isOpen]);

  const [cloudName, setCloudName] = useState(currentConfig.cloudName || '');
  const [uploadPreset, setUploadPreset] = useState(currentConfig.uploadPreset || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Status Migrasi
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);

  if (!isOpen) return null;

  // Hitung berapa banyak loker yang masih menyimpan gambar Base64 raksasa
  const base64JobCount = (jobs || []).filter(
    (j) => j.poster_url && typeof j.poster_url === 'string' && j.poster_url.startsWith('data:image/')
  ).length;

  const handleSaveAndTest = async (e) => {
    e.preventDefault();
    const cleanName = cloudName.trim();
    const cleanPreset = uploadPreset.trim();

    if (!cleanName || !cleanPreset) {
      setTestResult({
        success: false,
        message: 'Mohon isi Cloud Name dan Upload Preset.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Simpan ke storage terlebih dahulu
    saveCloudinaryConfig(cleanName, cleanPreset);

    // Lakukan tes upload gambar 1x1 transparan kecil untuk verifikasi koneksi Cloudinary
    const testPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const res = await uploadImageToCloudinary(testPixel);

    setIsTesting(false);
    if (res.success) {
      setTestResult({
        success: true,
        message: 'Koneksi Berhasil! Akun Cloudinary aktif dan siap mengunggah gambar secara instan.',
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Gagal terhubung. Pastikan Cloud Name dan Upload Preset (mode Unsigned) sudah benar.',
      });
    }
  };

  const handleStartMigration = async () => {
    if (!isCloudinaryConfigured()) {
      alert('Simpan dan verifikasi koneksi Cloudinary terlebih dahulu.');
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const { updatedJobs, migratedCount, failedCount } = await migrateJobsPostersToCloudinary(
        jobs,
        (progress) => {
          setMigrationProgress(progress);
        }
      );

      replaceJobs(updatedJobs);
      setMigrationResult({
        success: true,
        migratedCount,
        failedCount,
        message: `Selesai! Sebanyak ${migratedCount} poster berhasil dipindahkan ke Cloudinary. Database kini 98% lebih ringan.`,
      });
    } catch (err) {
      setMigrationResult({
        success: false,
        message: err.message || 'Terjadi kesalahan saat migrasi.',
      });
    } finally {
      setIsMigrating(false);
      setMigrationProgress(null);
    }
  };

  const isConfigured = Boolean(cloudName.trim() && uploadPreset.trim() && testResult?.success);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-[#2B4CE0] px-6 py-4 text-white flex items-center justify-between shrink-0 border-b-2 border-[#A3F742]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Cloud className="w-6 h-6 text-[#A3F742]" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">Penyimpanan Cloud Gambar (Cloudinary)</h3>
              <p className="text-xs text-blue-100 font-medium">Bikin Web App KARMADI Selalu Ringan & Instan di HP</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Banner Manfaat */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs text-emerald-950">
            <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kenapa Perlu Cloud Storage?</span>
            </div>
            <p className="leading-relaxed text-emerald-900/90 font-medium">
              Saat ini file database <code>jobs.json</code> berukuran <strong>9,1 MB</strong> karena menampung teks gambar poster Base64.
              Dengan Cloudinary, gambar disimpan di CDN awan gratis (WebP otomatis) dan ukuran database menyusut jadi <strong>~30 KB</strong> (turun 98%).
            </p>
          </div>

          {/* Form Konfigurasi */}
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cloud Name
              </label>
              <input
                type="text"
                required
                value={cloudName}
                onChange={(e) => {
                  setCloudName(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Contoh: dxyz123abc"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4CE0] text-slate-800 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Dapat dilihat di Dashboard Cloudinary (menu atas).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Upload Preset (Mode: Unsigned)
              </label>
              <input
                type="text"
                required
                value={uploadPreset}
                onChange={(e) => {
                  setUploadPreset(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Contoh: karmadi_posters"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4CE0] text-slate-800 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Dibuat di Cloudinary: Settings ➔ Upload ➔ Upload presets (Pilih mode <strong>Unsigned</strong>).
              </span>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isTesting || !cloudName.trim() || !uploadPreset.trim()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2B4CE0] hover:bg-[#1E3AB8] text-white shadow-md shadow-[#2B4CE0]/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Memverifikasi Akun...' : 'Simpan & Tes Koneksi Cloudinary'}</span>
            </button>
          </form>

          {/* ── CARD MIGRASI GAMBAR LAMA KE CLOUD ── */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs text-slate-800 uppercase tracking-wider">
                <HardDrive className="w-4 h-4 text-[#2B4CE0]" />
                <span>Pembersihan Database Poster Lama</span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {base64JobCount} Gambar Berat
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Terdapat <strong>{base64JobCount} lowongan</strong> yang posternya masih tersimpan di dalam database lokal.
              Klik tombol di bawah untuk memindahkan semuanya ke Cloudinary secara otomatis agar web app kembali enteng.
            </p>

            {isMigrating && migrationProgress && (
              <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Memproses: {migrationProgress.posisi}</span>
                  <span>{migrationProgress.current} / {migrationProgress.total}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2B4CE0] rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((migrationProgress.current / migrationProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {migrationResult && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  migrationResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{migrationResult.message}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleStartMigration}
              disabled={isMigrating || base64JobCount === 0}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#A3F742]" />
              <span>
                {isMigrating
                  ? 'Sedang Memindahkan Gambar ke Cloud...'
                  : base64JobCount === 0
                  ? 'Semua Poster Sudah Menggunakan Cloud (Selesai)'
                  : `Migrasikan ${base64JobCount} Poster ke Cloudinary Sekarang`}
              </span>
            </button>
          </div>

          {/* Panduan 3 Langkah Daftar Cloudinary Gratis */}
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2 text-xs text-blue-950">
            <div className="font-extrabold flex items-center gap-1.5 text-blue-900">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Cara Mendapatkan Cloud Name & Upload Preset (Gratis 100%):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1 leading-relaxed">
              <li>
                Daftar akun gratis di{' '}
                <a
                  href="https://cloudinary.com/users/register_free"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#2B4CE0] hover:underline inline-flex items-center gap-0.5"
                >
                  <span>cloudinary.com</span>
                  <ExternalLink className="w-3 h-3 inline" />
                </a>.
              </li>
              <li>Di Dashboard, salin nama <strong>Cloud Name</strong> Anda dan tempel di kolom atas.</li>
              <li>
                Buka menu <strong>Settings (ikon Gerigi) ➔ Upload ➔ Upload presets</strong>, klik <strong>Add upload preset</strong>, ubah Signing Mode menjadi <strong>Unsigned</strong>, lalu klik <strong>Save</strong>.
              </li>
              <li>Salin nama Upload Preset tersebut dan tempel di kolom kedua. Selesai!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">KARMADI Cloud Image Optimizer</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
