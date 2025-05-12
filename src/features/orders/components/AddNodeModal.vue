<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">Añadir Nodo a la Ruta</h2>
      <div class="node-list">
        <div
          v-for="node in availableNodes"
          :key="node.id"
          :class="['node-item', { selected: selectedNode && selectedNode.id === node.id }]"
          @click="selectNode(node)"
        >
          <span class="node-dot" :style="{ background: getNodeColor(node.type) }"></span>
          <div class="node-info">
            <div class="node-name">{{ node.name }}</div>
            <div class="node-type">({{ getTypeLabel(node.type) }})</div>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="cancel-button" @click="$emit('close')">Cancelar</button>
        <button class="add-button" :disabled="!selectedNode" @click="addNode">Añadir</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  availableNodes: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['add', 'close'])
const selectedNode = ref(null)

function selectNode(node) {
  selectedNode.value = node
}
function addNode() {
  if (selectedNode.value) emit('add', selectedNode.value)
}
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
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #FFFFFF;
  padding: 2rem;
  border-radius: 12px;
  min-width: 340px;
  max-width: 400px;
  box-shadow: 0 2px 16px rgba(66,165,245,0.15);
}
.modal-title {
  color: #1E88E5;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  font-weight: bold;
}
.node-list {
  max-height: 260px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}
.node-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  background: #F5F5F5;
  margin-bottom: 0.5rem;
  border: 2px solid transparent;
  transition: border 0.2s, background 0.2s;
}
.node-item.selected {
  border: 2px solid #42A5F5;
  background: #E3F2FD;
}
.node-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid #1E88E5;
}
.node-info {
  display: flex;
  flex-direction: column;
}
.node-name {
  color: #000000;
  font-weight: 500;
}
.node-type {
  color: #1E88E5;
  font-size: 0.95em;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.cancel-button {
  background: #F5F5F5;
  color: #1E88E5;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.add-button {
  background: #42A5F5;
  color: #FFFFFF;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.add-button:disabled {
  background: #B3E5FC;
  color: #FFFFFF;
  cursor: not-allowed;
}
</style>
