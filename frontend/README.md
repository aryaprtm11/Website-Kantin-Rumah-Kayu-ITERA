# Kantin Digital - Frontend

Modern web application untuk sistem pemesanan kantin digital menggunakan Vue 3, TypeScript, dan Tailwind CSS.

## 🚀 Tech Stack

- **Vue 3** - Progressive JavaScript Framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next Generation Frontend Tooling
- **Tailwind CSS** - Utility-first CSS Framework
- **PrimeVue** - Rich UI Component Library
- **Pinia** - State Management (via Composables)
- **Axios** - HTTP Client
- **SweetAlert2** - Beautiful Alerts

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc
│   ├── components/     # Reusable Vue components
│   │   └── dashboard/  # Dashboard-specific components
│   ├── composables/    # Vue composables (reusable logic)
│   ├── config/         # Configuration files
│   ├── constants/      # Constants and enums
│   ├── router/         # Vue Router configuration
│   ├── services/       # API service layer
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── views/          # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── customer/   # Customer pages
│   │   ├── dashboard/  # Dashboard pages
│   │   └── tenant/     # Tenant pages
│   ├── App.vue         # Root component
│   ├── main.ts         # Application entry point
│   └── style.css       # Global styles
├── .env.example        # Environment variables example
├── index.html          # HTML entry point
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 16.x
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Application will be available at `http://localhost:5173`

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
```

## 🎨 Design System

### Colors
- **Primary**: Green (#22c55e, #16a34a)
- **Secondary**: Cyan (#06b6d4), Indigo (#6366f1)
- **Success**: Green
- **Warning**: Yellow/Orange
- **Danger**: Red
- **Info**: Blue

### Typography
- **Font Family**: Poppins
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## 🔐 Authentication

The app uses JWT token-based authentication:
- Token stored in `localStorage`
- Automatically attached to API requests via Axios interceptor
- Role-based routing (Admin, Tenant, Customer)

## 🧩 Key Features

### For Customers
- Browse available canteens
- View menus with real-time stock
- Add items to cart
- Place orders
- Track order status
- View order history

### For Tenant Admins
- Manage menu items
- Update stock levels
- Process incoming orders
- View sales statistics

### For Super Admins
- Manage all tenants
- Manage users
- View system-wide statistics
- Monitor all orders

## 📱 Mobile Responsive

All pages are fully responsive with:
- Mobile-first design approach
- Touch-friendly UI elements (min 44px touch targets)
- Hamburger menu for mobile navigation
- Optimized layouts for all screen sizes

## 🔧 Code Architecture

### Composables Pattern
Reusable logic extracted into composables:
- `useAuth()` - Authentication state and methods
- `useCart()` - Shopping cart management
- `useTenants()` - Tenant data fetching

### Service Layer
API calls abstracted into services:
- `authService.ts` - Authentication APIs
- `orderService.ts` - Order management
- `tenantService.ts` - Tenant operations
- `adminService.ts` - Admin operations
- `customerService.ts` - Customer operations

### Type Safety
Full TypeScript support with:
- Interface definitions in `types/`
- Type-safe API responses
- Component prop types

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output will be in `dist/` directory.

### Environment Variables for Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_APP_ENV=production
```

## 📝 Code Style Guidelines

- Use TypeScript for type safety
- Follow Vue 3 Composition API
- Use Tailwind utility classes (avoid custom CSS)
- Component names in PascalCase
- File names match component names
- Extract reusable logic to composables
- Keep components small and focused
- Use meaningful variable names

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
npx kill-port 5173
```

### Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team Here]
