# 🔐 Login Feature - Quick Guide

## 🎯 Fitur yang Sudah Dibuat

Saya telah membuat sistem **Authentication lengkap** dengan:

### ✅ Halaman Login
- **URL**: `http://localhost:5173/login`
- Design modern split-screen
- Email & password input
- Loading state & error handling
- Link ke register page

### ✅ Halaman Register  
- **URL**: `http://localhost:5173/register`
- Form pendaftaran lengkap
- Validasi password
- Auto-login setelah register

### ✅ Navbar dengan Auth State
- Show **"Login"** button saat belum login
- Show **"👤 User Name + Logout"** saat sudah login
- Automatic update

---

## 🚀 Cara Menggunakan

### 1️⃣ Akses Halaman Login

Klik tombol **"Login"** di Navbar atau langsung ke:
```
http://localhost:5173/login
```

### 2️⃣ Login

**Masukkan kredensial:**
- Email: `user@example.com` (atau email lain yang sudah terdaftar)
- Password: `password`

**Klik "Masuk"**

✅ Berhasil → Redirect ke Home  
✅ Navbar berubah menampilkan nama user  
❌ Gagal → Error message ditampilkan

### 3️⃣ Register (Jika Belum Punya Akun)

Klik **"Daftar sekarang"** atau langsung ke:
```
http://localhost:5173/register
```

**Isi form:**
- Nama lengkap
- Email
- Password (min. 8 karakter)
- Konfirmasi password

**Klik "Daftar Sekarang"**

✅ Berhasil → Auto-login & redirect ke Home

### 4️⃣ Logout

Klik tombol **"Logout"** di Navbar (setelah login)

✅ Data dihapus dari localStorage  
✅ Navbar kembali menampilkan "Login"  
✅ Redirect ke Home

---

## 📁 File yang Dibuat

```
✅ src/services/authService.ts       - API calls
✅ src/composables/useAuth.ts        - Reusable logic
✅ src/views/Login.vue               - Halaman login
✅ src/views/Register.vue            - Halaman register
✅ src/router/index.ts               - Routes & guards
✅ src/components/Navbar.vue         - Updated
✅ src/types/index.ts                - User interface
✅ src/constants/messages.ts         - Auth messages
```

---

## 🎨 Screenshot (Visual Description)

### Halaman Login:
```
┌──────────────────────────────────────────┐
│                                          │
│  ┌────────────┬──────────────────────┐  │
│  │            │                      │  │
│  │  🏠 Kantin │  Selamat Datang     │  │
│  │  RK ITERA  │  Masuk ke akun Anda │  │
│  │            │                      │  │
│  │  ✨ Pesan  │  Email: [________]  │  │
│  │  dengan    │  Pass:  [________]  │  │
│  │  mudah     │                      │  │
│  │            │  [x] Ingat saya     │  │
│  │  ⚡ Proses │  Lupa password?     │  │
│  │  cepat     │                      │  │
│  │            │  [    MASUK    ]    │  │
│  │  🎯 Banyak │                      │  │
│  │  pilihan   │  Belum punya akun?  │  │
│  │            │  Daftar sekarang    │  │
│  │            │                      │  │
│  │  🍜 🍔 ☕  │  ← Kembali ke Home  │  │
│  └────────────┴──────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔄 Flow Diagram

### Login Flow:
```
User → Login Page → Enter Email & Password 
  → Click "Masuk" → Loading... 
  → Success ✅ → Redirect to Home → Navbar shows "User Name + Logout"
  → Failed ❌ → Show error message → Stay on login page
```

### Register Flow:
```
User → Register Page → Fill form (Name, Email, Password, Confirm)
  → Click "Daftar Sekarang" → Validate password match
  → Loading... → Success ✅ → Auto login → Redirect to Home
  → Failed ❌ → Show error message
```

### Logout Flow:
```
User → Click "Logout" button → Loading...
  → Clear localStorage → Update state 
  → Redirect to Home → Navbar shows "Login"
