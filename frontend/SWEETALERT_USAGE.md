# SweetAlert2 Usage Guide

Aplikasi ini menggunakan SweetAlert2 untuk menampilkan alert yang lebih menarik dan user-friendly.

## Import

```typescript
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo, 
  showConfirm, 
  showDeleteConfirm,
  showToast,
  showLoading,
  closeAlert
} from '../utils/sweetAlert';
```

## Fungsi yang Tersedia

### 1. Success Alert
```typescript
await showSuccess('Pesanan berhasil dibuat!');
await showSuccess('Data berhasil disimpan!', 'Berhasil!');
```

### 2. Error Alert
```typescript
showError('Gagal menyimpan data');
showError('Terjadi kesalahan', 'Error!');
```

### 3. Warning Alert
```typescript
showWarning('Stok tidak cukup', 'Peringatan!');
```

### 4. Info Alert
```typescript
showInfo('Fitur akan segera hadir', 'Informasi');
```

### 5. Confirmation Dialog
```typescript
const result = await showConfirm(
  'Data akan dihapus secara permanen.',
  'Yakin ingin menghapus?',
  'Ya, Hapus',
  'Batal'
);

if (result.isConfirmed) {
  // User clicked "Ya, Hapus"
  deleteData();
}
```

### 6. Delete Confirmation (dengan styling khusus)
```typescript
const result = await showDeleteConfirm(
  'Data yang dihapus tidak dapat dikembalikan!',
  'Hapus data ini?'
);

if (result.isConfirmed) {
  // User confirmed deletion
  deleteData();
}
```

### 7. Toast Notification (notifikasi kecil di pojok)
```typescript
showToast('Berhasil menyimpan!', 'success');
showToast('Terjadi kesalahan', 'error');
showToast('Peringatan!', 'warning');
showToast('Informasi', 'info');
```

### 8. Loading Alert
```typescript
showLoading('Memproses data...');

// Lakukan operasi async
await saveData();

// Tutup loading
closeAlert();
```

## Contoh Penggunaan dalam Komponen

```vue
<script setup lang="ts">
import { showSuccess, showError, showConfirm } from '../utils/sweetAlert';

const handleDelete = async (id: number) => {
  const result = await showConfirm(
    'Item akan dihapus secara permanen.',
    'Yakin ingin menghapus?',
    'Ya, Hapus',
    'Batal'
  );
  
  if (result.isConfirmed) {
    try {
      await api.delete(`/items/${id}`);
      await showSuccess('Item berhasil dihapus!');
      fetchItems();
    } catch (error) {
      showError('Gagal menghapus item');
    }
  }
};
</script>
```

## Styling

SweetAlert2 sudah dikonfigurasi dengan warna tema aplikasi:
- Primary: `#667eea`
- Success: `#48bb78`
- Error: `#f56565`
- Warning: `#ed8936`
- Info: `#4299e1`

## Tips

1. Gunakan `await` untuk `showSuccess`, `showConfirm`, dan `showDeleteConfirm` jika Anda perlu menunggu user menutup alert
2. Gunakan `showToast` untuk notifikasi yang tidak mengganggu
3. Jangan lupa `closeAlert()` setelah `showLoading()`
4. Untuk konfirmasi delete, gunakan `showDeleteConfirm` untuk styling yang konsisten
