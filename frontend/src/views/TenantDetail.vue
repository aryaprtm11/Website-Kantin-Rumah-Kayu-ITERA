<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar @open-cart="cartVisible = true" />
    <CartDialog v-model:visible="cartVisible" />

    <div class="flex-1 pb-12 pt-20">
      <!-- Tenant Header -->
      <div class="bg-gray-100 py-8 mb-12">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">
          <div class="flex gap-4 mb-6 flex-wrap">
            <Button 
              label="Kembali" 
              icon="pi pi-arrow-left" 
              @click="goBack"
              text
              class="!text-green-600 hover:!bg-green-50"
            />
            <Button 
              label="Ke Halaman Utama" 
              icon="pi pi-home" 
              @click="goHome"
              text
              severity="secondary"
            />
          </div>

          <div v-if="loadingTenant" class="text-center py-8">
            <ProgressSpinner />
          </div>

          <div v-else-if="tenant" class="mt-4">
            <Card class="!border !border-gray-200 !shadow-md">
              <template #content>
                <div class="flex items-center gap-6">
                  <div class="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-500 to-green-700">
                    <img 
                      v-if="getTenantImage(tenant)" 
                      :src="getTenantImage(tenant)" 
                      :alt="tenant.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-white text-4xl">
                      <i class="pi pi-building"></i>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">{{ tenant.name }}</h1>
                    <div class="flex items-center gap-4 flex-wrap">
                      <div class="flex items-center gap-2 text-gray-600 text-sm lg:text-base">
                        <i class="pi pi-clock text-green-600"></i>
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
      <div class="max-w-7xl mx-auto px-4 lg:px-8">
        <div class="mt-8">
          <h2 class="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-8">Menu Tersedia</h2>

          <!-- Loading State -->
          <div v-if="loadingMenus" class="text-center py-16 text-gray-600">
            <ProgressSpinner />
            <p class="mt-4">Memuat menu...</p>
          </div>

          <!-- Error State -->
          <Message v-else-if="error" severity="error" :closable="false" class="mb-6">
            {{ error }}
            <template #icon>
              <XCircle :size="20" />
            </template>
          </Message>

          <!-- Empty State -->
          <Message v-else-if="menus.length === 0" severity="info" :closable="false" class="mb-6">
            <template #icon>
              <UtensilsCrossed :size="20" />
            </template>
            Kantin ini belum menambahkan menu
          </Message>

          <!-- Menu Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card
              v-for="menu in menus"
              :key="menu.id"
              class="transition-all hover:-translate-y-2 hover:shadow-xl hover:!border-green-500 !border !border-gray-200 !shadow-md !rounded-2xl overflow-hidden"
            >
              <template #header>
                <div class="relative overflow-hidden">
                  <div class="h-48 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center relative overflow-hidden">
                    <img
                      v-if="menu.photo_url"
                      :src="menu.photo_url"
                      :alt="menu.name"
                      class="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div v-else class="text-white flex items-center justify-center w-full h-full z-10">
                      <UtensilsCrossed :size="64" />
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                  </div>
                  <div v-if="menu.stock === 0" class="absolute top-4 right-4 z-20">
                    <Tag value="Habis" severity="danger" />
                  </div>
                  <div v-else-if="menu.stock < 5" class="absolute top-4 right-4 z-20">
                    <Tag value="Stok Terbatas" severity="warning" />
                  </div>
                </div>
              </template>

              <template #title>
                <div class="text-lg font-bold text-gray-900 mb-2">{{ menu.name }}</div>
              </template>

              <template #subtitle>
                <Chip 
                  v-if="menu.category" 
                  :label="getCategoryLabel(menu.category)" 
                  class="!bg-green-100 !text-green-700 !font-semibold"
                />
              </template>

              <template #content>
                <div class="text-2xl font-extrabold text-green-600 mt-2">
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
/* Minimal custom styles - using Tailwind for everything else */
:deep(.p-card-header) {
  padding: 0;
}

:deep(.p-card-body) {
  padding: 1.5rem;
}

:deep(.p-card-content) {
  padding: 0;
}

:deep(.p-card-footer) {
  padding: 0;
  padding-top: 1rem;
}
</style>
