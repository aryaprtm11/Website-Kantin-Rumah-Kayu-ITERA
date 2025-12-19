# Penjelasan Skema Database – Kantin Rumah Kayu ITERA

Dokumen ini menjelaskan struktur tabel dan relasi pada skema database aplikasi **Kantin Rumah Kayu ITERA**.

---

## Gambar Skema Database

![Skema Database](gambar/database.png)

---

## Ringkasan Tabel

### 1. `user`
Menyimpan data seluruh pengguna sistem (customor, tenant, admin)

**Kolom utama:**
- `user_id` – primary key pengguna  
- `nama` – nama  
- `email` – alamat email untuk login  
- `password_hash` – password yang sudah di-hash  
- `role` – peran pengguna (mis. `customer`, `tenant`, `admin`)  
- `created_at`, `updated_at` – waktu pembuatan dan pembaruan data  

---

### 2. `tenant`
Mewakili setiap tenant yang berjualan di Rumah Kayu.

**Kolom utama:**
- `tenant_id` – primary key tenant  
- `user_id` – foreign key ke `user.user_id` (tenant admin)  
- `nama_tenant`  
- `jam_buka`, `jam_tutup` – jam operasional  
- `created_at`, `updated_at`  

---

### 3. `menu`
Menyimpan daftar menu yang dijual oleh tenant.

**Kolom utama:**
- `menu_id` – primary key menu  
- `tenant_id` – foreign key ke `tenant.tenant_id`  
- `nama_menu` – nama makanan/minuman  
- `harga` – harga per porsi  
- `kategori` – kategori menu 
- `foto_url` – URL gambar menu  
- `stok` – jumlah stok tersedia  
- `created_at`, `updated_at`  

---

### 4. `order`
Mencatat setiap pesanan yang dibuat oleh pengguna.

**Kolom utama:**
- `order_id` – primary key pesanan  
- `user_id` – foreign key ke `user.user_id` (pembeli)  
- `total_harga` – total harga seluruh item  
- `tipe` – tipe pesanan
- `status` – status pesanan  
- `payment_status` – status pembayaran  
- `paid_amount` – jumlah yang dibayar  
- `waktu_diambil` – waktu pengambilan pesanan  
- `completed_by_user` – penanda pesanan sudah dikonfirmasi selesai oleh user  
- `created_at`, `updated_at`  

---

### 5. `order_item`
Menyimpan detail tiap menu yang dipesan dalam satu `order`.

**Kolom utama:**
- `order_item_id` – primary key item pesanan  
- `order_id` – foreign key ke `order.order_id`  
- `menu_id` – foreign key ke `menu.menu_id`  
- `jumlah` – kuantitas menu yang dipesan  
- `harga_satuan` – harga per menu saat transaksi  
- `subtotal` – hasil `jumlah × harga_satuan`  
- `created_at`, `updated_at`  

---

## Relasi Antar Tabel

- **`user` → `tenant`**: satu pengguna (tenant admin) dapat memiliki satu atau beberapa tenant.  
- **`tenant` → `menu`**: satu tenant memiliki banyak menu.  
- **`user` → `order`**: satu pengguna (customer) dapat membuat banyak pesanan.  
- **`order` → `order_item`**: satu pesanan terdiri dari banyak item pesanan.  
- **`menu` → `order_item`**: satu menu dapat muncul di banyak item pesanan yang berbeda.  

Relasi-relasi ini mendukung alur utama aplikasi:  
pengguna login → memilih tenant → memilih menu → membuat pesanan → setiap pesanan berisi banyak `order_item` yang terkait dengan `menu` dan `tenant` tertentu.
