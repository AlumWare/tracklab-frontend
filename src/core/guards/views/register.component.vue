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
      console.log(this.name)
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

      console.log(this.name);
      console.log(this.email);
      console.log(this.password);
      console.log(this.password_confirmation);

      if (Object.keys(this.errors).length === 0) {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          alert('Formulario válido. ¡Enviado!')
        }, 1500)
      }
    }
  }
}
</script>

<template>
  <div class="register-container">
    <div>
      <img src="" alt="tdv no hay" class="img-placeholder" />
    </div>
    <div class="info-container">
      <h2>Ingrese sus datos</h2>
      <div class="inputs-container">
        <div class="field">
          <p>Nombre</p>
          <InputField v-model="name" placeholder="Ingrese su nombre" />
          <small v-if="errors.name" class="error">{{ errors.name }}</small>
        </div>
        <div class="field">
          <p>Email</p>
          <InputField v-model="email" placeholder="Ingrese su email" />
          <small v-if="errors.email" class="error">{{ errors.email }}</small>
        </div>
        <div class="field">
          <p>Contraseña</p>
          <InputField v-model="password" placeholder="Ingrese su contraseña" type="password" />
          <small v-if="errors.password" class="error">{{ errors.password }}</small>
        </div>
        <div class="field">
          <p>Repita la contraseña</p>
          <InputField v-model="password_confirmation" placeholder="Repita su contraseña" type="password" />
          <small v-if="errors.password_confirmation" class="error">{{ errors.password_confirmation }}</small>
        </div>
      </div>
      <div class="button">
        <BaseButton
          label="Enviar"
          color="info"
          :disabled="false"
          :loading="loading"
          @click="$router.push('/login')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5rem;
  padding: 2rem;
  min-height: 100vh;
  background-color: #f5f7fa;
  flex-wrap: wrap;
}

.img-placeholder {
  width: 320px;
  height: 320px;
  background-color: #e0e0e0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #666;
}

.info-container {
  background-color: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.info-container h2 {
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  font-weight: bold;
  color: #222;
  text-align: center;
}

.inputs-container .field {
  margin-bottom: 1.4rem;
}

.field p {
  margin: 0 0 6px;
  font-weight: 600;
  color: #333;
}

small.error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 5px;
  display: inline-block;
}

.button {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
    padding: 1.5rem;
    gap: 2rem;
  }

  .img-placeholder {
    width: 240px;
    height: 240px;
  }
}
</style>
