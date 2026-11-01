import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JobProvider } from './context/JobContext';
import ErrorBoundary from './components/ErrorBoundary';
import Beranda from './pages/Beranda';
import AdminPage from './pages/AdminPage';

/**
 * App — Root aplikasi Karmadi (Info Lowongan Kerja Seputar Karesidenan Madiun)
 *
 * Routing:
 *  /       → Halaman Beranda pencari kerja (publik)
 *  /admin  → Dashboard Admin Karmadi (upload poster + publish loker)
 *
 * JobProvider membungkus seluruh aplikasi agar data loker yang di-publish
 * oleh admin langsung muncul di halaman Beranda pencari kerja.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <JobProvider>
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </JobProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
