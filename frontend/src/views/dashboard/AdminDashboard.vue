<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :menuItems="ADMIN_MENU_ITEMS" />
    
    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8 transition-all">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Dashboard Admin</h1>
          <p class="text-gray-600">Selamat datang kembali, {{ userName }}!</p>
        </div>
        <div class="flex gap-4">
          <button
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            :disabled="isRefreshing"
            @click="refreshData"
            aria-label="Refresh data"
          >
            <RefreshCw :size="18" :class="{ 'animate-spin': isRefreshing }" />
            <span>{{ isRefreshing ? 'Memuat...' : 'Refresh' }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-8">
        <!-- Stats Overview - Hanya 2 Stats -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <StatsCard
            icon="Store"
            :value="stats.totalTenants"
            label="Total Kantin"
            subtitle="Kantin terdaftar"
            color="#22c55e"
          />
          <StatsCard
            icon="Users"
            :value="stats.totalUsers"
            label="Total Users"
            subtitle="Pengguna aktif"
            color="#f6ad55"
          />
        </section>

        <!-- Recent Tenants -->
        <section class="bg-white rounded-xl p-6 shadow-md">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">🏪 Kantin Terbaru</h2>
            <router-link to="/admin/tenants" class="text-green-600 no-underline font-semibold hover:text-green-700 transition-colors">
              Lihat Semua →
            </router-link>
          </div>
          
          <div v-if="loadingTenants" class="text-center py-12 text-gray-600">
            <div class="w-10 h-10 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Memuat data...</p>
          </div>

          <div v-else-if="recentTenants.length === 0" class="text-center py-12 text-gray-600">
            <p>Belum ada kantin terdaftar</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Nama Kantin</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Pemilik</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Status</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Jam Operasional</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Info</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tenant in recentTenants" :key="tenant.id" class="hover:bg-gray-50 transition-colors">
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900 font-semibold">{{ tenant.name }}</td>
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ tenant.user?.name || '-' }}</td>
                  <td class="py-4 px-4 border-b border-gray-200">
                    <span class="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-green-100 text-green-800">
                      🟢 Aktif
                    </span>
                  </td>
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ tenant.opens_at }} - {{ tenant.closes_at }}</td>
                  <td class="py-4 px-4 border-b border-gray-200">
                    <span class="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-blue-100 text-blue-800 mr-2">{{ tenant.menus_count || 0 }} menu</span>
                    <span class="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-gray-200 text-gray-700">{{ tenant.orders_count || 0 }} order</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Recent Orders -->
        <section class="bg-white rounded-xl p-6 shadow-md">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">📦 Pesanan Terbaru</h2>
            <a href="#" class="text-green-600 no-underline font-semibold hover:text-green-700 transition-colors" @click.prevent="() => {}">
              Lihat Semua →
            </a>
          </div>

          <div v-if="loadingOrders" class="text-center py-12 text-gray-600">
            <div class="w-10 h-10 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Memuat data...</p>
          </div>

          <div v-else-if="recentOrders.length === 0" class="text-center py-12 text-gray-600">
            <p>Belum ada pesanan</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">ID</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Customer</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Kantin</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Total</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Status Order</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Status Bayar</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900">#{{ order.id }}</td>
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ order.user?.name || '-' }}</td>
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ order.tenant?.name || '-' }}</td>
                  <td class="py-4 px-4 border-b border-gray-200 font-bold text-green-600">{{ formatCurrency(order.total_price) }}</td>
                  <td class="py-4 px-4 border-b border-gray-200">
                    <span :class="['inline-block px-3 py-1 rounded-xl text-xs font-semibold', getStatusClass(order.status)]">
                      {{ formatStatus(order.status) }}
                    </span>
                  </td>
                  <td class="py-4 px-4 border-b border-gray-200">
                    <span :class="['inline-block px-3 py-1 rounded-xl text-xs font-semibold', getPaymentStatusClass(order.payment_status)]">
                      {{ formatPaymentStatus(order.payment_status) }}
                    </span>
                  </td>
                  <td class="py-4 px-4 border-b border-gray-200 text-sm text-gray-600">{{ formatDate(order.created_at) }}</td>
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
import { RefreshCw } from 'lucide-vue-next';
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
    created: 'bg-blue-100 text-blue-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    ready_for_pickup: 'bg-green-100 text-green-800',
    picked_up: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return statusMap[status] || 'bg-gray-200 text-gray-700';
};

const getPaymentStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    unpaid: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    expired: 'bg-gray-200 text-gray-700',
  };
  return statusMap[status] || 'bg-gray-200 text-gray-700';
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

const isRefreshing = ref(false);

const refreshData = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await Promise.all([fetchStats(), fetchRecentTenants(), fetchRecentOrders()]);
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    isRefreshing.value = false;
  }
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
/* Minimal custom styles - using Tailwind */
</style>
