<template>
  <div class="dashboard-layout">
    <Sidebar :menu-items="tenantMenuItems" />

    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard Kantin</h1>
          <p class="dashboard-subtitle">{{ tenantName }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" @click="refreshData">
            🔄 Refresh
          </button>
          <button class="btn-primary" @click="openAddMenuModal">
            ➕ Tambah Menu
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Stats Overview -->
        <section class="stats-grid">
          <StatsCard
            icon="📦"
            :value="stats.todayOrders"
            label="Pesanan Hari Ini"
            subtitle="Total pesanan"
            color="#667eea"
            :trend="`+${stats.orderGrowth}%`"
            :trend-up="true"
          />
          <StatsCard
            icon="💰"
            :value="formatCurrency(stats.todayRevenue)"
            label="Pendapatan Hari Ini"
            subtitle="Total pemasukan"
            color="#48bb78"
          />
          <StatsCard
            icon="🍽️"
            :value="stats.totalMenus"
            label="Menu Aktif"
            subtitle="Total menu tersedia"
            color="#f6ad55"
          />
          <StatsCard
            icon="⏱️"
            :value="stats.pendingOrders"
            label="Pesanan Pending"
            subtitle="Perlu diproses"
            color="#fc8181"
          />
        </section>

        <!-- Pending Orders - Priority -->
        <section class="section-card" v-if="pendingOrders.length > 0">
          <div class="section-header">
            <h2 class="section-title">🔔 Pesanan Perlu Diproses</h2>
            <span class="badge badge-danger"
              >{{ pendingOrders.length }} pesanan</span
            >
          </div>

          <div class="orders-grid">
            <div
              v-for="order in pendingOrders"
              :key="order.id"
              class="order-card urgent"
            >
              <div class="order-header">
                <h3 class="order-id">#{{ order.id }}</h3>
                <span class="order-time">{{
                  formatTime(order.created_at)
                }}</span>
              </div>
              <div class="order-customer">
                <span class="customer-icon">👤</span>
                {{ order.user?.name }}
              </div>
              <div class="order-items">
                <p
                  v-for="item in order.items"
                  :key="item.id"
                  class="order-item"
                >
                  <span class="item-qty">{{ item.quantity }}x</span>
                  {{ item.menu?.name }}
                </p>
              </div>
              <div class="order-footer">
                <span class="order-total">{{
                  formatCurrency(order.total_price)
                }}</span>
                <div class="order-actions">
                  <button class="btn-accept" @click="acceptOrder(order.id)">
                    ✓ Terima
                  </button>
                  <button class="btn-reject" @click="rejectOrder(order.id)">
                    ✕ Tolak
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Menu Management -->
        <section class="section-card">
          <div class="section-header">
            <h2 class="section-title">🍽️ Menu Kantin</h2>
            <router-link to="/tenant/menus" class="link-view-all">
              Kelola Menu →
            </router-link>
          </div>

          <div v-if="loadingMenus" class="loading">
            <div class="spinner"></div>
            <p>Memuat menu...</p>
          </div>

          <div v-else-if="menus.length === 0" class="empty-state">
            <p>Belum ada menu. Tambahkan menu pertama Anda!</p>
            <button class="btn-primary" @click="openAddMenuModal">
              ➕ Tambah Menu
            </button>
          </div>

          <div v-else class="menu-grid">
            <div v-for="menu in menus" :key="menu.id" class="menu-card">
              <div class="menu-image">
                <img v-if="menu.image" :src="menu.image" :alt="menu.name" />
                <div v-else class="menu-placeholder">🍽️</div>
              </div>
              <div class="menu-info">
                <h3 class="menu-name">{{ menu.name }}</h3>
                <p class="menu-price">{{ formatCurrency(menu.price) }}</p>
                <div class="menu-stock">
                  <span :class="['stock-badge', getStockClass(menu.stock)]">
                    Stok: {{ menu.stock }}
                  </span>
                </div>
              </div>
              <div class="menu-actions">
                <button class="btn-icon" @click="editMenu(menu)" title="Edit">
                  ✏️
                </button>
                <button
                  class="btn-icon"
                  @click="toggleMenuAvailability(menu)"
                  :title="menu.is_available ? 'Nonaktifkan' : 'Aktifkan'"
                >
                  {{ menu.is_available ? "👁️" : "🚫" }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Orders History -->
        <section class="section-card">
          <div class="section-header">
            <h2 class="section-title">📋 Riwayat Pesanan</h2>
            <router-link to="/tenant/orders" class="link-view-all">
              Lihat Semua →
            </router-link>
          </div>

          <div v-if="loadingOrders" class="loading">
            <div class="spinner"></div>
            <p>Memuat pesanan...</p>
          </div>

          <div v-else-if="recentOrders.length === 0" class="empty-state">
            <p>Belum ada pesanan</p>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.user?.name }}</td>
                  <td>{{ order.items?.length || 0 }} item</td>
                  <td class="amount">
                    {{ formatCurrency(order.total_price) }}
                  </td>
                  <td>
                    <span :class="['badge', getStatusClass(order.status)]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="datetime">{{ formatDate(order.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Sidebar from "../../components/dashboard/Sidebar.vue";
import StatsCard from "../../components/dashboard/StatsCard.vue";
import { TenantService } from "../../services/tenantService";

const tenantInfo = ref<any>(null);
const tenantName = computed(() => tenantInfo.value?.name || "Kantin Saya");

