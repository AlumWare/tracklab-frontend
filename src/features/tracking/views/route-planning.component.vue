<template>
  <div class="route-planning-stack">
    <div class="controls-bar">
      <div class="tabs">
        <button :class="{ active: activeTab === 'plan' }" @click="activeTab = 'plan'">
          {{ t('routePlanning.planTab') }}
        </button>
        <button :class="{ active: activeTab === 'saved' }" @click="activeTab = 'saved'">
          {{ t('routePlanning.savedTab') }}
        </button>
      </div>
      <div v-if="activeTab === 'plan'" class="controls-grid">
        <div class="form-section card-panel">
          <h3 class="section-title">{{ t('routePlanning.routeData') }}</h3>
          <div class="form-fields">
            <label>
              {{ t('routePlanning.routeName') }}
              <input v-model="routeName" type="text" :placeholder="t('routePlanning.routeNamePlaceholder')" required />
            </label>
            <label>
              {{ t('routePlanning.description') }}
              <textarea v-model="description" :placeholder="t('routePlanning.descriptionPlaceholder')"></textarea>
            </label>
            <label>
              {{ t('routePlanning.plannedStartDate') }}
              <input v-model="plannedStartDate" type="datetime-local" required :placeholder="t('routePlanning.plannedStartDatePlaceholder')" />
            </label>
            <label>
              {{ t('routePlanning.vehicle') }}
              <select v-model="vehicleId" required>
                <option value="">{{ t('routePlanning.selectVehicle') }}</option>
                <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">{{ vehicle.name }}</option>
              </select>
            </label>
          </div>
        </div>
        <div class="warehouse-section card-panel">
          <h3 class="section-title">{{ t('routePlanning.selectWarehouse') }}</h3>
          <WarehouseSelector
            :warehouses="allWarehouses"
            :selected-warehouses="routeWarehouses"
            @add-warehouse="addWarehouse"
          />
          <h4 class="subsection-title">{{ t('routePlanning.routeNodes') }}</h4>
          <RouteNodeList
            v-model="routeWarehouses"
            @remove-node="removeWarehouse"
            @move-up="moveNodeUp"
            @move-down="moveNodeDown"
          />
        </div>
        <div class="orders-section card-panel">
          <h3 class="section-title">{{ t('routePlanning.selectOrders') }}</h3>
          <OrderSelector
            :selected-orders="selectedOrders"
            @update:selected-orders="selectedOrders = $event"
          />
          <button class="save-btn" @click="saveRoute" :disabled="!canSaveRoute">
            {{ t('routePlanning.saveRoute') }}
          </button>
        </div>
      </div>
      <div v-else class="controls-grid">
        <SavedRoutes 
          :saved-routes="savedRoutes" 
          :loading="loadingRoutes"
          :error="routesError"
          @load-route="loadRoute" 
        />
      </div>
    </div>
    <div class="canvas-section-stack">
      <RouteCanvas :warehouses="routeWarehouses" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UxService } from '@/core/services/ux.service.js'
import WarehouseSelector from '../components/warehouse-selector.component.vue'
import RouteNodeList from '../components/route-node-list.component.vue'
import RouteSummary from '../components/route-summary.component.vue'
import RouteCanvas from '../components/route-canvas.component.vue'
import SavedRoutes from '../components/saved-route.component.vue'
import OrderSelector from '../components/order-selector.component.vue'
import { warehouseService } from '@/features/resources/services/warehouse.service.js'
import { routeService } from '@/features/tracking/services/route.service.js'
import { CreateRouteResource } from '@/features/tracking/models/route.resource.js'

const { t } = useI18n()
const activeTab = ref('plan')
const routeWarehouses = ref([])
const selectedOrders = ref([])
const currentRoute = ref(null)
const savedRoutes = ref([])
const routeName = ref('')
const description = ref('')
const plannedStartDate = ref('')
const vehicleId = ref('')
const vehicles = ref([
  { id: 1, name: 'Camión A' },
  { id: 2, name: 'Camión B' },
  { id: 3, name: 'Furgoneta C' }
])
const allWarehouses = ref([])
const loadingRoutes = ref(false)
const routesError = ref(null)

onMounted(async () => {
  try {
    loadingRoutes.value = true
    routesError.value = null
    savedRoutes.value = await routeService.getAllRoutes()
    allWarehouses.value = await warehouseService.getAllWarehouses()
  } catch (error) {
    console.error('Error loading initial data:', error)
    routesError.value = t('routePlanning.errorLoadingData')
    UxService.showSnackbar({ message: t('routePlanning.errorLoadingData'), type: 'error' })
  } finally {
    loadingRoutes.value = false
  }
})

