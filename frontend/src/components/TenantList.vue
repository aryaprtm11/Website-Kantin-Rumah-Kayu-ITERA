<template>
  <section class="tenants" id="tenants">
    <div class="tenants-container">
      <div class="section-header">
        <h2 class="section-title">Kantin Tersedia</h2>
        <p class="section-description">
          Pilih kantin favorit Anda dan pesan menu yang Anda inginkan
        </p>
      </div>

      <div v-if="loading" class="loading-state">
        <ProgressSpinner />
        <p>{{ LOADING_MESSAGE }}</p>
      </div>

      <Message v-else-if="error" severity="error" :closable="false">
        {{ error }}
        <template #icon>
          <i class="pi pi-times-circle"></i>
        </template>
      </Message>

      <div v-else class="tenants-grid">
        <Card 
          v-for="tenant in tenants"
          :key="tenant.id"
          class="tenant-card"
        >
          <template #header>
            <div class="tenant-image-wrapper">
              <div class="tenant-image">
                <template v-if="getTenantImage(tenant)">
                  <img :src="getTenantImage(tenant)" :alt="tenant.name" />
                </template>
                <div v-else class="tenant-placeholder">
                  <i class="pi pi-building" style="font-size: 4rem"></i>
                </div>
              </div>
              <div class="status-overlay">
                <Tag 
                  :value="tenant.is_open ? 'Buka' : 'Tutup'" 
                  :severity="tenant.is_open ? 'success' : 'danger'"
                  :icon="tenant.is_open ? 'pi pi-check-circle' : 'pi pi-times-circle'"
                  rounded
                />
              </div>
            </div>
          </template>
          
          <template #title>
            <div class="tenant-title">
              {{ tenant.name }}
            </div>
          </template>
          
          <template #content>
            <div class="tenant-info">
              <div class="info-item">
                <i class="pi pi-clock"></i>
                <span>{{ tenant.opens_at }} - {{ tenant.closes_at }}</span>
              </div>
              <Divider />
              <div class="tenant-description">
                Nikmati berbagai menu lezat dari {{ tenant.name }}
              </div>
            </div>
          </template>
          
          <template #footer>
            <div class="card-actions">
              <Button 
                label="Lihat Menu" 
                icon="pi pi-arrow-right" 
                iconPos="right"
                :disabled="!tenant.is_open"
                @click="$router.push(`/tenants/${tenant.id}`)"
                class="w-full"
                :severity="tenant.is_open ? 'success' : 'secondary'"
                raised
              />
            </div>
          </template>
        </Card>
      </div>

      <Message v-if="!loading && !error && tenants.length === 0" severity="info" :closable="false">
        {{ NO_DATA_MESSAGE }}
      </Message>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTenants } from '../composables/useTenants';
import { INFO_MESSAGES } from '../constants/messages';
import tenant1Img from '../assets/tenant1.jpeg';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Divider from 'primevue/divider';

const getTenantImage = (tenant: any) => {
  if (!tenant) return null;
  if (tenant.photo_url) return tenant.photo_url;
  if (tenant.name && tenant.name.toLowerCase().includes('warung nusantara')) return tenant1Img;
  return null;
};

const { tenants, loading, error, fetchTenants } = useTenants();

onMounted(() => {
  fetchTenants();
});

const LOADING_MESSAGE = INFO_MESSAGES.LOADING;
const NO_DATA_MESSAGE = INFO_MESSAGES.NO_TENANTS;
</script>

<style scoped>
.tenants {
  padding: 5rem 2rem;
  background: #f9fafb;
}

.tenants-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 1.125rem;
  color: #6b7280;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-state p {
  margin-top: 1rem;
}

.tenants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  animation: fadeIn 0.6s ease-out;
}

:deep(.tenant-card) {
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

:deep(.tenant-card:hover) {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
}

:deep(.tenant-card .p-card-header) {
  padding: 0;
}

:deep(.tenant-card .p-card-body) {
  padding: 1.5rem;
}

:deep(.tenant-card .p-card-content) {
  padding: 0;
}

:deep(.tenant-card .p-card-footer) {
  padding: 0;
  padding-top: 1rem;
}

.tenant-image-wrapper {
  position: relative;
  overflow: hidden;
}

.tenant-image {
  height: 220px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.tenant-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

.tenant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

:deep(.tenant-card:hover) .tenant-image img {
  transform: scale(1.05);
}

.tenant-placeholder {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.status-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.tenant-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.tenant-info {
  margin-top: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.info-item i {
  color: #22c55e;
}

:deep(.p-divider) {
  margin: 0.75rem 0;
}

.tenant-description {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.w-full {
  width: 100%;
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
  .tenants {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .tenants-grid {
    grid-template-columns: 1fr;
  }
}
</style>

