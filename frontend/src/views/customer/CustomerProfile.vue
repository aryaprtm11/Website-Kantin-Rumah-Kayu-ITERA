<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar :menuItems="CUSTOMER_MENU_ITEMS" />
    
    <main class="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">
      <div class="mb-8">
        <div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Profil Saya</h1>
          <p class="text-gray-600">Kelola informasi profil Anda</p>
        </div>
      </div>

      <div class="max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          <!-- Profile Info Card -->
          <div class="bg-white rounded-xl p-6 shadow-md">
            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div class="w-15 h-15 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {{ userName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900 mb-1">{{ userName }}</h2>
                <p class="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium">Customer</p>
              </div>
            </div>

            <!-- Account Stats -->
            <div class="flex flex-col gap-3">
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-600 font-medium text-sm">Total Pesanan</span>
                <span class="text-gray-900 font-semibold text-sm">{{ accountStats.totalOrders }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-gray-600 font-medium text-sm">Member Sejak</span>
                <span class="text-gray-900 font-semibold text-sm">{{ formatDate(accountStats.memberSince) }}</span>
              </div>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <div class="bg-white rounded-xl p-6 shadow-md">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h3>
            <form @submit.prevent="updateProfile">
              <div class="mb-4">
                <label for="name" class="block font-medium text-gray-700 mb-2 text-sm">Nama Lengkap</label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  required
                  :disabled="loadingProfile"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div class="mb-4">
                <label for="email" class="block font-medium text-gray-700 mb-2 text-sm">Email</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  disabled
                  title="Email tidak dapat diubah"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                class="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                :disabled="loadingProfile || !isProfileChanged"
              >
                {{ loadingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>

              <div v-if="profileMessage" :class="['mt-3 px-3.5 py-2.5 rounded-lg text-xs', profileMessageType === 'success' ? 'bg-green-100 text-green-900 border border-green-200' : 'bg-red-100 text-red-900 border border-red-200']">
                {{ profileMessage }}
              </div>
            </form>
          </div>

          <!-- Change Password Form -->
          <div class="bg-white rounded-xl p-6 shadow-md">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Ganti Password</h3>
            <form @submit.prevent="changePassword">
              <div class="mb-4">
                <label for="current_password" class="block font-medium text-gray-700 mb-2 text-sm">Password Saat Ini</label>
                <input
                  id="current_password"
                  v-model="passwordForm.current_password"
                  type="password"
                  required
                  :disabled="loadingPassword"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div class="mb-4">
                <label for="new_password" class="block font-medium text-gray-700 mb-2 text-sm">Password Baru</label>
                <input
                  id="new_password"
                  v-model="passwordForm.new_password"
                  type="password"
                  required
                  minlength="8"
                  :disabled="loadingPassword"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div class="mb-4">
                <label for="new_password_confirmation" class="block font-medium text-gray-700 mb-2 text-sm">Konfirmasi Password</label>
                <input
                  id="new_password_confirmation"
                  v-model="passwordForm.new_password_confirmation"
                  type="password"
                  required
                  minlength="8"
                  :disabled="loadingPassword"
                  class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-green-600 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                class="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                :disabled="loadingPassword"
              >
                {{ loadingPassword ? 'Mengubah...' : 'Ganti Password' }}
              </button>

              <div v-if="passwordMessage" :class="['mt-3 px-3.5 py-2.5 rounded-lg text-xs', passwordMessageType === 'success' ? 'bg-green-100 text-green-900 border border-green-200' : 'bg-red-100 text-red-900 border border-red-200']">
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
/* Minimal custom styles - using Tailwind */
</style>
