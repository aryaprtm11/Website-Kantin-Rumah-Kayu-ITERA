<template>
  <div class="navbar-wrapper">
    <div class="navbar-container">
      <div class="navbar-content">
        <!-- Logo & Brand Name -->
        <router-link to="/" class="nav-brand">
          <img src="/logo.png" alt="Kantin RK" class="brand-logo" />
          <div class="brand-text">
            <span class="brand-name">Kantin RK</span>
            <span class="brand-subtitle">ITERA</span>
          </div>
        </router-link>
        
        <!-- Center Navigation -->
        <nav class="nav-center">
          <button 
            class="nav-link" 
            @click="scrollToSection('home')"
          >
            Home
          </button>
          <button 
            class="nav-link" 
            @click="scrollToSection('tenants')"
          >
            Kantin
          </button>
        </nav>
        
        <!-- Right Actions -->
        <div class="nav-actions">
          <!-- Cart Button -->
          <Button 
            icon="pi pi-shopping-cart" 
            @click="openCart"
            text
            rounded
            class="btn-cart"
            v-badge="itemCount > 0 ? itemCount : null"
          />
          
          <template v-if="!isAuthenticated">
            <Button 
              label="Login" 
              @click="router.push('/login')"
              text
              rounded
              class="btn-login"
            />
            <Button 
              label="Register" 
              @click="router.push('/register')"
              rounded
              class="btn-register"
            />
          </template>
          
          <template v-else>
            <Button 
              :label="userName" 
              icon="pi pi-user" 
              @click="router.push('/customer/dashboard')"
              text
              rounded
              class="btn-user"
            />
            <Button 
              icon="pi pi-sign-out" 
              @click="handleLogout"
              rounded
              text
              class="btn-logout"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useCart } from '../composables/useCart';
import Button from 'primevue/button';

const router = useRouter();
const { isAuthenticated, userName, logout } = useAuth();
const { itemCount } = useCart();

const emit = defineEmits<{
  'open-cart': [];
}>();

const scrollToSection = (sectionId: string) => {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
};

const handleLogout = async () => {
  try {
    await logout();
    router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const openCart = () => {
  emit('open-cart');
};
</script>

<style scoped>
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 2rem;
  background: transparent;
  pointer-events: none;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  pointer-events: auto;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 0.75rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.1);
  transition: all 0.3s ease;
}

.navbar-content:hover {
  box-shadow: 0 8px 30px rgba(34, 197, 94, 0.15);
}

/* Logo & Brand */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: transform 0.3s;
}

.nav-brand:hover {
  transform: scale(1.05);
}

.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.brand-subtitle {
  font-size: 0.75rem;
  font-weight: 600;
  color: #22c55e;
  letter-spacing: 0.05em;
}

/* Center Navigation */
.nav-center {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-link {
  background: transparent;
  border: none;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.nav-link:hover {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

/* Right Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Button Styles */
:deep(.btn-login) {
  color: #22c55e;
}

:deep(.btn-login:hover) {
  background: rgba(34, 197, 94, 0.1);
}

:deep(.btn-register) {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

:deep(.btn-register:hover) {
  background: #16a34a;
  border-color: #16a34a;
}

:deep(.btn-user) {
  color: #374151;
}

:deep(.btn-user:hover) {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

:deep(.btn-logout) {
  color: #ef4444;
}

:deep(.btn-logout:hover) {
  background: rgba(239, 68, 68, 0.1);
}

:deep(.btn-cart) {
  color: #22c55e;
  position: relative;
}

:deep(.btn-cart:hover) {
  background: rgba(34, 197, 94, 0.1);
}

:deep(.btn-cart .p-badge) {
  min-width: 1.25rem;
  height: 1.25rem;
  line-height: 1.25rem;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 960px) {
  .navbar-wrapper {
    padding: 0.75rem 1rem;
  }

  .navbar-content {
    border-radius: 20px;
    padding: 0.5rem 1rem;
  }

  .brand-logo {
    height: 32px;
  }

  .brand-name {
    font-size: 1rem;
  }

  .brand-subtitle {
    font-size: 0.65rem;
  }

  .nav-center {
    position: static;
    transform: none;
    display: none;
  }
}

@media (max-width: 576px) {
  .navbar-wrapper {
    padding: 0.5rem;
  }

  .navbar-content {
    border-radius: 15px;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .brand-logo {
    height: 28px;
  }

  .brand-text {
    display: none;
  }

  .nav-actions {
    gap: 0.25rem;
  }

  :deep(.p-button-label) {
    display: none;
  }
}
</style>

