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
        <div class="order-id"><strong>ID:</strong> #{{ order.id }}</div>
        <div>
          <strong>Cantidad:</strong> {{ order.totalItems }} ({{ order.deliveredItems }} entregados)
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
        <p>
          ¿Estás seguro de que deseas cancelar la orden <b>#{{ orderToCancel?.id }}</b
          >?
        </p>
        <div class="modal-actions">
          <button @click="showCancelModal = false">No</button>
          <button class="cancel-btn" @click="cancelOrder">Sí, cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Order } from '../models/order.entity'
import axios from 'axios'

const router = useRouter()

const orderStore = ref([])

const search = ref('')
const filterStatus = ref('')
const showCancelModal = ref(false)
const orderToCancel = ref(null)

onMounted(() => {
  InvocaOrder()
})

const filteredOrders = computed(() => {
  return orderStore.value.filter(order => {
    const matchesStatus = filterStatus.value ? order.status === filterStatus.value : true;

    const searchText = search.value.toLowerCase();
    const matchesSearch =
      order.deliveryAddress.toLowerCase().includes(searchText) ||
      order.logisticsCompany.name.toLowerCase().includes(searchText) ||
      order.id.toString().includes(searchText);

    return matchesStatus && matchesSearch;
  });
});


function InvocaOrder() {
  axios.get('http://localhost:3000/order')
    .then(res => {
      orderStore.value = res.data
    })
}

function statusLabel(status) {
  switch (status) {
    case Order.STATUS.PENDING:
      return 'Pendiente'
    case Order.STATUS.IN_PROCESS:
      return 'En Proceso'
    case Order.STATUS.DELIVERED:
      return 'Entregado'
    default:
      return status
  }
}

function progress(order) {
  if (!order.totalItems || order.totalItems.length === 0) return 0
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

function viewOrder(order) {
  orderStore.setSelectedOrder(order)
  router.push({ name: 'order-details', params: { id: order.id } })
}

function confirmCancel(order) {
  orderToCancel.value = order
  showCancelModal.value = true
}

function cancelOrder() {
  axios.delete(`http://localhost:3000/order/${orderToCancel.value.id}`)
    .then(res => {
      console.log('Order deleted:', res.data);
      orderStore.value = orderStore.value.filter(order => order.id !== orderToCancel.value.id);
      showCancelModal.value = false;
    })
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
.filter-input,
.filter-select {
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
  color: #282828;
}
.order-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 24px;
  padding: 20px 28px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  gap: 32px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
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
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
}
.modal-actions {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
</style>
