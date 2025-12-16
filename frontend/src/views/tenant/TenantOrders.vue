<template>
  <div class="dashboard-layout">
    <Sidebar :menuItems="TENANT_MENU_ITEMS" />

    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Kelola Pesanan</h1>
          <p class="dashboard-subtitle">Atur pesanan masuk dari pelanggan</p>
        </div>
        <div class="header-actions">
          <button
            class="btn-refresh"
            :disabled="isRefreshing"
            @click="refreshOrders"
            aria-label="Segarkan pesanan"
            :aria-busy="isRefreshing"
            :title="isRefreshing ? 'Memuat...' : 'Segarkan pesanan'"
          >
            <RefreshCw
              :size="16"
              class="refresh-icon"
              :class="{ spin: isRefreshing }"
            />
            <span class="btn-label">{{
              isRefreshing ? "Memuat..." : "Refresh"
            }}</span>
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.value"
            :class="['tab', { active: activeFilter === filter.value }]"
            @click="setFilter(filter.value)"
            :title="filter.label"
          >
            <component
              v-if="filter.icon"
              :is="filter.icon"
              :size="16"
              class="tab-icon"
            />
            <span class="tab-label">{{ filter.label }}</span>
            <span v-if="filter.count > 0" class="count-badge">{{
              filter.count
            }}</span>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Memuat pesanan...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>❌ {{ error }}</p>
          <button class="btn-retry" @click="fetchOrders">Coba Lagi</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredOrders.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Belum Ada Pesanan</h3>
          <p v-if="activeFilter === 'all'">Belum ada pesanan masuk</p>
          <p v-else>Tidak ada pesanan dengan status ini</p>
        </div>

        <!-- Orders Grid -->
        <div v-else class="orders-grid">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
            :class="getOrderCardClass(order.status)"
          >
            <!-- Order Header (enhanced) -->
            <div class="order-header enhanced">
              <div class="order-left">
                <div class="order-id-avatar">
                  <div class="avatar">
                    {{
                      order.user?.name
                        ? order.user.name.charAt(0).toUpperCase()
                        : "C"
                    }}
                  </div>
                  <div class="order-meta-wrap">
                    <h3 class="order-id">#{{ order.id }}</h3>
                    <p class="order-customer-name">
                      {{ order.user?.name || "Customer" }}
                    </p>
                  </div>
                </div>

                <div class="order-meta">
                  <span class="order-type-badge">{{
                    order.type === "pickup" ? "Ambil" : "Delivery"
                  }}</span>
                  <span
                    class="payment-badge-small"
                    :class="getPaymentClass(order.payment_status)"
                    >{{ getPaymentLabel(order.payment_status) }}</span
                  >
                </div>
              </div>

              <div class="order-right">
                <div class="order-time small">
                  {{ formatDateTime(order.created_at) }}
                </div>
                <span :class="['status-badge', getStatusClass(order.status)]">{{
                  getStatusLabel(order.status)
                }}</span>
              </div>
            </div>

            <!-- Order Items (preview) -->
            <div class="order-items">
              <p class="items-title">Items</p>
              <div class="item-preview">
                <div
                  v-for="item in order.items.slice(0, 2)"
                  :key="item.id"
                  class="order-item"
                >
                  <span class="item-qty">{{ item.quantity }}x</span>
                  <span class="item-name">{{ item.menu?.name }}</span>
                  <span class="item-price">{{
                    formatCurrency(item.subtotal)
                  }}</span>
                </div>
                <div v-if="order.items.length > 2" class="more-items">
                  +{{ order.items.length - 2 }} lainnya
                </div>
              </div>
            </div>

            <!-- Payment Status -->
            <div class="payment-info">
              <span class="payment-label">Pembayaran:</span>
              <span
                :class="[
                  'payment-badge',
                  getPaymentClass(order.payment_status),
                ]"
              >
                {{ getPaymentLabel(order.payment_status) }}
              </span>
            </div>

            <!-- Order Footer -->
            <div class="order-footer">
              <div class="order-total">
                <span>Total:</span>
                <span class="total-amount">{{
                  formatCurrency(order.total_price)
                }}</span>
              </div>

              <!-- Action Buttons -->
              <div class="order-actions">
                <button
                  v-if="order.status === 'created'"
                  class="btn-action btn-accept"
                  @click="updateStatus(order.id, 'preparing')"
                >
                  <Check :size="16" class="action-icon" />
                  <span>Terima</span>
                </button>

                <button
                  v-if="order.status === 'preparing'"
                  class="btn-action btn-ready"
                  @click="updateStatus(order.id, 'ready_for_pickup')"
                >
                  <Check :size="16" class="action-icon" />
                  <span>Siap Diambil</span>
                </button>

                <button
                  v-if="['created', 'preparing'].includes(order.status)"
                  class="btn-action btn-cancel"
                  @click="cancelOrder(order.id)"
                >
                  <X :size="16" class="action-icon" />
                  <span>Batalkan</span>
                </button>

                <button class="btn-detail" @click="showOrderDetail(order)">
                  <Eye :size="16" class="action-icon" />
                  <span>Detail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detail Pesanan #{{ selectedOrder.id }}</h2>
          <button class="btn-close" @click="closeDetail">✕</button>
        </div>

        <div class="modal-body">
          <!-- Order Info -->
          <div class="detail-section">
            <h4>Informasi Pesanan</h4>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span
                :class="[
                  'value',
                  'status-badge',
                  getStatusClass(selectedOrder.status),
                ]"
              >
                {{ getStatusLabel(selectedOrder.status) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Waktu Pesan:</span>
              <span class="value">{{
                formatDateTime(selectedOrder.created_at)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Tipe:</span>
              <span class="value">{{
                selectedOrder.type === "pickup" ? "Ambil Sendiri" : "Delivery"
              }}</span>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="detail-section">
            <h4>Informasi Pelanggan</h4>
            <div class="detail-row">
              <span class="label">Nama:</span>
              <span class="value">{{ selectedOrder.user?.name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">{{ selectedOrder.user?.email }}</span>
            </div>
          </div>

          <!-- Items -->
          <div class="detail-section">
            <h4>Daftar Pesanan</h4>
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Harga</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder.items" :key="item.id">
                  <td>{{ item.menu?.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.unit_price) }}</td>
                  <td class="amount">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3"><strong>Total</strong></td>
                  <td class="amount">
                    <strong>{{
                      formatCurrency(selectedOrder.total_price)
                    }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment Info -->
          <div class="detail-section">
            <h4>Informasi Pembayaran</h4>
            <div class="detail-row">
              <span class="label">Status Pembayaran:</span>
              <span
                :class="[
                  'value',
                  'payment-badge',
                  getPaymentClass(selectedOrder.payment_status),
                ]"
              >
                {{ getPaymentLabel(selectedOrder.payment_status) }}
              </span>
            </div>
            <div class="detail-row" v-if="selectedOrder.paid_amount > 0">
              <span class="label">Jumlah Dibayar:</span>
              <span class="value">{{
                formatCurrency(selectedOrder.paid_amount)
              }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetail">Tutup</button>
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
  if (status === "created") return "urgent";
  if (status === "preparing") return "processing";
  if (status === "ready_for_pickup") return "ready";
  return "";
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    created: "status-new",
    preparing: "status-processing",
    ready_for_pickup: "status-ready",
    picked_up: "status-completed",
    completed: "status-completed",
    cancelled: "status-cancelled",
  };
  return map[status] || "status-default";
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
    pending: "payment-pending",
    paid: "payment-paid",
    failed: "payment-failed",
  };
  return map[status] || "payment-default";
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

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.08);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.12);
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
  overflow-x: auto;
  padding: 0.6rem 0;
  align-items: center;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  font-weight: 800;
  color: #0b1220;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  white-space: nowrap;
  min-width: 90px;
  justify-content: center;
  margin-right: 0.5rem; /* extra fallback spacing */
}

.tab:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(6, 182, 212, 0.08);
}

