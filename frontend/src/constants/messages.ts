/**
 * Message constants for consistent user feedback
 */

export const ERROR_MESSAGES = {
  FETCH_TENANTS_FAILED: 'Gagal memuat data kantin',
  NETWORK_ERROR: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
  UNAUTHORIZED: 'Anda tidak memiliki akses. Silakan login terlebih dahulu.',
  SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
} as const;

export const SUCCESS_MESSAGES = {
  FETCH_SUCCESS: 'Data berhasil dimuat',
} as const;

export const INFO_MESSAGES = {
  NO_TENANTS: 'Belum ada kantin yang tersedia saat ini',
  LOADING: 'Memuat data kantin...',
  TENANT_CLOSED: 'Kantin sedang tutup',
  TENANT_OPEN: 'Kantin sedang buka',
} as const;