const tenantMenuItems = [
  { path: "/tenant/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/tenant/orders", icon: "📦", label: "Pesanan" },
  { path: "/tenant/menus", icon: "🍽️", label: "Menu" },
  { path: "/tenant/reports", icon: "📈", label: "Laporan" },
  { path: "/tenant/settings", icon: "⚙️", label: "Pengaturan" },
];

const stats = ref({
  todayOrders: 0,
  todayRevenue: 0,
  totalMenus: 0,
  pendingOrders: 0,
  orderGrowth: 12,
});

const menus = ref<any[]>([]);
const pendingOrders = ref<any[]>([]);
const recentOrders = ref<any[]>([]);
const loadingMenus = ref(false);
const loadingOrders = ref(false);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStockClass = (stock: number) => {
  if (stock === 0) return "stock-empty";
  if (stock < 5) return "stock-low";
  return "stock-ok";
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    created: "badge-warning",
    preparing: "badge-info",
    ready_for_pickup: "badge-success",
    picked_up: "badge-success",
    completed: "badge-success",
    cancelled: "badge-danger",
  };
  return map[status] || "badge-secondary";
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    created: "Baru",
    preparing: "Diproses",
    ready_for_pickup: "Siap Diambil",
    picked_up: "Diambil",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return map[status] || status;
};

const fetchTenantInfo = async () => {
  try {
    tenantInfo.value = await TenantService.getTenantInfo();
  } catch (error) {
    console.error("Error fetching tenant info:", error);
  }
};

const fetchStats = async () => {
  try {
    const data = await TenantService.getStats();
    stats.value = {
      todayOrders: data.today_orders,
      todayRevenue: data.today_revenue,
      totalMenus: data.total_menus,
      pendingOrders: data.pending_orders,
      orderGrowth: 12, // Calculate from historical data if needed
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};

const fetchMenus = async () => {
  loadingMenus.value = true;
  try {
    const response = await TenantService.getMenus(1, 6);
    menus.value = response.data || [];
  } catch (error) {
    console.error("Error fetching menus:", error);
    menus.value = [];
  } finally {
    loadingMenus.value = false;
  }
};

const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    // Fetch pending orders (created status)
    const pendingResponse = await TenantService.getOrders(1, 10, 'created');
    pendingOrders.value = pendingResponse.data || [];

    // Fetch recent orders
    const recentResponse = await TenantService.getOrders(1, 5);
    recentOrders.value = recentResponse.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    pendingOrders.value = [];
    recentOrders.value = [];
  } finally {
    loadingOrders.value = false;
  }
};

const openAddMenuModal = () => {
  alert("Fitur tambah menu akan segera hadir!");
};

const editMenu = (menu: any) => {
  alert(`Edit menu: ${menu.name}`);
};

const toggleMenuAvailability = (menu: any) => {
  alert(`Toggle availability: ${menu.name}`);
};

const acceptOrder = async (orderId: number) => {
  try {
    await TenantService.acceptOrder(orderId);
    alert(`Pesanan #${orderId} diterima dan sedang diproses`);
    // Refresh orders
    fetchOrders();
    fetchStats();
  } catch (error: any) {
    alert(`Gagal menerima pesanan: ${error.message}`);
  }
};

const rejectOrder = (orderId: number) => {
  if (confirm(`Yakin ingin menolak pesanan #${orderId}?`)) {
    alert("Fitur reject order akan segera hadir!");
  }
};

const refreshData = () => {
  fetchTenantInfo();
  fetchStats();
  fetchMenus();
  fetchOrders();
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
/* Reuse styles from AdminDashboard */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f7fafc;
}

.dashboard-main {
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.dashboard-subtitle {
  color: #718096;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-refresh {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.link-view-all {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.link-view-all:hover {
  text-decoration: underline;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.spinner {
  width: 40px;
  height: 40px;
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

/* Orders Grid */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.order-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s;
}

.order-card.urgent {
  border-color: #fc8181;
  background: #fff5f5;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.order-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.order-time {
  font-size: 0.875rem;
  color: #718096;
}

.order-customer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #4a5568;
}

.customer-icon {
  font-size: 1.2rem;
}

.order-items {
  margin-bottom: 1rem;
}

.order-item {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #4a5568;
}

.item-qty {
  font-weight: 700;
  color: #667eea;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.order-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #48bb78;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-accept,
.btn-reject {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-accept {
  background: #48bb78;
  color: white;
}

.btn-accept:hover {
  background: #38a169;
}

.btn-reject {
  background: #fed7d7;
  color: #742a2a;
}

.btn-reject:hover {
  background: #fc8181;
  color: white;
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.menu-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.menu-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.menu-image {
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-placeholder {
  font-size: 4rem;
  color: white;
}

.menu-info {
  padding: 1rem;
}

.menu-name {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.menu-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #48bb78;
  margin: 0 0 0.75rem 0;
}

.menu-stock {
  margin-bottom: 0.5rem;
}

.stock-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.stock-ok {
  background: #c6f6d5;
  color: #22543d;
}

.stock-low {
  background: #fef5e7;
  color: #975a16;
}

.stock-empty {
  background: #fed7d7;
  color: #742a2a;
}

.menu-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.btn-icon:hover {
  opacity: 1;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tr:hover {
  background: #f7fafc;
}

.amount {
  font-weight: 700;
  color: #48bb78;
}

.datetime {
  font-size: 0.875rem;
  color: #718096;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.badge-success {
  background: #c6f6d5;
  color: #22543d;
}

.badge-danger {
  background: #fed7d7;
  color: #742a2a;
}

.badge-warning {
  background: #fef5e7;
  color: #975a16;
}

.badge-info {
  background: #bee3f8;
  color: #2c5282;
}

.badge-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-grid,
  .orders-grid,
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
