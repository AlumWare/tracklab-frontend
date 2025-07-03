<template>
  <div class="register-company-container">
    <div class="register-company-header">
      <h1>{{ t('registerCompany.title') }}</h1>
      <p class="subtitle">{{ t('registerCompany.subtitle') }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="register-company-form">
      <!-- Tipo de Empresa -->
      <div class="form-group">
        <label for="companyType">{{ t('registerCompany.companyType') }}</label>
        <div class="company-type-selector">
          <button
            type="button"
            :class="['type-option', { active: formData.companyType === 'client' }]"
            @click="formData.companyType = 'client'"
          >
            <i class="pi pi-building"></i>
            <span>{{ t('registerCompany.client') }}</span>
          </button>
          <button
            type="button"
            :class="['type-option', { active: formData.companyType === 'logistics' }]"
            @click="formData.companyType = 'logistics'"
          >
            <i class="pi pi-truck"></i>
            <span>{{ t('registerCompany.logistics') }}</span>
          </button>
        </div>
        <small class="help-text">{{ t('registerCompany.companyTypeHelp') }}</small>
      </div>

      <!-- Nombre de la Empresa -->
      <div class="form-group">
        <label for="companyName">{{ t('registerCompany.companyName') }}</label>
        <div class="input-wrapper">
          <i class="pi pi-building input-icon"></i>
          <input
            id="companyName"
            v-model="formData.companyName"
            type="text"
            :class="{ 'error': errors.companyName }"
            :placeholder="t('registerCompany.companyNamePlaceholder')"
            @input="validateCompanyName"
          />
        </div>
        <small v-if="errors.companyName" class="error-text">{{ errors.companyName }}</small>
        <small v-else class="help-text">{{ t('registerCompany.companyNameHelp') }}</small>
      </div>

      <!-- RUC -->
      <div class="form-group">
        <label for="ruc">{{ t('registerCompany.ruc') }}</label>
        <div class="input-wrapper">
          <i class="pi pi-id-card input-icon"></i>
          <input
            id="ruc"
            v-model="formData.ruc"
            type="text"
            :class="{ 'error': errors.ruc }"
            :placeholder="t('registerCompany.rucPlaceholder')"
            @input="validateRUC"
          />
          <i v-if="rucStatus === 'checking'" class="pi pi-spin pi-spinner status-icon"></i>
          <i v-else-if="rucStatus === 'valid'" class="pi pi-check status-icon valid"></i>
          <i v-else-if="rucStatus === 'invalid'" class="pi pi-times status-icon invalid"></i>
        </div>
        <small v-if="errors.ruc" class="error-text">{{ errors.ruc }}</small>
        <small v-else class="help-text">{{ t('registerCompany.rucHelp') }}</small>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email">{{ t('registerCompany.email') }}</label>
        <div class="input-wrapper">
          <i class="pi pi-envelope input-icon"></i>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            :class="{ 'error': errors.email }"
            :placeholder="t('registerCompany.emailPlaceholder')"
            @input="validateEmail"
          />
          <i v-if="emailStatus === 'checking'" class="pi pi-spin pi-spinner status-icon"></i>
          <i v-else-if="emailStatus === 'valid'" class="pi pi-check status-icon valid"></i>
          <i v-else-if="emailStatus === 'invalid'" class="pi pi-times status-icon invalid"></i>
        </div>
        <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
        <small v-else class="help-text">{{ t('registerCompany.emailHelp') }}</small>
      </div>

      <!-- Teléfono -->
      <div class="form-group">
        <label for="phone">{{ t('registerCompany.phone') }}</label>
        <div class="input-wrapper">
          <i class="pi pi-phone input-icon"></i>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            :class="{ 'error': errors.phone }"
            :placeholder="t('registerCompany.phonePlaceholder')"
            @input="validatePhone"
          />
        </div>
        <small v-if="errors.phone" class="error-text">{{ errors.phone }}</small>
        <small v-else class="help-text">{{ t('registerCompany.phoneHelp') }}</small>
      </div>

      <!-- Dirección -->
      <div class="form-group">
        <label for="address">{{ t('registerCompany.address') }}</label>
        <div class="input-wrapper">
          <i class="pi pi-map-marker input-icon"></i>
          <input
            id="address"
            v-model="formData.address"
            type="text"
            :class="{ 'error': errors.address }"
            :placeholder="t('registerCompany.addressPlaceholder')"
            @input="validateAddress"
          />
        </div>
        <small v-if="errors.address" class="error-text">{{ errors.address }}</small>
        <small v-else class="help-text">{{ t('registerCompany.addressHelp') }}</small>
      </div>

      <!-- Botón de Registro -->
      <button
        type="submit"
        class="submit-button"
        :disabled="!isFormValid || isSubmitting"
      >
        <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
        <span v-else>{{ t('registerCompany.submitButton') }}</span>
      </button>

      <div class="form-footer">
        <p>{{ t('registerCompany.alreadyHaveAccount') }} <a href="#" @click.prevent="$router.push('/auth/login')">{{ t('registerCompany.login') }}</a></p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'RegisterCompanyView'
})

