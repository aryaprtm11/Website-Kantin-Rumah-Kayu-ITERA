# 🚀 Quick Start Guide - Kantin RK ITERA

## Cara Cepat Memulai

### 1️⃣ Jalankan Backend (Laravel)

```bash
# Terminal 1 - Backend
cd Backend
php artisan serve
```

Backend akan berjalan di: **http://localhost:8000**

### 2️⃣ Jalankan Frontend (Vue)

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173**

### 3️⃣ Buka Browser

Akses: **http://localhost:5173**

---

## 🎯 Yang Sudah Dibuat

### ✅ Halaman Home - MVP Iterasi 1

Halaman home yang sudah jadi terdiri dari:

1. **Navbar** 
   - Logo "🏠 Kantin RK ITERA"
   - Menu navigasi
   - Tombol Login

2. **Hero Section**
   - Judul besar dengan gradient
   - Deskripsi layanan
   - 2 tombol CTA (Lihat Menu, Cara Pemesanan)
   - Statistik (10+ Kantin, 50+ Menu, 1000+ Pesanan)
   - Animasi emoji makanan

3. **Daftar Kantin**
   - Menampilkan semua kantin dari database
   - Setiap kartu kantin menampilkan:
     * Logo/gambar kantin
     * Nama kantin
     * Deskripsi
     * Status (Buka/Tutup)
     * Tombol "Lihat Menu"
   - Loading state saat mengambil data
   - Error handling jika gagal

4. **Footer**
   - Informasi kontak
   - Link-link penting
   - Social media icons

---

## 📂 Struktur File yang Dibuat

```
frontend/src/
├── components/
│   ├── Navbar.vue          ✅ Komponen navbar
│   ├── HeroSection.vue     ✅ Komponen hero/banner
│   ├── TenantList.vue      ✅ Komponen daftar kantin
│   └── Footer.vue          ✅ Komponen footer
├── views/
│   └── Home.vue            ✅ Halaman home
├── config/
│   └── api.ts              ✅ Konfigurasi API
├── types/
│   └── index.ts            ✅ TypeScript types
├── router/
│   └── index.ts            ✅ Router configuration
├── App.vue                 ✅ Updated
├── main.ts                 ✅ Updated
└── style.css               ✅ Global styles
```

---

## 🎨 Tampilan Website

### Warna Utama
- **Primary**: Purple gradient (#667eea → #764ba2)
- **Background**: Light gray gradient
- **Text**: Dark gray (#2d3748)

### Fitur Design
- ✨ Modern & clean design
- 📱 Responsive (mobile, tablet, desktop)
- 🎭 Smooth animations
- 💫 Hover effects
- 🔄 Loading states

---

## 🔌 Koneksi API

Frontend sudah dikonfigurasi untuk terhubung ke backend:

- **Base URL**: http://localhost:8000/api/v1
- **Endpoint yang dipakai**: 
  - `GET /tenants` - Mengambil daftar kantin

---

## ⚠️ Troubleshooting

### Jika frontend tidak muncul data kantin:

1. **Pastikan backend berjalan**
   ```bash
   curl http://localhost:8000/api/v1/tenants
   ```

2. **Check CORS** - Jika ada error CORS, tambahkan di Laravel:
   ```php
   // Backend/config/cors.php
   'allowed_origins' => ['http://localhost:5173']
   ```

3. **Cek browser console** - Buka DevTools (F12) dan lihat error di Console tab

### Jika port sudah terpakai:

**Frontend**:
```bash
npm run dev -- --port 3000
```

**Backend**:
```bash
php artisan serve --port 8001
```
(Jangan lupa update `frontend/src/config/api.ts`)

---

## 📱 Testing di Mobile

1. **Cari IP address komputer**:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Jalankan frontend dengan host**:
   ```bash
   npm run dev -- --host
   ```

3. **Akses dari HP** di network yang sama:
   ```
   http://[IP_ADDRESS]:5173
   ```

---

## 🎯 Fitur yang Bisa Ditambah (Next Iteration)

- [ ] Halaman detail kantin dengan daftar menu
- [ ] Sistem login/register
- [ ] Shopping cart
- [ ] Checkout & payment
- [ ] Order history
- [ ] Profile page
- [ ] Search & filter
- [ ] Rating & review

---

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

---

## 📚 Dokumentasi Lengkap

Lihat `FRONTEND_DOCUMENTATION.md` untuk dokumentasi detail.

---

**Status**: ✅ **Ready to Demo!**

Website sudah siap untuk demo sebagai MVP Iterasi 1. Semua komponen sudah berfungsi dengan baik dan responsive di berbagai device.

**Selamat Mencoba! 🎉**

