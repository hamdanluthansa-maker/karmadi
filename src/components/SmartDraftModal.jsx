import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Send,
  Mail,
  MessageCircle,
  X,
  Sparkles,
  Printer,
  Download,
  User,
  Phone,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { generateCoverLetterPdf } from '../utils/pdfGenerator';

/**
 * SmartDraftModal — Asisten Pembuat Draf Lamaran Cepat & Auto-Kirim Terkonfirmasi
 * 
 * Aturan:
 * 1. Jika hanya ada WA -> Auto-set format WA, butuh klik tombol konfirmasi sebelum buka WhatsApp.
 * 2. Jika hanya ada Email -> Auto-set format Email, butuh klik tombol konfirmasi sebelum buka aplikasi Email.
 * 3. Jika ada WA & Email -> Tampilkan opsi pilihan tujuan, butuh klik konfirmasi.
 * 4. Jika kirim langsung/walk-in -> Berikan opsi buat PDF lamaran resmi, pelamar isi identitas, lalu unduh PDF untuk diprint.
 */
export default function SmartDraftModal({ isOpen, onClose, job }) {
  if (!isOpen || !job) return null;

  // Profil tersimpan dari localStorage jika pernah mendaftar/login
  const savedUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('karmadi_user') || localStorage.getItem('sicaker_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Form Identitas Pelamar
  const [applicantName, setApplicantName] = useState(savedUser?.nama || '');
  const [birthPlaceDate, setBirthPlaceDate] = useState('Madiun, 15 Mei 2002');
  const [education, setEducation] = useState('SMA / SMK Sederajat');
  const [applicantPhone, setApplicantPhone] = useState(savedUser?.identifier || '');
  const [applicantAddress, setApplicantAddress] = useState('Karesidenan Madiun');

  const cleanPhone = (job.kontak_wa || '').replace(/[^0-9]/g, '');
  const hasWa = Boolean(cleanPhone);
  const hasEmail = Boolean(job.email);
  const hasBoth = hasWa && hasEmail;
  const isWalkIn = Boolean(job.is_walk_in || (!hasWa && !hasEmail));

  // Tentukan mode awal otomatis: 'wa' | 'email' | 'pdf'
  const initialMode = useMemo(() => {
    if (isWalkIn) return 'pdf';
    if (hasWa) return 'wa';
    if (hasEmail) return 'email';
    return 'pdf';
  }, [isWalkIn, hasWa, hasEmail]);

  const [activeMode, setActiveMode] = useState(initialMode);
  const [copied, setCopied] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Sinkronisasi mode jika prop job berubah
  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  const companyName = job.nama_perusahaan || 'Perusahaan';
  const jobPosition = job.posisi || 'Posisi';
  const jobLocation = job.alamat_walk_in || job.lokasi || 'Kota Madiun';

  // 1. Template Pesan WhatsApp
  const waDraft = useMemo(() => {
    const name = applicantName.trim() || '[Nama Lengkap Anda]';
    const edu = education || '[Pendidikan]';
    const phone = applicantPhone.trim() || '[Nomor HP/WA]';

    return `Selamat pagi / siang HRD ${companyName},

Perkenalkan saya ${name}, lulusan ${edu}. Melalui pesan ini, saya bermaksud untuk melamar pekerjaan pada posisi ${jobPosition} yang diinformasikan pada portal lowongan kerja Karmadi.

Berikut ringkasan data diri saya:
• Nama: ${name}
• Pendidikan: ${edu}
• No. HP / WhatsApp: ${phone}
• Domisili: ${applicantAddress.trim() || 'Karesidenan Madiun'}

Saya memiliki dedikasi tinggi, siap bekerja profesional, dan berkomitmen memberikan kontribusi terbaik untuk ${companyName}. Berkas CV dan dokumen pendukung siap saya lampirkan.

Apakah lowongan untuk posisi ${jobPosition} ini masih menerima lamaran? Terima kasih banyak atas perhatian Bapak/Ibu HRD.

Salam hormat,
${name}`;
  }, [applicantName, education, applicantPhone, applicantAddress, companyName, jobPosition]);

  // 2. Template Email Lengkap
  const emailSubject = `Lamaran Pekerjaan — ${jobPosition} — ${applicantName.trim() || '[Nama Lengkap]'}`;
  const emailDraft = useMemo(() => {
    const name = applicantName.trim() || '[Nama Lengkap Anda]';
    const edu = education || '[Pendidikan Terakhir]';
    const phone = applicantPhone.trim() || '[Nomor Telepon]';
    const addr = applicantAddress.trim() || 'Karesidenan Madiun';

    return `Hal: Lamaran Pekerjaan — ${jobPosition}
Lampiran: Curriculum Vitae (CV) & Berkas Pendukung

Kepada Yth.
Tim Rekrutmen / HRD ${companyName}
di Tempat

Dengan hormat,

Sehubungan dengan informasi lowongan pekerjaan yang saya peroleh mengenai posisi ${jobPosition} di ${companyName}, melalui surat elektronik ini saya bermaksud untuk mengajukan diri guna mengisi posisi tersebut.

Berikut adalah ringkasan kualifikasi saya:
- Nama Lengkap       : ${name}
- Pendidikan Terakhir: ${edu}
- Nomor Telepon / WA : ${phone}
- Alamat Domisili    : ${addr}

Saya merupakan pribadi yang jujur, bertanggung jawab, memiliki kemauan belajar yang tinggi, serta siap bekerja secara mandiri maupun dalam tim dengan target yang ditentukan.

Sebagai bahan pertimbangan Bapak/Ibu, bersama surat ini saya lampirkan:
1. Curriculum Vitae (CV) Terbaru
2. Salinan Ijazah dan Transkrip Nilai
3. Salinan Kartu Tanda Penduduk (KTP)
4. Dokumen dan Portofolio Pendukung

Besar harapan saya untuk diberikan kesempatan mengikuti tahapan wawancara agar dapat menjelaskan kualifikasi diri saya secara lebih rinci. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.

Hormat saya,


${name}`;
  }, [applicantName, education, applicantPhone, applicantAddress, companyName, jobPosition]);

  // 3. Template Teks Surat Lamaran Fisik (Untuk Cetak / PDF)
  const physicalDraft = useMemo(() => {
    const name = applicantName.trim() || '[Nama Lengkap Anda]';
    const birth = birthPlaceDate.trim() || '[Tempat, Tanggal Lahir]';
    const edu = education || '[Pendidikan Terakhir]';
    const phone = applicantPhone.trim() || '[Nomor Telepon]';
    const addr = applicantAddress.trim() || 'Karesidenan Madiun';
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `Madiun, ${today}

Hal       : Lamaran Pekerjaan — ${jobPosition}
Lampiran  : 1 (Satu) Berkas

Kepada Yth.
Pimpinan / HRD ${companyName}
${jobLocation}

Dengan hormat,

Berdasarkan informasi lowongan pekerjaan yang saya peroleh mengenai posisi ${jobPosition} di ${companyName}, melalui surat ini saya bermaksud mengajukan permohonan lamaran pekerjaan untuk posisi tersebut.

Berikut adalah data pribadi singkat saya:
Nama Lengkap        : ${name}
Tempat, Tgl Lahir   : ${birth}
Pendidikan Terakhir : ${edu}
Nomor HP / WhatsApp : ${phone}
Alamat Domisili     : ${addr}

Saya dalam kondisi sehat jasmani dan rohani, berdisiplin tinggi, serta siap bekerja secara profesional untuk memberikan kontribusi terbaik bagi kemajuan ${companyName}.

Sebagai kelengkapan berkas fisik lamaran, bersama surat ini saya lampirkan:
1. Curriculum Vitae (CV) Terbaru
2. Salinan Ijazah dan Transkrip Nilai
3. Salinan Kartu Tanda Penduduk (KTP)
4. Pas Foto Terbaru
5. Dokumen Sertifikat Pendukung Lainnya

Demikian surat lamaran pekerjaan ini saya sampaikan. Besar harapan saya untuk dapat diterima bergabung di ${companyName}. Atas perhatian dan kebijaksanaan Bapak/Ibu, saya ucapkan terima kasih.

Hormat saya,


( ${name} )`;
  }, [applicantName, birthPlaceDate, education, applicantPhone, applicantAddress, companyName, jobPosition, jobLocation]);

  const activeContent = activeMode === 'wa' ? waDraft : activeMode === 'email' ? emailDraft : physicalDraft;

  // Handler Salin Teks
  const handleCopy = () => {
    navigator.clipboard?.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handler Konfirmasi Kirim WhatsApp
  const handleConfirmSendWa = () => {
    if (!cleanPhone) return;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waDraft)}`;
    window.open(url, '_blank');
  };

  // Handler Konfirmasi Kirim Email
  const handleConfirmSendEmail = () => {
    if (!job.email) return;
    const url = `mailto:${job.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailDraft)}`;
    window.location.href = url;
  };

  // Handler Unduh PDF Resmi
  const handleDownloadPdf = () => {
    try {
      generateCoverLetterPdf({
        applicantName,
        birthPlaceDate,
        education,
        applicantPhone,
        applicantAddress,
        jobPosition,
        companyName,
        jobLocation
      });
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Gagal generate PDF:', err);
      alert('Terjadi kendala saat menghasilkan PDF. Anda dapat menggunakan opsi Salin Teks atau Print.');
    }
  };

  // Handler Print Langsung
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Surat Lamaran - ${jobPosition} - ${applicantName || 'Karmadi'}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; padding: 40px; color: #000; }
            pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
          </style>
        </head>
        <body>
          <pre>${physicalDraft}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar - Fixed shrink-0 */}
        <div className="bg-[#2B4CE0] px-4 py-3 sm:px-6 sm:py-4 text-white flex items-center justify-between shrink-0 border-b-2 border-[#A3F742]/40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight truncate">
                Draf Lamaran Cepat & Auto-Kirim
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100 font-medium truncate">
                {jobPosition} • <span className="text-white font-bold">{companyName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer text-white shrink-0"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body - Seluruh isi modal discroll dengan mulus */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3.5">
          {/* Banner Panduan Otomatis Berdasarkan Tipe Loker */}
          <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl sm:rounded-2xl text-xs text-blue-900 leading-relaxed">
            {isWalkIn ? (
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900">Lamaran Datang Langsung / Walk-In:</span> Masukkan identitas Anda di bawah untuk mengunduh <strong>file PDF Surat Lamaran Resmi</strong> yang siap Anda print dan bawa ke alamat: <strong>{jobLocation}</strong>.
                </div>
              </div>
            ) : hasBoth ? (
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Perusahaan ini menerima lamaran via <strong>WhatsApp</strong> dan <strong>Email</strong>. Silakan pilih saluran tujuan di bawah sebelum konfirmasi kirim.
                </span>
              </div>
            ) : hasWa ? (
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Lamaran otomatis diarahkan ke <strong>WhatsApp HRD (+{cleanPhone})</strong>. Tinjau draf pesan, lalu klik konfirmasi kirim di bawah.
                </span>
              </div>
            ) : hasEmail ? (
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Lamaran otomatis diarahkan ke <strong>Email HRD ({job.email})</strong>. Tinjau draf surat, lalu klik konfirmasi kirim di bawah.
                </span>
              </div>
            ) : null}
          </div>

          {/* Tab Pemilihan Saluran Tujuan */}
          <div className="bg-slate-50/90 p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Tujuan Pengiriman:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {/* Opsi WhatsApp */}
              {hasWa && (
                <button
                  type="button"
                  onClick={() => { setActiveMode('wa'); setCopied(false); }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMode === 'wa'
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Kirim WhatsApp (+{cleanPhone})</span>
                </button>
              )}

              {/* Opsi Email */}
              {hasEmail && (
                <button
                  type="button"
                  onClick={() => { setActiveMode('email'); setCopied(false); }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMode === 'email'
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Kirim Email ({job.email})</span>
                </button>
              )}

              {/* Opsi Unduh PDF / Cetak Fisik */}
              <button
                type="button"
                onClick={() => { setActiveMode('pdf'); setCopied(false); }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeMode === 'pdf'
                    ? 'bg-slate-800 text-white shadow-sm ring-2 ring-slate-800/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Unduh PDF (Siap Print)</span>
              </button>
            </div>
          </div>

          {/* Form Identitas Pelamar */}
          <div className="bg-slate-50/70 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Identitas Pelamar
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Otomatis disisipkan ke draf
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Pendidikan Terakhir
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="SMA / SMK Sederajat">SMA / SMK Sederajat</option>
                  <option value="D3 (Diploma Tiga)">D3 (Diploma Tiga)</option>
                  <option value="S1 (Sarjana)">S1 (Sarjana)</option>
                  <option value="SMP">SMP</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Nomor Telepon / WA
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Input Tambahan Khusus Mode Cetak PDF */}
              {activeMode === 'pdf' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      Tempat, Tanggal Lahir
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Madiun, 15 Mei 2002"
                      value={birthPlaceDate}
                      onChange={(e) => setBirthPlaceDate(e.target.value)}
                      className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      Alamat Domisili KTP
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Jl. Pahlawan No. 45, Kartoharjo, Kota Madiun"
                      value={applicantAddress}
                      onChange={(e) => setApplicantAddress(e.target.value)}
                      className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Area Pratinjau Teks Draf Lamaran */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Pratinjau Draf Pesan
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                Siap disalin & dikirim
              </span>
            </div>

            {activeMode === 'email' && (
              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs">
                <span className="font-bold text-blue-900">Subjek Email: </span>
                <span className="font-mono text-blue-800 font-semibold select-all">{emailSubject}</span>
              </div>
            )}

            {activeMode === 'pdf' && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-amber-900 font-medium">
                  <Printer className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Format Surat Lamaran Cetak Resmi (Standar Kertas A4)</span>
                </div>
                <span className="text-[11px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                  Siap Diunduh & Diprint
                </span>
              </div>
            )}

            <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200 font-sans text-xs sm:text-[13px] leading-relaxed text-slate-800 whitespace-pre-wrap select-text">
              {activeContent}
            </div>
          </div>
        </div>

        {/* Footer Konfirmasi Aksi - Sticky at bottom */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 shadow-sm">
          {/* Tombol Salin Teks & Print (Mode PDF) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Teks'}</span>
            </button>

            {activeMode === 'pdf' && (
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            )}
          </div>

          {/* Tombol Konfirmasi Utama Berdasarkan Mode Terpilih */}
          <div className="flex items-center gap-2">
            {/* Mode 1: WhatsApp */}
            {activeMode === 'wa' && hasWa && (
              <button
                type="button"
                onClick={handleConfirmSendWa}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Buka WhatsApp (+{cleanPhone})</span>
              </button>
            )}

            {/* Mode 2: Email */}
            {activeMode === 'email' && hasEmail && (
              <button
                type="button"
                onClick={handleConfirmSendEmail}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Buka Email ({job.email})</span>
              </button>
            )}

            {/* Mode 3: Unduh PDF */}
            {activeMode === 'pdf' && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-900/25 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{pdfDownloaded ? '✓ Berhasil Diunduh!' : 'Unduh File PDF Lamaran'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
