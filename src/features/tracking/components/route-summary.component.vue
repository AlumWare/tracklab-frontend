<template>
  <div class="route-summary" v-if="route">
    <h3>{{ route.routeName || t('tracking.route') }}</h3>
    <p>{{ t('tracking.routeStatus.' + (route.isActive ? 'active' : 'planning')) }}</p>
    <p>{{ t('tracking.routePlanning.vehicle') }}: {{ route.vehicleId || '-' }}</p>
    <p>{{ t('tracking.routePlanning.plannedStartDate') }}: {{ route.getFormattedPlannedStartDate?.() || '-' }}</p>
    <p>{{ t('tracking.routePlanning.totalWarehouses') }}: {{ route.getTotalWarehouses?.() || 0 }}</p>
    <p>{{ t('tracking.routePlanning.progress') }}: {{ route.getProgressPercentage?.() || 0 }}%</p>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
  route: { type: Object, default: null }
})
</script>
<style scoped>
.route-summary { background: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 1.5rem; }
h3 { margin-top: 0; }
p { margin: 0.3rem 0; }
</style> 