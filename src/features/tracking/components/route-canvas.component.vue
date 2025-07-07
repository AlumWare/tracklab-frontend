<template>
  <div class="route-canvas">
    <h4>{{ t('routePlanning.visualization') }}</h4>
    <div class="canvas-wrapper" style="position:relative;">
      <canvas ref="canvas" width="600" height="220" class="canvas" @mousemove="onMouseMove" @mouseleave="onMouseLeave"></canvas>
      <div v-if="hoveredNode !== null" class="tooltip" :style="tooltipStyle">
        <i class="material-icons icon">warehouse</i>
        <div>
          <strong>{{ warehouses[hoveredNode].name }}</strong><br>
          <span>{{ warehouses[hoveredNode].address }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
  warehouses: { type: Array, default: () => [] }
})
const canvas = ref(null)
const hoveredNode = ref(null)
const mousePos = ref({ x: 0, y: 0 })
const nodePositions = ref([])

function drawRoute() {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  const nodes = props.warehouses
  nodePositions.value = []
  if (!nodes.length) return
  const margin = 50
  const width = canvas.value.width
  const height = canvas.value.height
  const nodeRadius = 22
  const step = (width - 2 * margin) / (nodes.length - 1 || 1)
  // Líneas curvas
  ctx.strokeStyle = '#1976d2'
  ctx.lineWidth = 4
  ctx.beginPath()
  for (let i = 0; i < nodes.length - 1; i++) {
    const x1 = margin + i * step
    const y1 = height / 2
    const x2 = margin + (i + 1) * step
    const y2 = height / 2
    const cp1x = x1 + step / 2
    ctx.moveTo(x1, y1)
    ctx.bezierCurveTo(cp1x, y1 - 40, cp1x, y2 + 40, x2, y2)
  }
  ctx.stroke()
  // Nodos
  for (let i = 0; i < nodes.length; i++) {
    const x = margin + i * step
    const y = height / 2
    nodePositions.value[i] = { x, y }
    // Sombra
    ctx.save()
    ctx.shadowColor = 'rgba(25, 118, 210, 0.25)'
    ctx.shadowBlur = 12
    // Círculo
    ctx.beginPath()
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#1976d2'
    ctx.stroke()
    ctx.restore()
    // Ícono de almacén (Material Icons)
    ctx.save()
    ctx.font = '24px Material Icons'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#1976d2'
    ctx.fillText('warehouse', x, y)
    ctx.restore()
    // Índice
    ctx.save()
    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(i + 1, x, y + nodeRadius - 8)
    ctx.restore()
  }
}

function onMouseMove(e) {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  mousePos.value = { x, y }
  hoveredNode.value = null
  for (let i = 0; i < nodePositions.value.length; i++) {
    const { x: nx, y: ny } = nodePositions.value[i]
    if (Math.hypot(nx - x, ny - y) < 24) {
      hoveredNode.value = i
      break
    }
  }
}
function onMouseLeave() {
  hoveredNode.value = null
}
const tooltipStyle = computed(() => {
  if (hoveredNode.value === null) return {}
  const { x, y } = nodePositions.value[hoveredNode.value]
  return {
    position: 'absolute',
    left: `${x + 10}px`,
    top: `${y - 60}px`,
    zIndex: 10
  }
})

onMounted(drawRoute)
watch(() => props.warehouses, drawRoute, { deep: true })
</script>
<style scoped>
.route-canvas { background: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.canvas { width: 100%; max-width: 100%; display: block; margin: 0 auto; background: #f5f5f5; border-radius: 8px; }
.tooltip {
  background: #fff;
  color: #1976d2;
  border: 1.5px solid #1976d2;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(25,118,210,0.12);
  padding: 0.7rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  pointer-events: none;
  min-width: 160px;
  font-size: 1rem;
}
.tooltip .icon {
  font-size: 2rem;
  color: #1976d2;
}
</style> 