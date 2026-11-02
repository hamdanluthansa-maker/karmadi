import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  ArrowLeft,
  UploadCloud,
  ListFilter,
  Sparkles,
  LogOut,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Zap,
  Clock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminExtractor from '../components/AdminExtractor';
import AdminJobList from '../components/AdminJobList';
import { useJobs } from '../context/JobContext';
import { 
  verifyAdminCredentials, 
  isCurrentAdminSessionValid, 
  logoutAdmin, 
  getLoginLockoutStatus 
} from '../utils/securityUtils';

/**
 * Halaman Admin (/admin)
 * Memiliki 2 tab utama:
 * 1. Upload & Ekstraksi AI (AdminExtractor)
 * 2. Kelola & Edit Lowongan (AdminJobList)
 */
export default function AdminPage() {
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'list'

  // Metrik riil yang dihitung dinamis dari database loker
  const uniqueMitraCount = useMemo(() => {
    return new Set(jobs.map((j) => (j.nama_perusahaan || '').trim()).filter(Boolean)).size;
  }, [jobs]);

  const fullTimeCount = useMemo(() => {
    return jobs.filter((j) => (j.tipe || 'Full Time').toLowerCase().includes('full')).length;
  }, [jobs]);

  const freelanceCount = useMemo(() => {
    return jobs.filter((j) => {
      const t = (j.tipe || '').toLowerCase();
      return t.includes('free') || t.includes('part') || t.includes('proyek') || t.includes('magang');
    }).length;
  }, [jobs]);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return isCurrentAdminSessionValid();
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isPublishingOnline, setIsPublishingOnline] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState(null);

  const handlePublishToVercel = async () => {
    setIsPublishingOnline(true);
    setPublishFeedback(null);
    const isLocalHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocalHost
      ? '/api/publish-vercel'
      : 'http://localhost:5173/api/publish-vercel';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs, updatedAt: Date.now() }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('NOT_JSON');
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setPublishFeedback({
          type: 'success',
          text: data.message || 'Berhasil dikirim ke GitHub & Vercel! Website online akan terupdate dalam ~30 detik.',
        });
      } else {
        setPublishFeedback({
          type: 'error',
          text: data.error || 'Gagal melakukan sinkronisasi otomatis ke GitHub/Vercel.',
        });
      }
    } catch (err) {
      setPublishFeedback({
        type: 'error',
        text: 'Pastikan aplikasi KARMADI di laptop Anda sedang menyala (localhost:5173 aktif) saat menekan tombol Tayangkan ke Web Online.',
      });
    } finally {
      setIsPublishingOnline(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = await verifyAdminCredentials(username, password);
    if (res.success) {
      setIsAuthenticated(true);
    } else {
      setLoginError(res.error || 'Akses ditolak.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
          <div className="bg-[#2B4CE0] text-white p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#A3F742] text-[#0F172A] flex items-center justify-center mx-auto mb-3 shadow-md">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black">Akses Pengelola Portal</h2>
            <p className="text-xs text-blue-100 mt-1">Karmadi • Karesidenan Madiun</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Username Pengelola</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username pengelola"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4CE0] text-slate-800"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata Sandi / PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi rahasia"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4CE0] text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2B4CE0] hover:bg-[#2342D8] text-white shadow-md shadow-[#2B4CE0]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ShieldCheck className="w-4 h-4 text-[#A3F742]" />
              <span>Masuk ke Panel Pengelola</span>
            </button>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-slate-500 hover:text-[#2B4CE0] font-semibold transition-colors">
                ← Kembali ke Beranda Publik
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar Brand Karmadi */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <img
                src="/assets/logo-karmadi.svg"
                alt="Logo Karmadi"
                className="w-12 h-12 rounded-2xl shadow-sm transition-transform hover:scale-105"
              />
              <div className="border-l border-slate-200 pl-4">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-[#2B4CE0]">
                    Karmadi
                  </span>
                  <span className="bg-[#EEF2FF] text-[#2B4CE0] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#2B4CE0]/20">
                    Portal Administrator
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold">
                  Info Lowongan Kerja Seputar Karesidenan Madiun
                </p>
              </div>
            </div>

            {/* Nav kanan */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handlePublishToVercel}
                disabled={isPublishingOnline}
                className="flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                title="Simpan otomatis ke jobs.json dan tayangkan langsung ke karmadi.vercel.app"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#A3F742]" />
                <span>{isPublishingOnline ? 'Menayangkan ke Vercel...' : 'Tayangkan ke Web Online'}</span>
              </button>

              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-[#EEF2FF] text-[#2B4CE0] hover:bg-[#E0E7FF] border border-[#2B4CE0]/30 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lihat Beranda Publik</span>
              </Link>

              <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  KM
                </div>
                <div className="text-left text-xs hidden sm:block">
                  <div className="font-semibold text-slate-800">Admin Karmadi</div>
                  <div className="text-slate-400">Portal Manager</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Keluar / Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {publishFeedback && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                publishFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <span>{publishFeedback.text}</span>
              <button
                type="button"
                onClick={() => setPublishFeedback(null)}
                className="text-slate-500 hover:text-slate-800 font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Quick Metrics Asli Berdasarkan Data Lowongan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2B4CE0] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400 font-medium truncate">Total Loker Aktif</div>
                <div className="text-lg font-black text-slate-800">{jobs.length} Loker</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400 font-medium truncate">Mitra Perusahaan</div>
                <div className="text-lg font-black text-slate-800">{uniqueMitraCount} Mitra</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400 font-medium truncate">Full Time</div>
                <div className="text-lg font-black text-slate-800">{fullTimeCount} Loker</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-purple-600 text-purple-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400 font-medium truncate">Freelance</div>
                <div className="text-lg font-black text-slate-800">{freelanceCount} Loker</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Menu Admin */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 max-w-md">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#2B4CE0] text-white shadow-sm shadow-[#2B4CE0]/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload & Ekstraksi AI</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#2B4CE0] text-white shadow-sm shadow-[#2B4CE0]/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Kelola Lowongan ({jobs.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' ? (
            <AdminExtractor />
          ) : (
            <AdminJobList onSwitchToUpload={() => setActiveTab('upload')} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo-karmadi.png"
              alt="Logo Karmadi"
              className="h-7 w-auto rounded-lg"
            />
            <span>
              © {new Date().getFullYear()} <strong>Karmadi</strong> • Info Lowongan Kerja Seputar Karesidenan Madiun.
            </span>
          </div>
          <span className="text-blue-700 font-medium">
            Karmadi Career Hub
          </span>
        </div>
      </footer>
    </div>
  );
}
