# 📚 Dokumentasi Kantin RK ITERA

Selamat datang di pusat dokumentasi Kantin RK ITERA. Folder ini berisi dokumentasi lengkap sistem.

## 📁 Struktur Dokumentasi

| File | Deskripsi | Untuk Siapa |
|------|-----------|-------------|
| **architecture.md** | Arsitektur sistem, design patterns, dan teknologi stack | Developer, System Architect |
| **api-spec.md** | Spesifikasi lengkap REST API dengan contoh request/response | Developer, API Consumer |
| **user-manual.md** | Panduan penggunaan aplikasi untuk end-user | Customer, Tenant Admin, End User |

## 🎯 Quick Links

### Untuk Developer

- [Arsitektur Sistem](architecture.md)
  - High-level architecture
  - Backend structure (Laravel)
  - Frontend structure (Vue.js)
  - Database schema & ERD
  - Security architecture
  - Deployment architecture
  - Technology stack

- [API Specification](api-spec.md)
  - Authentication endpoints
  - Public endpoints
  - Customer endpoints
  - Tenant admin endpoints
  - Error responses
  - Rate limiting
  - Testing examples

### Untuk End User

- [User Manual](USER_MANUAL.md)
  - Panduan Customer (Pembeli)
  - Panduan Tenant Admin (Pemilik Kantin)
  - Panduan Super Admin
  - FAQ
  - Troubleshooting
  - Tips & best practices

## 📖 Cara Membaca Dokumentasi

### 1. Developer Baru

Baca dalam urutan ini:
1. ✅ [architecture.md](architecture.md) - Pahami sistem secara keseluruhan
2. ✅ [api-spec.md](api-spec.md) - Pelajari API yang tersedia
3. ✅ Backend README (`Backend/README.md`)
4. ✅ Frontend README (`frontend/README.md`)

### 2. Frontend Developer

1. ✅ [architecture.md](architecture.md) - Section "Arsitektur Frontend"
2. ✅ [api-spec.md](api-spec.md) - Semua endpoints yang digunakan
3. ✅ Frontend README

### 3. Backend Developer

1. ✅ [architecture.md](architecture.md) - Section "Arsitektur Backend"
2. ✅ [api-spec.md](api-spec.md) - Implementasi endpoints
3. ✅ Backend README

### 4. End User / Customer

1. ✅ [user-manual.md](user-manual.md) - Section "Panduan Customer"
2. ✅ FAQ
3. ✅ Troubleshooting

### 5. Tenant Admin

1. ✅ [user-manual.md](user-manual.md) - Section "Panduan Tenant Admin"
2. ✅ FAQ
3. ✅ Troubleshooting

### 6. System Administrator

1. ✅ [architecture.md](architecture.md) - Seluruh dokumen
2. ✅ [user-manual.md](user-manual.md) - Section "Panduan Super Admin"
3. ✅ Deployment guides

## 🔍 Mencari Informasi Spesifik

### Autentikasi
- **Arsitektur**: [architecture.md#security-architecture](architecture.md#security-architecture)
- **API**: [api-spec.md#authentication-endpoints](api-spec.md#authentication-endpoints)
- **User Guide**: [user-manual.md#login](user-manual.md#login)

### Order Management
- **Arsitektur**: [architecture.md#order-creation-flow](architecture.md#order-creation-flow)
- **API**: [api-spec.md#customer-endpoints](api-spec.md#customer-endpoints)
- **User Guide**: [user-manual.md#review--checkout](user-manual.md#review--checkout)

### Menu Management
- **Arsitektur**: [architecture.md#database-schema](architecture.md#database-schema)
- **API**: [api-spec.md#tenant-admin-endpoints](api-spec.md#tenant-admin-endpoints)
- **User Guide**: [user-manual.md#kelola-menu](user-manual.md#kelola-menu)

### Database
- **Arsitektur**: [architecture.md#database-schema](architecture.md#database-schema)
- **ERD**: Lihat diagram di architecture.md

### Deployment
- **Arsitektur**: [architecture.md#deployment-architecture](architecture.md#deployment-architecture)
- **Guide**: Lihat `DEPLOY_CLOUD_RUN.md` di root project

## 📝 Update Documentation

Dokumentasi ini harus diupdate setiap ada perubahan signifikan:

### Kapan Update?

- ✅ Menambah/mengubah API endpoint
- ✅ Menambah fitur baru
- ✅ Mengubah flow business logic
- ✅ Update teknologi/library major
- ✅ Perubahan arsitektur

### Cara Update

1. Edit file markdown yang relevan
2. Update version & last updated date
3. Commit dengan message jelas
4. Notify team

## 🤝 Contributing

Jika menemukan kesalahan atau ingin menambahkan dokumentasi:

1. Fork repository
2. Edit dokumentasi
3. Submit pull request
4. Include reason for changes

## 📚 Dokumentasi Tambahan

Lokasi dokumentasi lain di project:

- **Root README**: `../README.md` - Overview project
- **Backend README**: `../Backend/README.md` - Backend-specific docs
- **Frontend README**: `../frontend/README.md` - Frontend-specific docs
- **ENV Guide**: `../frontend/ENV_GUIDE.md` - Environment setup
- **Deploy Guide**: `../DEPLOY_CLOUD_RUN.md` - Cloud deployment
- **Docker Guide**: `../README.Docker.md` - Docker setup

## 🔗 External Resources

### Laravel
- [Laravel Documentation](https://laravel.com/docs)
- [Laravel API Resources](https://laravel.com/docs/eloquent-resources)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)

### Vue.js
- [Vue 3 Documentation](https://vuejs.org)
- [Vue Router](https://router.vuejs.org)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

### Google Cloud
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build](https://cloud.google.com/build/docs)

## 📞 Kontak

**Documentation Team**:
- Email: dev@kantin-rk.itera.ac.id

**Technical Support**:
- Email: support@kantin-rk.itera.ac.id

---

## Version Info

| Document | Version | Last Updated |
|----------|---------|--------------|
| architecture.md | 1.0 | Dec 2025 |
| api-spec.md | 1.0 | Dec 2025 |
| user-manual.md | 1.0 | Dec 2025 |

---

**Maintained by**: ITERA Development Team  
**Project**: Kantin RK ITERA  
**Year**: 2025

