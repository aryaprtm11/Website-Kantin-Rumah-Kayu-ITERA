# 🔐 Security Audit Checklist – Kantin RK ITERA

Checklist ini menyoroti kontrol keamanan utama yang digunakan pada sistem pemesanan Kantin RK ITERA.  
Fokusnya pada autentikasi Laravel Sanctum, manajemen peran (Customer, Tenant Admin, Super Admin), validasi input, kebijakan CORS, pengelolaan rahasia, serta infrastruktur di Google Cloud (Cloud Run + Cloud SQL + VPC).

Gunakan checklist ini saat review kode, sebelum deployment, dan saat melakukan audit berkala.

---

## 1. Autentikasi & Otorisasi

- [ ] Verifikasi bahwa password **selalu di-hash** (bcrypt/argon2) oleh Laravel (cast `password` di model `User`) dan tidak pernah disimpan sebagai plaintext.
- [ ] Pastikan aturan validasi password (di `RegisterRequest` atau sejenis) menetapkan **minimal panjang 8 karakter** dan, bila perlu, aturan kompleksitas (angka / simbol).
- [ ] Pastikan semua endpoint yang membutuhkan login memakai middleware `auth:sanctum` atau guard lain yang sesuai.
- [ ] Audit pembuatan token di `AuthController@login` untuk memastikan token hanya dibuat untuk kredensial yang valid dan tidak di-log secara sembarangan.
- [ ] Pastikan endpoint `logout` benar-benar melakukan **revoke** terhadap token aktif (mis. `currentAccessToken()->delete()`), bukan sekadar menghapus data di frontend.
- [ ] Tinjau konfigurasi **masa berlaku token** di `config/sanctum.php`; jika `expiration` bernilai `null`, pastikan ada mekanisme lain untuk mencabut token yang tidak lagi dipakai.
- [ ] Pastikan seluruh route admin dan tenant terproteksi oleh policy / middleware yang memeriksa **role** (`Customer`, `TenantAdmin`, `SuperAdmin`) sebelum mengakses resource.
- [ ] Uji beberapa skenario **IDOR**: user biasa tidak boleh membaca / mengubah `Order`, `Tenant`, atau `Menu` yang bukan miliknya hanya dengan mengganti `id` di URL.

---

## 2. Validasi Input & Penanganan Error

- [ ] Pastikan semua endpoint penting menggunakan `FormRequest` (mis. `StoreMenuRequest`, `StoreOrderRequest`, `RegisterRequest`) dengan aturan validasi yang eksplisit.
- [ ] Konfirmasi bahwa seluruh query ke database menggunakan **Eloquent / Query Builder** dan bukan string SQL mentah yang memasukkan input user secara langsung (mencegah SQL Injection).
- [ ] Verifikasi bahwa respon error validasi menggunakan HTTP status yang sesuai (`422`), sedangkan error autentikasi/otorisasi menggunakan `401` / `403`.
- [ ] Tinjau penanganan exception global (di `app/Exceptions/Handler.php`) agar pesan error di production **tidak menampilkan stack trace** atau detail sensitif.
- [ ] Pastikan frontend Vue menampilkan pesan error yang ramah pengguna dan tidak menampilkan detail dari backend yang bersifat teknis.

---

## 3. CORS & Komunikasi Frontend–Backend

- [ ] Audit konfigurasi CORS (middleware / `config/cors.php`) untuk memastikan hanya origin resmi (domain frontend production) yang diizinkan, bukan `*` secara global.
- [ ] Pastikan header `Access-Control-Allow-Methods` dan `Access-Control-Allow-Headers` diset secukupnya, tidak membuka metode / header yang tidak diperlukan.
- [ ] Konfirmasi bahwa frontend hanya memanggil API melalui **HTTPS** di environment produksi (URL diatur lewat `VITE_API_URL`).
- [ ] Tinjau cara penyimpanan token di frontend (localStorage / cookie); jika menggunakan localStorage, pastikan risiko XSS diminimalkan (tidak ada penggunaan `v-html` atau unsafe render).
- [ ] Lakukan pengujian manual untuk memastikan request lintas origin (CORS) berjalan benar di browser tanpa membuka origin yang tidak sah.

