# Laporan Analisis Biaya (Cost Analysis Report)

## Aplikasi Kantin RK ITERA – Cloud Run + Cloud SQL


---

Laporan ini menganalisis biaya bulanan untuk menjalankan aplikasi Kantin RK ITERA di Google Cloud Platform dengan arsitektur **Cloud Run (frontend & backend)**, **Cloud SQL PostgreSQL**, dan **Cloud HTTP(S) Load Balancing**. Estimasi dibuat untuk dua lingkungan: **Development** (skala kecil untuk testing/UAT) dan **Production** (siap melayani ribuan pengguna kampus).

- **Perkiraan biaya Development:** sekitar Rp950.000–Rp1.000.000 per bulan, dengan memanfaatkan autoscaling dan free tier Cloud Run.  
- **Perkiraan biaya Production:** sekitar Rp6.400.000 per bulan, cukup untuk melayani puluhan ribu pengguna aktif di lingkungan kampus.  
- **Komponen biaya terbesar:** Cloud Run backend (compute) dan Cloud SQL (database terkelola).  
- **Penghematan potensial:** 20–40% dengan autoscaling Cloud Run yang agresif, Committed Use Discounts untuk Cloud SQL, dan pengaturan logging yang efisien.  

---

## Asumsi Perhitungan

| Faktor | Development | Production |
| --- | --- | --- |
| Pengguna aktif bulanan | ±3.000 akun | ±30.000 akun |
| Request HTTP | ±30.000/bulan | ±900.000/bulan |
| Lalu lintas keluar (egress internet) | ±30 GB/bulan | ±250 GB/bulan |
| Jam aktif rata-rata Cloud Run | ±100 jam/bulan (sering idle, scale-to-zero) | 730 jam/bulan (min 1 instance aktif) |
| Database | 1 instance kecil (uji coba) | 1 instance menengah dengan backup harian |
| Region harga | `asia-southeast2` (Jakarta) | `asia-southeast2` |

> **Catatan:** Angka-angka di bawah adalah *perkiraan konservatif* berdasarkan struktur harga Cloud Run, Cloud SQL, dan Load Balancing, dikonversi ke rupiah dengan kurs di atas.

---

## 1. Arsitektur Layanan

```text
Internet ──► Cloud HTTP(S) Load Balancer ──► Cloud Run (Frontend: Vue + Nginx)
                                       └──► Cloud Run (Backend: Laravel API)
                                                   │
                                                   ├──► Cloud SQL for PostgreSQL (database utama)
                                                   ├──► Cloud Storage (gambar/menu & aset statis)
                                                   └──► Secret Manager (APP_KEY, DB password)

```


## 2. Estimasi Biaya per Lingkungan

### 2.1 Lingkungan Development  

Perkiraan untuk satu environment development/staging yang dipakai tim pengembang, dengan trafik kecil dan auto-scale-to-zero di Cloud Run.

| Layanan | Spesifikasi & Asumsi | Estimasi Biaya / Bulan |
| --- | --- | --- |
| **Cloud Run Frontend** | 0,25 vCPU / 512 MB, autoscale 0→1, ±100 jam aktif | **≈ Rp120.000** |
| **Cloud Run Backend** | 0,5 vCPU / 1 GB, autoscale 0→2, ±100 jam aktif | **≈ Rp280.000** |
| **Cloud SQL PostgreSQL (kecil)** | shared-core kecil, 20 GB SSD + backup basic | **≈ Rp300.000** |
| **Cloud HTTP(S) Load Balancing** | 1 forwarding rule + ±30 GB egress internet | **≈ Rp200.000** |
| **Cloud Storage** | ±10 GB file gambar/menu & aset statis | **≈ Rp30.000** |
| **Cloud Logging & Monitoring** | Volume log kecil, sebagian masih dalam free tier | **≈ Rp30.000** |
| **Perkiraan Total Development** |  | **≈ Rp960.000 / bulan** |

> Dengan memperhitungkan free tier Cloud Run (request & vCPU-detik gratis) dan kuota gratis logging, biaya riil Development berpotensi lebih rendah 10–20%, sehingga bisa mendekati ±Rp800.000 per bulan jika trafik benar-benar kecil.

---

### 2.2 Lingkungan Production  

Perkiraan untuk environment produksi yang melayani seluruh pengguna Kantin RK ITERA saat jam operasional kampus.

