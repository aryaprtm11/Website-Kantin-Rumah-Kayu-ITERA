<template>
  <!-- Cart Button (Floating) -->
  <button v-if="itemCount > 0" class="cart-button" @click="toggleCart">
    🛒
    <span class="cart-badge">{{ itemCount }}</span>
  </button>

  <!-- Cart Sidebar -->
  <Transition name="slide">
    <div v-if="isCartOpen" class="cart-overlay" @click="closeCart">
      <div class="cart-sidebar" @click.stop>
        <div class="cart-header">
          <h2>Keranjang</h2>
          <button class="btn-close" @click="closeCart">✕</button>
        </div>

        <!-- Empty State -->
        <div v-if="cartItems.length === 0" class="cart-empty">
          <div class="empty-icon">🛒</div>
          <p>Keranjang kosong</p>
          <small>Tambahkan menu untuk melanjutkan</small>
        </div>

        <!-- Cart Items -->
        <div v-else class="cart-content">
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.menuId" class="cart-item">
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-price">{{ formatCurrency(item.price) }}</p>
              </div>

              <div class="item-controls">
                <div class="quantity-controls">
                  <button
                    class="btn-qty"
                    @click="decreaseQuantity(item.menuId)"
                  >
                    −
                  </button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button
                    class="btn-qty"
                    @click="increaseQuantity(item.menuId)"
                    :disabled="item.quantity >= item.stock"
                  >
                    +
                  </button>
                </div>
                <button
                  class="btn-remove"
                  @click="removeFromCart(item.menuId)"
                  title="Hapus"
                >
                  🗑️
                </button>
              </div>

              <div class="item-subtotal">
                Subtotal: {{ formatCurrency(item.price * item.quantity) }}
              </div>
            </div>
          </div>

          <!-- Cart Footer -->
          <div class="cart-footer">
            <div class="total-section">
              <span class="total-label">Total:</span>
              <span class="total-price">{{ formatCurrency(totalPrice) }}</span>
            </div>

            <button
              class="btn-checkout"
              @click="handleCheckout"
              :disabled="isProcessing"
            >
              {{ isProcessing ? "Memproses..." : "Checkout" }}
            </button>

            <button class="btn-clear" @click="confirmClear">
              Kosongkan Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";
import { useAuth } from "../composables/useAuth";
import api from "../config/api";

const router = useRouter();
const { isAuthenticated } = useAuth();
const {
  cartItems,
  isCartOpen,
  itemCount,
  totalPrice,
  currentTenant,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  closeCart,
} = useCart();

const isProcessing = ref(false);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const increaseQuantity = (menuId: number) => {
  const item = cartItems.value.find((i) => i.menuId === menuId);
  if (item) {
    updateQuantity(menuId, item.quantity + 1);
  }
};

const decreaseQuantity = (menuId: number) => {
  const item = cartItems.value.find((i) => i.menuId === menuId);
  if (item) {
    updateQuantity(menuId, item.quantity - 1);
  }
};

const confirmClear = () => {
  if (confirm("Yakin ingin mengosongkan keranjang?")) {
    clearCart();
  }
};

const handleCheckout = async () => {
  // Check if user is logged in
  if (!isAuthenticated.value) {
    if (confirm("Anda harus login terlebih dahulu. Login sekarang?")) {
      router.push("/login");
    }
    return;
  }

  isProcessing.value = true;

  try {
    // Prepare order data
    const orderData = {
      tenant_id: currentTenant.value,
      type: "pickup",
      items: cartItems.value.map((item) => ({
        menu_id: item.menuId,
        qty: item.quantity,
      })),
    };

    // Create order
    const response = await api.post("/orders", orderData);
    console.log("Order created:", response.data);

    // Success
    alert("Pesanan berhasil dibuat! Silakan lakukan pembayaran.");

    // Clear cart
    clearCart();
    closeCart();

    // Redirect to customer dashboard
    router.push("/customer/dashboard");
  } catch (error: any) {
    console.error("Checkout error:", error);
    const message = error.response?.data?.message || "Gagal membuat pesanan";
    alert(message);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
/* Floating Cart Button */
.cart-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  z-index: 999;
}

.cart-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #fc8181;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Cart Overlay */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

/* Cart Sidebar */
.cart-sidebar {
  width: 100%;
  max-width: 400px;
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.cart-header h2 {
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

/* Empty State */
.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #718096;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.cart-empty p {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.cart-empty small {
  font-size: 0.9rem;
}

/* Cart Content */
.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.cart-item {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.item-info {
  margin-bottom: 0.75rem;
}

.item-name {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.item-price {
  font-size: 0.9rem;
  color: #48bb78;
  font-weight: 600;
  margin: 0;
}

.item-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

.btn-qty {
  width: 28px;
  height: 28px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
}

.btn-qty:hover:not(:disabled) {
  background: #5568d3;
}

.btn-qty:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.quantity {
  font-weight: 700;
  color: #2d3748;
  min-width: 30px;
  text-align: center;
}

.btn-remove {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
}

.btn-remove:hover {
  opacity: 1;
}

.item-subtotal {
  text-align: right;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2d3748;
}

/* Cart Footer */
.cart-footer {
  border-top: 2px solid #e2e8f0;
  padding: 1.5rem;
  background: white;
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.total-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.total-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #48bb78;
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 0.75rem;
  transition: all 0.3s;
}

.btn-checkout:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-checkout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-clear {
  width: 100%;
  padding: 0.75rem;
  background: white;
  color: #e53e3e;
  border: 1px solid #e53e3e;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-clear:hover {
  background: #fff5f5;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .cart-sidebar,
.slide-leave-to .cart-sidebar {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .cart-sidebar {
    max-width: 100%;
  }

  .cart-button {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
