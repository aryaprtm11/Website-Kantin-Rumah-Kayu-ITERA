<template>
  <div class="dashboard-layout">
    <Sidebar :menu-items="customerMenuItems" />
    
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">Selamat datang, {{ userName }}!</p>
        </div>
        <div class="header-actions">
          <router-link to="/" class="btn-browse">
            🏪 Jelajahi Kantin
          </router-link>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Quick Stats -->
        <section class="stats-grid">
          <StatsCard
            icon="📦"
            :value="stats.totalOrders"
            label="Total Pesanan"
            subtitle="Semua waktu"
            color="#667eea"
          />
          <StatsCard
            icon="⏱️"
            :value="stats.activeOrders"
            label="Pesanan Aktif"
            subtitle="Sedang diproses"
            color="#f6ad55"
          />
          <StatsCard
            icon="✅"
            :value="stats.completedOrders"
            label="Selesai"
            subtitle="Pesanan selesai"
            color="#48bb78"
          />
          <StatsCard
            icon="💰"
            :value="formatCurrency(stats.totalSpent)"
            label="Total Pengeluaran"
            subtitle="Semua waktu"
            color="#9f7aea"
          />
        </section>

        <!-- Active Orders -->
        <section class="section-card" v-if="activeOrders.length > 0">
          <div class="section-header">
            <h2 class="section-title">🔔 Pesanan Aktif</h2>
          </div>

          <div class="orders-grid">
            <div v-for="order in activeOrders" :key="order.id" class="order-card active-order">
              <div class="order-header">
                <h3 class="order-id">#{{ order.id }}</h3>
                <span :class="['status-badge', getStatusClass(order.status)]">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              <div class="order-tenant">
                <span class="tenant-icon">🏪</span>
                {{ order.tenant?.name || 'Kantin' }}
              </div>
              <div class="order-items">
                <p v-for="item in order.items" :key="item.id" class="order-item">
                  <span class="item-qty">{{ item.quantity }}x</span>
                  {{ item.menu?.name }}
                </p>
              </div>
              <div class="order-footer">
                <span class="order-total">{{ formatCurrency(order.total_price) }}</span>
                <div class="order-actions">
                  <button 
                    v-if="order.status === 'ready_for_pickup'" 
                    class="btn-pickup"
                    @click="markPickedUp(order.id)"
                  >
                    ✓ Sudah Diambil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Order History -->
        <section class="section-card">
          <div class="section-header">
            <h2 class="section-title">📋 Riwayat Pesanan</h2>
            <router-link to="/customer/orders" class="btn-view-all">
              Lihat Semua →
            </router-link>
          </div>

          <div v-if="loadingOrders" class="loading">
            <div class="spinner"></div>
            <p>Memuat pesanan...</p>
          </div>

          <div v-else-if="orderHistory.length === 0" class="empty-state">
            <p>Belum ada riwayat pesanan</p>
            <router-link to="/" class="btn-primary">
              Mulai Pesan
            </router-link>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kantin</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orderHistory" :key="order.id">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.tenant?.name }}</td>
                  <td>{{ order.items?.length || 0 }} item</td>
                  <td class="amount">{{ formatCurrency(order.total_price) }}</td>
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
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import Sidebar from '../../components/dashboard/Sidebar.vue';
import StatsCard from '../../components/dashboard/StatsCard.vue';
import api from '../../config/api';

const { currentUser } = useAuth();

const userName = computed(() => currentUser.value?.name || 'User');

const customerMenuItems = [
  { path: '/customer/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/customer/orders', icon: '📦', label: 'Pesanan Saya' },
  { path: '/', icon: '🏪', label: 'Jelajahi Kantin' },
  { path: '/customer/profile', icon: '👤', label: 'Profil' },
];

const stats = ref({
  totalOrders: 0,
  activeOrders: 0,
  completedOrders: 0,
  totalSpent: 0,
});

const activeOrders = ref<any[]>([]);
const orderHistory = ref<any[]>([]);
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
  const map: Record<string, string> = {
    created: 'badge-warning',
    preparing: 'badge-info',
    ready_for_pickup: 'badge-success',
    picked_up: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-danger',
  };
  return map[status] || 'badge-secondary';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    created: 'Dibuat',
    preparing: 'Diproses',
    ready_for_pickup: 'Siap Diambil',
    picked_up: 'Sudah Diambil',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return map[status] || status;
};

const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    const response = await api.get('/orders');
    const orders = response.data.data || response.data;
    
    // Separate active and history
    activeOrders.value = orders.filter((o: any) => 
      ['created', 'preparing', 'ready_for_pickup'].includes(o.status)
    );
    
    orderHistory.value = orders;
    
    // Calculate stats
    stats.value = {
      totalOrders: orders.length,
      activeOrders: activeOrders.value.length,
      completedOrders: orders.filter((o: any) => o.status === 'completed').length,
      totalSpent: orders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0),
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    orderHistory.value = [];
  } finally {
    loadingOrders.value = false;
  }
};

const markPickedUp = async (orderId: number) => {
  try {
    await api.post(`/orders/${orderId}/pickup`);
    await fetchOrders();
  } catch (error) {
    console.error('Error marking order as picked up:', error);
    alert('Gagal mengupdate status pesanan');
  }
};

onMounted(() => {
  fetchOrders();
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

.btn-browse {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-browse:hover {
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

.btn-primary {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
}

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

.order-card.active-order {
  border-color: #667eea;
  background: #f7faff;
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

.order-tenant {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #4a5568;
}

.tenant-icon {
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

.btn-pickup {
  padding: 0.5rem 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-pickup:hover {
  background: #38a169;
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

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.btn-view-all {
  padding: 0.5rem 1rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-view-all:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
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
  .orders-grid {
    grid-template-columns: 1fr;
  }
}
</style>

