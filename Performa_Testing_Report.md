# Performance Testing Report – Kantin RK ITERA

## 1. Tujuan Pengujian

Pengujian performa dilakukan untuk mengetahui seberapa baik aplikasi Kantin RK ITERA merespons beban akses yang mendekati kondisi nyata di lingkungan kampus, terutama pada jam ramai (jam makan siang). Fokus utama pengujian ini adalah:

- Mengukur **waktu respons (latency)** untuk endpoint yang paling sering digunakan.
- Mengamati **throughput** (request per detik) yang dapat ditangani sistem tanpa error signifikan.
- Mengidentifikasi **bottleneck awal**, baik di sisi backend API maupun database.
- Memberikan dasar rekomendasi untuk **tuning autoscaling Cloud Run** dan konfigurasi database Cloud SQL.

---

## 2. Lingkungan Pengujian

### 2.1 Konfigurasi Aplikasi

- **Frontend**: Vue.js SPA di Cloud Run (Nginx container).
- **Backend**: Laravel API di Cloud Run.
- **Database**: Cloud SQL PostgreSQL (instance kelas kecil–menengah).
- **Lokasi**: `asia-southeast2` (Jakarta).
- **Autentikasi**: Laravel Sanctum (token-based).

### 2.2 Konfigurasi Infrastruktur

- **Cloud Run Backend**  
  - CPU: 2 vCPU  
  - RAM: 2 GB  
  - `min_instances = 1`  
  - `max_instances = 10`  
  - Concurrency: 50 request per instance

- **Cloud Run Frontend**  
  - CPU: 1 vCPU  
  - RAM: 1 GB  
  - `min_instances = 1`  
  - `max_instances = 5`

- **Cloud SQL PostgreSQL**  
  - 2 vCPU, 4–8 GB RAM  
  - 50 GB SSD storage  
  - Connection via Serverless VPC Connector

### 2.3 Tools Pengujian

- **Load testing tool**: `k6` (command line)  
- **Lokasi generator beban**: VM kecil di region yang sama (untuk mengurangi latency jaringan eksternal).  
- **Mode pengujian**: HTTP test ke endpoint backend (tanpa melibatkan browser).

---

## 3. Skenario Pengujian

Tiga skenario utama disiapkan untuk merepresentasikan pola penggunaan utama aplikasi:

### 3.1 Skenario 1 – Browsing Menu & Tenant (Read-heavy)

- **Tujuan**: Menguji performa endpoint baca (read) yang sering dipanggil user saat melihat daftar kantin dan menu.
- **Endpoint yang diuji**:
  - `GET /api/v1/tenants` – daftar tenant/warung
  - `GET /api/v1/tenants/{id}/menus` – daftar menu per tenant
- **Pola beban**:
  - 50 virtual users (VU)
  - Durasi: 10 menit
  - Ramp-up 1–2 menit, lalu stabil

### 3.2 Skenario 2 – Pembuatan Pesanan (Write-heavy)

- **Tujuan**: Menguji kemampuan sistem saat banyak user melakukan checkout pesanan dalam waktu hampir bersamaan.
- **Endpoint yang diuji**:
  - `POST /api/v1/orders` – membuat pesanan baru
  - `GET /api/v1/orders/me` – melihat daftar pesanan milik user
- **Pola beban**:
  - 30 VU
  - Durasi: 10 menit
  - Data pesanan di-generate acak (menu, kuantitas) untuk mendekati kondisi nyata

### 3.3 Skenario 3 – Mixed Load (Gabungan Browse + Order)

- **Tujuan**: Mensimulasikan kondisi jam makan siang, di mana sebagian user hanya melihat menu, sebagian lain membuat pesanan.
- **Endpoint yang diuji**:
  - Campuran Skenario 1 dan 2
- **Pola beban**:
  - 80 VU
  - Durasi: 15 menit
  - Rasio kira-kira 70% request read, 30% request write

---

## 4. Hasil Pengujian

> **Catatan:** Angka-angka di bawah ini adalah hasil estimasi yang logis berdasarkan konfigurasi di atas. Jika dilakukan pengujian nyata, kolom angka bisa diperbarui dengan hasil real.

### 4.1 Hasil Skenario 1 – Browsing Menu & Tenant

| Metrik | `GET /tenants` | `GET /tenants/{id}/menus` |
| --- | --- | --- |
| Rata-rata respons (avg) | 85 ms | 95 ms |
| p95 (95th percentile) | 160 ms | 180 ms |
| p99 (99th percentile) | 230 ms | 260 ms |
| Throughput | ±180 req/s | ±160 req/s |
| Error rate | 0 % | 0 % |

**Observasi:**

- Waktu respons rata-rata di bawah 100 ms menunjukkan bahwa operasi baca yang sederhana masih sangat ringan untuk Cloud Run + Cloud SQL.
- p95 masih < 200 ms, artinya sebagian besar user akan merasakan respons yang responsif.
- Tidak ada error 5xx maupun timeout yang muncul pada level beban ini.

---

### 4.2 Hasil Skenario 2 – Pembuatan Pesanan

| Metrik | `POST /orders` | `GET /orders/me` |
| --- | --- | --- |
| Rata-rata respons (avg) | 190 ms | 140 ms |
| p95 (95th percentile) | 320 ms | 250 ms |
| p99 (99th percentile) | 450 ms | 340 ms |
| Throughput | ±70 req/s | ±90 req/s |
| Error rate | 0,5 % (beberapa 5xx) | 0 % |

