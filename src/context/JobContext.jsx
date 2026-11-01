import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { detectWilayah } from '../utils/regionUtils';
import { getTodayDateString, addMonths, isJobActive } from '../utils/dateUtils';
import bundledJobsData from '../../data/jobs.json';

const STORAGE_KEY = 'karmadi_jobs';
const LEGACY_STORAGE_KEY = 'sicaker_jobs';
const TIME_KEY = 'karmadi_jobs_time';

// Database lowongan kerja aktif Karmadi (Terhubung otomatis ke data/jobs.json)
const INITIAL_JOBS = Array.isArray(bundledJobsData?.jobs) ? bundledJobsData.jobs : [];
const BUNDLED_UPDATED_AT = Number(bundledJobsData?.updatedAt || 0);

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

function normalizeJobList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((job) => {
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

function loadJobsFromStorage() {
  try {
    const localTime = Number(localStorage.getItem(TIME_KEY) || 0);
    // Jika versi data/jobs.json dari server/deploy lebih baru daripada cache browser, gunakan data terbaru dari bundel
    if (BUNDLED_UPDATED_AT > localTime) {
      const normalized = normalizeJobList(INITIAL_JOBS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      localStorage.setItem(TIME_KEY, String(BUNDLED_UPDATED_AT));
      return normalized;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return normalizeJobList(parsed);
      }
    }

    const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyStored !== null) {
      const parsed = JSON.parse(legacyStored);
      if (Array.isArray(parsed)) {
        return normalizeJobList(parsed);
      }
    }
  } catch (e) {
    console.warn('Gagal membaca data loker dari localStorage:', e);
  }

  return normalizeJobList(INITIAL_JOBS);
}

const JobContext = createContext(undefined);

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState(loadJobsFromStorage);
  const isInitialSyncDone = useRef(false);
  const lastSyncTimestamp = useRef(Number(localStorage.getItem(TIME_KEY) || BUNDLED_UPDATED_AT || 0));
  const isReceivingFromServer = useRef(false);

  // 1. Sinkronisasi dua arah real-time antara PC (localhost /api/jobs) & Web Publik (/jobs.json)
  useEffect(() => {
    let isMounted = true;

    async function syncWithServer() {
      try {
        let data = null;
        const isLocalDev =
          typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (isLocalDev) {
          const res = await fetch('/api/jobs');
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            data = await res.json();
          }
        } else {
          const res = await fetch(`/jobs.json?t=${Date.now()}`, { cache: 'no-store' });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            data = await res.json();
          }
        }

        if (!isMounted || !data) return;

        const serverTime = Number(data.updatedAt || 0);
        const serverJobs = data.jobs;

        if (Array.isArray(serverJobs) && serverTime > lastSyncTimestamp.current) {
          lastSyncTimestamp.current = serverTime;
          const cleaned = normalizeJobList(serverJobs);
          isReceivingFromServer.current = true;
          setJobs(cleaned);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          localStorage.setItem(TIME_KEY, String(serverTime));
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

      const isLocalHost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const saveEndpoint = isLocalHost ? '/api/jobs' : 'http://localhost:5173/api/jobs';

      fetch(saveEndpoint, {
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
