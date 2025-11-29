/**
 * Message constants for consistent user feedback
 */

export const ERROR_MESSAGES = {
  // Tenant related
  FETCH_TENANTS_FAILED: 'Gagal memuat data kantin',
  
  // Network related
  NETWORK_ERROR: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
  SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  
  // Auth related
  UNAUTHORIZED: 'Anda tidak memiliki akses. Silakan login terlebih dahulu.',
  LOGIN_FAILED: 'Login gagal. Periksa email dan password Anda.',
  REGISTER_FAILED: 'Registrasi gagal. Silakan coba lagi.',
  LOGOUT_FAILED: 'Logout gagal. Silakan coba lagi.',
  PASSWORD_MISMATCH: 'Password dan konfirmasi password tidak cocok',
  INVALID_EMAIL: 'Format email tidak valid',
  WEAK_PASSWORD: 'Password minimal 8 karakter',
} as const;

export const SUCCESS_MESSAGES = {
  FETCH_SUCCESS: 'Data berhasil dimuat',
  LOGIN_SUCCESS: 'Login berhasil! Selamat datang.',
  REGISTER_SUCCESS: 'Registrasi berhasil! Selamat datang.',
  LOGOUT_SUCCESS: 'Anda telah keluar dari sistem.',
} as const;

export const INFO_MESSAGES = {
  NO_TENANTS: 'Belum ada kantin yang tersedia saat ini',
  LOADING: 'Memuat data kantin...',
  TENANT_CLOSED: 'Kantin sedang tutup',
  TENANT_OPEN: 'Kantin sedang buka',
  LOGGING_IN: 'Sedang masuk...',
  REGISTERING: 'Sedang mendaftar...',
  LOGGING_OUT: 'Sedang keluar...',
} as const;

