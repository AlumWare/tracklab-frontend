<script>
import logo from '@/assets/logo.svg'
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      logo
    }
  },
  methods: {
    handleLogin() {
      // Aquí irá la lógica de autenticación
      console.log('Intentando login con:', {
        email: this.email,
        password: this.password
      })
    },
    handleSubmit() {
      if (this.password.length > 3) {
        this.$router.push('/logistics-home');
      } else {
        this.$router.push('/client-home');
      }
    }
  }
}
</script>

<template>
  <div class="login-main-container">
    <div class="login-left">
      <img :src="logo" alt="TrackLab Logo" class="login-logo" />
      <h1 class="login-brand">TrackLab</h1>
      <p class="login-slogan">Trazabilidad logística en tiempo real</p>
    </div>
    <div class="login-right">
      <div class="login-form-container">
        <h2 class="login-title">TrackLab</h2>
        <form @submit.prevent="handleLogin" class="login-form">
          <label class="login-label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="login-input"
            placeholder="Email"
            autocomplete="username"
            required
          />
          <label class="login-label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="login-input"
            placeholder="Password"
            autocomplete="current-password"
            required
          />
          <button type="submit" class="login-btn" @click="handleSubmit">Sign In</button>
          <button type="submit" class="login-btn" @click="$router.push('/subscription-plan')">Register company</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-main-container {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding-right: 2rem;
  background: #fff;
}

.login-logo {
  width: 90px;
  margin-bottom: 1.5rem;
}

.login-brand {
  font-size: 3rem;
  color: #4bb0fa;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.login-slogan {
  color: #4bb0fa;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.login-right {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: #fff;
}

.login-form-container {
  width: 100%;
  max-width: 350px;
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.login-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  text-align: left;
  text-decoration: underline;
  color: #000;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-label {
  font-size: 1rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.2rem;
}

.login-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  background: #f9f9f9;
  color: #222;
}

.login-input:focus {
  outline: none;
  border-color: #4bb0fa;
}

.login-btn {
  width: 100%;
  padding: 10px 0;
  background: #4bb0fa;
  color: #111;
  font-weight: 600;
  border: 1.5px solid #222;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s, color 0.2s;
}

.login-btn:hover {
  background: #2196f3;
  color: #fff;
}

@media (max-width: 900px) {
  .login-main-container {
    flex-direction: column;
  }
  .login-left, .login-right {
    flex: unset;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
  }
  .login-form-container {
    margin-left: 0;
    align-items: center;
  }
  .login-title {
    text-align: center;
  }
}
</style>
