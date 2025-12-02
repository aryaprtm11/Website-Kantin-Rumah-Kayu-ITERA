# 📡 API Specification - Kantin RK ITERA

## 📋 Overview

**Base URL**: `https://kantin-backend-104030083079.asia-southeast2.run.app/api/v1`

**Content Type**: `application/json`

**Authentication**: Bearer Token (Laravel Sanctum)

## 🔐 Authentication

All authenticated endpoints require header:
```http
Authorization: Bearer {token}
```

---

## 📑 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Public Endpoints](#public-endpoints)
3. [Customer Endpoints](#customer-endpoints)
4. [Tenant Admin Endpoints](#tenant-admin-endpoints)

---

## Authentication Endpoints

### 1. Register

Register new customer account.

**Endpoint**: `POST /auth/register`

**Access**: Public

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "created_at": "2025-12-02T10:00:00.000000Z",
    "updated_at": "2025-12-02T10:00:00.000000Z"
  },
  "token": "1|abc123def456..."
}
```

**Validation Rules**:
- `name`: required, string, max:255
- `email`: required, email, unique:users
- `password`: required, string, min:8, confirmed

---

### 2. Login

Authenticate user and get access token.

**Endpoint**: `POST /auth/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "token": "1|abc123def456..."
}
```

**Response** (401 Unauthorized):
```json
{
  "message": "Kredensial tidak valid."
}
```

---

### 3. Logout

Revoke current access token.

**Endpoint**: `POST /auth/logout`

**Access**: Authenticated

**Headers**:
```http
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Logout berhasil."
}
```

---

### 4. Get Current User

Get authenticated user information.

**Endpoint**: `GET /auth/me`

**Access**: Authenticated

**Headers**:
```http
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "email_verified_at": null,
  "created_at": "2025-12-02T10:00:00.000000Z",
  "updated_at": "2025-12-02T10:00:00.000000Z"
}
```

---

## Public Endpoints

### 1. Get All Tenants

Get list of all kantin/restaurants.

**Endpoint**: `GET /tenants`

**Access**: Public

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Warung Nusantara",
      "opens_at": "08:00:00",
      "closes_at": "21:00:00",
      "created_at": "2025-12-01T00:00:00.000000Z",
      "updated_at": "2025-12-01T00:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Kantin Sehat",
      "opens_at": "07:00:00",
      "closes_at": "20:00:00",
      "created_at": "2025-12-01T00:00:00.000000Z",
      "updated_at": "2025-12-01T00:00:00.000000Z"
    }
  ],
  "links": {
    "first": "http://api.example.com/api/v1/tenants?page=1",
    "last": "http://api.example.com/api/v1/tenants?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 2
  }
}
```

---

### 2. Get Tenant Menus

Get all menus from specific tenant.

**Endpoint**: `GET /tenants/{tenant}/menus`

**Access**: Public

