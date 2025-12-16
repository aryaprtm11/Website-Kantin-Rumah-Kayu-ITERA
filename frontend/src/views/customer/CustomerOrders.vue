<template>
  <div class="flex min-h-screen bg-white">
    <Sidebar :menuItems="CUSTOMER_MENU_ITEMS" />
    
    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Pesanan Saya</h1>
          <p class="text-sm text-gray-500">Kelola dan pantau pesanan Anda</p>
        </div>
      </div>

      <div class="min-h-[400px]">
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
        <div v-else-if="orders.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">📦</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Belum Ada Pesanan</h3>
          <p class="text-sm text-gray-500 mb-6">Anda belum melakukan pemesanan</p>
          <button class="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors" @click="goToHome">
            Mulai Pesan
          </button>
        </div>

        <!-- Orders List -->
        <div v-else class="flex flex-col gap-4">
          <div v-for="order in orders" :key="order.id" class="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all hover:border-green-500">
            <!-- Order Header -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center p-5 border-b border-gray-100 gap-3">
              <div class="flex-1">
                <h3 class="text-base font-bold text-gray-900 mb-1">{{ order.tenant?.name || 'Kantin' }}</h3>
                <p class="text-sm text-gray-600 mb-0.5">Order #{{ order.id }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(order.created_at) }}</p>
              </div>
              <div class="flex gap-2 items-start">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border', getStatusColor(order.status)]">
                  {{ formatStatus(order.status) }}
                </span>
                <span :class="['px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border', getPaymentStatusColor(order.payment_status)]">
                  {{ formatPaymentStatus(order.payment_status) }}
                </span>
              </div>
            </div>

            <!-- Order Items -->
            <div class="p-5 border-b border-gray-100">
              <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center py-2 border-b border-dashed border-gray-200 last:border-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900 text-sm">{{ item.menu?.name || 'Menu' }}</span>
                  <span class="text-gray-500 text-xs">x{{ item.quantity }}</span>
                </div>
                <span class="font-semibold text-gray-900 text-sm">{{ formatCurrency(item.subtotal) }}</span>
              </div>
            </div>

            <!-- Order Footer -->
            <div class="flex flex-col lg:flex-row justify-between items-stretch lg:items-center p-5 bg-gray-50 gap-3">
              <div>
                <span class="text-xs text-gray-500">Total</span>
                <p class="text-xl font-bold text-gray-900">{{ formatCurrency(order.total_price) }}</p>
              </div>
              <div class="flex gap-2 flex-wrap">
                <button 
                  v-if="order.payment_status === 'pending' || order.payment_status === 'unpaid'"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  @click="handlePayOrder(order)"
                  :disabled="actionLoading === order.id"
                >
                  {{ actionLoading === order.id ? 'Memproses...' : 'Bayar' }}
                </button>
                <button 
                  v-if="order.status === 'ready_for_pickup'"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  @click="handlePickupOrder(order)"
                  :disabled="actionLoading === order.id"
                >
                  {{ actionLoading === order.id ? 'Memproses...' : 'Sudah Diambil' }}
                </button>
                <button 
                  v-if="order.status === 'picked_up' && !order.completed_by_user"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  @click="handleCompleteOrder(order)"
                  :disabled="actionLoading === order.id"
                >
                  {{ actionLoading === order.id ? 'Memproses...' : 'Selesai' }}
                </button>
                <button 
                  class="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition-colors hover:border-gray-300 whitespace-nowrap"
                  @click="viewOrderDetail(order)"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Order Detail Modal -->
    <div v-if="showDetailModal && selectedOrder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] overflow-y-auto p-4" @click="closeDetailModal">
      <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" @click.stop>
        <div class="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 class="text-lg font-bold text-gray-900">Detail Pesanan #{{ selectedOrder.id }}</h2>
          <button class="text-xl text-gray-600 hover:text-gray-900 px-2 py-1" @click="closeDetailModal">✕</button>
        </div>
        
        <div class="p-5">
          <!-- Tenant Info -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Informasi Kantin</h3>
            <p class="text-sm text-gray-700 mb-1.5"><span class="font-medium">Nama:</span> {{ selectedOrder.tenant?.name }}</p>
            <p class="text-sm text-gray-700"><span class="font-medium">Jam Buka:</span> {{ selectedOrder.tenant?.opens_at }} - {{ selectedOrder.tenant?.closes_at }}</p>
          </div>

          <!-- Order Info -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Status Pesanan</h3>
            <div class="flex gap-2 mb-3">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-medium border', getStatusColor(selectedOrder.status)]">
                {{ formatStatus(selectedOrder.status) }}
              </span>
              <span :class="['px-2.5 py-1 rounded-full text-xs font-medium border', getPaymentStatusColor(selectedOrder.payment_status)]">
                {{ formatPaymentStatus(selectedOrder.payment_status) }}
              </span>
            </div>
            <p class="text-sm text-gray-700 mb-1.5"><span class="font-medium">Tipe:</span> {{ selectedOrder.type }}</p>
            <p class="text-sm text-gray-700 mb-1.5"><span class="font-medium">Tanggal:</span> {{ formatDate(selectedOrder.created_at) }}</p>
            <p class="text-sm text-gray-700 mb-1.5" v-if="selectedOrder.picked_up_at">
              <span class="font-medium">Diambil:</span> {{ formatDate(selectedOrder.picked_up_at) }}
            </p>
            <p class="text-sm text-gray-700" v-if="selectedOrder.completed_at">
              <span class="font-medium">Selesai:</span> {{ formatDate(selectedOrder.completed_at) }}
            </p>
          </div>

          <!-- Items -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Item Pesanan</h3>
            <div class="space-y-2">
              <div v-for="item in selectedOrder.items" :key="item.id" class="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="font-medium text-gray-900 text-sm mb-0.5">{{ item.menu?.name }}</p>
                  <p class="text-xs text-gray-600">
                    {{ item.quantity }} x {{ formatCurrency(item.unit_price) }}
                  </p>
                </div>
                <p class="font-semibold text-gray-900 text-sm">{{ formatCurrency(item.subtotal) }}</p>
              </div>
            </div>
          </div>

          <!-- Payment -->
          <div class="mb-0">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Pembayaran</h3>
            <div class="flex justify-between items-center py-2 text-sm text-gray-700">
              <span>Total Harga:</span>
              <span class="font-bold text-gray-900 text-base">{{ formatCurrency(selectedOrder.total_price) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2 font-semibold text-sm" v-if="selectedOrder.payment_status === 'paid'">
              <span>Dibayar:</span>
              <span class="text-green-600 text-base">{{ formatCurrency(selectedOrder.paid_amount) }}</span>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
          <button class="px-5 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm" @click="closeDetailModal">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../../components/dashboard/Sidebar.vue';
import { OrderService, type Order } from '../../services/orderService';
import { CUSTOMER_MENU_ITEMS } from '../../constants/menuItems';
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert';

const router = useRouter();

const orders = ref<Order[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const actionLoading = ref<number | null>(null);
const showDetailModal = ref(false);
const selectedOrder = ref<Order | null>(null);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string) => {
  return OrderService.getStatusColor(status);
};

const getPaymentStatusColor = (paymentStatus: string) => {
  return OrderService.getPaymentStatusColor(paymentStatus);
};

const formatStatus = (status: string) => {
  return OrderService.formatStatus(status);
};

const formatPaymentStatus = (paymentStatus: string) => {
  return OrderService.formatPaymentStatus(paymentStatus);
};

const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    orders.value = await OrderService.getUserOrders();
  } catch (err: any) {
    error.value = err.message || 'Gagal memuat pesanan';
    console.error('Error fetching orders:', err);
  } finally {
    loading.value = false;
  }
};