---

## 4. Data, Rahasia, & Konfigurasi

- [ ] Pastikan file `.env` **tidak dikomit ke repository**, dan semua rahasia (DB password, `APP_KEY`, API key lain) hanya didefinisikan melalui environment variable / Secret Manager.
- [ ] Audit file Terraform untuk memastikan variabel sensitif (mis. `db_password`) ditandai `sensitive = true` dan tidak ditampilkan di output / log pipeline.
- [ ] Verifikasi bahwa aplikasi terhubung ke database menggunakan **akun dengan hak minimal**, bukan superuser bawaan (mis. `postgres`) jika tidak diperlukan.
- [ ] Konfirmasi bahwa konfigurasi production menggunakan `APP_ENV=production` dan `APP_DEBUG=false` sehingga detail error tidak bocor ke publik.
- [ ] Tinjau apakah ada data yang seharusnya tidak disimpan (mis. token pihak ketiga, data pembayaran lengkap); jika harus disimpan, pertimbangkan enkripsi di level aplikasi / database.

---

## 5. Infrastruktur & Jaringan (Google Cloud)

- [ ] Pastikan service backend dan frontend berjalan di **Cloud Run** dengan endpoint HTTPS; jika menggunakan domain kustom, cek bahwa sertifikat TLS valid dan otomatis diperbarui.
- [ ] Audit konfigurasi Cloud SQL: `ipv4_enabled` harus dimatikan dan `private_network` dihubungkan ke VPC sehingga database **tidak dapat diakses langsung dari internet**.
- [ ] Verifikasi bahwa VPC Access Connector dikonfigurasi dan digunakan oleh Cloud Run backend untuk mengakses Cloud SQL melalui private IP.
- [ ] Tinjau aturan firewall / VPC untuk memastikan hanya port yang diperlukan yang terbuka (80/443 untuk load balancer/HTTP(S) saja, tanpa port DB ke publik).
- [ ] Pastikan image container backend dan frontend dibangun dari **base image resmi** (mis. `php`, `nginx`, `node`) dan disimpan di Artifact Registry.
- [ ] Jika memungkinkan, aktifkan vulnerability scan untuk image di Artifact Registry dan pantau hasilnya secara berkala.

---

## 6. Logging, Monitoring, & Incident Response

- [ ] Konfirmasi bahwa Laravel mengirim log ke output standar (stdout/stderr) sehingga otomatis ditangkap oleh Cloud Logging di lingkungan Cloud Run.
- [ ] Tinjau log untuk memastikan **tidak ada data sensitif** (password, token, isi header Authorization) yang ikut dicetak.
- [ ] Pastikan ada dashboard dasar di Cloud Monitoring untuk memantau error rate (5xx) dan latency utama endpoint API.
- [ ] Dokumentasikan prosedur jika terjadi insiden keamanan (mis. token bocor, kredensial salah konfigurasi): bagaimana cara revoke token, rotasi secret, dan pemberitahuan ke pihak terkait.
- [ ] Tetapkan kebijakan retensi log yang wajar: cukup lama untuk keperluan audit/forensik, tetapi tidak menyimpan data selamanya tanpa alasan.

---

## 7. Proses Operasional & Pemeliharaan

- [ ] Pastikan setiap perubahan pada modul sensitif (auth, order, payment, query DB) melalui **code review** sebelum di-merge ke branch utama.
- [ ] Gunakan tool audit dependensi (`composer audit`, `npm audit`, atau Dependabot) secara berkala dan tindak lanjuti paket yang memiliki CVE penting.
- [ ] Jadwalkan **security review berkala** (mis. setiap iterasi besar / rilis minor), menggunakan checklist ini sebagai dasar evaluasi.
- [ ] Simpan dokumentasi keamanan (arsitektur security, hasil audit, keputusan desain penting) di folder `docs/` dan pastikan mudah diakses oleh tim yang berwenang.

---

> **Catatan:**  
> Checklist ini tidak menggantikan penetration test profesional, tetapi menjadi dasar praktik baik (best practices) untuk menjaga keamanan sistem Kantin RK ITERA sehari-hari.
