<template>
  <div class="page">
    <Navbar @open-cart="cartVisible = true" />
    <CartDialog v-model:visible="cartVisible" />

    <div class="tenant-detail-page">
      <!-- Tenant Header -->
      <div class="tenant-header">
        <div class="container">
          <div class="header-actions">
            <Button 
              label="Kembali" 
              icon="pi pi-arrow-left" 
              @click="goBack"
              text
              class="btn-back"
            />
            <Button 
              label="Ke Halaman Utama" 
              icon="pi pi-home" 
              @click="goHome"
              text
              severity="secondary"
            />
          </div>

          <div v-if="loadingTenant" class="loading">
            <ProgressSpinner />
          </div>

          <div v-else-if="tenant" class="tenant-info-card">
            <Card class="tenant-card-header">
              <template #content>
                <div class="tenant-info-layout">
                  <div class="tenant-image-small">
                    <img 
                      v-if="getTenantImage(tenant)" 
                      :src="getTenantImage(tenant)" 
                      :alt="tenant.name" 
                    />
                    <div v-else class="tenant-placeholder-small">
                      <i class="pi pi-building"></i>
                    </div>
                  </div>
                  <div class="tenant-details">
                    <h1 class="tenant-name">{{ tenant.name }}</h1>
                    <div class="tenant-meta">
                      <div class="meta-item">
                        <i class="pi pi-clock"></i>
                        <span>{{ tenant.opens_at }} - {{ tenant.closes_at }}</span>
                      </div>
                      <Tag 
                        :value="tenant.is_open ? 'Buka' : 'Tutup'" 
                        :severity="tenant.is_open ? 'success' : 'danger'"
                        :icon="tenant.is_open ? 'pi pi-check-circle' : 'pi pi-times-circle'"
                        rounded
                      />
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>

      <!-- Menu Section -->
      <div class="container">
        <div class="menu-section">
          <h2 class="section-title">Menu Tersedia</h2>

          <!-- Loading State -->
          <div v-if="loadingMenus" class="loading-state">
            <ProgressSpinner />
            <p>Memuat menu...</p>
          </div>

          <!-- Error State -->
          <Message v-else-if="error" severity="error" :closable="false">
            {{ error }}
            <template #icon>
              <XCircle :size="20" />
            </template>
          </Message>

          <!-- Empty State -->
          <Message v-else-if="menus.length === 0" severity="info" :closable="false">
            <template #icon>
              <UtensilsCrossed :size="20" />
            </template>
            Kantin ini belum menambahkan menu
          </Message>

          <!-- Menu Grid -->
          <div v-else class="menu-grid">
            <Card
              v-for="menu in menus"
              :key="menu.id"
              class="menu-card"
            >
              <template #header>
                <div class="menu-image-wrapper">
                  <div class="menu-image">
                    <img
                      v-if="menu.photo_url"
                      :src="menu.photo_url"
                      :alt="menu.name"
                    />
                    <div v-else class="menu-placeholder">
                      <UtensilsCrossed :size="64" />
                    </div>
                  </div>
                  <div v-if="menu.stock === 0" class="stock-overlay">
                    <Tag value="Habis" severity="danger" />
                  </div>
                  <div v-else-if="menu.stock < 5" class="stock-overlay">
                    <Tag value="Stok Terbatas" severity="warning" />
                  </div>
                </div>
              </template>

              <template #title>
                <div class="menu-title">{{ menu.name }}</div>
              </template>

              <template #subtitle>
                <Chip 
                  v-if="menu.category" 
                  :label="getCategoryLabel(menu.category)" 
                  class="menu-category"
                />
              </template>

              <template #content>
                <div class="menu-price">
                  {{ formatCurrency(menu.price) }}
                </div>
              </template>

              <template #footer>
                <Button
                  :label="menu.stock === 0 ? 'Habis' : 'Tambah ke Keranjang'"
                  icon="pi pi-shopping-cart"
                  :disabled="menu.stock === 0 || !tenant?.is_open"
                  @click="addToCart(menu)"
                  class="w-full"
                  severity="success"
                  raised
                />
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import CartDialog from "../components/CartDialog.vue";
import { useCart } from "../composables/useCart";
import api from "../config/api";
import { XCircle, UtensilsCrossed } from "lucide-vue-next";
import { showError, showWarning, showSuccess } from "../utils/sweetAlert";
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import tenant1Img from '../assets/tenant1.jpeg';

const route = useRoute();
const router = useRouter();
const { addToCart: addItemToCart, canAddItem } = useCart();

