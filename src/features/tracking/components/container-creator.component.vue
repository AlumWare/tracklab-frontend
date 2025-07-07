<template>
  <div class="container-creator">
    <h3 class="creator-title">{{ t('containerCreator.title') }}</h3>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <p>{{ t('containerCreator.creating') }}</p>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="clearError" class="clear-error-btn">{{ t('common.close') }}</button>
    </div>
    
    <!-- Form -->
    <form v-if="!createdContainer" @submit.prevent="createContainer">
      <div class="order-select-row">
        <label class="order-label">{{ t('containerCreator.selectOrder') }}</label>
        <select v-model="selectedOrderId" class="order-select" :disabled="loading">
          <option value="" disabled>{{ t('containerCreator.selectOrderPlaceholder') }}</option>
          <option v-for="order in orders" :key="order.orderId" :value="order.orderId">
            #{{ order.orderId }} - {{ order.products.map(p => p.name).join(', ') }}
          </option>
        </select>
      </div>
      <div v-if="selectedOrder" class="products-block">
        <h4 class="products-title">{{ t('containerCreator.selectProducts') }}</h4>
        <div v-for="product in selectedOrder.products" :key="product.productId" class="product-row">
          <span class="product-name">{{ product.name }}</span>
          <input 
            type="number" 
            min="0" 
            :max="product.quantity" 
            v-model.number="selectedQuantities[product.productId]" 
            class="quantity-input"
            :disabled="loading" 
          />
          <span class="max-info">/ {{ product.quantity }}</span>
        </div>
        <div class="weight-info">
          <span class="weight-label">{{ t('containerCreator.totalWeight') }}: </span>
          <span class="weight-value">{{ calculatedWeight.toFixed(2) }} kg</span>
        </div>
      </div>
      <div v-else class="no-order-selected">{{ t('containerCreator.noOrderSelected') }}</div>
      <button 
        type="submit" 
        :disabled="!canCreate || loading" 
        class="create-btn"
      >
        {{ loading ? t('containerCreator.creating') : t('containerCreator.create') }}
      </button>
    </form>
    
    <!-- Success result -->
    <div v-if="createdContainer" class="success-section">
      <h4>{{ t('containerCreator.containerCreated') }}</h4>
      <div class="container-info">
        <p><strong>{{ t('containerCreator.containerId') }}:</strong> #{{ createdContainer.containerId }}</p>
        <p><strong>{{ t('containerCreator.orderId') }}:</strong> #{{ createdContainer.orderId }}</p>
        <p><strong>{{ t('containerCreator.totalWeight') }}:</strong> {{ createdContainer.totalWeight.toFixed(2) }} kg</p>
      </div>
      
      <div v-if="createdContainer.qrCode" class="qr-section">
        <h5>{{ t('containerCreator.qrGenerated') }}</h5>
        <div class="qr-code">
          <div v-if="!qrImageError" class="qr-image-container">
            <img 
              :src="createdContainer.qrCode.url" 
              :alt="`QR Code for Container ${createdContainer.containerId}`"
              class="qr-image"
              @error="onQrImageError"
              @load="onQrImageLoad"
            />
          </div>
          <div v-else class="qr-fallback">
            <div class="qr-placeholder">
              QR: {{ createdContainer.containerId }}
              <br>
              <small>{{ createdContainer.qrCode.url }}</small>
            </div>
            <p class="qr-error-message">{{ t('containerCreator.qrImageError') }}</p>
          </div>
          <div class="qr-info">
            <p class="qr-container-id">{{ t('containerCreator.containerId') }}: #{{ createdContainer.containerId }}</p>
            <p class="qr-generated-date">{{ formatQrDate(createdContainer.qrCode.generatedAt) }}</p>
          </div>
        </div>
      </div>
      
      <div class="items-section">
        <h5>{{ t('containerCreator.items') }}</h5>
        <ul class="items-list">
          <li v-for="item in createdContainer.shipItems" :key="item.productId">
            {{ getProductName(item.productId) }}: {{ item.quantity }} ({{ item.unitWeight }} kg c/u)
          </li>
        </ul>
      </div>
      
      <button @click="resetForm" class="create-another-btn">{{ t('containerCreator.createAnother') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CreateContainerResource, CreateShipItemResource } from '../models/container.resource.js'
import { TrackingService } from '../services/tracking.service.js'

const props = defineProps({
  warehouseId: { type: [String, Number], required: true },
  orders: { type: Array, default: () => [] }
})
const emit = defineEmits(['container-created', 'error'])
const { t } = useI18n()

const selectedOrderId = ref('')
const selectedOrder = computed(() => props.orders.find(o => o.orderId == selectedOrderId.value))
const selectedQuantities = ref({})
const createdContainer = ref(null)
const loading = ref(false)
const error = ref(null)
const qrImageError = ref(false)

watch(selectedOrder, (order) => {
  // Resetear cantidades si cambia la orden
  selectedQuantities.value = {}
  if (order) order.products.forEach(p => selectedQuantities.value[p.productId] = 0)
}, { immediate: true })

const calculatedWeight = computed(() => {
  if (!selectedOrder.value) return 0
  return selectedOrder.value.products.reduce((total, product) => {
    const quantity = selectedQuantities.value[product.productId] || 0
    // Usar peso unitario del producto o default a 1kg
    const unitWeight = product.unitWeight || 1.0
    return total + (quantity * unitWeight)
  }, 0)
})

const canCreate = computed(() => {
  return selectedOrder.value && 
         selectedOrder.value.products.some(p => selectedQuantities.value[p.productId] > 0) &&
         !loading.value
})

async function createContainer() {
  if (!selectedOrder.value || loading.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // Construir shipItems
    const shipItems = selectedOrder.value.products
      .filter(p => selectedQuantities.value[p.productId] > 0)
      .map(p => new CreateShipItemResource({
        productId: p.productId,
        quantity: selectedQuantities.value[p.productId],
        unitWeight: p.unitWeight || 1.0
      }))
    
    const resource = new CreateContainerResource({
      orderId: selectedOrder.value.orderId,
      warehouseId: Number(props.warehouseId),
      shipItems,
      totalWeight: calculatedWeight.value
    })
    
    // Llamar al servicio real
    const container = await TrackingService.createContainer(resource)
    
    createdContainer.value = container
    emit('container-created', container)
    
  } catch (err) {
    console.error('Error creating container:', err)
    error.value = err.response?.data?.error || err.message || t('containerCreator.errorCreating')
    emit('error', error.value)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  createdContainer.value = null
  selectedOrderId.value = ''
  selectedQuantities.value = {}
  error.value = null
  qrImageError.value = false
}

function clearError() {
  error.value = null
}

function getProductName(productId) {
  if (!selectedOrder.value) return productId
  const prod = selectedOrder.value.products.find(p => p.productId === productId)
  return prod ? prod.name : productId
}

function onQrImageError() {
  qrImageError.value = true
}

function onQrImageLoad() {
  qrImageError.value = false
}

function formatQrDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.container-creator {
  background: #f8f9fa;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(25,118,210,0.06);
  padding: 2rem 2.2rem 1.5rem 2.2rem;
  margin-bottom: 2.5rem;
  max-width: 480px;
}
.creator-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 1.2rem;
}
.order-select-row {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.order-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.2rem;
}
.order-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #222b45;
  transition: border-color 0.2s;
}
.order-select:focus {
  outline: none;
  border-color: #1976d2;
}
.products-block {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(25,118,210,0.04);
  padding: 1.2rem 1rem 1rem 1rem;
  margin-bottom: 1.2rem;
}
.products-title {
  font-size: 1.08rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 0.8rem;
}
.product-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.7rem;
}
.product-name {
  min-width: 120px;
  font-weight: 500;
  color: #333;
}
.quantity-input {
  width: 60px;
  padding: 0.4rem 0.7rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #f8f9fa;
  color: #222b45;
  transition: border-color 0.2s;
  text-align: right;
}
.quantity-input:focus {
  outline: none;
  border-color: #1976d2;
}
.max-info {
  color: #888;
  font-size: 0.95em;
}
.no-order-selected {
  color: #888;
  font-style: italic;
  margin-bottom: 1.2rem;
}
.create-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1.08rem;
  cursor: pointer;
  margin-top: 1.2rem;
  transition: background 0.2s;
  box-shadow: 0 1px 4px rgba(25,118,210,0.08);
}
.create-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}
.qr-section {
  margin-top: 1.5rem;
  text-align: center;
}
.qr-placeholder {
  background: #eee;
  border-radius: 8px;
  padding: 1.2rem;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  display: inline-block;
}
.create-another-btn {
  background: #388e3c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.create-another-btn:hover {
  background: #256d27;
}
.loading-state {
  text-align: center;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.error-state {
  text-align: center;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.clear-error-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.clear-error-btn:hover {
  background: #256d27;
}
.success-section {
  text-align: center;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  margin-top: 1.5rem;
}
.container-info {
  margin-bottom: 1.5rem;
}
.weight-info {
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}
.weight-label {
  font-weight: 600;
  color: #333;
}
.weight-value {
  color: #888;
  font-size: 0.95em;
}
.items-section {
  margin-bottom: 1.5rem;
}
.items-list {
  list-style: none;
  padding: 0;
}
.qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.qr-image-container {
  text-align: center;
}
.qr-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.qr-fallback {
  text-align: center;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  border: 2px dashed #ddd;
}
.qr-error-message {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
.qr-info {
  text-align: center;
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.qr-info p {
  margin: 0.2rem 0;
}
.qr-container-id {
  font-weight: 600;
  color: #333;
}
.qr-generated-date {
  color: #666;
  font-size: 0.85rem;
}
</style> 