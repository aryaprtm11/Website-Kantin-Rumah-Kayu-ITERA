<template>
  <Dialog 
    v-model:visible="isVisible" 
    modal 
    :style="{ width: '500px' }"
    :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
    position="center"
    class="cart-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <ShoppingCart :size="24" class="header-icon" />
        <div>
          <h3>Keranjang Belanja</h3>
          <p class="header-subtitle">{{ itemCount }} item</p>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-if="cartItems.length === 0" class="empty-cart">
      <ShoppingCart :size="80" class="empty-icon" />
      <h4>Keranjang Kosong</h4>
      <p>Tambahkan menu untuk melanjutkan</p>
    </div>

    <!-- Cart Items -->
    <div v-else class="cart-content">
      <div class="cart-items">
        <Card v-for="item in cartItems" :key="item.menuId" class="cart-item">
          <template #content>
            <div class="item-layout">
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-price">{{ formatCurrency(item.price) }}</p>
                <p class="item-tenant">{{ item.tenantName }}</p>
              </div>

              <div class="item-actions">
                <div class="quantity-controls">
                  <Button 
                    icon="pi pi-minus" 
                    @click="decreaseQuantity(item.menuId)"
                    text
                    rounded
                    size="small"
                  />
                  <span class="quantity">{{ item.quantity }}</span>
                  <Button 
                    icon="pi pi-plus" 
                    @click="increaseQuantity(item.menuId)"
                    :disabled="item.quantity >= item.stock"
                    text
                    rounded
                    size="small"
                  />
                </div>
                <Button 
                  icon="pi pi-trash" 
                  @click="removeFromCart(item.menuId)"
                  severity="danger"
                  text
                  rounded
                  size="small"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <Divider />

      <!-- Summary -->
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span class="summary-value">{{ formatCurrency(totalPrice) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span class="summary-value">{{ formatCurrency(totalPrice) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button 
          label="Kosongkan" 
          icon="pi pi-trash" 
          @click="handleClear"
          severity="secondary"
          text
          :disabled="cartItems.length === 0"
        />
        <Button 
          label="Checkout" 
          icon="pi pi-check" 
          @click="handleCheckout"
          severity="success"
          :disabled="cartItems.length === 0"
          raised
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCart } from '../composables/useCart';
import { useAuth } from '../composables/useAuth';
import { ShoppingCart } from 'lucide-vue-next';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import { showConfirm, showSuccess, showError } from '../utils/sweetAlert';
import api from '../config/api';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const router = useRouter();
const { isAuthenticated } = useAuth();
const {
  cartItems,
  itemCount,
  totalPrice,
  updateQuantity,
  removeFromCart,
  clearCart,
} = useCart();

const increaseQuantity = (menuId: number) => {
  const item = cartItems.value.find(i => i.menuId === menuId);
  if (item) {
    updateQuantity(menuId, item.quantity + 1);
  }
};

const decreaseQuantity = (menuId: number) => {
  const item = cartItems.value.find(i => i.menuId === menuId);
  if (item) {
    updateQuantity(menuId, item.quantity - 1);
  }
};

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const handleClear = async () => {
  const result = await showConfirm(
    'Semua item di keranjang akan dihapus.',
    'Yakin ingin mengosongkan keranjang?',
    'Ya, Kosongkan',
    'Batal'
  );

  if (result.isConfirmed) {
    clearCart();
  }
};

const handleCheckout = async () => {
  if (!isAuthenticated.value) {
    const result = await showConfirm(
      'Anda harus login untuk melakukan pemesanan.',
      'Login sekarang?',
      'Ya, Login',
      'Batal'
    );

    if (result.isConfirmed) {
      isVisible.value = false;
      router.push('/login');
    }
    return;
  }

  if (cartItems.value.length === 0) return;
  
  try {
    // Create order directly
    const orderData = {
      tenant_id: cartItems.value[0]?.tenantId,
      type: 'pickup',
      items: cartItems.value.map((item) => ({
        menu_id: item.menuId,
        qty: item.quantity,
      })),
    };

    await api.post('/orders', orderData);
    
    // Clear cart and close dialog
    clearCart();
    isVisible.value = false;
    
    // Show success and redirect to customer dashboard
    await showSuccess('Pesanan berhasil dibuat! Silakan lakukan pembayaran di dashboard.');
    router.push('/customer/dashboard');
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal membuat pesanan');
    console.error('Checkout error:', error);
  }
};
</script>

<style scoped>
:deep(.cart-dialog .p-dialog-header) {
  padding: 1.5rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

:deep(.cart-dialog .p-dialog-content) {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.cart-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  color: white;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.header-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.empty-cart {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-cart h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-cart p {
  color: #9ca3af;
  margin: 0;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

:deep(.cart-item) {
  border: 1px solid #e5e7eb;
  box-shadow: none;
}

:deep(.cart-item .p-card-body) {
  padding: 1rem;
}

:deep(.cart-item .p-card-content) {
  padding: 0;
}

.item-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.item-price {
  font-size: 1rem;
  font-weight: 700;
  color: #22c55e;
  margin: 0 0 0.25rem 0;
}

.item-tenant {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 0.25rem;
}

.quantity {
  min-width: 2rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
  color: #6b7280;
}

.summary-row.total {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  padding-top: 0.5rem;
  border-top: 2px solid #e5e7eb;
}

.summary-value {
  font-weight: 600;
  color: #22c55e;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
