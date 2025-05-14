<template>
  <div class="route-planning-view">
    <aside class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <button class="collapse-btn" @click="toggleSidebar">
        <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
      </button>
      <div class="sidebar-content" v-show="!isSidebarCollapsed">
        <div class="tabs">
          <button :class="{ active: activeTab === 'plan' }" @click="activeTab = 'plan'">
            {{ t('routePlanning.tabs.plan') }}
          </button>
          <button :class="{ active: activeTab === 'saved' }" @click="activeTab = 'saved'">
            {{ t('routePlanning.tabs.saved') }}
          </button>
        </div>
        <div v-if="activeTab === 'plan'" class="tab-content">
          <h3>{{ t('routePlanning.sequence.title') }}</h3>
          <div class="route-info" v-if="routeNodes.length > 0">
            <p>{{ t('routePlanning.sequence.estimatedDistance', { distance: routeDistance.toFixed(2) }) }}</p>
          </div>
          <button class="reorder-btn" :class="{ active: isReordering }" @click="toggleReorder">
            <span v-if="!isReordering">{{ t('routePlanning.sequence.reorder') }}</span>
            <span v-else>{{ t('routePlanning.sequence.finishReorder') }}</span>
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
          <button class="add-btn" @click="showAddNodeModal = true">
            {{ t('routePlanning.sequence.addNode') }}
          </button>
          <button class="save-btn" @click="saveRoute">
            {{ t('routePlanning.sequence.saveRoute') }}
          </button>
        </div>
        <div v-else class="tab-content">
          <h3>{{ t('routePlanning.saved.title') }}</h3>
          <div v-if="savedRoutes.length === 0" class="empty-saved">
            {{ t('routePlanning.saved.empty') }}
          </div>
          <div v-for="(route, idx) in savedRoutes" :key="route.id" class="saved-route-item">
            <div class="saved-route-info">
              <span class="saved-route-name">{{ t('routePlanning.saved.routeNumber', { number: idx + 1 }) }}</span>
              <span class="saved-route-stops">{{ t('routePlanning.saved.stops', { count: route.nodes.length }) }}</span>
            </div>
            <div class="saved-route-actions">
              <button class="load-btn" @click="loadSavedRoute(route)">
                {{ t('routePlanning.saved.modify') }}
              </button>
              <button class="delete-btn" @click="deleteSavedRoute(route.id)">
                {{ t('routePlanning.saved.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <section class="canvas-section">
      <div class="canvas-container">
        <canvas ref="routeCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
      </div>
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
import { ref, onMounted, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import { useWarehouseStore } from '../stores/warehouseStore'
import { useTheme } from '@/shared/composables/useTheme'
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'
import AddNodeModal from '../components/AddNodeModal.vue'

const warehouseStore = useWarehouseStore()
const { theme } = useTheme()
const { t } = useI18n()
const routeNodes = ref([])
const showAddNodeModal = ref(false)
const routeCanvas = ref(null)
const isReordering = ref(false)
const activeTab = ref('plan')
const routeDistance = ref(0)
const isSidebarCollapsed = ref(false)
const canvasWidth = ref(800)
const canvasHeight = ref(600)

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
  const types = {
    own: t('warehouse.types.own'),
    provider: t('warehouse.types.provider'),
    client: t('warehouse.types.client')
  }
  return types[type] || type
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
  
  const margin = Math.min(canvas.width, canvas.height) * 0.1 // 10% del tamaño más pequeño
  const nodeRadius = Math.min(canvas.width, canvas.height) * 0.035 // 3.5% del tamaño más pequeño
  const total = routeNodes.value.length
  
  if (total === 0) return
  
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
  ctx.strokeStyle = v-bind('theme.colors.primary')
  ctx.lineWidth = Math.max(2, canvas.width * 0.005) // Línea proporcional al tamaño
  ctx.beginPath()
  
  for (let i = 0; i < positions.length; i++) {
    const { x, y } = positions[i]
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  
  // Cerrar el círculo si hay más de 2 nodos
  if (positions.length > 2) {
    ctx.lineTo(positions[0].x, positions[0].y)
  }
  
  ctx.stroke()

  // Dibujar nodos
  positions.forEach(({ x, y, node }, idx) => {
    // Círculo principal
    ctx.beginPath()
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI)
    ctx.fillStyle = getNodeColor(node.type)
    ctx.fill()
    ctx.lineWidth = Math.max(1.5, canvas.width * 0.003)
    ctx.strokeStyle = v-bind('theme.colors.primary')
    ctx.stroke()

    // Texto del nombre
    ctx.fillStyle = v-bind('theme.textColors.primary')
    ctx.font = `bold ${Math.max(12, canvas.width * 0.015)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.name, x, y)

    // Texto del tipo
    ctx.font = `${Math.max(10, canvas.width * 0.012)}px sans-serif`
    ctx.fillStyle = v-bind('theme.colors.primary')
    ctx.fillText(getTypeLabel(node.type), x, y + nodeRadius + Math.max(10, canvas.width * 0.012))

    // Índice
    const indexRadius = nodeRadius * 0.4
    ctx.beginPath()
    ctx.arc(x + nodeRadius - indexRadius, y - nodeRadius + indexRadius, indexRadius, 0, 2 * Math.PI)
    ctx.fillStyle = v-bind('theme.colors.surface')
    ctx.fill()
    ctx.strokeStyle = v-bind('theme.colors.primary')
    ctx.lineWidth = Math.max(1, canvas.width * 0.002)
    ctx.stroke()
    ctx.fillStyle = v-bind('theme.colors.primary')
    ctx.font = `bold ${Math.max(10, canvas.width * 0.012)}px sans-serif`
    ctx.fillText(idx + 1, x + nodeRadius - indexRadius, y - nodeRadius + indexRadius)
  })
}

function calculateRouteDistance() {
  if (routeNodes.value.length < 2) {
    routeDistance.value = 0
    return
  }

  let totalDistance = 0
  for (let i = 0; i < routeNodes.value.length - 1; i++) {
    const node1 = routeNodes.value[i]
    const node2 = routeNodes.value[i + 1]
    
    // Calcular distancia usando la fórmula de Haversine
    const R = 6371 // Radio de la Tierra en km
    const lat1 = node1.latitude * Math.PI / 180
    const lat2 = node2.latitude * Math.PI / 180
    const deltaLat = (node2.latitude - node1.latitude) * Math.PI / 180
    const deltaLon = (node2.longitude - node1.longitude) * Math.PI / 180

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c

    totalDistance += distance
  }
  
  routeDistance.value = totalDistance
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const updateCanvasSize = () => {
  const container = document.querySelector('.canvas-container')
  if (container) {
    const rect = container.getBoundingClientRect()
    canvasWidth.value = rect.width
    canvasHeight.value = rect.height
    nextTick(() => {
      const canvas = routeCanvas.value
      if (canvas) {
        // Ajustar el tamaño del canvas para pantallas de alta resolución
        const dpr = window.devicePixelRatio || 1
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
      }
      drawRoute()
    })
  }
}

onMounted(() => {
  warehouseStore.fetchWarehouses()
  savedRoutes.value = getAllSavedRoutes()
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCanvasSize)
})

watch(routeNodes, () => {
  nextTick(() => {
    drawRoute()
    calculateRouteDistance()
  })
}, { deep: true })
</script>

<style scoped>
.route-planning-view {
  display: flex;
  height: 100vh;
  background: v-bind('theme.colors.background');
  position: relative;
  overflow: hidden;
}

.sidebar {
  width: 340px;
  background: v-bind('theme.colors.surface');
  padding: v-bind('theme.spacing.lg') v-bind('theme.spacing.md');
  border-right: 2px solid v-bind('theme.colors.primary');
  display: flex;
  flex-direction: column;
  gap: v-bind('theme.spacing.md');
  transition: v-bind('theme.transition');
  position: relative;
  z-index: 10;
}

.sidebar-collapsed {
  width: 50px;
  padding: v-bind('theme.spacing.md');
}

.collapse-btn {
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  background: v-bind('theme.colors.primary');
  color: v-bind('theme.textColors.inverted');
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  transition: v-bind('theme.transition');

  &:hover {
    background: v-bind('theme.colors.primaryDark');
  }
}

.sidebar-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.tab-content {
  height: calc(100% - 50px);
  overflow-y: auto;
  padding-right: v-bind('theme.spacing.xs');
}

.canvas-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: v-bind('theme.colors.background');
  padding: v-bind('theme.spacing.md');
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  background: v-bind('theme.colors.surface');
  border-radius: v-bind('theme.borderRadius.base');
  box-shadow: v-bind('theme.boxShadow');
  border: 2px solid v-bind('theme.colors.primary');
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .sidebar {
    width: 300px;
  }

  .sidebar-collapsed {
    width: 40px;
  }
}

@media (max-width: 768px) {
  .route-planning-view {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    max-height: 50vh;
    border-right: none;
    border-bottom: 2px solid v-bind('theme.colors.primary');
  }

  .sidebar-collapsed {
    width: 100%;
    height: 50px;
  }

  .canvas-section {
    height: 50vh;
  }

  .collapse-btn {
    top: 50%;
    transform: translateY(-50%);
    right: v-bind('theme.spacing.sm');
  }

  .saved-route-item {
    flex-direction: column;
    gap: v-bind('theme.spacing.sm');
  }

  .saved-route-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .tabs {
    flex-direction: column;
  }

  .tabs button {
    width: 100%;
    border-radius: v-bind('theme.borderRadius.sm');
  }

  .saved-route-actions {
    flex-direction: column;
    gap: v-bind('theme.spacing.sm');
  }

  .load-btn, .delete-btn {
    width: 100%;
  }
}

.tabs {
  display: flex;
  gap: v-bind('theme.spacing.sm');
  margin-bottom: v-bind('theme.spacing.md');
}
.tabs button {
  flex: 1;
  background: v-bind('theme.colors.backgroundSecondary');
  color: v-bind('theme.colors.primary');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm') v-bind('theme.borderRadius.sm') 0 0;
  padding: v-bind('theme.spacing.sm');
  font-weight: v-bind('theme.fontWeight.bold');
  cursor: pointer;
  transition: v-bind('theme.transition');
}
.tabs button.active {
  background: v-bind('theme.colors.primary');
  color: v-bind('theme.textColors.inverted');
}
.route-info {
  background: v-bind('theme.colors.backgroundSecondary');
  padding: v-bind('theme.spacing.sm');
  border-radius: v-bind('theme.borderRadius.sm');
  margin-bottom: v-bind('theme.spacing.md');
  border: 1px solid v-bind('theme.borderColor');
}
.route-info p {
  color: v-bind('theme.textColors.primary');
  font-weight: v-bind('theme.fontWeight.bold');
  margin: 0;
}
.empty-saved {
  color: v-bind('theme.textColors.secondary');
  font-style: italic;
  margin-bottom: v-bind('theme.spacing.md');
}
.saved-route-item {
  background: v-bind('theme.colors.backgroundSecondary');
  border-radius: v-bind('theme.borderRadius.sm');
  padding: v-bind('theme.spacing.sm') v-bind('theme.spacing.md');
  margin-bottom: v-bind('theme.spacing.sm');
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid v-bind('theme.colors.primaryLight');
}
.saved-route-info {
  display: flex;
  flex-direction: column;
  gap: v-bind('theme.spacing.xs');
}
.saved-route-name {
  color: v-bind('theme.colors.primary');
  font-weight: v-bind('theme.fontWeight.bold');
}
.saved-route-stops {
  color: v-bind('theme.textColors.primary');
  font-size: v-bind('theme.fontSize.sm');
}
.saved-route-actions {
  display: flex;
  gap: v-bind('theme.spacing.sm');
}
.load-btn {
  background: v-bind('theme.colors.primary');
  color: v-bind('theme.textColors.inverted');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm');
  padding: v-bind('theme.spacing.xs') v-bind('theme.spacing.sm');
  font-weight: v-bind('theme.fontWeight.bold');
  cursor: pointer;
  transition: v-bind('theme.transition');
}
.load-btn:hover {
  background: v-bind('theme.colors.primaryDark');
}
.delete-btn {
  background: v-bind('theme.colors.warning');
  color: v-bind('theme.textColors.primary');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm');
  padding: v-bind('theme.spacing.xs') v-bind('theme.spacing.sm');
  font-weight: v-bind('theme.fontWeight.bold');
  cursor: pointer;
  transition: v-bind('theme.transition');
}
.delete-btn:hover {
  background: v-bind('theme.colors.warningDark');
}
.reorder-btn {
  background: v-bind('theme.colors.primary');
  color: v-bind('theme.textColors.inverted');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm');
  padding: v-bind('theme.spacing.sm') v-bind('theme.spacing.md');
  font-weight: v-bind('theme.fontWeight.bold');
  margin-bottom: v-bind('theme.spacing.md');
  cursor: pointer;
  transition: v-bind('theme.transition');
}
.reorder-btn.active {
  background: v-bind('theme.colors.warning');
  color: v-bind('theme.textColors.primary');
}
.stop-item {
  display: flex;
  align-items: center;
  gap: v-bind('theme.spacing.sm');
  background: v-bind('theme.colors.backgroundSecondary');
  border-radius: v-bind('theme.borderRadius.sm');
  padding: v-bind('theme.spacing.sm');
  margin-bottom: v-bind('theme.spacing.sm');
  border: 2px solid v-bind('theme.colors.primaryLight');
}
.stop-item.reordering {
  cursor: move;
  border: 2px solid v-bind('theme.colors.primary');
  background: v-bind('theme.colors.primaryLight');
}
.node-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid v-bind('theme.colors.primary');
}
.stop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.stop-name {
  color: v-bind('theme.textColors.primary');
  font-weight: v-bind('theme.fontWeight.bold');
}
.stop-type {
  color: v-bind('theme.colors.primary');
  font-size: v-bind('theme.fontSize.sm');
}
.remove-btn {
  background: v-bind('theme.colors.warning');
  color: v-bind('theme.textColors.primary');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm');
  padding: v-bind('theme.spacing.xs') v-bind('theme.spacing.sm');
  font-size: v-bind('theme.fontSize.lg');
  cursor: pointer;
  font-weight: v-bind('theme.fontWeight.bold');
  transition: v-bind('theme.transition');
}
.remove-btn:hover {
  background: v-bind('theme.colors.warningDark');
}
.add-btn {
  background: v-bind('theme.colors.primary');
  color: v-bind('theme.textColors.inverted');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm');
  padding: v-bind('theme.spacing.sm') v-bind('theme.spacing.md');
  font-weight: v-bind('theme.fontWeight.bold');
  margin-top: v-bind('theme.spacing.sm');
  cursor: pointer;
  transition: v-bind('theme.transition');
}
.add-btn:hover {
  background: v-bind('theme.colors.primaryDark');
}
.save-btn {
  background: v-bind('theme.colors.success');
  color: v-bind('theme.textColors.inverted');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm');
  padding: v-bind('theme.spacing.sm') v-bind('theme.spacing.md');
  font-weight: v-bind('theme.fontWeight.bold');
  margin-top: v-bind('theme.spacing.sm');
  cursor: pointer;
  transition: v-bind('theme.transition');
}
.save-btn:hover {
  background: v-bind('theme.colors.successDark');
}
</style>
