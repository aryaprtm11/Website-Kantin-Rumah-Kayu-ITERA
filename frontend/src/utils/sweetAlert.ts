import Swal from 'sweetalert2';

/**
 * SweetAlert2 Utility Helper
 * Provides consistent alert styling across the application
 */

// Custom theme colors
const theme = {
  primary: '#667eea',
  success: '#48bb78',
  error: '#f56565',
  warning: '#ed8936',
  info: '#4299e1',
};

/**
 * Success Alert
 */
export const showSuccess = (message: string, title: string = 'Berhasil!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: theme.success,
    timer: 3000,
    timerProgressBar: true,
  });
};

/**
 * Error Alert
 */
export const showError = (message: string, title: string = 'Gagal!') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: theme.error,
  });
};

/**
 * Warning Alert
 */
export const showWarning = (message: string, title: string = 'Peringatan!') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: theme.warning,
  });
};

/**
 * Info Alert
 */
export const showInfo = (message: string, title: string = 'Informasi') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: theme.info,
  });
};

/**
 * Confirmation Dialog
 */
export const showConfirm = (
  message: string,
  title: string = 'Apakah Anda yakin?',
  confirmText: string = 'Ya',
  cancelText: string = 'Batal'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: theme.primary,
    cancelButtonColor: theme.error,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};

/**
 * Delete Confirmation Dialog
 */
export const showDeleteConfirm = (
  message: string = 'Data yang dihapus tidak dapat dikembalikan!',
  title: string = 'Hapus data ini?'
) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: theme.error,
    cancelButtonColor: '#718096',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
  });
};

/**
 * Loading Alert
 */
export const showLoading = (message: string = 'Memproses...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close any open alert
 */
export const closeAlert = () => {
  Swal.close();
};

/**
 * Toast notification (small notification at top-right)
 */
export const showToast = (
  message: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'success'
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title: message,
  });
};
