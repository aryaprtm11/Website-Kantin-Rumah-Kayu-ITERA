# 🏗️ Arsitektur Sistem - Kantin RK ITERA

## 📋 Gambaran Umum

Kantin RK adalah sistem pemesanan makanan dan minuman berbasis web dengan arsitektur **Client-Server** yang menggunakan **RESTful API** sebagai layer komunikasi.

## 🎯 Arsitektur High-Level

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Vue.js SPA (Single Page Application)           │ │
│  │  - Vue 3 + Composition API + TypeScript                │ │
│  │  - Vue Router (Client-side routing)                    │ │
│  │  - Axios (HTTP Client)                                 │ │
│  │  - Reactive State Management                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/HTTPS
                         REST API (JSON)
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Laravel Backend API                        │ │
│  │  - Laravel 12 + PHP 8.2                                │ │
│  │  - RESTful API Endpoints                               │ │
│  │  - JWT Authentication (Laravel Sanctum)                │ │
│  │  - Role-Based Access Control (RBAC)                    │ │
│  │  - Business Logic & Validation                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
                         ORM (Eloquent)
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    MySQL 8.0                            │ │
│  │  - Relational Database                                 │ │
│  │  - ACID Transactions                                   │ │
│  │  - Indexed Queries                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🏛️ Arsitektur Backend (Laravel)

### Layer Structure

```
Backend/
├── app/
│   ├── Enums/               # Enum types (Role, Status, Payment)
│   ├── Http/
│   │   ├── Controllers/     # API Controllers (Request handling)
│   │   │   └── Api/V1/      # Versioned API controllers
│   │   ├── Requests/        # Form Request Validation
│   │   └── Resources/       # API Response Transformation
│   ├── Models/              # Eloquent Models (Data entities)
│   └── Policies/            # Authorization Policies (RBAC)
├── database/
│   ├── migrations/          # Database schema migrations
│   ├── seeders/             # Sample data seeders
│   └── factories/           # Model factories for testing
├── routes/
│   └── api.php              # API route definitions
└── config/
    └── cors.php             # CORS configuration
```

### Design Patterns

1. **MVC Pattern** (Model-View-Controller)
   - **Model**: Eloquent ORM models (`User`, `Tenant`, `Menu`, `Order`)
   - **Controller**: API Controllers untuk handle request
   - **View**: JSON responses (API Resource classes)

2. **Repository Pattern** (via Eloquent ORM)
   - Models sebagai abstraction layer ke database
   - Query Builder untuk complex queries

3. **Service Layer Pattern**
   - Business logic di Controllers dan Models
   - Validation di Form Request classes

4. **Policy-Based Authorization**
   - Laravel Policies untuk RBAC
   - Gate-based permission checking

### API Versioning

API menggunakan **URL-based versioning**:
- Base URL: `/api/v1`
- Future versions: `/api/v2`, `/api/v3`, dst.

Benefit: Backward compatibility untuk client lama.

## 🎨 Arsitektur Frontend (Vue.js)

### Layer Structure

```
frontend/
├── src/
│   ├── assets/              # Static assets (images, icons)
│   ├── components/          # Reusable Vue components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   └── ...              # Shared components
│   ├── composables/         # Vue Composition API composables
│   │   ├── useAuth.ts       # Authentication logic
│   │   ├── useCart.ts       # Shopping cart logic
│   │   └── useTenants.ts    # Tenant data logic
│   ├── config/
│   │   └── api.ts           # Axios configuration & interceptors
│   ├── constants/           # App-wide constants
│   ├── router/
│   │   └── index.ts         # Vue Router configuration
│   ├── services/            # API service layer
│   │   ├── authService.ts   # Auth API calls
│   │   ├── orderService.ts  # Order API calls
│   │   └── tenantService.ts # Tenant API calls
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   └── views/               # Page components (routes)
│       ├── dashboard/       # Dashboard pages
│       ├── customer/        # Customer pages
│       └── tenant/          # Tenant admin pages
└── public/                  # Public static files
```

### Design Patterns

1. **Composition API Pattern**
   - Composables untuk reusable logic
   - Reactive state dengan `ref()` dan `reactive()`

