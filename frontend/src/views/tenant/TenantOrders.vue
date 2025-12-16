<template>
  <div class="flex min-h-screen bg-white">
    <Sidebar :menuItems="TENANT_MENU_ITEMS" />

    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Kelola Pesanan</h1>
            <p class="text-sm text-gray-500">Kelola dan proses pesanan dari pelanggan</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <!-- View Toggle -->
            <div class="inline-flex bg-gray-50 rounded-lg p-0.5 border border-gray-200">
              <button
                @click="viewMode = 'card'"
                :class="['px-3 py-2 rounded-md font-medium text-sm transition-all', viewMode === 'card' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900']"
              >
                <LayoutGrid :size="16" class="inline" />
              </button>
              <button
                @click="viewMode = 'table'"
                :class="['px-3 py-2 rounded-md font-medium text-sm transition-all', viewMode === 'table' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900']"
              >
                <LayoutList :size="16" class="inline" />
              </button>
            </div>

            <!-- Refresh Button -->
            <button
              class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium cursor-pointer transition-all hover:border-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isRefreshing"
              @click="refreshOrders"
              aria-label="Segarkan pesanan"
            >
              <RefreshCw
                :size="16"
                :class="{ 'animate-spin': isRefreshing }"
              />
              <span class="hidden sm:inline text-sm">{{ isRefreshing ? "Memuat..." : "Refresh" }}</span>
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <List :size="18" class="text-green-600" />
              </div>
              <span class="text-2xl font-bold text-gray-900">{{ orders.length }}</span>
            </div>
            <p class="text-xs font-medium text-gray-600">Total Pesanan</p>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <AlertCircle :size="18" class="text-green-600" />
              </div>
              <span class="text-2xl font-bold text-gray-900">{{ orders.filter(o => o.status === 'created').length }}</span>
            </div>
            <p class="text-xs font-medium text-gray-600">Pesanan Baru</p>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Loader2 :size="18" class="text-green-600" />
              </div>
              <span class="text-2xl font-bold text-gray-900">{{ orders.filter(o => o.status === 'preparing').length }}</span>
            </div>
            <p class="text-xs font-medium text-gray-600">Diproses</p>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle :size="18" class="text-green-600" />
              </div>
              <span class="text-2xl font-bold text-gray-900">{{ orders.filter(o => o.status === 'ready_for_pickup').length }}</span>
            </div>
            <p class="text-xs font-medium text-gray-600">Siap Diambil</p>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-lg p-1 border border-gray-200 mb-6">
        <div class="flex gap-1 overflow-x-auto">
          <button
            v-for="filter in filters"
            :key="filter.value"
            :class="['inline-flex items-center gap-2 px-4 py-2.5 rounded-md font-medium cursor-pointer transition-all whitespace-nowrap text-sm', activeFilter === filter.value ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-50']"
            @click="setFilter(filter.value)"
          >
            <component
              v-if="filter.icon"
              :is="filter.icon"
              :size="16"
            />
            <span>{{ filter.label }}</span>
            <span v-if="filter.count > 0" :class="['inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold', activeFilter === filter.value ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700']">
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-6">

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <div class="w-10 h-10 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-sm text-gray-600">Memuat pesanan...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-16">
          <p class="text-sm text-red-600 mb-4">{{ error }}</p>
          <button class="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors" @click="fetchOrders">Coba Lagi</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package :size="32" class="text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Belum Ada Pesanan</h3>
          <p class="text-sm text-gray-500" v-if="activeFilter === 'all'">Belum ada pesanan masuk</p>
          <p class="text-sm text-gray-500" v-else>Tidak ada pesanan dengan status ini</p>
        </div>

        <!-- Card View -->
        <div v-else-if="viewMode === 'card'" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="bg-white rounded-lg p-5 border border-gray-200 transition-all hover:border-green-500 hover:shadow-sm"
          >
            <!-- Order Header -->
            <div class="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  {{
                    order.user?.name
                      ? order.user.name.charAt(0).toUpperCase()
                      : "C"
                  }}
                </div>
                <div>
                  <h3 class="text-base font-bold text-gray-900">#{{ order.id }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ order.user?.name || "Customer" }}
                  </p>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1.5">
                <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(order.status)]">{{
                  getStatusLabel(order.status)
                }}</span>
                <div class="text-xs text-gray-500">
                  {{ formatDateTime(order.created_at) }}
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="mb-4">
              <p class="text-xs font-medium text-gray-500 mb-2">Items</p>
              <div class="space-y-1.5">
                <div
                  v-for="item in order.items.slice(0, 2)"
                  :key="item.id"
                  class="flex justify-between items-center text-sm"
                >
                  <span class="font-semibold text-green-600 min-w-[30px]">{{ item.quantity }}x</span>
                  <span class="flex-1 text-gray-900">{{ item.menu?.name }}</span>
                  <span class="font-medium text-gray-900">{{
                    formatCurrency(item.subtotal)
                  }}</span>
                </div>
                <div v-if="order.items.length > 2" class="text-xs text-gray-500 pt-1">
                  +{{ order.items.length - 2 }} item lainnya
                </div>
              </div>
            </div>

            <!-- Total & Payment -->
            <div class="flex justify-between items-center mb-4 pt-3 border-t border-gray-100">
              <div>
                <p class="text-xs text-gray-500">Total</p>
                <p class="text-xl font-bold text-gray-900">{{
                  formatCurrency(order.total_price)
                }}</p>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getPaymentClass(order.payment_status),
                ]"
              >
                {{ getPaymentLabel(order.payment_status) }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                v-if="order.status === 'created'"
                class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg font-medium cursor-pointer transition-all hover:bg-green-700 text-sm"
                @click="updateStatus(order.id, 'preparing')"
              >
                <Check :size="14" />
                <span>Terima</span>
              </button>

              <button
                v-if="order.status === 'preparing'"
                class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg font-medium cursor-pointer transition-all hover:bg-green-700 text-sm"
                @click="updateStatus(order.id, 'ready_for_pickup')"
              >
                <Check :size="14" />
                <span>Siap</span>
              </button>

              <button
                @click="showOrderDetail(order)"
                class="px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium cursor-pointer transition-all hover:border-gray-300 text-sm"
              >
                <Eye :size="14" class="inline" />
              </button>

              <button
                v-if="['created', 'preparing'].includes(order.status)"
                @click="cancelOrder(order.id)"
                class="px-3 py-2 bg-white text-red-600 border border-gray-200 rounded-lg font-medium cursor-pointer transition-all hover:border-red-300 text-sm"
              >
                <X :size="14" class="inline" />
              </button>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Pelanggan</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Items</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Total</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Pembayaran</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Waktu</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="font-semibold text-sm text-gray-900">#{{ order.id }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-xs">
                        {{ order.user?.name ? order.user.name.charAt(0).toUpperCase() : "C" }}
                      </div>
                      <div>
                        <div class="font-medium text-sm text-gray-900">{{ order.user?.name || "Customer" }}</div>
                        <div class="text-xs text-gray-500">{{ order.type === "pickup" ? "Ambil" : "Delivery" }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm">
                      <div class="font-medium text-gray-900">{{ order.items.length }} item</div>
                      <div class="text-xs text-gray-500 truncate max-w-[120px]">
                        {{ order.items.map(i => i.menu?.name).join(', ') }}
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-900">
                      {{ formatCurrency(order.total_price) }}
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', getStatusClass(order.status)]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', getPaymentClass(order.payment_status)]">
                      {{ getPaymentLabel(order.payment_status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {{ formatDateTime(order.created_at) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        v-if="order.status === 'created'"
                        @click="updateStatus(order.id, 'preparing')"
                        class="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                        title="Terima"
                      >
                        <Check :size="14" />
                      </button>
                      <button
                        v-if="order.status === 'preparing'"
                        @click="updateStatus(order.id, 'ready_for_pickup')"
                        class="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                        title="Siap"
                      >
                        <CheckCircle :size="14" />
                      </button>
                      <button
                        @click="showOrderDetail(order)"
                        class="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                        title="Detail"
                      >
                        <Eye :size="14" />
                      </button>
                      <button
                        v-if="['created', 'preparing'].includes(order.status)"
                        @click="cancelOrder(order.id)"
                        class="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        title="Batal"
                      >
                        <X :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
  LayoutGrid,
  LayoutList,
  AlertCircle,
  CheckCircle,
} from "lucide-vue-next";

const orders = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const activeFilter = ref("all");
const selectedOrder = ref<any>(null);
const isRefreshing = ref(false);
const viewMode = ref<'card' | 'table'>('card');

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

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    created: "bg-green-50 text-green-700 border border-green-200",
    preparing: "bg-green-100 text-green-800 border border-green-300",
    ready_for_pickup: "bg-green-600 text-white",
    picked_up: "bg-gray-100 text-gray-700 border border-gray-200",
    completed: "bg-gray-100 text-gray-700 border border-gray-200",
    cancelled: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    created: "Baru",
    preparing: "Diproses",
    ready_for_pickup: "Siap",
    picked_up: "Diambil",
    completed: "Selesai",
    cancelled: "Batal",
  };
  return map[status] || status;
};

const getPaymentClass = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700 border border-gray-200",
    paid: "bg-green-50 text-green-700 border border-green-200",
    failed: "bg-red-50 text-red-700 border border-red-200",
    unpaid: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

const getPaymentLabel = (status: string) => {
  const map: Record<string, string> = {
    unpaid: "Belum Bayar",
    pending: "Pending",
    paid: "Lunas",
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