<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left Side - Login Form -->
      <div class="login-form-section">
        <div class="form-wrapper">
          <!-- Logo -->
          <div class="logo-section">
            <img src="/logo.png" alt="Kantin RK" class="logo" />
          </div>

          <!-- Form Header -->
          <div class="form-header">
            <h1 class="form-title">Selamat Datang Kembali!</h1>
            <p class="form-subtitle">Masukkan detail Anda di bawah untuk melanjutkan</p>
          </div>

          <!-- Error Message -->
          <Message v-if="error" severity="error" :closable="false" class="error-message">
            {{ error }}
          </Message>

          <!-- Login Form -->
          <form @submit.prevent="handleSubmit" class="login-form">
            <!-- Email Field -->
            <div class="form-field">
              <label for="email">Email</label>
              <InputText
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="nama@email.com"
                :disabled="loading"
              />
            </div>

            <!-- Password Field -->
            <div class="form-field">
              <label for="password">Password</label>
              <Password
                id="password"
                v-model="formData.password"
                placeholder="••••••••"
                :disabled="loading"
                :feedback="false"
                toggleMask
              />
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="form-options">
              <div class="checkbox-wrapper">
                <Checkbox v-model="rememberMe" inputId="remember" :binary="true" />
                <label for="remember">Ingat saya</label>
              </div>
              <a href="#" class="link-forgot">Lupa password?</a>
            </div>

            <!-- Submit Button -->
            <Button 
              type="submit" 
              label="Masuk"
              :loading="loading"
              class="btn-submit"
            />
          </form>

          <!-- Register Link -->
          <div class="form-footer">
            <p>
              Belum punya akun? 
              <router-link to="/register" class="link-register">
                Daftar
              </router-link>
            </p>
          </div>
        </div>
      </div>

      <!-- Right Side - Image -->
      <div class="login-image-section">
        <img src="/image.png" alt="Kantin RK ITERA" class="kantin-image" />
        <div class="image-overlay"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { AuthService, type LoginCredentials } from '../services/authService';
import { getRoleValue } from '../utils/roleHelper';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';

const router = useRouter();
const { login, loading, error, clearError } = useAuth();

const formData = ref<LoginCredentials>({
  email: '',
  password: '',
});

const rememberMe = ref(false);

const handleSubmit = async () => {
  clearError();

  try {
    await login(formData.value);
    
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
  background: #f5f5f5;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 1400px;
  height: auto;
  min-height: 600px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* Left Side - Login Form */
.login-form-section {
  padding: 3rem 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
}

.logo-section {
  margin-bottom: 2.5rem;
}

.logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.form-header {
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.form-subtitle {
  font-size: 0.9375rem;
  color: #737373;
  margin: 0;
  line-height: 1.5;
}

.error-message {
  margin-bottom: 1.5rem;
}

/* Login Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #404040;
}

:deep(.p-inputtext) {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

:deep(.p-inputtext:enabled:hover) {
  border-color: #a3a3a3;
}

:deep(.p-inputtext:enabled:focus) {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-inputtext) {
  width: 100%;
  padding-right: 2.5rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.25rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-wrapper label {
  font-size: 0.875rem;
  color: #525252;
  cursor: pointer;
  font-weight: 500;
}

.link-forgot {
  font-size: 0.875rem;
  color: #525252;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.link-forgot:hover {
  color: #22c55e;
}

.btn-submit {
  width: 100%;
  padding: 0.875rem;
  background: #22c55e;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background: #16a34a;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.form-footer p {
  font-size: 0.875rem;
  color: #525252;
  margin: 0;
}

.link-register {
  color: #22c55e;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.link-register:hover {
  color: #16a34a;
  text-decoration: underline;
}

/* Right Side - Image Section */
.login-image-section {
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.kantin-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.05) 100%
  );
  pointer-events: none;
}

/* Responsive */
@media (max-width: 968px) {
  .login-page {
    padding: 1rem;
  }

  .login-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .login-image-section {
    display: none;
  }

  .login-form-section {
    padding: 2rem;
  }

  .form-wrapper {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0;
  }

  .login-container {
    border-radius: 0;
    box-shadow: none;
  }

  .login-form-section {
    padding: 1.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-subtitle {
    font-size: 0.875rem;
  }
}
</style>
