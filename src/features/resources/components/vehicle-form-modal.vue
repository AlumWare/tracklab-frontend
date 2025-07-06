<template>
  <BaseForm
    :visible="true"
    :title="isEditing ? $t('vehicle.management.edit') : $t('vehicle.management.create')"
    :submit-text="$t('vehicle.form.save')"
    :cancel-text="$t('vehicle.form.cancel')"
    :loading="loading"
    @close="$emit('cancel')"
    @submit="handleSubmit"
  >
    <template #form-fields>
      <div class="form-grid">
        <!-- Placa del vehículo -->
        <div class="form-field">
          <label class="form-label">{{ $t('vehicle.form.licensePlate') }} *</label>
          <input
            v-model="form.licensePlate"
            type="text"
            :placeholder="$t('vehicle.form.licensePlatePlaceholder')"
            class="form-input"
            :class="{ 'error': errors.licensePlate }"
            @blur="validateField('licensePlate')"
          />
          <span v-if="errors.licensePlate" class="error-text">{{ errors.licensePlate }}</span>
        </div>

        <!-- Capacidad de carga -->
        <div class="form-field">
          <label class="form-label">{{ $t('vehicle.form.loadCapacity') }} *</label>
          <input
            v-model.number="form.loadCapacity"
            type="number"
            step="0.1"
            min="0"
            :placeholder="$t('vehicle.form.loadCapacityPlaceholder')"
            class="form-input"
            :class="{ 'error': errors.loadCapacity }"
            @blur="validateField('loadCapacity')"
          />
          <span v-if="errors.loadCapacity" class="error-text">{{ errors.loadCapacity }}</span>
        </div>

        <!-- Capacidad de pasajeros -->
        <div class="form-field">
          <label class="form-label">{{ $t('vehicle.form.paxCapacity') }} *</label>
          <input
            v-model.number="form.paxCapacity"
            type="number"
            min="0"
            :placeholder="$t('vehicle.form.paxCapacityPlaceholder')"
            class="form-input"
            :class="{ 'error': errors.paxCapacity }"
            @blur="validateField('paxCapacity')"
          />
          <span v-if="errors.paxCapacity" class="error-text">{{ errors.paxCapacity }}</span>
        </div>

        <!-- Tonelaje -->
        <div class="form-field">
          <label class="form-label">{{ $t('vehicle.form.tonnage') }} *</label>
          <input
            v-model.number="form.tonnage"
            type="number"
            step="0.1"
            min="0"
            :placeholder="$t('vehicle.form.tonnagePlaceholder')"
            class="form-input"
            :class="{ 'error': errors.tonnage }"
            @blur="validateField('tonnage')"
          />
          <span v-if="errors.tonnage" class="error-text">{{ errors.tonnage }}</span>
        </div>

        <!-- Estado -->
        <div class="form-field full-width">
          <label class="form-label">{{ $t('vehicle.form.status') }} *</label>
          <select
            v-model="form.status"
            class="form-select"
            :class="{ 'error': errors.status }"
            @change="validateField('status')"
          >
            <option value="">{{ $t('vehicle.form.statusPlaceholder') }}</option>
            <option 
              v-for="status in vehicleStatuses" 
              :key="status.name" 
              :value="status.name"
            >
              {{ $t(`vehicle.status.${status.name}`) }}
            </option>
          </select>
          <span v-if="errors.status" class="error-text">{{ errors.status }}</span>
        </div>

        <!-- Nota sobre ubicación GPS -->
        <div class="full-width">
          <div class="info-box">
            <i class="fas fa-info-circle"></i>
            <span>{{ $t('vehicle.form.gpsNote') }}</span>
          </div>
        </div>

        <!-- Imágenes -->
        <div class="form-field full-width">
          <label class="form-label">{{ $t('vehicle.form.images') }}</label>
          <VehicleImageUploader
            v-model="form.images"
            :vehicle-plate="form.licensePlate"
            @error="handleImageError"
          />
          <span v-if="errors.images" class="error-text">{{ errors.images }}</span>
        </div>
      </div>
    </template>
  </BaseForm>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { VehicleStatus } from '../models/vehicle-status.enum.js'
import { CreateVehicleResource, VehicleResource } from '../models/vehicle.resource.js'
import BaseForm from '@/shared/components/base-form.component.vue'

