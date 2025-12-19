# Performance Testing Report – Kantin RK ITERA

## 1. Tujuan Pengujian

Pengujian performa dilakukan untuk mengetahui seberapa baik aplikasi Kantin RK ITERA merespons beban akses yang mendekati kondisi nyata di lingkungan kampus, terutama pada jam ramai (jam makan siang). Fokus utama pengujian ini adalah:

- Mengukur **waktu respons (latency)** untuk endpoint yang paling sering digunakan.
- Mengamati **throughput** (request per detik) yang dapat ditangani sistem.
- Mengidentifikasi **bottleneck awal**, baik di sisi backend API maupun database.
- Memberikan dasar rekomendasi untuk **tuning autoscaling Cloud Run** dan konfigurasi database Cloud SQL.

---

## 2. Lingkungan Pengujian

### 2.1 Konfigurasi Aplikasi

- **Frontend**: Vue.js SPA di Cloud Run (container Nginx).
- **Backend**: Laravel API di Cloud Run.
- **Database**: Cloud SQL PostgreSQL.
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
  - Koneksi via Serverless VPC Connector

### 2.3 Tools Pengujian

- **Load testing tool**: `k6`
- **Lokasi generator beban**: VM kecil di region yang sama.
- **Mode pengujian**: HTTP test langsung ke endpoint backend.

---

## 3. Skenario Pengujian

### 3.1 Skenario 1 – Browsing Menu & Tenant (Read-heavy)

- **Tujuan**: Menguji performa endpoint baca (read) saat user melihat daftar kantin dan menu.
- **Endpoint yang diuji**:
  - `GET /api/v1/tenants`
  - `GET /api/v1/tenants/{id}/menus`
- **Pola beban**:
  - 50 virtual users (VU)
  - Durasi: 10 menit
  - Ramp-up singkat, lalu beban stabil

### 3.2 Skenario 2 – Pembuatan Pesanan (Write-heavy)

- **Tujuan**: Menguji kemampuan sistem saat banyak user melakukan checkout pesanan.
- **Endpoint yang diuji**:
  - `POST /api/v1/orders`
  - `GET /api/v1/orders`
- **Pola beban**:
  - 30 VU
  - Durasi: 10 menit
  - Payload pesanan diacak (tenant, menu, quantity)

### 3.3 Skenario 3 – Mixed Load (70% Read, 30% Write)

- **Tujuan**: Mensimulasikan kondisi jam makan siang (kombinasi lihat menu + buat pesanan).
- **Endpoint yang diuji**:
  - Kombinasi Skenario 1 dan 2
- **Pola beban**:
  - 80 VU
  - Durasi: 15 menit
  - Rasio kira-kira 70% request read, 30% request write

---

## 4. Hasil Pengujian

### 4.1 Hasil Skenario 1 – Browsing Menu & Tenant (Read-heavy)

- HTTP Request Duration  
  - **avg**: 138,96 ms  
  - **p95**: 209,58 ms  
  - **p99**: 387,62 ms  

- Read Latency (overall sama dengan HTTP duration)  
  - **avg**: 138,96 ms  
  - **p95**: 209,58 ms  
  - **p99**: 387,62 ms  

- **Total Requests**: 6.553  
- **Throughput**: 10,73 req/s  
- **Error Rate**: 0,00%  


Waktu respons rata-rata sekitar 139 ms dan p95 sekitar 210 ms menunjukkan bahwa operasi baca (melihat daftar tenant dan menu) masih cukup ringan untuk diproses oleh Cloud Run dan Cloud SQL. Bahkan pada p99, latency masih di bawah 400 ms sehingga hanya sebagian kecil request yang mendekati 0,4 detik. Sepanjang pengujian ini tidak terjadi error (0% error rate), sehingga untuk beban baca murni sistem dapat dikatakan stabil.

---

### 4.2 Hasil Skenario 2 – Pembuatan Pesanan (Write-heavy)

- HTTP Request Duration (overall)  
  - **avg**: 190,51 ms  
  - **p95**: 357,89 ms  
  - **p99**: 442,56 ms  

- Write Latency (`POST /orders`)  
  - **avg**: 152,50 ms  
  - **p95**: 218,08 ms  
  - **p99**: 294,06 ms  

- Read Latency (`GET /orders`)  
  - **avg**: 227,52 ms  
  - **p95**: 391,83 ms  
  - **p99**: 498,90 ms  

- **Total Requests**: 4.335  
- **Throughput**: 7,09 req/s  
- **Error Rate**: 49,97%  

Latency rata-rata pembuatan pesanan (POST) masih cukup baik, dengan nilai sekitar 150 ms dan p95 sekitar 218 ms, sehingga pesanan yang berhasil diproses terasa cepat di sisi user. Namun, error rate pada skenario ini sangat tinggi (~50%), terutama ketika beban terus dijaga pada 30 VU selama 10 menit. Hal ini mengindikasikan adanya bottleneck serius (kemungkinan di koneksi database, batas kapasitas Cloud Run, atau logic aplikasi) yang menyebabkan banyak request gagal ketika sistem berada di bawah beban tulis yang berat.