**Path Parameters**:
- `tenant` (integer): Tenant ID

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "name": "Nasi Goreng",
      "price": 25000,
      "category": "main",
      "photo_url": "https://example.com/photo.jpg",
      "stock": 10,
      "created_at": "2025-12-01T00:00:00.000000Z",
      "updated_at": "2025-12-01T00:00:00.000000Z"
    },
    {
      "id": 2,
      "tenant_id": 1,
      "name": "Es Teh Manis",
      "price": 5000,
      "category": "drink",
      "photo_url": null,
      "stock": 50,
      "created_at": "2025-12-01T00:00:00.000000Z",
      "updated_at": "2025-12-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 3. Get Menu Detail

Get single menu details.

**Endpoint**: `GET /menus/{menu}`

**Access**: Public

**Path Parameters**:
- `menu` (integer): Menu ID

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "tenant_id": 1,
    "name": "Nasi Goreng",
    "price": 25000,
    "category": "main",
    "photo_url": "https://example.com/photo.jpg",
    "stock": 10,
    "created_at": "2025-12-01T00:00:00.000000Z",
    "updated_at": "2025-12-01T00:00:00.000000Z",
    "tenant": {
      "id": 1,
      "name": "Warung Nusantara"
    }
  }
}
```

**Response** (404 Not Found):
```json
{
  "message": "Menu not found."
}
```

---

## Customer Endpoints

### 1. Get My Orders

Get all orders for authenticated customer.

**Endpoint**: `GET /orders`

**Access**: Authenticated (Customer)

**Headers**:
```http
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "tenant_id": 1,
      "tenant": {
        "id": 1,
        "name": "Warung Nusantara",
        "opens_at": "08:00:00",
        "closes_at": "21:00:00"
      },
      "type": "pickup",
      "status": "created",
      "payment_status": "pending",
      "total_price": 30000,
      "paid_amount": 0,
      "picked_up_at": null,
      "completed_by_user": false,
      "completed_at": null,
      "created_at": "2025-12-02T10:00:00.000000Z",
      "updated_at": "2025-12-02T10:00:00.000000Z",
      "items": [
        {
          "id": 1,
          "menu_id": 1,
          "quantity": 1,
          "unit_price": 25000,
          "subtotal": 25000,
          "menu": {
            "id": 1,
            "name": "Nasi Goreng",
            "price": 25000
          }
        },
        {
          "id": 2,
          "menu_id": 2,
          "quantity": 1,
          "unit_price": 5000,
          "subtotal": 5000,
          "menu": {
            "id": 2,
            "name": "Es Teh Manis",
            "price": 5000
          }
        }
      ]
    }
  ]
}
```

---

### 2. Get Order Detail

Get specific order details.

**Endpoint**: `GET /orders/{order}`

**Access**: Authenticated (Customer - own orders only)

**Headers**:
```http
Authorization: Bearer {token}
```

**Path Parameters**:
- `order` (integer): Order ID

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "tenant_id": 1,
    "tenant": {
      "id": 1,
      "name": "Warung Nusantara"
    },
    "type": "pickup",
    "status": "created",
    "payment_status": "pending",
    "total_price": 30000,
    "paid_amount": 0,
    "items": [...]
  }
}
```

**Response** (403 Forbidden):
```json
{
  "message": "This action is unauthorized."
}
```

---

### 3. Create Order

Create new order.

**Endpoint**: `POST /orders`

**Access**: Authenticated (Customer)

**Headers**:
```http
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "tenant_id": 1,
  "type": "pickup",
  "items": [
    {
      "menu_id": 1,
      "qty": 2
    },
    {
      "menu_id": 3,
      "qty": 1
    }
  ]
}
```

**Validation Rules**:
- `tenant_id`: required, exists:tenants
- `type`: required, string, in:pickup,delivery
- `items`: required, array, min:1
- `items.*.menu_id`: required, exists:menus
- `items.*.qty`: required, integer, min:1

**Response** (201 Created):
```json
{
  "data": {
    "id": 5,
    "user_id": 1,
    "tenant_id": 1,
    "type": "pickup",
    "status": "created",
    "payment_status": "pending",
    "total_price": 55000,
    "paid_amount": 0,
    "items": [...]
  }
}
```

**Response** (422 Validation Error):
```json
{
  "message": "Stok Nasi Goreng tidak cukup.",
  "errors": {
    "items": ["Stok Nasi Goreng tidak cukup."]
  }
}
```

---

### 4. Pay Order

Mark order as paid.

**Endpoint**: `POST /orders/{order}/pay`

**Access**: Authenticated (Customer - own orders only)

**Headers**:
```http
Authorization: Bearer {token}
```

**Path Parameters**:
- `order` (integer): Order ID

**Request Body** (optional):
```json
{
  "paid_amount": 30000
}
```

If `paid_amount` not provided, defaults to `total_price`.

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "status": "created",
    "payment_status": "paid",
    "total_price": 30000,
    "paid_amount": 30000,
    ...
  }
}
```

**Response** (422 Unprocessable):
```json
{
  "message": "Order sudah dibayar."
}
```

---

### 5. Pickup Order

Mark order as picked up (customer received the order).

**Endpoint**: `POST /orders/{order}/pickup`

**Access**: Authenticated (Customer - own orders only)

**Headers**:
```http
Authorization: Bearer {token}
```

**Path Parameters**:
- `order` (integer): Order ID

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "status": "picked_up",
    "picked_up_at": "2025-12-02T12:30:00.000000Z",
    ...
  }
}
```

