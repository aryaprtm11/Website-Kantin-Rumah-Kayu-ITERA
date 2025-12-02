<template>
  <div v-if="isCartOpen" class="cart-overlay" @click="closeCart">
    <div class="cart-sidebar" @click.stop>
      <div class="cart-header">
        <h2>🛒 Keranjang</h2>
        <button class="btn-close" @click="closeCart">✕</button>
      </div>

      <div v-if="cartItems.length === 0" class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Keranjang Anda kosong</p>
      </div>

      <div v-else class="cart-content">
        <div class="cart-tenant">📍 {{ cartItems[0]?.tenantName }}</div>

        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.menuId" class="cart-item">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="item-price">{{ formatCurrency(item.price) }}</p>
            </div>
            <div class="item-controls">
              <button
                class="btn-qty"
                @click="updateQuantity(item.menuId, item.quantity - 1)"
              >
                −
              </button>
              <span class="qty">{{ item.quantity }}</span>
              <button
                class="btn-qty"
                @click="updateQuantity(item.menuId, item.quantity + 1)"
              >
                +
              </button>
            </div>
            <button
              class="btn-remove"
              @click="removeItem(item.menuId)"
              title="Hapus"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="cart-footer">
          <div class="cart-total">
            <span>Total</span>
            <span class="total-price">{{ formatCurrency(totalPrice) }}</span>
          </div>
          <button class="btn-checkout" @click="handleCheckout">
            Checkout ({{ totalItems }} item)
          </button>
          <button class="btn-clear" @click="handleClear">
            Kosongkan Keranjang
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useCart } from "../composables/useCart";
import { useAuth } from "../composables/useAuth";
import api from "../config/api";

const router = useRouter();
const {
  cartItems,
  isCartOpen,
  itemCount: totalItems,
  totalPrice,
  currentTenant: currentTenantId,
  removeFromCart: removeItem,
  updateQuantity,
  clearCart,
  closeCart,
} = useCart();

const { isAuthenticated } = useAuth();

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const handleClear = () => {
  if (confirm("Yakin ingin mengosongkan keranjang?")) {
    clearCart();
  }
};

const handleCheckout = async () => {
  if (!isAuthenticated.value) {
    if (
      confirm("Anda harus login untuk melakukan pemesanan. Login sekarang?")
    ) {
      router.push("/login");
    }
    return;
  }

  try {
    const orderData = {
      tenant_id: currentTenantId.value,
      type: "pickup",
      items: cartItems.value.map((item) => ({
        menu_id: item.menuId,
        qty: item.quantity,
      })),
    };

    await api.post("/orders", orderData);

    alert("Pesanan berhasil dibuat! Silakan lakukan pembayaran di kantin.");
    clearCart();
    closeCart();
    router.push("/customer/dashboard");
  } catch (error: any) {
    alert(error.response?.data?.message || "Gagal membuat pesanan");
    console.error("Checkout error:", error);
  }
};
</script>

<style scoped>
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

.cart-sidebar {
  width: 100%;
  max-width: 420px;
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
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

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #718096;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-tenant {
  padding: 1rem 1.5rem;
  background: #eef2ff;
  color: #667eea;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  font-size: 1rem;
  font-weight: 600;
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
  align-items: center;
  gap: 0.5rem;
  background: white;
  border-radius: 8px;
  padding: 0.25rem;
}

.btn-qty {
  width: 32px;
  height: 32px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.btn-qty:hover {
  background: #5568d3;
}

.qty {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  color: #2d3748;
}

.btn-remove {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.btn-remove:hover {
  opacity: 1;
}

.cart-footer {
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem;
  background: white;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.total-price {
  font-size: 1.5rem;
  color: #48bb78;
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0.75rem;
}

.btn-checkout:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-clear {
  width: 100%;
  padding: 0.75rem;
  background: #fed7d7;
  color: #742a2a;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-clear:hover {
  background: #fc8181;
  color: white;
}

@media (max-width: 768px) {
  .cart-sidebar {
    max-width: 100%;
  }
}
</style>