2. **Service Layer Pattern**
   - API calls isolated dalam service classes
   - Components hanya consume services

3. **Centralized State Management**
   - Shared state di composables
   - Reactive updates across components

4. **Route-Based Code Splitting**
   - Lazy loading untuk pages
   - Optimized bundle size

## 🔄 Request Flow

### 1. Authentication Flow

```
┌──────────┐     1. Login      ┌──────────┐
│          │  ───────────────>  │          │
│  Client  │                    │  Server  │
│ (Vue.js) │  <───────────────  │ (Laravel)│
│          │  2. JWT Token +    │          │
└──────────┘     User Data      └──────────┘
     │                                │
     │ 3. Store token                 │
     │    in localStorage             │
     │                                │
     │ 4. All subsequent requests     │
     │    include token in header     │
     ├───────────────────────────────>│
     │    Authorization: Bearer <token>
     │                                │
     │ 5. Verify token & return data  │
     │<───────────────────────────────┤
```

**Steps:**
1. User submit credentials (email + password)
2. Backend validates → returns JWT token + user data
3. Frontend stores token di `localStorage`
4. All API requests include token di header
5. Backend verifies token setiap request

### 2. Order Creation Flow

```
Customer              Frontend            Backend           Database
   │                     │                   │                 │
   │  1. Browse menus    │                   │                 │
   ├────────────────────>│                   │                 │
   │                     │  2. GET /tenants  │                 │
   │                     ├──────────────────>│  3. Query       │
   │                     │                   ├────────────────>│
   │                     │                   │  4. Results     │
   │                     │  5. Tenant data   │<────────────────┤
   │  6. Display         │<──────────────────┤                 │
   │<────────────────────┤                   │                 │
   │                     │                   │                 │
   │  7. Add to cart     │                   │                 │
   ├────────────────────>│ (local state)     │                 │
   │                     │                   │                 │
   │  8. Checkout        │                   │                 │
   ├────────────────────>│  9. POST /orders  │                 │
   │                     ├──────────────────>│                 │
   │                     │                   │ 10. Validate    │
   │                     │                   │ 11. Start TX    │
   │                     │                   ├────────────────>│
   │                     │                   │ 12. Insert order│
   │                     │                   ├────────────────>│
   │                     │                   │ 13. Insert items│
   │                     │                   ├────────────────>│
   │                     │                   │ 14. Update stock│
   │                     │                   ├────────────────>│
   │                     │                   │ 15. Commit TX   │
   │                     │ 16. Order created │<────────────────┤
   │  17. Success page   │<──────────────────┤                 │
   │<────────────────────┤                   │                 │
```

**Steps:**
1. Customer browse tenant menus
2. Frontend fetch data dari backend
3. Backend query database
4. Return results
5. Frontend display menus
6. Customer adds items to cart (local state)
7. Customer proceeds to checkout
8. Frontend sends order data
9. Backend validates (auth, stock, prices)
10. Start database transaction
11. Create order record
12. Create order items
13. Update menu stock
14. Commit transaction
15. Return success
16. Frontend shows confirmation

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    users    │         │   tenants   │         │    menus    │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id          │────┐    │ id          │────┐    │ id          │
│ name        │    │    │ user_id     │◄───┘    │ tenant_id   │◄───┐
│ email       │    │    │ name        │         │ name        │    │
│ password    │    │    │ opens_at    │         │ price       │    │
│ role        │    │    │ closes_at   │         │ category    │    │
│ created_at  │    │    │ created_at  │         │ photo_url   │    │
│ updated_at  │    │    │ updated_at  │         │ stock       │    │
└─────────────┘    │    └─────────────┘         │ created_at  │    │
                   │           │                 │ updated_at  │    │
                   │           │                 └─────────────┘    │
                   │           │                        │           │
                   │           └────────────┐           │           │
                   │                        │           │           │
                   │                        ▼           │           │
                   │                 ┌─────────────┐    │           │
                   │                 │   orders    │    │           │
                   │                 ├─────────────┤    │           │
                   └────────────────>│ id          │    │           │
                                     │ user_id     │    │           │
                                  ┌──│ tenant_id   │    │           │
                                  │  │ total_price │    │           │
                                  │  │ type        │    │           │
                                  │  │ status      │    │           │
                                  │  │ payment_status   │           │
                                  │  │ paid_amount │    │           │
                                  │  │ picked_up_at│    │           │
                                  │  │ completed_at│    │           │
                                  │  │ created_at  │    │           │
                                  │  │ updated_at  │    │           │
                                  │  └─────────────┘    │           │
                                  │         │           │           │
                                  │         │           │           │
                                  │         ▼           │           │
                                  │  ┌─────────────┐    │           │
                                  │  │ order_items │    │           │
                                  │  ├─────────────┤    │           │
                                  └─>│ id          │    │           │
                                     │ order_id    │    │           │
                                     │ menu_id     │────┘           │
                                     │ quantity    │                │
                                     │ unit_price  │                │
                                     │ subtotal    │                │
                                     │ created_at  │                │
                                     │ updated_at  │                │
                                     └─────────────┘
