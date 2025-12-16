<template>
  <div class="dashboard-layout">
    <Sidebar :menuItems="TENANT_MENU_ITEMS" />

    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Kelola Menu</h1>
          <p class="dashboard-subtitle">Atur menu kantin Anda</p>
        </div>
        <div class="header-actions">
          <button
            class="btn-primary btn-add"
            @click="openAddModal"
            aria-label="Tambah menu"
          >
            <PlusCircle :size="18" class="btn-add-icon" />
            <span>Tambah Menu</span>
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Memuat menu...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>❌ {{ error }}</p>
          <button class="btn-retry" @click="fetchMenus">Coba Lagi</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="menus.length === 0" class="empty-state">
          <div class="empty-icon">🍽️</div>
          <h3>Belum Ada Menu</h3>
          <p>Mulai tambahkan menu pertama Anda</p>
          <button class="btn-primary btn-add" @click="openAddModal">
            <PlusCircle :size="16" class="btn-add-icon" /> Tambah Menu
          </button>
        </div>

        <!-- Menu Grid -->
        <div v-else class="menu-grid">
          <div v-for="menu in menus" :key="menu.id" class="menu-card">
            <div class="menu-image">
              <img
                :src="menu.photo_url || nasigoreng"
                :alt="menu.name"
                class="menu-img"
                @error="(e) => ((e.target as HTMLImageElement).src = nasigoreng)"
              />
            </div>
            <div class="menu-info">
              <h3 class="menu-name">{{ menu.name }}</h3>
              <p class="menu-category" v-if="menu.category">
                {{ menu.category }}
              </p>
              <p class="menu-price">{{ formatCurrency(menu.price) }}</p>
              <div class="menu-stock">
                <label>Stok:</label>
                <input
                  type="number"
                  v-model.number="menu.stock"
                  @blur="updateStock(menu)"
                  min="0"
                  class="stock-input"
                />
              </div>
            </div>
            <div class="menu-actions">
              <button
                class="btn-icon btn-edit"
                @click="openEditModal(menu)"
                title="Edit"
                aria-label="Edit menu"
              >
                <Edit3 :size="18" class="icon-svg" />
              </button>
              <button
                class="btn-icon btn-delete"
                @click="confirmDelete(menu)"
                title="Hapus"
                aria-label="Hapus menu"
              >
                <Trash2 :size="18" class="icon-svg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? "Edit Menu" : "Tambah Menu Baru" }}</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="image-preview" v-if="formData.photo_url || !isEditMode">
            <img
              :src="formData.photo_url || nasigoreng"
              :alt="formData.name || 'Preview'"
              @error="(e) => ((e.target as HTMLImageElement).src = nasigoreng)"
            />
          </div>
          <div class="form-group">
            <label for="name">Nama Menu *</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              required
              placeholder="Contoh: Nasi Goreng"
            />
          </div>

          <div class="form-group">
            <label for="category">Kategori</label>
            <select id="category" v-model="formData.category">
              <option value="">Pilih kategori</option>
              <option value="main">Makanan Utama</option>
              <option value="snack">Snack</option>
              <option value="drink">Minuman</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Harga *</label>
              <input
                type="number"
                id="price"
                v-model.number="formData.price"
                required
                min="0"
                placeholder="25000"
              />
            </div>

            <div class="form-group">
              <label for="stock">Stok *</label>
              <input
                type="number"
                id="stock"
                v-model.number="formData.stock"
                required
                min="0"
                placeholder="10"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="photo_url">URL Foto</label>
            <input
              type="url"
              id="photo_url"
              v-model="formData.photo_url"
              placeholder="https://..."
            />
          </div>

          <div v-if="formError" class="form-error">❌ {{ formError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">
              Batal
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{
                submitting ? "Menyimpan..." : isEditMode ? "Simpan" : "Tambah"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "../../components/dashboard/Sidebar.vue";
import api from "../../config/api";
import { TENANT_MENU_ITEMS } from "../../constants/menuItems";
import {
  showSuccess,
  showError,
  showDeleteConfirm,
} from "../../utils/sweetAlert";
import nasigoreng from "../../assets/nasigoreng.jpeg";
import { Edit3, Trash2, PlusCircle } from "lucide-vue-next";

const menus = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formError = ref<string | null>(null);

const formData = ref({
  id: null as number | null,
  name: "",
  category: "",
  price: 0,
  stock: 0,
  photo_url: "",
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const fetchMenus = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get("/tenant/menus");
    menus.value = response.data.data || response.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Gagal memuat menu";
    console.error("Error fetching menus:", err);
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditMode.value = false;
  formData.value = {
    id: null,
    name: "",
    category: "",
    price: 0,
    stock: 0,
    photo_url: "",
  };
  formError.value = null;
  showModal.value = true;
};

const openEditModal = (menu: any) => {
  isEditMode.value = true;
  formData.value = {
    id: menu.id,
    name: menu.name,
    category: menu.category || "",
    price: menu.price,
    stock: menu.stock,
    photo_url: menu.photo_url || "",
  };
  formError.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formError.value = null;
};

const handleSubmit = async () => {
  submitting.value = true;
  formError.value = null;

  try {
    const payload = {
      name: formData.value.name,
      category: formData.value.category || null,
      price: formData.value.price,
      stock: formData.value.stock,
      photo_url: formData.value.photo_url || null,
    };

    if (isEditMode.value && formData.value.id) {
      // Update existing menu
      await api.patch(`/tenant/menus/${formData.value.id}`, payload);
    } else {
      // Create new menu
      await api.post("/tenant/menus", payload);
    }

    await fetchMenus();
    closeModal();
  } catch (err: any) {
    formError.value = err.response?.data?.message || "Gagal menyimpan menu";
    console.error("Error saving menu:", err);
  } finally {
    submitting.value = false;
  }
};

const updateStock = async (menu: any) => {
  try {
    await api.patch(`/tenant/menus/${menu.id}/stock`, {
      stock: menu.stock,
    });
    await showSuccess("Stok berhasil diupdate");
  } catch (err: any) {
    showError("Gagal update stok");
    await fetchMenus();
  }
};

const confirmDelete = async (menu: any) => {
  const result = await showDeleteConfirm(
    `Menu "${menu.name}" akan dihapus secara permanen.`,
    "Hapus menu ini?"
  );

  if (result.isConfirmed) {
    deleteMenu(menu.id);
  }
};

const deleteMenu = async (menuId: number) => {
  try {
    await api.delete(`/tenant/menus/${menuId}`);
    await fetchMenus();
    await showSuccess("Menu berhasil dihapus");
  } catch (err: any) {
    showError("Gagal menghapus menu");
    console.error("Error deleting menu:", err);
  }
};

onMounted(() => {
  fetchMenus();
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

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.12);
}

.btn-add .btn-add-icon {
  color: rgba(255, 255, 255, 0.95);
}

.image-preview {
  width: 100%;
  max-height: 220px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.image-preview img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  border-top-color: #22c55e;
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
  margin-bottom: 2rem;
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.menu-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.menu-image {
  height: 160px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.menu-info {
  padding: 1.5rem;
}

.menu-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.menu-category {
  font-size: 0.85rem;
  color: #22c55e;
  background: #eef2ff;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  text-transform: capitalize;
}

.menu-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #48bb78;
  margin: 0.75rem 0;
}

.menu-stock {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.menu-stock label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
}

.stock-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.stock-input:focus {
  outline: none;
  border-color: #22c55e;
}

.menu-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem;
}

.btn-icon {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}

.btn-edit {
  background: linear-gradient(90deg, #e6f6ff 0%, #d0eaff 100%);
  color: #1e40af;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.08);
}

.btn-delete {
  background: linear-gradient(90deg, #fff1f2 0%, #ffe3e6 100%);
  color: #9b1c1c;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.08);
}

.icon-svg {
  color: inherit;
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
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-error {
  padding: 1rem;
  background: #fed7d7;
  color: #742a2a;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

  .menu-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