const handlePayOrder = async (order: Order) => {
  const result = await showConfirm(
    'Pastikan Anda sudah melakukan pembayaran di kantin.',
    'Konfirmasi pembayaran?',
    'Ya, Sudah Bayar',
    'Batal'
  );
  
  if (!result.isConfirmed) return;
  
  actionLoading.value = order.id;
  try {
    await OrderService.payOrder(order.id);
    await fetchOrders();
    await showSuccess('Pembayaran berhasil!');
  } catch (err: any) {
    showError(err.message || 'Gagal melakukan pembayaran');
  } finally {
    actionLoading.value = null;
  }
};

const handlePickupOrder = async (order: Order) => {
  const result = await showConfirm(
    'Pastikan Anda sudah mengambil pesanan.',
    'Konfirmasi pesanan sudah diambil?',
    'Ya, Sudah Diambil',
    'Batal'
  );
  
  if (!result.isConfirmed) return;
  
  actionLoading.value = order.id;
  try {
    await OrderService.pickupOrder(order.id);
    await fetchOrders();
    await showSuccess('Pesanan berhasil ditandai sudah diambil!');
  } catch (err: any) {
    showError(err.message || 'Gagal memproses');
  } finally {
    actionLoading.value = null;
  }
};

const handleCompleteOrder = async (order: Order) => {
  const result = await showConfirm(
    'Pesanan akan ditandai sebagai selesai.',
    'Tandai pesanan sebagai selesai?',
    'Ya, Selesai',
    'Batal'
  );
  
  if (!result.isConfirmed) return;
  
  actionLoading.value = order.id;
  try {
    await OrderService.completeOrder(order.id);
    await fetchOrders();
    await showSuccess('Pesanan selesai! Terima kasih.');
  } catch (err: any) {
    showError(err.message || 'Gagal memproses');
  } finally {
    actionLoading.value = null;
  }
};

const viewOrderDetail = (order: Order) => {
  selectedOrder.value = order;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedOrder.value = null;
};

const goToHome = () => {
  router.push('/');
};

onMounted(() => {
  fetchOrders();
});
</script>



