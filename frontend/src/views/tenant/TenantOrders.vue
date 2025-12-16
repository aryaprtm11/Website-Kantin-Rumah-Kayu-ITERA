<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :menuItems="TENANT_MENU_ITEMS" />

    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Kelola Pesanan</h1>
          <p class="text-gray-600">Atur pesanan masuk dari pelanggan</p>
        </div>
        <div class="flex gap-3">
          <button
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            :disabled="isRefreshing"
            @click="refreshOrders"
            aria-label="Segarkan pesanan"
            :aria-busy="isRefreshing"
            :title="isRefreshing ? 'Memuat...' : 'Segarkan pesanan'"
          >
            <RefreshCw
              :size="16"
              :class="{ 'animate-spin': isRefreshing }"
            />
            <span>{{
              isRefreshing ? "Memuat..." : "Refresh"
            }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <!-- Filter Tabs -->
        <div class="flex gap-4 overflow-x-auto py-2">
          <button
            v-for="filter in filters"
            :key="filter.value"
            :class="['inline-flex items-center gap-3 px-5 py-3 rounded-full font-extrabold text-gray-900 cursor-pointer transition-all whitespace-nowrap min-w-[90px] justify-center hover:-translate-y-1 hover:shadow-lg', activeFilter === filter.value ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-transparent shadow-lg' : 'bg-gradient-to-b from-white to-gray-50 border border-gray-200']"
            @click="setFilter(filter.value)"
            :title="filter.label"
          >
            <component
              v-if="filter.icon"
              :is="filter.icon"
              :size="16"
            />
            <span>{{ filter.label }}</span>
            <span v-if="filter.count > 0" :class="['inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-extrabold', activeFilter === filter.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-900']">{{
              filter.count
            }}</span>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <div class="w-12 h-12 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Memuat pesanan...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-16">
          <p class="text-red-600 mb-4">❌ {{ error }}</p>
          <button class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all" @click="fetchOrders">Coba Lagi</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-16">
          <div class="text-7xl mb-4">📦</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h3>
          <p class="text-gray-600" v-if="activeFilter === 'all'">Belum ada pesanan masuk</p>
          <p class="text-gray-600" v-else>Tidak ada pesanan dengan status ini</p>
        </div>

        <!-- Orders Grid -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            :class="['bg-white rounded-xl p-6 shadow-md transition-all hover:shadow-xl border-l-4', getOrderCardClass(order.status)]"
          >
            <!-- Order Header (enhanced) -->
            <div class="flex justify-between items-center gap-4 mb-4 pb-4 border-b border-gray-200">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-extrabold text-lg">
                    {{
                      order.user?.name
                        ? order.user.name.charAt(0).toUpperCase()
                        : "C"
                    }}
                  </div>
                  <div class="flex flex-col">
                    <h3 class="text-xl font-bold text-gray-900">#{{ order.id }}</h3>
                    <p class="text-gray-700 font-semibold">
                      {{ order.user?.name || "Customer" }}
                    </p>
                  </div>
                </div>

                <div class="flex gap-2 items-center">
                  <span class="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-full font-bold text-xs">{{
                    order.type === "pickup" ? "Ambil" : "Delivery"
                  }}</span>
                  <span
                    :class="['px-2.5 py-1 rounded-full font-bold text-xs', getPaymentClass(order.payment_status)]"
                    >{{ getPaymentLabel(order.payment_status) }}</span
                  >
                </div>
              </div>

              <div class="flex flex-col items-end gap-2">
                <div class="text-xs text-gray-600">
                  {{ formatDateTime(order.created_at) }}
                </div>
                <span :class="['px-4 py-2 rounded-full text-sm font-semibold', getStatusClass(order.status)]">{{
                  getStatusLabel(order.status)
                }}</span>
              </div>
            </div>

            <!-- Order Items (preview) -->
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <p class="font-semibold text-gray-700 mb-3">Items</p>
              <div class="flex flex-col gap-2">
                <div
                  v-for="item in order.items.slice(0, 2)"
                  :key="item.id"
                  class="flex justify-between items-center py-2 text-sm"
                >
                  <span class="font-extrabold text-indigo-600 min-w-[40px]">{{ item.quantity }}x</span>
                  <span class="flex-1 text-gray-900">{{ item.menu?.name }}</span>
                  <span class="font-bold text-cyan-600">{{
                    formatCurrency(item.subtotal)
                  }}</span>
                </div>
                <div v-if="order.items.length > 2" class="text-gray-600 font-bold pt-1">
                  +{{ order.items.length - 2 }} lainnya
                </div>
              </div>
            </div>

            <!-- Payment Status -->
            <div class="flex justify-between items-center mb-4 p-3 bg-gray-100 rounded-lg">
              <span class="font-semibold text-gray-700">Pembayaran:</span>
              <span
                :class="[
                  'px-3 py-1 rounded-xl text-sm font-semibold',
                  getPaymentClass(order.payment_status),
                ]"
              >
                {{ getPaymentLabel(order.payment_status) }}
              </span>
            </div>

            <!-- Order Footer -->
            <div class="mt-4 pt-4 border-t-2 border-gray-200">
              <div class="flex justify-between items-center mb-4 text-lg font-semibold">
                <span>Total:</span>
                <span class="text-2xl font-extrabold text-cyan-600">{{
                  formatCurrency(order.total_price)
                }}</span>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 flex-wrap">
                <button
                  v-if="order.status === 'created'"
                  class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg text-sm"
                  @click="updateStatus(order.id, 'preparing')"
                >
                  <Check :size="16" />
                  <span>Terima</span>
                </button>

                <button
                  v-if="order.status === 'preparing'"
                  class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg text-sm"
                  @click="updateStatus(order.id, 'ready_for_pickup')"
                >
                  <Check :size="16" />
                  <span>Siap Diambil</span>
                </button>

                <button
                  v-if="['created', 'preparing'].includes(order.status)"
                  class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg text-sm"
                  @click="cancelOrder(order.id)"
                >
                  <X :size="16" />
                  <span>Batalkan</span>
                </button>

                <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-900 border border-gray-200 rounded-lg font-bold cursor-pointer transition-all hover:bg-gray-200 text-sm" @click="showOrderDetail(order)">
                  <Eye :size="16" />
                  <span>Detail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4" @click="closeDetail">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" @click.stop>
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">Detail Pesanan #{{ selectedOrder.id }}</h2>
          <button class="text-2xl text-gray-600 hover:text-gray-900" @click="closeDetail">✕</button>
        </div>

        <div class="p-8">
          <!-- Order Info -->
          <div class="mb-8">
            <h4 class="text-lg font-bold text-gray-900 mb-4">Informasi Pesanan</h4>
            <div class="flex justify-between py-3 border-b border-gray-100">
              <span class="font-semibold text-gray-700">Status:</span>
              <span
                :class="[
                  'px-4 py-1 rounded-full text-sm font-semibold',
                  getStatusClass(selectedOrder.status),
                ]"
              >
                {{ getStatusLabel(selectedOrder.status) }}
              </span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-100">
              <span class="font-semibold text-gray-700">Waktu Pesan:</span>
              <span class="text-gray-900">{{
                formatDateTime(selectedOrder.created_at)
              }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-100">
              <span class="font-semibold text-gray-700">Tipe:</span>
              <span class="text-gray-900">{{
                selectedOrder.type === "pickup" ? "Ambil Sendiri" : "Delivery"
              }}</span>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="mb-8">
            <h4 class="text-lg font-bold text-gray-900 mb-4">Informasi Pelanggan</h4>
            <div class="flex justify-between py-3 border-b border-gray-100">
              <span class="font-semibold text-gray-700">Nama:</span>
              <span class="text-gray-900">{{ selectedOrder.user?.name }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-100">
              <span class="font-semibold text-gray-700">Email:</span>
              <span class="text-gray-900">{{ selectedOrder.user?.email }}</span>
            </div>
          </div>

          <!-- Items -->
          <div class="mb-8">
            <h4 class="text-lg font-bold text-gray-900 mb-4">Daftar Pesanan</h4>
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold border-b-2 border-gray-200">Item</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold border-b-2 border-gray-200">Qty</th>
                  <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold border-b-2 border-gray-200">Harga</th>
                  <th class="text-right py-3 px-4 bg-gray-50 text-gray-700 font-semibold border-b-2 border-gray-200">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder.items" :key="item.id">
                  <td class="py-3 px-4 border-b border-gray-100">{{ item.menu?.name }}</td>
                  <td class="py-3 px-4 border-b border-gray-100">{{ item.quantity }}</td>
                  <td class="py-3 px-4 border-b border-gray-100">{{ formatCurrency(item.unit_price) }}</td>
                  <td class="py-3 px-4 border-b border-gray-100 font-bold text-green-600 text-right">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="py-4 px-4 border-t-2 border-gray-200"><strong class="text-lg">Total</strong></td>
                  <td class="py-4 px-4 border-t-2 border-gray-200 font-extrabold text-green-600 text-lg text-right">
                    {{
                      formatCurrency(selectedOrder.total_price)
                    }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment Info -->
          <div class="mb-0">
            <h4 class="text-lg font-bold text-gray-900 mb-4">Informasi Pembayaran</h4>
            <div class="flex justify-between py-3 border-b border-gray-100">
              <span class="font-semibold text-gray-700">Status Pembayaran:</span>
              <span
                :class="[
                  'px-4 py-1 rounded-full text-sm font-semibold',
                  getPaymentClass(selectedOrder.payment_status),
                ]"
              >
                {{ getPaymentLabel(selectedOrder.payment_status) }}
              </span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-100" v-if="selectedOrder.paid_amount > 0">
              <span class="font-semibold text-gray-700">Jumlah Dibayar:</span>
              <span class="text-gray-900">{{
                formatCurrency(selectedOrder.paid_amount)
              }}</span>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 text-right">
          <button class="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors" @click="closeDetail">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Sidebar from "../../components/dashboard/Sidebar.vue";
import api from "../../config/api";
import { TENANT_MENU_ITEMS } from "../../constants/menuItems";
import { showSuccess, showError, showConfirm } from "../../utils/sweetAlert";
import {
  RefreshCw,
  List,
  Package,
  Loader2,
  Check,
  Eye,
  X,
} from "lucide-vue-next";

const orders = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const activeFilter = ref("all");
const selectedOrder = ref<any>(null);
const isRefreshing = ref(false);

const refreshOrders = async () => {
  isRefreshing.value = true;
  try {
    await fetchOrders();
  } finally {
    isRefreshing.value = false;
  }
};

const filters = computed(() => [
  { value: "all", label: "Semua", icon: List, count: orders.value.length },
  {
    value: "created",
    label: "Baru",
    icon: Package,
    count: orders.value.filter((o) => o.status === "created").length,
  },
  {
    value: "preparing",
    label: "Diproses",
    icon: Loader2,
    count: orders.value.filter((o) => o.status === "preparing").length,
  },
  {
    value: "ready_for_pickup",
    label: "Siap",
    icon: Package,
    count: orders.value.filter((o) => o.status === "ready_for_pickup").length,
  },
  {
    value: "picked_up",
    label: "Diambil",
    icon: Check,
    count: orders.value.filter((o) => o.status === "picked_up").length,
  },
]);

const filteredOrders = computed(() => {
  if (activeFilter.value === "all") return orders.value;
  return orders.value.filter((order) => order.status === activeFilter.value);
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getOrderCardClass = (status: string) => {
  if (status === "created") return "border-pink-300 bg-red-50";
  if (status === "preparing") return "border-yellow-400 bg-yellow-50";
  if (status === "ready_for_pickup") return "border-cyan-500 bg-blue-50";
  return "border-gray-200";
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    created: "bg-red-100 text-red-800",
    preparing: "bg-yellow-100 text-yellow-800",
    ready_for_pickup: "bg-green-100 text-green-800",
    picked_up: "bg-blue-100 text-blue-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-200 text-gray-700",
  };
  return map[status] || "bg-gray-200 text-gray-700";
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    created: "Pesanan Baru",
    preparing: "Sedang Diproses",
    ready_for_pickup: "Siap Diambil",
    picked_up: "Sudah Diambil",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return map[status] || status;
};

const getPaymentClass = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-orange-100 text-orange-800",
    paid: "bg-teal-100 text-teal-900",
    failed: "bg-red-100 text-red-900",
    unpaid: "bg-orange-100 text-orange-800",
  };
  return map[status] || "bg-gray-200 text-gray-700";
};

const getPaymentLabel = (status: string) => {
  const map: Record<string, string> = {
    unpaid: "Belum Bayar",
    pending: "Pending",
    paid: "Sudah Bayar",
    failed: "Gagal",
  };
  return map[status] || status;
};

const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get("/tenant/orders");
    orders.value = response.data.data || response.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Gagal memuat pesanan";
    console.error("Error fetching orders:", err);
  } finally {
    loading.value = false;
  }
};

