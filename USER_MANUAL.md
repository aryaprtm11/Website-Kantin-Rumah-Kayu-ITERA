# Panduan Pengguna Sistem Pemesanan Kantin Rumah Kayu (RK)

Panduan ini membantu Anda menggunakan website pemesanan kantin, baik sebagai **Customer** (pembeli), **Tenant Admin** (pemilik kantin), maupun **Super Admin** (pengelola sistem).

## Persiapan Awal

1.  Buka website aplikasi Kantin RK di browser.
2.  Pastikan koneksi internet stabil.
3.  Siapkan akun (email dan password) untuk masuk.

---

## A. Panduan Customer (Pembeli)

### 1) Halaman Utama (Dashboard)
Setelah berhasil login, Anda akan diarahkan ke halaman **Dashboard**. Di sini Anda dapat melihat:
* **Statistik:** Ringkasan Total Pesanan, Pesanan Aktif, dan Total Pengeluaran Anda.
* **Pesanan Aktif:** Memantau status pesanan yang sedang berlangsung secara *real-time* dengan alur: **Dibuat** $\rightarrow$ **Diproses** $\rightarrow$ **Siap**.
* **Navigasi:** Gunakan menu di samping kiri untuk berpindah halaman.

### 2) Memilih Kantin & Menu
1.  Klik menu **Jelajahi Kantin** di *sidebar* kiri atau tombol di pojok kanan atas.
2.  Sistem akan menampilkan daftar **Kantin Tersedia** beserta status operasionalnya (Buka/Tutup) dan jam operasional.
3.  Pilih kantin yang diinginkan lalu klik tombol **Lihat Menu**.
4.  Pilih menu makanan/minuman yang tersedia untuk dimasukkan ke keranjang dan lakukan pemesanan.

### 3) Melacak Status Pesanan
Anda bisa memantau pesanan melalui menu **Dashboard** atau **Pesanan Saya**.
1.  **Dibuat:** Pesanan baru saja masuk ke sistem tenant.
2.  **Diproses:** Tenant sedang menyiapkan/memasak pesanan Anda.
3.  **Siap / Siap Diambil:** Makanan sudah selesai dimasak. Silakan datang ke kantin untuk mengambilnya.

### 4) Menyelesaikan Pesanan
1.  Buka menu **Pesanan Saya**.
2.  Anda akan melihat daftar riwayat pesanan dengan rincian item dan total harga.
3.  Setelah Anda mengambil makanan di kantin, **wajib** klik tombol berwarna ungu bertuliskan **Sudah Diambil**.
4.  Status pesanan akan berubah menjadi **Selesai** atau Lunas.

---

## B. Panduan Tenant Admin (Pemilik Kantin)

Role ini digunakan oleh penjual untuk mengelola operasional harian kantin.

### 1) Dashboard Kantin
Halaman ini memberikan ringkasan performa penjualan harian Anda.
* **Statistik:** Lihat angka **Total Pesanan** (Pesanan Hari Ini) dan **Pendapatan Hari Ini**.
* **Menu Kantin:** Preview cepat menu yang sedang aktif dijual.
* **Riwayat Pesanan:** Daftar pesanan terbaru yang masuk ke sistem.

### 2) Mengelola Menu (Menu)
Buka menu **Menu** di sidebar kiri untuk mengatur daftar makanan/minuman.
1.  **Tambah Menu:** Klik tombol ungu **+ Tambah Menu** di pojok kanan atas.
2.  **Kartu Menu:** Setiap menu ditampilkan dalam bentuk kartu yang memuat Foto, Harga, dan Stok.
3.  **Aksi:**
    * Klik ikon **Pensil** (biru) untuk mengedit harga atau deskripsi.
    * Klik ikon **Sampah** (merah) untuk menghapus menu.
    * Pastikan angka **Stok** selalu diperbarui agar pembeli tidak memesan menu kosong.