import VehicleImageUploader from './vehicle-image-uploader.vue'

export default {
  name: 'VehicleFormModal',
  components: {
    BaseForm,
    VehicleImageUploader
  },
  props: {
    vehicle: {
      type: Object,
      default: null
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const { t } = useI18n()
    
    // State
    const loading = ref(false)
    
    const form = reactive({
      licensePlate: '',
      loadCapacity: null,
      paxCapacity: null,
      tonnage: null,
      status: '',
      images: []
    })
    
    const errors = reactive({
      licensePlate: '',
      loadCapacity: '',
      paxCapacity: '',
      tonnage: '',
      status: '',
      images: ''
    })

    // Computed
    const isEditing = computed(() => !!props.vehicle)
    const vehicleStatuses = computed(() => VehicleStatus.getAllTypes())

    // Methods
    const initializeForm = () => {
      if (props.vehicle) {
        form.licensePlate = props.vehicle.licensePlate
        form.loadCapacity = props.vehicle.loadCapacity
        form.paxCapacity = props.vehicle.paxCapacity
        form.tonnage = props.vehicle.tonnage || null
        form.status = props.vehicle.status
        form.images = []
      } else {
        // Valores por defecto para nuevo vehículo
        form.licensePlate = ''
        form.loadCapacity = null
        form.paxCapacity = null
        form.tonnage = null
        form.status = ''
        form.images = []
      }
      
      // Limpiar errores
      Object.keys(errors).forEach(key => {
        errors[key] = ''
      })
    }

    const validateField = (fieldName) => {
      errors[fieldName] = ''
      
      switch (fieldName) {
        case 'licensePlate':
          if (!form.licensePlate?.trim()) {
            errors.licensePlate = t('vehicle.form.validation.licensePlateRequired')
          }
          break
        case 'loadCapacity':
          if (form.loadCapacity === null || form.loadCapacity === undefined || form.loadCapacity <= 0) {
            errors.loadCapacity = t('vehicle.form.validation.loadCapacityRequired')
          }
          break
        case 'paxCapacity':
          if (form.paxCapacity === null || form.paxCapacity === undefined || form.paxCapacity < 0) {
            errors.paxCapacity = t('vehicle.form.validation.paxCapacityRequired')
          }
          break
        case 'tonnage':
          if (form.tonnage === null || form.tonnage === undefined || form.tonnage <= 0) {
            errors.tonnage = t('vehicle.form.validation.tonnageRequired')
          }
          break
        case 'status':
          if (!form.status) {
            errors.status = t('vehicle.form.validation.statusRequired')
          }
          break
      }
    }

    const validateForm = () => {
      const fields = ['licensePlate', 'loadCapacity', 'paxCapacity', 'tonnage', 'status']
      fields.forEach(field => validateField(field))
      
      return !Object.values(errors).some(error => error)
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      loading.value = true
      
      try {
        const vehicleData = isEditing.value 
          ? new VehicleResource(
              props.vehicle.id,
              form.licensePlate,
              form.loadCapacity,
              form.paxCapacity,
              form.status,
              0, // latitude automática
              0, // longitude automática
              []
            )
          : new CreateVehicleResource(
              form.licensePlate,
              form.loadCapacity,
              form.paxCapacity,
              0, // latitude automática
              0, // longitude automática
              form.tonnage,
              form.images
            )

        emit('save', vehicleData)
      } catch (error) {
        console.error('Error al preparar datos del vehículo:', error)
      } finally {
        loading.value = false
      }
    }

    const handleImageError = (error) => {
      errors.images = error
    }

    // Lifecycle
    onMounted(() => {
      initializeForm()
    })

    return {
      loading,
      form,
      errors,
      isEditing,
      vehicleStatuses,
      validateField,
      handleSubmit,
      handleImageError
    }
  }
}
</script>

<style lang="scss" scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  .full-width {
    grid-column: 1 / -1;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  color: #333;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4FC3F7;
    box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.2);
  }
  
  &.error {
    border-color: #f44336;
  }
  
  &::placeholder {
    color: #999;
  }
}

.error-text {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  color: #1976d2;
  font-size: 0.875rem;
  
  i {
    font-size: 1.25rem;
    flex-shrink: 0;
    color: #2196f3;
  }
  
  span {
    line-height: 1.4;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style> 