.tab.active {
  background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 16px 44px rgba(99, 102, 241, 0.14);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  padding: 0.18rem 0.55rem;
  margin-right: 0.5rem; /* ensure space between badge and next element */
  background: rgba(15, 23, 42, 0.04);
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
}

.tab.active .count-badge {
  background: rgba(255, 255, 255, 0.18);
}

/* Loading, Error, Empty States */
.loading,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e6eefc;
  border-top-color: #06b6d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 1rem 0;
}

.empty-state p {
  color: #718096;
}

.btn-retry {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Orders Grid */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border-left: 4px solid #e2e8f0;
}

.order-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.order-card.urgent {
  border-left-color: #fda4af;
  background: #fff7f7;
}

.order-card.processing {
  border-left-color: #fbbf24;
  background: #fffbeb;
}

.order-card.ready {
  border-left-color: #06b6d4;
  background: #f0f9ff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.order-header.enhanced {
  align-items: center;
  gap: 1rem;
}

.order-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-id-avatar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.05rem;
}

.order-meta-wrap {
  display: flex;
  flex-direction: column;
}

.order-customer-name {
  margin: 0;
  color: #4a5568;
  font-weight: 600;
}

.order-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.order-type-badge {
  padding: 0.25rem 0.6rem;
  background: #e6eefc;
  color: #2b4bd6;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
}

