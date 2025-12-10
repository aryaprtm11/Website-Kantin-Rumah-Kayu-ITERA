<template>
  <div class="dashboard-layout">
    <Sidebar :menuItems="CUSTOMER_MENU_ITEMS" />
    
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Pesanan Saya</h1>
          <p class="dashboard-subtitle">Kelola dan pantau pesanan Anda</p>
        </div>
      </div>

      <div class="dashboard-content">
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
        <div v-else-if="orders.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Belum Ada Pesanan</h3>
          <p>Anda belum melakukan pemesanan</p>
          <button class="btn-primary" @click="goToHome">
            🏠 Mulai Pesan
          </button>
        </div>

        <!-- Orders List -->
        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card">
            <!-- Order Header -->
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-tenant">{{ order.tenant?.name || 'Kantin' }}</h3>
                <p class="order-id">Order #{{ order.id }}</p>
                <p class="order-date">{{ formatDate(order.created_at) }}</p>
              </div>
              <div class="order-badges">
                <span :class="['status-badge', getStatusColor(order.status)]">
                  {{ formatStatus(order.status) }}
                </span>
                <span :class="['payment-badge', getPaymentStatusColor(order.payment_status)]">
                  {{ formatPaymentStatus(order.payment_status) }}
                </span>
              </div>
            </div>

            <!-- Order Items -->
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <div class="item-info">
                  <span class="item-name">{{ item.menu?.name || 'Menu' }}</span>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                </div>
                <span class="item-price">{{ formatCurrency(item.subtotal) }}</span>
              </div>
            </div>

            <!-- Order Footer -->
            <div class="order-footer">
              <div class="order-total">
                <span class="total-label">Total:</span>
                <span class="total-amount">{{ formatCurrency(order.total_price) }}</span>
              </div>
              <div class="order-actions">
                <button 
                  v-if="order.payment_status === 'pending' || order.payment_status === 'unpaid'"
                  class="btn-action btn-pay"
                  @click="handlePayOrder(order)"
                  :disabled="actionLoading === order.id"
                >
                  💳 {{ actionLoading === order.id ? 'Memproses...' : 'Bayar' }}
                </button>
                <button 
                  v-if="order.status === 'ready_for_pickup'"
                  class="btn-action btn-pickup"
                  @click="handlePickupOrder(order)"
                  :disabled="actionLoading === order.id"
                >
                  📦 {{ actionLoading === order.id ? 'Memproses...' : 'Sudah Diambil' }}
                </button>
                <button 
                  v-if="order.status === 'picked_up' && !order.completed_by_user"
                  class="btn-action btn-complete"
                  @click="handleCompleteOrder(order)"
                  :disabled="actionLoading === order.id"
                >
                  ✅ {{ actionLoading === order.id ? 'Memproses...' : 'Selesai' }}
                </button>
                <button 
                  class="btn-action btn-detail"
                  @click="viewOrderDetail(order)"
                >
                  👁️ Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Order Detail Modal -->
    <div v-if="showDetailModal && selectedOrder" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detail Pesanan #{{ selectedOrder.id }}</h2>
          <button class="btn-close" @click="closeDetailModal">✕</button>
        </div>
        
        <div class="modal-body">
          <!-- Tenant Info -->
          <div class="detail-section">
            <h3 class="section-title">Informasi Kantin</h3>
            <p class="section-text"><strong>Nama:</strong> {{ selectedOrder.tenant?.name }}</p>
            <p class="section-text"><strong>Jam Buka:</strong> {{ selectedOrder.tenant?.opens_at }} - {{ selectedOrder.tenant?.closes_at }}</p>
          </div>

          <!-- Order Info -->
          <div class="detail-section">
            <h3 class="section-title">Status Pesanan</h3>
            <div class="status-row">
              <span :class="['status-badge', getStatusColor(selectedOrder.status)]">
                {{ formatStatus(selectedOrder.status) }}
              </span>
              <span :class="['payment-badge', getPaymentStatusColor(selectedOrder.payment_status)]">
                {{ formatPaymentStatus(selectedOrder.payment_status) }}
              </span>
            </div>
            <p class="section-text"><strong>Tipe:</strong> {{ selectedOrder.type }}</p>
            <p class="section-text"><strong>Tanggal:</strong> {{ formatDate(selectedOrder.created_at) }}</p>
            <p class="section-text" v-if="selectedOrder.picked_up_at">
              <strong>Diambil:</strong> {{ formatDate(selectedOrder.picked_up_at) }}
            </p>
            <p class="section-text" v-if="selectedOrder.completed_at">
              <strong>Selesai:</strong> {{ formatDate(selectedOrder.completed_at) }}
            </p>
          </div>

          <!-- Items -->
          <div class="detail-section">
            <h3 class="section-title">Item Pesanan</h3>
            <div class="detail-items">
              <div v-for="item in selectedOrder.items" :key="item.id" class="detail-item">
                <div class="detail-item-info">
                  <p class="detail-item-name">{{ item.menu?.name }}</p>
                  <p class="detail-item-meta">
                    {{ item.quantity }} x {{ formatCurrency(item.unit_price) }}
                  </p>
                </div>
                <p class="detail-item-price">{{ formatCurrency(item.subtotal) }}</p>
              </div>
            </div>
          </div>

          <!-- Payment -->
          <div class="detail-section">
            <h3 class="section-title">Pembayaran</h3>
            <div class="payment-row">
              <span>Total Harga:</span>
              <span class="price-value">{{ formatCurrency(selectedOrder.total_price) }}</span>
            </div>
            <div class="payment-row" v-if="selectedOrder.payment_status === 'paid'">
              <span>Dibayar:</span>
              <span class="price-value paid">{{ formatCurrency(selectedOrder.paid_amount) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailModal">Tutup</button>
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
import { CUSTOMER_MENU_ITEMS } from '../../constants/menuItems'; // TAMBAHKAN INI

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
  if (!confirm('Konfirmasi pembayaran untuk pesanan ini?')) return;
  
  actionLoading.value = order.id;
  try {
    await OrderService.payOrder(order.id);
    await fetchOrders();
    alert('✅ Pembayaran berhasil!');
  } catch (err: any) {
    alert(`❌ ${err.message || 'Gagal melakukan pembayaran'}`);
  } finally {
    actionLoading.value = null;
  }
};

const handlePickupOrder = async (order: Order) => {
  if (!confirm('Konfirmasi pesanan sudah diambil?')) return;
  
  actionLoading.value = order.id;
  try {
    await OrderService.pickupOrder(order.id);
    await fetchOrders();
    alert('✅ Pesanan berhasil ditandai sudah diambil!');
  } catch (err: any) {
    alert(`❌ ${err.message || 'Gagal memproses'}`);
  } finally {
    actionLoading.value = null;
  }
};

const handleCompleteOrder = async (order: Order) => {
  if (!confirm('Tandai pesanan sebagai selesai?')) return;
  
  actionLoading.value = order.id;
  try {
    await OrderService.completeOrder(order.id);
    await fetchOrders();
    alert('✅ Pesanan selesai! Terima kasih.');
  } catch (err: any) {
    alert(`❌ ${err.message || 'Gagal memproses'}`);
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

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.dashboard-content {
  min-height: 400px;
}

.loading,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  margin-bottom: 2rem;
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.order-info {
  flex: 1;
}

.order-tenant {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.order-id {
  font-size: 0.9rem;
  color: #718096;
  margin: 0.25rem 0;
}

.order-date {
  font-size: 0.85rem;
  color: #a0aec0;
  margin: 0.25rem 0 0 0;
}

.order-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.status-badge,
.payment-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Status Colors */
.status-created { background: #feebc8; color: #c05621; }
.status-preparing { background: #bee3f8; color: #2c5282; }
.status-ready { background: #c6f6d5; color: #22543d; }
.status-picked { background: #d6bcfa; color: #553c9a; }
.status-completed { background: #9ae6b4; color: #22543d; }
.status-cancelled { background: #fed7d7; color: #742a2a; }

.payment-unpaid { background: #fed7d7; color: #742a2a; }
.payment-pending { background: #feebc8; color: #c05621; }
.payment-paid { background: #9ae6b4; color: #22543d; }
.payment-failed { background: #fc8181; color: #742a2a; }
.payment-expired { background: #e2e8f0; color: #4a5568; }

.order-items {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.order-item:not(:last-child) {
  border-bottom: 1px dashed #e2e8f0;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-name {
  font-weight: 600;
  color: #2d3748;
}

.item-quantity {
  color: #718096;
  font-size: 0.9rem;
}

.item-price {
  font-weight: 700;
  color: #48bb78;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f7fafc;
}

.order-total {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2d3748;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action:not(:disabled):hover {
  transform: translateY(-2px);
}

.btn-pay {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.btn-pickup {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-complete {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
}

.btn-detail {
  background: #e2e8f0;
  color: #2d3748;
}

/* Modal Styles */
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
  overflow-y: auto;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
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
  padding: 0.25rem 0.5rem;
}

.btn-close:hover {
  color: #2d3748;
}

.modal-body {
  padding: 2rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.section-text {
  color: #4a5568;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.status-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.detail-item-info {
  flex: 1;
}

.detail-item-name {
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.detail-item-meta {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.detail-item-price {
  font-weight: 700;
  color: #48bb78;
  font-size: 1.1rem;
  margin: 0;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-size: 1rem;
  color: #4a5568;
}

.payment-row:last-child {
  border-top: 2px solid #e2e8f0;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 700;
}

.price-value {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.2rem;
}

.price-value.paid {
  color: #48bb78;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: white;
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
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: 1rem;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-badges {
    align-items: flex-start;
  }

  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .order-actions {
    justify-content: stretch;
  }

  .btn-action {
    flex: 1;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-body {
    padding: 1.5rem;
  }
}
</style>

