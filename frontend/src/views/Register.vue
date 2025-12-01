<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Left Side - Branding -->
      <div class="register-brand">
        <div class="brand-content">
          <h1 class="brand-title">🏠 Kantin RK ITERA</h1>
          <p class="brand-subtitle">Bergabunglah dengan ribuan mahasiswa lainnya</p>
          
          <div class="illustration">
            <span class="emoji">🎓</span>
            <span class="emoji">🍽️</span>
            <span class="emoji">💳</span>
          </div>
        </div>
      </div>

      <!-- Right Side - Register Form -->
      <div class="register-form-section">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">Buat Akun Baru</h2>
            <p class="form-subtitle">Daftar untuk mulai memesan</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="alert alert-error">
            <span class="alert-icon">❌</span>
            <span>{{ error }}</span>
          </div>

          <!-- Register Form -->
          <form @submit.prevent="handleSubmit" class="register-form">
            <!-- Name Field -->
            <div class="form-group">
              <label for="name" class="form-label">Nama Lengkap</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="John Doe"
                required
                :disabled="loading"
              />
            </div>

            <!-- Email Field -->
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="nama@email.com"
                required
                :disabled="loading"
              />
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="form-input"
                placeholder="Minimal 8 karakter"
                required
                minlength="8"
                :disabled="loading"
              />
            </div>

            <!-- Confirm Password Field -->
            <div class="form-group">
              <label for="password_confirmation" class="form-label">
                Konfirmasi Password
              </label>
              <input
                id="password_confirmation"
                v-model="formData.password_confirmation"
                type="password"
                class="form-input"
                placeholder="Ulangi password"
                required
                :disabled="loading"
              />
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="btn-submit"
              :disabled="loading"
            >
              <span v-if="loading" class="btn-spinner">⟳</span>
              <span v-else>Daftar Sekarang</span>
            </button>
          </form>

          <!-- Login Link -->
          <div class="form-footer">
            <p>
              Sudah punya akun? 
              <router-link to="/login" class="link-login">
                Masuk di sini
              </router-link>
            </p>
          </div>

          <!-- Back to Home -->
          <div class="back-home">
            <router-link to="/" class="link-home">
              ← Kembali ke Home
            </router-link>
          </div>
        </div>
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
/* Reuse similar styles from Login.vue */
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-container {
  max-width: 1000px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-brand {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  text-align: center;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.illustration {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.illustration .emoji {
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
}

.illustration .emoji:nth-child(2) {
  animation-delay: 0.5s;
}

.illustration .emoji:nth-child(3) {
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.register-form-section {
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 90vh;
  overflow-y: auto;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #718096;
  font-size: 0.95rem;
}

.alert {
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: shake 0.5s;
}

.alert-error {
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #fc8181;
}

.alert-icon {
  font-size: 1.2rem;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.register-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-input::placeholder {
  color: #a0aec0;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  text-align: center;
  color: #718096;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.link-login {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.link-login:hover {
  color: #5568d3;
  text-decoration: underline;
}

.back-home {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.link-home {
  color: #718096;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.link-home:hover {
  color: #667eea;
}

@media (max-width: 768px) {
  .register-container {
    grid-template-columns: 1fr;
  }

  .register-brand {
    display: none;
  }

  .register-form-section {
    padding: 2rem 1.5rem;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }
}
</style>



