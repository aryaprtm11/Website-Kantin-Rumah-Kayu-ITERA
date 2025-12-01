/**
 * Cart Management Composable
 * Handles shopping cart state and operations
 */

import { ref, computed } from 'vue';

export interface CartItem {
  menuId: number;
  tenantId: number;
  tenantName: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

const cartItems = ref<CartItem[]>([]);
const isCartOpen = ref(false);

export function useCart() {
  /**
   * Add item to cart
   */
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existingItem = cartItems.value.find(
      (cartItem) => cartItem.menuId === item.menuId
    );

    if (existingItem) {
      // Increase quantity if already in cart
      if (existingItem.quantity < item.stock) {
        existingItem.quantity++;
      } else {
        alert('Stok tidak cukup');
      }
    } else {
      // Add new item to cart
      cartItems.value.push({
        ...item,
        quantity: 1,
      });
    }

    // Open cart sidebar
    isCartOpen.value = true;
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (menuId: number) => {
    cartItems.value = cartItems.value.filter(
      (item) => item.menuId !== menuId
    );
  };

  /**
   * Update item quantity
   */
  const updateQuantity = (menuId: number, quantity: number) => {
    const item = cartItems.value.find((item) => item.menuId === menuId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(menuId);
      } else if (quantity <= item.stock) {
        item.quantity = quantity;
      } else {
        alert('Stok tidak cukup');
      }
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    cartItems.value = [];
  };

  /**
   * Toggle cart sidebar
   */
  const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value;
  };

  /**
   * Close cart sidebar
   */
  const closeCart = () => {
    isCartOpen.value = false;
  };

  /**
   * Open cart sidebar
   */
  const openCart = () => {
    isCartOpen.value = true;
  };

  /**
   * Computed: Total items in cart
   */
  const itemCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  /**
   * Computed: Total price
   */
  const totalPrice = computed(() => {
    return cartItems.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  });

  /**
   * Computed: Current tenant (all items must be from same tenant)
   */
  const currentTenant = computed(() => {
    return cartItems.value.length > 0 ? cartItems.value[0].tenantId : null;
  });

  /**
   * Check if can add item (same tenant validation)
   */
  const canAddItem = (tenantId: number): boolean => {
    if (cartItems.value.length === 0) return true;
    return currentTenant.value === tenantId;
  };

  return {
    // State
    cartItems,
    isCartOpen,
    
    // Computed
    itemCount,
    totalPrice,
    currentTenant,
    
    // Methods
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    openCart,
    canAddItem,
  };
}
