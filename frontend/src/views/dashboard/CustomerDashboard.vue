<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :menuItems="CUSTOMER_MENU_ITEMS" />
    
    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Dashboard</h1>
          <p class="text-gray-600">Selamat datang, {{ userName }}!</p>
        </div>
        <div class="flex gap-3">
          <Button
            :label="isRefreshing ? 'Memuat...' : 'Refresh'"
            icon="pi pi-refresh"
            :loading="isRefreshing"
            @click="refreshData"
            outlined
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

      <div class="flex flex-col gap-8">
        <!-- Quick Stats -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
        <Card v-if="activeOrders.length > 0" class="!bg-white !rounded-xl !shadow-md">
          <template #header>
            <div class="flex justify-between items-center p-6 pb-0">
              <h2 class="text-xl font-bold text-gray-900">🔔 Pesanan Aktif</h2>
              <Badge :value="activeOrders.length" severity="info" />
            </div>
          </template>
          
          <template #content>
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="order in activeOrders" :key="order.id" class="bg-gradient-to-b from-blue-50 to-white border-2 border-green-500 rounded-xl p-5 transition-all hover:shadow-lg">
              <!-- Order Progress Tracker -->
              <div class="flex items-center justify-between px-4 pt-6 pb-4 mb-4">
                <div class="flex flex-col items-center gap-2 relative transition-all" :class="{ 'opacity-40': false, 'opacity-100': true }">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all shadow-md bg-gradient-to-br from-green-400 to-green-600 text-white scale-110">📝</div>
                  <div class="text-xs font-semibold text-gray-900">Dibuat</div>
                </div>
                <div class="flex-1 h-0.5 mx-2 -mt-6 transition-all" :class="['preparing', 'ready_for_pickup', 'picked_up'].includes(order.status) ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-300'"></div>
                <div class="flex flex-col items-center gap-2 relative transition-all" :class="{ 'opacity-40': !['preparing', 'ready_for_pickup', 'picked_up'].includes(order.status), 'opacity-100': ['preparing', 'ready_for_pickup', 'picked_up'].includes(order.status) }">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all shadow-md" :class="['ready_for_pickup', 'picked_up'].includes(order.status) ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-110' : (['preparing', 'ready_for_pickup', 'picked_up'].includes(order.status) ? 'bg-gradient-to-br from-green-500 to-green-700 text-white animate-pulse' : 'bg-gray-300')">👨‍🍳</div>
                  <div class="text-xs font-semibold" :class="['preparing', 'ready_for_pickup', 'picked_up'].includes(order.status) ? 'text-gray-900' : 'text-gray-600'">Diproses</div>
                </div>
                <div class="flex-1 h-0.5 mx-2 -mt-6 transition-all" :class="['ready_for_pickup', 'picked_up'].includes(order.status) ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-300'"></div>
                <div class="flex flex-col items-center gap-2 relative transition-all" :class="{ 'opacity-40': !['ready_for_pickup', 'picked_up'].includes(order.status), 'opacity-100': ['ready_for_pickup', 'picked_up'].includes(order.status) }">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all shadow-md" :class="order.status === 'picked_up' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-110' : (['ready_for_pickup', 'picked_up'].includes(order.status) ? 'bg-gradient-to-br from-green-500 to-green-700 text-white animate-pulse' : 'bg-gray-300')">✅</div>
                  <div class="text-xs font-semibold" :class="['ready_for_pickup', 'picked_up'].includes(order.status) ? 'text-gray-900' : 'text-gray-600'">Siap</div>
                </div>
              </div>

              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-bold text-gray-900">#{{ order.id }}</h3>
                <Tag 
                  :value="getStatusLabel(order.status)"
                  :severity="getTagSeverity(order.status)"
                />
              </div>
              <div class="flex items-center gap-2 mb-3 font-semibold text-gray-700">
                <span class="text-xl">🏪</span>
                {{ order.tenant?.name || 'Kantin' }}
              </div>
              <div class="mb-4">
                <p v-for="item in order.items" :key="item.id" class="my-1 text-sm text-gray-700">
                  <span class="font-bold text-green-600">{{ item.quantity }}x</span>
                  {{ item.menu?.name }}
                </p>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                <span class="text-lg font-bold text-green-600">{{ formatCurrency(order.total_price) }}</span>
                <div class="flex gap-2">
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
        <Card class="!bg-white !rounded-xl !shadow-md">
          <template #header>
            <div class="flex justify-between items-center p-6 pb-0">
              <h2 class="text-xl font-bold text-gray-900">📋 Riwayat Pesanan</h2>
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
            <div v-if="loadingOrders" class="text-center py-12 text-gray-600">
              <ProgressSpinner />
              <p class="mt-4">Memuat pesanan...</p>
            </div>

            <div v-else-if="orderHistory.length === 0" class="text-center py-12 text-gray-600">
              <p class="mb-4">Belum ada riwayat pesanan</p>
              <Button
                label="Mulai Pesan"
                icon="pi pi-shopping-cart"
                @click="$router.push('/')"
                severity="success"
                raised
              />
            </div>

            <DataTable v-else :value="orderHistory" stripedRows class="text-sm">
              <Column field="id" header="ID">
                <template #body="slotProps">
                  <span class="font-semibold">#{{ slotProps.data.id }}</span>
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
                  <span class="font-bold text-green-600">{{ formatCurrency(slotProps.data.total_price) }}</span>
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
                  <span class="text-xs text-gray-600">{{ formatDate(slotProps.data.created_at) }}</span>
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
/* Minimal custom styles for animations */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.6);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}
</style>

