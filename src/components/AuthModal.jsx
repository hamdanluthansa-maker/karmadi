import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CreditCard, 
  CheckCircle,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form States
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    nama: '',
    nik: '',
    no_wa: '',
    email: '',
    password: '',
    konfirmasi: ''
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setSuccessMessage(`Selamat datang kembali di Karmadi!`);
    setTimeout(() => {
      onAuthSuccess && onAuthSuccess({
        nama: loginForm.identifier.includes('@') ? loginForm.identifier.split('@')[0] : 'Pencari Kerja',
        identifier: loginForm.identifier
      });
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setSuccessMessage(`Pendaftaran akun Karmadi berhasil! NIK ${registerForm.nik} telah terverifikasi.`);
    setTimeout(() => {
      onAuthSuccess && onAuthSuccess({
        nama: registerForm.nama,
        identifier: registerForm.email || registerForm.no_wa || registerForm.nik
      });
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Strip */}
        <div className="bg-blue-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-karmadi.png" alt="Logo Karmadi" className="h-8 w-auto rounded-lg" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Akun Karmadi</h3>
              <p className="text-[11px] text-blue-100">Info Lowongan Kerja Seputar Karesidenan Madiun</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 m-4 rounded-2xl">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setIsSuccess(false); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setIsSuccess(false); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Baru</span>
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 pt-1">
          {isSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Berhasil!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {successMessage}
              </p>
            </div>
          ) : activeTab === 'login' ? (
            /* ════ FORM MASUK (LOGIN) ════ */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIK / Email / No. WhatsApp
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 357701... atau nama@email.com"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <a href="#" className="text-[11px] font-semibold text-blue-600 hover:underline">
                    Lupa Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Karmadi</span>
              </button>

              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
                <span>Belum punya akun?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          ) : (
            /* ════ FORM DAFTAR (REGISTER) ════ */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Sesuai KTP Anda"
                    value={registerForm.nama}
                    onChange={(e) => setRegisterForm({ ...registerForm, nama: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIK (16 Digit) *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={16}
                      required
                      placeholder="3577..."
                      value={registerForm.nik}
                      onChange={(e) => setRegisterForm({ ...registerForm, nik: e.target.value })}
                      className="w-full pl-10 pr-2 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="0812..."
                      value={registerForm.no_wa}
                      onChange={(e) => setRegisterForm({ ...registerForm, no_wa: e.target.value })}
                      className="w-full pl-10 pr-2 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 karakter"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Ketik ulang"
                    value={registerForm.konfirmasi}
                    onChange={(e) => setRegisterForm({ ...registerForm, konfirmasi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Karmadi</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <span>Sudah punya akun?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Masuk di sini
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Platform Lowongan Karir & Rekrutmen Swasta Terpercaya</span>
        </div>
      </div>
    </div>
  );
}