const canSaveRoute = computed(() => {
  return routeName.value && description.value && plannedStartDate.value && vehicleId.value && routeWarehouses.value.length > 0 && selectedOrders.value.length > 0
})

function addWarehouse(warehouse) {
  if (!routeWarehouses.value.some(w => w.id === warehouse.id)) {
    routeWarehouses.value.push(warehouse)
    UxService.showSnackbar({ message: t('routePlanning.addWarehouseSuccess'), type: 'success' })
  }
}
function removeWarehouse(warehouseId) {
  routeWarehouses.value = routeWarehouses.value.filter(w => w.id !== warehouseId)
  UxService.showSnackbar({ message: t('routePlanning.removeWarehouseSuccess'), type: 'info' })
}
async function saveRoute() {
  if (!canSaveRoute.value) {
    UxService.showSnackbar({ message: t('routePlanning.completeAllFields'), type: 'warning' })
    return
  }
  
  try {
    loadingRoutes.value = true
    routesError.value = null
    
    const routeData = new CreateRouteResource({
      vehicleId: parseInt(vehicleId.value),
      routeName: routeName.value,
      warehouseIds: routeWarehouses.value.map(w => w.id),
      orderIds: selectedOrders.value.map(o => o.orderId),
      plannedStartDate: plannedStartDate.value,
      description: description.value
    })
    
    const savedRoute = await routeService.saveRoute(routeData)
    savedRoutes.value = await routeService.getAllRoutes()
    
    // Limpiar formulario
    routeName.value = ''
    description.value = ''
    plannedStartDate.value = ''
    vehicleId.value = ''
    routeWarehouses.value = []
    selectedOrders.value = []
    
    UxService.showSnackbar({ message: t('routePlanning.routeSaved'), type: 'success' })
  } catch (error) {
    console.error('Error saving route:', error)
    routesError.value = t('routePlanning.errorSavingRoute')
    UxService.showSnackbar({ message: t('routePlanning.errorSavingRoute'), type: 'error' })
  } finally {
    loadingRoutes.value = false
  }
}
async function loadRoute(route) {
  try {
    // Si la ruta no tiene los warehouses completos, los cargamos desde el backend
    if (!route.warehouses || route.warehouses.length === 0) {
      const fullRoute = await routeService.getRouteById(route.id)
      route = fullRoute
    }
    
    routeName.value = route.routeName
    description.value = route.description
    plannedStartDate.value = route.plannedStartDate
    vehicleId.value = route.vehicleId
    routeWarehouses.value = JSON.parse(JSON.stringify(route.warehouses || []))
    selectedOrders.value = JSON.parse(JSON.stringify(route.orders || []))
    activeTab.value = 'plan'
    UxService.showSnackbar({ message: t('routePlanning.routeLoaded') || 'Ruta cargada', type: 'info' })
  } catch (error) {
    console.error('Error loading route:', error)
    UxService.showSnackbar({ message: t('routePlanning.errorLoadingRoute'), type: 'error' })
  }
}
function moveNodeUp(idx) {
  if (idx > 0) {
    const temp = routeWarehouses.value[idx - 1]
    routeWarehouses.value[idx - 1] = routeWarehouses.value[idx]
    routeWarehouses.value[idx] = temp
  }
}
function moveNodeDown(idx) {
  if (idx < routeWarehouses.value.length - 1) {
    const temp = routeWarehouses.value[idx + 1]
    routeWarehouses.value[idx + 1] = routeWarehouses.value[idx]
    routeWarehouses.value[idx] = temp
  }
}
</script>

<style scoped>
.route-planning-stack {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: #f8f9fa;
}
.controls-bar {
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border-bottom: 1px solid #e0e0e0;
  padding: 2rem 2rem 1.5rem 2rem;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  width: 100%;
}
.card-panel {
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 0.7rem;
}
.subsection-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 1.2rem 0 0.5rem 0;
}
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.form-fields label {
  font-weight: 600;
  color: #222b45;
  margin-bottom: 0.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.form-fields input,
.form-fields textarea,
.form-fields select {
  padding: 0.6rem 0.9rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #222b45;
  transition: border-color 0.2s;
}
.form-fields input:focus,
.form-fields textarea:focus,
.form-fields select:focus {
  outline: none;
  border-color: #1976d2;
}
.save-btn {
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
}
.save-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}
.save-btn:hover:not(:disabled) {
  background: #388e3c;
}
.canvas-section-stack {
  width: 100%;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
  border-top: 1px solid #e0e0e0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0 2.5rem 0;
  max-width: 1400px;
  margin: 0 auto;
}
.canvas-section-stack > * {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}
@media (max-width: 900px) {
  .controls-bar {
    padding: 1rem 0.5rem 1rem 0.5rem;
  }
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .canvas-section-stack > * {
    padding: 0 0.5rem;
  }
}
</style>
