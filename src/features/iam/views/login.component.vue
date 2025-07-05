<template>
  <div class="login-container">
    <div class="login-header">
      <div class="logo-section">
        <img src="@/assets/logo.svg" alt="TrackLab Logo" class="login-logo" />
        <h1 class="login-brand">TrackLab</h1>
        <p class="login-slogan">{{ $t('login.slogan') }}</p>
      </div>
    </div>

    <form @submit.prevent="handleLogin" class="login-form">
      <!-- Error message -->
      <div v-if="errorMessage" class="error-alert">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="success-alert">
        <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <!-- Username field -->
      <div class="form-group">
        <label class="form-label" for="username">{{ $t('login.username') }}</label>
        <div class="input-wrapper">
          <input
            id="username"
            v-model="formData.username"
            type="text"
            class="form-input"
            :placeholder="$t('login.usernamePlaceholder')"
            :class="{ 'error': fieldErrors.username }"
            :disabled="isLoading"
            required
          />
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <small v-if="fieldErrors.username" class="error-message">{{ fieldErrors.username }}</small>
      </div>

      <!-- Password field -->
      <div class="form-group">
        <label class="form-label" for="password">{{ $t('login.password') }}</label>
        <div class="input-wrapper">
          <input
            id="password"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :placeholder="$t('login.passwordPlaceholder')"
            :class="{ 'error': fieldErrors.password }"
            :disabled="isLoading"
            required
          />
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <button
            type="button"
            class="password-toggle"
            @click="togglePasswordVisibility"
            :disabled="isLoading"
          >
            <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l13.88 13.88z"></path>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.65-6.65z"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
        <small v-if="fieldErrors.password" class="error-message">{{ fieldErrors.password }}</small>
      </div>

      <!-- Remember me checkbox -->
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="formData.rememberMe"
            class="checkbox-input"
            :disabled="isLoading"
          />
          <span class="checkbox-custom"></span>
          {{ $t('login.rememberMe') }}
        </label>
      </div>

      <!-- Submit button -->
      <div class="form-actions">
        <BaseButton
          type="submit"
          :label="$t('login.loginButton')"
          color="primary"
          :loading="isLoading"
          :disabled="!isFormValid"
          class="login-button"
        />
      </div>

      <!-- Register links -->
      <div class="form-links">
        <p class="register-text">{{ $t('login.noAccount') }}</p>
        <BaseButton
          type="button"
          :label="$t('login.registerButton')"
          color="secondary"
          @click="$router.push('/auth/register')"
          :disabled="isLoading"
          class="register-button"
        />
      </div>

      <!-- Login link -->
      <div class="login-link">
        <p>{{ $t('register.hasAccount') }} 
          <button 
            type="button" 
            class="link-button"
            @click="$router.push('/auth/login')"
          >
            {{ $t('register.loginLink') }}
          </button>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import BaseButton from '@/shared/components/BaseButton.vue';
import { AuthService } from '../services/auth.service';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';

export default {
  name: 'LoginView',
  components: {
    BaseButton
  },
  setup() {
    const { t } = useI18n();
    const authStore = useAuthStore();
    return { t, authStore };
  },
  data() {
    return {
      formData: {
        username: '',
        password: '',
        rememberMe: false
      },
      showPassword: false,
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      fieldErrors: {}
    };
  },
  computed: {
    isFormValid() {
      return (
        this.formData.username.trim().length > 0 &&
        this.formData.password.length > 0
      );
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    validateForm() {
      this.fieldErrors = {};
      let isValid = true;

      if (!this.formData.username.trim()) {
        this.fieldErrors.username = this.$t('login.errors.usernameRequired');
        isValid = false;
      } else if (this.formData.username.length < 3) {
        this.fieldErrors.username = this.$t('login.errors.usernameMinLength');
        isValid = false;
      }

      if (!this.formData.password) {
        this.fieldErrors.password = this.$t('login.errors.passwordRequired');
        isValid = false;
      } else if (this.formData.password.length < 6) {
        this.fieldErrors.password = this.$t('login.errors.passwordMinLength');
        isValid = false;
      }

      return isValid;
    },

    async handleLogin() {
      this.clearMessages();

      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      try {
        await this.authStore.login(
          this.formData.username,
          this.formData.password
        );

        this.successMessage = this.$t('login.success');

      } catch (error) {
        this.handleLoginError(error);
      } finally {
        this.isLoading = false;
      }
    },

    handleLoginError(error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            this.errorMessage = this.$t('login.errors.invalidCredentials');
            break;
          case 403:
            this.errorMessage = this.$t('login.errors.accountBlocked');
            break;
          case 404:
            this.errorMessage = 'Endpoint no encontrado. Verifica que el backend esté corriendo.';
            break;
          case 429:
            this.errorMessage = this.$t('login.errors.tooManyAttempts');
            break;
          case 500:
            this.errorMessage = this.$t('login.errors.serverError');
            break;
          default:
            this.errorMessage = data?.message || this.$t('login.errors.generic');
        }
      } else if (error.request) {
        this.errorMessage = this.$t('login.errors.networkError');
      } else {
        this.errorMessage = this.$t('login.errors.generic');
      }
    },

    clearMessages() {
      this.errorMessage = '';
      this.successMessage = '';
      this.fieldErrors = {};
    }
  },

  mounted() {
    // Initialize auth store
    this.authStore.initializeAuth();
    
    // Check if user is already authenticated
    if (this.authStore.isUserAuthenticated) {
      const redirectTo = this.$route.query.redirect || '/home';
      this.$router.push(redirectTo);
    }
  }
};
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.login-logo {
  width: 80px;
  height: auto;
}

.login-brand {
  font-size: 2.5rem;
  color: #4bb0fa;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.login-slogan {
  color: #666;
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4bb0fa;
  box-shadow: 0 0 0 3px rgba(75, 176, 250, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.form-input.error {
  border-color: #e74c3c;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.2rem;
  height: 1.2rem;
  color: #666;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  width: 1.2rem;
  height: 1.2rem;
  color: #666;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #4bb0fa;
}

.password-toggle svg {
  width: 100%;
  height: 100%;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #4bb0fa;
  border-color: #4bb0fa;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.error-alert,
.success-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.error-alert {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.success-alert {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.error-icon,
.success-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.form-links {
  text-align: center;
  margin-top: 1.5rem;
}

.register-text {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.register-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem;
  }

  .login-brand {
    font-size: 2rem;
  }

  .login-slogan {
    font-size: 0.9rem;
  }
}
</style>
