<script>
import InputField from '@/shared/components/input.component.vue'
import BaseButton from '@/shared/components/BaseButton.vue'

export default {
  name: 'Register-User',
  components: {
    InputField,
    BaseButton
  },
  data() {
    return {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      errors: {},
      loading: false
    }
  },
  computed: {
    formIsValid() {
      return (
        this.name.trim().length > 0 &&
        this.email.includes('@') &&
        this.password.length >= 6 &&
        this.password === this.password_confirmation
      )
    }
  },
  methods: {
    validateForm() {
      this.errors = {}

      if (!this.name.trim()) this.errors.name = 'El nombre es obligatorio'
      if (!this.email.includes('@')) this.errors.email = 'Correo inválido'
      if (this.password.length < 6) this.errors.password = 'Mínimo 6 caracteres'
      if (this.password !== this.password_confirmation) this.errors.password_confirmation = 'Las contraseñas no coinciden'

      if (Object.keys(this.errors).length === 0) {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.$router.push('/auth/login')
        }, 1500)
      }
    }
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-header">
      <h2>Crear Cuenta</h2>
      <p class="subtitle">Únete a TrackLab y comienza a gestionar tu logística</p>
    </div>

    <form @submit.prevent="validateForm" class="register-form">
      <div class="form-group">
        <label class="form-label" for="name">Nombre</label>
        <InputField
          id="name"
          v-model="name"
          placeholder="Ingrese su nombre"
          :class="{ 'error': errors.name }"
        />
        <small v-if="errors.name" class="error-message">{{ errors.name }}</small>
      </div>

      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <InputField
          id="email"
          v-model="email"
          placeholder="Ingrese su email"
          :class="{ 'error': errors.email }"
        />
        <small v-if="errors.email" class="error-message">{{ errors.email }}</small>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Contraseña</label>
        <InputField
          id="password"
          v-model="password"
          type="password"
          placeholder="Ingrese su contraseña"
          :class="{ 'error': errors.password }"
        />
        <small v-if="errors.password" class="error-message">{{ errors.password }}</small>
      </div>

      <div class="form-group">
        <label class="form-label" for="password_confirmation">Confirmar Contraseña</label>
        <InputField
          id="password_confirmation"
          v-model="password_confirmation"
          type="password"
          placeholder="Repita su contraseña"
          :class="{ 'error': errors.password_confirmation }"
        />
        <small v-if="errors.password_confirmation" class="error-message">{{ errors.password_confirmation }}</small>
      </div>

      <div class="form-actions">
        <BaseButton
          type="submit"
          label="Crear Cuenta"
          color="primary"
          :disabled="!formIsValid"
          :loading="loading"
          class="submit-button"
        />
      </div>

      <div class="form-footer">
        <p>¿Ya tienes una cuenta? <a href="#" @click.prevent="$router.push('/auth/login')">Iniciar Sesión</a></p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-container {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.register-form {
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

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 1rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.form-footer a {
  color: #4bb0fa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.form-footer a:hover {
  color: #2196f3;
}

/* Estilos para el estado de error en los inputs */
:deep(.error) {
  border-color: #e74c3c !important;
}

:deep(.error:focus) {
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1) !important;
}

@media (max-width: 480px) {
  .register-container {
    padding: 1.5rem;
  }

  .register-header h2 {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }
}
</style>
