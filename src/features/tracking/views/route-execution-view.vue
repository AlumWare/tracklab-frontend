<template>
  <div class="route-execution-view">
    <h1>{{ t('routeExecution.title') }}</h1>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <p>{{ t('routeExecution.loading') }}</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    
    <!-- Content when data is loaded -->
    <div v-else-if="routeData">
      <!-- Always show warehouse list if route has data -->
      <div v-if="warehouses.length > 0" class="warehouse-sequence">
        <h3>{{ t('routeExecution.warehouseList') }}</h3>
        <div class="progress-info">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: routeProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ routeProgress }}% - {{ currentWarehouseIndex + 1 }}/{{ warehouses.length }}</span>
        </div>
        <div class="warehouse-list">
          <span v-for="(w, idx) in warehouses" :key="w.id" :class="[
            'warehouse-seq-item', 
            { 
              current: w.id === currentWarehouse?.id,
              completed: idx < currentWarehouseIndex,
              upcoming: idx > currentWarehouseIndex
            }
          ]">
            {{ w.name || ('Warehouse ' + w.id) }}
            <span v-if="idx < warehouses.length - 1">→</span>
          </span>
        </div>
      </div>
      
      <!-- Show current warehouse info -->
      <div v-if="currentWarehouse" class="centered-content">
        <div class="warehouse-info">
          <h2>{{ t('routeExecution.currentWarehouse') }}: {{ currentWarehouse.name }}</h2>
          <p>{{ currentWarehouse.address }}</p>
        </div>
        <div class="creator-list-wrapper">
          <container-creator
            :warehouse-id="currentWarehouse.id"
            :orders="ordersForWarehouse"
            @container-created="onContainerCreated"
            @error="onError"
          />
          <container-list 
            :warehouse-id="currentWarehouse.id"
            :auto-load="true"
            :show-complete-button="true"
            @containers-loaded="onContainersLoaded"
            @container-completed="onContainerCompleted"
            @error="onError"
            ref="containerListRef"
          />
          <container-movement />
        </div>
        <div class="movements-section">
          <h3>{{ t('routeExecution.movements') }}</h3>
          <!-- Aquí irá el componente de movimientos por QR -->
        </div>
        <div class="action-section">
          <div v-if="nextWarehouse && !isLastWarehouse" class="next-warehouse-info">
            <p class="next-warehouse-text">
              {{ t('routeExecution.nextWarehouse') }}: <strong>{{ nextWarehouse.name }}</strong>
            </p>
          </div>
          <button 
            class="complete-btn" 
            @click="completeWarehouse" 
            :disabled="loading"
            :class="{ 'complete-route': isLastWarehouse }"
          >
            <span v-if="loading">{{ t('routeExecution.processing') }}</span>
            <span v-else-if="isLastWarehouse">{{ t('routeExecution.completeRoute') }}</span>
            <span v-else>{{ t('routeExecution.completeWarehouse') }}</span>
          </button>
          <div v-if="containersForWarehouse.length === 0" class="info-message">
            <p>{{ t('routeExecution.noContainersCreated') }}</p>
          </div>
        </div>
      </div>
      
      <!-- Show when no warehouses in route -->
      <div v-else class="no-warehouses">
        <h2>{{ t('routeExecution.noWarehousesInRoute') }}</h2>
        <p>{{ t('routeExecution.routeHasNoWarehouses') }}</p>
      </div>
    </div>
    
    <!-- No route data -->
    <div v-else>
      <h2>{{ t('routeExecution.noRouteData') }}</h2>
    </div>
    
    <!-- Debug info (remove in production) -->
    <div v-if="routeData" class="debug-info">
      <details>
        <summary>Debug Info</summary>
        <p><strong>Route ID:</strong> {{ routeId }}</p>
        <p><strong>Route Items:</strong> {{ routeData?.routeItems?.length || 0 }}</p>
        <p><strong>Warehouses loaded:</strong> {{ warehouses.length }}</p>
        <p><strong>Current warehouse index:</strong> {{ currentWarehouseIndex }}</p>
        <p><strong>Current warehouse:</strong> {{ currentWarehouse?.name || 'None' }}</p>
        <pre>enrichedOrders: {{ JSON.stringify(enrichedOrders, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { routeService } from '../services/route.service.js'
import { warehouseService } from '@/features/resources/services/warehouse.service.js'
import ContainerCreator from '../components/container-creator.component.vue'
import ContainerList from '../components/container-list.component.vue'
import ContainerMovement from '../components/container-movement.component.vue'
import { productService } from '@/features/resources/services/product.service.js'
import { OrderService } from '@/features/orders/services/order.service.js'

const { t } = useI18n()
const route = useRoute()
const routeId = computed(() => route.params.routeId)
const routeData = ref(null)
const loading = ref(true)
const error = ref(null)
const warehouses = ref([])
const loadingWarehouses = ref(false)
const productsCatalog = ref([])
const enrichedOrders = ref([])
const allOrders = ref([])

onMounted(async () => {
  if (!routeId.value) {
    error.value = t('routeExecution.noRouteId')
    loading.value = false
    return
  }
  
  try {
    loading.value = true
    console.log('Loading route with ID:', routeId.value)
    
    // Load route data
    routeData.value = await routeService.getRouteById(routeId.value)
    console.log('Route data loaded:', routeData.value)
    
    // Load all orders with full product details (like in client-order-list)
    const ordersResponse = await OrderService.getOrdersByCustomer()
    allOrders.value = ordersResponse.data || []
    console.log('All orders loaded:', allOrders.value)
    
    // Filter orders that are in this route
    const routeOrderIds = (routeData.value?.orders || []).map(o => o.orderId || o.id)
    enrichedOrders.value = allOrders.value.filter(order => 
      routeOrderIds.includes(order.orderId || order.id)
    )
    console.log('Filtered orders for route:', enrichedOrders.value)
    
    // Load warehouses if route has items
    const routeItems = routeData.value?.routeItems || []
    console.log('Route items:', routeItems)
    
    if (routeItems.length > 0) {
      loadingWarehouses.value = true
      try {
        const warehousePromises = routeItems.map(item => {
          console.log('Loading warehouse with ID:', item.warehouseId)
          return warehouseService.getWarehouseById(item.warehouseId)
        })
        const warehouseEntities = await Promise.all(warehousePromises)
        warehouses.value = warehouseEntities.map(w => ({
          id: w.id,
          name: w.name,
          address: w.address
        }))
        console.log('Warehouses loaded:', warehouses.value)
      } catch (warehouseError) {
        console.error('Error loading warehouses:', warehouseError)
        // Don't fail completely, just show route without warehouse details
        warehouses.value = routeItems.map(item => ({
          id: item.warehouseId,
          name: `Warehouse ${item.warehouseId}`,
          address: 'Address not available'
        }))
      }
    }

    // Cargar catálogo de productos
    productsCatalog.value = await productService.getAvailableProducts()
  } catch (e) {
    console.error('Error loading route:', e)
    error.value = t('routeExecution.errorLoading')
  } finally {
    loading.value = false
    loadingWarehouses.value = false
  }
})

const orders = computed(() => allOrders.value)
const containers = ref([]) // TODO: cargar containers reales si hay endpoint
const containerListRef = ref(null)

const currentWarehouseIndex = ref(0)
const currentWarehouse = computed(() => {
  if (warehouses.value.length === 0) return null
  return warehouses.value[currentWarehouseIndex.value] || null
})

const ordersForWarehouse = computed(() => {
  // Mostrar todas las órdenes enriquecidas
  return enrichedOrders.value.map(order => ({
    ...order,
    products: (order.orderItems || []).map(item => ({
      productId: item.productId,
      name: item.productName || `Producto ${item.productId}`,
      quantity: item.quantity,
      unitWeight: 1.0 // Default weight, could be enhanced with product catalog
    }))
  }))
})

const containersForWarehouse = computed(() => {
  if (!currentWarehouse.value) return []
  return containers.value.filter(c => c.warehouseId === currentWarehouse.value.id)
})

const canCompleteWarehouse = computed(() => {
  // Always allow warehouse completion - no container validation required
  return true
})

const isLastWarehouse = computed(() => {
  return currentWarehouseIndex.value >= warehouses.value.length - 1
})

const nextWarehouse = computed(() => {
  if (isLastWarehouse.value) return null
  return warehouses.value[currentWarehouseIndex.value + 1] || null
})

const routeProgress = computed(() => {
  if (warehouses.value.length === 0) return 0
  return Math.round(((currentWarehouseIndex.value + 1) / warehouses.value.length) * 100)
})

function onContainerCreated(container) {
  containers.value.push(container)
  // Refresh the container list to show updated data from backend
  if (containerListRef.value) {
    containerListRef.value.refreshContainers()
  }
}

function onError(errorMessage) {
  console.error('Error:', errorMessage)
  error.value = errorMessage
}

function onContainersLoaded(loadedContainers) {
  console.log('Containers loaded:', loadedContainers)
  containers.value = loadedContainers
}

function onContainerCompleted(completedContainer) {
  console.log('Container completed:', completedContainer)
  // Update local container if it exists
  const index = containers.value.findIndex(c => c.containerId === completedContainer.containerId)
  if (index !== -1) {
    containers.value[index] = completedContainer
  }
}

async function completeWarehouse() {
  // Show confirmation dialog
  const confirmed = confirm(
    isLastWarehouse.value 
      ? t('routeExecution.confirmCompleteRoute') 
      : t('routeExecution.confirmCompleteWarehouse', { 
          current: currentWarehouse.value?.name, 
          next: nextWarehouse.value?.name 
        })
  )
  
  if (!confirmed) return

  try {
    loading.value = true
    
    // Here you could call a backend endpoint to update route progress
    // await TrackingService.updateRouteProgress(routeId.value, routeProgress.value)
    
    if (isLastWarehouse.value) {
      // Complete the entire route
      console.log('Route completed!')
      // await TrackingService.completeRoute(routeId.value)
      
      // Show success message and potentially redirect
      alert(t('routeExecution.routeCompleted'))
      // this.$router.push('/routes') // Navigate back to routes list
    } else {
      // Move to next warehouse
      currentWarehouseIndex.value++
      console.log('Moving to next warehouse:', currentWarehouse.value)
      
      // Clear containers for new warehouse
      containers.value = []
      
      // Refresh container list for new warehouse
      if (containerListRef.value) {
        setTimeout(() => {
          containerListRef.value.loadContainers()
        }, 100)
      }
    }
    
  } catch (err) {
    console.error('Error completing warehouse:', err)
    error.value = err.response?.data?.error || err.message || t('routeExecution.errorCompletingWarehouse')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.route-execution-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state, .error-state, .no-warehouses {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 10px;
  margin: 1rem 0;
}

.error-state {
  background: #f8d7da;
  color: #721c24;
}

.no-warehouses {
  background: #fff3cd;
  color: #856404;
}

.centered-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.creator-list-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.warehouse-info {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.complete-btn {
  background: #388e3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.8rem 2rem;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 2rem;
  cursor: pointer;
  transition: background 0.2s;
}

.complete-btn:hover {
  background: #256d27;
}

.warehouse-sequence {
  margin-bottom: 2rem;
}

.warehouse-sequence h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

.warehouse-list {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
  font-size: 1.08rem;
  font-weight: 600;
}

.warehouse-seq-item {
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  background: #e3eafc;
  color: #1976d2;
  transition: background 0.2s, color 0.2s;
}

.warehouse-seq-item.current {
  background: #1976d2;
  color: #fff;
  box-shadow: 0 2px 8px rgba(25,118,210,0.10);
}

.warehouse-seq-item.completed {
  background: #28a745;
  color: #fff;
}

.warehouse-seq-item.upcoming {
  background: #e9ecef;
  color: #6c757d;
}

.progress-info {
  margin-bottom: 1rem;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1976d2, #28a745);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.action-section {
  margin-top: 2rem;
  text-align: center;
}

.next-warehouse-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.next-warehouse-text {
  margin: 0;
  color: #1976d2;
  font-size: 1rem;
}

.complete-btn.complete-route {
  background: #ff5722;
}

.complete-btn.complete-route:hover:not(:disabled) {
  background: #e64a19;
}

.warning-message {
  margin-top: 1rem;
  padding: 0.8rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
}

.info-message {
  margin-top: 1rem;
  padding: 0.8rem;
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 6px;
  color: #0c5460;
}

.warning-message p,
.info-message p {
  margin: 0;
  font-size: 0.9rem;
}

.container-status-details {
  font-size: 0.8rem;
  color: #666;
}

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
}

.debug-info details {
  cursor: pointer;
}

.debug-info summary {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.debug-info p {
  margin: 0.25rem 0;
}
</style> 