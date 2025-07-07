<template>
  <div class="route-node-list">
    <h4>{{ t('routePlanning.routeNodes') }}</h4>
    <ul>
      <li v-for="(warehouse, idx) in modelValue" :key="warehouse.id" class="node-item">
        <span>{{ idx + 1 }}. {{ warehouse.name }}</span>
        <div class="node-actions">
          <button @click="$emit('move-up', idx)" :disabled="idx === 0" title="{{ t('common.moveUp') }}">↑</button>
          <button @click="$emit('move-down', idx)" :disabled="idx === modelValue.length - 1" title="{{ t('common.moveDown') }}">↓</button>
          <button @click="$emit('remove-node', warehouse.id)">{{ t('common.remove') }}</button>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue', 'remove-node', 'move-up', 'move-down'])
// Aquí se puede agregar lógica de drag & drop si se desea
</script>
<style scoped>
.route-node-list { margin-bottom: 1.5rem; }
ul { list-style: none; padding: 0; }
.node-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0;
}
.node-actions button {
  margin-left: 0.2rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.node-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.node-actions button:not(:disabled):hover {
  background: #1976d2;
  color: #fff;
}
</style> 