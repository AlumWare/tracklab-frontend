<template>
  <div class="order-list-container">
    <h2 class="order-list-title">Mis Órdenes</h2>

    <!-- Filtros -->
    <div class="filters">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por producto, destino o cantidad"
        class="filter-input"
      />
      <select v-model="filterStatus" class="filter-select">
        <option value="">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="inprocess">En Proceso</option>
        <option value="delivered">Entregado</option>
      </select>
    </div>

    <div v-for="order in filteredOrders" :key="order.id" class="order-card">
      <div class="order-status-circle" :class="order.status">
        {{ statusLabel(order.status) }}
      </div>
      <div class="order-info" @click="viewOrder(order)">
        <div class="order-product">
          <strong>Producto:</strong> {{ order.product }}
        </div>
        <div>
          <strong>Cantidad:</strong> {{ order.quantity }}
          ({{ order.deliveredItems }} entregados)
        </div>
        <div><strong>Destino:</strong> {{ order.destination }}</div>
        <!-- Barra de progreso -->
        <div class="progress-bar-container">
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ width: progress(order) + '%' }"
              :class="progressColor(order)"
            ></div>
          </div>
          <span class="progress-label">{{ progress(order) }}%</span>
        </div>
      </div>
      <div class="order-actions">
        <button
          v-if="order.status === 'pending'"
          class="cancel-btn"
          @click.stop="confirmCancel(order)"
        >
          Cancelar
        </button>
        <div class="order-state-btn" :class="order.status">
          {{ statusLabel(order.status) }}
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de cancelación -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal">
        <p>¿Estás seguro de que deseas cancelar la orden <b>#{{ orderToCancel?.id }}</b>?</p>
        <div class="modal-actions">
          <button @click="showCancelModal = false">No</button>
          <button class="cancel-btn" @click="cancelOrder">Sí, cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Order } from '../models/order.entity'

const orders = ref([
  new Order({
    id: 1,
    status: Order.STATUS.PENDING,
    date: '2024-06-01',
    product: 'Filtros para maquinaria pesada',
    quantity: '60 unidades',
    totalItems: 60,
    deliveredItems: 0,
    destination: 'Proyecto Minero Cerro Verde – Arequipa'
  }),
  new Order({
    id: 2,
    status: Order.STATUS.PENDING,
    date: '2024-06-02',
    product: 'Paneles de drywall',
    quantity: '100 paneles',
    totalItems: 100,
    deliveredItems: 0,
    destination: 'Almacén de materiales – San Juan de Lurigancho'
  }),
  new Order({
    id: 3,
    status: Order.STATUS.IN_PROCESS,
    date: '2024-06-03',
    product: 'Sacos de cal industrial',
    quantity: '120 sacos',
    totalItems: 120,
    deliveredItems: 60,
    destination: 'Central de procesamiento – Huancayo'
  }),
  new Order({
    id: 4,
    status: Order.STATUS.DELIVERED,
    date: '2024-06-04',
    product: 'Tuberías de PVC',
    quantity: '20 tubos',
    totalItems: 20,
    deliveredItems: 20,
    destination: 'Obra Nueva Esperanza – Lima'
  }),
  new Order({
    id: 5,
    status: Order.STATUS.PENDING,
    date: '2024-06-05',
    product: 'Cemento Portland',
    quantity: '50 bolsas',
    totalItems: 50,
    deliveredItems: 0,
    destination: 'Almacén principal – Callao'
  }),
  new Order({
    id: 6,
    status: Order.STATUS.IN_PROCESS,
    date: '2024-06-06',
    product: 'Ladrillos King Kong',
    quantity: '1000 unidades',
    totalItems: 1000,
    deliveredItems: 420,
    destination: 'Proyecto Residencial – Miraflores'
  }),
  new Order({
    id: 7,
    status: Order.STATUS.DELIVERED,
    date: '2024-06-07',
    product: 'Pintura acrílica blanca',
    quantity: '30 galones',
    totalItems: 30,
    deliveredItems: 30,
    destination: 'Almacén de acabados – Surco'
  }),
  new Order({
    id: 8,
    status: Order.STATUS.PENDING,
    date: '2024-06-08',
    product: 'Varillas de acero',
    quantity: '500 varillas',
    totalItems: 500,
    deliveredItems: 0,
    destination: 'Obra San Martín – Trujillo'
  }),
  new Order({
    id: 9,
    status: Order.STATUS.IN_PROCESS,
    date: '2024-06-09',
    product: 'Puertas de madera',
    quantity: '20 puertas',
    totalItems: 20,
    deliveredItems: 0,
    destination: 'Proyecto Casas del Sol – Arequipa'
  }),
  new Order({
    id: 10,
    status: Order.STATUS.DELIVERED,
    date: '2024-06-10',
    product: 'Vidrios templados',
    quantity: '40 paneles',
    totalItems: 40,
    deliveredItems: 40,
    destination: 'Edificio Empresarial – San Isidro'
  })
])