| Layanan | Spesifikasi & Asumsi | Estimasi Biaya / Bulan |
| --- | --- | --- |
| **Cloud Run Frontend** | 1 vCPU / 1 GB, `min_instances=1`, autoscale sampai ~10 instance | **≈ Rp900.000** |
| **Cloud Run Backend** | 2 vCPU / 2 GB, `min_instances=1`, autoscale sampai ~15 instance | **≈ Rp2.400.000** |
| **Cloud SQL PostgreSQL (menengah)** | setara 2 vCPU, 8 GB RAM, 50 GB SSD, backup harian | **≈ Rp1.700.000** |
| **Cloud HTTP(S) Load Balancing** | 1 rule, ±250 GB egress internet / bulan | **≈ Rp1.000.000** |
| **Cloud Storage** | ±50 GB aset statis dan file pendukung | **≈ Rp150.000** |
| **Cloud Logging & Monitoring** | ±30 GB log tersimpan + metrik dasar | **≈ Rp250.000** |
| **Perkiraan Total Production** |  | **≈ Rp6.400.000 / bulan** |

> Angka di atas sudah mencakup compute, storage, dan egress dasar. Jika penggunaan egress atau query database meningkat tajam (misalnya karena fitur baru atau trafik promosi besar), komponen biaya Cloud Run dan Cloud SQL yang paling cepat naik.


Secara keseluruhan, kebutuhan biaya untuk menjalankan aplikasi Kantin RK ITERA di GCP berada di kisaran ±Rp1 juta per bulan untuk environment Development dan sekitar Rp6,4 juta per bulan untuk Production dengan konfigurasi yang siap melayani ribuan pengguna. Biaya terbesar berasal dari kombinasi Cloud Run backend dan Cloud SQL PostgreSQL, sementara komponen lain seperti load balancer, storage, serta logging/monitoring menyumbang porsi yang lebih kecil. Dengan pengaturan autoscaling yang tepat, rightsizing instance database, dan pengelolaan logging yang efisien, total biaya masih dapat dioptimalkan tanpa mengorbankan kinerja dan keandalan sistem.

---

## 3. Optimalisasi Biaya yang Direkomendasikan

1. **Autoscaling agresif Cloud Run**: naikkan concurrency per instance dan set `min_instances=0` untuk service non-kritis.
2. **Rightsizing Cloud SQL**: mulai dari instance menengah, pantau CPU/koneksi, lalu naik–turunkan ukuran sesuai beban.
3. **Committed Use Discounts (CUD)**: setelah pola beban stabil, pakai komitmen 1 tahun untuk Cloud SQL & Cloud Run.
4. **Cloud CDN + Cache-Control**: cache file statis (JS, CSS, gambar menu) untuk menekan biaya egress load balancer.
5. **Optimasi logging**: batasi log di production (tanpa debug), atur retensi pendek untuk Dev dan moderat untuk Prod.
6. **Jadwal non-prod**: matikan / kecilkan resource Dev–Staging di luar jam kerja dengan Cloud Scheduler atau script.

---

## 4. Risiko Biaya & Mitigasi

1. **Lonjakan trafik mendadak**  
   – *Risiko*: instance Cloud Run & koneksi DB melonjak → biaya naik.  
   – *Mitigasi*: batasi `max_instances`, gunakan connection pooling, dan lakukan load testing berkala.

2. **Egress internet tinggi**  
   – *Risiko*: banyak pengguna dan file statis besar → tagihan load balancer membengkak.  
   – *Mitigasi*: aktifkan Cloud CDN, kompres aset, dan hindari payload JSON yang tidak perlu.

3. **Over-provisioning resource**  
   – *Risiko*: konfigurasi Cloud Run / Cloud SQL terlalu besar dibanding kebutuhan.  
   – *Mitigasi*: pantau metrik, lakukan rightsizing tiap beberapa bulan, dan gunakan CUD hanya untuk resource yang pasti dipakai.

4. **Logging berlebihan**  
   – *Risiko*: terlalu banyak log disimpan → biaya Cloud Logging naik.  
   – *Mitigasi*: gunakan sampling/filter log dan retensi yang ketat, terutama untuk environment non-produksi.

---

## 5. Rekomendasi Implementasi

1. **Fase awal (Dev/UAT)**: jalankan 1 environment kecil dengan `min_instances=0`, gunakan hasil performance test untuk set `max_instances` dan concurrency.
2. **Fase go-live Production**: pakai konfigurasi Production saat ini, aktifkan Cloud CDN, dan pantau biaya + metrik selama beberapa minggu pertama.
3. **Fase stabil (3–6 bulan)**: review billing & metrik, lakukan rightsizing Cloud Run/Cloud SQL, lalu terapkan CUD untuk resource yang konsisten dipakai.
4. **Praktik FinOps ringan**: buat dashboard biaya per layanan, review bulanan, dan catat dampak setiap perubahan konfigurasi atau fitur besar.