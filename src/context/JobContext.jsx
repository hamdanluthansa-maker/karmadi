import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { detectWilayah } from '../utils/regionUtils';
import { getTodayDateString, addMonths, isJobActive } from '../utils/dateUtils';

const STORAGE_KEY = 'karmadi_jobs';
const LEGACY_STORAGE_KEY = 'sicaker_jobs';
const TIME_KEY = 'karmadi_jobs_time';

// Database lowongan kerja aktif Karmadi
const INITIAL_JOBS = [
  {
    id: 1730460000001,
    posisi: 'Jaga Stand Event kuliner',
    nama_perusahaan: 'Mitra Usaha Madiun',
    kategori: 'F&B',
    tipe: 'Freelance',
    wilayah: 'Kota Madiun',
    lokasi: 'Kota Madiun, Karesidenan Madiun',
    syarat: [
      'Pria/Wanita',
      'Min SMA',
      'Min usia 20-30th',
      'Jujur, cekatan & tanggung jawab',
      'Jika berminat silahkan hubungi',
      'WA 082 3333 43610',
    ],
    catatan: 'mulai tgl 2025 9 DES 2025 - 4 JANUARI 2026\nmahasiswa semester akhir atau baru lulus kuliah diperbolehkan',
    kontak_wa: '082333343610',
    email: '',
    link_pendaftaran: '',
    is_walk_in: false,
    alamat_walk_in: '',
    warna_primer: '#7C3AED',
    is_urgent: false,
    tanggal_mulai: '2026-11-01',
    tanggal_selesai: '2026-12-01',
    tanggal: '2026-11-01',
    is_manual: true,
    poster_url: '',
  },
  {
    id: 1730460000002,
    posisi: 'Tenaga Teknis Kefarmasian',
    nama_perusahaan: 'Apotek Mecca',
    kategori: 'Kesehatan',
    tipe: 'Full Time',
    wilayah: 'Ponorogo',
    lokasi: 'Area Pasar Slahung, Ponorogo',
    syarat: [
      'Pendidikan minimal D3/S1 Farmasi / Tenaga Teknis Kefarmasian',
      'Memiliki STRTTK aktif lebih disukai',
      'Jujur, teliti, disiplin, dan bertanggung jawab',
      'Mampu melayani pasien dan meracik obat dengan baik',
      'Penempatan: Apotek Mecca, Area Pasar Slahung, Ponorogo',
    ],
    catatan: 'Lamaran wajib datang langsung / walk-in interview / kirim berkas fisik ke Apotek Mecca',
    kontak_wa: '6285179849167',
    email: '',
    link_pendaftaran: 'https://wa.me/6285179849167',
    is_walk_in: true,
    alamat_walk_in: 'Area Pasar Slahung, Ponorogo',
    warna_primer: '#003366',
    is_urgent: false,
    tanggal_mulai: '2026-11-01',
    tanggal_selesai: '2026-12-01',
    tanggal: '2026-11-01',
    is_manual: true,
    poster_url: '',
  },
  {
    id: 1730460000003,
    posisi: 'Tenaga Packing Online Shop',
    nama_perusahaan: 'Online Shop Madiun',
    kategori: 'Gudang',
    tipe: 'Freelance',
    wilayah: 'Kota Madiun',
    lokasi: 'Kota Madiun',
    syarat: [
      'Laki-laki / Perempuan',
      'Tekun, rajin, dan niat kerja',
      'Wajib TIDAK merokok',
      'SIAP lembur',
      'Punya pengalaman packing lebih disukai, jika tidak punya pengalaman akan diajari',
    ],
    benefit: [
      'Gaji Rp 145.000 per hari',
      'Ada uang lembur dan makan (jika lembur)',
      'Tidak ada mess'
    ],
    catatan: 'Dalam 1 minggu mungkin hanya dipanggil 2-3 hari (atau jika packingan lagi banyak)\nJam kerja: 09:00 - 17:00 (istirahat siang satu jam)\nSelama iklan masih ada, berarti lowongan masih dibuka.',
    kontak_wa: '6282331433496',
    email: '',
    link_pendaftaran: '',
    is_walk_in: false,
    alamat_walk_in: '',
    warna_primer: '#7C3AED',
    is_urgent: true,
    tanggal_mulai: '2026-11-01',
    tanggal_selesai: '2026-12-01',
    tanggal: '2026-11-01',
    is_manual: true,
    poster_url: '',
  },
];