```

---

## 🔧 Technical Details

### Authentication Method:
- **Type**: JWT (JSON Web Token)
- **Storage**: localStorage
- **Backend**: Laravel Sanctum

### API Endpoints:
```
POST /api/v1/auth/login       - Login
POST /api/v1/auth/register    - Register
POST /api/v1/auth/logout      - Logout
GET  /api/v1/auth/me          - Get current user
```

### Token Management:
- Token disimpan di `localStorage.token`
- Auto-injected ke semua API requests
- Auto-cleared saat logout

---

## ✨ Features

### UI/UX:
✅ **Modern Design** - Split-screen layout  
✅ **Responsive** - Mobile & desktop  
✅ **Animations** - Smooth transitions  
✅ **Loading States** - Spinner saat loading  
✅ **Error Handling** - User-friendly error messages  
✅ **Validation** - Client-side validation  

### Functionality:
✅ **Login** - Email & password  
✅ **Register** - New user registration  
✅ **Logout** - Clear session  
✅ **Persistent Login** - Survive page refresh  
✅ **Auto Redirect** - Smart navigation  
✅ **Route Guards** - Prevent access when logged in  

### Code Quality:
✅ **Clean Code** - Service/Composable pattern  
✅ **TypeScript** - Fully typed  
✅ **Documented** - JSDoc comments  
✅ **Reusable** - useAuth() composable  
✅ **Error Handling** - Comprehensive  

---

## 🧪 Testing

### Test Cases:

#### ✅ Login:
- [x] Login dengan kredensial valid → Success
- [x] Login dengan email salah → Error
- [x] Login dengan password salah → Error
- [x] Login shows loading state
- [x] Redirect ke home setelah login
- [x] Navbar update setelah login

#### ✅ Register:
- [x] Register dengan data valid → Success
- [x] Password tidak match → Error
- [x] Email sudah terdaftar → Error dari backend
- [x] Auto-login setelah register
- [x] Redirect ke home

#### ✅ Logout:
- [x] Logout clears localStorage
- [x] Logout updates navbar
- [x] Logout redirects ke home

#### ✅ Persistence:
- [x] Login persist setelah refresh
- [x] Token included di API requests

---

## 🐛 Troubleshooting

### Problem: Login tidak berhasil

**Solution:**
1. Pastikan backend Laravel running di port 8000
2. Cek console browser untuk error
3. Verify credentials di database
4. Cek CORS settings di backend

### Problem: Setelah login, page refresh kehilangan session

**Solution:**
- Ini seharusnya tidak terjadi karena token disimpan di localStorage
- Check browser console untuk errors
- Verify token masih ada di localStorage: `localStorage.getItem('token')`

### Problem: "Unauthorized" error

**Solution:**
1. Token mungkin expired atau invalid
2. Logout dan login kembali
3. Cek backend token validation

---

## 🎓 How It Works

### Authentication Architecture:

```
┌─────────────┐
│  Component  │  Login.vue / Register.vue
└──────┬──────┘
       │ uses
       ↓
┌─────────────┐
│ Composable  │  useAuth()
└──────┬──────┘  - Shared state
       │ calls   - Business logic
       ↓
┌─────────────┐
│  Service    │  AuthService
└──────┬──────┘  - API calls
       │ HTTP    - Token management
       ↓
┌─────────────┐
│   Backend   │  Laravel API
└─────────────┘  /api/v1/auth/*
```

### State Management:

```typescript
// Shared across all components
const currentUser = ref<User | null>(null);
const isAuthenticated = ref<boolean>(false);

// Any component can use:
const { isAuthenticated, currentUser, login, logout } = useAuth();
```

---

## 💡 Tips

### For Users:
- ✅ Password minimal 8 karakter
- ✅ Gunakan email yang valid
- ✅ Remember browser menyimpan password (optional)

### For Developers:
- ✅ Auth state tersedia di semua component via `useAuth()`
- ✅ Token auto-injected, tidak perlu manual
- ✅ Error messages dari backend otomatis ditampilkan
- ✅ Loading states sudah di-handle di composable

---

## 🚀 Quick Commands

```bash
# Run development server
cd frontend
npm run dev

# Access pages
http://localhost:5173/          # Home
http://localhost:5173/login     # Login
http://localhost:5173/register  # Register
```

---

## 📚 Documentation

Dokumentasi lengkap:
- **`frontend/AUTH_DOCUMENTATION.md`** - Technical documentation
- **`LOGIN_GUIDE.md`** - This file (Quick guide)
- **`QUICK_START.md`** - Getting started
- **`FRONTEND_DOCUMENTATION.md`** - Overall frontend docs

---

## ✅ Summary

### MVP Login Feature: **COMPLETE! 🎉**

Fitur yang sudah jadi:
- ✅ Halaman Login yang modern
- ✅ Halaman Register lengkap
- ✅ Navbar dengan kondisi login/logout
- ✅ JWT authentication
- ✅ localStorage persistence
- ✅ Route guards
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Clean code architecture

**Status:** 🟢 **Ready to Use!**

---

**Happy Coding! 🚀**

