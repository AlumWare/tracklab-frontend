<template>
  <div class="vehicle-image-uploader">
    <!-- Área de subida -->
    <div class="upload-area">
      <FileUploader
        v-model="internalImages"
        :multiple="true"
        :max-files="5"
        :max-size="5 * 1024 * 1024"
        accept="image/*"
        @error="handleError"
      />
    </div>

    <!-- Botón de cámara -->
    <div class="camera-section">
      <button
        type="button"
        class="camera-btn"
        @click="openCamera"
        :disabled="!canAddMore"
      >
        <i class="fas fa-camera"></i>
        {{ $t('camera.capture') }}
      </button>
      
      <small v-if="!canAddMore" class="limit-text">
        {{ $t('fileUploader.errors.tooManyFiles', { max: 5 }) }}
      </small>
    </div>

    <!-- Vista previa de imágenes -->
    <div v-if="internalImages.length > 0" class="preview-section">
      <div class="preview-grid">
        <div
          v-for="(image, index) in internalImages"
          :key="index"
          class="preview-item"
        >
          <img
            :src="getImageUrl(image)"
            :alt="`Imagen ${index + 1}`"
            class="preview-image"
          />
          <button
            type="button"
            class="remove-btn"
            @click="removeImage(index)"
            :title="$t('fileUploader.remove')"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Componente de cámara -->
    <CameraCapture
      :is-open="showCamera"
      :title="cameraTitle"
      :filename="generateFilename"
      @capture="handleCameraCapture"
      @close="closeCamera"
      @error="handleCameraError"
    />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUploader from '@/shared/components/file-uploader.component.vue'
import CameraCapture from '@/shared/components/camera-capture.component.vue'

export default {
  name: 'VehicleImageUploader',
  components: {
    FileUploader,
    CameraCapture
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    vehiclePlate: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n()
    
    // State
    const showCamera = ref(false)
    const error = ref('')
    
    // Computed
    const internalImages = computed({
      get: () => props.modelValue || [],
      set: (value) => emit('update:modelValue', value)
    })
    
    const canAddMore = computed(() => {
      return internalImages.value.length < 5
    })
    
    const generateFilename = computed(() => {
      const timestamp = Date.now()
      const plate = props.vehiclePlate ? props.vehiclePlate.replace(/[^a-zA-Z0-9]/g, '') : 'vehicle'
      return `${plate}-${timestamp}`
    })

    const cameraTitle = computed(() => {
      return props.vehiclePlate 
        ? `Tomar foto del vehículo ${props.vehiclePlate}`
        : 'Tomar foto del vehículo'
    })

    // Methods
    const openCamera = () => {
      if (!canAddMore.value) {
        error.value = t('fileUploader.errors.tooManyFiles', { max: 5 })
        return
      }
      
      error.value = ''
      showCamera.value = true
    }

    const closeCamera = () => {
      showCamera.value = false
    }

    const handleCameraCapture = (file) => {
      if (!canAddMore.value) {
        error.value = t('fileUploader.errors.tooManyFiles', { max: 5 })
        return
      }

      const newImages = [...internalImages.value, file]
      emit('update:modelValue', newImages)
      error.value = ''
      showCamera.value = false
    }

    const handleCameraError = (errorMessage) => {
      error.value = errorMessage
      emit('error', errorMessage)
    }

    const handleError = (errorMessage) => {
      error.value = errorMessage
      emit('error', errorMessage)
    }

    const removeImage = (index) => {
      const newImages = internalImages.value.filter((_, i) => i !== index)
      emit('update:modelValue', newImages)
      error.value = ''
    }

    const getImageUrl = (image) => {
      if (typeof image === 'string') {
        return image
      }
      if (image instanceof File) {
        return URL.createObjectURL(image)
      }
      if (image.imageUrl) {
        return image.imageUrl
      }
      return ''
    }

    // Cleanup object URLs when component unmounts
    watch(() => internalImages.value, (newImages, oldImages) => {
      if (oldImages) {
        oldImages.forEach(image => {
          if (image instanceof File) {
            URL.revokeObjectURL(getImageUrl(image))
          }
        })
      }
    })

    return {
      showCamera,
      error,
      internalImages,
      canAddMore,
      generateFilename,
      cameraTitle,
      openCamera,
      closeCamera,
      handleCameraCapture,
      handleCameraError,
      handleError,
      removeImage,
      getImageUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.vehicle-image-uploader {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  width: 100%;
}

.camera-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px dashed #ddd;
  border-radius: 8px;
  background: #f8f9fa;
  
  .camera-btn {
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      background: #218838;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
    }
    
    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
    }
    
    i {
      font-size: 1.1rem;
    }
  }
  
  .limit-text {
    color: #6c757d;
    font-size: 0.875rem;
    text-align: center;
  }
}

.preview-section {
  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .preview-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #ddd;
    
    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 24px;
      height: 24px;
      background: rgba(220, 53, 69, 0.9);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      transition: all 0.2s;
      
      &:hover {
        background: #dc3545;
        transform: scale(1.1);
      }
    }
  }
}

.error-message {
  padding: 0.75rem;
  background: #ffebee;
  color: #c62828;
  border: 1px solid #f8bbd9;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

@media (max-width: 768px) {
  .camera-section {
    .camera-btn {
      width: 100%;
      justify-content: center;
    }
  }
  
  .preview-section {
    .preview-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }
  }
}
</style> 