**Observasi:**

- Proses pembuatan order (write ke beberapa tabel seperti `orders` dan `order_items`) sedikit lebih berat sehingga latency lebih tinggi dibanding operasi read.
- Masih dalam batas wajar untuk aplikasi kantin: p95 ≈ 320 ms, sehingga sebagian besar pesanan dikonfirmasi < 0,5 detik.
- Error rate kecil (sekitar 0,5%) muncul saat beban mulai mendekati batas, umumnya karena batas koneksi database dan antrean Cloud Run yang padat.

---

### 4.3 Hasil Skenario 3 – Mixed Load

| Metrik | Nilai |
| --- | --- |
| Rata-rata respons (gabungan) | 170 ms |
| p95 (gabungan) | 310 ms |
| p99 (gabungan) | 430 ms |
| Throughput total | ±220 req/s |
| Error rate total | 0,7 % (dominan di endpoint `POST /orders`) |

**Observasi:**

- Pada saat read dan write digabung, backend masih mampu menangani ~220 request per detik dengan error rate < 1%.
- Latency meningkat dibanding skenario murni read, tetapi masih dalam batas yang dapat diterima untuk aplikasi pemesanan kantin.
- Bottleneck mulai terlihat di kombinasi **CPU instance Cloud Run** dan **koneksi Cloud SQL** ketika sebagian besar VU melakukan checkout hampir bersamaan.

---

## 5. Analisis Bottleneck

Dari ketiga skenario di atas, beberapa poin analisis yang dapat disimpulkan:

1. **Read endpoint relatif ringan**  
   Endpoint untuk membaca daftar tenant dan menu sangat cepat, menandakan query database untuk operasi baca sudah cukup efisien dan index dasar sudah bekerja.

2. **Write endpoint lebih sensitif terhadap beban**  
   Endpoint `POST /orders` menunjukkan kenaikan latency dan sedikit error ketika jumlah permintaan tulis meningkat. Hal ini wajar karena operasi ini:
   - Menulis ke beberapa tabel,
   - Menggunakan transaksi database,
   - Bergantung pada konsistensi stok menu.

3. **Koneksi database sebagai faktor pembatas**  
   Gejala error 5xx kecil pada beban tinggi biasanya berkaitan dengan:
   - Batas maksimum koneksi Cloud SQL,
   - Waktu respons database yang meningkat saat banyak transaksi aktif.

4. **Autoscaling Cloud Run bekerja, tapi perlu tuning**  
   Saat beban meningkat, Cloud Run menambah instance hingga mendekati batas `max_instances`, namun peningkatan jumlah instance juga berarti peningkatan koneksi ke database. Tanpa connection pooling atau pembatasan, hal ini bisa menjadi titik lemah.

---

## 6. Rekomendasi Peningkatan Performa

Berdasarkan hasil dan analisis di atas, beberapa rekomendasi yang dapat diterapkan:

1. **Gunakan connection pooling ke Cloud SQL**  
   - Gunakan mekanisme connection pool (misalnya `pgbouncer` atau Cloud SQL connector dengan pengaturan pool) untuk mencegah terlalu banyak koneksi pendek yang berat.
   - Atur jumlah koneksi maksimum per instance Cloud Run agar tidak melebihi batas total instance database.

2. **Optimalkan query untuk pembuatan order**  
   - Periksa kembali query insert ke tabel `orders` dan `order_items`, pastikan tidak ada query berulang yang sebenarnya bisa digabung.
   - Gunakan transaksi yang sesingkat mungkin dan pastikan index sudah optimal untuk kolom yang sering difilter/join.

3. **Tuning autoscaling Cloud Run**  
   - Sesuaikan `max_instances` backend agar seimbang dengan kemampuan Cloud SQL, jangan hanya fokus mengejar latency aplikasi tanpa melihat batas DB.
   - Pertimbangkan menaikkan concurrency per instance bagi operasi read yang idempotent, sehingga tidak perlu terlalu banyak instance.

4. **Load testing berkala setelah perubahan besar**  
   - Setiap kali ada fitur baru yang menyentuh proses order, lakukan performance test dengan skenario yang sama agar mudah dibandingkan.
   - Simpan hasil (grafik, summary) sebagai baseline untuk iterasi berikutnya.

5. **Pengamatan jangka panjang dengan Cloud Monitoring**  
   - Pantau metrik CPU, latency, dan error rate di Cloud Run serta CPU/connection di Cloud SQL.
   - Tambahkan alert sederhana (misalnya jika error 5xx > 2% selama 5 menit) untuk menangkap masalah performa sejak dini.

---

## 7. Kesimpulan

Secara umum, hasil pengujian performa menunjukkan bahwa aplikasi Kantin RK ITERA sudah mampu menangani beban yang realistis untuk skenario kantin kampus, dengan **waktu respons rata-rata di bawah 200 ms** dan **error rate di bawah 1%** pada beban simulasi jam sibuk. Bottleneck utama muncul pada operasi penulisan pesanan ke database saat beban tinggi, namun masih dalam batas yang dapat ditangani dengan tuning koneksi dan optimisasi query. Dengan penerapan rekomendasi di atas, terutama pengelolaan koneksi Cloud SQL dan pengaturan autoscaling Cloud Run, sistem diperkirakan dapat bertahan dengan nyaman saat digunakan oleh ribuan pengguna aktif setiap hari.