.payment-badge-small {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
}

.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.order-time.small {
  font-size: 0.8rem;
  color: #718096;
}

.order-id {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.order-time {
  font-size: 0.85rem;
  color: #718096;
  margin: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-new {
  background: #fed7d7;
  color: #742a2a;
}

.status-processing {
  background: #feebc8;
  color: #7c2d12;
}

.status-ready {
  background: #c6f6d5;
  color: #22543d;
}

.status-completed {
  background: #bee3f8;
  color: #2c5282;
}

.status-cancelled {
  background: #e2e8f0;
  color: #4a5568;
}

.order-customer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.customer-icon {
  font-size: 2rem;
}

.customer-name {
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.order-type {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.order-items {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.item-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.more-items {
  color: #718096;
  font-weight: 700;
  padding-top: 0.25rem;
}

.items-title {
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.75rem 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.item-qty {
  font-weight: 800;
  color: #6366f1;
  min-width: 40px;
}

.item-name {
  flex: 1;
  color: #2d3748;
}

.item-price {
  font-weight: 700;
  color: #0ea5a4;
}

.payment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #edf2f7;
  border-radius: 6px;
}

.payment-label {
  font-weight: 600;
  color: #4a5568;
}

.payment-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.payment-pending {
  background: #fff7ed;
  color: #92400e;
}

.payment-paid {
  background: #ddf8f4;
  color: #03543f;
}

.payment-failed {
  background: #fff1f2;
  color: #881337;
}

.order-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.total-amount {
  font-size: 1.3rem;
  font-weight: 900;
  color: #0ea5a4;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  font-size: 0.9rem;
}

.btn-accept {
  background: linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%);
  color: white;
}

.btn-accept:hover {
  background: #38a169;
}

.btn-ready {
  background: linear-gradient(90deg, #6366f1 0%, #7c3aed 100%);
  color: white;
}

.btn-ready:hover {
  background: #16a34a;
}

.btn-cancel {
  background: linear-gradient(90deg, #fb7185 0%, #ef4444 100%);
  color: white;
}

.btn-cancel:hover {
  background: #f56565;
}

.btn-detail {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem;
  background: #f8fafc;
  color: #0f172a;
  border: 1px solid #e6eefc;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-detail:hover {
  background: #eef2ff;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.modal-body {
  padding: 2rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f7fafc;
}

.detail-row .label {
  font-weight: 600;
  color: #4a5568;
}

.detail-row .value {
  color: #2d3748;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table th {
  text-align: left;
  padding: 0.75rem;
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.detail-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f7fafc;
}

.detail-table .amount {
  font-weight: 700;
  color: #48bb78;
  text-align: right;
}

.detail-table tfoot td {
  padding-top: 1rem;
  font-size: 1.1rem;
  border-top: 2px solid #e2e8f0;
  border-bottom: none;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  text-align: right;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #e2e8f0;
  color: #2d3748;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: 100px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 90px;
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .order-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>
