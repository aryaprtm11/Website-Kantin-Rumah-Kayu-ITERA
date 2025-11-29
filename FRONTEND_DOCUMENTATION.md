# 📱 Dokumentasi Frontend - Kantin RK ITERA

## 🎯 Overview

Website pemesanan makanan dan minuman untuk **Kantin Rumah Kayu ITERA**. Ini adalah implementasi MVP (Minimum Viable Product) untuk Iterasi 1 yang fokus pada halaman Home.

## ✅ Apa yang Telah Dibuat

### 1. **Setup Project**
   - ✅ Vue 3 + TypeScript + Vite
   - ✅ Vue Router untuk navigasi
   - ✅ Axios untuk API calls
   - ✅ Konfigurasi API yang terhubung ke backend Laravel

### 2. **Struktur Komponen**

#### 📌 Navbar (`src/components/Navbar.vue`)
- Logo dan branding "🏠 Kantin RK ITERA"
- Navigation links (Home, Kantin, Tentang)
- Tombol Login
- Sticky navbar dengan gradient purple
- Responsive design

#### 🎨 Hero Section (`src/components/HeroSection.vue`)
- Judul utama dengan gradient text
- Deskripsi layanan
- 2 CTA buttons (Lihat Menu, Cara Pemesanan)
- Statistik (10+ Kantin, 50+ Menu, 1000+ Pesanan)
- Ilustrasi dengan emoji makanan yang animated
- Background gradient yang menarik
- Animasi fade in yang smooth

#### 🏪 Tenant List (`src/components/TenantList.vue`)
- Fetching data kantin dari API `/api/v1/tenants`
- Grid layout untuk menampilkan kartu kantin
- Setiap kartu menampilkan:
  - Logo/gambar kantin (dengan placeholder emoji 🏪)
  - Nama kantin
  - Deskripsi
  - Status (Buka/Tutup) dengan badge berwarna
  - Tombol "Lihat Menu"
- Loading state dengan spinner
- Error handling dengan retry button
- Hover effects yang smooth
- Responsive grid

#### 📄 Footer (`src/components/Footer.vue`)
- 4 kolom informasi:
  1. About & Social Links
  2. Menu Cepat (navigasi)
  3. Informasi (FAQ, Kebijakan, dll)
  4. Kontak (lokasi, email, telepon)
- Dark gradient background
- Link hover effects
- Copyright information

### 3. **Halaman & Routing**

#### 🏠 Home Page (`src/views/Home.vue`)
- Mengintegrasikan semua komponen
- Route: `/`

#### 🔀 Router (`src/router/index.ts`)
- Vue Router configuration
- History mode
- Ready untuk tambahan routes

### 4. **Configuration & Types**

#### ⚙️ API Config (`src/config/api.ts`)
- Axios instance dengan base URL: `http://localhost:8000/api/v1`
- Automatic token injection dari localStorage
- Interceptor untuk authentication

#### 📝 TypeScript Types (`src/types/index.ts`)
- `Tenant` interface
- `Menu` interface
- `ApiResponse<T>` generic type

### 5. **Styling**

