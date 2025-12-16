<template>
  <div class="dashboard-layout">
    <Sidebar :menuItems="CUSTOMER_MENU_ITEMS" />
    
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Profil Saya</h1>
          <p class="dashboard-subtitle">Kelola informasi profil Anda</p>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="profile-grid">
          <!-- Profile Info Card -->
          <div class="profile-card">
            <div class="profile-header">
              <div class="profile-avatar">
                {{ userName.charAt(0).toUpperCase() }}
              </div>
              <div class="profile-info">
                <h2>{{ userName }}</h2>
                <p class="role-badge">Customer</p>
              </div>
            </div>

            <!-- Account Stats -->
            <div class="stats-compact">
              <div class="stat-item">
                <span class="stat-label">Total Pesanan</span>
                <span class="stat-value">{{ accountStats.totalOrders }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Member Sejak</span>
                <span class="stat-value">{{ formatDate(accountStats.memberSince) }}</span>
              </div>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <div class="profile-card">
            <h3 class="form-title">Informasi Akun</h3>
            <form @submit.prevent="updateProfile">
              <div class="form-group">
                <label for="name">Nama Lengkap</label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  required
                  :disabled="loadingProfile"
                />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  disabled
                  title="Email tidak dapat diubah"
                />
              </div>

              <button
                type="submit"
                class="btn-primary"
                :disabled="loadingProfile || !isProfileChanged"
              >
                {{ loadingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>

              <div v-if="profileMessage" :class="['message', profileMessageType]">
                {{ profileMessage }}
              </div>
            </form>
          </div>

          <!-- Change Password Form -->
          <div class="profile-card">
            <h3 class="form-title">Ganti Password</h3>
            <form @submit.prevent="changePassword">
              <div class="form-group">
                <label for="current_password">Password Saat Ini</label>
                <input
                  id="current_password"
                  v-model="passwordForm.current_password"
                  type="password"
                  required
                  :disabled="loadingPassword"
                />
              </div>

              <div class="form-group">
                <label for="new_password">Password Baru</label>
                <input
                  id="new_password"
                  v-model="passwordForm.new_password"
                  type="password"
                  required
                  minlength="8"
                  :disabled="loadingPassword"
                />
              </div>

              <div class="form-group">
                <label for="new_password_confirmation">Konfirmasi Password</label>
                <input
                  id="new_password_confirmation"
                  v-model="passwordForm.new_password_confirmation"
                  type="password"
                  required
                  minlength="8"
                  :disabled="loadingPassword"
                />
              </div>

              <button
                type="submit"
                class="btn-primary"
                :disabled="loadingPassword"
              >
                {{ loadingPassword ? 'Mengubah...' : 'Ganti Password' }}
              </button>

              <div v-if="passwordMessage" :class="['message', passwordMessageType]">
                {{ passwordMessage }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import Sidebar from '../../components/dashboard/Sidebar.vue';
import { CUSTOMER_MENU_ITEMS } from '../../constants/menuItems';

const { currentUser } = useAuth();

const userName = computed(() => currentUser.value?.name || 'User');

// Profile Form
const profileForm = ref({
  name: '',
  email: '',
});

const loadingProfile = ref(false);
const profileMessage = ref('');
const profileMessageType = ref<'success' | 'error'>('success');

const isProfileChanged = computed(() => {
  return profileForm.value.name !== currentUser.value?.name;
});

// Password Form
const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
});

const loadingPassword = ref(false);
const passwordMessage = ref('');
const passwordMessageType = ref<'success' | 'error'>('success');

// Account Stats
const accountStats = ref({
  totalOrders: 0,
  memberSince: new Date().toISOString(),
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const updateProfile = async () => {
  loadingProfile.value = true;
  profileMessage.value = '';

  try {
    // TODO: API call ke backend
    // await CustomerService.updateProfile(profileForm.value);
    
    // Mock success
    setTimeout(() => {
      profileMessage.value = 'Profil berhasil diperbarui!';
      profileMessageType.value = 'success';
      loadingProfile.value = false;
    }, 1000);
  } catch (error: any) {
    profileMessage.value = error.message || 'Gagal memperbarui profil';
    profileMessageType.value = 'error';
    loadingProfile.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    passwordMessage.value = 'Konfirmasi password tidak cocok';
    passwordMessageType.value = 'error';
    return;
  }

  loadingPassword.value = true;
  passwordMessage.value = '';

  try {
    // TODO: API call ke backend
    // await CustomerService.changePassword(passwordForm.value);
    
    // Mock success
    setTimeout(() => {
      passwordMessage.value = 'Password berhasil diubah!';
      passwordMessageType.value = 'success';
      passwordForm.value = {
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      };
      loadingPassword.value = false;
    }, 1000);
  } catch (error: any) {
    passwordMessage.value = error.message || 'Gagal mengubah password';
    passwordMessageType.value = 'error';
    loadingPassword.value = false;
  }
};

const fetchAccountStats = async () => {
  try {
    // TODO: API call ke backend
    // const stats = await CustomerService.getAccountStats();
    
    // Mock data
    accountStats.value = {
      totalOrders: 15,
      memberSince: currentUser.value?.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch account stats:', error);
  }
};

onMounted(() => {
  if (currentUser.value) {
    profileForm.value = {
      name: currentUser.value.name || '',
      email: currentUser.value.email || '',
    };
  }
  fetchAccountStats();
});
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.dashboard-main {
  flex: 1;
  padding: 2rem;
  margin-left: 280px;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  color: #718096;
  font-size: 1rem;
}

.dashboard-content {
  max-width: 1400px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.profile-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-info h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #edf2f7;
  color: #4a5568;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.stats-compact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: #f7fafc;
  border-radius: 8px;
}

.stat-label {
  color: #718096;
  font-weight: 500;
  font-size: 0.875rem;
}

.stat-value {
  color: #1a202c;
  font-weight: 600;
  font-size: 0.875rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
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

.form-group input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #22c55e;
}

.form-group input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.btn-primary {
  width: 100%;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.message.success {
  background-color: #c6f6d5;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.message.error {
  background-color: #fed7d7;
  color: #742a2a;
  border: 1px solid #fc8181;
}

@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 90px;
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
