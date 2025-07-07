<template>
  <div class="container-movement">
    <h4>{{ t('containerMovement.title') }}</h4>
    <div class="movement-type-row">
      <label>{{ t('containerMovement.type') }}</label>
      <select v-model="movementType">
        <option value="upload">{{ t('containerMovement.upload') }}</option>
        <option value="download">{{ t('containerMovement.download') }}</option>
      </select>
    </div>
    <button class="scan-btn" @click="openScanner = true">{{ t('containerMovement.scanQR') }}</button>
    <qr-scanner v-model:open="openScanner" @scanned="onScanned" />
    <div class="movements-list">
      <h5>{{ t('containerMovement.history') }}</h5>
      <ul>
        <li v-for="(move, idx) in movements" :key="idx">
          <span class="move-type">{{ move.typeLabel }}</span>
          <span class="move-id">QR: {{ move.containerId }}</span>
          <span class="move-time">{{ move.time }}</span>
        </li>
      </ul>
      <div v-if="!movements.length" class="empty-history">{{ t('containerMovement.noMovements') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QrScanner from './qr-scanner.component.vue'

const { t } = useI18n()
const movementType = ref('upload')
const openScanner = ref(false)
const movements = ref([])

function onScanned(containerId) {
  const now = new Date()
  movements.value.unshift({
    type: movementType.value,
    typeLabel: movementType.value === 'upload' ? t('containerMovement.upload') : t('containerMovement.download'),
    containerId,
    time: now.toLocaleTimeString()
  })
}
</script>

<style scoped>
.container-movement {
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(25,118,210,0.04);
  padding: 1.2rem 1.5rem;
  margin-bottom: 2rem;
  max-width: 480px;
}
.movement-type-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.scan-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1.08rem;
  cursor: pointer;
  margin-bottom: 1.2rem;
  transition: background 0.2s;
  box-shadow: 0 1px 4px rgba(25,118,210,0.08);
}
.scan-btn:hover {
  background: #125ea2;
}
.movements-list {
  margin-top: 1.2rem;
}
.move-type {
  font-weight: 600;
  color: #1976d2;
  margin-right: 1.2rem;
}
.move-id {
  color: #388e3c;
  margin-right: 1.2rem;
}
.move-time {
  color: #888;
  font-size: 0.95em;
}
.empty-history {
  color: #888;
  font-style: italic;
  text-align: center;
  margin-top: 0.7rem;
}
</style> 