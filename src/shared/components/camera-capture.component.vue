<template>
  <div v-if="isOpen" class="camera-modal">
    <div class="camera-container">
      <div class="camera-header">
        <h3>{{ title }}</h3>
        <button @click="close" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="camera-content">
        <video 
          ref="videoElement" 
          autoplay 
          playsinline 
          class="camera-video"
          :class="{ 'mirror': facingMode === 'user' }"
        ></video>
        <canvas ref="canvasElement" style="display: none;"></canvas>
        
        <div class="camera-controls">
          <button 
            v-if="supportsFacingMode" 
            @click="switchCamera" 
            class="switch-btn"
            :title="$t('camera.switchCamera')"
          >
            <i class="fas fa-sync-alt"></i>
          </button>
          
          <button @click="capturePhoto" class="capture-btn">
            <i class="fas fa-camera"></i>
            {{ $t('camera.capture') }}
          </button>
          
          <button @click="close" class="cancel-btn">
            {{ $t('camera.cancel') }}
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'CameraCapture',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Tomar foto'
    },
    quality: {
      type: Number,
      default: 0.8,
      validator: (value) => value >= 0.1 && value <= 1.0
    },
    format: {
      type: String,
      default: 'image/jpeg',
      validator: (value) => ['image/jpeg', 'image/png', 'image/webp'].includes(value)
    },
    filename: {
      type: String,
      default: null
    }
  },
  emits: ['capture', 'close', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n()
    
    // Refs
    const videoElement = ref(null)
    const canvasElement = ref(null)
    const mediaStream = ref(null)
    
    // State
    const error = ref('')
    const facingMode = ref('environment') // 'user' para frontal, 'environment' para trasera
    const supportsFacingMode = ref(false)

    // Methods
    const startCamera = async () => {
      try {
        error.value = ''
        
        // Verificar soporte para cámaras
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(t('camera.errors.notSupported'))
        }

        // Obtener dispositivos de video disponibles
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        supportsFacingMode.value = videoDevices.length > 1

        const constraints = {
          video: {
            facingMode: facingMode.value,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        }

        mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints)
        
        if (videoElement.value) {
          videoElement.value.srcObject = mediaStream.value
        }
      } catch (err) {
        console.error('Error accediendo a la cámara:', err)
        let errorMessage = t('camera.errors.accessDenied')
        
        if (err.name === 'NotFoundError') {
          errorMessage = t('camera.errors.noCamera')
        } else if (err.name === 'NotAllowedError') {
          errorMessage = t('camera.errors.permissionDenied')
        } else if (err.name === 'NotSupportedError') {
          errorMessage = t('camera.errors.notSupported')
        }
        
        error.value = errorMessage
        emit('error', errorMessage)
      }
    }

    const stopCamera = () => {
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop())
        mediaStream.value = null
      }
    }

    const switchCamera = async () => {
      facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
      stopCamera()
      await startCamera()
    }

    const capturePhoto = () => {
      if (!videoElement.value || !canvasElement.value) {
        error.value = t('camera.errors.captureError')
        return
      }

      try {
        const video = videoElement.value
        const canvas = canvasElement.value
        const context = canvas.getContext('2d')

        // Ajustar el canvas al tamaño del video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Si es cámara frontal, voltear horizontalmente
        if (facingMode.value === 'user') {
          context.scale(-1, 1)
          context.drawImage(video, -canvas.width, 0)
        } else {
          context.drawImage(video, 0, 0)
        }

        canvas.toBlob((blob) => {
          if (!blob) {
            error.value = t('camera.errors.captureError')
            return
          }

          const timestamp = Date.now()
          const filename = props.filename || `photo-${timestamp}`
          const file = new File([blob], `${filename}.jpg`, {
            type: props.format,
            lastModified: timestamp
          })
          
          emit('capture', file)
          close()
        }, props.format, props.quality)
      } catch (err) {
        console.error('Error capturando foto:', err)
        error.value = t('camera.errors.captureError')
        emit('error', error.value)
      }
    }

    const close = () => {
      stopCamera()
      error.value = ''
      emit('close')
    }

    // Watchers
    watch(() => props.isOpen, (newValue) => {
      if (newValue) {
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(startCamera, 100)
      } else {
        stopCamera()
      }
    })

    // Lifecycle
    onUnmounted(() => {
      stopCamera()
    })

    return {
      videoElement,
      canvasElement,
      error,
      facingMode,
      supportsFacingMode,
      startCamera,
      stopCamera,
      switchCamera,
      capturePhoto,
      close
    }
  }
}
</script>

<style lang="scss" scoped>
.camera-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.camera-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.camera-header {
  padding: 1.5rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  
  h3 {
    margin: 0;
    color: #212529;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s;
    
    &:hover {
      color: #495057;
      background: #e9ecef;
    }
  }
}

.camera-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background: #fff;
}

.camera-video {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #000;
  
  &.mirror {
    transform: scaleX(-1);
  }
}

.camera-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  
  .switch-btn {
    padding: 0.75rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    transition: all 0.2s;
    
    &:hover {
      background: #5a6268;
      transform: scale(1.05);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
  
  .capture-btn {
    padding: 1rem 2rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    
    &:hover {
      background: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    i {
      font-size: 1.2rem;
    }
  }
  
  .cancel-btn {
    padding: 0.75rem 1.5rem;
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #e9ecef;
      color: #495057;
    }
  }
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  max-width: 100%;
}

@media (max-width: 768px) {
  .camera-container {
    max-width: 95vw;
    margin: 1rem;
  }
  
  .camera-header {
    padding: 1rem;
    
    h3 {
      font-size: 1.1rem;
    }
  }
  
  .camera-content {
    padding: 1rem;
    gap: 1rem;
  }
  
  .camera-controls {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
    
    .capture-btn {
      width: 100%;
      justify-content: center;
      padding: 1rem;
    }
    
    .cancel-btn {
      width: 100%;
      text-align: center;
    }
    
    .switch-btn {
      align-self: center;
    }
  }
}

@media (max-height: 600px) {
  .camera-modal {
    align-items: flex-start;
    padding: 1rem 0;
    overflow-y: auto;
  }
  
  .camera-container {
    margin: auto;
  }
}
</style> 