### 3) Mengelola Pesanan (Pesanan)
Buka menu **Pesanan** untuk melihat antrean pesanan pelanggan.
1.  **Filter Tab:** Gunakan tab di bagian atas (**Semua, Baru, Diproses, Siap Diambil**) untuk mengelompokkan pesanan.
2.  **Proses Pesanan:**
    * Pesanan yang sedang dimasak berstatus **Sedang Diproses**.
    * Jika makanan sudah matang, klik tombol biru **✓ Siap Diambil**. Status akan berubah dan pelanggan akan mendapat notifikasi.
    * Jika pesanan tidak dapat dipenuhi (misal: bahan habis), klik tombol merah **✕ Batalkan**.
3.  **Detail:** Klik tombol **Detail** untuk melihat rincian item yang lebih lengkap.

---

## C. Panduan Super Admin

Role ini memiliki akses penuh untuk mengelola data master pengguna dan kantin.

### 1) Dashboard Admin
Setelah login, Super Admin akan melihat halaman **Dashboard** yang berisi ringkasan sistem:
* **Statistik:** Melihat jumlah **Total Kantin** yang terdaftar dan **Total Users** (pengguna aktif).
* **Monitoring:** Memantau daftar **Kantin Terbaru** yang baru bergabung dan **Pesanan Terbaru** yang masuk ke dalam sistem.

### 2) Mengelola Kantin (Kelola Tenant)
Menu ini digunakan untuk mendaftarkan atau memblokir toko/kantin.
1.  Klik menu **Kelola Tenant** di sidebar kiri.
2.  **Tambah Kantin:** Klik tombol ungu **+ Tambah Kantin** di pojok kanan atas, lalu isi detail kantin baru.
3.  **Filter & Cari:** Gunakan kolom pencarian atau tombol filter (**Semua, Aktif, Nonaktif**) untuk menemukan kantin tertentu.
4.  **Aksi:**
    * **Edit (Ikon Pensil):** Mengubah data profil kantin.
    * **Lock (Ikon Gembok):** Mengaktifkan atau menonaktifkan status kantin (misal: jika kantin tutup permanen).
    * **Hapus (Ikon Sampah):** Menghapus data kantin dari sistem.

### 3) Mengelola Pengguna (Kelola User)
Menu ini digunakan untuk manajemen akun pengguna (Customer, Tenant Admin, dan Admin).
1.  Klik menu **Kelola User**.
2.  **Tambah User:** Klik tombol **+ Tambah User** untuk membuat akun baru secara manual.
3.  **Filter Role:** Anda dapat memfilter tampilan berdasarkan peran: **Customer**, **Tenant Admin**, atau **Admin**.
4.  **Aksi:**
    * Gunakan tombol aksi (Edit, Lock, Hapus) pada kolom paling kanan untuk mengelola akun yang bermasalah atau lupa password.

---

## D. FAQ (Tanya Jawab)

* **Q: Apakah saya bisa membatalkan pesanan?**
    * A: Pesanan hanya bisa dibatalkan jika statusnya masih *Baru*. Jika sudah *Diproses*, pesanan tidak bisa dibatalkan kecuali oleh Tenant.
* **Q: Bagaimana jika saya lupa password?**
    * A: Hubungi admin via halaman kontak atau minta Super Admin untuk mereset akun Anda.
* **Q: Apakah bisa bayar tunai?**
    * A: Sistem mendukung pencatatan status "Lunas", pembayaran fisik tergantung kebijakan masing-masing kantin.

---

## E. Troubleshooting (Pemecahan Masalah)

* **Gagal Login:** Periksa kembali email dan password (huruf besar/kecil berpengaruh). Pastikan akun tidak berstatus *Nonaktif* (terkunci).
* **Menu Tidak Muncul:** Coba muat ulang (refresh) halaman browser Anda atau bersihkan *cache* browser.
* **Status Pesanan Macet:** Hubungi pemilik kantin secara langsung untuk konfirmasi apakah pesanan sudah masuk di tab "Pesanan" mereka.

---

## F. Tips & Best Practices

* **Untuk Customer:** Jangan lupa klik "Sudah Diambil" setelah menerima makanan agar riwayat pesanan Anda rapi.
* **Untuk Tenant:** Selalu update stok menu. Gunakan tombol "Batalkan" hanya jika benar-benar mendesak agar reputasi kantin tetap baik.
* **Keamanan:** Logout setelah menggunakan perangkat umum untuk mencegah penyalahgunaan akun.
