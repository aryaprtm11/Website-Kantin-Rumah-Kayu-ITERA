# IAM Policy – Google Cloud Platform (GCP)
## Website Kantin Rumah Kayu ITERA

---

## 1. Tujuan Dokumen

Dokumen ini menjelaskan kebijakan **Identity and Access Management (IAM)** pada Google Cloud Platform (GCP) yang diterapkan dalam proyek **Website Kantin Rumah Kayu ITERA**.  
Tujuan utama dari kebijakan ini adalah untuk mengatur hak akses setiap anggota tim secara aman, terkontrol, dan sesuai dengan prinsip **least privilege**.

---

## 2. Ruang Lingkup

IAM Policy ini berlaku untuk seluruh resource Google Cloud Platform yang digunakan dalam proyek, meliputi:
- Cloud Run
- Cloud Build
- Artifact Registry
- Secret Manager
- (Opsional) Cloud Storage dan Cloud SQL

Kebijakan ini mencakup akses pengguna (user account) dan service account yang digunakan selama proses pengembangan dan deployment.

---

## 3. Konsep Dasar IAM

| Istilah | Deskripsi |
|-------|-----------|
| **Principal** | Identitas yang diberikan akses (user atau service account). |
| **Role** | Kumpulan permission yang menentukan aksi apa saja yang dapat dilakukan. |
| **Permission** | Hak akses spesifik terhadap resource GCP. |
| **Resource** | Layanan atau komponen yang berada dalam satu project GCP. |

---

## 4. Daftar Anggota dan Peran

| Nama | Peran | Deskripsi Singkat |
|----|------|----------------|
| Arya Pratama | Project Lead | Mengelola IAM dan kebijakan akses |
| Silva Oktavia | Cloud Engineer | Mengelola infrastruktur dan CI/CD |
| Afencius Marbun | Backend Engineer | Mengembangkan dan deploy backend |
| Ikhsanudin Lathief | Frontend Engineer | Mengembangkan dan deploy frontend |
| Giulia | QA Engineer | Pengujian dan verifikasi sistem |
| Irma Amelia | Dokumentasi | Dokumentasi dan monitoring |

---

## 5. Detail Role dan Hak Akses

### 5.1 Project Lead – Arya Pratama

**Role GCP:**
- `roles/resourcemanager.projectIamAdmin`
- `roles/viewer`

**Hak Akses:**
- Mengelola IAM Policy pada level project
- Menambahkan dan menghapus anggota tim
- Melakukan audit akses dan konfigurasi
- Akses baca ke seluruh resource GCP

---

### 5.2 Cloud Engineer – Silva Oktavia

**Role GCP:**
- `roles/run.admin`
- `roles/cloudbuild.builds.editor`
- `roles/artifactregistry.admin`
- `roles/iam.serviceAccountAdmin`
- `roles/iam.serviceAccountUser`
- `roles/secretmanager.admin`

**Hak Akses:**
- Deploy dan mengelola Cloud Run services
- Mengelola pipeline CI/CD melalui Cloud Build
- Mengelola image container pada Artifact Registry
- Membuat dan mengatur service account
- Mengelola secret dan konfigurasi environment

---

### 5.3 Backend Engineer – Afencius Marbun

**Role GCP:**
- `roles/run.developer`
- `roles/logging.viewer`
- `roles/secretmanager.secretAccessor`

**Hak Akses:**
- Deploy dan update backend service di Cloud Run (development)
- Mengakses log untuk debugging
- Mengakses secret yang dibutuhkan backend

---

### 5.4 Frontend Engineer – Ikhsanudin Lathief

**Role GCP:**
- `roles/cloudbuild.builds.editor`
- `roles/storage.objectAdmin`
- `roles/logging.viewer`

**Hak Akses:**
- Menjalankan dan memantau pipeline build frontend
- Mengelola file static frontend (jika menggunakan Cloud Storage)
- Melihat log build dan deployment

---

### 5.5 QA Engineer – Giulia

**Role GCP:**
- `roles/viewer`
- `roles/run.viewer`
- `roles/logging.viewer`
- `roles/cloudbuild.builds.viewer`

**Hak Akses:**
- Melihat status Cloud Run services
- Melakukan pengujian sistem
- Mengakses log aplikasi dan hasil build
- Tidak memiliki akses deploy atau edit konfigurasi

---

### 5.6 Dokumentasi – Irma Amelia

**Role GCP:**
- `roles/viewer`
- `roles/monitoring.viewer`

**Hak Akses:**
- Akses baca ke seluruh resource GCP
- Melihat data monitoring dan performa sistem
- Mendukung dokumentasi teknis proyek

---

## 6. Service Account

Untuk menjaga keamanan dan automasi, digunakan service account khusus:

### 6.1 Service Account CI/CD
Digunakan oleh Cloud Build untuk deployment otomatis.

**Role:**
- `roles/run.admin`
- `roles/artifactregistry.writer`
- `roles/secretmanager.secretAccessor`
- `roles/iam.serviceAccountUser`

---