<template>
  <div class="route-planning-view">
    <aside class="sidebar">
      <div class="tabs">
        <button :class="{ active: activeTab === 'plan' }" @click="activeTab = 'plan'">Planificar Ruta</button>
        <button :class="{ active: activeTab === 'saved' }" @click="activeTab = 'saved'">Rutas Guardadas</button>
      </div>
      <div v-if="activeTab === 'plan'">
        <h3>Secuencia de Paradas</h3>
        <button class="reorder-btn" :class="{ active: isReordering }" @click="toggleReorder">
          <span v-if="!isReordering">🔀 Reorganizar secuencia</span>
          <span v-else>✅ Finalizar reorganización</span>
        </button>
        <draggable v-model="routeNodes" @end="onReorder" item-key="id" :disabled="!isReordering">
          <template #item="{ element, index }">
            <div class="stop-item" :class="{ reordering: isReordering }">
              <span class="node-dot" :style="{ background: getNodeColor(element.type) }"></span>
              <div class="stop-info">
                <span class="stop-name">{{ element.name }}</span>
                <span class="stop-type">({{ getTypeLabel(element.type) }})</span>
              </div>
              <button class="remove-btn" @click="removeNode(index)">➖</button>
            </div>
          </template>
        </draggable>
        <button class="add-btn" @click="showAddNodeModal = true">➕ Añadir nodo</button>
        <button class="save-btn" @click="saveRoute">💾 Guardar ruta</button>
      </div>
      <div v-else>
        <h3>Rutas Guardadas</h3>
        <div v-if="savedRoutes.length === 0" class="empty-saved">No hay rutas guardadas.</div>
        <div v-for="(route, idx) in savedRoutes" :key="route.id" class="saved-route-item">
          <div class="saved-route-info">
            <span class="saved-route-name">Ruta #{{ idx + 1 }}</span>
            <span class="saved-route-stops">({{ route.nodes.length }} paradas)</span>
          </div>
          <div class="saved-route-actions">
            <button class="load-btn" @click="loadSavedRoute(route)">✏️ Modificar</button>
            <button class="delete-btn" @click="deleteSavedRoute(route.id)">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    </aside>
    <section class="canvas-section">
      <canvas ref="routeCanvas" width="800" height="600"></canvas>
    </section>
    <AddNodeModal
      v-if="showAddNodeModal"
      :available-nodes="availableNodes"
      @add="addNode"
      @close="showAddNodeModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useWarehouseStore } from '../stores/warehouseStore'
import draggable from 'vuedraggable'
import AddNodeModal from '../components/AddNodeModal.vue'

const warehouseStore = useWarehouseStore()
const routeNodes = ref([])
const showAddNodeModal = ref(false)
const routeCanvas = ref(null)
const isReordering = ref(false)
const activeTab = ref('plan')

const savedRoutes = ref([])

const availableNodes = computed(() => {
  // Excluir los nodos ya seleccionados en la ruta
  const selectedIds = routeNodes.value.map(n => n.id)
  return warehouseStore.warehouses.filter(w => !selectedIds.includes(w.id))
})

function getNodeColor(type) {
  if (type === 'own') return '#42A5F5'
  if (type === 'provider') return '#66BB6A'
  if (type === 'client') return '#FFF176'
  return '#1E88E5'
}
function getTypeLabel(type) {
  if (type === 'own') return 'Propio'
  if (type === 'provider') return 'Proveedor'
  if (type === 'client') return 'Cliente'
  return type
}

function addNode(node) {
  routeNodes.value.push(node)
  showAddNodeModal.value = false
  nextTick(drawRoute)
}
function removeNode(idx) {
  routeNodes.value.splice(idx, 1)
  nextTick(drawRoute)
}
function onReorder() {
  nextTick(drawRoute)
}
function saveRoute() {
  // Guardar como nueva ruta
  const all = getAllSavedRoutes()
  const newRoute = {
    id: Date.now().toString(),
    nodes: JSON.parse(JSON.stringify(routeNodes.value))
  }
  all.push(newRoute)
  localStorage.setItem('plannedRoutes', JSON.stringify(all))
  savedRoutes.value = all
  alert('Ruta guardada correctamente')
}
function getAllSavedRoutes() {
  const raw = localStorage.getItem('plannedRoutes')
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr
  } catch {/* linter: catch eliminado */}
  return []
}
function loadSavedRoute(route) {
  routeNodes.value = JSON.parse(JSON.stringify(route.nodes))
  activeTab.value = 'plan'
  nextTick(drawRoute)
}
function deleteSavedRoute(id) {
  let all = getAllSavedRoutes()
  all = all.filter(r => r.id !== id)
  localStorage.setItem('plannedRoutes', JSON.stringify(all))
  savedRoutes.value = all
}
function toggleReorder() {
  isReordering.value = !isReordering.value
}

