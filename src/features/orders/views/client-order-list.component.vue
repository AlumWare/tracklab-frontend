<template>
  <div class="client-order-list">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('orders.orderHistory') }}</h1>
      <div class="header-actions">
        <router-link :to="{ name: 'create-order' }" class="btn btn-primary">
          <i class="material-icons">add</i>
          {{ $t('orders.createOrder') }}
        </router-link>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filter-row">
        <div class="search-container">
          <input
            v-model="searchQuery"
            :placeholder="$t('orders.searchOrders')"
            class="search-input"
            @input="applyFilters"
          />
          <i class="search-icon material-icons">search</i>
        </div>
        
        <div class="filter-container">
          <select v-model="statusFilter" @change="applyFilters" class="status-filter">
            <option value="">{{ $t('orders.filterByStatus') }}</option>
            <option v-for="status in availableStatuses" :key="status.name" :value="status.name">
              {{ status.description }}
            </option>
          </select>
        </div>
        
        <div class="sort-container">
          <select v-model="sortBy" @change="applyFilters" class="sort-select">
            <option value="orderDate-desc">{{ $t('orders.sortBy') }}: {{ $t('common.date') }} ↓</option>
            <option value="orderDate-asc">{{ $t('orders.sortBy') }}: {{ $t('common.date') }} ↑</option>
            <option value="totalPrice-desc">{{ $t('orders.sortBy') }}: {{ $t('common.total') }} ↓</option>
            <option value="totalPrice-asc">{{ $t('orders.sortBy') }}: {{ $t('common.total') }} ↑</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Orders Grid -->
    <div class="orders-content">
      <div v-if="isLoading" class="loading-state">
        <i class="material-icons spinning">refresh</i>
        <p>{{ $t('orders.loadingOrders') }}</p>
      </div>
      
      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <i class="material-icons">shopping_cart</i>
        <h3>{{ $t('orders.noOrders') }}</h3>
        <p>{{ $t('orders.createFirstOrder') }}</p>
        <router-link :to="{ name: 'create-order' }" class="btn btn-primary">
          {{ $t('orders.createOrder') }}
        </router-link>
      </div>
      
      <div v-else class="orders-grid">
        <OrderCard
          v-for="order in paginatedOrders"
          :key="order.orderId"
          :order="order"
          :show-details="true"
          :user-role="userRole"
          @cancel-order="handleCancelOrder"
          @track-order="handleTrackOrder"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-section">
      <div class="pagination-info">
        {{ $t('common.showing') }} {{ startItem }}-{{ endItem }} {{ $t('common.of') }} {{ filteredOrders.length }}
      </div>
      <div class="pagination-controls">
        <button 
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="pagination-btn"
        >
          <i class="material-icons">chevron_left</i>
        </button>
        
        <span class="page-numbers">
          <button 
            v-for="page in visiblePages"
            :key="page"
            :class="['page-btn', { active: page === currentPage }]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </span>
        
        <button 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="pagination-btn"
        >
          <i class="material-icons">chevron_right</i>
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="summary-stats">
      <div class="stat-card">
        <div class="stat-value">{{ orders.length }}</div>
        <div class="stat-label">{{ $t('orders.totalOrders') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ pendingCount }}</div>
        <div class="stat-label">{{ $t('orders.pendingOrders') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatCurrency(totalAmount) }}</div>
        <div class="stat-label">{{ $t('orders.totalSpent') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import OrderCard from '../components/order-card.component.vue'
import { OrderEntity } from '../models/order.entity.js'
import { OrderStatus } from '../models/order-status.enum.js'
import { OrderService } from '../services/order.service.js'
import { AuthService } from '@/features/iam/services/auth.service.js'
import { UxService } from '@/core/services/ux.service.js'

export default {
  name: 'ClientOrderListView',
  components: {
    OrderCard
  },
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    
    // Reactive data
    const orders = ref([])
    const isLoading = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const sortBy = ref('orderDate-desc')
    const currentPage = ref(1)
    const itemsPerPage = 10
    
    // Current user
    const currentUser = AuthService.getCurrentUser()
    const userRole = currentUser?.tenantType || 'CLIENT'
    
    // Available statuses for filter
    const availableStatuses = OrderStatus.getAllStatuses()
    
    // Computed properties
    const filteredOrders = computed(() => {
      let filtered = [...orders.value]
      
      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => 
          order.orderId.toLowerCase().includes(query) ||
          order.shippingAddress.toLowerCase().includes(query)
        )
      }
      
      // Status filter
      if (statusFilter.value) {
        filtered = filtered.filter(order => {
          const orderEntity = new OrderEntity(order)
          return orderEntity.status.name === statusFilter.value
        })
      }
      
      // Sort
      const [field, direction] = sortBy.value.split('-')
      filtered.sort((a, b) => {
        let aValue, bValue
        
        if (field === 'orderDate') {
          aValue = new Date(a.orderDate)
          bValue = new Date(b.orderDate)
        } else if (field === 'totalPrice') {
          aValue = a.totalPrice
          bValue = b.totalPrice
        }
        
        if (direction === 'desc') {
          return bValue > aValue ? 1 : -1
        } else {
          return aValue > bValue ? 1 : -1
        }
      })
      
      return filtered
    })
    
    const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage))
    
    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredOrders.value.slice(start, end)
    })
    
    const startItem = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
    const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, filteredOrders.value.length))
    
    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })
    
    const pendingCount = computed(() => {
      return orders.value.filter(order => {
        const orderEntity = new OrderEntity(order)
        return orderEntity.isPending()
      }).length
    })
    
    const totalAmount = computed(() => {
      return orders.value.reduce((sum, order) => sum + order.totalPrice, 0)
    })
    
    // Methods
    const loadOrders = async () => {
      isLoading.value = true
      try {
        const response = await OrderService.getOrdersByCustomer(currentUser.id)
        orders.value = response.data || []
      } catch (error) {
        console.error('Error loading orders:', error)
        UxService.showSnackbar({
          message: t('orders.errorLoadingOrders'),
          type: 'error'
        })
      } finally {
        isLoading.value = false
      }
    }
    
    const applyFilters = () => {
      currentPage.value = 1 // Reset to first page when filtering
    }
    
    const handleCancelOrder = async (orderId) => {
      try {
        await OrderService.cancelOrder(orderId)
        
        // Update local state
        const orderIndex = orders.value.findIndex(order => order.orderId === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'CANCELLED'
        }
        
        UxService.showSnackbar({
          message: t('orders.orderCancelledSuccess'),
          type: 'success'
        })
      } catch (error) {
        console.error('Error cancelling order:', error)
        UxService.showSnackbar({
          message: t('orders.errorCancellingOrder'),
          type: 'error'
        })
      }
    }
    
    const handleTrackOrder = (orderId) => {
      router.push({
        name: 'order-tracking',
        params: { id: orderId }
      })
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(amount)
    }
    
    // Reset page when filters change
    watch([searchQuery, statusFilter], () => {
      currentPage.value = 1
    })
    
    // Load data on mount
    onMounted(() => {
      loadOrders()
    })
    
    return {
      orders,
      isLoading,
      searchQuery,
      statusFilter,
      sortBy,
      currentPage,
      userRole,
      availableStatuses,
      filteredOrders,
      totalPages,
      paginatedOrders,
      startItem,
      endItem,
      visiblePages,
      pendingCount,
      totalAmount,
      loadOrders,
      applyFilters,
      handleCancelOrder,
      handleTrackOrder,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.client-order-list {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #1565c0;
  transform: translateY(-1px);
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
}

.search-container {
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--color-background-card);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  font-size: 1.25rem;
}

.status-filter,
.sort-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-card);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.status-filter:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.status-filter option,
.sort-select option {
  background: var(--color-background-card);
  color: var(--color-text-primary);
  padding: 0.5rem;
}

.orders-content {
  margin-bottom: 2rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.loading-state i,
.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

.orders-grid {
  display: grid;
  gap: 1.5rem;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.pagination-info {
  color: #666;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #1976d2;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.page-btn:hover {
  background-color: #f5f5f5;
  border-color: #1976d2;
}

.page-btn.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .client-order-list {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .search-container {
    max-width: none;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>
