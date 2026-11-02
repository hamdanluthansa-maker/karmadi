import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  Bot, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  Send, 
  AlertCircle, 
  Image as ImageIcon, 
  Eye, 
  Palette, 
  Building, 
  Briefcase, 
  Phone, 
  ListChecks,
  Check,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Key,
  Cpu,
  Zap,
  ExternalLink,
  Globe,
  MapPin,
  Clock,
  Calendar,
  Hourglass,
  Building2,
  Trash2,
  Mail,
  Share2,
  Copy
} from 'lucide-react';
import JobCard from './JobCard';
import { useJobs } from '../context/JobContext';
import { extractJobsFromImage, extractJobsFromMultipleImages } from '../services/aiExtractorService';
import { extractJobFromRawText } from '../services/textJobParser';
import { formatBatchJobsTeaserText, formatJobTeaserShareText } from '../utils/shareUtils';
import { getTodayDateString, addMonths, addDays, formatDateIndo } from '../utils/dateUtils';
import { 
  getGeminiApiKey, 
  setGeminiApiKey, 
  testGeminiApiKey,
  getActiveGeminiModel,
  setActiveGeminiModel,
  syncAiConfigFromLocalServer,
  POPULAR_GEMINI_MODELS
} from '../services/geminiService';

export default function AdminExtractor() {
  const { publishJobs } = useJobs();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('AI sedang mengekstrak data...');
  const [extractedJobs, setExtractedJobs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'json'
  const [notification, setNotification] = useState(null);
  const [lastPublishedJobs, setLastPublishedJobs] = useState([]);
  const [isCopiedWaText, setIsCopiedWaText] = useState(false);

  // Link Saluran Resmi WhatsApp Karmadi
  const KARMADI_WA_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb93m90F6sn4i0hag42j';

  /**
   * Helper format teks teaser viral & menarik untuk disiarkan ke Saluran WhatsApp
   * Mendorong audiens mengunjungi web portal Karmadi tanpa kontak mentah di chat
   */
  const formatJobsForWaChannel = (jobs) => {
    return formatBatchJobsTeaserText(jobs);
  };

  const handleShareToWaChannel = (jobsToShare = lastPublishedJobs) => {
    const list = jobsToShare && jobsToShare.length > 0 ? jobsToShare : (extractedJobs.length > 0 ? extractedJobs : [manualJob]);
    const text = formatJobsForWaChannel(list);
    if (!text) return;

    // Salin teks teaser ke clipboard agar admin bisa langsung paste di saluran
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopiedWaText(true);
        setTimeout(() => setIsCopiedWaText(false), 4000);
      }).catch(() => {});
    }

    // Buka Saluran WhatsApp di tab baru
    window.open(KARMADI_WA_CHANNEL_URL, '_blank', 'noopener,noreferrer');
    showToast('Teks teaser loker tersalin ke clipboard! Membuka Saluran WhatsApp...', 'success');
  };

  // Gemini API Key & Model State
  const [activeApiKey, setActiveApiKey] = useState('');
  const [activeModel, setActiveModel] = useState('gemini-3.8-flash');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('gemini-3.8-flash');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState(null);

  useEffect(() => {
    const initAiConfig = async () => {
      let key = getGeminiApiKey();
      let m = getActiveGeminiModel();
      if (!key) {
        const synced = await syncAiConfigFromLocalServer();
        if (synced?.apiKey) {
          key = synced.apiKey;
          m = synced.activeModel || getActiveGeminiModel();
        }
      } else {
        setGeminiApiKey(key);
        setActiveGeminiModel(m);
      }
      setActiveApiKey(key);
      setInputKey(key);
      setActiveModel(m);
      setSelectedModel(m);
      setCustomModelName(m || 'gemini-3.8-flash');
      if (!POPULAR_GEMINI_MODELS.some(item => item.id === m)) {
        setIsCustomModel(true);
      }
    };
    initAiConfig();
  }, []);

  const fileInputRef = useRef(null);

  // ── Preset Warna Tema Loker Mandiri ──
  const COLOR_PRESETS = [
    { label: 'Royal Blue', hex: '#2B4CE0' },
    { label: 'Emerald',    hex: '#059669' },
    { label: 'Navy Slate', hex: '#1E293B' },
    { label: 'Violet',     hex: '#7C3AED' },
    { label: 'Rose Red',   hex: '#E11D48' },
    { label: 'Amber Gold', hex: '#D97706' },
    { label: 'Teal Modern',hex: '#0D9488' },
  ];

  // ── State Formulir Loker Mandiri (Tanpa Poster) ──
  const initialManualJob = {
    nama_perusahaan: '',
    logo_url: '',
    posisi: '',
    kategori: 'Admin',
    tipe: 'Full Time',
    wilayah: 'Kota Madiun',
    lokasi: 'Kota Madiun',
    syarat: '',
    benefit: '',
    catatan: '',
    kontak_wa: '',
    email: '',
    link_pendaftaran: '',
    is_walk_in: false,
    alamat_walk_in: '',
    warna_primer: '#2B4CE0',
    is_urgent: false,
    tanggal_mulai: getTodayDateString(),
    tanggal_selesai: addMonths(getTodayDateString(), 1),
  };

  const [manualJob, setManualJob] = useState(initialManualJob);
  const [activePreviewMode, setActivePreviewMode] = useState('auto'); // 'auto' | 'manual'
  const [showManualForm, setShowManualForm] = useState(true);
  const logoInputRef = useRef(null);

  const handleManualJobChange = (field, value) => {
    setManualJob((prev) => ({ ...prev, [field]: value }));
    setActivePreviewMode('manual');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran logo maksimal 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleManualJobChange('logo_url', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleManualJobChange('logo_url', '');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleResetManualJob = () => {
    setManualJob(initialManualJob);
    if (logoInputRef.current) logoInputRef.current.value = '';
    setActivePreviewMode('auto');
  };

  const handlePublishManualJob = () => {
    if (!manualJob.nama_perusahaan.trim()) {
      showToast('Harap isi Nama Perusahaan terlebih dahulu!', 'error');
      return;
    }
    if (!manualJob.posisi.trim()) {
      showToast('Harap isi Posisi Jabatan yang dibutuhkan!', 'error');
      return;
    }

    const start = manualJob.tanggal_mulai || getTodayDateString();
    const end = manualJob.tanggal_selesai || addMonths(start, 1);
    const syaratList = manualJob.syarat
      ? manualJob.syarat.split('\n').map((s) => s.trim()).filter(Boolean)
      : ['Kualifikasi dapat dikonfirmasi langsung ke pihak HRD.'];
    const benefitList = manualJob.benefit
      ? (typeof manualJob.benefit === 'string'
          ? manualJob.benefit.split('\n').map((b) => b.trim()).filter(Boolean)
          : manualJob.benefit)
      : [];

    const jobToSave = {
      ...manualJob,
      id: Date.now(),
      syarat: syaratList,
      benefit: benefitList,
      catatan: manualJob.catatan || '',
      poster_url: '', // Loker mandiri tanpa gambar poster, memicu kartu tipografi teks
      is_manual: true,
      tanggal_mulai: start,
      tanggal_selesai: end,
      tanggal: start,
    };

    publishJobs([jobToSave]);
    setLastPublishedJobs([jobToSave]);
    setIsPublished(true);
    showToast(`Lowongan "${manualJob.posisi}" berhasil diterbitkan ke Beranda!`, 'success');
    handleResetManualJob();
  };

  // ── State & Handler Otomasi Tempel / Copas Teks Loker ──
  const [rawJobText, setRawJobText] = useState('');
  const [isParsingText, setIsParsingText] = useState(false);

  const handleExtractFromText = async () => {
    if (!rawJobText.trim()) {
      showToast('Harap tempel teks lowongan terlebih dahulu!', 'error');
      return;
    }
    setIsParsingText(true);
    try {
      const parsed = await extractJobFromRawText(rawJobText);
      setManualJob(parsed);
      setActivePreviewMode('manual');
      showToast(`AI berhasil membedah loker: "${parsed.posisi}"! Silakan cek Live Preview di sebelah kanan.`, 'success');
    } catch (err) {
      console.error('Gagal ekstrak teks loker:', err);
      showToast('Terjadi kendala saat membedah teks. Silakan periksa kembali ketikan teks Anda.', 'error');
    } finally {
      setIsParsingText(false);
    }
  };

  const handleLoadSampleText = () => {
    const sample = `Dibutuhkan tenaga packing online shop pocokan/freelance.
Syarat:
- laki-laki/perempuan
- tekun, rajin, dan niat kerja
- wajib TIDAK merokok
- SIAP lembur
- punya pengalaman packing lebih disukai, jika tidak punya pengalaman, akan diajari.
Keterangan:
- dalam 1 minggu mungkin hanya dipanggil 2-3 hari (atau jika packingan lagi banyak)
- Jam kerja: 09:00 - 17:00 (istirahat siang satu jam)
- Gaji 145rb per hari
- ada uang lembur dan makan (jika lembur)
- tidak ada mess.
Selama iklan masih ada, berarti lowongan masih dibuka.
Lamaran beserta data diri dan CV dikirim lewat WA ke nomor :
+62 823-3143-3496`;
    setRawJobText(sample);
  };

  const currentJob = extractedJobs[selectedIndex] || null;

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  /**
   * Memproses satu atau banyak file sekaligus
   */
  const handleProcessFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    // Filter hanya file gambar
    const validImages = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      showToast('Harap unggah file dengan format gambar (JPG, PNG, atau WEBP)', 'error');
      return;
    }

    setUploadedFiles(validImages);
    setIsLoading(true);
    setExtractedJobs([]);
    setIsPublished(false);
    setSelectedIndex(0);

    try {
      if (validImages.length === 1) {
        setLoadingText('AI sedang membaca dan membedah posisi dalam poster...');
        const jobs = await extractJobsFromImage(validImages[0], (msg) => setLoadingText(msg));
        setExtractedJobs(jobs);

        if (jobs.length > 1) {
          showToast(`Luar biasa! Terdeteksi ${jobs.length} posisi sekaligus dalam 1 gambar: ${jobs.map(j => j.posisi).join(' & ')}!`);
        } else {
          showToast(`Data "${jobs[0]?.posisi}" berhasil diekstrak!`);
        }
      } else {
        setLoadingText(`AI sedang memproses ${validImages.length} poster secara batch...`);
        const jobs = await extractJobsFromMultipleImages(validImages, (msg) => setLoadingText(msg));
        setExtractedJobs(jobs);
        showToast(`Berhasil mengekstrak ${jobs.length} lowongan dari ${validImages.length} poster!`);
      }
    } catch (err) {
      console.error('Error saat ekstraksi batch AI:', err);
      showToast(`Gagal memproses gambar: ${err.message || 'Format gambar tidak terbaca'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  /**
   * Reset formulir
   */
  const handleReset = () => {
    setUploadedFiles([]);
    setExtractedJobs([]);
    setSelectedIndex(0);
    setIsLoading(false);
    setIsPublished(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Edit data field pada lowongan yang sedang aktif dipilih
   */
  const handleUpdateCurrentJobField = (field, value) => {
    setExtractedJobs((prev) => {
      const copy = [...prev];
      copy[selectedIndex] = {
        ...copy[selectedIndex],
        [field]: value,
      };
      return copy;
    });
  };

  /**
   * Aksi Publikasi Loker
   */
  const handlePublishAll = () => {
    if (extractedJobs.length === 0 || isLoading) return;
    publishJobs(extractedJobs);
    setLastPublishedJobs([...extractedJobs]);
    setIsPublished(true);
    showToast(`Sukses! ${extractedJobs.length} loker berhasil diterbitkan ke portal pencari kerja!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm animate-bounce ${
          notification.type === 'error' 
            ? 'bg-rose-50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          )}
          <span className="font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Info Dashboard Admin */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-800">
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Multi-Poster & Multi-Job Engine</span>
            </div>

            {/* AI Engine Status & Gemini Key Switcher */}
            <button
              type="button"
              onClick={() => {
                setInputKey(activeApiKey);
                setKeyTestStatus(null);
                setIsKeyModalOpen(true);
              }}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                activeApiKey
                  ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Klik untuk memilih versi Google Gemini Multimodal Vision AI Key"
            >
              {activeApiKey ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Google Gemini: {activeModel} (100% Akurat)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <Zap className="w-3.5 h-3.5 text-slate-600" />
                  <span>Engine: OCR Lokal</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-semibold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Aktifkan Gemini 2.5 Terbaru
                  </span>
                </>
              )}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Ekstraksi Otomatis Lowongan Kerja (Batch & Multi-Loker)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Unggah satu atau <strong>banyak poster sekaligus</strong>. AI otomatis membaca teks, logo, kontak, dan memecah <strong>multi-posisi dalam 1 gambar</strong>.
          </p>
        </div>
      </div>

      {/* DUA KOLOM: Kolom Kiri (Upload) & Kolom Kanan (Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* KOLOM KIRI: Area Drag and Drop Upload Poster              */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            {/* ── Form Upload File Gambar ── */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                Upload Zone (Mendukung Banyak File)
              </h3>
              {uploadedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset / Ganti File
                </button>
              )}
            </div>

            {/* Hidden Input File dengan multiple */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                      : uploadedFiles.length > 0
                      ? 'border-emerald-300 bg-slate-50/60 hover:bg-slate-50'
                      : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/70 hover:border-emerald-400'
                  }`}
                >
                  {uploadedFiles.length > 0 ? (
                    <div className="w-full flex flex-col items-center gap-3">
                      <div className="flex flex-wrap items-center justify-center gap-2 max-h-40 overflow-y-auto p-2">
                        {uploadedFiles.map((f, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 bg-white p-2 shadow-xs flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">{f.name}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {uploadedFiles.length} file dipilih • Klik atau seret untuk menambah/ganti file
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">
                        Tarik & lepaskan satu atau BANYAK gambar poster di sini
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        atau <span className="text-emerald-600 font-bold underline decoration-emerald-400">Pilih File dari Komputer</span>
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
                        <span className="flex items-center gap-1 font-bold text-emerald-700">
                          <Layers className="w-3.5 h-3.5" /> Batch Upload
                        </span>
                        <span>•</span>
                        <span>Multi-posisi 1 poster otomatis dipisah</span>
                      </div>
                    </>
                  )}
                </div>

            {/* Status Indikator Ekstraksi */}
            <div className="mt-4">
              {isLoading ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-spin">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-amber-950 truncate">
                        {loadingText}
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Memindai teks entitas, kontak WA, logo perusahaan, dan kualifikasi.
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress Bar Dinamis */}
                  <div className="w-full bg-amber-200/70 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out animate-pulse"
                      style={{
                        width: (() => {
                          const m = loadingText.match(/\[(\d+)\/(\d+)/);
                          if (m) {
                            return `${Math.max(15, Math.round((parseInt(m[1], 10) / parseInt(m[2], 10)) * 100))}%`;
                          }
                          return '65%';
                        })()
                      }}
                    />
                  </div>
                </div>
              ) : extractedJobs.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">
                        {extractedJobs.length} Lowongan Berhasil Dikenali!
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        {extractedJobs.map((j) => j.posisi).join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                  <Bot className="w-4 h-4 text-slate-400" />
                  <span>Siap membedah informasi begitu gambar dimasukkan.</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* FORMULIR BUAT LOKER SENDIRI (TANPA POSTER GAMBAR)         */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2B4CE0] flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight truncate">
                    Buat Loker Sendiri
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Format tipografi tanpa poster gambar • Posisi otomatis tampil besar
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#2B4CE0] bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full shrink-0">
                Mandiri
              </span>
            </div>

            {/* ── Kotak Otomasi Tempel / Copas Teks Loker ── */}
            <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-purple-50/80 p-4 rounded-2xl border border-indigo-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2B4CE0] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-[#A3F742]" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      Kolom Otomasi Tempel Teks Loker
                    </h5>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                      Punya ketikan dari WhatsApp / Facebook? Tempel di sini, AI otomatis membedah & mengisi form!
                    </p>
                  </div>
                </div>
              </div>

              <textarea
                rows={4}
                placeholder="Tempel / Paste ketikan loker Anda di sini... (Contoh: Dibutuhkan tenaga packing online shop pocokan/freelance. Syarat: ... WA: 08123456789)"
                value={rawJobText}
                onChange={(e) => setRawJobText(e.target.value)}
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#2B4CE0] outline-none font-sans leading-relaxed shadow-2xs"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                <button
                  type="button"
                  onClick={handleLoadSampleText}
                  className="text-[11px] font-bold text-[#2B4CE0] hover:text-blue-800 hover:underline cursor-pointer"
                >
                  ⚡ Coba Contoh Teks (Tenaga Packing Freelance)
                </button>

                <button
                  type="button"
                  onClick={handleExtractFromText}
                  disabled={!rawJobText.trim() || isParsingText}
                  className="px-4 py-2 rounded-xl bg-[#2B4CE0] hover:bg-[#203db8] text-white text-xs font-bold shadow-md shadow-[#2B4CE0]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {isParsingText ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-[#A3F742]" />
                      <span>Sedang Membedah Teks...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#A3F742]" />
                      <span>Bedah Teks Otomatis (AI)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Atau Lengkapi / Periksa Kolom di Bawah
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Nama Perusahaan & Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">
                    Nama Perusahaan *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Sumber Pangan Madiun"
                    value={manualJob.nama_perusahaan}
                    onChange={(e) => handleManualJobChange('nama_perusahaan', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-[#2B4CE0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    Logo (Opsional)
                  </label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {manualJob.logo_url ? (
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={manualJob.logo_url}
                        alt="Logo"
                        className="w-6 h-6 object-contain rounded bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-600 font-bold flex-1 truncate">
                        Logo Terpasang
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Hapus Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current && logoInputRef.current.click()}
                      className="w-full px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-[#2B4CE0] bg-slate-50 hover:bg-blue-50/50 text-slate-500 font-medium text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#2B4CE0]" />
                      <span>Upload Logo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Posisi Jabatan */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Posisi yang Dibutuhkan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Staff Administrasi & Keuangan"
                  value={manualJob.posisi}
                  onChange={(e) => handleManualJobChange('posisi', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-[#2B4CE0] outline-none"
                />
              </div>

              {/* Kategori & Tipe Pekerjaan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Kategori Loker
                  </label>
                  <select
                    value={manualJob.kategori}
                    onChange={(e) => handleManualJobChange('kategori', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:ring-2 focus:ring-[#2B4CE0] bg-white cursor-pointer"
                  >
                    <option value="Admin">Admin / Kantor</option>
                    <option value="Sales">Sales / Marketing</option>
                    <option value="Kasir">Kasir / Retail</option>
                    <option value="Gudang">Gudang / Logistik</option>
                    <option value="F&B">F&B / Kuliner</option>
                    <option value="Teknik">Teknik / Otomotif</option>
                    <option value="IT">IT / Komputer</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Desain">Desain / Kreatif</option>
                    <option value="Umum">Umum / Kebersihan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Tipe Pekerjaan *
                  </label>
                  <select
                    value={manualJob.tipe}
                    onChange={(e) => handleManualJobChange('tipe', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#2B4CE0] bg-white cursor-pointer"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Magang">Magang / Internship</option>
                    <option value="Kontrak">Kontrak</option>
                  </select>
                </div>
              </div>

              {/* Wilayah & Detail Lokasi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Wilayah Karesidenan Madiun
                  </label>
                  <select
                    value={manualJob.wilayah}
                    onChange={(e) => handleManualJobChange('wilayah', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:ring-2 focus:ring-[#2B4CE0] bg-white cursor-pointer"
                  >
                    <option value="Kota Madiun">Kota Madiun</option>
                    <option value="Kab Madiun">Kab. Madiun (Caruban)</option>
                    <option value="Magetan">Kab. Magetan</option>
                    <option value="Ngawi">Kab. Ngawi</option>
                    <option value="Ponorogo">Kab. Ponorogo</option>
                    <option value="Pacitan">Kab. Pacitan</option>
                    <option value="Luar Kota Lain">Luar Karesidenan Madiun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    Detail Alamat / Lokasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Pahlawan No. 45, Kartoharjo"
                    value={manualJob.lokasi}
                    onChange={(e) => handleManualJobChange('lokasi', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-[#2B4CE0] outline-none"
                  />
                </div>
              </div>

              {/* Kualifikasi & Persyaratan */}
              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-slate-500" />
                    Kualifikasi & Persyaratan
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Tulis 1 baris per poin</span>
                </label>
                <textarea
                  rows={4}
                  placeholder={`1. Pria / Wanita usia maksimal 28 tahun\n2. Pendidikan minimal SMA / SMK Sederajat\n3. Mampu mengoperasikan MS Excel & Word\n4. Komunikatif, teliti, dan disiplin`}
                  value={manualJob.syarat}
                  onChange={(e) => handleManualJobChange('syarat', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-[#2B4CE0] outline-none leading-relaxed"
                />
              </div>

              {/* Benefit & Fasilitas */}
              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Benefit & Fasilitas (Gaji, Bonus, Lembur, Makan, Mess, dll.)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Tulis 1 baris per poin</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={`- Gaji Rp 145.000 / hari\n- Ada uang makan & lembur jika lembur\n- Bonus performa bulanan\n- Bebas mess`}
                  value={manualJob.benefit || ''}
                  onChange={(e) => handleManualJobChange('benefit', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/20 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed text-xs"
                />
              </div>

              {/* Catatan & Ketentuan Lain */}
              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Catatan & Ketentuan Lain (Jam Kerja, Sistem Masuk, Training, dll.)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Detail ketentuan</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={`- Jam kerja: 09:00 - 17:00 (istirahat siang satu jam)\n- Masuk 2-3 hari per minggu saat packingan ramai\n- Selama iklan masih ada, loker tetap dibuka`}
                  value={manualJob.catatan || ''}
                  onChange={(e) => handleManualJobChange('catatan', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/20 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed text-xs"
                />
              </div>

              {/* Saluran Kontak & Pendaftaran */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Saluran Lamaran:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" /> WhatsApp HRD
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 081234567890"
                      value={manualJob.kontak_wa}
                      onChange={(e) => handleManualJobChange('kontak_wa', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-600" /> Email Rekrutmen
                    </label>
                    <input
                      type="email"
                      placeholder="Contoh: hrd@perusahaan.com"
                      value={manualJob.email}
                      onChange={(e) => handleManualJobChange('email', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#2B4CE0]" /> Link Formulir Pendaftaran Online (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="Contoh: https://forms.gle/xyz atau link karir perusahaan"
                    value={manualJob.link_pendaftaran}
                    onChange={(e) => handleManualJobChange('link_pendaftaran', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Masa Tayang Loker */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-[#2B4CE0]" />
                    Masa Tayang Loker
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Default 1 bulan otomatis
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Mulai Tayang</label>
                    <input
                      type="date"
                      value={manualJob.tanggal_mulai}
                      onChange={(e) => handleManualJobChange('tanggal_mulai', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Selesai / Kedaluwarsa</label>
                    <input
                      type="date"
                      value={manualJob.tanggal_selesai}
                      onChange={(e) => handleManualJobChange('tanggal_selesai', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Preset Cepat Durasi */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Preset:</span>
                  <button
                    type="button"
                    onClick={() => handleManualJobChange('tanggal_selesai', addDays(manualJob.tanggal_mulai || getTodayDateString(), 7))}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-white hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    +7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => handleManualJobChange('tanggal_selesai', addDays(manualJob.tanggal_mulai || getTodayDateString(), 14))}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-white hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    +14 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => handleManualJobChange('tanggal_selesai', addMonths(manualJob.tanggal_mulai || getTodayDateString(), 1))}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-white hover:bg-slate-200 border border-slate-200 cursor-pointer text-[#2B4CE0]"
                  >
                    +1 Bulan
                  </button>
                </div>
              </div>

              {/* Pilihan Warna Tema Kartu */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Palette className="w-3.5 h-3.5 text-[#2B4CE0]" />
                    <span>Pilihan Warna Tema Kartu:</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {manualJob.warna_primer}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleManualJobChange('warna_primer', c.hex)}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                        manualJob.warna_primer === c.hex
                          ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-sm'
                          : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {manualJob.warna_primer === c.hex && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />
                      )}
                    </button>
                  ))}

                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer shadow-2xs transition-colors">
                    <Palette className="w-3.5 h-3.5 text-slate-500" />
                    <span>Kustom</span>
                    <input
                      type="color"
                      value={manualJob.warna_primer}
                      onChange={(e) => handleManualJobChange('warna_primer', e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Pengaturan Status URGENT */}
              <div className="p-3 bg-rose-50/90 border-2 border-rose-300 rounded-xl transition-all shadow-2xs">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(manualJob.is_urgent)}
                    onChange={(e) => handleManualJobChange('is_urgent', e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300 mt-0.5 cursor-pointer accent-rose-600"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                      <span>🔥 TANDAI LOKER INI SEBAGAI "URGENT" (SEGERA DIBUTUHKAN CEPAT)</span>
                    </span>
                    <p className="text-[11px] text-rose-700 leading-snug mt-0.5">
                      Menampilkan lencana merah menyala <strong>"URGENT / SEGERA DIBUTUHKAN"</strong> pada postingan loker di Beranda dan draf lamaran diprioritaskan.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetManualJob}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewMode('manual')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Pratinjau
                </button>
                <button
                  type="button"
                  onClick={handlePublishManualJob}
                  className="flex-1 py-2.5 rounded-xl bg-[#2B4CE0] hover:bg-[#203db8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#2B4CE0]/25 cursor-pointer active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publikasikan Loker Mandiri
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* KOLOM KANAN: Live Preview Kartu Loker                     */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            {/* Header Live Preview Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Live Preview Hasil Ekstraksi
                  </h3>
                  <p className="text-xs text-slate-400">
                    {extractedJobs.length > 0
                      ? `Terdeteksi ${extractedJobs.length} kartu lowongan siap diterbitkan`
                      : 'Tampilan yang akan dilihat pencari kerja di portal'}
                  </p>
                </div>
              </div>

              {/* Selector Kartu jika ada multi-loker */}
              {extractedJobs.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Pilih Loker:</span>
                  {extractedJobs.map((j, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      title={j.source_filename ? `Asal file: ${j.source_filename}` : undefined}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedIndex === idx
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>#{idx + 1} {j.posisi}</span>
                      {j.source_filename && (
                        <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                          selectedIndex === idx ? 'bg-emerald-700/60 text-emerald-100' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {j.source_filename.length > 12 ? j.source_filename.slice(0, 10) + '..' : j.source_filename}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Container Preview Kartu */}
            <div className="min-h-[460px] flex flex-col justify-center">
              {isLoading ? (
                <div className="border border-slate-200 rounded-2xl p-8 bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[420px]">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_15px_#10b981]" />
                  <div className="relative z-10 flex flex-col items-center space-y-4 max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center animate-bounce shadow-lg">
                      <Bot className="w-8 h-8" />
                    </div>
                    <div className="w-full">
                      <h4 className="text-base font-bold text-slate-800 break-words">
                        {loadingText}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Memindai teks, logo instansi, kontak WA, kualifikasi, dan memecah posisi pekerjaan.
                      </p>

                      {/* Bar Progres Live */}
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden shadow-inner">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out animate-pulse"
                          style={{
                            width: (() => {
                              const m = loadingText.match(/\[(\d+)\/(\d+)/);
                              if (m) {
                                return `${Math.max(15, Math.round((parseInt(m[1], 10) / parseInt(m[2], 10)) * 100))}%`;
                              }
                              return '65%';
                            })()
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : currentJob ? (
                <div className="space-y-4">
                  {extractedJobs.length > 1 && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Sedang melihat Loker #{selectedIndex + 1}: <strong>{currentJob.posisi}</strong>
                        {currentJob.source_filename && (
                          <span className="ml-1 text-[11px] font-normal text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            (Poster: {currentJob.source_filename})
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-amber-700 font-medium">
                        Total {extractedJobs.length} loker terdeteksi
                      </span>
                    </div>
                  )}

                  {/* Engine Source Badge */}
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium border bg-slate-50 border-slate-200">
                    <div className="flex items-center gap-2">
                      {currentJob.engine_used && currentJob.engine_used.includes('Gemini') ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                          <span className="text-purple-900 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            {currentJob.engine_used} (100% Akurat)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span className="text-slate-700">
                            Metode: <strong>{currentJob.engine_used || 'OCR Cerdas Lokal'}</strong>
                          </span>
                        </>
                      )}
                    </div>
                    {currentJob.source_filename && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {currentJob.source_filename}
                      </span>
                    )}
                  </div>

                  <JobCard
                    poster_url={currentJob.poster_url}
                    nama_perusahaan={currentJob.nama_perusahaan}
                    posisi={currentJob.posisi}
                    syarat={currentJob.syarat}
                    benefit={currentJob.benefit}
                    catatan={currentJob.catatan}
                    warna_primer={currentJob.warna_primer}
                    kontak_wa={currentJob.kontak_wa}
                    email={currentJob.email}
                    link_pendaftaran={currentJob.link_pendaftaran}
                    is_walk_in={currentJob.is_walk_in}
                    alamat_walk_in={currentJob.alamat_walk_in}
                    is_urgent={Boolean(currentJob.is_urgent)}
                  />
                </div>
              ) : (activePreviewMode === 'manual' || manualJob.posisi || manualJob.nama_perusahaan) ? (
                <div className="space-y-4">
                  {/* Manual Mode Header Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium border bg-blue-50/80 border-blue-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2B4CE0]" />
                      <span className="text-blue-950 font-bold">
                        Pratinjau Langsung Loker Mandiri (Format Tipografi)
                      </span>
                    </div>
                    {currentJob && (
                      <button
                        type="button"
                        onClick={() => setActivePreviewMode('auto')}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer"
                      >
                        Lihat Hasil AI Poster
                      </button>
                    )}
                  </div>

                  <JobCard
                    poster_url=""
                    nama_perusahaan={manualJob.nama_perusahaan || 'Nama Perusahaan Anda'}
                    posisi={manualJob.posisi || 'Posisi yang Dibutuhkan'}
                    syarat={manualJob.syarat ? manualJob.syarat.split('\n').filter(Boolean) : ['Kualifikasi dicantumkan di sini']}
                    benefit={manualJob.benefit ? (typeof manualJob.benefit === 'string' ? manualJob.benefit.split('\n').filter(Boolean) : manualJob.benefit) : []}
                    catatan={manualJob.catatan}
                    warna_primer={manualJob.warna_primer}
                    kontak_wa={manualJob.kontak_wa}
                    email={manualJob.email}
                    link_pendaftaran={manualJob.link_pendaftaran}
                    is_walk_in={manualJob.is_walk_in}
                    alamat_walk_in={manualJob.alamat_walk_in}
                    lokasi={manualJob.lokasi || manualJob.wilayah || 'Kota Madiun'}
                    tipe_pekerjaan={manualJob.tipe}
                    is_urgent={Boolean(manualJob.is_urgent)}
                  />

                  {/* Tombol Publikasikan Langsung dari Kolom Kanan */}
                  <button
                    type="button"
                    onClick={handlePublishManualJob}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#2B4CE0] hover:bg-[#203db8] text-white text-sm font-bold shadow-lg shadow-[#2B4CE0]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publikasikan Loker Mandiri Ini ke Beranda</span>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-50/50 min-h-[420px]">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                    <Eye className="w-8 h-8 stroke-1" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-base">
                    Belum Ada Loker Aktif
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Unggah poster di sebelah kiri untuk ekstrak otomatis, atau ketik langsung pada formulir <strong>Buat Loker Sendiri</strong> di bawah untuk pratinjau instan.
                  </p>
                </div>
              )}
            </div>

            {/* Success Banner if Published */}
            {isPublished && (
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg animate-fade-in space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">
                        {lastPublishedJobs.length || extractedJobs.length || 1} Lowongan Berhasil Diterbitkan!
                      </h5>
                      <p className="text-xs text-emerald-100">
                        Lowongan telah aktif di portal Beranda dan siap disiarkan ke Saluran WhatsApp.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
                  >
                    Unggah Baru
                  </button>
                </div>

                {/* ── TOMBOL SINKRONISASI / SIAR KE SALURAN WHATSAPP ── */}
                <div className="pt-2 border-t border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShareToWaChannel(lastPublishedJobs)}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer border border-white/30"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                    <span>📢 Siarkan Otomatis ke Saluran WhatsApp Karmadi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const text = formatJobsForWaChannel(lastPublishedJobs.length > 0 ? lastPublishedJobs : extractedJobs);
                      if (navigator?.clipboard?.writeText) {
                        navigator.clipboard.writeText(text).then(() => {
                          setIsCopiedWaText(true);
                          setTimeout(() => setIsCopiedWaText(false), 3000);
                          showToast('Teks pengumuman Saluran WA berhasil disalin!', 'success');
                        });
                      }
                    }}
                    className="py-3 px-3.5 rounded-xl bg-black/20 hover:bg-black/30 active:scale-98 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                    title="Salin Teks Format Saluran WhatsApp"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCopiedWaText ? 'Tersalin! ✓' : 'Salin Teks'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* AKSI FINAL: Tombol Publish Semua Loker                    */}
            {/* ========================================================= */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePublishAll}
                disabled={extractedJobs.length === 0 || isLoading || isPublished}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
                  extractedJobs.length === 0 || isLoading || isPublished
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/30 active:scale-[0.99] cursor-pointer'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>
                  {isPublished
                    ? 'Semua Loker Sudah Diterbitkan'
                    : isLoading
                    ? 'Sedang Memproses AI...'
                    : extractedJobs.length > 1
                    ? `Publish Semua Loker (${extractedJobs.length} Lowongan Sekaligus)`
                    : 'Publish Loker'}
                </span>
              </button>

              <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-slate-400">
                <span>
                  {extractedJobs.length === 0
                    ? '* Tombol Publish aktif setelah proses ekstraksi AI selesai'
                    : `✓ ${extractedJobs.length} data lowongan siap dikirim ke portal pencari kerja`}
                </span>
                <span className="font-medium text-slate-500">
                  Karmadi • Info Loker Karesidenan Madiun
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Form Editor untuk Lowongan yang Sedang Aktif Dipilih       */}
          {/* Diletakkan langsung di bawah tombol Publish Loker        */}
          {/* ========================================================= */}
          {currentJob && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Edit Hasil AI (Loker #{selectedIndex + 1} dari {extractedJobs.length})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Mengedit spesifikasi untuk lowongan <strong>"{currentJob.posisi}"</strong>
                  </p>
                </div>
                {extractedJobs.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={selectedIndex === 0}
                      onClick={() => setSelectedIndex(prev => prev - 1)}
                      className="p-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-1">
                      {selectedIndex + 1}/{extractedJobs.length}
                    </span>
                    <button
                      type="button"
                      disabled={selectedIndex === extractedJobs.length - 1}
                      onClick={() => setSelectedIndex(prev => prev + 1)}
                      className="p-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Posisi Jabatan *</label>
                  <input
                    type="text"
                    value={currentJob.posisi || ''}
                    onChange={(e) => handleUpdateCurrentJobField('posisi', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Perusahaan *</label>
                  <input
                    type="text"
                    value={currentJob.nama_perusahaan || ''}
                    onChange={(e) => handleUpdateCurrentJobField('nama_perusahaan', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      Kategori Pekerjaan
                    </label>
                    <select
                      value={currentJob.kategori || 'Umum'}
                      onChange={(e) => handleUpdateCurrentJobField('kategori', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-medium text-slate-800 text-xs focus:ring-2 focus:ring-[#2B4CE0] bg-white cursor-pointer"
                    >
                      <option value="Sales">Sales / Marketing</option>
                      <option value="Gudang">Gudang / Logistik</option>
                      <option value="Kasir">Kasir / Retail</option>
                      <option value="Admin">Admin / Kantor</option>
                      <option value="Teknik">Teknik / Otomotif</option>
                      <option value="Kesehatan">Kesehatan</option>
                      <option value="F&B">F&B / Kuliner</option>
                      <option value="IT">IT / Komputer</option>
                      <option value="Umum">Umum / Kebersihan</option>
                      <option value="Desain">Desain / Kreatif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Tipe Pekerjaan *
                    </label>
                    <select
                      value={currentJob.tipe || 'Full Time'}
                      onChange={(e) => handleUpdateCurrentJobField('tipe', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#2B4CE0] bg-white cursor-pointer"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Magang">Magang / Internship</option>
                      <option value="Kontrak">Kontrak</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Wilayah (Karesidenan Madiun) *
                    </label>
                    <select
                      value={currentJob.wilayah || 'Kota Madiun'}
                      onChange={(e) => handleUpdateCurrentJobField('wilayah', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#2B4CE0] bg-white cursor-pointer"
                    >
                      <option value="Kota Madiun">Kota Madiun</option>
                      <option value="Kab. Madiun">Kab. Madiun</option>
                      <option value="Magetan">Magetan</option>
                      <option value="Ngawi">Ngawi</option>
                      <option value="Ponorogo">Ponorogo</option>
                      <option value="Pacitan">Pacitan</option>
                      <option value="Luar Kota Lain">Luar Kota Lain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Detail Lokasi / Penempatan
                    </label>
                    <input
                      type="text"
                      value={currentJob.lokasi || ''}
                      onChange={(e) => handleUpdateCurrentJobField('lokasi', e.target.value)}
                      placeholder="Contoh: Suncity Mall, Kota Madiun"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#2B4CE0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-slate-400" />
                      Warna Primer (HEX)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentJob.warna_primer || '#16a34a'}
                        onChange={(e) => handleUpdateCurrentJobField('warna_primer', e.target.value)}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={currentJob.warna_primer || ''}
                        onChange={(e) => handleUpdateCurrentJobField('warna_primer', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      Kontak WhatsApp
                    </label>
                    <input
                      type="text"
                      value={currentJob.kontak_wa || ''}
                      onChange={(e) => handleUpdateCurrentJobField('kontak_wa', e.target.value)}
                      placeholder="6281234567890"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Email Rekrutmen</label>
                  <input
                    type="email"
                    value={currentJob.email || ''}
                    onChange={(e) => handleUpdateCurrentJobField('email', e.target.value)}
                    placeholder="hrd@perusahaan.co.id"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Link Pendaftaran / Formulir Online (bit.ly / Google Form / Web)
                  </label>
                  <input
                    type="url"
                    value={currentJob.link_pendaftaran || ''}
                    onChange={(e) => handleUpdateCurrentJobField('link_pendaftaran', e.target.value)}
                    placeholder="https://bit.ly/... atau https://forms.gle/..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Pengaturan Walk-In / Datang Langsung */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(currentJob.is_walk_in)}
                      onChange={(e) => handleUpdateCurrentJobField('is_walk_in', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-amber-900">
                      Lamaran Wajib Datang Langsung / Walk-In Interview / Kirim Berkas Fisik
                    </span>
                  </label>

                  {currentJob.is_walk_in && (
                    <div>
                      <label className="block text-[11px] font-bold text-amber-800 mb-1">
                        Alamat Tujuan Penyerahan Berkas / Walk-In:
                      </label>
                      <input
                        type="text"
                        value={currentJob.alamat_walk_in || ''}
                        onChange={(e) => handleUpdateCurrentJobField('alamat_walk_in', e.target.value)}
                        placeholder="Contoh: Bakeshop Bakery, Jl. H.A. Salim 128, Madiun"
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Masa Tenggat Tayang Lowongan (Auto-Expire) */}
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#2B4CE0]" />
                      Jadwal Masa Tayang Loker
                    </span>
                    <span className="text-[10px] font-bold text-[#2B4CE0] bg-blue-100/80 px-2 py-0.5 rounded-full">
                      Maks 1 Bulan (Auto-Hapus)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Mulai Tayang:
                      </label>
                      <input
                        type="date"
                        value={currentJob.tanggal_mulai || getTodayDateString()}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          handleUpdateCurrentJobField('tanggal_mulai', newStart);
                          if (!currentJob.tanggal_selesai || currentJob.tanggal_selesai < newStart) {
                            handleUpdateCurrentJobField('tanggal_selesai', addMonths(newStart, 1));
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#2B4CE0] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Berakhir (Kedaluwarsa):
                      </label>
                      <input
                        type="date"
                        value={currentJob.tanggal_selesai || addMonths(currentJob.tanggal_mulai || getTodayDateString(), 1)}
                        onChange={(e) => handleUpdateCurrentJobField('tanggal_selesai', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#2B4CE0] outline-none"
                      />
                    </div>
                  </div>

                  {/* Preset Durasi Cepat */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-semibold">Preset Cepat:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const start = currentJob.tanggal_mulai || getTodayDateString();
                        handleUpdateCurrentJobField('tanggal_selesai', addDays(start, 7));
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-[#2B4CE0] border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      +7 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const start = currentJob.tanggal_mulai || getTodayDateString();
                        handleUpdateCurrentJobField('tanggal_selesai', addDays(start, 14));
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-[#2B4CE0] border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      +14 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const start = currentJob.tanggal_mulai || getTodayDateString();
                        handleUpdateCurrentJobField('tanggal_selesai', addMonths(start, 1));
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-[#2B4CE0] border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      +1 Bulan (Default)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Loker otomatis tersembunyi dari Beranda publik setelah melewati tanggal berakhir untuk mencegah penumpukan loker kedaluwarsa.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                    <ListChecks className="w-3 h-3 text-slate-400" />
                    Kualifikasi & Persyaratan (Satu baris per poin)
                  </label>
                  <textarea
                    rows={4}
                    value={
                      Array.isArray(currentJob.syarat)
                        ? currentJob.syarat.join('\n')
                        : currentJob.syarat || ''
                    }
                    onChange={(e) => handleUpdateCurrentJobField('syarat', e.target.value.split('\n'))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-700 leading-relaxed"
                  />
                </div>

                {/* Benefit & Fasilitas (Gaji, Lembur, Makan, Mess, dll.) */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1 text-emerald-800">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Benefit & Fasilitas (Gaji, Bonus, Lembur, Makan, Mess, dsb)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Gaji 145rb/hari, Uang lembur & makan jika lembur, Tidak ada mess..."
                    value={
                      Array.isArray(currentJob.benefit)
                        ? currentJob.benefit.join('\n')
                        : currentJob.benefit || ''
                    }
                    onChange={(e) =>
                      handleUpdateCurrentJobField(
                        'benefit',
                        e.target.value.split('\n').map((b) => b.trim()).filter(Boolean)
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-700 leading-relaxed font-medium"
                  />
                </div>

                {/* Catatan & Ketentuan Lain (Jam Kerja, Sistem Masuk, Training, dll.) */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1 text-blue-900">
                    <FileText className="w-3 h-3 text-blue-600" />
                    Catatan & Ketentuan Lain (Jam Kerja, Panggilan, Training, dsb)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Jam kerja 09:00 - 17:00, dipanggil 2-3 hari per minggu saat packing banyak..."
                    value={
                      Array.isArray(currentJob.catatan)
                        ? currentJob.catatan.join('\n')
                        : currentJob.catatan || ''
                    }
                    onChange={(e) => handleUpdateCurrentJobField('catatan', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-blue-50/20 focus:ring-2 focus:ring-blue-500 text-xs text-slate-700 leading-relaxed font-medium"
                  />
                </div>

                {/* Pengaturan Status URGENT */}
                <div className="p-3 bg-rose-50/90 border-2 border-rose-300 rounded-xl transition-all shadow-2xs">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(currentJob.is_urgent)}
                      onChange={(e) => handleUpdateCurrentJobField('is_urgent', e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300 mt-0.5 cursor-pointer accent-rose-600"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                        <span>🔥 TANDAI LOKER INI SEBAGAI "URGENT" (SEGERA DIBUTUHKAN CEPAT)</span>
                      </span>
                      <p className="text-[11px] text-rose-700 leading-snug mt-0.5">
                        Menampilkan lencana merah menyala <strong>"URGENT / SEGERA DIBUTUHKAN"</strong> pada postingan loker di Beranda.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL PENGATURAN GOOGLE GEMINI VISION API                */}
      {/* ========================================================= */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsKeyModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Pengaturan Vision AI (Multi-Provider Gratis)</h3>
                <p className="text-xs text-slate-500">Mendukung Groq Qwen 3.8 Vision, OpenRouter Qwen VL, & Google Gemini 2.5</p>
              </div>
            </div>

            <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 text-xs text-purple-950 leading-relaxed mb-5">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-purple-900">
                <Bot className="w-4 h-4 text-purple-600" />
                <span>Pilih Provider Vision AI Gratis Terbaik (Otomatis Mendeteksi Model Aktif):</span>
              </p>
              <ul className="space-y-1 text-purple-900/90 list-disc pl-4 mt-1">
                <li><strong>Groq Cloud (`gsk_...`)</strong>: Model <em>Qwen 3.8 27B Vision (`qwen/qwen3.8-27b`)</em> — 100% Gratis, super cepat (1–2 detik/gambar), kuota harian longgar.</li>
                <li><strong>OpenRouter (`sk-or-...`)</strong>: Model <em>Qwen VL / Gemma 3 Vision (:free)</em> — Otomatis mencari model Vision gratis yang sedang aktif.</li>
                <li><strong>Google Gemini (`AIzaSy...`)</strong>: Model <em>Gemini 2.5 Flash / Flash-Lite</em> — Sudah dioptimasi anti-timeout & kuota 1.500 gambar/hari.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  API Key Vision AI (Groq `gsk_...` / OpenRouter `sk-or-...` / Gemini `AIzaSy...`)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputKey(val);
                      setKeyTestStatus(null);
                      if (val.trim().startsWith('gsk_')) {
                        setSelectedModel('llama-3.3-70b-versatile');
                        setIsCustomModel(false);
                      } else if (val.trim().startsWith('sk-or-')) {
                        setSelectedModel('qwen/qwen2.5-vl-72b-instruct:free');
                        setIsCustomModel(false);
                      } else if (val.trim().startsWith('AIza') || val.trim().startsWith('AQ.')) {
                        setSelectedModel('gemini-3.8-flash');
                        setCustomModelName('gemini-3.8-flash');
                        setIsCustomModel(false);
                      }
                    }}
                    placeholder="Tempel API Key Gratis: AQ.... / AIzaSy... (Gemini) / gsk_... (Groq) / sk-or-... (OpenRouter)"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-mono text-slate-800"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] text-slate-500">
                  <span>Ambil API Key 100% Gratis:</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                    >
                      <span>1. Groq Cloud (Qwen 3.8 Vision)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://openrouter.ai/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1"
                    >
                      <span>2. OpenRouter (Free Vision)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 font-bold inline-flex items-center gap-1"
                    >
                      <span>3. Google AI Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Pilihan Versi Model Vision AI */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Pilih Model Vision AI Gratis (Groq / OpenRouter / Gemini)</span>
                  <span className="text-[10px] text-purple-600 font-bold">multi-provider vision</span>
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {POPULAR_GEMINI_MODELS.map((item) => (
                    <label
                      key={item.id}
                      onClick={() => {
                        setSelectedModel(item.id);
                        setIsCustomModel(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        !isCustomModel && selectedModel === item.id
                          ? 'border-purple-500 bg-purple-50 text-purple-950 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="gemini_model_choice"
                          checked={!isCustomModel && selectedModel === item.id}
                          onChange={() => {
                            setSelectedModel(item.id);
                            setIsCustomModel(false);
                          }}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs">{item.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badge === 'Rekomendasi' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    </label>
                  ))}

                  {/* Opsi Custom Model */}
                  <label
                    onClick={() => {
                      setIsCustomModel(true);
                      if (!customModelName.trim()) {
                        setCustomModelName(activeModel || 'gemini-3.8-flash');
                      }
                    }}
                    className={`flex flex-col gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isCustomModel
                        ? 'border-purple-500 bg-purple-50 text-purple-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="gemini_model_choice"
                        checked={isCustomModel}
                        onChange={() => {
                          setIsCustomModel(true);
                          if (!customModelName.trim()) {
                            setCustomModelName(activeModel || 'gemini-3.8-flash');
                          }
                        }}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs">Ketik Model Custom Google Sendiri...</span>
                    </div>
                    {isCustomModel && (
                      <input
                        type="text"
                        value={customModelName}
                        onChange={(e) => setCustomModelName(e.target.value)}
                        placeholder="Misal: gemini-3.8-flash atau gemini-3.5-flash-lite"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-slate-800"
                      />
                    )}
                  </label>
                </div>
              </div>

              {keyTestStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  keyTestStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {keyTestStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{keyTestStatus.message}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsTestingKey(true);
                    setKeyTestStatus(null);
                    const chosen = isCustomModel && customModelName.trim() ? customModelName.trim() : selectedModel;
                    const result = await testGeminiApiKey(inputKey, chosen);
                    setKeyTestStatus(result);
                    if (result.activeModel) {
                      setActiveModel(result.activeModel);
                      setSelectedModel(result.activeModel);
                    }
                    if (result.success) {
                      setGeminiApiKey(inputKey);
                      setActiveApiKey(inputKey.trim());
                    }
                    setIsTestingKey(false);
                  }}
                  disabled={isTestingKey || !inputKey.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestingKey ? 'Mencari Model Vision Aktif...' : 'Uji Koneksi & Model'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    let chosen = isCustomModel && customModelName.trim() ? customModelName.trim() : selectedModel;
                    const trimmedKey = inputKey.trim();
                    if (trimmedKey.startsWith('gsk_') && !chosen.includes('llama')) {
                      chosen = 'meta-llama/llama-4-scout-17b-16e-instruct';
                    }
                    setGeminiApiKey(trimmedKey);
                    setActiveApiKey(trimmedKey);
                    setActiveGeminiModel(chosen);
                    setActiveModel(chosen);
                    setSelectedModel(chosen);
                    setIsKeyModalOpen(false);
                    showToast(trimmedKey ? `Vision AI (${chosen}) Berhasil Diaktifkan!` : 'Kembali ke Engine OCR Cerdas Lokal');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Simpan Pengaturan
                </button>
              </div>

              {activeApiKey && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInputKey('');
                      setGeminiApiKey('');
                      setActiveApiKey('');
                      setKeyTestStatus(null);
                      showToast('API Key dihapus. Beralih ke OCR Cerdas Lokal.');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium underline cursor-pointer"
                  >
                    Hapus API Key (Gunakan OCR Lokal)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