const setFilter = (filter: string) => {
  activeFilter.value = filter;
};

const updateStatus = async (orderId: number, newStatus: string) => {
  try {
    await api.patch(`/tenant/orders/${orderId}/status`, {
      status: newStatus,
    });
    await fetchOrders();
    await showSuccess("Status pesanan berhasil diupdate");
  } catch (err: any) {
    showError(err.response?.data?.message || "Gagal update status pesanan");
    console.error("Error updating status:", err);
  }
};

const cancelOrder = async (orderId: number) => {
  const result = await showConfirm(
    "Pesanan akan dibatalkan dan tidak dapat dikembalikan.",
    "Yakin ingin membatalkan pesanan ini?",
    "Ya, Batalkan",
    "Tidak"
  );

  if (!result.isConfirmed) return;

  try {
    await api.patch(`/tenant/orders/${orderId}/status`, {
      status: "cancelled",
    });
    await fetchOrders();
    await showSuccess("Pesanan berhasil dibatalkan");
  } catch (err: any) {
    showError(err.response?.data?.message || "Gagal membatalkan pesanan");
  }
};

const showOrderDetail = (order: any) => {
  selectedOrder.value = order;
};

const closeDetail = () => {
  selectedOrder.value = null;
};

onMounted(() => {
  fetchOrders();

  // Auto refresh every 30 seconds
  setInterval(() => {
    fetchOrders();
  }, 30000);
});
</script>