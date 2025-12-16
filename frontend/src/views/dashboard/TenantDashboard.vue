<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :menuItems="TENANT_MENU_ITEMS" />

    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Dashboard Kantin</h1>
          <p class="text-gray-600 text-lg">{{ tenantName }}</p>
        </div>
        <div class="flex gap-3 items-center">
          <button
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 border border-gray-200 rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
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
            icon="Package"
            :value="stats.todayOrders"
            label="Pesanan Hari Ini"
            subtitle="Total pesanan"
            color="#22c55e"
          />
          <StatsCard
            icon="DollarSign"
            :value="formatCurrency(stats.todayRevenue)"
            label="Pendapatan Hari Ini"
            subtitle="Total pemasukan"
            color="#48bb78"
          />
        </section>

        <!-- Pending Orders - Priority -->
        <section class="bg-white rounded-xl p-6 shadow-md" v-if="pendingOrders.length > 0">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell :size="20" />
              Pesanan Perlu Diproses
            </h2>
            <span class="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-red-100 text-red-800"
              >{{ pendingOrders.length }} pesanan</span
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="order in pendingOrders"
              :key="order.id"
              class="bg-red-50 border-2 border-red-200 rounded-xl p-5 transition-all hover:shadow-lg"
            >
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-bold text-gray-900">#{{ order.id }}</h3>
                <span class="text-sm text-gray-600">{{
                  formatTime(order.created_at)
                }}</span>
              </div>
              <div class="flex items-center gap-2 mb-3 font-semibold text-gray-700">
                <User :size="16" />
                {{ order.user?.name }}
              </div>
              <div class="mb-4">
                <p
                  v-for="item in order.items"
                  :key="item.id"
                  class="my-1 text-sm text-gray-700"
                >
                  <span class="font-bold text-green-600">{{ item.quantity }}x</span>
                  {{ item.menu?.name }}
                </p>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-red-200">
                <span class="text-lg font-bold text-green-600">{{
                  formatCurrency(order.total_price)
                }}</span>
                <div class="flex gap-2">
                  <button class="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm transition-all hover:bg-green-700 flex items-center gap-1" @click="acceptOrder(order.id)">
                    <Check :size="16" />
                    Terima
                  </button>
                  <button class="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold text-sm transition-all hover:bg-red-200 hover:text-white flex items-center gap-1" @click="rejectOrder(order.id)">
                    <X :size="16" />
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Menu Management -->
        <section class="bg-white rounded-xl p-6 shadow-md">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed :size="20" />
              Menu Kantin
            </h2>
            <router-link to="/tenant/menus" class="text-green-600 no-underline font-semibold hover:text-green-700 transition-colors">
              Kelola Menu →
            </router-link>
          </div>

          <div v-if="loadingMenus" class="text-center py-12 text-gray-600">
            <div class="w-10 h-10 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Memuat menu...</p>
          </div>

          <div v-else-if="menus.length === 0" class="text-center py-12 text-gray-600">
            <p>Belum ada menu. Tambahkan menu pertama Anda!</p>
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div v-for="menu in menus" :key="menu.id" class="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div class="w-full h-32 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                  <img :src="menu.image || nasigoreng" :alt="menu.name" class="w-full h-full object-cover" />
                </div>
              <div class="p-4">
                <h3 class="text-base font-bold text-gray-900 mb-2 line-clamp-1">{{ menu.name }}</h3>
                <p class="text-lg font-bold text-green-600 mb-3">{{ formatCurrency(menu.price) }}</p>
                <div>
                  <span :class="['inline-block px-3 py-1 rounded-xl text-xs font-semibold', getStockClass(menu.stock)]">
                    Stok: {{ menu.stock }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Orders History -->
        <section class="bg-white rounded-xl p-6 shadow-md">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">📋 Riwayat Pesanan</h2>
            <router-link to="/tenant/orders" class="text-green-600 no-underline font-semibold hover:text-green-700 transition-colors">
              Lihat Semua →
            </router-link>
          </div>

          <div v-if="loadingOrders" class="text-center py-12 text-gray-600">
            <div class="w-10 h-10 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Memuat pesanan...</p>
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
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Items</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Total</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Status</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900">#{{ order.id }}</td>
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ order.user?.name }}</td>
                  <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ order.items?.length || 0 }} item</td>
                  <td class="py-4 px-4 border-b border-gray-200 font-bold text-green-600">
                    {{ formatCurrency(order.total_price) }}
                  </td>
                  <td class="py-4 px-4 border-b border-gray-200">
                    <span :class="['inline-block px-3 py-1 rounded-xl text-xs font-semibold', getStatusClass(order.status)]">
                      {{ getStatusLabel(order.status) }}
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
import { ref, computed, onMounted } from "vue";
import Sidebar from "../../components/dashboard/Sidebar.vue";
import StatsCard from "../../components/dashboard/StatsCard.vue";
import { TenantService } from "../../services/tenantService";
import { TENANT_MENU_ITEMS } from "../../constants/menuItems";
import { Bell, UtensilsCrossed, User, RefreshCw, Check, X } from "lucide-vue-next";
import nasigoreng from '../../assets/nasigoreng.jpeg';
import { showSuccess, showError, showConfirm, showInfo } from "../../utils/sweetAlert";

const tenantInfo = ref<any>(null);
const tenantName = computed(() => tenantInfo.value?.name || "Kantin Saya");

const stats = ref({
  todayOrders: 0,
  todayRevenue: 0,
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
  if (stock === 0) return "bg-red-100 text-red-800";
  if (stock < 5) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    created: "bg-yellow-100 text-yellow-800",
    preparing: "bg-blue-100 text-blue-800",
    ready_for_pickup: "bg-green-100 text-green-800",
    picked_up: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-200 text-gray-700";
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

const acceptOrder = async (orderId: number) => {
  try {
    await TenantService.acceptOrder(orderId);
    await showSuccess(`Pesanan #${orderId} diterima dan sedang diproses`);
    // Refresh orders
    fetchOrders();
    fetchStats();
  } catch (error: any) {
    showError(`Gagal menerima pesanan: ${error.message}`);
  }
};

const rejectOrder = async (orderId: number) => {
  const result = await showConfirm(
    `Pesanan #${orderId} akan ditolak dan tidak dapat dikembalikan.`,
    "Yakin ingin menolak pesanan ini?",
    "Ya, Tolak",
    "Batal"
  );
  
  if (result.isConfirmed) {
    showInfo("Fitur reject order akan segera hadir!");
  }
};

const isRefreshing = ref(false);

const refreshData = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await Promise.all([fetchTenantInfo(), fetchStats(), fetchMenus(), fetchOrders()]);
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
/* Minimal custom styles - using Tailwind */
</style>