const search = ref('')
const filterStatus = ref('')
const showCancelModal = ref(false)
const orderToCancel = ref(null)

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesStatus = filterStatus.value ? order.status === filterStatus.value : true
    const searchText = search.value.toLowerCase()
    const matchesSearch =
      order.product.toLowerCase().includes(searchText) ||
      order.destination.toLowerCase().includes(searchText) ||
      order.quantity.toLowerCase().includes(searchText)
    return matchesStatus && matchesSearch
  })
})

function statusLabel(status) {
  switch (status) {
    case Order.STATUS.PENDING: return 'Pendiente'
    case Order.STATUS.IN_PROCESS: return 'En Proceso'
    case Order.STATUS.DELIVERED: return 'Entregado'
    default: return status
  }
}

// Lógica de porcentaje y entregas por viaje
function progress(order) {
  const total = order.totalItems
  const delivered = order.deliveredItems

  if (total < 30) {
    // Si el pedido es menor a 30, solo puede estar 0% o 100%
    return delivered >= total ? 100 : 0
  } else {
    // Si el pedido es de 30 o más, solo cuenta entregas en múltiplos de 30 o 60
    const validDelivered = Math.floor(delivered / 30) * 30
    if (validDelivered === 0) return 0
    let percent = Math.round((validDelivered / total) * 100)
    if (percent > 100) percent = 100
    return percent
  }
}

// Colores de barra según porcentaje
function progressColor(order) {
  const p = progress(order)
  if (p === 100) return 'progress-green-dark'
  if (p >= 50) return 'progress-green-light'
  if (p > 0) return 'progress-yellow'
  return 'progress-gray'
}

function viewOrder(order) {
  alert(`Detalle de la orden #${order.id}\nProducto: ${order.product}\nCantidad: ${order.quantity}\nDestino: ${order.destination}`)
}

function confirmCancel(order) {
  orderToCancel.value = order
  showCancelModal.value = true
}

function cancelOrder() {
  if (orderToCancel.value) {
    orders.value = orders.value.filter(o => o.id !== orderToCancel.value.id)
    showCancelModal.value = false
    orderToCancel.value = null
  }
}
</script>

<style scoped>
.order-list-container {
  background: #55acf7;
  border-radius: 20px;
  padding: 32px 32px 32px 32px;
  width: 98vw;
  max-width: 1800px;
  margin: 32px auto 32px auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.order-list-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 16px;
  font-family: 'Inter', sans-serif;
  color: #fff;
  font-weight: bold;
}
.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.filter-input, .filter-select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #b0c4d6;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
}
.filter-input {
  flex: 2;
}
.filter-select {
  flex: 1;
}
.order-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 24px;
  padding: 20px 28px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  gap: 32px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.order-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.order-status-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #333;
  background: #ffe97a;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.order-status-circle.pending,
.order-state-btn.pending {
  background: #ffe97a;
  color: #333;
}
.order-status-circle.inprocess,
.order-state-btn.inprocess {
  background: #fff3cd;
  color: #856404;
}
.order-status-circle.delivered,
.order-state-btn.delivered {
  background: #c8f7c5;
  color: #1e5631;
}
.order-info {
  flex: 1;
  font-size: 1.1rem;
  font-family: 'Inter', sans-serif;
}
.order-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.order-state-btn {
  min-width: 130px;
  text-align: center;
  padding: 10px 0;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  background: #1976d2;
  color: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.order-state-btn.pending {
  background: #ffe97a;
  color: #333;
  border: 1px solid #e6c200;
}
.order-state-btn.inprocess {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffe97a;
}
.order-state-btn.delivered {
  background: #c8f7c5;
  color: #1e5631;
  border: 1px solid #6fdc8c;
}
.cancel-btn {
  background: #ff5252;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  margin-bottom: 4px;
  transition: background 0.2s;
}
.cancel-btn:hover {
  background: #d32f2f;
}
.progress-bar-container {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress-bar-bg {
  width: 180px;
  height: 12px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
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
  font-size: 0.95rem;
  color: #333;
  min-width: 38px;
  text-align: right;
  font-family: 'Inter', sans-serif;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 32px 24px;
  min-width: 320px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  text-align: center;
}
.modal-actions {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
</style>