---

### 4.3 Hasil Skenario 3 – Mixed Load (70% Read, 30% Write)

- HTTP Request Duration (Overall)  
  - **avg**: 191,62 ms  
  - **p95**: 396,66 ms  
  - **p99**: 713,39 ms  

- Read Latency  
  - **avg**: 194,77 ms  
  - **p95**: 422,36 ms  
  - **p99**: 722,02 ms  

- Write Latency  
  - **avg**: 167,38 ms  
  - **p95**: 236,98 ms  
  - **p99**: 418,90 ms  

- **Total Requests**: 21.271  
- **Throughput**: 23,35 req/s  
- **Error Rate**: 11,55%  

 
Pada beban campuran, sistem mampu menangani throughput yang lebih tinggi (sekitar 23 req/s) dengan latency rata-rata sekitar 190 ms. Walaupun angka ini masih layak untuk aplikasi kantin, p95 yang mendekati 400 ms dan p99 di atas 700 ms menunjukkan bahwa sebagian kecil request mulai mengalami keterlambatan signifikan. Error rate turun dibanding skenario write-heavy murni, tetapi masih cukup tinggi (±11,55%), sehingga perlu ada perbaikan sebelum skenario ini dinyatakan siap produksi.

---

## 5. Analisis Bottleneck

Berdasarkan ketiga skenario di atas, beberapa poin analisis dapat ditarik:

1. **Operasi baca murni (read-heavy) relatif aman**  
   Pada Skenario 1, semua metrik masih sangat baik, dengan error 0% dan throughput >10 req/s. Artinya, query baca untuk daftar tenant dan menu sudah cukup efisien.

2. **Operasi tulis (write-heavy) belum stabil pada beban tinggi**  
   Skenario 2 memperlihatkan error rate hampir 50% meskipun latency rata-rata untuk request yang sukses masih oke. Ini biasanya mengarah ke:
   - batas maksimum koneksi Cloud SQL yang terlampaui,
   - timeout di sisi Cloud Run,
   - atau error aplikasi ketika banyak transaksi paralel.

3. **Beban campuran menurunkan error, tapi masih di atas batas wajar**  
   Pada Skenario 3, error rate turun menjadi ~11,55% dengan throughput lebih tinggi, menandakan sistem sedikit lebih stabil saat komposisi read lebih besar. Namun, angka ini masih jauh dari target (idealnya <1–2%), sehingga bottleneck di sisi database/backend belum sepenuhnya teratasi.

---

## 6. Rekomendasi Peningkatan Performa

1. **Investigasi log error dan tracing**  
   - Periksa log Laravel dan Cloud Run untuk mengetahui jenis error yang muncul pada Skenario 2 dan 3 (apakah 5xx, timeout, atau error validasi).  
   - Gunakan trace ID/konteks untuk melihat pola error saat beban tinggi.

2. **Terapkan connection pooling ke Cloud SQL**  
   - Gunakan Cloud SQL connector / pgbouncer untuk membatasi jumlah koneksi aktif dari Cloud Run ke database.  
   - Atur jumlah koneksi maksimum per instance agar tidak melebihi batas database.

3. **Tuning konfigurasi Cloud Run**  
   - Evaluasi nilai `max_instances` dan `concurrency`; terlalu banyak instance tanpa pool koneksi bisa justru membebani database.  
   - Pastikan timeout Cloud Run cukup panjang untuk transaksi order, tetapi tidak berlebihan.

4. **Optimasi query dan transaksi order**  
   - Tinjau query untuk `POST /orders` dan `GET /orders`: pastikan index sudah tepat, tidak ada N+1 query, dan penggunaan transaksi tidak terlalu panjang.  
   - Jika perlu, pisahkan logika berat (misalnya perhitungan laporan) ke job asynchronous.

5. **Lakukan pengujian ulang setelah tuning**  
   - Setelah perubahan pada pooling, Cloud Run, dan query dilakukan, jalankan kembali k6 dengan skenario yang sama untuk melihat apakah error rate sudah turun ke <1–2%.  
   - Simpan hasil pengujian sebelum dan sesudah tuning sebagai bahan dokumentasi.

---

## 7. Kesimpulan

Pengujian performa menunjukkan bahwa aplikasi Kantin RK ITERA **sudah cukup stabil untuk operasi baca**, dengan waktu respons yang cepat dan error 0% pada skenario browsing menu. Namun, pada beban tulis yang tinggi (pembuatan pesanan masif), sistem masih mengalami masalah serius yang terlihat dari error rate tinggi di Skenario 2 dan Skenario 3. Dengan memperbaiki pengelolaan koneksi database, men-tuning autoscaling Cloud Run, serta mengoptimalkan query dan transaksi order, sistem diperkirakan dapat mencapai tingkat stabilitas yang lebih baik dan siap melayani beban produksi di lingkungan kampus.
