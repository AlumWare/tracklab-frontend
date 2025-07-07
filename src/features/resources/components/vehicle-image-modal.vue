<template>
  <BaseForm
    :visible="true"
    :title="$t('vehicle.management.actions.uploadImages') + ' - ' + vehicle?.licensePlate"
    :submit-text="$t('vehicle.management.actions.uploadImages')"
    :cancel-text="$t('vehicle.form.cancel')"
    :loading="loading"
    @close="$emit('cancel')"
    @submit="handleUpload"
  >
    <template #form-fields>
      <div class="image-management">
        <!-- Imágenes existentes -->
        <div v-if="vehicle.images && vehicle.images.length > 0" class="existing-images">
          <h4>{{ $t('vehicle.management.actions.viewImages') }}</h4>
          <div class="image-grid">
            <div 
              v-for="image in vehicle.images" 
              :key="image.id" 
              class="image-item"
            >
              <img :src="image.imageUrl" :alt="vehicle.licensePlate" />
              <button 
                type="button" 
                class="delete-image-btn"
                @click="confirmDeleteImage(image)"
                :title="$t('vehicle.management.actions.delete')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Subir nuevas imágenes -->
        <div class="upload-section">
          <h4>Subir nuevas imágenes</h4>
          
          <VehicleImageUploader
            v-model="newImages"
            :vehicle-plate="vehicle?.licensePlate"
            @error="handleImageError"
          />
          
          <div v-if="imageError" class="error-message">
            {{ imageError }}
          </div>
        </div>
      </div>
    </template>
  </BaseForm>

  <!-- Modal de confirmación para eliminar imagen -->
  <div v-if="showDeleteConfirm" class="delete-confirm-modal">
    <div class="modal-overlay" @click="cancelDeleteImage">
      <div class="confirm-container" @click.stop>
        <div class="confirm-header">
          <h3>{{ $t('vehicle.management.actions.delete') }}</h3>
          <button @click="cancelDeleteImage" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="confirm-content">
          <p>¿Estás seguro de que quieres eliminar esta imagen?</p>
          <img v-if="imageToDelete" :src="imageToDelete.imageUrl" class="preview-image" />
        </div>
        
        <div class="confirm-actions">
          <button @click="cancelDeleteImage" class="cancel-btn">
            {{ $t('vehicle.form.cancel') }}
          </button>
          <button @click="deleteImage" class="delete-btn" :disabled="loading">
            {{ $t('vehicle.management.actions.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { vehicleService } from '../services/vehicle.service.js'
import BaseForm from '@/shared/components/base-form.component.vue'
import VehicleImageUploader from './vehicle-image-uploader.vue'

export default {
  name: 'VehicleImageModal',
  components: {
    BaseForm,
    VehicleImageUploader
  },
  props: {
    vehicle: {
      type: Object,
      required: true
    }
  },
  emits: ['upload', 'cancel'],
  setup(props, { emit }) {
    const { t } = useI18n()
    
    // State
    const loading = ref(false)
    const showDeleteConfirm = ref(false)
    const newImages = ref([])
    const imageError = ref('')
    const imageToDelete = ref(null)

    // Methods
    const handleUpload = async () => {
      if (!newImages.value || newImages.value.length === 0) {
        imageError.value = 'Selecciona al menos una imagen para subir'
        return
      }

      // Validate that all items are File objects
      const validImages = newImages.value.filter(image => image instanceof File)
      if (validImages.length === 0) {
        imageError.value = 'No se encontraron archivos válidos para subir'
        return
      }

      if (validImages.length !== newImages.value.length) {
        imageError.value = `Solo ${validImages.length} de ${newImages.value.length} archivos son válidos`
        return
      }

      console.log('Uploading images:', validImages)
      console.log('Image details:')
      validImages.forEach((img, index) => {
        console.log(`Image ${index}:`, {
          name: img.name,
          size: img.size,
          type: img.type,
          lastModified: img.lastModified
        })
      })

      loading.value = true
      
      try {
        emit('upload', validImages)
      } catch (error) {
        console.error('Error al subir imágenes:', error)
        imageError.value = 'Error al subir las imágenes'
      } finally {
        loading.value = false
      }
    }

    const handleImageError = (error) => {
      imageError.value = error
    }

    const confirmDeleteImage = (image) => {
      imageToDelete.value = image
      showDeleteConfirm.value = true
    }

    const cancelDeleteImage = () => {
      imageToDelete.value = null
      showDeleteConfirm.value = false
    }

    const deleteImage = async () => {
      if (!imageToDelete.value) return

      loading.value = true
      
      try {
        await vehicleService.deleteImage(props.vehicle.id, imageToDelete.value.id)
        
        // Actualizar las imágenes del vehículo
        const imageIndex = props.vehicle.images.findIndex(img => img.id === imageToDelete.value.id)
        if (imageIndex > -1) {
          props.vehicle.images.splice(imageIndex, 1)
        }
        
        cancelDeleteImage()
      } catch (error) {
        console.error('Error al eliminar imagen:', error)
        imageError.value = 'Error al eliminar la imagen'
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      showDeleteConfirm,
      newImages,
      imageError,
      imageToDelete,
      handleUpload,
      handleImageError,
      confirmDeleteImage,
      cancelDeleteImage,
      deleteImage
    }
  }
}
</script>

<style lang="scss" scoped>
.image-management {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.existing-images {
  h4 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.125rem;
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .delete-image-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 32px;
    height: 32px;
    background: rgba(244, 67, 54, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    transition: all 0.2s;
    
    &:hover {
      background: #f44336;
      transform: scale(1.1);
    }
  }
}

.upload-section {
  h4 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.125rem;
  }
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #ffebee;
  color: #c62828;
  border: 1px solid #f8bbd9;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

/* Modal de confirmación */
.delete-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.confirm-container {
  background: white;
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.confirm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 1.25rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: #f5f5f5;
      color: #333;
    }
    
    i {
      font-size: 1.25rem;
    }
  }
}

.confirm-content {
  padding: 1.5rem;
  text-align: center;
  
  p {
    margin: 0 0 1rem 0;
    color: #666;
  }
  
  .preview-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn,
.delete-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
  
  &:hover {
    background: #e0e0e0;
  }
}

.delete-btn {
  background: #f44336;
  color: white;
  
  &:hover:not(:disabled) {
    background: #d32f2f;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .confirm-container {
    min-width: 90vw;
    margin: 1rem;
  }
}
</style> 