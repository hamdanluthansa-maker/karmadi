import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Terjadi Kendala pada Tampilan
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem mendeteksi kendala pada antarmuka. Anda dapat memuat ulang halaman atau kembali ke beranda utama.
            </p>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left font-mono text-[11px] text-rose-600 break-words">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2B4CE0] text-white hover:bg-[#2342D8] transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-[#2B4CE0]/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ke Beranda</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
