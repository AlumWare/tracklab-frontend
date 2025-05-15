<script>
import logo from '@/assets/logo.svg'
import { useI18n } from 'vue-i18n'

export default {
  name: 'LoginView',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      email: '',
      password: '',
      logo
    }
  },
  methods: {
    handleLogin() {
      console.log('Intentando login con:', {
        email: this.email,
        password: this.password
      })
    },
    handleSubmit() {
      if (this.password.length > 3) {
        this.$router.push('/tracklab/logistics-home');
      } else {
        this.$router.push('/tracklab/client-home');
      }
    }
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-header">
      <img :src="logo" alt="TrackLab Logo" class="login-logo" />
      <h1 class="login-brand">{{ t('login.title') }}</h1>
      <p class="login-slogan">{{ t('login.slogan') }}</p>
    </div>

    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label class="form-label" for="email">{{ t('login.email') }}</label>
        <div class="input-wrapper">
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            :placeholder="t('login.emailPlaceholder')"
            autocomplete="username"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">{{ t('login.password') }}</label>
        <div class="input-wrapper">
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            :placeholder="t('login.passwordPlaceholder')"
            autocomplete="current-password"
            required
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" @click="handleSubmit">
          {{ t('login.loginButton') }}
        </button>
      </div>

      <div class="form-links">
        <button type="button" class="btn btn-secondary" @click="$router.push('/auth/register-company')">
          {{ t('login.registerCompany') }}
        </button>
        <button type="button" class="btn btn-secondary" @click="$router.push('/auth/register-user')">
          {{ t('login.registerUser') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-logo {
  width: 80px;
  height: auto;
  margin-bottom: 1rem;
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
  margin-top: 0.5rem;
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
  padding: 0.75rem 1rem;
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

.form-actions {
  margin-top: 1rem;
}

.btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #4bb0fa;
  color: white;
}

.btn-primary:hover {
  background: #2196f3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #4bb0fa;
  border: 2px solid #4bb0fa;
  margin-top: 0.5rem;
}

.btn-secondary:hover {
  background: rgba(75, 176, 250, 0.1);
  transform: translateY(-1px);
}

.form-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
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
