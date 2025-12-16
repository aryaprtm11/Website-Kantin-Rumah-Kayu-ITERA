# K6 Performance Testing - Kantin RK ITERA

Script k6 untuk melakukan performance testing pada aplikasi Kantin RK ITERA berdasarkan skenario yang didefinisikan di `Performa_Testing_Report.md`.

## Prerequisites

### 1. Install k6

**Windows (via Chocolatey):**

```powershell
choco install k6
```

**Windows (via Winget):**

```powershell
winget install k6 --source winget
```

**macOS:**

```bash
brew install k6
```

**Linux:**

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### 2. Setup Test User

Pastikan ada user test di database untuk skenario yang membutuhkan autentikasi:

```sql
-- Buat user test (atau gunakan seeder)
INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES ('Test User', 'testuser@example.com', '$2y$10$...', 'customer', NOW(), NOW());
```

Atau update config di `config.js` dengan credentials user yang valid.

### 3. Setup Data Test

Pastikan database memiliki:

- Minimal 1 tenant aktif
- Minimal beberapa menu per tenant
- Stock menu yang cukup untuk testing

## Struktur File

```
k6-tests/
├── config.js                 # Konfigurasi global (URL, credentials, thresholds)
├── helpers.js                # Helper functions (login, API calls, utils)
├── scenario-1-browsing.js    # Skenario 1: Browsing (Read-heavy)
├── scenario-2-ordering.js    # Skenario 2: Ordering (Write-heavy)
├── scenario-3-mixed.js       # Skenario 3: Mixed Load
├── run-all-scenarios.js      # Jalankan semua skenario berurutan
├── quick-test.js             # Quick test untuk verifikasi setup
├── results/                  # Folder untuk hasil test (auto-generated)
└── README.md                 # Dokumentasi ini
```

## Menjalankan Test

### Quick Test (Verifikasi Setup)

Untuk memastikan setup sudah benar sebelum full test:

```powershell
cd k6-tests
k6 run quick-test.js
```

### Skenario Individual

**Skenario 1 - Browsing (Read-heavy):**

```powershell
k6 run scenario-1-browsing.js
```

**Skenario 2 - Ordering (Write-heavy):**

```powershell
k6 run scenario-2-ordering.js
```

**Skenario 3 - Mixed Load:**

```powershell
k6 run scenario-3-mixed.js
```

### Semua Skenario Berurutan

```powershell
k6 run run-all-scenarios.js
```

### Dengan Custom Configuration

**Custom BASE_URL:**

```powershell
k6 run -e BASE_URL=https://api.kantinrk.example.com scenario-1-browsing.js
```

**Custom Credentials:**

```powershell
k6 run -e BASE_URL=https://api.kantinrk.example.com `
       -e TEST_EMAIL=user@example.com `
       -e TEST_PASSWORD=secretpassword `
       scenario-2-ordering.js
```

**Reduce Duration (for quick test):**

```powershell
k6 run --duration 2m --vus 10 scenario-1-browsing.js
```

## Konfigurasi

Edit `config.js` untuk menyesuaikan:

```javascript
// Base URL API
export const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

// Test user credentials
export const TEST_USER = {
  email: __ENV.TEST_EMAIL || "testuser@example.com",
  password: __ENV.TEST_PASSWORD || "password123",
};
```

## Skenario Detail

### Skenario 1 - Browsing Menu & Tenant (Read-heavy)

| Parameter     | Nilai                                 |
| ------------- | ------------------------------------- |
| Virtual Users | 50                                    |
| Durasi Total  | 10 menit                              |
| Ramp-up       | 2 menit                               |
| Endpoints     | GET /tenants, GET /tenants/{id}/menus |
| Target p95    | < 200ms                               |

### Skenario 2 - Pembuatan Pesanan (Write-heavy)

| Parameter     | Nilai                     |
| ------------- | ------------------------- |
| Virtual Users | 30                        |
| Durasi Total  | 10 menit                  |
| Ramp-up       | 1 menit                   |
| Endpoints     | POST /orders, GET /orders |
| Target p95    | < 400ms                   |

### Skenario 3 - Mixed Load

| Parameter        | Nilai          |
| ---------------- | -------------- |
| Virtual Users    | 80             |
| Durasi Total     | 15 menit       |
| Ramp-up          | 2 menit        |
| Read/Write Ratio | 70% / 30%      |
| Endpoints        | Semua endpoint |
| Target p95       | < 400ms        |

## Metrik yang Diukur

- **http_req_duration**: Waktu respons HTTP
- **read_latency**: Waktu respons untuk operasi read
- **write_latency**: Waktu respons untuk operasi write
- **http_req_failed**: Error rate
- **http_reqs**: Total requests dan throughput

## Hasil Test

Hasil test akan disimpan di folder `results/` dalam format JSON dengan timestamp:

- `results/scenario-1-browsing-{timestamp}.json`
- `results/scenario-2-ordering-{timestamp}.json`
- `results/scenario-3-mixed-{timestamp}.json`
- `results/full-test-{timestamp}.json`

## Troubleshooting

### Error: "Login failed"

- Pastikan user test ada di database
- Periksa credentials di `config.js`
- Pastikan API backend running

### Error: "No tenants found"

- Pastikan ada data tenant di database
- Jalankan seeder jika perlu: `php artisan db:seed`

### Error: "Connection refused"

- Pastikan backend API running
- Periksa BASE_URL di config

### Slow/Timeout

- Kurangi jumlah VUs untuk quick test
- Periksa koneksi database
- Monitor resource backend

## Tips

1. **Jalankan quick-test dulu** sebelum full test untuk validasi setup
2. **Monitor resource** (CPU, memory, DB connections) selama test
3. **Gunakan durasi pendek** untuk testing awal
4. **Simpan hasil** untuk perbandingan setelah optimasi
5. **Test di environment yang mirip production** untuk hasil akurat
