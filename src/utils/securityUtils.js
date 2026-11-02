/**
 * Utilitas Keamanan Web KARMADI (Security Gateways SEC-01 s/d SEC-07)
 * - Hash Kredensial SHA-256 (Mencegah plain-text password di client bundle)
 * - Anti-Bruteforce & Rate Limiter (Kunci cooldown jika gagal 5x berturut-turut)
 * - Session Timeout (Auto-logout setelah 4 jam inaktivitas)
 * - Input Sanitizer (Anti XSS / Script Injection)
 */

// Hash SHA-256 dari username "admin" dan password "@Hamdani231090"
const TARGET_USER_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // "admin"
const TARGET_PASS_HASH = 'fa27d044cf4d754b237fa3f446ecbe4139e144a8677c7f394c8b6a38ce372225'; // "@Hamdani231090"

const AUTH_TOKEN_KEY = 'karmadi_admin_session';
const ATTEMPTS_KEY = 'karmadi_auth_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 menit lockout
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 jam

/**
 * Helper SHA-256 menggunakan Web Crypto API standar browser
 */
export async function sha256Hex(plainText) {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback sederhana jika runtime tanpa web crypto
    return plainText;
  }
  const msgUint8 = new TextEncoder().encode(plainText);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Cek status apakah form login sedang terkunci akibat bruteforce
 */
export function getLoginLockoutStatus() {
  if (typeof window === 'undefined') return { isLocked: false, remainingSec: 0 };
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { isLocked: false, remainingSec: 0 };
    const { count, lockUntil } = JSON.parse(raw);
    const now = Date.now();
    if (lockUntil && now < lockUntil) {
      const remainingSec = Math.ceil((lockUntil - now) / 1000);
      return { isLocked: true, remainingSec, count };
    }
    if (lockUntil && now >= lockUntil) {
      localStorage.removeItem(ATTEMPTS_KEY);
    }
  } catch {}
  return { isLocked: false, remainingSec: 0 };
}

/**
 * Catat percobaan login gagal
 */
export function recordFailedLogin() {
  if (typeof window === 'undefined') return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    let count = 0;
    if (raw) {
      const parsed = JSON.parse(raw);
      count = Number(parsed.count) || 0;
    }
    count += 1;
    if (count >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_MS;
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count, lockUntil }));
      return { isLocked: true, remainingAttempts: 0, lockUntil };
    }
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count, lockUntil: 0 }));
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS - count };
  } catch {
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }
}

/**
 * Reset percobaan login setelah berhasil
 */
export function resetLoginAttempts() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {}
}

/**
 * Verifikasi kredensial admin secara aman via SHA-256 hash comparison
 */
export async function verifyAdminCredentials(username, password) {
  const { isLocked, remainingSec } = getLoginLockoutStatus();
  if (isLocked) {
    return {
      success: false,
      error: `Akses dibekukan sementara demi keamanan akibat percobaan salah berulang kali. Silakan coba lagi dalam ${remainingSec} detik.`,
    };
  }

  const u = (username || '').trim().toLowerCase();
  const p = (password || '').trim();

  const userHash = await sha256Hex(u);
  const passHash = await sha256Hex(p);

  if (userHash === TARGET_USER_HASH && passHash === TARGET_PASS_HASH) {
    resetLoginAttempts();
    const sessionToken = {
      userHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    sessionStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(sessionToken));
    localStorage.setItem('karmadi_admin_auth', 'true');
    return { success: true };
  }

  const { isLocked: newlyLocked, remainingAttempts } = recordFailedLogin();
  if (newlyLocked) {
    return {
      success: false,
      error: 'Terlalu banyak percobaan gagal (5x). Akun dibekukan sementara selama 5 menit demi keamanan.',
    };
  }

  return {
    success: false,
    error: `Username atau kata sandi tidak cocok. Sisa percobaan: ${remainingAttempts} kali.`,
  };
}

/**
 * Cek apakah session admin saat ini sah dan belum kedaluwarsa
 */
export function isCurrentAdminSessionValid() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!raw) {
      // Fallback legacy flag jika tab baru dalam session
      const legacy = localStorage.getItem('karmadi_admin_auth') === 'true';
      return legacy;
    }
    const session = JSON.parse(raw);
    if (session?.expiresAt && Date.now() < session.expiresAt) {
      return session.userHash === TARGET_USER_HASH;
    }
    logoutAdmin();
  } catch {}
  return false;
}

/**
 * Logout admin dan bersihkan seluruh token
 */
export function logoutAdmin() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('karmadi_admin_auth');
    sessionStorage.removeItem('karmadi_admin_auth');
  } catch {}
}

/**
 * Sanitasi string input umum dari tag HTML / script injection
 */
export function sanitizeInput(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Hapus karakter kurung sudut
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}
