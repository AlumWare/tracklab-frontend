<template>
  <div class="order-selector">
    <div class="selector-header">
      <h4>{{ t('routePlanning.selectOrders') }}</h4>
      <div class="search-filter">
        <input 
          v-model="searchTerm" 
          type="text" 
          :placeholder="t('routePlanning.searchOrders')"
          class="search-input"
        />
        <select v-model="statusFilter" class="status-filter">
          <option value="">{{ t('routePlanning.allStatuses') }}</option>
          <option value="PENDING">{{ t('orders.status.pending') }}</option>
          <option value="IN_TRANSIT">{{ t('orders.status.inTransit') }}</option>
          <option value="DELIVERED">{{ t('orders.status.delivered') }}</option>
        </select>
      </div>
    </div>
    
    <div class="orders-container">
      <div v-if="loading" class="loading">
        {{ t('common.loading') }}
      </div>
      <div v-else-if="filteredOrders.length === 0" class="no-orders">
        {{ t('routePlanning.noOrdersAvailable') }}
      </div>
      <div v-else class="orders-list">
        <div 
          v-for="order in paginatedOrders" 
          :key="order.orderId"
          class="order-item"
          :class="{ selected: isOrderSelected(order.orderId) }"
          @click="toggleOrderSelection(order)"
        >
          <div class="order-info">
            <div class="order-header">
              <span class="order-id">#{{ order.orderId }}</span>
              <span class="order-status" :class="order.status.toLowerCase()">
                {{ t(`orders.status.${order.status.toLowerCase()}`) }}
              </span>
            </div>
            <div class="order-details">
              <span class="customer">{{ order.customerName || t('orders.customer') }}</span>
              <span class="items">{{ order.totalItems }} {{ t('orders.items') }}</span>
            </div>
            <div class="order-address">
              {{ order.shippingAddress || t('orders.noAddress') }}
            </div>
          </div>
          <div class="order-actions">
            <button 
              class="select-btn"
              :class="{ selected: isOrderSelected(order.orderId) }"
              @click.stop="toggleOrderSelection(order)"
            >
              {{ isOrderSelected(order.orderId) ? t('common.remove') : t('common.add') }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          {{ t('common.previous') }}
        </button>
        <span class="page-info">
          {{ t('common.page') }} {{ currentPage }} {{ t('common.of') }} {{ totalPages }}
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
    
    <div v-if="selectedOrders.length > 0" class="selected-summary">
      <h5>{{ t('routePlanning.selectedOrders') }} ({{ selectedOrders.length }})</h5>
      <div class="selected-list">
        <div 
          v-for="order in selectedOrders" 
          :key="order.orderId"
          class="selected-item"
        >
          <span>#{{ order.orderId }}</span>
          <button @click="removeOrder(order)" class="remove-btn">
            {{ t('common.remove') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { OrderService } from '@/features/orders/services/order.service.js'

const { t } = useI18n()

const props = defineProps({
  selectedOrders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selectedOrders'])

const orders = ref([])
const loading = ref(false)
const searchTerm = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 5

onMounted(async () => {
  await loadOrders()
})

watch([searchTerm, statusFilter], () => {
  currentPage.value = 1
})

async function loadOrders() {
  try {
    loading.value = true
    const response = await OrderService.getOrdersByLogistics()
    orders.value = response.data
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  let filtered = orders.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.orderId.toString().includes(term) ||
      (order.customerName && order.customerName.toLowerCase().includes(term)) ||
      (order.shippingAddress && order.shippingAddress.toLowerCase().includes(term))
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrders.value.slice(start, end)
})

function isOrderSelected(orderId) {
  return props.selectedOrders.some(order => order.orderId === orderId)
}

function toggleOrderSelection(order) {
  const newSelected = [...props.selectedOrders]
  const index = newSelected.findIndex(o => o.orderId === order.orderId)
  
  if (index > -1) {
    newSelected.splice(index, 1)
  } else {
    newSelected.push(order)
  }
  
  emit('update:selectedOrders', newSelected)
}

function removeOrder(order) {
  const newSelected = props.selectedOrders.filter(o => o.orderId !== order.orderId)
  emit('update:selectedOrders', newSelected)
}
</script>

<style scoped>
.order-selector {
  margin-bottom: 1.5rem;
}

.selector-header {
  margin-bottom: 1rem;
}

.selector-header h4 {
  margin: 0 0 0.8rem 0;
  color: #222b45;
  font-size: 1.1rem;
}

.search-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input, .status-filter {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  flex: 1;
}

.orders-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
}

.orders-list {
  padding: 0.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
}

.order-item:hover {
  background: #e3f2fd;
  border-color: #1976d2;
}

.order-item.selected {
  background: #e8f5e8;
  border-color: #4caf50;
}

.order-info {
  flex: 1;
  margin-right: 1rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.order-id {
  font-weight: 600;
  color: #222b45;
}

.order-status {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.in_transit {
  background: #d1ecf1;
  color: #0c5460;
}

.order-status.delivered {
  background: #d4edda;
  color: #155724;
}

.order-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
  color: #666;
}

.order-address {
  font-size: 0.85rem;
  color: #888;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #1976d2;
  background: #fff;
  color: #1976d2;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.select-btn:hover {
  background: #1976d2;
  color: #fff;
}

.select-btn.selected {
  background: #4caf50;
  border-color: #4caf50;
  color: #fff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.page-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}

.selected-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.selected-summary h5 {
  margin: 0 0 0.8rem 0;
  color: #222b45;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 20px;
  font-size: 0.85rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.2rem;
}

.remove-btn:hover {
  color: #b71c1c;
}

.loading, .no-orders {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}
</style> 