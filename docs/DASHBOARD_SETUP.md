# Dashboard Setup Guide

## Backend Setup

### 1. Jalankan Migration (jika belum)
```bash
cd backend
php artisan migrate
```

### 2. Seed Data Demo
```bash
php artisan db:seed --class=DemoDataSeeder
```

### 3. Login Credentials
Setelah seeding, gunakan kredensial berikut:

**Super Admin:**
- Email: `admin@kantin.test`
- Password: `password`
- Dashboard: `/admin/dashboard`

**Tenant Admin 1 (Warung Nusantara):**
- Email: `tenant1@kantin.test`
- Password: `password`
- Dashboard: `/tenant/dashboard`

**Tenant Admin 2 (Kantin Sehat):**
- Email: `tenant2@kantin.test`
- Password: `password`
- Dashboard: `/tenant/dashboard`

**Customer:**
- Email: `customer1@kantin.test` - `customer5@kantin.test`
- Password: `password`
- Dashboard: `/customer/dashboard`

## Frontend Setup

### 1. Install Dependencies (jika belum)
```bash
cd frontend
npm install
```

### 2. Jalankan Development Server
```bash
npm run dev
```

### 3. Akses Dashboard
- Buka browser: `http://localhost:5173`
- Login dengan salah satu kredensial di atas
- Akan otomatis redirect ke dashboard sesuai role

## Fitur Dashboard

### Admin Dashboard (`/admin/dashboard`)
✅ Statistik keseluruhan sistem:
- Total Kantin
- Total Users
- Total Orders
- Total Revenue

✅ Tabel Kantin Terbaru:
- Nama kantin
- Pemilik
- Jam operasional
- Jumlah menu & order

✅ Tabel Pesanan Terbaru:
- ID order
- Customer
- Kantin
- Total harga
- Status order & payment
- Waktu

### Tenant Dashboard (`/tenant/dashboard`)
✅ Statistik kantin:
- Pesanan Hari Ini
- Pendapatan Hari Ini
- Menu Aktif
- Pesanan Pending

✅ Pesanan Perlu Diproses:
- Card pesanan dengan status "created"
- Tombol Terima/Tolak
- Detail items & customer

✅ Menu Kantin:
- Grid menu dengan foto
- Harga & stok
- Tombol edit & toggle availability

✅ Riwayat Pesanan:
- Tabel pesanan terbaru
- Status & waktu
- Link ke halaman detail

### Customer Dashboard (`/customer/dashboard`)
✅ Statistik customer:
- Total Pesanan
- Pesanan Aktif
- Pesanan Selesai
- Total Pengeluaran

✅ Order Progress Tracker:
- Visual progress bar (Dibuat → Diproses → Siap)
- Real-time status update
- Animated active step

✅ Pesanan Aktif:
- Card pesanan dengan progress tracker
- Tombol Bayar (jika belum bayar)
- Tombol Sudah Diambil (jika ready)
- Detail items & total

✅ Riwayat Pesanan:
- Tabel 5 pesanan terbaru
- Status & tanggal
- Link ke halaman detail lengkap

✅ Halaman Pesanan Saya (`/customer/orders`):
- Daftar semua pesanan
- Filter & status badges
- Modal detail pesanan
- Action buttons (Bayar, Pickup, Complete)

## API Endpoints

### Admin Endpoints
```
GET  /api/v1/admin/stats          - Dashboard statistics
GET  /api/v1/admin/tenants        - List all tenants
GET  /api/v1/admin/users          - List all users
GET  /api/v1/admin/orders         - List all orders
GET  /api/v1/admin/activities     - Recent activities
PATCH /api/v1/admin/users/{id}/role - Update user role
DELETE /api/v1/admin/users/{id}   - Delete user
DELETE /api/v1/admin/tenants/{id} - Delete tenant
```

### Tenant Endpoints
```
GET  /api/v1/tenant/stats         - Tenant statistics
GET  /api/v1/tenant/info          - Tenant info
GET  /api/v1/tenant/menus         - List menus
POST /api/v1/tenant/menus         - Create menu
PATCH /api/v1/tenant/menus/{id}   - Update menu
DELETE /api/v1/tenant/menus/{id}  - Delete menu
PATCH /api/v1/tenant/menus/{id}/stock - Update stock
GET  /api/v1/tenant/orders        - List orders
PATCH /api/v1/tenant/orders/{id}/status - Update order status
```

### Customer Endpoints
```
GET  /api/v1/customer/stats       - Customer statistics
GET  /api/v1/orders               - List customer orders
GET  /api/v1/orders/{id}          - Order detail
POST /api/v1/orders               - Create order
POST /api/v1/orders/{id}/pay      - Pay order
POST /api/v1/orders/{id}/pickup   - Mark picked up
POST /api/v1/orders/{id}/complete - Complete order
```

## Testing

### Test Admin Dashboard
1. Login sebagai admin: `admin@kantin.test`
2. Lihat statistik keseluruhan
3. Cek daftar tenant & orders

### Test Tenant Dashboard
1. Login sebagai tenant: `tenant1@kantin.test`
2. Lihat statistik kantin
3. Terima pesanan pending
4. Lihat daftar menu

### Test Order Flow (Complete Cycle)
1. **Customer - Browse & Order**
   - Login: `customer1@kantin.test`
   - Browse kantin di homepage
   - Tambah menu ke cart
   - Checkout order
   - Lihat di dashboard → pesanan status "Dibuat"

2. **Customer - Payment**
   - Klik tombol "Bayar" di dashboard
   - Konfirmasi pembayaran
   - Status berubah jadi "Pending/Paid"

3. **Tenant - Process Order**
   - Login: `tenant1@kantin.test`
   - Lihat pesanan pending di dashboard
   - Klik "Terima" untuk mulai proses
   - Status berubah jadi "Diproses"
   - Progress tracker customer update otomatis

4. **Tenant - Ready for Pickup**
   - Setelah selesai masak
   - Update status ke "Siap Diambil"
   - Customer dapat notifikasi (via progress tracker)

5. **Customer - Pickup**
   - Login kembali sebagai customer
   - Lihat pesanan status "Siap Diambil"
   - Klik "Sudah Diambil" setelah ambil pesanan
   - Progress tracker update ke step terakhir

6. **Customer - Complete**
   - Klik "Selesai" untuk complete order
   - Order masuk ke riwayat
   - Stats dashboard update

## Troubleshooting

### Error: "Tenant not found"
- Pastikan user tenant_admin sudah memiliki tenant
- Cek relasi di database: `users.id = tenants.user_id`

### Error: "Unauthorized"
- Pastikan token valid di localStorage
- Cek role user sesuai dengan endpoint yang diakses

### Data tidak muncul
- Cek console browser untuk error
- Cek network tab untuk response API
- Pastikan backend running di `http://localhost:8000`

## Next Steps

Fitur yang bisa ditambahkan:
- [ ] Export laporan (PDF/Excel)
- [ ] Real-time notifications
- [ ] Chart & grafik statistik
- [ ] Filter & search advanced
- [ ] Bulk operations
- [ ] Image upload untuk menu
- [ ] Rating & review system