```

### Relationships

- **User → Tenant**: One-to-One (1 user bisa punya 1 tenant)
- **User → Orders**: One-to-Many (1 user bisa punya banyak orders)
- **Tenant → Menus**: One-to-Many (1 tenant punya banyak menus)
- **Tenant → Orders**: One-to-Many (1 tenant menerima banyak orders)
- **Order → OrderItems**: One-to-Many (1 order punya banyak items)
- **Menu → OrderItems**: One-to-Many (1 menu bisa di-order berkali-kali)

## 🔐 Security Architecture

### 1. Authentication

**Method**: Token-based authentication (Laravel Sanctum)

```
┌──────────┐                          ┌──────────┐
│  Client  │  1. POST /auth/login     │  Server  │
│          ├─────────────────────────>│          │
│          │  { email, password }     │          │
│          │                          │ 2. Verify│
│          │                          │          │
│          │  3. Return token         │          │
│          │<─────────────────────────┤          │
│          │  { user, token }         │          │
│          │                          │          │
│  Store   │                          │          │
│  token   │                          │          │
│          │                          │          │
│          │  4. Subsequent requests  │          │
│          ├─────────────────────────>│          │
│          │  Header:                 │ 5. Verify│
│          │  Authorization: Bearer   │   token  │
│          │  <token>                 │          │
└──────────┘                          └──────────┘
```

### 2. Authorization (RBAC)

**Roles:**
- **Customer**: Browse menus, place orders, track orders
- **Tenant Admin**: Manage menus, process orders
- **Super Admin**: Full system access

**Implementation:**
- Laravel Policies untuk resource-level authorization
- Route middleware untuk role checking
- Frontend route guards untuk UI protection

### 3. Data Validation

**Backend (Laravel):**
- Form Request classes untuk validation
- Database constraints (foreign keys, NOT NULL)
- Business logic validation

**Frontend (Vue):**
- Form validation sebelum submit
- Type checking dengan TypeScript
- User-friendly error messages

### 4. CORS (Cross-Origin Resource Sharing)

```php
// Backend/config/cors.php
'allowed_origins' => [
    'https://frontend-domain.com',
    'http://localhost:5173',  // Development
],
'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

## 📡 API Communication

### Request/Response Format

**Request:**
```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "tenant_id": 1,
  "type": "pickup",
  "items": [
    { "menu_id": 5, "qty": 2 },
    { "menu_id": 7, "qty": 1 }
  ]
}
```

**Response (Success):**
```json
{
  "data": {
    "id": 42,
    "user_id": 10,
    "tenant_id": 1,
    "total_price": 75000,
    "status": "created",
    "payment_status": "pending",
    "items": [
      {
        "id": 100,
        "menu_id": 5,
        "quantity": 2,
        "unit_price": 25000,
        "subtotal": 50000,
        "menu": {
          "id": 5,
          "name": "Nasi Goreng",
          "price": 25000
        }
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "message": "Validation error",
  "errors": {
    "items.0.menu_id": [
      "Menu tidak valid untuk tenant ini."
    ]
  }
}
```

## 🚀 Deployment Architecture

### Google Cloud Run