function drawRoute() {
  const canvas = routeCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // Parámetros de layout
  const margin = 80
  const nodeRadius = 28
  const total = routeNodes.value.length
  if (total === 0) return
  // Distribuir nodos en círculo
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - margin
  const positions = routeNodes.value.map((node, i) => {
    const angle = (2 * Math.PI * i) / total - Math.PI / 2
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      node
    }
  })
  // Dibujar líneas
  ctx.strokeStyle = '#1E88E5'
  ctx.lineWidth = 4
  ctx.beginPath()
  for (let i = 0; i < positions.length; i++) {
    const { x, y } = positions[i]
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  // Dibujar nodos
  positions.forEach(({ x, y, node }, idx) => {
    // Círculo
    ctx.beginPath()
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI)
    ctx.fillStyle = getNodeColor(node.type)
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1E88E5'
    ctx.stroke()
    // Nombre
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.name, x, y)
    // Tipo
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#1E88E5'
    ctx.fillText(getTypeLabel(node.type), x, y + nodeRadius + 14)
    // Índice
    ctx.beginPath()
    ctx.arc(x + nodeRadius - 12, y - nodeRadius + 12, 12, 0, 2 * Math.PI)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.strokeStyle = '#42A5F5'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#1E88E5'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(idx + 1, x + nodeRadius - 12, y - nodeRadius + 12)
  })
}

onMounted(() => {
  warehouseStore.fetchWarehouses()
  savedRoutes.value = getAllSavedRoutes()
  nextTick(drawRoute)
})
watch(routeNodes, () => nextTick(drawRoute), { deep: true })
</script>

<style scoped>
.route-planning-view {
  display: flex;
  height: 100vh;
  background: #F5F5F5;
}
.sidebar {
  width: 340px;
  background: #FFFFFF;
  padding: 2rem 1.2rem 1.2rem 1.2rem;
  border-right: 2px solid #1E88E5;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}
.tabs button {
  flex: 1;
  background: #F5F5F5;
  color: #1E88E5;
  border: none;
  border-radius: 6px 6px 0 0;
  padding: 0.7rem 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.tabs button.active {
  background: #42A5F5;
  color: #FFFFFF;
}
.empty-saved {
  color: #8E8E8E;
  font-style: italic;
  margin-bottom: 1rem;
}
.saved-route-item {
  background: #F5F5F5;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #E3F2FD;
}
.saved-route-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.saved-route-name {
  color: #1E88E5;
  font-weight: 600;
}
.saved-route-stops {
  color: #000000;
  font-size: 0.95em;
}
.saved-route-actions {
  display: flex;
  gap: 0.5rem;
}
.load-btn {
  background: #42A5F5;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.load-btn:hover {
  background: #1E88E5;
}
.delete-btn {
  background: #FFF176;
  color: #000000;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #FFD600;
}
.reorder-btn {
  background: #1E88E5;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-weight: 500;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.reorder-btn.active {
  background: #FFF176;
  color: #1E88E5;
}
.stop-item.reordering {
  cursor: move;
  border: 2px solid #42A5F5;
  background: #E3F2FD;
}
.draggable--disabled .stop-item {
  cursor: default;
}
.stop-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #F5F5F5;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.5rem;
  border: 2px solid #E3F2FD;
}
.node-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid #1E88E5;
}
.stop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.stop-name {
  color: #000000;
  font-weight: 500;
}
.stop-type {
  color: #1E88E5;
  font-size: 0.95em;
}
.remove-btn {
  background: #FFF176;
  color: #000000;
  border: none;
  border-radius: 6px;
  padding: 0.2rem 0.7rem;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}
.remove-btn:hover {
  background: #FFD600;
}
.add-btn {
  background: #42A5F5;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  margin-top: 0.7rem;
  cursor: pointer;
  transition: background 0.2s;
}
.add-btn:hover {
  background: #1E88E5;
}
.save-btn {
  background: #66BB6A;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  margin-top: 0.7rem;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:hover {
  background: #388E3C;
}
.canvas-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F5F5F5;
}
canvas {
  background: #FFFFFF;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(66,165,245,0.10);
  border: 2px solid #42A5F5;
}
</style>
