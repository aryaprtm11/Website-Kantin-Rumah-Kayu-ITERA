import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import AdminDashboard from '../views/dashboard/AdminDashboard.vue';
import TenantDashboard from '../views/dashboard/TenantDashboard.vue';
import CustomerDashboard from '../views/dashboard/CustomerDashboard.vue';
import CustomerOrders from '../views/customer/CustomerOrders.vue';
import TenantMenus from '../views/tenant/TenantMenus.vue';
import TenantOrders from '../views/tenant/TenantOrders.vue';
import TenantDetail from '../views/TenantDetail.vue';
import { AuthService } from '../services/authService';
import { getRoleValue } from '../utils/roleHelper';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/tenants/:id',
    name: 'TenantDetail',
    component: TenantDetail,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      requiresGuest: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      requiresGuest: true,
    },
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { 
      requiresAuth: true,
      requiresRole: 'superadmin',
    },
  },
  {
    path: '/tenant/dashboard',
    name: 'TenantDashboard',
    component: TenantDashboard,
    meta: { 
      requiresAuth: true,
      requiresRole: 'tenant_admin',
    },
  },
  {
    path: '/customer/dashboard',
    name: 'CustomerDashboard',
    component: CustomerDashboard,
    meta: { 
      requiresAuth: true,
      requiresRole: 'customer',
    },
  },
  {
    path: '/customer/orders',
    name: 'CustomerOrders',
    component: CustomerOrders,
    meta: { 
      requiresAuth: true,
      requiresRole: 'customer',
    },
  },
  {
    path: '/tenant/menus',
    name: 'TenantMenus',
    component: TenantMenus,
    meta: { 
      requiresAuth: true,
      requiresRole: 'tenant_admin',
    },
  },
  {
    path: '/tenant/orders',
    name: 'TenantOrders',
    component: TenantOrders,
    meta: { 
      requiresAuth: true,
      requiresRole: 'tenant_admin',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Navigation guard
 * Handle authentication and role-based access
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const currentUser = AuthService.getUser();
  const userRole = currentUser ? getRoleValue(currentUser.role) : '';
  
  // Redirect authenticated users away from guest-only pages
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect based on role
    if (userRole === 'superadmin') {
      next('/admin/dashboard');
    } else if (userRole === 'tenant_admin') {
      next('/tenant/dashboard');
    } else if (userRole === 'customer') {
      next('/customer/dashboard');
    } else {
      next('/');
    }
    return;
  }
  
  // Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }
  
  // Check role-based access
  if (to.meta.requiresRole && currentUser) {
    const requiredRole = to.meta.requiresRole as string;
    
    if (userRole !== requiredRole) {
      // Unauthorized - redirect to appropriate dashboard
      if (userRole === 'superadmin') {
        next('/admin/dashboard');
      } else if (userRole === 'tenant_admin') {
        next('/tenant/dashboard');
      } else if (userRole === 'customer') {
        next('/customer/dashboard');
      } else {
        next('/');
      }
      return;
    }
  }
  
  next();
});

export default router;

