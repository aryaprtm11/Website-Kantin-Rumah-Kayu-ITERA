# Panduan Deployment ke Google Cloud Platform (Cloud Run)

Panduan ini menjelaskan cara men-deploy aplikasi Website Kantin Rumah Kayu ITERA (Backend Laravel & Frontend Vue.js) ke Google Cloud Run.

## Prasyarat

1.  Akun Google Cloud Platform (GCP).
2.  Google Cloud SDK (`gcloud` CLI) terinstal di komputer Anda.
3.  Docker terinstal di komputer Anda.

## Langkah 1: Persiapan Project GCP

1.  Login ke Google Cloud:

    ```bash
    gcloud auth login
    ```

2.  Set project ID (ganti `PROJECT_ID` dengan ID project Anda):

    ```bash
    gcloud config set project PROJECT_ID
    ```

3.  Aktifkan API yang diperlukan:
    ```bash
    gcloud services enable run.googleapis.com \
        artifactregistry.googleapis.com \
        cloudbuild.googleapis.com \
        sqladmin.googleapis.com
    ```

## Langkah 2: Persiapan Database (Cloud SQL)

1.  Buat instance Cloud SQL untuk MySQL:

    ```bash
    gcloud sql instances create kantin-db-instance \
        --database-version=MYSQL_8_0 \
        --cpu=1 \
        --memory=3840MiB \
        --region=asia-southeast2
    ```

    _(Region `asia-southeast2` adalah Jakarta. Sesuaikan jika perlu)_

2.  Buat database:

    ```bash
    gcloud sql databases create kantin_db --instance=kantin-db-instance
    ```

3.  Set password untuk user `root` (atau buat user baru):
    ```bash
    gcloud sql users set-password root \
        --host=% \
        --instance=kantin-db-instance \
        --password=PASSWORD_RAHASIA_ANDA
    ```

## Langkah 3: Build & Push Docker Image

Kita akan menggunakan Google Artifact Registry untuk menyimpan image Docker.

1.  Buat repository di Artifact Registry:

    ```bash
    gcloud artifacts repositories create kantin-repo \
        --repository-format=docker \
        --location=asia-southeast2 \
        --description="Repository untuk Website Kantin"
    ```

2.  Konfigurasi Docker untuk autentikasi ke Artifact Registry:

    ```bash
    gcloud auth configure-docker asia-southeast2-docker.pkg.dev
    ```

3.  **Build & Push Backend:**

    ```bash
    cd backend
    docker build -t asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/backend:latest .
    docker push asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/backend:latest
    cd ..
    ```

4.  **Build & Push Frontend:**
    ```bash
    cd frontend
    docker build -t asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/frontend:latest .
    docker push asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/frontend:latest
    cd ..
    ```

## Langkah 4: Deploy Backend ke Cloud Run

Deploy backend terlebih dahulu karena frontend membutuhkan URL backend.

1.  Deploy command:

    ```bash
    gcloud run deploy kantin-backend \
        --image asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/backend:latest \
        --region asia-southeast2 \
        --allow-unauthenticated \
        --add-cloudsql-instances PROJECT_ID:asia-southeast2:kantin-db-instance \
        --set-env-vars="DB_SOCKET=/cloudsql/PROJECT_ID:asia-southeast2:kantin-db-instance" \
        --set-env-vars="DB_CONNECTION=mysql" \
        --set-env-vars="DB_DATABASE=kantin_db" \
        --set-env-vars="DB_USERNAME=root" \
        --set-env-vars="DB_PASSWORD=PASSWORD_RAHASIA_ANDA" \
        --set-env-vars="APP_ENV=production" \
        --set-env-vars="APP_KEY=base64:GENERATE_KEY_DULU_PAKE_ARTISAN_KEY_GENERATE" \
        --set-env-vars="APP_DEBUG=false" \
        --set-env-vars="LOG_CHANNEL=stderr"
    ```

    _Catatan: Pastikan Anda men-generate APP_KEY yang valid (bisa copy dari .env local) dan ganti `PROJECT_ID` serta `PASSWORD_RAHASIA_ANDA`._

2.  Setelah sukses, catat URL backend (misal: `https://kantin-backend-xyz.a.run.app`).

3.  **Migrasi Database:**
    Untuk menjalankan migrasi di Cloud Run, Anda bisa membuat "Job" Cloud Run atau menjalankannya sekali pakai saat build. Cara termudah untuk pemula adalah menggunakan Cloud Run Job:

    ```bash
    gcloud run jobs create migrate-db \
        --image asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/backend:latest \
        --region asia-southeast2 \
        --command "php" \
        --args "artisan","migrate","--force" \
        --add-cloudsql-instances PROJECT_ID:asia-southeast2:kantin-db-instance \
        --set-env-vars="DB_SOCKET=/cloudsql/PROJECT_ID:asia-southeast2:kantin-db-instance" \
        --set-env-vars="DB_CONNECTION=mysql" \
        --set-env-vars="DB_DATABASE=kantin_db" \
        --set-env-vars="DB_USERNAME=root" \
        --set-env-vars="DB_PASSWORD=PASSWORD_RAHASIA_ANDA"

    gcloud run jobs execute migrate-db --region asia-southeast2
    ```

## Langkah 5: Deploy Frontend ke Cloud Run

1.  Deploy command:

    ```bash
    gcloud run deploy kantin-frontend \
        --image asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/frontend:latest \
        --region asia-southeast2 \
        --allow-unauthenticated
    ```

    _Catatan: Frontend Vue.js yang sudah di-build adalah static files. Konfigurasi API URL biasanya dilakukan saat build time (Vite environment variables). Jika Anda menggunakan `.env` di Vue, pastikan variable `VITE_API_URL` mengarah ke URL Backend Cloud Run Anda._

    **PENTING:** Karena Dockerfile frontend melakukan `npm run build`, environment variable harus tersedia SAAT BUILD IMAGE.

    Anda punya dua opsi:
    a. Hardcode URL backend di code frontend (tidak disarankan).
    b. Pass build-arg saat build docker image frontend.

    **Cara dengan Build Arg (Disarankan):**

    Edit `frontend/Dockerfile` tambahkan baris ini sebelum `RUN npm run build`:

    ```dockerfile
    ARG VITE_API_BASE_URL
    ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
    ```

    Lalu build ulang image frontend dengan argumen:

    ```bash
    cd frontend
    docker build \
        --build-arg VITE_API_BASE_URL=https://kantin-backend-xyz.a.run.app \
        -t asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/frontend:latest .
    docker push asia-southeast2-docker.pkg.dev/PROJECT_ID/kantin-repo/frontend:latest
    ```

    Lalu deploy ulang frontend.

## Selesai

Akses URL Frontend Cloud Run Anda untuk melihat aplikasi berjalan.
