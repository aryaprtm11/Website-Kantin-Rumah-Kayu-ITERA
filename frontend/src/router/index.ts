import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import { AuthService } from '../services/authService';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      requiresGuest: true, // Only accessible when not logged in
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      requiresGuest: true, // Only accessible when not logged in
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Navigation guard
 * Redirect authenticated users away from login/register pages
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  // Redirect authenticated users away from guest-only pages
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/');
    return;
  }
  
  // Redirect unauthenticated users away from auth-only pages
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }
  
  next();
});

export default router;

