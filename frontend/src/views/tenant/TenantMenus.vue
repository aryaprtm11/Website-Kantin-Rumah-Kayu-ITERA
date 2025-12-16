<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :menuItems="TENANT_MENU_ITEMS" />

    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Kelola Menu</h1>
          <p class="text-gray-600">Atur menu kantin Anda</p>
        </div>
        <div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
            @click="openAddModal"
            aria-label="Tambah menu"
          >
            <PlusCircle :size="18" />
            <span>Tambah Menu</span>
          </button>
        </div>
      </div>

      <div class="min-h-[400px]">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <div class="w-12 h-12 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Memuat menu...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-16">
          <p class="text-red-600 mb-4">❌ {{ error }}</p>
          <button class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all" @click="fetchMenus">Coba Lagi</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="menus.length === 0" class="text-center py-16">
          <div class="text-7xl mb-4">🍽️</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Belum Ada Menu</h3>
          <p class="text-gray-600 mb-8">Mulai tambahkan menu pertama Anda</p>
          <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg" @click="openAddModal">
            <PlusCircle :size="16" /> Tambah Menu
          </button>
        </div>

        <!-- Menu Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="menu in menus" :key="menu.id" class="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
            <div class="h-40 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <img
                :src="menu.photo_url || nasigoreng"
                :alt="menu.name"
                class="w-full h-full object-cover"
                @error="(e) => ((e.target as HTMLImageElement).src = nasigoreng)"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ menu.name }}</h3>
              <p class="text-sm text-green-600 bg-indigo-50 inline-block px-3 py-1 rounded-full mb-3 capitalize" v-if="menu.category">
                {{ menu.category }}
              </p>
              <p class="text-2xl font-bold text-green-600 my-3">{{ formatCurrency(menu.price) }}</p>
              <div class="flex items-center gap-3 mt-4">
                <label class="text-sm font-semibold text-gray-700">Stok:</label>
                <input
                  type="number"
                  v-model.number="menu.stock"
                  @blur="updateStock(menu)"
                  min="0"
                  class="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-center focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div class="flex gap-2 px-6 pb-6">
              <button
                class="w-11 h-11 inline-flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
                @click="openEditModal(menu)"
                title="Edit"
                aria-label="Edit menu"
              >
                <Edit3 :size="18" />
              </button>
              <button
                class="w-11 h-11 inline-flex items-center justify-center bg-gradient-to-r from-red-50 to-red-100 text-red-900 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
                @click="confirmDelete(menu)"
                title="Hapus"
                aria-label="Hapus menu"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4" @click="closeModal">
      <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" @click.stop>
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">{{ isEditMode ? "Edit Menu" : "Tambah Menu Baru" }}</h2>
          <button class="text-2xl text-gray-600 hover:text-gray-900" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8">
          <div class="w-full max-h-56 overflow-hidden rounded-xl mb-4 shadow-lg" v-if="formData.photo_url || !isEditMode">
            <img
              :src="formData.photo_url || nasigoreng"
              :alt="formData.name || 'Preview'"
              class="w-full h-56 object-cover"
              @error="(e) => ((e.target as HTMLImageElement).src = nasigoreng)"
            />
          </div>
          <div class="mb-6">
            <label for="name" class="block font-semibold text-gray-900 mb-2">Nama Menu *</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              required
              placeholder="Contoh: Nasi Goreng"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div class="mb-6">
            <label for="category" class="block font-semibold text-gray-900 mb-2">Kategori</label>
            <select id="category" v-model="formData.category" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100">
              <option value="">Pilih kategori</option>
              <option value="main">Makanan Utama</option>
              <option value="snack">Snack</option>
              <option value="drink">Minuman</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label for="price" class="block font-semibold text-gray-900 mb-2">Harga *</label>
              <input
                type="number"
                id="price"
                v-model.number="formData.price"
                required
                min="0"
                placeholder="25000"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label for="stock" class="block font-semibold text-gray-900 mb-2">Stok *</label>
              <input
                type="number"
                id="stock"
                v-model.number="formData.stock"
                required
                min="0"
                placeholder="10"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div class="mb-6">
            <label for="photo_url" class="block font-semibold text-gray-900 mb-2">URL Foto</label>
            <input
              type="url"
              id="photo_url"
              v-model="formData.photo_url"
              placeholder="https://..."
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div v-if="formError" class="p-4 bg-red-100 text-red-800 rounded-lg mb-6">❌ {{ formError }}</div>

          <div class="flex gap-4 justify-end">
            <button type="button" class="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors" @click="closeModal">
              Batal
            </button>
            <button type="submit" class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" :disabled="submitting">
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


