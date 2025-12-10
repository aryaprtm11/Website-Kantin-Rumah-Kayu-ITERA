<template>
  <div class="dashboard-layout">
    <Sidebar :menuItems="ADMIN_MENU_ITEMS" />
    
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard Admin</h1>
          <p class="dashboard-subtitle">Selamat datang kembali, {{ userName }}!</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" @click="refreshData">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Stats Overview - Hanya 2 Stats -->
        <section class="stats-grid">
          <StatsCard
            icon="🏪"
            :value="stats.totalTenants"
            label="Total Kantin"
            subtitle="Kantin terdaftar"
            color="#667eea"
          />
          <StatsCard
            icon="👥"
            :value="stats.totalUsers"
            label="Total Users"
            subtitle="Pengguna aktif"
            color="#f6ad55"
          />
        </section>

        <!-- Recent Tenants -->
        <section class="section-card">
          <div class="section-header">
            <h2 class="section-title">🏪 Kantin Terbaru</h2>
            <router-link to="/admin/tenants" class="link-view-all">
              Lihat Semua →
            </router-link>
          </div>
          
          <div v-if="loadingTenants" class="loading">
            <div class="spinner"></div>
            <p>Memuat data...</p>
          </div>

          <div v-else-if="recentTenants.length === 0" class="empty-state">
            <p>Belum ada kantin terdaftar</p>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nama Kantin</th>
                  <th>Pemilik</th>
                  <th>Status</th>
                  <th>Jam Operasional</th>
                  <th>Info</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tenant in recentTenants" :key="tenant.id">
                  <td class="tenant-name">{{ tenant.name }}</td>
                  <td>{{ tenant.user?.name || '-' }}</td>
                  <td>
                    <span class="badge badge-success">
                      🟢 Aktif
                    </span>
                  </td>
                  <td>{{ tenant.opens_at }} - {{ tenant.closes_at }}</td>
                  <td>
                    <span class="badge badge-info">{{ tenant.menus_count || 0 }} menu</span>
                    <span class="badge badge-secondary">{{ tenant.orders_count || 0 }} order</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Recent Orders -->
        <section class="section-card">
          <div class="section-header">
            <h2 class="section-title">📦 Pesanan Terbaru</h2>
            <a href="#" class="link-view-all" @click.prevent="() => {}">
              Lihat Semua →
            </a>
          </div>

          <div v-if="loadingOrders" class="loading">
            <div class="spinner"></div>
            <p>Memuat data...</p>
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
                  <th>Kantin</th>
                  <th>Total</th>
                  <th>Status Order</th>
                  <th>Status Bayar</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.user?.name || '-' }}</td>
                  <td>{{ order.tenant?.name || '-' }}</td>
                  <td class="amount">{{ formatCurrency(order.total_price) }}</td>
                  <td>
                    <span :class="['badge', getStatusClass(order.status)]">
                      {{ formatStatus(order.status) }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge', getPaymentStatusClass(order.payment_status)]">
                      {{ formatPaymentStatus(order.payment_status) }}
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
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import Sidebar from '../../components/dashboard/Sidebar.vue';
import StatsCard from '../../components/dashboard/StatsCard.vue';
import { AdminService } from '../../services/adminService';
import { ADMIN_MENU_ITEMS } from '../../constants/menuItems';

const { currentUser } = useAuth();

const userName = computed(() => currentUser.value?.name || 'Admin');

// Hapus definisi adminMenuItems lokal (line 170-177)

const stats = ref({
  totalTenants: 0,
  totalUsers: 0,
  // Hapus totalOrders dan totalRevenue
});

const recentTenants = ref<any[]>([]);
const recentOrders = ref<any[]>([]);
const loadingTenants = ref(false);
const loadingOrders = ref(false);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    created: 'badge-info',
    preparing: 'badge-warning',
    ready_for_pickup: 'badge-success',
    picked_up: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-danger',
  };
  return statusMap[status] || 'badge-secondary';
};

const getPaymentStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    unpaid: 'badge-danger',
    pending: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-danger',
    expired: 'badge-secondary',
  };
  return statusMap[status] || 'badge-secondary';
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    created: 'Dibuat',
    preparing: 'Diproses',
    ready_for_pickup: 'Siap Diambil',
    picked_up: 'Diambil',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return statusMap[status] || status;
};

const formatPaymentStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    unpaid: 'Belum Bayar',
    pending: 'Pending',
    paid: 'Lunas',
    failed: 'Gagal',
    expired: 'Kedaluwarsa',
  };
  return statusMap[status] || status;
};

const fetchStats = async () => {
  try {
    const data = await AdminService.getStats();
    stats.value = {
      totalTenants: data.total_tenants,
      totalUsers: data.total_users,
      // Hapus mapping totalOrders dan totalRevenue
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchRecentTenants = async () => {
  loadingTenants.value = true;
  try {
    const response = await AdminService.getTenants(1, 5);
    recentTenants.value = response.data || [];
  } catch (error) {
    console.error('Error fetching tenants:', error);
    recentTenants.value = [];
  } finally {
    loadingTenants.value = false;
  }
};

const fetchRecentOrders = async () => {
  loadingOrders.value = true;
  try {
    const response = await AdminService.getOrders(1, 5);
    recentOrders.value = response.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    recentOrders.value = [];
  } finally {
    loadingOrders.value = false;
  }
};

const refreshData = () => {
  fetchStats();
  fetchRecentTenants();
  fetchRecentOrders();
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f7fafc;
}

.dashboard-main {
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
  transition: margin-left 0.3s;
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

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  transition: color 0.3s;
}

.link-view-all:hover {
  color: #5568d3;
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
  to { transform: rotate(360deg); }
}

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
  color: #2d3748;
}

.data-table tr:hover {
  background: #f7fafc;
}

.tenant-name {
  font-weight: 600;
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
  margin-right: 0.5rem;
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
  
  .stats-grid {
    grid-template-columns: 1fr;
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

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>