<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-8">
    <div class="w-full max-w-7xl min-h-[600px] grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] bg-white rounded-3xl overflow-hidden shadow-2xl">
      <!-- Left Side - Register Form -->
      <div class="px-8 py-12 lg:px-16 flex items-center justify-center bg-white">
        <div class="w-full max-w-md">
          <!-- Logo -->
          <div class="mb-10">
            <img src="/logo.png" alt="Kantin RK" class="w-12 h-12 object-contain" />
          </div>

          <!-- Form Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2 leading-tight">Buat Akun Baru</h1>
            <p class="text-[15px] text-gray-600 leading-relaxed">Daftar untuk mulai memesan makanan favorit Anda</p>
          </div>

          <!-- Error Message -->
          <Message v-if="error" severity="error" :closable="false" class="mb-6">
            {{ error }}
          </Message>

          <!-- Register Form -->
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
            <!-- Name Field -->
            <div class="flex flex-col gap-2">
              <label for="name" class="text-sm font-semibold text-gray-700">Nama Lengkap</label>
              <InputText
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="John Doe"
                :disabled="loading"
              />
            </div>

            <!-- Email Field -->
            <div class="flex flex-col gap-2">
              <label for="email" class="text-sm font-semibold text-gray-700">Email</label>
              <InputText
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="nama@email.com"
                :disabled="loading"
              />
            </div>

            <!-- Password Field -->
            <div class="flex flex-col gap-2">
              <label for="password" class="text-sm font-semibold text-gray-700">Password</label>
              <Password
                id="password"
                v-model="formData.password"
                placeholder="Minimal 8 karakter"
                :disabled="loading"
                :feedback="false"
                toggleMask
                inputClass="w-full"
              />
            </div>

            <!-- Confirm Password Field -->
            <div class="flex flex-col gap-2">
              <label for="password_confirmation" class="text-sm font-semibold text-gray-700">Konfirmasi Password</label>
              <Password
                id="password_confirmation"
                v-model="formData.password_confirmation"
                placeholder="Ulangi password"
                :disabled="loading"
                :feedback="false"
                toggleMask
                inputClass="w-full"
              />
            </div>

            <!-- Submit Button -->
            <Button 
              type="submit" 
              label="Daftar Sekarang"
              :loading="loading"
              class="w-full !bg-primary-500 hover:!bg-primary-600 !border-primary-500 !py-3.5 !rounded-lg !font-semibold !text-[15px] mt-2 transition-all"
            />
          </form>

          <!-- Login Link -->
          <div class="text-center mt-6">
            <p class="text-sm text-gray-600">
              Sudah punya akun? 
              <router-link to="/login" class="text-primary-500 hover:text-primary-600 font-semibold hover:underline transition-colors">
                Masuk di sini
              </router-link>
            </p>
          </div>
        </div>
      </div>

      <!-- Right Side - Image -->
      <div class="relative overflow-hidden bg-gray-100 hidden lg:block">
        <img src="/image.png" alt="Kantin RK ITERA" class="w-full h-full object-cover object-center" />
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Register Page Component
 * User registration page
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import type { RegisterData } from '../services/authService';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const { register, loading, error, clearError } = useAuth();

// Form data
const formData = ref<RegisterData>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
});

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  clearError();

  // Validate password match
  if (formData.value.password !== formData.value.password_confirmation) {
    error.value = 'Password dan konfirmasi password tidak cocok';
    return;
  }

  try {
    await register(formData.value);
    
    // After registration, redirect to home (customer role)
    router.push('/');
  } catch (err) {
    // Error already handled in composable
    console.error('Registration failed:', err);
  }
};
</script>

<style scoped>
:deep(.p-inputtext) {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg text-[15px] transition-all;
}

:deep(.p-inputtext:enabled:hover) {
  @apply border-gray-400;
}

:deep(.p-inputtext:enabled:focus) {
  @apply border-primary-500 ring-4 ring-primary-500/10;
}

:deep(.p-password) {
  @apply w-full;
  display: flex !important;
}

:deep(.p-password-input) {
  @apply w-full flex-1;
}

:deep(.p-password .p-inputtext) {
  @apply w-full pr-10;
}
</style>



