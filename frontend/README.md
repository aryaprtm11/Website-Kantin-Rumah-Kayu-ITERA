# Kantin RK ITERA - Frontend

Website pemesanan makanan dan minuman untuk Kantin Rumah Kayu ITERA.

## 🚀 Teknologi

- **Vue 3** - Progressive JavaScript Framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool yang cepat
- **Vue Router** - Routing untuk aplikasi
- **Axios** - HTTP client untuk API calls
- **Composition API** - Modern Vue patterns
- **Clean Architecture** - Scalable & maintainable

## 📦 Instalasi

```bash
npm install
```

## 🏃 Menjalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 🏗️ Build untuk Production

```bash
npm run build
```

## 📁 Struktur Folder

```
src/
├── assets/          # Asset statis (gambar, dll)
├── components/      # Komponen Vue yang reusable
│   ├── Navbar.vue
│   ├── HeroSection.vue
│   ├── TenantList.vue
│   └── Footer.vue
├── config/          # Konfigurasi aplikasi
│   └── api.ts       # Konfigurasi Axios
├── router/          # Routing configuration
│   └── index.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── views/           # Page components
│   └── Home.vue
├── App.vue          # Root component
├── main.ts          # Entry point
└── style.css        # Global styles
```

## 🔗 API Backend

Frontend ini terhubung dengan Laravel backend yang ada di folder `Backend/`.

Base URL API: `http://localhost:8000/api/v1`

### Endpoints yang digunakan:

- `GET /tenants` - Mengambil daftar kantin
- `GET /tenants/{tenant}/menus` - Mengambil menu dari kantin tertentu

## ✨ Fitur

### Halaman Home (MVP - Iterasi 1) ✅

- ✅ Navbar dengan branding
- ✅ Hero section yang menarik
- ✅ Daftar kantin yang tersedia
- ✅ Footer dengan informasi kontak
- ✅ Responsive design untuk mobile dan desktop
- ✅ Loading state dan error handling
- ✅ Animasi yang smooth

### Authentication (MVP - Iterasi 1) ✅ NEW!

- ✅ **Halaman Login** - Modern split-screen design
- ✅ **Halaman Register** - User registration
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Persistent Login** - localStorage persistence
- ✅ **Navbar Integration** - Show user name & logout
- ✅ **Route Guards** - Protected routes
- ✅ **Error Handling** - User-friendly messages
- ✅ **Loading States** - Smooth UX

📚 **[Login Guide](../LOGIN_GUIDE.md)** | **[Auth Documentation](AUTH_DOCUMENTATION.md)**

## 🎨 Design Features

- Modern gradient backgrounds
- Smooth animations
- Responsive layout
- Professional color scheme (Purple gradient: #667eea to #764ba2)
- User-friendly interface

## 📝 Notes

Ini adalah MVP (Minimum Viable Product) untuk Iterasi 1. Fitur-fitur tambahan akan dikembangkan di iterasi selanjutnya.

## 👥 Team

Developed by ITERA Students
