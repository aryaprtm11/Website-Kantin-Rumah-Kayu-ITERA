<template>
  <div class="dashboard-layout">
    <Sidebar :menuItems="CUSTOMER_MENU_ITEMS" />
    
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">Selamat datang, {{ userName }}!</p>
        </div>
        <div class="header-actions">
          <Button
            :label="isRefreshing ? 'Memuat...' : 'Refresh'"
            icon="pi pi-refresh"
            :loading="isRefreshing"
            @click="refreshData"
            outlined
            class="btn-refresh"
          />
          <Button
            label="Jelajahi Kantin"
            icon="pi pi-shopping-bag"
            @click="$router.push('/#tenants')"
            severity="success"
            raised
          />
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
            color="#22c55e"
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
        <Card v-if="activeOrders.length > 0" class="section-card">
          <template #header>
            <div class="section-header">
              <h2 class="section-title">🔔 Pesanan Aktif</h2>
              <Badge :value="activeOrders.length" severity="info" />
            </div>
          </template>
          
          <template #content>
            <div class="orders-grid">
            <div v-for="order in activeOrders" :key="order.id" class="order-card active-order">
              <!-- Order Progress Tracker -->
              <div class="order-progress">
                <div class="progress-step" :class="{ active: true, completed: true }">
                  <div class="step-icon">📝</div>
                  <div class="step-label">Dibuat</div>
                </div>
                <div class="progress-line" :class="{ completed: ['preparing', 'ready_for_pickup', 'picked_up'].includes(order.status) }"></div>
                <div class="progress-step" :class="{ 
                  active: ['preparing', 'ready_for_pickup', 'picked_up'].includes(order.status),
                  completed: ['ready_for_pickup', 'picked_up'].includes(order.status)
                }">
                  <div class="step-icon">👨‍🍳</div>
                  <div class="step-label">Diproses</div>
                </div>
                <div class="progress-line" :class="{ completed: ['ready_for_pickup', 'picked_up'].includes(order.status) }"></div>
                <div class="progress-step" :class="{ 
                  active: ['ready_for_pickup', 'picked_up'].includes(order.status),
                  completed: order.status === 'picked_up'
                }">
                  <div class="step-icon">✅</div>
                  <div class="step-label">Siap</div>
                </div>
              </div>

              <div class="order-header">
                <h3 class="order-id">#{{ order.id }}</h3>
                <Tag 
                  :value="getStatusLabel(order.status)"
                  :severity="getTagSeverity(order.status)"
                />
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
                  <Button 
                    v-if="order.payment_status === 'pending' || order.payment_status === 'unpaid'"
                    label="Bayar"
                    icon="pi pi-credit-card"
                    @click="payOrder(order.id)"
                    severity="success"
                    size="small"
                  />
                  <Button 
                    v-if="order.status === 'ready_for_pickup'" 
                    label="Sudah Diambil"
                    icon="pi pi-check"
                    @click="markPickedUp(order.id)"
                    severity="success"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
          </template>
        </Card>

        <!-- Order History -->
        <Card class="section-card">
          <template #header>
            <div class="section-header">
              <h2 class="section-title">📋 Riwayat Pesanan</h2>
              <Button
                label="Lihat Semua"
                icon="pi pi-arrow-right"
                @click="$router.push('/customer/orders')"
                text
                severity="success"
              />
            </div>
          </template>

          <template #content>
            <div v-if="loadingOrders" class="loading">
              <ProgressSpinner />
              <p>Memuat pesanan...</p>
            </div>

            <div v-else-if="orderHistory.length === 0" class="empty-state">
              <p>Belum ada riwayat pesanan</p>
              <Button
                label="Mulai Pesan"
                icon="pi pi-shopping-cart"
                @click="$router.push('/')"
                severity="success"
                raised
              />
            </div>

            <DataTable v-else :value="orderHistory" stripedRows>
              <Column field="id" header="ID">
                <template #body="slotProps">
                  #{{ slotProps.data.id }}
                </template>
              </Column>
              <Column field="tenant.name" header="Kantin" />
              <Column header="Items">
                <template #body="slotProps">
                  {{ slotProps.data.items?.length || 0 }} item
                </template>
              </Column>
              <Column header="Total">
                <template #body="slotProps">
                  <span class="amount">{{ formatCurrency(slotProps.data.total_price) }}</span>
                </template>
              </Column>
              <Column header="Status">
                <template #body="slotProps">
                  <Tag 
                    :value="getStatusLabel(slotProps.data.status)"
                    :severity="getTagSeverity(slotProps.data.status)"
                  />
                </template>
              </Column>
              <Column header="Tanggal">
                <template #body="slotProps">
                  <span class="datetime">{{ formatDate(slotProps.data.created_at) }}</span>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import Sidebar from '../../components/dashboard/Sidebar.vue';
