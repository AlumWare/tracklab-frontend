<template>
  <div class="container-scanner-view">
    <div class="scanner-header">
      <h1>{{ t('containerScanner.title') }}</h1>
      <p class="scanner-subtitle">{{ t('containerScanner.subtitle') }}</p>
    </div>

    <!-- Scanner Section -->
    <div class="scanner-section">
      <div class="scanner-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'qr' }]"
          @click="activeTab = 'qr'"
        >
          <i class="pi pi-qrcode"></i>
          {{ t('containerScanner.scanQR') }}
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'manual' }]"
          @click="activeTab = 'manual'"
        >
          <i class="pi pi-search"></i>
          {{ t('containerScanner.manualSearch') }}
        </button>
      </div>

      <!-- QR Scanner Tab -->
      <div v-if="activeTab === 'qr'" class="tab-content">
        <div class="qr-scanner-container">
          <div class="qr-instructions">
            <i class="pi pi-qrcode scanner-icon"></i>
            <p>{{ t('containerScanner.qrInstructions') }}</p>
            <button @click="openQRScanner" class="scan-btn">
              <i class="pi pi-qrcode"></i>
              {{ t('containerScanner.openScanner') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Manual Search Tab -->
      <div v-if="activeTab === 'manual'" class="tab-content">
        <div class="manual-search">
          <div class="search-input-group">
            <input 
              v-model="searchId"
              type="text"
              :placeholder="t('containerScanner.enterContainerId')"
              class="search-input"
              @keyup.enter="searchContainer"
            />
            <button 
              @click="searchContainer" 
              :disabled="!searchId || loading"
              class="search-btn"
            >
              <i class="pi pi-search"></i>
              {{ t('containerScanner.search') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Scanner Component -->
    <QRScanner 
      v-model:open="showQRScanner"
      @scanned="onQRScanned"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <i class="pi pi-spinner pi-spin"></i>
      <p>{{ t('containerScanner.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-section">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="clearError" class="retry-btn">{{ t('common.retry') }}</button>
    </div>

    <!-- Container Details -->
    <div v-if="containerDetails && !loading" class="container-details">
      <div class="details-header">
        <h2>{{ t('containerScanner.containerFound') }}</h2>
        <span class="container-id">#{{ containerDetails.containerId }}</span>
      </div>

      <div class="details-grid">
        <!-- Basic Info Card -->
        <div class="detail-card">
          <h3>{{ t('containerScanner.basicInfo') }}</h3>
          <div class="info-row">
            <span class="label">{{ t('containerScanner.containerId') }}:</span>
            <span class="value">#{{ containerDetails.containerId }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t('containerScanner.orderId') }}:</span>
            <span class="value">#{{ containerDetails.orderId }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t('containerScanner.warehouseId') }}:</span>
            <span class="value">#{{ containerDetails.warehouseId }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t('containerScanner.totalWeight') }}:</span>
            <span class="value">{{ containerDetails.totalWeight }} kg</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t('containerScanner.status') }}:</span>
            <span :class="['status', containerDetails.isCompleted ? 'completed' : 'pending']">
              {{ containerDetails.isCompleted ? t('common.completed') : t('common.pending') }}
            </span>
          </div>
          <div v-if="containerDetails.completedAt" class="info-row">
            <span class="label">{{ t('containerScanner.completedAt') }}:</span>
            <span class="value">{{ formatDate(containerDetails.completedAt) }}</span>
          </div>
          <div v-if="containerDetails.completionNotes" class="info-row">
            <span class="label">{{ t('containerScanner.notes') }}:</span>
            <span class="value">{{ containerDetails.completionNotes }}</span>
          </div>
        </div>

        <!-- QR Code Card -->
        <div v-if="containerDetails.qrCode" class="detail-card qr-card">
          <h3>{{ t('containerScanner.qrCode') }}</h3>
          <div class="qr-display">
            <img 
              :src="containerDetails.qrCode.url" 
              :alt="`QR Code for Container ${containerDetails.containerId}`"
              class="qr-image"
              @error="onQrImageError"
            />
            <div v-if="qrImageError" class="qr-fallback">
              QR: #{{ containerDetails.containerId }}
            </div>
          </div>
          <p class="qr-generated">
            {{ t('containerScanner.generatedAt') }}: {{ formatDate(containerDetails.qrCode.generatedAt) }}
          </p>
        </div>

        <!-- Items Card -->
        <div class="detail-card items-card">
          <h3>{{ t('containerScanner.items') }} ({{ containerDetails.shipItems?.length || 0 }})</h3>
          <div v-if="containerDetails.shipItems?.length" class="items-list">
            <div v-for="item in containerDetails.shipItems" :key="item.productId" class="item-row">
              <div class="item-info">
                <span class="product-id">{{ t('containerScanner.product') }} #{{ item.productId }}</span>
                <span class="quantity">{{ item.quantity }} {{ t('containerScanner.units') }}</span>
              </div>
              <div class="item-weight">
                {{ item.unitWeight }} kg × {{ item.quantity }} = {{ (item.unitWeight * item.quantity).toFixed(2) }} kg
              </div>
            </div>
          </div>
          <div v-else class="no-items">
            <p>{{ t('containerScanner.noItems') }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <button @click="clearContainer" class="secondary-btn">
          {{ t('containerScanner.scanAnother') }}
        </button>
        <button v-if="!containerDetails.isCompleted" @click="openCompleteDialog" class="primary-btn">
          {{ t('containerScanner.completeContainer') }}
        </button>
      </div>
    </div>

    <!-- No Container Found -->
    <div v-if="searchAttempted && !containerDetails && !loading && !error" class="not-found-section">
      <i class="pi pi-search"></i>
      <h3>{{ t('containerScanner.notFound') }}</h3>
      <p>{{ t('containerScanner.notFoundMessage') }}</p>
      <button @click="clearSearch" class="retry-btn">{{ t('containerScanner.tryAgain') }}</button>
    </div>

    <!-- Complete Container Dialog -->
    <div v-if="showCompleteDialog" class="dialog-overlay" @click="closeCompleteDialog">
      <div class="dialog" @click.stop>
        <h4>{{ t('containerScanner.completeDialog.title') }}</h4>
        <p>{{ t('containerScanner.completeDialog.subtitle') }} #{{ containerDetails?.containerId }}</p>
        
        <form @submit.prevent="completeContainer">
          <div class="form-group">
            <label>{{ t('containerScanner.completeDialog.warehouseId') }}</label>
            <input 
              v-model="completionForm.warehouseId" 
              type="number"
              :placeholder="t('containerScanner.completeDialog.warehousePlaceholder')"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ t('containerScanner.completeDialog.notes') }}</label>
            <textarea 
              v-model="completionForm.notes" 
              :placeholder="t('containerScanner.completeDialog.notesPlaceholder')"
              rows="3"
            ></textarea>
          </div>
          
          <div class="dialog-actions">
            <button type="button" @click="closeCompleteDialog" class="cancel-btn">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" :disabled="completingContainer" class="confirm-btn">
              {{ completingContainer ? t('containerScanner.completing') : t('common.confirm') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { TrackingService } from '../services/tracking.service.js'
import { CompleteContainerResource } from '../models/container.resource.js'
import QRScanner from '../components/qr-scanner.component.vue'

const { t } = useI18n()

// State
const activeTab = ref('qr')
const searchId = ref('')
const containerDetails = ref(null)
const loading = ref(false)
const error = ref(null)
const searchAttempted = ref(false)
const qrImageError = ref(false)
const showQRScanner = ref(false)

// Complete dialog state
const showCompleteDialog = ref(false)
const completingContainer = ref(false)
const completionForm = ref({
  warehouseId: '',
  notes: ''
})

// Methods
function openQRScanner() {
  showQRScanner.value = true
}

function onQRScanned(containerId) {
  console.log('QR Scanned:', containerId)
  searchId.value = containerId
  searchContainer()
}

async function searchContainer() {
  if (!searchId.value.trim()) return
  
  loading.value = true
  error.value = null
  searchAttempted.value = true
  
  try {
    const container = await TrackingService.getContainerById(parseInt(searchId.value.trim()))
    containerDetails.value = container
  } catch (err) {
    console.error('Error fetching container:', err)
    error.value = err.response?.data?.error || err.message || t('containerScanner.errorFetching')
    containerDetails.value = null
  } finally {
    loading.value = false
  }
}

function clearError() {
  error.value = null
  searchAttempted.value = false
}

function clearContainer() {
  containerDetails.value = null
  searchAttempted.value = false
  searchId.value = ''
  qrImageError.value = false
}

function clearSearch() {
  searchId.value = ''
  searchAttempted.value = false
  containerDetails.value = null
}

function onQrImageError() {
  qrImageError.value = true
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Complete container functions
function openCompleteDialog() {
  completionForm.value = {
    warehouseId: containerDetails.value?.warehouseId || '',
    notes: ''
  }
  showCompleteDialog.value = true
}

function closeCompleteDialog() {
  showCompleteDialog.value = false
  completionForm.value = { warehouseId: '', notes: '' }
}

async function completeContainer() {
  if (!containerDetails.value || completingContainer.value) return
  
  completingContainer.value = true
  
  try {
    const completionData = new CompleteContainerResource({
      deliveryWarehouseId: Number(completionForm.value.warehouseId),
      deliveryDate: new Date(),
      deliveryNotes: completionForm.value.notes || null
    })
    
    const completedContainer = await TrackingService.completeContainer(
      containerDetails.value.containerId, 
      completionData
    )
    
    containerDetails.value = completedContainer
    closeCompleteDialog()
    
  } catch (err) {
    console.error('Error completing container:', err)
    error.value = err.response?.data?.error || err.message || t('containerScanner.errorCompleting')
  } finally {
    completingContainer.value = false
  }
}
</script>

<style scoped>
.container-scanner-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.scanner-header {
  text-align: center;
  margin-bottom: 2rem;
}

.scanner-header h1 {
  color: #1976d2;
  margin-bottom: 0.5rem;
}

.scanner-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.scanner-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.scanner-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.tab-btn.active {
  border-color: #1976d2;
  background: #1976d2;
  color: #fff;
}

.tab-btn:hover:not(.active) {
  border-color: #1976d2;
  color: #1976d2;
}

.tab-content {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-scanner-container {
  text-align: center;
  padding: 2rem;
}

.qr-instructions {
  text-align: center;
  padding: 2rem;
}

.scanner-icon {
  font-size: 4rem;
  color: #1976d2;
  margin-bottom: 1rem;
}

.scan-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.manual-search {
  width: 100%;
  max-width: 500px;
}

.search-input-group {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #1976d2;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.search-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-section, .error-section, .not-found-section {
  text-align: center;
  padding: 3rem 2rem;
  background: #fff;
  border-radius: 12px;
  margin: 2rem 0;
}

.loading-section i {
  font-size: 2rem;
  color: #1976d2;
  margin-bottom: 1rem;
}

.error-section i {
  font-size: 2rem;
  color: #d32f2f;
  margin-bottom: 1rem;
}

.not-found-section i {
  font-size: 3rem;
  color: #666;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.container-details {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.container-id {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1976d2;
  background: #e3f2fd;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
}

.detail-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  padding: 0.3rem 0;
}

.label {
  font-weight: 600;
  color: #555;
}

.value {
  color: #333;
}

.status {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.status.pending {
  background: #fff3e0;
  color: #f57c00;
}

.qr-card {
  text-align: center;
}

.qr-display {
  margin: 1rem 0;
}

.qr-image {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.qr-fallback {
  width: 150px;
  height: 150px;
  background: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: #666;
  font-weight: 600;
}

.qr-generated {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.items-list {
  max-height: 200px;
  overflow-y: auto;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid #e0e0e0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.product-id {
  font-weight: 600;
  color: #1976d2;
}

.quantity {
  font-size: 0.9rem;
  color: #666;
}

.item-weight {
  font-size: 0.85rem;
  color: #666;
  text-align: right;
}

.no-items {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.primary-btn, .secondary-btn {
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn {
  background: #1976d2;
  color: #fff;
  border: none;
}

.primary-btn:hover {
  background: #1565c0;
}

.secondary-btn {
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
}

.secondary-btn:hover {
  background: #e0e0e0;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: inherit;
}

.form-group input:focus,
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