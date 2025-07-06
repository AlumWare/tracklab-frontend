<template>
  <div class="image-manager">
    <!-- Subir archivos -->
    <div class="upload-section">
      <FileUploader
        v-model="internalImages"
        :multiple="multiple"
        :accept="accept"
        :max-files="maxFiles"
        :max-size="maxSize"
        @error="handleError"
      />
      
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
          {{ $t('fileUploader.errors.tooManyFiles', { max: maxFiles }) }}
        </small>
      </div>
      
      <!-- Mensajes de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
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
import FileUploader from './file-uploader.component.vue'
import CameraCapture from './camera-capture.component.vue'

export default {
  name: 'ImageManager',
  components: {
    FileUploader,
    CameraCapture
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: true
    },
    accept: {
      type: String,
      default: 'image/*'
    },
    maxFiles: {
      type: Number,
      default: 5
    },
    maxSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB
    },
    cameraTitle: {
      type: String,
      default: 'Tomar foto'
    },
    filenamePrefix: {
      type: String,
      default: 'image'
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
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    
    const canAddMore = computed(() => {
      if (!props.multiple) return internalImages.value.length === 0
      return internalImages.value.length < props.maxFiles
    })
    
    const generateFilename = computed(() => {
      const timestamp = Date.now()
      return `${props.filenamePrefix}-${timestamp}`
    })

    // Methods
    const openCamera = () => {
      if (!canAddMore.value) {
        error.value = t('fileUploader.errors.tooManyFiles', { max: props.maxFiles })
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
        error.value = t('fileUploader.errors.tooManyFiles', { max: props.maxFiles })
        return
      }

      // Validar tamaño del archivo
      if (file.size > props.maxSize) {
        error.value = t('fileUploader.errors.fileTooBig', { maxSize: formatSize(props.maxSize) })
        return
      }

      const newImages = props.multiple 
        ? [...internalImages.value, file]
        : [file]
      
      emit('update:modelValue', newImages)
      error.value = ''
    }

    const handleCameraError = (errorMessage) => {
      error.value = errorMessage
      emit('error', errorMessage)
    }

    const handleError = (errorMessage) => {
      error.value = errorMessage
      emit('error', errorMessage)
    }

    const formatSize = (bytes) => {
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      
      return `${Math.round(size)} ${units[unitIndex]}`
    }

    return {
      showCamera,
      error,
      internalImages,
      canAddMore,
      generateFilename,
      openCamera,
      closeCamera,
      handleCameraCapture,
      handleCameraError,
      handleError
    }
  }
}
</script>

<style lang="scss" scoped>
.image-manager {
  width: 100%;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.camera-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
  
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

.error-message {
  padding: 0.75rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
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
}
</style> 