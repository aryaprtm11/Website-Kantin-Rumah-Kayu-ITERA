<template>
  <div class="flex min-h-screen bg-white">
    <Sidebar :menuItems="TENANT_MENU_ITEMS" />

    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Kelola Menu</h1>
          <p class="text-sm text-gray-500">Atur menu kantin Anda</p>
        </div>
        <div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium cursor-pointer transition-all hover:bg-green-700"
            @click="openAddModal"
            aria-label="Tambah menu"
          >
            <PlusCircle :size="16" />
            <span>Tambah Menu</span>
          </button>
        </div>
      </div>

      <div class="min-h-[400px]">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-16">
          <div class="w-10 h-10 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-sm text-gray-600">Memuat menu...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-16">
          <p class="text-sm text-red-600 mb-4">{{ error }}</p>
          <button class="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors" @click="fetchMenus">Coba Lagi</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="menus.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle :size="32" class="text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Belum Ada Menu</h3>
          <p class="text-sm text-gray-500 mb-6">Mulai tambahkan menu pertama Anda</p>
          <button class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium cursor-pointer transition-all hover:bg-green-700" @click="openAddModal">
            <PlusCircle :size="16" /> Tambah Menu
          </button>
        </div>

        <!-- Menu Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="menu in menus" :key="menu.id" class="bg-white rounded-lg overflow-hidden border border-gray-200 transition-all hover:border-green-500 hover:shadow-sm">
            <div class="h-36 bg-gray-100 flex items-center justify-center">
              <img
                :src="menu.photo_url || nasigoreng"
                :alt="menu.name"
                class="w-full h-full object-cover"
                @error="(e) => ((e.target as HTMLImageElement).src = nasigoreng)"
              />
            </div>
            <div class="p-4">
              <h3 class="text-base font-bold text-gray-900 mb-1">{{ menu.name }}</h3>
              <p class="text-xs text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full mb-2 capitalize border border-green-200" v-if="menu.category">
                {{ menu.category }}
              </p>
              <p class="text-lg font-bold text-gray-900 my-2">{{ formatCurrency(menu.price) }}</p>
              <div class="flex items-center gap-2 mt-3">
                <label class="text-xs font-medium text-gray-600">Stok:</label>
                <input
                  type="number"
                  v-model.number="menu.stock"
                  @blur="updateStock(menu)"
                  min="0"
                  class="w-16 px-2 py-1 border border-gray-300 rounded text-sm font-medium text-center focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div class="flex gap-2 px-4 pb-4">
              <button
                class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-gray-300 text-sm font-medium"
                @click="openEditModal(menu)"
                title="Edit"
                aria-label="Edit menu"
              >
                <Edit3 :size="14" />
                <span>Edit</span>
              </button>
              <button
                class="px-3 py-2 bg-white text-red-600 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-red-300 text-sm"
                @click="confirmDelete(menu)"
                title="Hapus"
                aria-label="Hapus menu"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4" @click="closeModal">
      <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" @click.stop>
        <div class="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">{{ isEditMode ? "Edit Menu" : "Tambah Menu Baru" }}</h2>
          <button class="text-xl text-gray-600 hover:text-gray-900" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-5">
          <div class="w-full h-40 overflow-hidden rounded-lg mb-4 bg-gray-100" v-if="formData.photo_url || !isEditMode">
            <img
              :src="formData.photo_url || nasigoreng"
              :alt="formData.name || 'Preview'"
              class="w-full h-full object-cover"
              @error="(e) => ((e.target as HTMLImageElement).src = nasigoreng)"
            />
          </div>
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-900 mb-1.5">Nama Menu *</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              required
              placeholder="Contoh: Nasi Goreng"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div class="mb-4">
            <label for="category" class="block text-sm font-medium text-gray-900 mb-1.5">Kategori</label>
            <select id="category" v-model="formData.category" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500">
              <option value="">Pilih kategori</option>
              <option value="main">Makanan Utama</option>
              <option value="snack">Snack</option>
              <option value="drink">Minuman</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label for="price" class="block text-sm font-medium text-gray-900 mb-1.5">Harga *</label>
              <input
                type="number"
                id="price"
                v-model.number="formData.price"
                required
                min="0"
                placeholder="25000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label for="stock" class="block text-sm font-medium text-gray-900 mb-1.5">Stok *</label>
              <input
                type="number"
                id="stock"
                v-model.number="formData.stock"
                required
                min="0"
                placeholder="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div class="mb-4">
            <label for="photo_url" class="block text-sm font-medium text-gray-900 mb-1.5">URL Foto</label>
            <input
              type="url"
              id="photo_url"
              v-model="formData.photo_url"
              placeholder="https://..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div v-if="formError" class="p-3 bg-red-50 text-red-700 rounded-lg mb-4 text-sm border border-red-200">{{ formError }}</div>

          <div class="flex gap-3 justify-end">
            <button type="button" class="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm" @click="closeModal">
              Batal
            </button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm" :disabled="submitting">
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