import StatsCard from '../../components/dashboard/StatsCard.vue';
import { CustomerService } from '../../services/customerService';
import api from '../../config/api';
import { CUSTOMER_MENU_ITEMS } from '../../constants/menuItems';
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';

const { currentUser } = useAuth();

const userName = computed(() => currentUser.value?.name || 'User');


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

const getTagSeverity = (status: string) => {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    created: 'warning',
    preparing: 'info',
    ready_for_pickup: 'success',
    picked_up: 'success',
    completed: 'success',
    cancelled: 'danger',
  };
  return map[status] || 'info';
};

const fetchStats = async () => {
  try {
    const data = await CustomerService.getStats();
    stats.value = {
      totalOrders: data.total_orders,
      activeOrders: data.active_orders,
      completedOrders: data.completed_orders,
      totalSpent: data.total_spent,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
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
    
    orderHistory.value = orders.slice(0, 5); // Show only 5 recent orders
  } catch (error) {
    console.error('Error fetching orders:', error);
    orderHistory.value = [];
  } finally {
    loadingOrders.value = false;
  }
};

const payOrder = async (orderId: number) => {
  const result = await showConfirm(
    'Pastikan Anda sudah melakukan pembayaran di kantin.',
    'Konfirmasi pembayaran?',
    'Ya, Sudah Bayar',
    'Batal'
  );
  
  if (!result.isConfirmed) return;
  
  try {
    await api.post(`/orders/${orderId}/pay`);
    await refreshData();
    await showSuccess('Pembayaran berhasil!');
  } catch (error: any) {
    console.error('Error paying order:', error);
    showError(error.response?.data?.message || 'Gagal melakukan pembayaran');
  }
};

const markPickedUp = async (orderId: number) => {
  const result = await showConfirm(
    'Pastikan Anda sudah mengambil pesanan.',
    'Konfirmasi pesanan sudah diambil?',
    'Ya, Sudah Diambil',
    'Batal'
  );
  
  if (!result.isConfirmed) return;
  
  try {
    await api.post(`/orders/${orderId}/pickup`);
    await refreshData();
    await showSuccess('Pesanan berhasil ditandai sudah diambil!');
  } catch (error: any) {
    console.error('Error marking order as picked up:', error);
    showError(error.response?.data?.message || 'Gagal mengupdate status pesanan');
  }
};

const isRefreshing = ref(false);

const refreshData = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await Promise.all([fetchStats(), fetchOrders()]);
  } catch (err) {
    console.error('Error refreshing data:', err);
  } finally {
    isRefreshing.value = false;
  }
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
  margin-left: 280px;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.9rem;
  background: linear-gradient(90deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(15,23,42,0.06);
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}

.btn-refresh:disabled { opacity: 0.6; cursor: wait; }

.refresh-icon { color: #06b6d4; }
.btn-label { font-weight: 700; color: #0f172a; }

.btn-browse {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.btn-browse:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(99,102,241,0.12); }
.browse-icon { color: rgba(255,255,255,0.95); }

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin { animation: spin 1s linear infinite; }

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
  border-top-color: #22c55e;
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
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
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
  border-color: #22c55e;
  background: linear-gradient(to bottom, #f7faff 0%, white 100%);
}

/* Order Progress Tracker */
.order-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1rem 1rem;
  margin-bottom: 1rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  opacity: 0.4;
  transition: all 0.3s;
}

.progress-step.active {
  opacity: 1;
}

.progress-step.completed .step-icon {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  transform: scale(1.1);
}

.step-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-step.active .step-icon {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.6);
  }
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  text-align: center;
}

.progress-step.active .step-label {
  color: #2d3748;
}

.progress-line {
  flex: 1;
  height: 3px;
  background: #e2e8f0;
  margin: 0 0.5rem;
  position: relative;
  top: -12px;
  transition: all 0.3s;
}

.progress-line.completed {
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
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
  color: #22c55e;
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

.btn-pay {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-pay:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.btn-pickup {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-pickup:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
  color: #22c55e;
  border: 2px solid #22c55e;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-view-all:hover {
  background: #22c55e;
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