/**
 * Memperbaiki poster_url yang rusak akibat URL blob yang kadaluarsa saat reload
 * dan memastikan loker mandiri/tipografi tidak dipaksa menggunakan logo Karmadi
 */
function repairPosterUrl(job) {
  const current = job.poster_url;
  // Jika ini adalah loker tanpa poster (mandiri/tipografi) atau berisi logo fallback karmadi:
  if (!current || typeof current !== 'string' || current.includes('logo-karmadi') || job.is_manual) {
    return '';
  }

  // Jika URL berupa blob: yang sudah expired setelah reload, kita ganti ke aset permanen
  if (current.startsWith('blob:')) {
    const title = (job.posisi || '').toLowerCase();
    const comp = (job.nama_perusahaan || '').toLowerCase();

    if (comp.includes('eras') || comp.includes('e-bike') || title.includes('standby toko')) {
      return '/assets/loker_eras_ebike.jpg';
    }
    if (comp.includes('arsyila') || title.includes('terapis baby') || title.includes('baby spa')) {
      return '/assets/loker_arsyila_baby_spa.png';
    }
    if (comp.includes('bakeshop') || comp.includes('bakery') || title.includes('baker')) {
      return '/assets/poster_bakeshop_bakery.png';
    }
    if (comp.includes('heaven scent') || comp.includes('scent') || title.includes('spg')) {
      return '/assets/poster_heaven_scent.png';
    }
    if (title.includes('driver') || title.includes('kasir') || comp.includes('maju hardware')) {
      return '/assets/poster_maju_hardware.png';
    }
    if (title.includes('forklift') || title.includes('mekanik') || comp.includes('konjac')) {
      return '/assets/poster_mekanik_forklift.png';
    }
    if (title.includes('checker') || title.includes('gudang') || comp.includes('cahaya adin') || comp.includes('aqua')) {
      return '/assets/poster_checker_gudang.png';
    }
    if (title.includes('office boy') || title.includes('cleaning') || comp.includes('fasilitas prima')) {
      return '/assets/poster_office_boy.png';
    }
    if (title.includes('sales') || title.includes('motoris') || comp.includes('luck milk')) {
      return '/assets/poster_luck_milk.png';
    }
    // Jika tidak cocok dengan aset poster demo manapun, jadikan loker tipografi teks bersih tanpa gambar
    return '';
  }
  return current;
}

function loadJobsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Jika data pernah disimpan oleh admin (bahkan jika array kosong []), hormati data pengguna!
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.map((job) => {
          const start = job.tanggal_mulai || job.tanggal || getTodayDateString();
          const end = job.tanggal_selesai || addMonths(start, 1);
          return {
            ...job,
            poster_url: repairPosterUrl(job),
            wilayah: job.wilayah || detectWilayah(job.lokasi, job.syarat),
            tanggal_mulai: start,
            tanggal_selesai: end,
            tanggal: start,
          };
        });
      }
    }

    // Cek legacy storage jika ada
    const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyStored !== null) {
      const parsed = JSON.parse(legacyStored);
      if (Array.isArray(parsed)) {
        return parsed.map((job) => {
          const start = job.tanggal_mulai || job.tanggal || getTodayDateString();
          const end = job.tanggal_selesai || addMonths(start, 1);
          return {
            ...job,
            poster_url: repairPosterUrl(job),
            wilayah: job.wilayah || detectWilayah(job.lokasi, job.syarat),
            tanggal_mulai: start,
            tanggal_selesai: end,
            tanggal: start,
          };
        });
      }
    }
  } catch (e) {
    console.warn('Gagal membaca data loker dari localStorage:', e);
  }

  // Hanya jika benar-benar pertama kali dibuka dan localStorage belum pernah disetel (null)
  return INITIAL_JOBS;
}

