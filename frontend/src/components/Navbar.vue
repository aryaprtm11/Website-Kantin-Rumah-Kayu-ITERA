<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Brand Section -->
      <div class="nav-brand">
        <h1>{{ APP_NAME }}</h1>
        <p class="tagline">{{ APP_TAGLINE }}</p>
      </div>
      
      <!-- Navigation Links -->
      <div class="nav-links">
        <a 
          v-for="link in navLinks" 
          :key="link.id"
          :href="link.href" 
          :class="['nav-link', { active: link.active }]"
        >
          {{ link.label }}
        </a>
        <button class="btn-primary" @click="handleLogin">
          Login
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
/**
 * Navbar Component
 * Main navigation bar with branding and links
 * Sticky positioned at the top of the page
 */

// Constants
const APP_NAME = '🏠 Kantin RK ITERA';
const APP_TAGLINE = 'Pesan Makanan dengan Mudah';

// Navigation links configuration
const navLinks = [
  { id: 'home', href: '#home', label: 'Home', active: true },
  { id: 'tenants', href: '#tenants', label: 'Kantin', active: false },
  { id: 'about', href: '#about', label: 'Tentang', active: false },
];

/**
 * Handle login button click
 * TODO: Implement login functionality in next iteration
 */
const handleLogin = () => {
  console.log('Login clicked - to be implemented');
  // Future: Navigate to login page or open modal
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tagline {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 300;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
  position: relative;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background: white;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
    font-size: 0.9rem;
  }
}
</style>

