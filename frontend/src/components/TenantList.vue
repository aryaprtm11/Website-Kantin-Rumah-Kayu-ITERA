<template>
  <section class="tenants" id="tenants">
    <div class="tenants-container">
      <div class="section-header">
        <h2 class="section-title">Kantin Tersedia</h2>
        <p class="section-description">
          Pilih kantin favorit Anda dan pesan menu yang Anda inginkan
        </p>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ LOADING_MESSAGE }}</p>
      </div>

      <div v-else-if="error" class="error-message">
        <p>❌ {{ error }}</p>
        <button @click="retry" class="btn-retry">Coba Lagi</button>
      </div>

      <div v-else class="tenants-grid">
        <div
          v-for="tenant in tenants"
          :key="tenant.id"
          class="tenant-card"
        >
          <div class="tenant-image">
                <template v-if="getTenantImage(tenant)">
                  <img :src="getTenantImage(tenant)" :alt="tenant.name" />
                </template>
                <div v-else class="tenant-placeholder">
                  🏪
                </div>
              </div>
          <div class="tenant-content">
            <h3 class="tenant-name">{{ tenant.name }}</h3>
            <p class="tenant-hours">⏰ {{ tenant.opens_at }} - {{ tenant.closes_at }}</p>
            <div class="tenant-status">
              <span
                :class="['status-badge', tenant.is_open ? 'active' : 'inactive']"
              >
                {{ tenant.is_open ? '🟢 Buka' : '🔴 Tutup' }}
              </span>
            </div>
            <router-link 
              :to="`/tenants/${tenant.id}`"
              class="btn-view-menu"
              :class="{ 'disabled': !tenant.is_open }"
            >
              Lihat Menu
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="!loading && !error && tenants.length === 0" class="no-data">
        <p>😔 {{ NO_DATA_MESSAGE }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * TenantList Component
 * Displays a grid of available tenants/kantins
 * Uses composable for data management
 */

import { onMounted } from 'vue';
import { useTenants } from '../composables/useTenants';
import { INFO_MESSAGES } from '../constants/messages';
// import a local image for the specific tenant
import tenant1Img from '../assets/tenant1.jpeg';

// return an image URL for a tenant (uses tenant photo_url if provided,
// otherwise special-case `Warung Nusantara` to show `tenant1.jpg`)
const getTenantImage = (tenant: any) => {
  if (!tenant) return null;
  if (tenant.photo_url) return tenant.photo_url;
  if (tenant.name && tenant.name.toLowerCase().includes('warung nusantara')) return tenant1Img;
  return null;
};

const { tenants, loading, error, fetchTenants, retry } = useTenants();

onMounted(() => {
  fetchTenants();
});

// Constants for template
const LOADING_MESSAGE = INFO_MESSAGES.LOADING;
const NO_DATA_MESSAGE = INFO_MESSAGES.NO_TENANTS;
</script>

<style scoped>
.tenants {
  padding: 5rem 0;
  background: white;
}

.tenants-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.1rem;
  color: #718096;
}

.loading,
.no-data {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  padding: 3rem;
}

.error-message p {
  color: #e53e3e;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.tenants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  animation: fadeIn 0.6s ease-out;
}

.tenant-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
}

.tenant-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
}

.tenant-image {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tenant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tenant-placeholder {
  font-size: 5rem;
  color: white;
}

.tenant-content {
  padding: 1.5rem;
}

.tenant-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.tenant-hours {
  font-size: 0.95rem;
  color: #718096;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-weight: 500;
}

.tenant-status {
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.inactive {
  background: #fed7d7;
  color: #742a2a;
}

.btn-view-menu {
  display: block;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  text-align: center;
}

.btn-view-menu:hover:not(.disabled) {
  opacity: 0.9;
  transform: scale(1.02);
}

.btn-view-menu.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }

  .tenants-grid {
    grid-template-columns: 1fr;
  }
}
</style>

