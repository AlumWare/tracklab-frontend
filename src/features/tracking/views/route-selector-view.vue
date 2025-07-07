<template>
  <div class="route-selector-view">
    <h1>{{ t('routeSelector.title') }}</h1>
    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="routes-list">
      <div v-for="route in routes" :key="route.routeId" class="route-card">
        <div class="route-info">
          <h3>#{{ route.routeId }} - {{ route.routeName }}</h3>
          <p>{{ t('routeSelector.stops') }}: {{ (route.routeItems || []).map(i => i.warehouseId).join(' → ') }}</p>
          <p>{{ t('routeSelector.status') }}: <span :class="route.isActive ? 'active' : 'pending'">{{ route.isActive ? t('common.active') : t('common.pending') }}</span></p>
        </div>
        <button @click="goToExecution(route.routeId)">{{ t('routeSelector.execute') }}</button>
      </div>
      <div v-if="!routes.length" class="empty-list">{{ t('routeSelector.noRoutes') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { routeService } from '../services/route.service.js'
const { t } = useI18n()
const router = useRouter()

const routes = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    loading.value = true
    routes.value = await routeService.getAllRoutes()
  } catch (e) {
    error.value = t('routeSelector.errorLoading')
  } finally {
    loading.value = false
  }
})

function goToExecution(routeId) {
  router.push({ name: 'route-execution-view', params: { routeId } })
}
</script>

<style scoped>
.route-selector-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.routes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.route-card {
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(25,118,210,0.06);
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.route-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1976d2;
}
.route-info p {
  margin: 0.2rem 0;
}
button {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1.08rem;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #125ea2;
}
.pending { color: #ff9800; }
.active { color: #388e3c; }
.completed { color: #888; }
.loading { color: #1976d2; text-align: center; margin: 2rem; }
.error { color: #d32f2f; text-align: center; margin: 2rem; }
.empty-list { color: #888; text-align: center; margin: 2rem; }
</style> 