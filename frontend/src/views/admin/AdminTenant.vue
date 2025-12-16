<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :menuItems="ADMIN_MENU_ITEMS" />
    
    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Kelola Tenant</h1>
          <p class="text-gray-600">Manajemen semua kantin di sistem</p>
        </div>
        <div class="flex gap-3 items-center">
          <button
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 border border-gray-200 rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            :disabled="isRefreshing"
            @click="refreshTenants"
            aria-label="Refresh tenants"
          >
            <RefreshCw :size="16" :class="{ 'animate-spin': isRefreshing }" />
            <span>{{ isRefreshing ? 'Memuat...' : 'Refresh' }}</span>
          </button>

          <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg" @click="openAddModal">
            <Plus :size="14" />
            <span>Tambah Kantin</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <!-- Search & Filter -->
        <div class="bg-white rounded-xl p-6 shadow-md flex gap-4 flex-wrap items-center">
          <div class="flex-1 min-w-[250px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari kantin..."
              @input="handleSearch"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="status in statusFilters"
              :key="status.value"
              :class="['px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all', currentFilter === status.value ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600 hover:text-green-600']"
              @click="filterByStatus(status.value)"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <!-- Tenants Table -->
        <div class="bg-white rounded-xl p-6 shadow-md">
          <div v-if="loading" class="text-center py-12">
            <div class="w-10 h-10 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600">Memuat data...</p>
          </div>

          <div v-else-if="tenants.length === 0" class="text-center py-12 text-gray-600">
            <p>Tidak ada data kantin</p>
          </div>

          <div v-else>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">ID</th>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">Nama Kantin</th>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">Pemilik</th>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">Email</th>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">Status</th>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">Jam Operasional</th>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">Menu</th>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">Pesanan</th>
                    <th class="text-left py-3 px-4 bg-gray-50 text-gray-700 font-semibold text-sm border-b-2 border-gray-200 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-gray-50 transition-colors">
                    <td class="py-4 px-4 border-b border-gray-200 text-gray-900">#{{ tenant.id }}</td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <div class="flex flex-col gap-1">
                        <strong class="font-semibold text-gray-900">{{ tenant.name }}</strong>
                        <small class="text-gray-600 text-xs">{{ tenant.location || '-' }}</small>
                      </div>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ tenant.user?.name || '-' }}</td>
                    <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ tenant.user?.email || '-' }}</td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <span :class="['inline-block px-3 py-1 rounded-xl text-xs font-semibold', tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ tenant.is_active ? '🟢 Aktif' : '🔴 Nonaktif' }}
                      </span>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <div class="text-sm text-gray-700">
                        {{ tenant.opens_at }} - {{ tenant.closes_at }}
                      </div>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <span class="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-blue-100 text-blue-800">{{ tenant.menus_count || 0 }}</span>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <span class="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-gray-200 text-gray-700">{{ tenant.orders_count || 0 }}</span>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <div class="flex gap-2">
                        <button class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 transition-all hover:-translate-y-0.5 hover:shadow-md" @click="openEditModal(tenant)" title="Edit">
                          <Edit :size="16" />
                        </button>

                        <button
                          :class="['w-9 h-9 inline-flex items-center justify-center rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md', tenant.is_active ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-900' : 'bg-gradient-to-r from-green-50 to-green-100 text-green-900']"
                          @click="toggleStatus(tenant)"
                          :title="tenant.is_active ? 'Nonaktifkan' : 'Aktifkan'"
                        >
                          <Lock v-if="tenant.is_active" :size="16" />
                          <Unlock v-else :size="16" />
                        </button>

                        <button class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-50 to-red-100 text-red-900 transition-all hover:-translate-y-0.5 hover:shadow-md" @click="deleteTenant(tenant)" title="Hapus">
                          <Trash :size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="flex justify-center items-center gap-4 mt-6 pt-6 border-t border-gray-200">
              <button 
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium cursor-pointer transition-all hover:border-green-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
              >
                ← Prev
              </button>
              <span class="text-gray-700 font-medium">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button 
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium cursor-pointer transition-all hover:border-green-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Add/Edit Tenant -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" @click="closeModal">
      <div class="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Edit Kantin' : 'Tambah Kantin Baru' }}</h2>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 text-2xl" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="name" class="block font-medium text-gray-700 mb-2 text-sm">Nama Kantin *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="Contoh: Warung Nusantara"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
            />
          </div>

          <div class="mb-4">
            <label for="location" class="block font-medium text-gray-700 mb-2 text-sm">Lokasi</label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              placeholder="Contoh: Gedung A Lantai 1"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="opens_at" class="block font-medium text-gray-700 mb-2 text-sm">Jam Buka *</label>
              <input
                id="opens_at"
                v-model="formData.opens_at"
                type="time"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label for="closes_at" class="block font-medium text-gray-700 mb-2 text-sm">Jam Tutup *</label>
              <input
                id="closes_at"
                v-model="formData.closes_at"
                type="time"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div class="mb-4" v-if="!isEditMode">
            <label for="user_id" class="block font-medium text-gray-700 mb-2 text-sm">Pemilik (User ID) *</label>
            <input
              id="user_id"
              v-model="formData.user_id"
              type="number"
              required
              placeholder="ID user yang akan menjadi pemilik"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
            />
          </div>

          <div class="mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formData.is_active"
                type="checkbox"
                class="w-auto cursor-pointer"
              />
              <span class="font-medium text-gray-700 text-sm">Kantin Aktif</span>
            </label>
          </div>

          <div v-if="formError" class="px-4 py-3 bg-red-100 text-red-900 rounded-lg mb-4 text-sm">
            {{ formError }}
          </div>

          <div class="flex gap-4 mt-6">
            <button type="button" class="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-50" @click="closeModal">
              Batal
            </button>
            <button type="submit" class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : (isEditMode ? 'Update' : 'Tambah') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Sidebar from '../../components/dashboard/Sidebar.vue';