**Response** (422 Unprocessable):
```json
{
  "message": "Order belum siap diambil."
}
```

**Note**: Order status must be `ready_for_pickup` before pickup.

---

### 6. Complete Order

Mark order as completed.

**Endpoint**: `POST /orders/{order}/complete`

**Access**: Authenticated (Customer - own orders only)

**Headers**:
```http
Authorization: Bearer {token}
```

**Path Parameters**:
- `order` (integer): Order ID

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "status": "completed",
    "completed_by_user": true,
    "completed_at": "2025-12-02T13:00:00.000000Z",
    ...
  }
}
```

**Response** (422 Unprocessable):
```json
{
  "message": "Order belum diambil."
}
```

**Note**: Order status must be `picked_up` or `completed` before completing.

---

## Tenant Admin Endpoints

### 1. Get Tenant Menus

Get all menus for tenant admin's restaurant.

**Endpoint**: `GET /tenant/menus`

**Access**: Authenticated (Tenant Admin / Super Admin)

**Headers**:
```http
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "name": "Nasi Goreng",
      "price": 25000,
      "category": "main",
      "photo_url": "https://example.com/photo.jpg",
      "stock": 10,
      "created_at": "2025-12-01T00:00:00.000000Z",
      "updated_at": "2025-12-01T00:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

---

### 2. Create Menu

Create new menu item.

**Endpoint**: `POST /tenant/menus`

**Access**: Authenticated (Tenant Admin / Super Admin)

**Headers**:
```http
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "Nasi Goreng Spesial",
  "price": 30000,
  "category": "main",
  "photo_url": "https://example.com/photo.jpg",
  "stock": 20
}
```

**Validation Rules**:
- `name`: required, string, max:100
- `price`: required, integer, min:0
- `category`: nullable, string, max:50
- `photo_url`: nullable, url
- `stock`: required, integer, min:0

**Response** (201 Created):
```json
{
  "data": {
    "id": 10,
    "tenant_id": 1,
    "name": "Nasi Goreng Spesial",
    "price": 30000,
    "category": "main",
    "photo_url": "https://example.com/photo.jpg",
    "stock": 20,
    "created_at": "2025-12-02T10:00:00.000000Z",
    "updated_at": "2025-12-02T10:00:00.000000Z"
  }
}
```

---

### 3. Update Menu

Update existing menu item.

**Endpoint**: `PATCH /tenant/menus/{menu}`

**Access**: Authenticated (Tenant Admin - own tenant only / Super Admin)

**Headers**:
```http
Authorization: Bearer {token}
```

**Path Parameters**:
- `menu` (integer): Menu ID

**Request Body** (all fields optional):
```json
{
  "name": "Nasi Goreng Premium",
  "price": 35000,
  "category": "main",
  "photo_url": "https://example.com/new-photo.jpg",
  "stock": 15
}
```

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "name": "Nasi Goreng Premium",
    "price": 35000,
    ...
  }
}
```

---

### 4. Delete Menu

Delete menu item.

**Endpoint**: `DELETE /tenant/menus/{menu}`

**Access**: Authenticated (Tenant Admin - own tenant only / Super Admin)

**Headers**:
```http
Authorization: Bearer {token}
```

**Path Parameters**:
- `menu` (integer): Menu ID

**Response** (200 OK):
```json
{
  "message": "Menu dihapus."
}
```

---

### 5. Update Menu Stock

Update menu stock only.

**Endpoint**: `PATCH /tenant/menus/{menu}/stock`

**Access**: Authenticated (Tenant Admin - own tenant only / Super Admin)

**Headers**:
```http
Authorization: Bearer {token}
```

**Path Parameters**:
- `menu` (integer): Menu ID

**Request Body**:
```json
{
  "stock": 25
}
```

**Validation Rules**:
- `stock`: required, integer, min:0

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "stock": 25,
    ...
  }
}
```

---

### 6. Get Tenant Orders

Get all orders for tenant admin's restaurant.

**Endpoint**: `GET /tenant/orders`

**Access**: Authenticated (Tenant Admin / Super Admin)

**Headers**:
```http
Authorization: Bearer {token}
```

