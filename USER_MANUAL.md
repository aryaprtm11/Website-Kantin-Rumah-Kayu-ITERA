# Panduan Pengguna Sistem Pemesanan Kantin Rumah Kayu (RK)

Panduan ini membantu Anda menggunakan website pemesanan kantin, baik sebagai **Customer** (pembeli), **Tenant Admin** (pemilik kantin), maupun **Super Admin** (pengelola sistem).

## Persiapan Awal

1.  Buka website aplikasi Kantin RK di browser.
2.  Pastikan koneksi internet stabil.
3.  Siapkan akun (email dan password) untuk masuk.

---

## A. Panduan Customer (Pembeli)

### 1) Masuk atau Daftar Akun
* Klik tombol **Login** di pojok kanan atas.
* Jika belum punya akun, klik **Daftar / Register**. Isi nama, email, dan password, lalu simpan.
* Jika sudah punya akun, masukkan email dan password lalu klik **Masuk**.

### 2) Mencari Menu Makanan
* Dari halaman utama (Dashboard), lihat daftar menu yang tersedia.
* Gunakan **kolom pencarian** untuk mengetik nama makanan atau nama kantin.
* Klik gambar makanan untuk melihat detail harga dan deskripsi.

### 3) Memesan Makanan
* Di halaman detail menu, tentukan jumlah porsi yang diinginkan.
* Klik **Tambah ke Keranjang**.
* Buka ikon **Keranjang**, periksa pesanan Anda, lalu klik **Checkout / Bayar**.
* Pilih metode pembayaran dan selesaikan transaksi.

### 4) Memantau Status Pesanan
* Klik profil Anda, pilih menu **Riwayat Pesanan**.
* Lihat status pesanan Anda:
    * **Pending:** Menunggu konfirmasi kantin.
    * **Diproses:** Makanan sedang dimasak.
    * **Selesai:** Makanan siap diambil.
* Tunjukkan bukti pesanan (QR Code/ID Pesanan) saat mengambil makanan di kantin.

### 5) Keluar (Logout)
* Klik nama atau avatar Anda.
* Pilih **Logout** untuk keluar dari akun.

---

## B. Panduan Tenant Admin (Pemilik Kantin)

*Pastikan akun Anda sudah didaftarkan sebagai Tenant oleh Super Admin.*

### 1) Masuk ke Dashboard Tenant
* Login menggunakan akun tenant yang sudah diberikan.
* Anda akan langsung diarahkan ke **Dashboard Tenant**.

### 2) Mengelola Menu (Tambah/Edit)
* Klik menu **Manajemen Menu**.
* **Tambah Menu Baru:** Klik tombol *Tambah*, isi nama makanan, harga, stok, dan upload foto. Klik *Simpan*.
* **Edit Menu:** Klik tombol *Edit* pada menu yang ingin diubah (misal: mengubah harga atau stok habis).

### 3) Memproses Pesanan Masuk
* Buka menu **Pesanan Masuk**.
* Setiap ada pesanan baru, status awal adalah **Pending**.
* Klik **Terima/Proses** saat Anda mulai memasak. Status berubah menjadi **Diproses**.
* Klik **Selesai** saat makanan sudah siap diambil oleh pembeli.

### 4) Melihat Laporan Penjualan
* Buka menu **Laporan / Sales**.
* Lihat ringkasan pendapatan harian atau bulanan Anda di sana.

---

## C. Panduan Super Admin

*Role ini khusus untuk pengelola sistem IT atau manajemen pusat kantin.*

### 1) Mengelola Pengguna (User Management)
* Login sebagai Super Admin.
* Masuk ke menu **Users**. Anda bisa melihat daftar semua pengguna yang terdaftar.
* Gunakan fitur ini untuk mereset password pengguna jika ada yang lupa atau memblokir akun mencurigakan.

### 2) Mendaftarkan Tenant Baru
* Masuk ke menu **Kelola Tenant**.
* Klik **Tambah Tenant** untuk mendaftarkan penjual baru (nama toko, pemilik, kontak).
* Berikan akses login kepada pemilik kantin tersebut.

### 3) Monitoring Sistem
* Cek dashboard utama untuk melihat status server atau log aktivitas sistem secara keseluruhan.

---

## D. FAQ (Tanya Jawab)

* **Q: Apakah saya bisa membatalkan pesanan?**
    * A: Pesanan hanya bisa dibatalkan jika statusnya masih *Pending*. Jika sudah *Diproses*, pesanan tidak bisa dibatalkan.
* **Q: Bagaimana jika saya lupa password?**
    * A: Hubungi admin via halaman kontak atau gunakan fitur "Lupa Password" di halaman login.
* **Q: Apakah bisa bayar tunai?**
    * A: Tergantung kebijakan kantin, namun disarankan menggunakan pembayaran digital (QRIS/Transfer) agar tercatat di sistem.

---

## E. Troubleshooting (Pemecahan Masalah)

* **Gagal Login:** Periksa kembali email dan password (huruf besar/kecil berpengaruh). Pastikan akun sudah terverifikasi.
* **Menu Tidak Muncul:** Coba muat ulang (refresh) halaman browser Anda atau bersihkan *cache* browser.
* **Status Pesanan Tidak Berubah:** Hubungi pemilik kantin secara langsung untuk konfirmasi apakah pesanan sudah masuk di perangkat mereka.

---

## F. Tips & Best Practices

* **Untuk Pembeli:** Pesanlah makanan sebelum jam istirahat agar tidak menunggu antrean terlalu lama.
* **Untuk Tenant:** Selalu update stok menu. Jika bahan habis, segera nonaktifkan menu tersebut di dashboard agar pembeli tidak kecewa.
* **Keamanan:** Jangan berikan password akun Anda kepada siapapun. Logout setelah menggunakan perangkat umum.
