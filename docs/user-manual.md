# 📖 User Manual - Kantin RK ITERA

## 📋 Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Akses Aplikasi](#akses-aplikasi)
3. [Panduan Customer](#panduan-customer)
4. [Panduan Tenant Admin](#panduan-tenant-admin)
5. [Panduan Super Admin](#panduan-super-admin)
6. [FAQ](#faq)
7. [Troubleshooting](#troubleshooting)

---

## Pengenalan

**Kantin RK ITERA** adalah aplikasi pemesanan makanan dan minuman berbasis web untuk kantin Rumah Kayu ITERA. Aplikasi ini memudahkan mahasiswa dan staff untuk memesan makanan secara online dengan sistem yang cepat dan praktis.

### Fitur Utama

✅ **Untuk Customer (Pembeli)**:
- Browse daftar kantin dan menu
- Tambah menu ke keranjang
- Checkout dan buat pesanan
- Pembayaran online
- Track status pesanan real-time
- Riwayat pesanan

✅ **Untuk Tenant Admin (Pemilik Kantin)**:
- Kelola menu (tambah, edit, hapus)
- Update stok menu
- Terima dan proses pesanan
- Update status pesanan
- Dashboard analytics

✅ **Untuk Super Admin**:
- Kelola semua tenant
- Monitor sistem
- Manage users

---

## Akses Aplikasi

### URL Aplikasi

**Frontend**: https://kantin-rk-frontend-xxxxx.asia-southeast2.run.app  
**Backend API**: https://kantin-backend-104030083079.asia-southeast2.run.app

### Browser yang Didukung

- ✅ Google Chrome (Recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ⚠️ Internet Explorer (Tidak didukung)

### Persyaratan Sistem

- **Internet**: Koneksi internet stabil
- **Device**: Desktop, laptop, tablet, atau smartphone
- **RAM**: Minimal 2GB
- **Screen Resolution**: Minimal 320px width

---

## Panduan Customer

### 1. Registrasi Akun

#### Langkah-langkah:

1. **Buka aplikasi** di browser
2. **Klik tombol "Login"** di pojok kanan atas
3. **Klik "Register"** atau link "Daftar di sini"
4. **Isi form registrasi**:
   - Nama Lengkap
   - Email (gunakan email aktif)
   - Password (minimal 8 karakter)
   - Konfirmasi Password
5. **Klik "Daftar"**
6. **Otomatis login** dan redirect ke Dashboard Customer

#### Tips:
- ✅ Gunakan email yang valid dan aktif
- ✅ Password minimal 8 karakter, kombinasi huruf dan angka
- ✅ Ingat password Anda untuk login berikutnya

---

### 2. Login

#### Langkah-langkah:

1. **Klik "Login"** di navbar
2. **Masukkan**:
   - Email yang sudah terdaftar
   - Password
3. **Klik "Masuk"**
4. **Redirect ke Dashboard**

#### Lupa Password?
Hubungi admin untuk reset password.

---

### 3. Browse & Pilih Menu

#### Cara Melihat Menu:

1. **Di Homepage**, lihat daftar kantin yang tersedia
2. **Klik kantin** yang ingin dipesan
3. **Browse menu** yang tersedia
4. **Filter menu** berdasarkan kategori (jika ada):
   - Makanan Utama
   - Snack
   - Minuman
   - Dessert

#### Informasi Menu:
- 📷 Foto menu (jika tersedia)
- 📝 Nama menu
- 💰 Harga
- 📦 Stok tersedia
- 🏷️ Kategori

---

### 4. Tambah ke Keranjang

#### Langkah-langkah:

1. **Klik menu** yang ingin dipesan
2. **Atur jumlah** menggunakan tombol + / -
3. **Klik "Tambah ke Keranjang"**
4. **Keranjang** akan muncul di sidebar kanan
5. **Ulangi** untuk menu lain (dari kantin yang sama)

#### Catatan Penting:
- ⚠️ **Satu pesanan hanya bisa dari satu kantin**
- ⚠️ Jika ingin pesan dari kantin lain, selesaikan pesanan sekarang dulu
- ⚠️ Stok terbatas, pesan sebelum kehabisan!

---

### 5. Review & Checkout

#### Langkah-langkah:

1. **Buka keranjang** (klik icon 🛒 atau sidebar cart)
2. **Review pesanan**:
   - Check nama menu
   - Check jumlah
   - Check total harga
3. **Edit jumlah** jika perlu (+ / -)
4. **Hapus item** jika tidak jadi (icon 🗑️)
5. **Pilih tipe pesanan**:
   - 🚶 Pickup (Ambil Sendiri)
   - 🏍️ Delivery (Diantar) - jika tersedia
6. **Klik "Checkout"** atau "Buat Pesanan"

---

### 6. Pembayaran

#### Langkah-langkah:

1. Setelah checkout, **pesanan dibuat** dengan status "Dibuat"
2. **Lihat detail pesanan**:
   - Order ID
   - Total pembayaran
   - Items yang dipesan
3. **Klik "Bayar"**
4. **Konfirmasi pembayaran**
5. Status berubah menjadi **"Lunas"**

#### Metode Pembayaran:
- 💳 Tunai (bayar langsung ke kasir)
- 📱 Transfer Bank (future)
- 💸 E-Wallet (future)

---

### 7. Track Pesanan

#### Status Pesanan:

| Status | Keterangan | Apa yang harus dilakukan |
|--------|------------|--------------------------|
| 🟡 **Dibuat** | Pesanan baru dibuat | Tunggu tenant memproses |
| 🔵 **Sedang Diproses** | Tenant sedang menyiapkan | Tunggu sebentar |
| 🟢 **Siap Diambil** | Pesanan sudah siap | Datang ke kantin & ambil pesanan |
| 🟣 **Sudah Diambil** | Pesanan sudah Anda terima | Klik "Selesai" jika sudah OK |
| ✅ **Selesai** | Pesanan selesai | - |
| 🔴 **Dibatalkan** | Pesanan dibatalkan | - |

#### Cara Track:

1. **Buka "Pesanan Saya"** di menu
2. **Lihat daftar pesanan** (terbaru di atas)
3. **Klik "Detail"** untuk info lengkap
4. **Refresh halaman** untuk update status

---

### 8. Ambil Pesanan (Pickup)

#### Langkah-langkah:

1. **Tunggu notifikasi** atau check status menjadi "Siap Diambil"
2. **Datang ke kantin** yang bersangkutan
3. **Tunjukkan Order ID** ke kasir/staff
4. **Terima pesanan** Anda
5. **Klik "Sudah Diambil"** di aplikasi
6. **Klik "Selesai"** setelah selesai makan

#### Tips:
- 📱 Siapkan Order ID atau screenshot
- ⏰ Ambil pesanan tepat waktu (max 30 menit setelah siap)
- ✅ Check pesanan sebelum meninggalkan kantin

---

### 9. Riwayat Pesanan

#### Cara Akses:

1. **Login ke akun**
2. **Klik "Pesanan Saya"** atau "Riwayat"
3. **Lihat semua pesanan** (terbaru → terlama)
4. **Filter** berdasarkan status (jika ada)
5. **Klik detail** untuk info lengkap

#### Informasi yang Ditampilkan:
- 🆔 Order ID
- 📅 Tanggal & waktu
- 🏪 Nama kantin
- 📋 Daftar menu
- 💰 Total harga
- 📊 Status pesanan
- 💳 Status pembayaran

---

### 10. Logout

#### Langkah-langkah:

1. **Klik profile** di pojok kanan atas
2. **Klik "Logout"**
3. **Konfirmasi logout**
4. **Redirect ke homepage**

---

## Panduan Tenant Admin

### 1. Login sebagai Tenant Admin

#### Credentials:
- **Email**: Diberikan oleh admin sistem
- **Password**: Set saat pertama kali login

#### Langkah-langkah:
1. **Buka aplikasi**
2. **Klik "Login"**
3. **Masukkan email & password** tenant admin
4. **Auto redirect** ke Dashboard Tenant

---

### 2. Dashboard Tenant

#### Fitur Dashboard:

**📊 Statistics Cards**:
- Total Pesanan Hari Ini
- Pesanan Aktif
- Total Pendapatan
- Menu Tersedia

**📦 Pesanan Aktif**:
- List pesanan yang perlu diproses
- Quick actions untuk update status

**🍽️ Menu Management**:
- Daftar menu
- Quick edit stok
- Add/Edit/Delete menu

---

### 3. Kelola Menu

#### 3.1. Tambah Menu Baru

**Langkah-langkah**:

1. **Buka "Menu"** di sidebar
2. **Klik "➕ Tambah Menu"**
3. **Isi form**:
   - **Nama Menu** (required)
   - **Kategori** (optional): main, snack, drink, dessert
   - **Harga** (required, dalam Rupiah)
   - **Stok** (required, jumlah tersedia)
   - **URL Foto** (optional, link gambar)
4. **Klik "Tambah"**
5. **Menu baru** muncul di list

**Tips**:
- ✅ Nama menu yang jelas dan menarik
- ✅ Set harga yang tepat
- ✅ Upload foto untuk menarik pembeli
- ✅ Set stok realistis

---

#### 3.2. Edit Menu

**Langkah-langkah**:

1. **Buka "Menu"**
2. **Cari menu** yang ingin diedit
3. **Klik icon ✏️ Edit**
4. **Ubah informasi** yang perlu
5. **Klik "Simpan"**

**Yang Bisa Diedit**:
- Nama menu
- Harga
- Kategori
- Foto URL
- Stok

---

#### 3.3. Update Stok

**Cara Cepat** (di list menu):

1. **Di halaman Menu**
2. **Lihat kolom "Stok"**
3. **Edit angka** langsung di input box
4. **Tab / Klik di luar** untuk save otomatis

**Cara Manual** (via Edit):

1. **Klik Edit menu**
2. **Ubah stok**
3. **Save**

**Tips Update Stok**:
- 🔄 Update di awal hari
- 🔄 Update saat habis/restock
- 🔄 Set 0 jika sedang tidak tersedia

---

#### 3.4. Hapus Menu

**Langkah-langkah**:

1. **Klik icon 🗑️ Hapus**
2. **Konfirmasi** penghapusan
3. **Menu terhapus** dari list

**Catatan**:
- ⚠️ Menu yang sudah dihapus tidak bisa dikembalikan
- ⚠️ Order history tetap menyimpan info menu yang sudah dihapus

---

### 4. Kelola Pesanan

#### 4.1. Melihat Pesanan Masuk

**Langkah-langkah**:

1. **Buka "Pesanan"** di sidebar
2. **Lihat list pesanan** (terbaru di atas)
3. **Filter by status** (optional):
   - Semua
   - Dibuat (baru masuk)
   - Sedang Diproses
   - Siap Diambil
   - Selesai

#### 4.2. Proses Pesanan

**Workflow Tenant**:

```
Dibuat → Sedang Diproses → Siap Diambil
```

**Langkah-langkah**:

1. **Pesanan baru masuk** (status: Dibuat)
2. **Klik "Proses"** atau ubah status ke "Sedang Diproses"
   - Mulai siapkan pesanan
3. **Setelah selesai**, klik "Siap Diambil"
   - Customer akan mendapat notifikasi
4. **Customer datang** dan ambil pesanan
5. **Customer klik "Sudah Diambil"**
6. **Status otomatis** jadi "Sudah Diambil"
7. **Customer klik "Selesai"**
8. **Order completed** ✅

---

#### 4.3. Update Status Pesanan

**Langkah-langkah**:

1. **Buka detail pesanan**
2. **Klik dropdown status**
3. **Pilih status baru**:
   - Sedang Diproses (dari Dibuat)
   - Siap Diambil (dari Sedang Diproses)
4. **Konfirmasi**
5. **Status updated**

**Valid Transitions**:
- ✅ Dibuat → Sedang Diproses
- ✅ Sedang Diproses → Siap Diambil
- ❌ Dibuat → Siap Diambil (skip, tidak boleh)

---

#### 4.4. Lihat Detail Pesanan

**Informasi yang Ditampilkan**:

- 🆔 Order ID
- 👤 Nama customer
- 📅 Tanggal & waktu order
- 📋 **Daftar menu** yang dipesan:
  - Nama menu
  - Jumlah
  - Harga satuan
  - Subtotal
- 💰 Total harga
- 💳 Status pembayaran
- 📊 Status pesanan

---

### 5. Laporan & Analytics (Future)

Fitur ini akan hadir di versi mendatang:
- 📊 Laporan penjualan harian/bulanan
- 📈 Grafik trend penjualan
- 🏆 Menu terlaris
- 💰 Total revenue
- 📥 Export data (PDF/Excel)

---

## Panduan Super Admin

### 1. Login Super Admin

**Credentials**: Diberikan oleh sistem

#### Akses:
- Dashboard Admin
- Kelola semua tenant
- Kelola users
- System monitoring

### 2. Kelola Tenant

#### Tambah Tenant Baru:

1. **Buka Admin Dashboard**
2. **Klik "Tenants"**
3. **Klik "Tambah Tenant"**
4. **Isi form**:
   - Nama Tenant
   - Email Admin Tenant
   - Jam Buka
   - Jam Tutup
5. **Save**
6. **Email credentials** dikirim ke admin tenant

#### Edit/Hapus Tenant:

- Edit: Ubah info tenant (nama, jam operasional)
- Hapus: Nonaktifkan tenant (soft delete)

### 3. Kelola Users

- View all users
- Edit user roles
- Reset password
- Deactivate/Activate users

### 4. Monitor System

- View all orders (cross-tenant)
- System logs
- Performance metrics
- Error tracking

---

## FAQ

### ❓ Bagaimana cara membatalkan pesanan?

**Jawab**: Saat ini belum ada fitur cancel otomatis. Hubungi tenant langsung atau admin sistem.

---

### ❓ Apakah bisa pesan dari 2 kantin sekaligus?

**Jawab**: Tidak. Satu pesanan hanya bisa dari satu kantin. Selesaikan pesanan pertama dulu, baru buat pesanan baru dari kantin lain.

---

### ❓ Bagaimana jika stok habis setelah saya tambah ke keranjang?

**Jawab**: Saat checkout, sistem akan validasi stok. Jika habis, akan muncul pesan error dan Anda perlu kurangi jumlah atau hapus item tersebut.

---

### ❓ Apakah data saya aman?

**Jawab**: Ya! Kami menggunakan:
- 🔒 HTTPS encryption
- 🔐 JWT authentication
- 🗄️ Secure database
- 🚫 No sensitive data storage

---

### ❓ Bagaimana cara menghubungi support?

**Jawab**: 
- 📧 Email: support@kantin-rk.itera.ac.id
- 📱 WhatsApp: [Admin Contact]
- 🏫 Visit: Kantin Rumah Kayu ITERA

---

### ❓ Apakah ada biaya admin/service fee?

**Jawab**: Tidak ada biaya tambahan. Harga yang tertera sudah final.

---

### ❓ Berapa lama pesanan diproses?

**Jawab**: Tergantung kompleksitas menu dan antrian, rata-rata 10-15 menit.

---

### ❓ Apakah bisa edit pesanan setelah checkout?

**Jawab**: Tidak bisa edit via aplikasi. Hubungi tenant langsung sebelum mereka mulai proses.

---

## Troubleshooting

### 🔴 Tidak Bisa Login

**Kemungkinan Penyebab**:
- Email/password salah
- Akun belum diaktifkan
- Browser issue

**Solusi**:
1. ✅ Check email & password (case-sensitive)
2. ✅ Clear browser cache & cookies
3. ✅ Try different browser
4. ✅ Reset password (hubungi admin)

---

### 🔴 Menu Tidak Muncul

**Kemungkinan Penyebab**:
- Koneksi internet lambat
- Server down
- Browser cache

**Solusi**:
1. ✅ Refresh halaman (F5 / Ctrl+R)
2. ✅ Check koneksi internet
3. ✅ Clear browser cache
4. ✅ Hubungi admin jika persisten

---

### 🔴 Pesanan Tidak Masuk

**Kemungkinan Penyebab**:
- Koneksi terputus saat submit
- Server error
- Stok habis

**Solusi**:
1. ✅ Check "Pesanan Saya" apakah ada
2. ✅ Check email konfirmasi (jika ada)
3. ✅ Hubungi tenant untuk konfirmasi
4. ✅ Screenshot error jika ada

---

### 🔴 Pembayaran Gagal

**Kemungkinan Penyebab**:
- Connection timeout
- Payment gateway error

**Solusi**:
1. ✅ Refresh & try again
2. ✅ Check order status
3. ✅ Hubungi admin jika sudah terpotong

---

### 🔴 Tidak Bisa Upload Foto Menu

**Kemungkinan Penyebab**:
- URL foto tidak valid
- Format tidak didukung

**Solusi**:
1. ✅ Upload foto ke image hosting (imgur, cloudinary)
2. ✅ Copy URL gambar
3. ✅ Paste di field Photo URL
4. ✅ Make sure URL ends with .jpg/.png

---

### 🔴 Halaman Lambat Loading

**Solusi**:
1. ✅ Check koneksi internet
2. ✅ Close tab lain yang berat
3. ✅ Clear browser cache
4. ✅ Try incognito/private mode
5. ✅ Restart browser

---

## Kontak & Support

### 📧 Email Support
**support@kantin-rk.itera.ac.id**

### 📱 WhatsApp Support
**[Admin Phone Number]**

### 🏫 Kantor
**Kantin Rumah Kayu, Institut Teknologi Sumatera**

### ⏰ Jam Support
- Senin - Jumat: 08:00 - 17:00
- Sabtu: 08:00 - 12:00
- Minggu & Libur: Closed

---

## Tips & Best Practices

### 🎯 Untuk Customer:

1. ✅ **Pesan di jam non-peak** untuk proses lebih cepat
2. ✅ **Check stok** sebelum datang
3. ✅ **Ambil pesanan** tepat waktu
4. ✅ **Lengkapi profil** untuk pengalaman lebih baik
5. ✅ **Provide feedback** untuk perbaikan

### 🎯 Untuk Tenant Admin:

1. ✅ **Update stok** di awal hari
2. ✅ **Upload foto menu** untuk menarik pembeli
3. ✅ **Proses pesanan** secepat mungkin
4. ✅ **Update status** real-time
5. ✅ **Respond** ke customer dengan baik

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2025 | Initial release |

---

## Feedback

Kami sangat menghargai feedback Anda untuk perbaikan aplikasi.

**Kirim feedback ke**:
- 📧 Email: feedback@kantin-rk.itera.ac.id
- 📝 Form: [Google Form Link]

---

**Terima kasih telah menggunakan Kantin RK ITERA! 🎉**

**Selamat memesan & menikmati makanan! 🍽️**

