<template>
  <div class="saved-routes">
    <h4>{{ t('tracking.routePlanning.savedRoutes') }}</h4>
    <div v-if="loading" class="loading">
      {{ t('common.loading') }}
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <ul v-else-if="savedRoutes.length > 0">
      <li v-for="route in savedRoutes" :key="route.id">
        <div class="route-info">
          <span class="route-name">{{ route.routeName || t('tracking.route') }}</span>
          <span class="route-date">{{ formatDate(route.plannedStartDate) }}</span>
        </div>
        <button @click="$emit('load-route', route)">{{ t('common.load') }}</button>
      </li>
    </ul>
    <div v-else class="empty-state">
      {{ t('routePlanning.noSavedRoutes') }}
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  savedRoutes: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

defineEmits(['load-route'])

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.saved-routes { 
  margin-bottom: 1.5rem; 
}
ul { 
  list-style: none; 
  padding: 0; 
}
li { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 0.8rem;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}
.route-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.route-name {
  font-weight: 600;
  color: #222b45;
}
.route-date {
  font-size: 0.85rem;
  color: #666;
}
button { 
  background: #1976d2; 
  color: #fff; 
  border: none; 
  border-radius: 4px; 
  padding: 0.4rem 0.8rem; 
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
button:hover { 
  background: #125ea2; 
}
.loading, .error, .empty-state {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-style: italic;
}
.error {
  color: #d32f2f;
}
</style> 