export const CUSTOMER_MENU_ITEMS = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/customer/dashboard' },
  { icon: 'Package', label: 'Pesanan Saya', path: '/customer/orders' },
  { icon: 'Store', label: 'Jelajahi Kantin', path: '/#tenants' },
  { icon: 'User', label: 'Profil', path: '/customer/profile' },
];

export const TENANT_MENU_ITEMS = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/tenant/dashboard' },
  { icon: 'Package', label: 'Pesanan', path: '/tenant/orders' },
  { icon: 'UtensilsCrossed', label: 'Menu', path: '/tenant/menus' },
  { icon: 'User', label: 'Profil', path: '/tenant/profile' },
];

export const ADMIN_MENU_ITEMS = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: 'Store', label: 'Kelola Tenant', path: '/admin/tenants' },
  { icon: 'Users', label: 'Kelola User', path: '/admin/users' },
  { icon: 'User', label: 'Profil', path: '/admin/profile' },
];