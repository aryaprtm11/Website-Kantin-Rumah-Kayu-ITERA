<template>
  <div class="dashboard-layout">
    <Sidebar :menuItems="ADMIN_MENU_ITEMS" />
    
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Kelola Kantin</h1>
          <p class="dashboard-subtitle">Manajemen semua kantin di sistem</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" @click="fetchTenants">
            🔄 Refresh
          </button>
          <button class="btn-primary" @click="openAddModal">
            ➕ Tambah Kantin
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
              placeholder="Cari kantin..."
              @input="handleSearch"
            />
          </div>
          <div class="filter-buttons">
            <button
              v-for="status in statusFilters"
              :key="status.value"
              :class="['filter-btn', { active: currentFilter === status.value }]"
              @click="filterByStatus(status.value)"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <!-- Tenants Table -->
        <div class="section-card">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Memuat data...</p>
          </div>

          <div v-else-if="tenants.length === 0" class="empty-state">
            <p>Tidak ada data kantin</p>
          </div>

          <div v-else>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Kantin</th>
                    <th>Pemilik</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Jam Operasional</th>
                    <th>Menu</th>
                    <th>Pesanan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tenant in tenants" :key="tenant.id">
                    <td>#{{ tenant.id }}</td>
                    <td class="tenant-name">
                      <div class="tenant-info">
                        <strong>{{ tenant.name }}</strong>
                        <small>{{ tenant.location || '-' }}</small>
                      </div>
                    </td>
                    <td>{{ tenant.user?.name || '-' }}</td>
                    <td>{{ tenant.user?.email || '-' }}</td>
                    <td>
                      <span :class="['badge', tenant.is_active ? 'badge-success' : 'badge-danger']">
                        {{ tenant.is_active ? '🟢 Aktif' : '🔴 Nonaktif' }}
                      </span>
                    </td>
                    <td>
                      <div class="time-range">
                        {{ tenant.opens_at }} - {{ tenant.closes_at }}
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-info">{{ tenant.menus_count || 0 }}</span>
                    </td>
                    <td>
                      <span class="badge badge-secondary">{{ tenant.orders_count || 0 }}</span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn-action btn-edit" @click="openEditModal(tenant)" title="Edit">
                          ✏️
                        </button>
                        <button 
                          :class="['btn-action', tenant.is_active ? 'btn-deactivate' : 'btn-activate']" 
                          @click="toggleStatus(tenant)"
                          :title="tenant.is_active ? 'Nonaktifkan' : 'Aktifkan'"
                        >
                          {{ tenant.is_active ? '🔒' : '🔓' }}
                        </button>
                        <button class="btn-action btn-delete" @click="deleteTenant(tenant)" title="Hapus">
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

    <!-- Modal Add/Edit Tenant -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit Kantin' : 'Tambah Kantin Baru' }}</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Nama Kantin *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="Contoh: Warung Nusantara"
            />
          </div>

          <div class="form-group">
            <label for="location">Lokasi</label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              placeholder="Contoh: Gedung A Lantai 1"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="opens_at">Jam Buka *</label>
              <input
                id="opens_at"
                v-model="formData.opens_at"
                type="time"
                required
              />
            </div>

            <div class="form-group">
              <label for="closes_at">Jam Tutup *</label>
              <input
                id="closes_at"
                v-model="formData.closes_at"
                type="time"
                required
              />
            </div>
          </div>

          <div class="form-group" v-if="!isEditMode">
            <label for="user_id">Pemilik (User ID) *</label>
            <input
              id="user_id"
              v-model="formData.user_id"
              type="number"
              required
              placeholder="ID user yang akan menjadi pemilik"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="formData.is_active"
                type="checkbox"
              />
              <span>Kantin Aktif</span>
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
import { ref, onMounted } from 'vue';
import Sidebar from '../../components/dashboard/Sidebar.vue';
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

.tenant-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tenant-info strong {
  font-weight: 600;
}

.tenant-info small {
  color: #718096;
  font-size: 0.8rem;
}

.time-range {
  font-size: 0.875rem;
  color: #4a5568;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>