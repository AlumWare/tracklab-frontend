<template>
  <div class="order-details-container">
    <div v-if="selectedOrder" class="details-layout">
      <!-- Columna Izquierda -->
      <div class="left-column">
        <div class="order-details-card">
          <div class="header">
            <h2>Detalles de la Orden #{{ selectedOrder.id }}</h2>
            <div class="status-badge" :class="selectedOrder.status">
              {{ statusLabel(selectedOrder.status) }}
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <label>Destino:</label>
              <span>{{ selectedOrder.destination }}</span>
            </div>
            <div class="detail-item">
              <label>Fecha:</label>
              <span>{{ selectedOrder.date }}</span>
            </div>
          </div>

          <!-- Fecha de última actualización -->
          <div class="last-update-section">
            <span class="last-update-label">Última Actualización:</span>
            <span class="last-update-value">{{ selectedOrder.date }}</span>
          </div>

          <!-- Lista de Materiales -->
          <div class="materials-section">
            <h3>Materiales</h3>
            <div class="materials-list">
              <div v-for="(material, index) in selectedOrder.materials" :key="index" class="material-item">
                <div class="material-info">
                  <span class="material-name">{{ material.name }}</span>
                  <span class="material-quantity">
                    {{ material.quantity }} {{ material.unit }} ({{ material.delivered }} entregados)
                  </span>
                </div>
                <div class="material-status">
                  <span class="status-badge" :class="getMaterialStatusClass(material)">
                    {{ getMaterialStatusLabel(material) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="progress-section">
            <h3>Progreso de Entrega</h3>
            <div class="progress-bar-container">
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: progress(selectedOrder) + '%' }"
                  :class="progressColor(selectedOrder)"
                ></div>
              </div>
              <span class="progress-label">{{ progress(selectedOrder) }}%</span>
            </div>
            <div class="delivery-info">
              <p>Entregados: {{ selectedOrder.deliveredItems }} de {{ selectedOrder.totalItems }}</p>
            </div>
          </div>

          <div class="actions">
            <button class="back-btn" @click="goBack">Volver</button>
            <button
              v-if="selectedOrder.status === 'pending'"
              class="cancel-btn"
              @click="confirmCancel"
            >
              Cancelar Orden
            </button>
          </div>
        </div>
      </div>

      <!-- Columna Derecha - Timeline -->
      <div class="right-column">
        <div class="timeline-card">
          <h3>Timeline de Operaciones</h3>
          <div v-if="selectedOrder.status === 'pending'" class="timeline-pending-msg">
            <span>El pedido empezará pronto.</span>
          </div>
          <div v-else class="timeline">
            <div v-for="(operation, index) in operations" :key="index" class="timeline-item">
              <div class="timeline-icon" :class="operation.type">
                <i :class="getOperationIcon(operation.type)"></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4>{{ operation.title }}</h4>
                  <span class="timestamp">{{ operation.timestamp }}</span>
                </div>
                <p>{{ operation.description }}</p>
                <button class="view-photos-btn" @click="viewPhotos(operation)">
                  <i class="pi pi-camera"></i> Ver Fotos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-order">
      <h3>No se ha seleccionado ninguna orden</h3>
      <button class="back-btn" @click="goBack">Volver a la lista</button>
    </div>

    <!-- Modal de Fotos -->
    <div v-if="showPhotosModal" class="modal-overlay">
      <div class="modal photos-modal">
        <h3>Fotos de {{ selectedOperation?.title }}</h3>
        <div class="photos-grid">
          <div v-for="(photo, index) in 3" :key="index" class="photo-item">
            <img src="@/assets/logo.svg" alt="Foto de operación" />
          </div>
        </div>
        <button class="close-btn" @click="showPhotosModal = false">Cerrar</button>
      </div>
    </div>

    <!-- Modal de confirmación de cancelación -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal">
        <p>¿Estás seguro de que deseas cancelar la orden #{{ selectedOrder?.id }}?</p>
        <div class="modal-actions">
          <button @click="showCancelModal = false">No</button>
          <button class="cancel-btn" @click="cancelOrder">Sí, cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order.store'
import { OrderEntity } from '../models/order.entity'
import { OrderStatus } from '../models/order-status.enum'

const router = useRouter()
const orderStore = useOrderStore()
const showCancelModal = ref(false)
const showPhotosModal = ref(false)
const selectedOperation = ref(null)

const selectedOrder = computed(() => orderStore.getSelectedOrder)

// Timeline dinámico según el estado de la orden
const operations = computed(() => {
  if (!selectedOrder.value) return []
  if (selectedOrder.value.status.isPending()) {
    return []
  }
  
  const base = [
    {
      type: 'pickup',
      title: 'Recogida en almacén',
      description: 'Los materiales han sido recogidos del almacén',
      completed: true,
      timestamp: '2024-06-01 09:00'
    },
    {
      type: 'transit',
      title: 'En tránsito',
      description: 'Los materiales están siendo transportados',
      completed: selectedOrder.value.status.isInProcess() || selectedOrder.value.status.isDelivered(),
      timestamp: selectedOrder.value.status.isInProcess() || selectedOrder.value.status.isDelivered() ? '2024-06-01 10:30' : null
    }
  ]
  if (selectedOrder.value.status.isDelivered()) {
    base.push({
      type: 'final',
      title: 'Entregado',
      description: 'Los materiales han sido entregados exitosamente',
      completed: true,
      timestamp: '2024-06-01 14:00'
    })
  }
  return base
})

function getOperationIcon(type) {
  switch (type) {
    case 'pickup':
      return 'pi pi-box'
    case 'transfer':
      return 'pi pi-truck'
    case 'delivery':
      return 'pi pi-check-circle'
    case 'final':
      return 'pi pi-check-circle'
    default:
      return 'pi pi-info-circle'
  }
}

function viewPhotos(operation) {
  selectedOperation.value = operation
  showPhotosModal.value = true
}

function statusLabel(status) {
  return status.description
}

function progress(order) {
  if (!order.totalItems || order.totalItems === 0) return 0
  let percent = Math.ceil((order.deliveredItems / order.totalItems) * 100)
  if (percent > 100) percent = 100
  if (percent < 0) percent = 0
  return percent
}

function progressColor(order) {
  const p = progress(order)
  if (p === 100) return 'progress-green-dark'
  if (p >= 50) return 'progress-green-light'
  if (p > 0) return 'progress-yellow'
  return 'progress-gray'
}

function goBack() {
  router.push('/orders')
}

function confirmCancel() {
  showCancelModal.value = true
}

function cancelOrder() {
  if (selectedOrder.value) {
    orderStore.deleteOrder(selectedOrder.value.id)
    showCancelModal.value = false
    goBack()
  }
}

// Función para determinar el estado de un material
function getMaterialStatusLabel(material) {
  if (material.delivered === 0) return 'Pendiente'
  if (material.delivered >= material.quantity) return 'Entregado'
  return 'En Proceso'
}

function getMaterialStatusClass(material) {
  if (material.delivered === 0) return 'pending'
  if (material.delivered >= material.quantity) return 'delivered'
  return 'inprocess'
}
</script>

<style scoped>
.order-details-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.details-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.left-column {
  min-width: 0;
}

.right-column {
  min-width: 0;
}

.order-details-card,
.timeline-card {
  background: #42A5F5;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.status-badge.pending {
  background: #ffe97a;
  color: #333;
}

.status-badge.inprocess {
  background: #ffecb3;
  color: #b26a00;
}

.status-badge.delivered {
  background: #c8f7c5;
  color: #1e5631;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label,
.last-update-label {
  color: #222;
}

.detail-item span,
.last-update-value {
  color: #111;
}

/* Estilos para la lista de materiales */
.materials-section {
  margin: 2rem 0;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.material-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.material-name {
  font-weight: 600;
  color: #333;
}

.material-quantity {
  color: #666;
  font-size: 0.875rem;
}

.material-delivered {
  color: #666;
  font-size: 0.95rem;
  margin-top: 0.2rem;
}

.material-status {
  min-width: 100px;
  text-align: right;
}

.progress-section {
  margin-bottom: 2rem;
}

.progress-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.progress-bar-bg {
  flex: 1;
  height: 12px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.4s;
}

.progress-bar-fill.progress-yellow {
  background: #ffe97a;
}

.progress-bar-fill.progress-green-light {
  background: #a8e6a3;
}

.progress-bar-fill.progress-green-dark {
  background: #1e5631;
}

.progress-bar-fill.progress-gray {
  background: #e0e0e0;
}

.progress-label {
  min-width: 48px;
  text-align: right;
  font-weight: 600;
}

.delivery-info {
  color: #111;
}

/* Timeline */
.timeline {
  position: relative;
  padding: 1rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
}

.timeline-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  flex-shrink: 0;
}

.timeline-icon.pickup {
  background: #e3f2fd;
  color: #1976d2;
}

.timeline-icon.transfer {
  background: #fff3e0;
  color: #f57c00;
}

.timeline-icon.delivery {
  background: #e8f5e9;
  color: #2e7d32;
}

.timeline-icon.final {
  background: #e0f7fa;
  color: #00796b;
}

.timeline-content {
  flex: 1;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-header h4 {
  margin: 0;
  color: #333;
}

.timestamp {
  font-size: 0.875rem;
  color: #666;
}

.view-photos-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-photos-btn:hover {
  background: #bbdefb;
}

/* Modal de Fotos */
.photos-modal {
  max-width: 800px;
  width: 90%;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.photo-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.close-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.back-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background: #fff;
  color: #333;
  border: none;
}

.back-btn:hover {
  background: #e0e0e0;
}

.cancel-btn {
  background: #ff5252;
  color: white;
  border: none;
}

.cancel-btn:hover {
  background: #d32f2f;
}

.no-order {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  min-width: 320px;
  text-align: center;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.last-update-section {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: #444;
}
.last-update-label {
  font-weight: 600;
  margin-right: 0.5rem;
}
.last-update-value {
  color: #111;
}

.timeline-pending-msg {
  padding: 2rem 1rem;
  text-align: center;
  color: #888;
  font-size: 1.1rem;
}
</style>