const tenant = ref<any>(null);
const menus = ref<any[]>([]);
const loadingTenant = ref(false);
const loadingMenus = ref(false);
const error = ref<string | null>(null);
const cartVisible = ref(false);

const tenantId = route.params.id;

const getTenantImage = (tenant: any) => {
  if (!tenant) return null;
  if (tenant.photo_url) return tenant.photo_url;
  if (tenant.name && tenant.name.toLowerCase().includes('warung nusantara')) return tenant1Img;
  return null;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    main: "Makanan Utama",
    snack: "Snack",
    drink: "Minuman",
    dessert: "Dessert",
  };
  return labels[category] || category;
};

const fetchTenant = async () => {
  loadingTenant.value = true;
  try {
    const response = await api.get(`/tenants?limit=100`);
    const tenants = response.data.data || response.data;
    tenant.value = tenants.find(
      (t: any) => t.id === parseInt(tenantId as string)
    );
  } catch (err) {
    console.error("Error fetching tenant:", err);
  } finally {
    loadingTenant.value = false;
  }
};

const fetchMenus = async () => {
  loadingMenus.value = true;
  error.value = null;
  try {
    const response = await api.get(`/tenants/${tenantId}/menus`);
    menus.value = response.data.data || response.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Gagal memuat menu";
    console.error("Error fetching menus:", err);
  } finally {
    loadingMenus.value = false;
  }
};

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push("/");
};

const addToCart = async (menu: any) => {
  if (!tenant.value) {
    showError("Data kantin belum dimuat");
    return;
  }

  // Check if can add item (same tenant validation)
  if (!canAddItem(tenant.value.id)) {
    showWarning(
      "Keranjang sudah berisi item dari kantin lain. Harap checkout atau kosongkan keranjang terlebih dahulu.",
      "Tidak Dapat Menambah Item"
    );
    return;
  }

  addItemToCart({
    menuId: menu.id,
    tenantId: tenant.value.id,
    tenantName: tenant.value.name,
    name: menu.name,
    price: menu.price,
    stock: menu.stock,
  });

  // Show success message
  await showSuccess(`${menu.name} berhasil ditambahkan ke keranjang!`, 'Berhasil!');
};

onMounted(() => {
  fetchTenant();
  fetchMenus();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7fafc;
}

.tenant-detail-page {
  flex: 1;
  padding-bottom: 3rem;
  padding-top: 5rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.tenant-header {
  background: #f9fafb;
  padding: 2rem 0;
  margin-bottom: 3rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

:deep(.btn-back) {
  color: #22c55e;
}

:deep(.btn-back:hover) {
  background: rgba(34, 197, 94, 0.1);
}

.tenant-info-card {
  margin-top: 1rem;
}

:deep(.tenant-card-header) {
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.tenant-card-header .p-card-body) {
  padding: 1.5rem;
}

:deep(.tenant-card-header .p-card-content) {
  padding: 0;
}

.tenant-info-layout {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.tenant-image-small {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.tenant-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tenant-placeholder-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
}

.tenant-details {
  flex: 1;
}

.tenant-name {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.tenant-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9375rem;
}

.meta-item i {
  color: #22c55e;
}

.menu-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 2rem;
}

.loading,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
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

.empty-icon {
  margin-bottom: 1rem;
  color: #cbd5e0;
}

.error-icon {
  color: #fc8181;
  margin-bottom: 1rem;
}

.inline-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.25rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 1rem 0;
}

.empty-state p {
  color: #718096;
}

.btn-retry {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-state p {
  margin-top: 1rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

:deep(.menu-card) {
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

:deep(.menu-card:hover) {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
}

:deep(.menu-card .p-card-header) {
  padding: 0;
}

:deep(.menu-card .p-card-body) {
  padding: 1.5rem;
}

:deep(.menu-card .p-card-content) {
  padding: 0;
}

:deep(.menu-card .p-card-footer) {
  padding: 0;
  padding-top: 1rem;
}

.menu-image-wrapper {
  position: relative;
  overflow: hidden;
}

.menu-image {
  height: 200px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.menu-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

:deep(.menu-card:hover) .menu-image img {
  transform: scale(1.05);
}

.menu-placeholder {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.stock-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.menu-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.menu-category {
  background: #dcfce7;
  color: #16a34a;
  font-weight: 600;
}

.menu-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #22c55e;
  margin-top: 0.5rem;
}

.w-full {
  width: 100%;
}

.menu-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #48bb78;
}

.btn-order {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-order:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-order:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .tenant-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .tenant-name {
    font-size: 1.5rem;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
