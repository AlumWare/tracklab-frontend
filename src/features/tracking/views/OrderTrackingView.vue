<template>
  <div class="order-tracking-view">
    <!-- Header -->
    <div class="tracking-header">
      <div class="header-content">
        <button @click="$router.go(-1)" class="back-button">
          <i class="material-icons">arrow_back</i>
          {{ $t('common.back') }}
        </button>
        <div class="order-info">
          <h1 class="page-title">{{ $t('tracking.orderTracking') }}</h1>
          <p class="order-id">{{ $t('tracking.orderNumber') }}: {{ orderId }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <i class="material-icons spinning">refresh</i>
      </div>
      <p>{{ $t('tracking.loadingTrackingInfo') }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="trackingData" class="tracking-content">
      <!-- Order Summary Card -->
      <div class="summary-card">
        <div class="card-header">
          <h2>{{ $t('tracking.orderSummary') }}</h2>
          <OrderStatusChip 
            :status="trackingData.order.status"
            size="large"
          />
        </div>
        <div class="card-body">
          <div class="summary-grid">
            <div class="summary-item">
              <i class="material-icons">location_on</i>
              <div>
                <span class="label">{{ $t('tracking.destination') }}</span>
                <span class="value">{{ trackingData.order.shippingAddress }}</span>
              </div>
            </div>
            <div class="summary-item">
              <i class="material-icons">schedule</i>
              <div>
                <span class="label">{{ $t('tracking.estimatedDelivery') }}</span>
                <span class="value">{{ formatDate(trackingData.order.deliveryDate) }}</span>
              </div>
            </div>
            <div class="summary-item">
              <i class="material-icons">local_shipping</i>
              <div>
                <span class="label">{{ $t('tracking.logisticsProvider') }}</span>
                <span class="value">{{ trackingData.order.logisticsProvider }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Container Information -->
      <div v-if="trackingData.containers?.length > 0" class="containers-section">
        <h2>{{ $t('tracking.containers') }}</h2>
        <div class="containers-grid">
          <div 
            v-for="container in trackingData.containers" 
            :key="container.containerId"
            class="container-card"
          >
            <div class="container-header">
              <h3>{{ container.containerId }}</h3>
              <span class="container-weight">{{ container.getFormattedWeight() }}</span>
            </div>
            <div class="container-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: container.getProgressPercentage() + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ container.getProgressPercentage() }}% {{ $t('common.completed') }}</span>
            </div>
            <div v-if="container.hasQRCode()" class="qr-code-indicator">
              <i class="material-icons">qr_code</i>
              <span>{{ $t('tracking.qrCodeAvailable') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Route Information -->
      <div v-if="trackingData.routes?.length > 0" class="routes-section">
        <h2>{{ $t('tracking.route') }}</h2>
        <div class="route-timeline">
          <div 
            v-for="route in trackingData.routes" 
            :key="route.routeId"
            class="route-item"
          >
            <div class="route-header">
              <h3>{{ route.routeId }}</h3>
              <span class="route-progress">{{ route.getProgressPercentage() }}%</span>
            </div>
            <div class="route-path">
              <div class="warehouse-item">
                <i class="material-icons">store</i>
                <span>{{ route.originWarehouse }}</span>
              </div>
              <div class="route-arrow">
                <i class="material-icons">arrow_forward</i>
              </div>
              <div class="warehouse-item">
                <i class="material-icons">store</i>
                <span>{{ route.destinationWarehouse }}</span>
              </div>
            </div>
            <div v-if="route.getNextWarehouse()" class="next-warehouse">
              <i class="material-icons">place</i>
              <span>{{ $t('tracking.nextDestination') }}: {{ route.getNextWarehouse() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tracking Events Timeline -->
      <div v-if="trackingData.events?.length > 0" class="events-section">
        <h2>{{ $t('tracking.timeline') }}</h2>
        <div class="timeline">
          <div 
            v-for="event in trackingData.events" 
            :key="event.eventId"
            class="timeline-item"
          >
            <div class="timeline-marker" :class="event.getEventColor()">
              <i class="material-icons">{{ event.getEventIcon() }}</i>
            </div>
            <div class="timeline-content">
              <div class="event-header">
                <h4>{{ event.getEventTypeInSpanish() }}</h4>
                <span class="event-time">{{ event.getTimeAgo() }}</span>
              </div>
              <div class="event-details">
                <p class="event-location">
                  <i class="material-icons">place</i>
                  {{ event.warehouseId }}
                </p>
                <p class="event-timestamp">{{ event.getFormattedEventTime() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No tracking data -->
      <div v-if="!trackingData.events?.length && !trackingData.containers?.length" class="no-tracking-data">
        <i class="material-icons">info</i>
        <h3>{{ $t('tracking.noTrackingData') }}</h3>
        <p>{{ $t('tracking.noTrackingDataMessage') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <i class="material-icons">error</i>
      <h3>{{ $t('tracking.errorTitle') }}</h3>
      <p>{{ $t('tracking.errorMessage') }}</p>
      <button @click="loadTrackingData" class="retry-button">
        {{ $t('common.retry') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { OrderStatusChip } from '@/features/orders/components'
import { ContainerEntity, RouteEntity, TrackingEventEntity } from '../models'
import { TrackingService } from '../services/tracking.service.js'
import { UxService } from '@/core/services/ux.service.js'

export default {
  name: 'OrderTrackingView',
  components: {
    OrderStatusChip
  },
  setup() {
    const route = useRoute()
    const { t } = useI18n()
    
    // Reactive data
    const isLoading = ref(false)
    const trackingData = ref(null)
    const error = ref(null)
    
    // Computed
    const orderId = computed(() => route.params.id)
    
    // Methods
    const loadTrackingData = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        const response = await TrackingService.getOrderTracking(orderId.value)
        
        // Transform data using entities
        trackingData.value = {
          order: response.order,
          containers: response.containers?.map(container => new ContainerEntity(container)) || [],
          routes: response.routes?.map(route => new RouteEntity(route)) || [],
          events: response.events?.map(event => new TrackingEventEntity(event)) || []
        }
        
      } catch (err) {
        console.error('Error loading tracking data:', err)
        error.value = err
        UxService.showSnackbar({
          message: t('tracking.errorLoadingData'),
          type: 'error'
        })
      } finally {
        isLoading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    // Load data on mount
    onMounted(() => {
      loadTrackingData()
    })
    
    return {
      isLoading,
      trackingData,
      error,
      orderId,
      loadTrackingData,
      formatDate
    }
  }
}
</script>

<style scoped>
.order-tracking-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tracking-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #f5f5f5;
}

.order-info {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.order-id {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #1976d2;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tracking-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.card-body {
  padding: 1.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-item i {
  color: #1976d2;
  font-size: 1.5rem;
}

.summary-item .label {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.summary-item .value {
  display: block;
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 500;
}

.containers-section,
.routes-section,
.events-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.containers-section h2,
.routes-section h2,
.events-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.containers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.container-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.container-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a1a1a;
}

.container-weight {
  background: #1976d2;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.container-progress {
  margin-bottom: 1rem;
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
  background: linear-gradient(90deg, #4caf50, #81c784);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
}

.qr-code-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1976d2;
  font-size: 0.875rem;
}

.route-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.route-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.route-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a1a1a;
}

.route-progress {
  background: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.route-path {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.warehouse-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  flex: 1;
}

.route-arrow {
  color: #666;
  font-size: 1.5rem;
}

.next-warehouse {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1976d2;
  font-size: 0.875rem;
  font-weight: 500;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e9ecef;
  color: #666;
}

.timeline-marker.green {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.timeline-marker.blue {
  background: #2196f3;
  border-color: #2196f3;
  color: white;
}

.timeline-marker.orange {
  background: #ff9800;
  border-color: #ff9800;
  color: white;
}

.timeline-content {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.event-header h4 {
  margin: 0;
  font-size: 1.125rem;
  color: #1a1a1a;
}

.event-time {
  color: #666;
  font-size: 0.875rem;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-location,
.event-timestamp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.no-tracking-data {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.no-tracking-data i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.no-tracking-data h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.error-container i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #f44336;
}

.error-container h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.retry-button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  margin-top: 1rem;
}

.retry-button:hover {
  background: #1565c0;
}

@media (max-width: 768px) {
  .order-tracking-view {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .containers-grid {
    grid-template-columns: 1fr;
  }
  
  .route-path {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .route-arrow {
    transform: rotate(90deg);
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style> 