<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left Side - Branding -->
      <div class="login-brand">
        <div class="brand-content">
          <h1 class="brand-title">
            <Home :size="40" class="title-icon" />
            Kantin RK ITERA
          </h1>
          <p class="brand-subtitle">Sistem Pemesanan Makanan & Minuman</p>
          
          <div class="features">
            <div class="feature-item">
              <Sparkles :size="24" class="feature-icon" />
              <span class="feature-text">Pesan dengan mudah</span>
            </div>
            <div class="feature-item">
              <Zap :size="24" class="feature-icon" />
              <span class="feature-text">Proses cepat</span>
            </div>
            <div class="feature-item">
              <Target :size="24" class="feature-icon" />
              <span class="feature-text">Banyak pilihan menu</span>
            </div>
          </div>

          <div class="illustration">
            <Soup :size="64" class="emoji" />
            <Sandwich :size="64" class="emoji" />
            <Coffee :size="64" class="emoji" />
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="login-form-section">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">Selamat Datang</h2>
            <p class="form-subtitle">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="alert alert-error">
            <XCircle :size="20" class="alert-icon" />
            <span>{{ error }}</span>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleSubmit" class="login-form">
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
                placeholder="Masukkan password"
                required
                :disabled="loading"
              />
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="rememberMe" />
                <span>Ingat saya</span>
              </label>
              <a href="#" class="link-forgot">Lupa password?</a>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="btn-submit"
              :disabled="loading"
            >
              <Loader2 v-if="loading" :size="20" class="btn-spinner" />
              <span v-else>Masuk</span>
            </button>
          </form>

          <!-- Register Link -->
          <div class="form-footer">
            <p>
              Belum punya akun? 
              <router-link to="/register" class="link-register">
                Daftar sekarang
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
 * Login Page Component
 * User authentication page with email and password
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { AuthService, type LoginCredentials } from '../services/authService';
import { getRoleValue } from '../utils/roleHelper';
import { Home, Sparkles, Zap, Target, Soup, Sandwich, Coffee, XCircle, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const { login, loading, error, clearError } = useAuth();

// Form data
const formData = ref<LoginCredentials>({
  email: '',
  password: '',
});

const rememberMe = ref(false);

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  clearError();

  try {
    await login(formData.value);
    
    // Redirect based on user role
    const user = AuthService.getUser();
    const userRole = user ? getRoleValue(user.role) : '';
    
    if (userRole === 'superadmin') {
      router.push('/admin/dashboard');
    } else if (userRole === 'tenant_admin') {
      router.push('/tenant/dashboard');
    } else if (userRole === 'customer') {
      router.push('/customer/dashboard');
    } else {
      router.push('/');
    }
  } catch (err) {
    // Error already handled in composable
    console.error('Login failed:', err);
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
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

/* Left Side - Branding */
.login-brand {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.title-icon {
  flex-shrink: 0;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.features {
  margin-bottom: 3rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.feature-icon {
  flex-shrink: 0;
}

.feature-text {
  opacity: 0.95;
}

.illustration {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.illustration .emoji {
  font-size: 3rem;
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

/* Right Side - Form */
.login-form-section {
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Alert */
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
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

/* Form */
.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
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

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #4a5568;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.link-forgot {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.link-forgot:hover {
  color: #5568d3;
  text-decoration: underline;
}

/* Submit Button */
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

/* Form Footer */
.form-footer {
  text-align: center;
  color: #718096;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.link-register {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.link-register:hover {
  color: #5568d3;
  text-decoration: underline;
}

/* Back to Home */
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

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-brand {
    display: none;
  }

  .login-form-section {
    padding: 2rem 1.5rem;
  }

  .form-title {
    font-size: 1.75rem;
  }
}
</style>



