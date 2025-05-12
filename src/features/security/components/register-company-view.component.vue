<template>
  <div class="register-company-container">
    <div class="register-company-card">
      <div class="register-company-header">
        <h1>Registro de Empresa</h1>
        <p class="subtitle">Complete los datos de su empresa para comenzar</p>
      </div>

      <form @submit.prevent="handleSubmit" class="register-company-form">
        <!-- Tipo de Empresa -->
        <div class="form-group">
          <label for="companyType">Tipo de Empresa</label>
          <div class="company-type-selector">
            <button
              type="button"
              :class="['type-option', { active: formData.companyType === 'client' }]"
              @click="formData.companyType = 'client'"
            >
              <i class="pi pi-building"></i>
              <span>Cliente</span>
            </button>
            <button
              type="button"
              :class="['type-option', { active: formData.companyType === 'logistics' }]"
              @click="formData.companyType = 'logistics'"
            >
              <i class="pi pi-truck"></i>
              <span>Logística</span>
            </button>
          </div>
          <small class="help-text">Seleccione el tipo de empresa que desea registrar</small>
        </div>

        <!-- Nombre de la Empresa -->
        <div class="form-group">
          <label for="companyName">Nombre de la Empresa</label>
          <div class="input-wrapper">
            <i class="pi pi-building input-icon"></i>
            <input
              id="companyName"
              v-model="formData.companyName"
              type="text"
              :class="{ 'error': errors.companyName }"
              placeholder="Ingrese el nombre de su empresa"
              @input="validateCompanyName"
            />
          </div>
          <small v-if="errors.companyName" class="error-text">{{ errors.companyName }}</small>
          <small v-else class="help-text">Ingrese el nombre legal de su empresa</small>
        </div>

        <!-- RUC -->
        <div class="form-group">
          <label for="ruc">RUC</label>
          <div class="input-wrapper">
            <i class="pi pi-id-card input-icon"></i>
            <input
              id="ruc"
              v-model="formData.ruc"
              type="text"
              :class="{ 'error': errors.ruc }"
              placeholder="Ingrese el RUC de su empresa"
              @input="validateRUC"
            />
            <i v-if="rucStatus === 'checking'" class="pi pi-spin pi-spinner status-icon"></i>
            <i v-else-if="rucStatus === 'valid'" class="pi pi-check status-icon valid"></i>
            <i v-else-if="rucStatus === 'invalid'" class="pi pi-times status-icon invalid"></i>
          </div>
          <small v-if="errors.ruc" class="error-text">{{ errors.ruc }}</small>
          <small v-else class="help-text">Ingrese el número de RUC de su empresa (11 dígitos)</small>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <div class="input-wrapper">
            <i class="pi pi-envelope input-icon"></i>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              :class="{ 'error': errors.email }"
              placeholder="Ingrese el correo electrónico"
              @input="validateEmail"
            />
            <i v-if="emailStatus === 'checking'" class="pi pi-spin pi-spinner status-icon"></i>
            <i v-else-if="emailStatus === 'valid'" class="pi pi-check status-icon valid"></i>
            <i v-else-if="emailStatus === 'invalid'" class="pi pi-times status-icon invalid"></i>
          </div>
          <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
          <small v-else class="help-text">Ingrese el correo electrónico corporativo</small>
        </div>

        <!-- Teléfono -->
        <div class="form-group">
          <label for="phone">Teléfono</label>
          <div class="input-wrapper">
            <i class="pi pi-phone input-icon"></i>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              :class="{ 'error': errors.phone }"
              placeholder="Ingrese el número de teléfono"
              @input="validatePhone"
            />
          </div>
          <small v-if="errors.phone" class="error-text">{{ errors.phone }}</small>
          <small v-else class="help-text">Ingrese el número de teléfono de contacto</small>
        </div>

        <!-- Dirección -->
        <div class="form-group">
          <label for="address">Dirección</label>
          <div class="input-wrapper">
            <i class="pi pi-map-marker input-icon"></i>
            <input
              id="address"
              v-model="formData.address"
              type="text"
              :class="{ 'error': errors.address }"
              placeholder="Ingrese la dirección de su empresa"
              @input="validateAddress"
            />
          </div>
          <small v-if="errors.address" class="error-text">{{ errors.address }}</small>
          <small v-else class="help-text">Ingrese la dirección legal de su empresa</small>
        </div>

        <!-- Botón de Registro -->
        <button
          type="submit"
          class="submit-button"
          :disabled="!isFormValid || isSubmitting"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
          <span v-else>Registrar Empresa</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'RegisterCompanyView'
})
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Estado del formulario
const formData = reactive({
  companyType: '',
  companyName: '',
  ruc: '',
  email: '',
  phone: '',
  address: ''
})

// Estado de validación
const errors = reactive({
  companyType: '',
  companyName: '',
  ruc: '',
  email: '',
  phone: '',
  address: ''
})

