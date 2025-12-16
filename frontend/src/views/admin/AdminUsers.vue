<template>
  <div class="flex min-h-screen bg-white">
    <Sidebar :menuItems="ADMIN_MENU_ITEMS" />
    
    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Kelola User</h1>
          <p class="text-sm text-gray-500">Manajemen pengguna sistem</p>
        </div>
        <div class="flex gap-2 items-center">
          <button
            class="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium cursor-pointer transition-all hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isRefreshing"
            @click="refreshUsers"
            aria-label="Refresh users"
          >
            <RefreshCw :size="16" :class="{ 'animate-spin': isRefreshing }" />
            <span class="text-sm">{{ isRefreshing ? 'Memuat...' : 'Refresh' }}</span>
          </button>

          <button class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium transition-all hover:bg-green-700" @click="openAddModal">
            <Plus :size="16" />
            <span class="text-sm">Tambah User</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <!-- Search & Filter -->
        <div class="bg-white rounded-lg p-4 border border-gray-200 flex gap-3 flex-wrap items-center">
          <div class="flex-1 min-w-[200px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari user (nama/email)..."
              @input="handleSearch"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="role in roleFilters"
              :key="role.value"
              :class="['px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all', currentFilter === role.value ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-green-500']"
              @click="filterByRole(role.value)"
            >
              {{ role.label }}
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div v-if="loading" class="text-center py-12">
            <div class="w-10 h-10 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-sm text-gray-600">Memuat data...</p>
          </div>

          <div v-else-if="users.length === 0" class="text-center py-12 text-sm text-gray-600">
            <p>Tidak ada data user</p>
          </div>

          <div v-else>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="text-left py-3 px-4 text-gray-700 font-semibold text-xs whitespace-nowrap">ID</th>
                    <th class="text-left py-3 px-4 text-gray-700 font-semibold text-xs whitespace-nowrap">Nama</th>
                    <th class="text-left py-3 px-4 text-gray-700 font-semibold text-xs whitespace-nowrap">Email</th>
                    <th class="text-left py-3 px-4 text-gray-700 font-semibold text-xs whitespace-nowrap">Role</th>
                    <th class="text-left py-3 px-4 text-gray-700 font-semibold text-xs whitespace-nowrap">Status</th>
                    <th class="text-left py-3 px-4 text-gray-700 font-semibold text-xs whitespace-nowrap">Terdaftar</th>
                    <th class="text-left py-3 px-4 text-gray-700 font-semibold text-xs whitespace-nowrap">Kantin</th>
                    <th class="text-left py-3 px-4 text-gray-700 font-semibold text-xs whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                    <td class="py-4 px-4 border-b border-gray-200 text-gray-900">#{{ user.id }}</td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                        <strong class="font-semibold text-gray-900">{{ user.name }}</strong>
                      </div>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200 text-gray-900">{{ user.email }}</td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <span :class="['inline-block px-3 py-1 rounded-xl text-xs font-semibold', getRoleBadgeClass(user.role)]">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <span :class="['inline-block px-3 py-1 rounded-xl text-xs font-semibold', user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ user.is_active ? '🟢 Aktif' : '🔴 Nonaktif' }}
                      </span>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200 text-sm text-gray-600">{{ formatDate(user.created_at) }}</td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <span v-if="user.tenant" class="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-blue-100 text-blue-800">
                        {{ user.tenant.name }}
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="py-4 px-4 border-b border-gray-200">
                      <div class="flex gap-2">
                        <button class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 transition-all hover:-translate-y-0.5 hover:shadow-md" @click="openEditModal(user)" title="Edit">
                          <Edit :size="16" />
                        </button>

                        <button
                          v-if="user.id !== currentUserId"
                          :class="['w-9 h-9 inline-flex items-center justify-center rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md', user.is_active ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-900' : 'bg-gradient-to-r from-green-50 to-green-100 text-green-900']"
                          @click="toggleStatus(user)"
                          :title="user.is_active ? 'Nonaktifkan' : 'Aktifkan'"
                        >
                          <Lock v-if="user.is_active" :size="16" />
                          <Unlock v-else :size="16" />
                        </button>

                        <button
                          v-if="user.id !== currentUserId"
                          class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-50 to-red-100 text-red-900 transition-all hover:-translate-y-0.5 hover:shadow-md"
                          @click="deleteUser(user)"
                          title="Hapus"
                        >
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

    <!-- Modal Add/Edit User -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" @click="closeModal">
      <div class="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Edit User' : 'Tambah User Baru' }}</h2>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 text-2xl" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="name" class="block font-medium text-gray-700 mb-2 text-sm">Nama Lengkap *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="Contoh: John Doe"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
            />
          </div>

          <div class="mb-4">
            <label for="email" class="block font-medium text-gray-700 mb-2 text-sm">Email *</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              :disabled="isEditMode"
              placeholder="user@example.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div class="mb-4" v-if="!isEditMode">
            <label for="password" class="block font-medium text-gray-700 mb-2 text-sm">Password *</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              minlength="8"
              placeholder="Min. 8 karakter"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
            />
          </div>

          <div class="mb-4">
            <label for="role" class="block font-medium text-gray-700 mb-2 text-sm">Role *</label>
            <select id="role" v-model="formData.role" required class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600">
              <option value="">Pilih Role</option>
              <option value="customer">Customer</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formData.is_active"
                type="checkbox"
                class="w-auto cursor-pointer"
              />
              <span class="font-medium text-gray-700 text-sm">User Aktif</span>
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
import { ref, computed, onMounted } from 'vue';
import Sidebar from '../../components/dashboard/Sidebar.vue';
import { RefreshCw, Plus, Edit, Lock, Unlock, Trash } from 'lucide-vue-next';
import { AdminService } from '../../services/adminService';
import { ADMIN_MENU_ITEMS } from '../../constants/menuItems';
import { useAuth } from '../../composables/useAuth';
import { showSuccess, showError, showDeleteConfirm, showConfirm } from '../../utils/sweetAlert';

