<template>
  <div class="order-card" :class="{ 'expandable': showDetails }">
    <div class="order-header" @click="toggleDetails">
      <div class="order-main-info">
        <h3 class="order-id">{{ $t('orders.order') }} #{{ orderEntity.orderId }}</h3>
        <p class="order-date">{{ orderEntity.getFormattedDate() }}</p>
      </div>
      
      <div class="order-status-section">
        <OrderStatusChip :status="orderEntity.status" size="medium" />
      </div>
      
      <div class="order-summary">
        <p class="order-price">{{ orderEntity.getFormattedPrice() }}</p>
        <p class="order-items">{{ $t('orders.items', { count: orderEntity.getTotalItems() }) }}</p>
      </div>
      
      <div class="order-actions">
        <button 
          v-if="showDetails"
          class="toggle-btn"
          :aria-label="$t('common.toggleDetails')"
        >
          <i class="material-icons">{{ expanded ? 'expand_less' : 'expand_more' }}</i>
        </button>
      </div>
    </div>
    
    <div v-if="expanded" class="order-details">
      <div class="order-info-grid">
        <div class="info-section">
          <h4>{{ $t('orders.shippingInfo') }}</h4>
          <p class="shipping-address">
            <i class="material-icons">location_on</i>
            {{ orderEntity.shippingAddress }}
          </p>
        </div>
        
        <div class="info-section">
          <h4>{{ $t('orders.orderItems') }}</h4>
          <div class="items-list">
            <div 
              v-for="item in orderEntity.orderItems" 
              :key="item.id"
              class="item-row"
            >
              <span class="item-name">{{ item.productName || `${$t('orders.product')} ${item.productId}` }}</span>
              <span class="item-quantity">{{ $t('orders.quantity') }}: {{ item.quantity }}</span>
              <span class="item-price">{{ formatPrice(item.priceAmount, item.priceCurrency) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-actions-expanded">
        <button 
          v-if="canCancel"
          class="btn btn-danger"
          @click="handleCancelOrder"
        >
          {{ $t('orders.cancelOrder') }}
        </button>
        
        <button 
          class="btn btn-primary"
          @click="viewOrderDetails"
        >
          {{ $t('orders.viewDetails') }}
        </button>
        
        <button 
          v-if="canTrack"
          class="btn btn-secondary"
          @click="trackOrder"
        >
          {{ $t('orders.trackOrder') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { OrderEntity } from '../models/order.entity.js'
import { UxService } from '@/core/services/ux.service.js'
import OrderStatusChip from './order-status-chip.vue'

export default {
  name: 'OrderCard',
  components: {
    OrderStatusChip
  },
  props: {
    order: {
      type: Object,
      required: true
    },
    showDetails: {
      type: Boolean,
      default: true
    },
    userRole: {
      type: String,
      default: 'CLIENT'
    }
  },
  emits: ['cancel-order', 'track-order'],
  setup(props, { emit }) {
    const router = useRouter()
    const { t } = useI18n()
    const expanded = ref(false)
    
    const orderEntity = computed(() => new OrderEntity(props.order))
    
    const canCancel = computed(() => {
      return props.userRole === 'CLIENT' && 
             (orderEntity.value.isPending() || orderEntity.value.isInProgress())
    })
    
    const canTrack = computed(() => {
      return orderEntity.value.isShipped() || orderEntity.value.isDelivered()
    })
    
    const toggleDetails = () => {
      if (props.showDetails) {
        expanded.value = !expanded.value
      }
    }
    
    const formatPrice = (amount, currency = 'PEN') => {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency
      }).format(amount)
    }
    
    const handleCancelOrder = async () => {
      try {
        const confirmed = await UxService.showConfirmDialog({
          title: t('orders.cancelOrderTitle'),
          message: t('orders.cancelOrderMessage', { orderId: orderEntity.value.orderId }),
          confirmText: t('common.confirm'),
          cancelText: t('common.cancel')
        })
        
        if (confirmed) {
          emit('cancel-order', orderEntity.value.orderId)
          UxService.showSnackbar({
            message: t('orders.orderCancelledSuccess'),
            type: 'success'
          })
        }
      } catch (error) {
        // Usuario canceló la acción
      }
    }
    
    const viewOrderDetails = () => {
      router.push({
        name: 'order-details',
        params: { id: orderEntity.value.orderId }
      })
    }
    
    const trackOrder = () => {
      emit('track-order', orderEntity.value.orderId)
      router.push({
        name: 'order-tracking',
        params: { id: orderEntity.value.orderId }
      })
    }
    
    return {
      orderEntity,
      expanded,
      canCancel,
      canTrack,
      toggleDetails,
      formatPrice,
      handleCancelOrder,
      viewOrderDetails,
      trackOrder
    }
  }
}
</script>

<style scoped>
.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.order-card.expandable {
  cursor: pointer;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.order-main-info {
  flex: 1;
}

.order-id {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.order-date {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.order-status-section {
  flex: 0 0 auto;
  margin: 0 1rem;
}

.order-summary {
  text-align: right;
  flex: 0 0 auto;
  margin-right: 1rem;
}

.order-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
}

.order-items {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.order-actions {
  flex: 0 0 auto;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.toggle-btn:hover {
  background-color: var(--color-background-hover);
}

.toggle-btn .material-icons {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
}

.order-details {
  padding: 1.5rem;
  background: var(--color-background-secondary);
  border-top: 1px solid var(--color-border);
}

.order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.info-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
}

.shipping-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.shipping-address .material-icons {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.item-row:hover {
  background-color: var(--color-background-hover);
}

.item-name {
  font-weight: 500;
  color: var(--color-text-primary);
  flex: 1;
}

.item-quantity {
  color: var(--color-text-secondary);
  margin: 0 1rem;
  font-size: 0.9rem;
}

.item-price {
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

.order-actions-expanded {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-background-hover);
  border-color: var(--color-primary);
}

.btn-danger {
  background-color: var(--color-error);
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .order-status-section,
  .order-summary {
    margin: 0;
  }

  .order-info-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .order-actions-expanded {
    flex-direction: column;
  }

  .item-row {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .item-quantity,
  .item-price {
    margin: 0;
  }
}

.expandable .order-header {
  cursor: pointer;
}

.order-main-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-id {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.order-date {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.order-summary {
  text-align: right;
}

.order-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
}

.order-items {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.toggle-btn:hover {
  background-color: #f5f5f5;
}

.order-details {
  border-top: 1px solid #e0e0e0;
  padding: 1rem;
  background-color: #fafafa;
}

.order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
}

.info-section h4 {
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.shipping-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #666;
}

.shipping-address i {
  font-size: 1rem;
  color: #666;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.item-name {
  font-weight: 500;
}

.item-quantity {
  color: #666;
}

.item-price {
  font-weight: 600;
  color: #2e7d32;
}

.order-actions-expanded {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-secondary {
  background-color: #757575;
  color: white;
}

.btn-secondary:hover {
  background-color: #616161;
}

.btn-danger {
  background-color: #d32f2f;
  color: white;
}

.btn-danger:hover {
  background-color: #c62828;
}

@media (max-width: 768px) {
  .order-header {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .order-info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .item-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style> 