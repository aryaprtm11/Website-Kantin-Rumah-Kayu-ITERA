export const CUSTOMER_MENU_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/customer/dashboard' },
  { icon: '📦', label: 'Pesanan Saya', path: '/customer/orders' },
  { icon: '🏪', label: 'Jelajahi Kantin', path: '/#tenants' },
  { icon: '👤', label: 'Profil', path: '/customer/profile' },
];

export const TENANT_MENU_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/tenant/dashboard' },
  { icon: '📦', label: 'Pesanan', path: '/tenant/orders' },
  { icon: '🍽️', label: 'Menu', path: '/tenant/menus' },
  { icon: '👤', label: 'Profil', path: '/tenant/profile' },
];

export const ADMIN_MENU_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: '🏪', label: 'Kelola Tenant', path: '/admin/tenants' },
  { icon: '👥', label: 'Kelola User', path: '/admin/users' },
  { icon: '👤', label: 'Profil', path: '/admin/profile' },
];