import { RefreshCw, Plus, Edit, Lock, Unlock, Trash } from 'lucide-vue-next';
import { AdminService } from '../../services/adminService';
import { ADMIN_MENU_ITEMS } from '../../constants/menuItems';
import { showSuccess, showError, showDeleteConfirm, showConfirm } from '../../utils/sweetAlert';

const tenants = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const currentFilter = ref('all');
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = 10;

const showModal = ref(false);
const isEditMode = ref(false);
const submitting = ref(false);
const formError = ref<string | null>(null);
const editingTenantId = ref<number | null>(null);

const statusFilters = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

const formData = ref({
  name: '',
  location: '',
  opens_at: '08:00',
  closes_at: '17:00',
  user_id: null as number | null,
  is_active: true,
});

const fetchTenants = async () => {
  loading.value = true;
  try {
    const response = await AdminService.getTenants(currentPage.value, perPage);
    tenants.value = response.data || [];
    totalPages.value = Math.ceil((response.total || 0) / perPage);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    tenants.value = [];
  } finally {
    loading.value = false;
  }
};

const isRefreshing = ref(false);

const refreshTenants = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await fetchTenants();
  } catch (err) {
    console.error('Error refreshing tenants:', err);
  } finally {
    isRefreshing.value = false;
  }
};

const handleSearch = () => {
  // TODO: Implement search with debounce
  console.log('Search:', searchQuery.value);
};

const filterByStatus = (status: string) => {
  currentFilter.value = status;
  // TODO: Implement filter
  fetchTenants();
};

const changePage = (page: number) => {
  currentPage.value = page;
  fetchTenants();
};

const openAddModal = () => {
  isEditMode.value = false;
  formData.value = {
    name: '',
    location: '',
    opens_at: '08:00',
    closes_at: '17:00',
    user_id: null,
    is_active: true,
  };
  formError.value = null;
  showModal.value = true;
};

const openEditModal = (tenant: any) => {
  isEditMode.value = true;
  editingTenantId.value = tenant.id;
  formData.value = {
    name: tenant.name,
    location: tenant.location || '',
    opens_at: tenant.opens_at,
    closes_at: tenant.closes_at,
    user_id: tenant.user_id,
    is_active: tenant.is_active,
  };
  formError.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingTenantId.value = null;
};

const handleSubmit = async () => {
  submitting.value = true;
  formError.value = null;

  try {
    if (isEditMode.value && editingTenantId.value) {
      await AdminService.updateTenant(editingTenantId.value, formData.value);
      await showSuccess('Kantin berhasil diupdate!');
    } else {
      await AdminService.createTenant(formData.value);
      await showSuccess('Kantin berhasil ditambahkan!');
    }
    closeModal();
    fetchTenants();
  } catch (error: any) {
    formError.value = error.message || 'Terjadi kesalahan';
  } finally {
    submitting.value = false;
  }
};

const toggleStatus = async (tenant: any) => {
  const action = tenant.is_active ? 'Nonaktifkan' : 'Aktifkan';
  const result = await showConfirm(
    `Kantin ${tenant.name} akan ${action.toLowerCase()}.`,
    `${action} kantin ini?`,
    'Ya',
    'Batal'
  );
  
  if (result.isConfirmed) {
    try {
      await AdminService.updateTenant(tenant.id, {
        ...tenant,
        is_active: !tenant.is_active,
      });
      await showSuccess('Status berhasil diubah!');
      fetchTenants();
    } catch (error: any) {
      showError('Gagal mengubah status: ' + error.message);
    }
  }
};

const deleteTenant = async (tenant: any) => {
  const result = await showDeleteConfirm(
    `Kantin ${tenant.name} akan dihapus secara permanen.`,
    'Hapus kantin ini?'
  );
  
  if (result.isConfirmed) {
    try {
      await AdminService.deleteTenant(tenant.id);
      await showSuccess('Kantin berhasil dihapus!');
      fetchTenants();
    } catch (error: any) {
      showError('Gagal menghapus: ' + error.message);
    }
  }
};

onMounted(() => {
  fetchTenants();
});
</script>

<style scoped>
/* Minimal custom styles - using Tailwind */
</style>
