<template>
  <div class="flex min-h-screen bg-white">
    <Sidebar :menuItems="ADMIN_MENU_ITEMS" />
    
    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Profil Saya</h1>
          <p class="text-sm text-gray-500">Kelola informasi profil Anda</p>
        </div>
      </div>

      <div class="max-w-4xl">
        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <!-- Profile Info Card -->
          <div class="bg-white rounded-lg p-5 border border-gray-200">
            <div class="flex flex-col items-center text-center mb-5 pb-5 border-b border-gray-100">
              <div class="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold mb-3">
                {{ userName.charAt(0).toUpperCase() }}
              </div>
              <h2 class="text-base font-semibold text-gray-900 mb-1">{{ userName }}</h2>
              <p class="inline-block px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">Administrator</p>
            </div>

            <!-- Account Stats -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 text-xs font-medium">Total Tenant</span>
                <span class="text-gray-900 font-semibold text-sm">{{ accountStats.totalTenants }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 text-xs font-medium">Member Sejak</span>
                <span class="text-gray-900 font-semibold text-xs">{{ formatDate(accountStats.memberSince) }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Edit Profile Form -->
            <div class="bg-white rounded-lg p-5 border border-gray-200">
              <h3 class="text-base font-semibold text-gray-900 mb-4">Informasi Akun</h3>
              <form @submit.prevent="updateProfile">
                <div class="mb-4">
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input
                    id="name"
                    v-model="profileForm.name"
                    type="text"
                    required
                    :disabled="loadingProfile"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div class="mb-4">
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    disabled
                    title="Email tidak dapat diubah"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  class="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="loadingProfile || !isProfileChanged"
                >
                  {{ loadingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>

                <div v-if="profileMessage" :class="['mt-3 px-3 py-2 rounded-lg text-xs border', profileMessageType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200']">
                  {{ profileMessage }}
                </div>
              </form>
            </div>

            <!-- Change Password Form -->
            <div class="bg-white rounded-lg p-5 border border-gray-200">
              <h3 class="text-base font-semibold text-gray-900 mb-4">Ganti Password</h3>
              <form @submit.prevent="changePassword">
                <div class="mb-4">
                  <label for="current_password" class="block text-sm font-medium text-gray-700 mb-1.5">Password Saat Ini</label>
                  <input
                    id="current_password"
                    v-model="passwordForm.current_password"
                    type="password"
                    required
                    :disabled="loadingPassword"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div class="mb-4">
                  <label for="new_password" class="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                  <input
                  id="new_password"
                  v-model="passwordForm.new_password"
                  type="password"
                  required
                  minlength="8"
                  :disabled="loadingPassword"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div class="mb-4">
                <label for="new_password_confirmation" class="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
                <input
                  id="new_password_confirmation"
                  v-model="passwordForm.new_password_confirmation"
                  type="password"
                  required
                  minlength="8"
                  :disabled="loadingPassword"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="loadingPassword"
              >
                {{ loadingPassword ? 'Mengubah...' : 'Ganti Password' }}
              </button>

              <div v-if="passwordMessage" :class="['mt-3 px-3 py-2 rounded-lg text-xs border', passwordMessageType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200']">
                {{ passwordMessage }}
              </div>
            </form>
          </div>
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
import { ADMIN_MENU_ITEMS } from '../../constants/menuItems';

const { currentUser } = useAuth();

const userName = computed(() => currentUser.value?.name || 'User');

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

const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
});

const loadingPassword = ref(false);
const passwordMessage = ref('');
const passwordMessageType = ref<'success' | 'error'>('success');

const accountStats = ref({
  totalTenants: 0,
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
    accountStats.value = {
      totalTenants: 8,
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
/* Minimal custom styles - using Tailwind */
</style>
