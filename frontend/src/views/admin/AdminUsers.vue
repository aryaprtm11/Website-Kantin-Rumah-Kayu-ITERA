<template>
  <div class="dashboard-layout">
    <Sidebar :menuItems="ADMIN_MENU_ITEMS" />
    
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Kelola User</h1>
          <p class="dashboard-subtitle">Manajemen pengguna sistem</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" @click="fetchUsers">
            🔄 Refresh
          </button>
          <button class="btn-primary" @click="openAddModal">
            ➕ Tambah User
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Search & Filter -->
        <div class="filter-section">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari user (nama/email)..."
              @input="handleSearch"
            />
          </div>
          <div class="filter-buttons">
            <button
              v-for="role in roleFilters"
              :key="role.value"
              :class="['filter-btn', { active: currentFilter === role.value }]"
              @click="filterByRole(role.value)"
            >
              {{ role.label }}
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="section-card">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Memuat data...</p>
          </div>

          <div v-else-if="users.length === 0" class="empty-state">
            <p>Tidak ada data user</p>
          </div>

          <div v-else>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Terdaftar</th>
                    <th>Kantin</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>#{{ user.id }}</td>
                    <td class="user-name">
                      <div class="user-info">
                        <div class="user-avatar">
                          {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                        <strong>{{ user.name }}</strong>
                      </div>
                    </td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span :class="['badge', getRoleBadgeClass(user.role)]">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td>
                      <span :class="['badge', user.is_active ? 'badge-success' : 'badge-danger']">
                        {{ user.is_active ? '🟢 Aktif' : '🔴 Nonaktif' }}
                      </span>
                    </td>
                    <td class="datetime">{{ formatDate(user.created_at) }}</td>
                    <td>
                      <span v-if="user.tenant" class="badge badge-info">
                        {{ user.tenant.name }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn-action btn-edit" @click="openEditModal(user)" title="Edit">
                          ✏️
                        </button>
                        <button 
                          v-if="user.id !== currentUserId"
                          :class="['btn-action', user.is_active ? 'btn-deactivate' : 'btn-activate']" 
                          @click="toggleStatus(user)"
                          :title="user.is_active ? 'Nonaktifkan' : 'Aktifkan'"
                        >
                          {{ user.is_active ? '🔒' : '🔓' }}
                        </button>
                        <button 
                          v-if="user.id !== currentUserId"
                          class="btn-action btn-delete" 
                          @click="deleteUser(user)" 
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="pagination">
              <button 
                class="btn-page" 
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
              >
                ← Prev
              </button>
              <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button 
                class="btn-page" 
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
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit User' : 'Tambah User Baru' }}</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Nama Lengkap *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="Contoh: John Doe"
            />
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              :disabled="isEditMode"
              placeholder="user@example.com"
            />
          </div>

          <div class="form-group" v-if="!isEditMode">
            <label for="password">Password *</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              minlength="8"
              placeholder="Min. 8 karakter"
            />
          </div>

          <div class="form-group">
            <label for="role">Role *</label>
            <select id="role" v-model="formData.role" required>
              <option value="">Pilih Role</option>
              <option value="customer">Customer</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="formData.is_active"
                type="checkbox"
              />
              <span>User Aktif</span>
            </label>
          </div>

          <div v-if="formError" class="error-message">
            {{ formError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">
              Batal
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
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
    customer: 'badge-info',
    tenant_admin: 'badge-warning',
    super_admin: 'badge-danger',
  };
  return classMap[role] || 'badge-secondary';
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
/* Copy all styles from AdminTenant.vue */
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-refresh {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh:hover {
  background: #f7fafc;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
}

.data-table tr:hover {
  background: #f7fafc;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-info strong {
  font-weight: 600;
}

.datetime {
  font-size: 0.875rem;
  color: #718096;
}

.text-muted {
  color: #a0aec0;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.badge-success {
  background: #c6f6d5;
  color: #22543d;
}

.badge-danger {
  background: #fed7d7;
  color: #742a2a;
}

.badge-warning {
  background: #fef5e7;
  color: #975a16;
}

.badge-info {
  background: #bee3f8;
  color: #2c5282;
}

.badge-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-edit {
  background: #bee3f8;
}

.btn-edit:hover {
  background: #90cdf4;
}

.btn-activate {
  background: #c6f6d5;
}

.btn-activate:hover {
  background: #9ae6b4;
}

.btn-deactivate {
  background: #fed7d7;
}

.btn-deactivate:hover {
  background: #fc8181;
}

.btn-delete {
  background: #fed7d7;
}

.btn-delete:hover {
  background: #fc8181;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-page {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #4a5568;
  font-weight: 500;
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
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.btn-close:hover {
  background: #f7fafc;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.error-message {
  padding: 0.75rem;
  background: #fed7d7;
  color: #742a2a;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #f7fafc;
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: 1rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }
}
</style>