```
┌─────────────────────────────────────────┐
│         Google Cloud Platform            │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Cloud Run (Frontend)             │ │
│  │   - Container: Vue.js + Nginx      │ │
│  │   - Auto-scaling: 0-10 instances   │ │
│  │   - URL: kantin-rk-frontend        │ │
│  └────────────────────────────────────┘ │
│                   │                      │
│                   │ HTTPS                │
│                   ▼                      │
│  ┌────────────────────────────────────┐ │
│  │   Cloud Run (Backend)              │ │
│  │   - Container: Laravel + Nginx     │ │
│  │   - Auto-scaling: 0-10 instances   │ │
│  │   - URL: kantin-backend-...        │ │
│  └────────────────────────────────────┘ │
│                   │                      │
│                   │ MySQL Protocol       │
│                   ▼                      │
│  ┌────────────────────────────────────┐ │
│  │   Cloud SQL (MySQL)                │ │
│  │   - Managed database               │ │
│  │   - Automated backups              │ │
│  │   - High availability              │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Benefits:**
- **Auto-scaling**: Scale to zero saat tidak ada traffic
- **High availability**: Automatic failover
- **Managed infrastructure**: No server management
- **Cost-effective**: Pay only for usage

## 📊 Performance Optimization

### Backend Optimizations

1. **Database Indexing**
   - Index pada foreign keys
   - Index pada frequently queried columns (status, email)

2. **Query Optimization**
   - Eager loading dengan `with()` untuk avoid N+1 queries
   - Query caching untuk static data

3. **Response Caching**
   - HTTP cache headers
   - API response caching untuk public endpoints

### Frontend Optimizations

1. **Code Splitting**
   - Route-based lazy loading
   - Component lazy loading

2. **Asset Optimization**
   - Image compression
   - CSS/JS minification
   - Gzip compression

3. **Caching Strategy**
   - Service Worker untuk offline support
   - LocalStorage untuk user session
   - HTTP cache untuk static assets

## 🔄 CI/CD Pipeline (Future Enhancement)

```
Developer  →  Git Push  →  Cloud Build  →  Deploy to Cloud Run
                              │
                              ├─ Run Tests
                              ├─ Build Docker Image
                              ├─ Push to Container Registry
                              └─ Deploy to Production
```

## 📈 Scalability Considerations

### Horizontal Scaling

- Cloud Run auto-scaling untuk handle traffic spikes
- Database connection pooling
- Stateless API design

### Vertical Scaling

- Increase Cloud Run instance resources
- Database instance upgrade
- CDN untuk static assets

### Future Enhancements

1. **Caching Layer**: Redis untuk session & cache
2. **Message Queue**: For async operations (notifications, reports)
3. **CDN**: CloudFlare/Cloud CDN untuk static assets
4. **Load Balancer**: Multi-region deployment
5. **Microservices**: Split monolith jika needed

## 📚 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vue 3 | UI Framework |
| | TypeScript | Type Safety |
| | Vue Router | Client-side routing |
| | Axios | HTTP Client |
| | Vite | Build tool |
| **Backend** | Laravel 12 | API Framework |
| | PHP 8.2 | Programming Language |
| | Sanctum | Authentication |
| | Eloquent ORM | Database abstraction |
| **Database** | MySQL 8.0 | Relational database |
| **Infrastructure** | Google Cloud Run | Container hosting |
| | Cloud Build | CI/CD |
| | Nginx | Web server |
| **DevOps** | Docker | Containerization |
| | Git | Version control |

## 🎯 Best Practices Implemented

1. ✅ **Separation of Concerns**: Backend/Frontend separated
2. ✅ **RESTful API Design**: Standard HTTP methods & status codes
3. ✅ **Security First**: JWT auth, CORS, input validation
4. ✅ **Type Safety**: TypeScript di frontend
5. ✅ **Database Normalization**: Proper relational design
6. ✅ **Error Handling**: Consistent error responses
7. ✅ **Code Organization**: Modular & maintainable structure
8. ✅ **Version Control**: Git-based workflow
9. ✅ **Documentation**: Inline comments & external docs
10. ✅ **Scalability**: Cloud-native architecture

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Maintained by**: ITERA Development Team