**Query Parameters** (optional):
- `status` (string): Filter by order status
  - Values: `created`, `preparing`, `ready_for_pickup`, `picked_up`, `completed`, `cancelled`

**Example**: `GET /tenant/orders?status=preparing`

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "tenant_id": 1,
      "status": "preparing",
      "payment_status": "paid",
      "total_price": 50000,
      "items": [...],
      "tenant": {...}
    }
  ],
  "links": {...},
  "meta": {...}
}
```

---

### 7. Update Order Status

Update order status (tenant processing workflow).

**Endpoint**: `PATCH /tenant/orders/{order}/status`

**Access**: Authenticated (Tenant Admin - own tenant only / Super Admin)

**Headers**:
```http
Authorization: Bearer {token}
```

**Path Parameters**:
- `order` (integer): Order ID

**Request Body**:
```json
{
  "status": "preparing"
}
```

**Validation Rules**:
- `status`: required, in:preparing,ready_for_pickup

**Valid Status Transitions**:
- `created` → `preparing`
- `preparing` → `ready_for_pickup`

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "status": "preparing",
    ...
  }
}
```

**Response** (422 Unprocessable):
```json
{
  "message": "Order hanya bisa diubah ke preparing dari status created."
}
```

---

## Status & Enums

### Order Status

| Status | Description | Who can set |
|--------|-------------|-------------|
| `created` | Order baru dibuat | System (on order creation) |
| `preparing` | Tenant sedang memproses | Tenant Admin |
| `ready_for_pickup` | Siap diambil customer | Tenant Admin |
| `picked_up` | Customer sudah ambil | Customer |
| `completed` | Order selesai | Customer |
| `cancelled` | Order dibatalkan | Admin (future) |

### Payment Status

| Status | Description |
|--------|-------------|
| `unpaid` | Belum dibayar |
| `pending` | Menunggu konfirmasi |
| `paid` | Sudah dibayar |
| `failed` | Pembayaran gagal |
| `expired` | Pembayaran kedaluwarsa |

### User Roles

| Role | Description |
|------|-------------|
| `customer` | Regular customer |
| `tenant_admin` | Kantin/restaurant owner |
| `superadmin` | System administrator |

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request format."
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "message": "This action is unauthorized."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

### 422 Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email has already been taken."
    ],
    "password": [
      "The password must be at least 8 characters."
    ]
  }
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error. Please try again later."
}
```

---

## Rate Limiting

**Rate Limit**: 60 requests per minute per IP

**Response Headers**:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1638432000
```

**Response** (429 Too Many Requests):
```json
{
  "message": "Too many requests. Please try again later."
}
```

---

## Pagination

All list endpoints return paginated results (default 15 items per page).

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `per_page` (integer): Items per page (max: 100)

**Example**: `GET /tenants?page=2&per_page=20`

**Response Structure**:
```json
{
  "data": [...],
  "links": {
    "first": "http://api.example.com/api/v1/tenants?page=1",
    "last": "http://api.example.com/api/v1/tenants?page=5",
    "prev": "http://api.example.com/api/v1/tenants?page=1",
    "next": "http://api.example.com/api/v1/tenants?page=3"
  },
  "meta": {
    "current_page": 2,
    "from": 16,
    "last_page": 5,
    "per_page": 15,
    "to": 30,
    "total": 75
  }
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST https://api.example.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login
```bash
curl -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Tenants
```bash
curl -X GET https://api.example.com/api/v1/tenants
```

### Create Order (Authenticated)
```bash
curl -X POST https://api.example.com/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "tenant_id": 1,
    "type": "pickup",
    "items": [
      {"menu_id": 1, "qty": 2},
      {"menu_id": 3, "qty": 1}
    ]
  }'
```

---

## Swagger/OpenAPI Documentation

Interactive API documentation available at:
**URL**: `https://kantin-backend-104030083079.asia-southeast2.run.app/api/documentation`

Use Swagger UI untuk testing API endpoints langsung dari browser.

---

**API Version**: 1.0  
**Last Updated**: December 2025  
**Base URL**: https://kantin-backend-104030083079.asia-southeast2.run.app/api/v1