const { currentUser } = useAuth();
const currentUserId = computed(() => currentUser.value?.id);

const users = ref<any[]>([]);
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
const editingUserId = ref<number | null>(null);

const roleFilters = [
  { value: 'all', label: 'Semua' },
  { value: 'customer', label: 'Customer' },
  { value: 'tenant_admin', label: 'Tenant Admin' },
  { value: 'super_admin', label: 'Admin' },
];

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: '',
  is_active: true,
});

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    customer: 'Customer',
    tenant_admin: 'Tenant Admin',
    super_admin: 'Super Admin',
  };
  return roleMap[role] || role;
};

const getRoleBadgeClass = (role: string) => {
  const classMap: Record<string, string> = {
    customer: 'bg-blue-100 text-blue-800',
    tenant_admin: 'bg-yellow-100 text-yellow-800',
    super_admin: 'bg-red-100 text-red-800',
  };
  return classMap[role] || 'bg-gray-200 text-gray-700';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await AdminService.getUsers(currentPage.value, perPage);
    users.value = response.data || [];
    totalPages.value = Math.ceil((response.total || 0) / perPage);
  } catch (error) {
    console.error('Error fetching users:', error);
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const isRefreshing = ref(false);

const refreshUsers = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await fetchUsers();
  } catch (err) {
    console.error('Error refreshing users:', err);
  } finally {
    isRefreshing.value = false;
  }
};

const handleSearch = () => {
  // TODO: Implement search with debounce
  console.log('Search:', searchQuery.value);
};

const filterByRole = (role: string) => {
  currentFilter.value = role;
  // TODO: Implement filter
  fetchUsers();
};

const changePage = (page: number) => {
  currentPage.value = page;
  fetchUsers();
};

const openAddModal = () => {
  isEditMode.value = false;
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: '',
    is_active: true,
  };
  formError.value = null;
  showModal.value = true;
};

const openEditModal = (user: any) => {
  isEditMode.value = true;
  editingUserId.value = user.id;
  formData.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    is_active: user.is_active,
  };
  formError.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingUserId.value = null;
};

const handleSubmit = async () => {
  submitting.value = true;
  formError.value = null;

  try {
    if (isEditMode.value && editingUserId.value) {
      const updateData: any = {
        name: formData.value.name,
        role: formData.value.role,
        is_active: formData.value.is_active,
      };
      
      await AdminService.updateUser(editingUserId.value, updateData);
      await showSuccess('User berhasil diupdate!');
    } else {
      await AdminService.createUser(formData.value);
      await showSuccess('User berhasil ditambahkan!');
    }
    closeModal();
    fetchUsers();
  } catch (error: any) {
    formError.value = error.message || 'Terjadi kesalahan';
  } finally {
    submitting.value = false;
  }
};

const toggleStatus = async (user: any) => {
  const action = user.is_active ? 'Nonaktifkan' : 'Aktifkan';
  const result = await showConfirm(
    `User ${user.name} akan ${action.toLowerCase()}.`,
    `${action} user ini?`,
    'Ya',
    'Batal'
  );
  
  if (result.isConfirmed) {
    try {
      await AdminService.updateUser(user.id, {
        name: user.name,
        role: user.role,
        is_active: !user.is_active,
      });
      await showSuccess('Status berhasil diubah!');
      fetchUsers();
    } catch (error: any) {
      showError('Gagal mengubah status: ' + error.message);
    }
  }
};

const deleteUser = async (user: any) => {
  const result = await showDeleteConfirm(
    `User ${user.name} akan dihapus secara permanen.`,
    'Hapus user ini?'
  );
  
  if (result.isConfirmed) {
    try {
      await AdminService.deleteUser(user.id);
      await showSuccess('User berhasil dihapus!');
      fetchUsers();
    } catch (error: any) {
      showError('Gagal menghapus: ' + error.message);
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
/* Minimal custom styles - using Tailwind */
</style>
