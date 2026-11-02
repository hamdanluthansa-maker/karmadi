import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
  Search,
  Copy,
  Check,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  analyzeScamRisk,
  getWaChatUrl,
  getKredibelSearchUrl,
  getGoogleSearchUrl,
} from '../utils/phoneVerifier';

/**
 * Alat Verifikasi & Anti-Penipuan Nomor WA Perekrut KARMADI
 * Terpasang langsung di dashboard ekstraktor agar Admin dapat memvalidasi
 * keaslian kontak sebelum mempublikasikan lowongan kerja ke publik.
 */
export default function RecruiterWaVerifier({
  phone = '',
  jobData = {},
  isVerified = false,
  onVerifyChange = null,
}) {
  const [copied, setCopied] = useState(false);
  const analysis = analyzeScamRisk(phone, jobData);

  if (!phone || !phone.trim()) {
    return (
      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Masukkan nomor WhatsApp perekrut di atas untuk menjalankan alat verifikasi keamanan otomatis.</span>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.localNumber || phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDanger = analysis.riskLevel === 'HIGH_RISK';
  const isSuspicious = analysis.riskLevel === 'SUSPICIOUS';
  const isSafe = analysis.riskLevel === 'SAFE' && analysis.isValid;

  return (
    <div
      className={`mt-2.5 p-3.5 rounded-2xl border transition-all text-xs space-y-3 ${
        isDanger
          ? 'bg-rose-50/80 border-rose-300 text-rose-950'
          : isSuspicious
          ? 'bg-amber-50/80 border-amber-300 text-amber-950'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
      }`}
    >
      {/* ── HEADER STATUS DETEKSI ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {isDanger ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          ) : isSuspicious ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="font-extrabold uppercase tracking-wider text-[11px]">
            {isDanger
              ? 'Waspada: Terdeteksi Risiko Penipuan Loker!'
              : isSuspicious
              ? 'Peringatan: Format Perlu Dicek Ulang'
              : 'Verifikasi Nomor WA: Format Aman & Bersih'}
          </span>
        </div>

        {/* Badge Operator */}
        <span className="px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/80 text-[10px] font-bold text-slate-700 shadow-2xs">
          📶 {analysis.operator}
        </span>
      </div>

      {/* ── HASIL ANALISIS INDIKATOR ── */}
      <div className="space-y-1 text-[11px] leading-relaxed">
        {analysis.warnings.map((warn, i) => (
          <div key={i} className="flex items-start gap-1.5 text-rose-700 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
            <span>{warn}</span>
          </div>
        ))}

        {analysis.greenFlags.map((flag, i) => (
          <div key={i} className="flex items-start gap-1.5 text-emerald-800 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
            <span>{flag}</span>
          </div>
        ))}
      </div>

      {/* ── ALAT PEMERIKSAAN LANGSUNG (1-KLIK CEK EKSTERNAL) ── */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
        {/* 1. Test Chat WA Tanpa Save */}
        <a
          href={getWaChatUrl(analysis.cleanNumber, jobData.perusahaan)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-xs transition active:scale-95"
          title="Buka chat WhatsApp langsung untuk cek foto profil & status bisnis resmi"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white" />
          <span>Tes Profil WA</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
        </a>

        {/* 2. Cek Riwayat Penipuan di Kredibel.co.id */}
        <a
          href={getKredibelSearchUrl(analysis.localNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition active:scale-95"
          title="Cek apakah nomor ini pernah dilaporkan menipu di database Kredibel.co.id"
        >
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span>Cek Kredibel.co.id</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>

        {/* 3. Cek Jejak Rekam di Google */}
        <a
          href={getGoogleSearchUrl(analysis.localNumber, analysis.cleanNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition active:scale-95"
          title="Telusuri jejak digital nomor di Google (apakah pernah di-blacklist di Facebook / Twitter)"
        >
          <Search className="w-3.5 h-3.5 text-red-500" />
          <span>Jejak Google</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>

        {/* 4. Salin Nomor untuk Getcontact */}
        <button
          type="button"
          onClick={handleCopy}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          title="Salin nomor untuk ditempel di aplikasi Getcontact / Truecaller"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-black">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Salin Nomor</span>
            </>
          )}
        </button>
      </div>

      {/* ── KONTROL ADMIN: TANDAI NOMOR TERVERIFIKASI RESMI ── */}
      {onVerifyChange && (
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(isVerified)}
              onChange={(e) => onVerifyChange(e.target.checked)}
              className="w-4 h-4 rounded text-[#2B4CE0] focus:ring-[#2B4CE0] cursor-pointer"
            />
            <span className="text-[11px] font-bold text-slate-800">
              Tandai Nomor Perekrut Ini <strong className="text-emerald-700">"Terverifikasi Resmi"</strong>
            </span>
          </label>
          <span className="text-[10px] text-slate-500 italic hidden sm:inline">
            Menampilkan lencana hijau di katalog
          </span>
        </div>
      )}
    </div>
  );
}
