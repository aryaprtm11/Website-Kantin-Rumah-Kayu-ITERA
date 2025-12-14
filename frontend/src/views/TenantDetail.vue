<template>
  <div class="page">
    <Navbar />
    <CartSidebar />

    <!-- Floating Cart Button -->
    <button v-if="itemCount > 0" class="floating-cart-btn" @click="openCart">
      <ShoppingCart :size="20" />
      {{ itemCount }} item
      <span class="cart-total">{{ formatCurrency(totalPrice) }}</span>
    </button>

    <div class="tenant-detail-page">
      <!-- Tenant Header -->
      <div class="tenant-header">
        <div class="container">
          <button class="btn-back" @click="goBack">← Kembali</button>

          <div v-if="loadingTenant" class="loading">
            <div class="spinner"></div>
          </div>

          <div v-else-if="tenant" class="tenant-info">
            <div class="tenant-icon">
              <Store :size="40" />
            </div>
            <div>
              <h1 class="tenant-name">{{ tenant.name }}</h1>
              <p class="tenant-hours">
                <Clock :size="16" class="inline-icon" />
                {{ tenant.opens_at }} - {{ tenant.closes_at }}
              </p>
              <span
                :class="['status-badge', tenant.is_open ? 'open' : 'closed']"
              >
                <component :is="tenant.is_open ? CircleCheck : CircleX" :size="16" class="inline-icon" />
                {{ tenant.is_open ? "Buka" : "Tutup" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Section -->
      <div class="container">
        <div class="menu-section">
          <h2 class="section-title">Menu Tersedia</h2>

          <!-- Loading State -->
          <div v-if="loadingMenus" class="loading">
            <div class="spinner"></div>
            <p>Memuat menu...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <XCircle :size="48" class="error-icon" />
            <p>{{ error }}</p>
            <button class="btn-retry" @click="fetchMenus">Coba Lagi</button>
          </div>

          <!-- Empty State -->
          <div v-else-if="menus.length === 0" class="empty-state">
            <UtensilsCrossed :size="80" class="empty-icon" />
            <h3>Belum Ada Menu</h3>
            <p>Kantin ini belum menambahkan menu</p>
          </div>

          <!-- Menu Grid -->
          <div v-else class="menu-grid">
            <div
              v-for="menu in menus"
              :key="menu.id"
              class="menu-card"
              :class="{ 'out-of-stock': menu.stock === 0 }"
            >
              <div class="menu-image">
                <img
                  v-if="menu.photo_url"
                  :src="menu.photo_url"
                  :alt="menu.name"
                />
                <div v-else class="menu-placeholder">
                  <UtensilsCrossed :size="64" />
                </div>
                <div v-if="menu.stock === 0" class="stock-badge out">Habis</div>
                <div v-else-if="menu.stock < 5" class="stock-badge low">
                  Stok Terbatas
                </div>
              </div>

              <div class="menu-content">
                <h3 class="menu-name">{{ menu.name }}</h3>
                <p class="menu-category" v-if="menu.category">
                  {{ getCategoryLabel(menu.category) }}
                </p>
                <div class="menu-footer">
                  <span class="menu-price">{{
                    formatCurrency(menu.price)
                  }}</span>
                  <button
                    class="btn-order"
                    :disabled="menu.stock === 0 || !tenant?.is_open"
                    @click="addToCart(menu)"
                  >
                    {{ menu.stock === 0 ? "Habis" : "Pesan" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
    <Cart />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import Cart from "../components/Cart.vue";
import { useCart } from "../composables/useCart";
import api from "../config/api";
import {
  ShoppingCart,
  Store,
  Clock,
  CircleCheck,
  CircleX,
  XCircle,
  UtensilsCrossed,
} from "lucide-vue-next";
import { showError, showWarning } from "../utils/sweetAlert";

const route = useRoute();
const router = useRouter();
const {
  addToCart: addItemToCart,
  canAddItem,
  itemCount,
  totalPrice,
  openCart,
} = useCart();

const tenant = ref<any>(null);
const menus = ref<any[]>([]);
const loadingTenant = ref(false);
const loadingMenus = ref(false);
const error = ref<string | null>(null);

const tenantId = route.params.id;

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
  router.push("/");
};

const addToCart = (menu: any) => {
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
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.tenant-header {
  background: white;
  padding: 2rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem;
}

.btn-back {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0;
  transition: color 0.3s;
}

.btn-back:hover {
  color: #5568d3;
}

.tenant-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.tenant-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.tenant-name {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.tenant-hours {
  font-size: 1rem;
  color: #718096;
  margin: 0 0 0.75rem 0;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.open {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.closed {
  background: #fed7d7;
  color: #742a2a;
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

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.menu-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.menu-card.out-of-stock {
  opacity: 0.6;
}

.menu-image {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-placeholder {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.stock-badge.out {
  background: rgba(252, 129, 129, 0.9);
  color: white;
}

.stock-badge.low {
  background: rgba(251, 191, 36, 0.9);
  color: white;
}

.menu-content {
  padding: 1.5rem;
}

.menu-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.menu-category {
  font-size: 0.85rem;
  color: #667eea;
  background: #eef2ff;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.menu-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
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