const JobContext = createContext(undefined);

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState(loadJobsFromStorage);
  const isInitialSyncDone = useRef(false);
  const lastSyncTimestamp = useRef(0);
  const isReceivingFromServer = useRef(false);

  // 1. Sinkronisasi dua arah real-time antara PC & HP lewat Backend Server
  useEffect(() => {
    let isMounted = true;

    async function syncWithServer() {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        const serverTime = data.updatedAt || 0;
        const serverJobs = data.jobs;
        const hasLocalCustomData = localStorage.getItem(STORAGE_KEY) !== null;

        if (Array.isArray(serverJobs)) {
          // Jika server sudah memiliki data tersimpan dan lebih baru dari sync terakhir
          if (serverTime > lastSyncTimestamp.current) {
            lastSyncTimestamp.current = serverTime;
            const cleaned = serverJobs.map((j) => ({
              ...j,
              poster_url: repairPosterUrl(j),
            }));
            isReceivingFromServer.current = true;
            setJobs(cleaned);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
            localStorage.setItem(TIME_KEY, String(serverTime));
          }
        } else if (serverJobs === null && hasLocalCustomData) {
          // Server baru dihidupkan, dan browser ini (misal di PC) memiliki data tersimpan:
          // Unggah data lokal browser ini ke server agar HP langsung tersinkronkan
          const currentLocal = loadJobsFromStorage();
          const now = Date.now();
          lastSyncTimestamp.current = now;
          localStorage.setItem(TIME_KEY, String(now));
          await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobs: currentLocal, updatedAt: now }),
          });
        }
      } catch (err) {
        // Fallback hening jika server offline
      } finally {
        isInitialSyncDone.current = true;
      }
    }

    syncWithServer();

    // Polling setiap 3 detik dan saat layar/tab aktif agar perubahan di PC seketika muncul di HP
    const interval = setInterval(syncWithServer, 3000);
    const handleFocus = () => syncWithServer();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 2. Simpan ke localStorage & push ke backend server setiap ada perubahan jobs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.warn('Gagal menyimpan data loker ke localStorage:', e);
    }

    // Jika perubahan ini berasal dari tarikan server, jangan kirim ulang ke server (cegah loop)
    if (isReceivingFromServer.current) {
      isReceivingFromServer.current = false;
      return;
    }

    // Hanya kirim jika inisialisasi awal selesai
    if (isInitialSyncDone.current) {
      const now = Date.now();
      lastSyncTimestamp.current = now;
      localStorage.setItem(TIME_KEY, String(now));

      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs, updatedAt: now }),
      }).catch(() => {});
    }
  }, [jobs]);

  const publishJob = (jobData) => {
    const start = jobData.tanggal_mulai || getTodayDateString();
    const end = jobData.tanggal_selesai || addMonths(start, 1);
    const newJob = {
      ...jobData,
      id: Date.now(),
      kategori: jobData.kategori || 'Lainnya',
      wilayah: jobData.wilayah || detectWilayah(jobData.lokasi, jobData.syarat),
      lokasi: jobData.lokasi || 'Kota Madiun',
      tipe: jobData.tipe || 'Full Time',
      tanggal_mulai: start,
      tanggal_selesai: end,
      tanggal: start,
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const publishJobs = (jobList) => {
    const newItems = jobList.map((jobData, index) => {
      const start = jobData.tanggal_mulai || getTodayDateString();
      const end = jobData.tanggal_selesai || addMonths(start, 1);
      return {
        ...jobData,
        id: Date.now() + index,
        kategori: jobData.kategori || 'Lainnya',
        wilayah: jobData.wilayah || detectWilayah(jobData.lokasi, jobData.syarat),
        lokasi: jobData.lokasi || 'Kota Madiun',
        tipe: jobData.tipe || 'Full Time',
        tanggal_mulai: start,
        tanggal_selesai: end,
        tanggal: start,
      };
    });
    setJobs((prev) => [...newItems, ...prev]);
    return newItems;
  };

  const updateJob = (id, updatedData) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === id) {
          const start = updatedData.tanggal_mulai || job.tanggal_mulai || job.tanggal || getTodayDateString();
          const end = updatedData.tanggal_selesai || job.tanggal_selesai || addMonths(start, 1);
          return {
            ...job,
            ...updatedData,
            tanggal_mulai: start,
            tanggal_selesai: end,
            tanggal: start,
          };
        }
        return job;
      })
    );
  };

  const deleteExpiredJobs = () => {
    setJobs((prev) => {
      const active = prev.filter((job) => isJobActive(job));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
      } catch (e) {}
      return active;
    });
  };

  const deleteJob = (id) => {
    setJobs((prev) => {
      const updated = prev.filter((job) => job.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteAllJobs = () => {
    setJobs([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {}
  };

  const resetJobs = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
    setJobs(INITIAL_JOBS);
  };

  return (
    <JobContext.Provider value={{ jobs, publishJob, publishJobs, updateJob, deleteJob, deleteAllJobs, resetJobs, deleteExpiredJobs }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error('useJobs harus digunakan di dalam <JobProvider>');
  return ctx;
}

export default JobContext;
