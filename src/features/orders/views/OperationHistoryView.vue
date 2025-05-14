<template>
  <div class="operation-history-view">
    <h1>Historial de Operaciones</h1>
    <div class="filters">
      <select v-model="filters.type" class="filter-select">
        <option value="">Todos los tipos</option>
        <option value="pickup">Pickup</option>
        <option value="traslado">Traslado</option>
      </select>
      <select v-model="filters.node" class="filter-select">
        <option value="">Todos los nodos</option>
        <option v-for="node in uniqueNodes" :key="node" :value="node">{{ node }}</option>
      </select>
      <button @click="resetFilters" class="reset-btn">Limpiar filtros</button>
    </div>

    <div class="timeline-container">
      <div class="timeline-nav">
        <button @click="goPrev" :disabled="!canGoPrev" class="timeline-btn">
          <span class="material-icons">chevron_left</span>
        </button>
        <transition-group name="slide-fade" tag="div" class="timeline">
          <div
            v-for="op in paginatedOperations"
            :key="op.id"
            class="timeline-event"
            :class="op.type"
            @click="showDetails(op)"
          >
            <div class="event-content">
              <div class="event-header">
                <span class="event-type">{{ capitalize(op.type) }}</span>
                <span class="event-date">{{ formatDate(op.date) }}</span>
              </div>
              <div class="event-node">Nodo: {{ op.node }}</div>
            </div>
          </div>
        </transition-group>
        <button @click="goNext" :disabled="!canGoNext" class="timeline-btn">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
      <div class="timeline-indicators">
        <span
          v-for="i in pageCount"
          :key="i"
          :class="['indicator', { active: currentPage === i - 1 }]"
        ></span>
      </div>
    </div>

    <div v-if="selectedEvent" class="modal-overlay" @click.self="selectedEvent = null">
      <div class="modal">
        <h2>Detalle de la operación</h2>
        <p><b>Tipo:</b> {{ capitalize(selectedEvent.type) }}</p>
        <p><b>Fecha:</b> {{ formatDate(selectedEvent.date) }}</p>
        <p><b>Nodo:</b> {{ selectedEvent.node }}</p>
        <p><b>Contenedor asociado:</b> {{ selectedEvent.container }}</p>
        <p><b>ID de Orden:</b> {{ selectedEvent.order?.id }}</p>
        <p><b>Destino:</b> {{ selectedEvent.order?.deliveryAddress }}</p>
        <p><b>Estado:</b> {{ capitalize(selectedEvent.order?.status) }}</p>
        <p><b>Fecha de orden:</b> {{ formatDate(selectedEvent.order?.date) }}</p>
        <p><b>Total de ítems:</b> {{ selectedEvent.order?.totalItems }}</p>
        <p><b>Ítems entregados:</b> {{ selectedEvent.order?.deliveredItems }}</p>
        <div v-if="selectedEvent.order?.items">
          <b>Materiales:</b>
          <ul>
            <li v-for="(mat, i) in selectedEvent.order.items" :key="i">
              {{ mat.description }} - {{ mat.quantity }} kg (Entregados: {{ mat.delivered }})
            </li>
          </ul>
        </div>
        <div v-if="selectedEvent.photos && selectedEvent.photos.length">
          <b>Fotos:</b>
          <div class="photos">
            <img v-for="(photo, i) in selectedEvent.photos" :key="i" :src="photo" alt="Foto operación" />
          </div>
        </div>
        <button @click="selectedEvent = null" class="close-btn">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'OperationHistoryView',
  data() {
    return {
      filters: {
        type: '',
        date: '',
        node: ''
      },
      selectedEvent: null,
      timelineIndex: 0,
      operations: []
    }
  },
  computed: {
    filteredOperations() {
      console.log(this.filters.date);
      return this.operations.filter(op => {
        const matchType = !this.filters.type || op.type === this.filters.type
        //const matchDate = !this.filters.date || op.date === this.filters.date
        const matchNode = !this.filters.node || op.node === this.filters.node
        return matchType && matchNode
      })
    },
    uniqueNodes() {
      return [...new Set(this.operations.map(op => op.node))]
    },
    paginatedOperations() {
      return this.filteredOperations.slice(this.timelineIndex, this.timelineIndex + 4)
    },
    canGoPrev() {
      return this.timelineIndex > 0
    },
    canGoNext() {
      return this.timelineIndex + 4 < this.filteredOperations.length
    },
    pageCount() {
      return Math.ceil(this.filteredOperations.length / 4)
    },
    currentPage() {
      return Math.floor(this.timelineIndex / 4)
    }
  },
  mounted() {
    this.InvocaOperation();
  },
  methods: {
    InvocaOperation() {
      axios.get('http://localhost:3000/operation')
        .then(res => {
          this.operations = res.data
        })
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    showDetails(op) {
      this.selectedEvent = op
    },
    resetFilters() {
      this.filters = { type: '', date: '', node: '' }
      this.timelineIndex = 0
    },
    capitalize(value) {
      if (!value) return ''
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    goPrev() {
      if (this.canGoPrev) this.timelineIndex -= 4
    },
    goNext() {
      if (this.canGoNext) this.timelineIndex += 4
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
.operation-history-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #42A5F5;
  border-radius: 16px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.filter-select, .filter-input {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  font-size: 1rem;
  color: #000;
}
.reset-btn {
  background: #ff5252;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}
.reset-btn:hover {
  background: #e53935;
}

.timeline-container {
  overflow-x: auto;
  padding-bottom: 2rem;
}
.timeline-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}
.timeline-btn {
  background: #fff;
  color: #42A5F5;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  font-size: 2rem;
  cursor: pointer;
  font-weight: bold;
  box-shadow: none;
  border: 2px solid #42A5F5;
  transition: background 0.2s, transform 0.2s, border 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.timeline-btn:disabled {
  background: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
  box-shadow: none;
  border: 2px solid #e0e0e0;
}
.timeline-btn:hover:not(:disabled) {
  transform: scale(1.12);
  border: 2px solid #4CAF50;
}
.timeline {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
  min-width: 700px;
  padding: 2rem 1rem;
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: #1976D2;
  z-index: 0;
  transform: translateY(-50%);
  opacity: 0.5;
}
.timeline-event {
  position: relative;
  z-index: 1;
  min-width: 180px;
  cursor: pointer;
  transition: transform 0.2s;
}
.timeline-event:hover {
  transform: translateY(-8px) scale(1.04);
}
.event-content {
  background: #fff;
  border-radius: 16px;
  padding: 1.2rem;
  margin-top: 2.5rem;
  transition: border 0.2s;
  border: 2px solid transparent;
}
.timeline-event:hover .event-content {
  border: 2px solid #42A5F5;
}
.event-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.event-type {
  color: #42A5F5;
}
.timeline-event.pickup .event-type {
  color: #4CAF50;
}
.timeline-event.traslado .event-type {
  color: #FFA726;
}
.event-date {
  color: #888;
  font-size: 0.95em;
}
.event-node {
  font-size: 0.98em;
  margin-bottom: 0.3em;
}
.event-summary {
  color: #333;
}

.timeline-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #e0e0e0;
  transition: border 0.2s, transform 0.2s;
  box-shadow: none;
}
.indicator.active {
  background: #fff;
  border: 2px solid #42A5F5;
  transform: scale(1.2);
}

/* Animación de slide-fade */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(.25,.8,.25,1);
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 95vw;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  text-align: center;
}
.photos {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  justify-content: center;
}
.photos img {
  max-width: 120px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.close-btn {
  background: #42A5F5;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1.5rem;
  transition: background 0.2s;
}
.close-btn:hover {
  background: #1976D2;
}

@media (max-width: 900px) {
  .timeline {
    min-width: 500px;
    gap: 1.5rem;
  }
  .event-content {
    min-width: 120px;
    padding: 0.7rem;
  }
}
@media (max-width: 600px) {
  .timeline {
    min-width: 0;
    flex-direction: column;
    gap: 2.5rem;
    padding: 1rem 0.2rem;
  }
  .timeline::before {
    top: 0;
    left: 50%;
    width: 4px;
    height: 100%;
    right: auto;
    background: #e0e0e0;
    transform: translateX(-50%);
  }
  .timeline-event {
    min-width: 0;
    margin-left: 0.5rem;
  }
  .event-content {
    margin-top: 1.5rem;
    margin-left: 2.5rem;
  }
}
</style>
