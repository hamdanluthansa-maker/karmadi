import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Search, 
  Trash2, 
  Edit3, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Palette, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle, 
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  Globe,
  Zap,
  Sparkles,
  FileText,
  Hourglass
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { getJobExpiryStatus, isJobActive, formatDateIndo, getTodayDateString, addMonths, addDays } from '../utils/dateUtils';

export default function AdminJobList({ onSwitchToUpload }) {
  const { jobs, updateJob, deleteJob, deleteAllJobs, deleteExpiredJobs } = useJobs();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'expired'
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [isConfirmDeleteAll, setIsConfirmDeleteAll] = useState(false);
  const [isConfirmDeleteExpired, setIsConfirmDeleteExpired] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Hitung jumlah loker aktif vs kedaluwarsa
  const { activeCount, expiredCount } = useMemo(() => {
    let act = 0;
    let exp = 0;
    jobs.forEach((j) => {
      if (isJobActive(j)) act++;
      else exp++;
    });
    return { activeCount: act, expiredCount: exp };
  }, [jobs]);

  // Filter jobs by search query & status kedaluwarsa
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = search.toLowerCase();
      const matchSearch =
        j.posisi?.toLowerCase().includes(q) ||
        j.nama_perusahaan?.toLowerCase().includes(q) ||
        j.kategori?.toLowerCase().includes(q) ||
        j.kontak_wa?.toLowerCase().includes(q);

      const active = isJobActive(j);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && active) ||
        (statusFilter === 'expired' && !active);

      return matchSearch && matchStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingJob) return;

    // Pastikan syarat dan benefit dalam bentuk array
    const syaratArray = typeof editingJob.syarat === 'string'
      ? editingJob.syarat.split('\n').filter(Boolean)
      : editingJob.syarat;

    const benefitArray = typeof editingJob.benefit === 'string'
      ? editingJob.benefit.split('\n').map((b) => b.trim()).filter(Boolean)
      : (Array.isArray(editingJob.benefit) ? editingJob.benefit : []);

    const start = editingJob.tanggal_mulai || editingJob.tanggal || getTodayDateString();
    const end = editingJob.tanggal_selesai || addMonths(start, 1);

    updateJob(editingJob.id, {
      ...editingJob,
      wilayah: editingJob.wilayah || 'Kota Madiun',
      lokasi: editingJob.lokasi || '',
      syarat: syaratArray,
      benefit: benefitArray,
      catatan: typeof editingJob.catatan === 'string' ? editingJob.catatan : (Array.isArray(editingJob.catatan) ? editingJob.catatan.join('\n') : ''),
      tanggal_mulai: start,
      tanggal_selesai: end,
      tanggal: start,
    });

    showToast(`Lowongan "${editingJob.posisi}" berhasil diperbarui!`);
    setEditingJob(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingJob) return;
    deleteJob(deletingJob.id);
    showToast(`Lowongan "${deletingJob.posisi}" berhasil dihapus dari portal.`);
    setDeletingJob(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm border border-slate-700 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-2 border border-blue-200">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Manajemen Database Lowongan</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Kelola & Edit Lowongan Terbit
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Total <strong>{jobs.length} lowongan</strong> terpublikasi di portal Karmadi. Anda dapat menyunting atau menghapus loker sewaktu-waktu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={async () => {
              try {
                const now = Date.now();
                await fetch('/api/jobs', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jobs, updatedAt: now }),
                });
                showToast('Database berhasil disinkronkan ke HP & semua perangkat!');
              } catch (e) {
                showToast('Gagal sinkronisasi data ke server.');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            title="Kirim dan sinkronkan data loker saat ini ke HP"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sinkron ke HP</span>
          </button>

          {jobs.length > 0 && (
            <button
              onClick={() => setIsConfirmDeleteAll(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              title="Hapus seluruh lowongan kerja sekaligus"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Kosongkan Semua Loker ({jobs.length})</span>
            </button>
          )}

          <button
            onClick={onSwitchToUpload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2B4CE0] hover:bg-[#2342D8] text-white font-bold text-xs shadow-md shadow-[#2B4CE0]/30 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#A3F742]" />
            <span>+ Ekstrak & Upload Loker Baru</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari lowongan berdasarkan posisi, perusahaan, atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Status Tayang: Semua | Aktif | Kedaluwarsa */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Aktif ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-rose-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Kedaluwarsa ({expiredCount})</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium shrink-0 hidden lg:block">
          Menampilkan {filteredJobs.length} loker
        </div>
      </div>

      {/* Banner Peringatan Loker Kedaluwarsa */}
      {expiredCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Hourglass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-950">
                Ditemukan {expiredCount} Lowongan Melewati Batas Waktu (Kedaluwarsa)
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Lowongan ini otomatis tidak lagi muncul di Beranda publik agar pencari kerja hanya melihat loker yang masih berlaku.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsConfirmDeleteExpired(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Loker Kedaluwarsa ({expiredCount})</span>
          </button>
        </div>
      )}

      {/* List / Table of Published Jobs */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => {
            const color = job.warna_primer || '#16a34a';
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Poster & Main Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Poster Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group">
                    {job.poster_url && !job.poster_url.includes('logo-karmadi') ? (
                      <img
                        src={job.poster_url}
                        alt={job.posisi}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center p-1.5 text-center text-white select-none"
                        style={{ background: `linear-gradient(135deg, ${color} 0%, #0F172A 100%)` }}
                      >
                        <span className="text-[8px] font-black uppercase tracking-tight line-clamp-2 leading-none">
                          {job.posisi}
                        </span>
                        <span className="text-[7px] text-white/70 truncate w-full mt-0.5 font-medium">
                          {job.nama_perusahaan}
                        </span>
                      </div>
                    )}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  {/* Job & Company Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                        title={`Warna Primer: ${color}`}
                      />
                      <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {job.nama_perusahaan}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {job.kategori || 'Umum'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          (job.tipe || '').toLowerCase().includes('free')
                            ? 'bg-[#A3F742] text-slate-950 font-black shadow-xs'
                            : 'text-white'
                        }`}
                        style={{ backgroundColor: (job.tipe || '').toLowerCase().includes('free') ? undefined : color }}
                      >
                        {(job.tipe || '').toLowerCase().includes('free') ? (
                          <>
                            <Zap className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                            <span>Freelance</span>
                          </>
                        ) : (
                          job.tipe || 'Full Time'
                        )}
                      </span>
                      {job.is_urgent && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs animate-pulse border border-rose-400">
                          🔥 URGENT
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {job.posisi}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#2B4CE0] font-bold text-[10px] border border-[#2B4CE0]/20">
                        <MapPin className="w-3 h-3 text-[#2B4CE0]" />
                        <span>{job.wilayah || 'Kota Madiun'}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        {job.lokasi || 'Kota Madiun'}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5" />
                        +{job.kontak_wa || '-'}
                      </span>
                      {job.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          {job.email}
                        </span>
                      )}
                      {job.link_pendaftaran && (
                        <a
                          href={job.link_pendaftaran}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline max-w-[180px] truncate"
                          title={job.link_pendaftaran}
                        >
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{job.link_pendaftaran.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                      {job.is_walk_in && (
                        <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Building2 className="w-3 h-3" />
                          Datang Langsung / Walk-In
                        </span>
                      )}
                      {/* Masa Tayang & Status Kedaluwarsa */}
                      {(() => {
                        const expiry = getJobExpiryStatus(job);
                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDateIndo(job.tanggal_mulai || job.tanggal)} – {formatDateIndo(job.tanggal_selesai)}</span>
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${expiry.badgeColor}`}>
                              <Hourglass className="w-2.5 h-2.5" />
                              <span>{expiry.label}</span>
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Edit & Delete */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => {
                      setEditingJob({
                        ...job,
                        syarat: Array.isArray(job.syarat) ? job.syarat.join('\n') : (job.syarat || ''),
                        benefit: Array.isArray(job.benefit) ? job.benefit.join('\n') : (job.benefit || ''),
                        catatan: Array.isArray(job.catatan) ? job.catatan.join('\n') : (job.catatan || '')
                      });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Loker
                  </button>

                  <button
                    onClick={() => setDeletingJob(job)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">Tidak ada lowongan ditemukan</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Coba ganti kata kunci pencarian.' : 'Belum ada lowongan terbit. Unggah poster untuk menerbitkan loker pertama.'}
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL EDIT LOKER                                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      {editingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setEditingJob(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Strip */}
            <div
              className="h-2.5 w-full"
              style={{ backgroundColor: editingJob.warna_primer || '#16a34a' }}
            />

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Edit Informasi Lowongan</h3>
                    <p className="text-xs text-slate-400">ID: {editingJob.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingJob(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Posisi Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.posisi || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, posisi: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Perusahaan / Institusi *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.nama_perusahaan || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, nama_perusahaan: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Wilayah & Detail Penempatan Lokasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2B4CE0]" />
                      <span>Wilayah (Karesidenan Madiun) *</span>
                    </label>
                    <select
                      value={editingJob.wilayah || 'Kota Madiun'}
                      onChange={(e) => setEditingJob({ ...editingJob, wilayah: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#2B4CE0] bg-white cursor-pointer outline-none"
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
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Detail Lokasi / Penempatan</span>
                    </label>
                    <input
                      type="text"
                      value={editingJob.lokasi || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, lokasi: e.target.value })}
                      placeholder="Contoh: Jl. Pahlawan No. 10, Kota Madiun"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-[#2B4CE0] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Kategori</label>
                    <select
                      value={editingJob.kategori || 'Umum'}
                      onChange={(e) => setEditingJob({ ...editingJob, kategori: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Tipe Pekerjaan</label>
                    <select
                      value={editingJob.tipe || 'Full Time'}
                      onChange={(e) => setEditingJob({ ...editingJob, tipe: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    <label className="block text-slate-600 font-bold mb-1">Warna Primer Aksen</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingJob.warna_primer || '#16a34a'}
                        onChange={(e) => setEditingJob({ ...editingJob, warna_primer: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={editingJob.warna_primer || ''}
                        onChange={(e) => setEditingJob({ ...editingJob, warna_primer: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">WhatsApp Rekrutmen</label>
                    <input
                      type="text"
                      value={editingJob.kontak_wa || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, kontak_wa: e.target.value })}
                      placeholder="6281234567890"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Email Rekrutmen (Opsional)</label>
                  <input
                    type="email"
                    value={editingJob.email || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, email: e.target.value })}
                    placeholder="hrd@perusahaan.co.id"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Link Pendaftaran / Formulir Online (bit.ly / Google Form / Web)
                  </label>
                  <input
                    type="url"
                    value={editingJob.link_pendaftaran || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, link_pendaftaran: e.target.value })}
                    placeholder="https://bit.ly/... atau https://forms.gle/..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Tandai Urgent Checkbox */}
                <div className={`p-3 rounded-xl border transition-all ${
                  editingJob.is_urgent 
                    ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/20' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(editingJob.is_urgent)}
                      onChange={(e) => setEditingJob({ ...editingJob, is_urgent: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                        <span>🔥 TANDAI SEBAGAI LOKER URGENT</span>
                        <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.2 rounded-full">
                          Segera Dibutuhkan Cepat
                        </span>
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menampilkan badge merah berkedip di poster & beranda serta notifikasi prioritas bagi pelamar.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Pengaturan Walk-In / Datang Langsung */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(editingJob.is_walk_in)}
                      onChange={(e) => setEditingJob({ ...editingJob, is_walk_in: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-amber-900">
                      Lamaran Wajib Datang Langsung / Walk-In Interview / Kirim Berkas Fisik
                    </span>
                  </label>

                  {editingJob.is_walk_in && (
                    <div>
                      <label className="block text-[11px] font-bold text-amber-800 mb-1">
                        Alamat Tujuan Penyerahan Berkas / Walk-In:
                      </label>
                      <input
                        type="text"
                        value={editingJob.alamat_walk_in || ''}
                        onChange={(e) => setEditingJob({ ...editingJob, alamat_walk_in: e.target.value })}
                        placeholder="Contoh: Bakeshop Bakery, Jl. H.A. Salim 128, Madiun"
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Pengaturan Masa Tayang Loker */}
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#2B4CE0]" />
                      Atur Masa Tayang Loker
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
                        value={editingJob.tanggal_mulai || editingJob.tanggal || getTodayDateString()}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setEditingJob({
                            ...editingJob,
                            tanggal_mulai: newStart,
                            tanggal_selesai: editingJob.tanggal_selesai && editingJob.tanggal_selesai >= newStart
                              ? editingJob.tanggal_selesai
                              : addMonths(newStart, 1)
                          });
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
                        value={editingJob.tanggal_selesai || addMonths(editingJob.tanggal_mulai || editingJob.tanggal || getTodayDateString(), 1)}
                        onChange={(e) => setEditingJob({ ...editingJob, tanggal_selesai: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#2B4CE0] outline-none"
                      />
                    </div>
                  </div>

                  {/* Preset Durasi Cepat */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-semibold">Ubah Cepat:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const start = editingJob.tanggal_mulai || getTodayDateString();
                        setEditingJob({ ...editingJob, tanggal_selesai: addDays(start, 7) });
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-[#2B4CE0] border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      +7 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const start = editingJob.tanggal_mulai || getTodayDateString();
                        setEditingJob({ ...editingJob, tanggal_selesai: addDays(start, 14) });
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-[#2B4CE0] border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      +14 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const start = editingJob.tanggal_mulai || getTodayDateString();
                        setEditingJob({ ...editingJob, tanggal_selesai: addMonths(start, 1) });
                      }}
                      className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-[#2B4CE0] border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      +1 Bulan (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = getTodayDateString();
                        setEditingJob({
                          ...editingJob,
                          tanggal_mulai: today,
                          tanggal_selesai: addMonths(today, 1)
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-bold transition-colors cursor-pointer ml-auto"
                    >
                      🔄 Perpanjang 1 Bulan Lagi
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    Kualifikasi & Persyaratan (Satu baris per poin)
                  </label>
                  <textarea
                    rows={4}
                    value={editingJob.syarat || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, syarat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Benefit & Fasilitas (Gaji, Lembur, Mess, Bonus, dll. Satu baris per poin)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Gaji 145rb/hari, Uang lembur & makan..."
                    value={editingJob.benefit || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, benefit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/20 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 text-blue-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Catatan & Ketentuan Lain (Jam Kerja, Sistem Masuk, Training, dll.)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Jam kerja 09:00 - 17:00, masuk 2-3 hari per minggu saat pesanan banyak..."
                    value={editingJob.catatan || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, catatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/20 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL KONFIRMASI HAPUS                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {deletingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setDeletingJob(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Hapus Lowongan Kerja?
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Anda akan menghapus lowongan <strong>{deletingJob.posisi}</strong> di <strong>{deletingJob.nama_perusahaan}</strong>. Lowongan ini tidak akan lagi muncul pada portal pencari kerja Karmadi.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div><strong>Posisi:</strong> {deletingJob.posisi}</div>
              <div><strong>Perusahaan:</strong> {deletingJob.nama_perusahaan}</div>
              <div><strong>ID:</strong> {deletingJob.id}</div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingJob(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL KONFIRMASI HAPUS SEMUA LOKER                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isConfirmDeleteAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsConfirmDeleteAll(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Kosongkan Seluruh Lowongan?
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Tindakan ini akan menghapus <strong>seluruh {jobs.length} lowongan</strong> dari portal secara permanen. Loker tidak akan muncul lagi saat halaman di-refresh.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteAll(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAllJobs();
                  setIsConfirmDeleteAll(false);
                  showToast('Seluruh data lowongan berhasil dikosongkan!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Semua ({jobs.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL KONFIRMASI HAPUS LOKER KEDALUWARSA                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isConfirmDeleteExpired && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsConfirmDeleteExpired(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <Hourglass className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Bersihkan {expiredCount} Loker Kedaluwarsa?
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Tindakan ini akan menghapus semua lowongan yang telah melewati tanggal berakhir tayang (lebih dari 1 bulan atau tenggat waktu kustom). Lowongan yang masih aktif tidak akan terhapus.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteExpired(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExpiredJobs();
                  setIsConfirmDeleteExpired(false);
                  showToast(`${expiredCount} lowongan kedaluwarsa berhasil dibersihkan!`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Bersihkan ({expiredCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