const router = useRouter()
const { t } = useI18n()

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
    errors.companyName = t('registerCompany.validation.companyNameRequired')
  } else if (formData.companyName.length < 3) {
    errors.companyName = t('registerCompany.validation.companyNameMinLength')
  } else {
    errors.companyName = ''
  }
}

const validateRUC = async () => {
  if (!formData.ruc) {
    errors.ruc = t('registerCompany.validation.rucRequired')
    rucStatus.value = ''
  } else if (!/^\d{11}$/.test(formData.ruc)) {
    errors.ruc = t('registerCompany.validation.rucInvalid')
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
        errors.ruc = t('registerCompany.validation.rucExists')
        rucStatus.value = 'invalid'
      }
    } catch (error) {
      console.error(error)
      errors.ruc = t('registerCompany.validation.rucError')
      rucStatus.value = 'invalid'
    }
  }
}

const validateEmail = async () => {
  if (!formData.email) {
    errors.email = t('registerCompany.validation.emailRequired')
    emailStatus.value = ''
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('registerCompany.validation.emailInvalid')
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
        errors.email = t('registerCompany.validation.emailExists')
        emailStatus.value = 'invalid'
      }
    } catch (error) {
      console.error(error)
      errors.email = t('registerCompany.validation.emailError')
      emailStatus.value = 'invalid'
    }
  }
}

const validatePhone = () => {
  if (!formData.phone) {
    errors.phone = t('registerCompany.validation.phoneRequired')
  } else if (!/^\d{9}$/.test(formData.phone)) {
    errors.phone = t('registerCompany.validation.phoneInvalid')
  } else {
    errors.phone = ''
  }
}

const validateAddress = () => {
  if (!formData.address) {
    errors.address = t('registerCompany.validation.addressRequired')
  } else if (formData.address.length < 10) {
    errors.address = t('registerCompany.validation.addressMinLength')
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
    router.push('/auth/login') // Redirección después del registro exitoso
  } catch (error) {
    console.error('Error al registrar la empresa:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.register-company-container {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
}

.register-company-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-company-header h1 {
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

.register-company-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #666;
}

.status-icon {
  position: absolute;
  right: 1rem;
  color: #666;
}

.status-icon.valid {
  color: #4caf50;
}

.status-icon.invalid {
  color: #f44336;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.input-wrapper input:focus {
  outline: none;
  border-color: #4bb0fa;
  box-shadow: 0 0 0 3px rgba(75, 176, 250, 0.1);
}

.input-wrapper input.error {
  border-color: #f44336;
}

.company-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.type-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-option:hover {
  border-color: #4bb0fa;
  background: rgba(75, 176, 250, 0.05);
}

.type-option.active {
  border-color: #4bb0fa;
  background: #4bb0fa;
  color: white;
}

.type-option.active i {
  color: white;
}

.help-text {
  color: #666;
  font-size: 0.85rem;
}

.error-text {
  color: #f44336;
  font-size: 0.85rem;
}

.submit-button {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #4bb0fa;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #2196f3;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

@media (max-width: 640px) {
  .register-company-container {
    padding: 1.5rem;
  }

  .company-type-selector {
    grid-template-columns: 1fr;
  }

  .register-company-header h1 {
    font-size: 1.75rem;
  }
}
</style>