#### 🎨 Design System
- **Primary Color**: Purple gradient (#667eea → #764ba2)
- **Font**: System fonts yang modern
- **Animations**: Fade in, float, hover effects
- **Responsive**: Mobile-first approach

#### 📱 Responsive Breakpoints
- Desktop: 1200px max-width containers
- Tablet: Adjusts at 768px
- Mobile: Single column layouts

## 🚀 Cara Menjalankan

### Prerequisites
Pastikan backend Laravel sudah berjalan di `http://localhost:8000`

### Langkah-langkah:

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   
   Server akan berjalan di: http://localhost:5173

3. **Build untuk Production**
   ```bash
   npm run build
   ```

## 📊 Fitur yang Sudah Diimplementasi

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Navbar | ✅ | Sticky navbar dengan branding |
| Hero Section | ✅ | Dengan CTA buttons dan statistik |
| Tenant List | ✅ | Fetch data dari API + loading/error state |
| Footer | ✅ | Informasi lengkap dengan 4 kolom |
| Responsive Design | ✅ | Mobile, tablet, desktop |
| Animations | ✅ | Smooth transitions & hover effects |
| API Integration | ✅ | Terhubung ke Laravel backend |
| Error Handling | ✅ | Loading state & error messages |
| TypeScript | ✅ | Type-safe code |

## 🎯 Teknologi Stack

```
Frontend:
├── Vue 3 (Composition API)
├── TypeScript
├── Vite (Build tool)
├── Vue Router 4
└── Axios

Backend (sudah ada):
└── Laravel (PHP)
```

## 📁 File Structure

```
frontend/
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # Vue components
│   │   ├── Navbar.vue
│   │   ├── HeroSection.vue
│   │   ├── TenantList.vue
│   │   └── Footer.vue
│   ├── config/
│   │   └── api.ts           # Axios configuration
│   ├── router/
│   │   └── index.ts         # Vue Router setup
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── views/
│   │   └── Home.vue         # Home page
│   ├── App.vue              # Root component
│   ├── main.ts              # Entry point
│   └── style.css            # Global styles
├── public/                  # Public assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🌟 Highlights

### Design Features:
- ✨ Modern gradient backgrounds
- 🎭 Smooth animations & transitions
- 📱 Fully responsive
- 🎨 Professional color palette
- 💫 Interactive hover effects
- 🔄 Loading states
- ❌ Error handling

### Code Quality:
- 📝 TypeScript untuk type safety
- 🧩 Component-based architecture
- 🔌 Reusable components
- 🎯 Clean code structure
- 📚 Well-documented

## 🔄 API Integration

### Endpoints yang Digunakan:

**GET /api/v1/tenants**
```typescript
Response: {
  data: Tenant[]
}
```

Tenant interface:
```typescript
interface Tenant {
  id: number;
  name: string;
  description: string;
  logo?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## 📸 Preview

### Halaman Home terdiri dari:

1. **Navbar** (Top)
   - Gradient purple background
   - Logo & tagline
   - Navigation links
   - Login button

2. **Hero Section**
   - Welcome message dengan gradient text
   - Deskripsi layanan
   - 2 CTA buttons
   - Statistik (3 items)
   - Ilustrasi makanan animated

3. **Tenant List Section**
   - Section title & description
   - Grid of tenant cards
   - Each card shows: image, name, description, status, CTA button
   - Loading spinner saat fetch data
   - Error message dengan retry button

4. **Footer**
   - 4 kolom informasi
   - Social media links
   - Quick links
   - Contact information
   - Copyright

## 🎨 Color Palette

```css
Primary Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Background: #f5f7fa → #c3cfe2
Text Dark: #2d3748
Text Light: #718096
Success: #c6f6d5 (Green)
Error: #fed7d7 (Red)
White: #ffffff
```

## 📱 Responsive Behavior

### Desktop (> 1200px)
- Full width containers (max 1200px)
- Grid layout 3-4 columns
- Side-by-side hero content

### Tablet (768px - 1200px)
- Adjusted grid (2-3 columns)
- Smaller font sizes
- Stacked navigation

### Mobile (< 768px)
- Single column layout
- Stacked hero sections
- Full-width cards
- Hamburger menu (ready for implementation)

## 🚧 Next Steps (Iterasi Berikutnya)

Untuk pengembangan selanjutnya, bisa ditambahkan:

1. **Halaman Detail Kantin**
   - Menampilkan menu dari kantin tertentu
   - Filter & search menu

2. **Halaman Login/Register**
   - Form authentication
   - Integration dengan API auth

3. **Halaman Order/Cart**
   - Shopping cart
   - Checkout process

4. **Halaman Profile**
   - User profile
   - Order history

5. **Fitur Tambahan**
   - Search functionality
   - Filter kantin
   - Rating & review
   - Payment integration

## 💡 Tips Pengembangan

1. **Testing Backend**
   - Pastikan Laravel backend running di port 8000
   - Test API endpoints dengan Postman/Thunder Client dulu

2. **CORS Issues**
   - Jika ada CORS error, config di Laravel backend:
   ```php
   // config/cors.php
   'allowed_origins' => ['http://localhost:5173']
   ```

3. **Development**
   - Hot reload otomatis dengan Vite
   - Vue DevTools untuk debugging
   - Browser console untuk error checking

## 👨‍💻 Maintainability

Code ini dibuat dengan prinsip:
- ✅ Clean & readable
- ✅ Modular components
- ✅ Type-safe dengan TypeScript
- ✅ Consistent naming
- ✅ Well-commented
- ✅ Scalable architecture

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check browser console untuk error
2. Check terminal untuk server errors
3. Verify backend API responses
4. Check network tab di browser DevTools

---

**Status**: ✅ Selesai - Siap untuk demo MVP Iterasi 1

**Created**: November 2025
**Framework**: Vue 3 + TypeScript + Vite
**Author**: ITERA Development Team