// Estado de validación en tiempo real
const rucStatus = ref('')
const emailStatus = ref('')
const isSubmitting = ref(false)

// Validaciones
const validateCompanyName = () => {
  if (!formData.companyName) {
    errors.companyName = 'El nombre de la empresa es requerido'
  } else if (formData.companyName.length < 3) {
    errors.companyName = 'El nombre debe tener al menos 3 caracteres'
  } else {
    errors.companyName = ''
  }
}

const validateRUC = async () => {
  if (!formData.ruc) {
    errors.ruc = 'El RUC es requerido'
    rucStatus.value = ''
  } else if (!/^\d{11}$/.test(formData.ruc)) {
    errors.ruc = 'El RUC debe tener 11 dígitos'
    rucStatus.value = 'invalid'
  } else {
    rucStatus.value = 'checking'
    try {
      // Aquí iría la llamada a la API para validar el RUC
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación de llamada API
      const isValid = true // Simulación de respuesta
      if (isValid) {
        errors.ruc = ''
        rucStatus.value = 'valid'
      } else {
        errors.ruc = 'Este RUC ya está registrado'
        rucStatus.value = 'invalid'
      }
    } catch (error) {
  console.error(error)
  errors.ruc = 'Error al validar el RUC'  // o `errors.email = ...`
  rucStatus.value = 'invalid'             // o `emailStatus.value = ...`
}
  }
}

const validateEmail = async () => {
  if (!formData.email) {
    errors.email = 'El correo electrónico es requerido'
    emailStatus.value = ''
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Ingrese un correo electrónico válido'
    emailStatus.value = 'invalid'
  } else {
    emailStatus.value = 'checking'
    try {
      // Aquí iría la llamada a la API para validar el email
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación de llamada API
      const isValid = true // Simulación de respuesta
      if (isValid) {
        errors.email = ''
        emailStatus.value = 'valid'
      } else {
        errors.email = 'Este correo ya está registrado'
        emailStatus.value = 'invalid'
      }
    } catch (error) {
  console.error(error)
  errors.ruc = 'Error al validar el RUC'  // o `errors.email = ...`
  rucStatus.value = 'invalid'             // o `emailStatus.value = ...`
}
  }
}

const validatePhone = () => {
  if (!formData.phone) {
    errors.phone = 'El teléfono es requerido'
  } else if (!/^\d{9}$/.test(formData.phone)) {
    errors.phone = 'Ingrese un número de teléfono válido (9 dígitos)'
  } else {
    errors.phone = ''
  }
}

const validateAddress = () => {
  if (!formData.address) {
    errors.address = 'La dirección es requerida'
  } else if (formData.address.length < 10) {
    errors.address = 'La dirección debe tener al menos 10 caracteres'
  } else {
    errors.address = ''
  }
}

// Validación general del formulario
const isFormValid = computed(() => {
  return !Object.values(errors).some(error => error) &&
         Object.values(formData).every(value => value) &&
         rucStatus.value === 'valid' &&
         emailStatus.value === 'valid'
})

// Manejo del envío del formulario
const handleSubmit = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  try {
    // Aquí iría la llamada a la API para registrar la empresa
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulación de llamada API
    router.push('/login') // Redirección después del registro exitoso
  } catch (error) {
    console.error('Error al registrar la empresa:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.register-company-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

.register-company-card {
  background: var(--background);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-company-header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    color: var(--text-primary);
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
  }
}

.register-company-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.95rem;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .input-icon {
    position: absolute;
    left: 1rem;
    color: var(--text-secondary);
  }

  .status-icon {
    position: absolute;
    right: 1rem;
    color: var(--text-secondary);

    &.valid {
      color: var(--success);
    }

    &.invalid {
      color: var(--error);
    }
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid var(--secondary);
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: var(--surface);

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
    }

    &.error {
      border-color: var(--error);
    }
  }
}

.company-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;

  .type-option {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid var(--secondary);
    border-radius: 12px;
    background: var(--surface);
    cursor: pointer;
    transition: all 0.3s ease;

    i {
      font-size: 1.25rem;
      color: var(--text-secondary);
    }

    &:hover {
      border-color: var(--primary);
      background: rgba(var(--primary-rgb), 0.05);
    }

    &.active {
      border-color: var(--primary);
      background: var(--primary);
      color: var(--text-inverted);

      i {
        color: var(--text-inverted);
      }
    }
  }
}

.help-text {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.error-text {
  color: var(--error);
  font-size: 0.85rem;
}

.submit-button {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--primary);
  color: var(--text-inverted);
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  i {
    font-size: 1.25rem;
  }
}

@media (max-width: 640px) {
  .register-company-container {
    padding: 1rem;
  }

  .register-company-card {
    padding: 1.5rem;
  }

  .company-type-selector {
    grid-template-columns: 1fr;
  }
}
</style>
