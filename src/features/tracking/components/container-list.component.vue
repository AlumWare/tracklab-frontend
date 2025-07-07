<template>
  <div class="container-list">
    <div class="list-header">
      <h3>{{ t('containerList.title') }}</h3>
      <button 
        v-if="!loading && containers.length > 0" 
        @click="refreshContainers" 
        class="refresh-btn"
      >
        {{ t('containerList.refresh') }}
      </button>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <p>{{ t('containerList.loading') }}</p>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="clearError" class="clear-error-btn">{{ t('common.retry') }}</button>
    </div>
    
    <!-- Container list -->
    <div v-else-if="containers && containers.length" class="containers-grid">
      <div v-for="container in containers" :key="container.containerId" class="container-card">
        <div class="container-header">
          <span class="container-id">#{{ container.containerId }}</span>
          <span class="status-badge" :class="{ completed: container.isCompleted }">
            {{ container.isCompleted ? t('containerList.completed') : t('containerList.pending') }}
          </span>
        </div>
        
        <div class="container-info">
          <p><strong>{{ t('containerList.orderId') }}:</strong> #{{ container.orderId }}</p>
          <p><strong>{{ t('containerList.weight') }}:</strong> {{ container.totalWeight.toFixed(2) }} kg</p>
          <p v-if="container.completedAt">
            <strong>{{ t('containerList.completedAt') }}:</strong> 
            {{ formatDate(container.completedAt) }}
          </p>
          <p v-if="container.completionNotes">
            <strong>{{ t('containerList.notes') }}:</strong> 
            {{ container.completionNotes }}
          </p>
        </div>
        
        <div v-if="container.qrCode" class="qr-info">
          <div class="qr-image-container">
            <img 
              :src="container.qrCode.url" 
              :alt="`QR Code for Container ${container.containerId}`"
              class="qr-image-small"
              @error="(e) => onQrImageError(e, container.containerId)"
              @load="(e) => onQrImageLoad(e, container.containerId)"
            />
            <div v-if="qrImageErrors[container.containerId]" class="qr-fallback-small">
              QR: #{{ container.containerId }}
            </div>
          </div>
          <div class="qr-text-info">
            <span class="qr-label">{{ t('containerList.qrCode') }}:</span>
            <span class="qr-value">#{{ container.containerId }}</span>
          </div>
        </div>
        
        <div class="items-section">
          <h5>{{ t('containerList.items') }}</h5>
          <ul class="items-list">
            <li v-for="item in container.shipItems" :key="item.productId">
              {{ getProductName(item.productId) }}: {{ item.quantity }} x {{ item.unitWeight }}kg
            </li>
          </ul>
        </div>
        
        <!-- Complete container button -->
        <div v-if="!container.isCompleted && showCompleteButton" class="action-section">
          <button 
            @click="openCompleteDialog(container)" 
            class="complete-btn"
            :disabled="completingContainer === container.containerId"
          >
            {{ completingContainer === container.containerId ? 
               t('containerList.completing') : 
               t('containerList.completeContainer') }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-list">{{ t('containerList.noContainers') }}</div>
    
    <!-- Complete container dialog -->
    <div v-if="showCompleteDialog" class="dialog-overlay" @click="closeCompleteDialog">
      <div class="dialog" @click.stop>
        <h4>{{ t('containerList.completeContainerDialog.title') }}</h4>
        <p>{{ t('containerList.completeContainerDialog.subtitle') }} #{{ selectedContainer?.containerId }}</p>
        
        <form @submit.prevent="completeContainer">
          <div class="form-group">
            <label>{{ t('containerList.completeContainerDialog.notes') }}</label>
            <textarea 
              v-model="completionForm.notes" 
              :placeholder="t('containerList.completeContainerDialog.notesPlaceholder')"
              rows="3"
            ></textarea>
          </div>
          
          <div class="dialog-actions">
            <button type="button" @click="closeCompleteDialog" class="cancel-btn">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" :disabled="completingContainer" class="confirm-btn">
              {{ completingContainer ? t('containerList.completing') : t('common.confirm') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TrackingService } from '../services/tracking.service.js'
import { CompleteContainerResource } from '../models/container.resource.js'

const props = defineProps({
  containers: { type: Array, default: () => [] },
  warehouseId: { type: [String, Number], default: null },
  autoLoad: { type: Boolean, default: false },
  showCompleteButton: { type: Boolean, default: false }
})

const emit = defineEmits(['containers-loaded', 'container-completed', 'error'])
const { t } = useI18n()

const loading = ref(false)
const error = ref(null)
const localContainers = ref([])
const completingContainer = ref(null)
const showCompleteDialog = ref(false)
const selectedContainer = ref(null)
const completionForm = ref({
  notes: ''
})
const qrImageErrors = ref({})

// Use local containers if autoLoad is enabled, otherwise use props
const containers = computed(() => {
  return props.autoLoad ? localContainers.value : props.containers
})

onMounted(() => {
  if (props.autoLoad && props.warehouseId) {
    loadContainers()
  }
})

watch(() => props.warehouseId, (newWarehouseId) => {
  if (props.autoLoad && newWarehouseId) {
    loadContainers()
  }
})

async function loadContainers() {
  if (!props.warehouseId) return
  
  loading.value = true
  error.value = null
  
  try {
    const containers = await TrackingService.getContainersByWarehouse(props.warehouseId)
    localContainers.value = containers
    emit('containers-loaded', containers)
  } catch (err) {
    console.error('Error loading containers:', err)
    error.value = err.response?.data?.error || err.message || t('containerList.errorLoading')
    emit('error', error.value)
  } finally {
    loading.value = false
  }
}

async function refreshContainers() {
  await loadContainers()
}

function clearError() {
  error.value = null
  if (props.autoLoad && props.warehouseId) {
    loadContainers()
  }
}

function openCompleteDialog(container) {
  selectedContainer.value = container
  completionForm.value.notes = ''
  showCompleteDialog.value = true
}

function closeCompleteDialog() {
  showCompleteDialog.value = false
  selectedContainer.value = null
  completionForm.value.notes = ''
}

async function completeContainer() {
  if (!selectedContainer.value || completingContainer.value) return
  
  completingContainer.value = selectedContainer.value.containerId
  
  try {
    const completionData = new CompleteContainerResource({
      deliveryWarehouseId: Number(props.warehouseId),
      deliveryDate: new Date(),
      deliveryNotes: completionForm.value.notes || null
    })
    
    const completedContainer = await TrackingService.completeContainer(
      selectedContainer.value.containerId, 
      completionData
    )
    
    // Update local container list
    if (props.autoLoad) {
      const index = localContainers.value.findIndex(c => c.containerId === completedContainer.containerId)
      if (index !== -1) {
        localContainers.value[index] = completedContainer
      }
    }
    
    emit('container-completed', completedContainer)
    closeCompleteDialog()
    
  } catch (err) {
    console.error('Error completing container:', err)
    error.value = err.response?.data?.error || err.message || t('containerList.errorCompleting')
    emit('error', error.value)
  } finally {
    completingContainer.value = null
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getProductName(productId) {
  // En integración real, buscar el nombre en un diccionario global o prop
  return `Producto ${productId}`
}

function onQrImageError(event, containerId) {
  qrImageErrors.value[containerId] = true
}

function onQrImageLoad(event, containerId) {
  qrImageErrors.value[containerId] = false
}

// Expose methods for parent components
defineExpose({
  loadContainers,
  refreshContainers
})
</script>

<style scoped>
.container-list {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.refresh-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #1565c0;
}

.loading-state, .error-state {
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  margin: 1rem 0;
}

.error-state {
  background: #f8d7da;
  color: #721c24;
}

.clear-error-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
}

.containers-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.container-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.container-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.container-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1976d2;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #ffc107;
  color: #333;
}

.status-badge.completed {
  background: #28a745;
  color: #fff;
}

.container-info {
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.container-info p {
  margin: 0.3rem 0;
}

.qr-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.qr-image-container {
  position: relative;
  flex-shrink: 0;
}

.qr-image-small {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
}

.qr-fallback-small {
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #666;
  text-align: center;
}

.qr-text-info {
  flex: 1;
}

.qr-label {
  color: #666;
}

.qr-value {
  color: #28a745;
  font-weight: 600;
}

.items-section h5 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.95rem;
}

.items-list {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  color: #666;
}

.action-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.complete-btn {
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.complete-btn:hover:not(:disabled) {
  background: #218838;
}

.complete-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.empty-list {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
}

/* Dialog styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn, .confirm-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn {
  background: #6c757d;
  color: #fff;
}

.cancel-btn:hover {
  background: #5a6268;
}

.confirm-btn {
  background: #28a745;
  color: #fff;
}

.confirm-btn:hover:not(:disabled) {
  background: #218838;
}

.confirm-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style> 