<template>
  <div class="warehouse-management">
    <!-- Encabezado -->
    <div class="header">
      <h1 class="title">{{ t('warehouse.management.title') }}</h1>
      <button class="create-button" @click="openCreateModal">
        <i class="fas fa-plus"></i> {{ t('warehouse.management.create') }}
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label>{{ t('warehouse.management.filters.type.label') }}</label>
        <select v-model="filters.type" class="filter-select">
          <option value="">{{ t('warehouse.management.filters.type.all') }}</option>
          <option 
            v-for="typeOption in typeOptions" 
            :key="typeOption.value" 
            :value="typeOption.value"
          >
            {{ typeOption.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Mapa -->
      <div class="map-container">
        <div id="warehouse-map" class="map"></div>
      </div>

      <!-- Tabla de almacenes -->
      <div class="table-container">
        <table class="warehouse-table">
        <thead>
          <tr>
            <th>{{ t('warehouse.management.table.name') }}</th>
            <th>{{ t('warehouse.management.table.type') }}</th>
            <th>{{ t('warehouse.management.table.address') }}</th>
            <th>{{ t('warehouse.management.table.coordinates') }}</th>
            <th>{{ t('warehouse.management.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="warehouse in filteredWarehouses" :key="warehouse.id">
            <td>{{ warehouse.name }}</td>
            <td>{{ getWarehouseTypeLabel(warehouse.type) }}</td>
            <td>{{ warehouse.address }}</td>
            <td>{{ formatCoordinates(warehouse.latitude, warehouse.longitude) }}</td>
            <td class="actions">
              <button
                class="action-button edit"
                @click="editWarehouse(warehouse)"
                :title="t('warehouse.management.actions.edit')"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="action-button delete"
                @click="deleteWarehouse(warehouse)"
                :title="t('warehouse.management.actions.delete')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <CreateWarehouseComponent
      :visible="showModal"
      :warehouse="selectedWarehouse"
      @close="closeModal"
      @saved="handleWarehouseSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/shared/composables/useTheme'
import CreateWarehouseComponent from '../components/create-warehouse.componente.vue'
import { warehouseService } from '../services/warehouse.service.js'
import { WarehouseResource } from '../models/warehouse.resource.js'
import { UxService } from '@/core/services/ux.service.js'

// Composables
const { t } = useI18n()
const { theme } = useTheme()

// Reactive data
const warehouses = ref([])
const filters = ref({
  type: ''
})
const showModal = ref(false)
const selectedWarehouse = ref(null)
const loading = ref(false)
const map = ref(null)
const markers = ref([])

// Computed
const filteredWarehouses = computed(() => {
  return warehouses.value.filter(warehouse => {
    if (filters.value.type && warehouse.type !== filters.value.type) {
      return false
    }
    return true
  })
})

const typeOptions = computed(() => {
  return WarehouseResource.getTypeOptions()
})

// Methods
const initializeMap = () => {
  if (map.value || typeof window.google === 'undefined') return

  const mapElement = document.getElementById('warehouse-map')
  if (!mapElement) return

  map.value = new window.google.maps.Map(mapElement, {
    center: { lat: -12.0464, lng: -77.0428 }, // Lima, Perú
    zoom: 12
  })

  updateMapMarkers()
}

const updateMapMarkers = () => {
  if (!map.value || typeof window.google === 'undefined') return

  // Limpiar marcadores anteriores
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []

  filteredWarehouses.value.forEach(warehouse => {
    const marker = new window.google.maps.Marker({
      position: { lat: warehouse.latitude, lng: warehouse.longitude },
      map: map.value,
      title: warehouse.name
    })

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="marker-info">
          <h3>${warehouse.name}</h3>
          <p>Tipo: ${getWarehouseTypeLabel(warehouse.type)}</p>
          <p>Dirección: ${warehouse.address}</p>
          <div class="marker-actions">
            <button onclick="window.editWarehouse('${warehouse.id}')">Editar</button>
            <button onclick="window.deleteWarehouse('${warehouse.id}')">Eliminar</button>
          </div>
        </div>
      `
    })

    marker.addListener('click', () => {
      infoWindow.open(map.value, marker)
    })

    markers.value.push(marker)
  })
}

const loadWarehouses = async () => {
  loading.value = true
  try {
    warehouses.value = await warehouseService.getAllWarehouses()
    updateMapMarkers()
  } catch (error) {
    console.error('Error loading warehouses:', error)
    UxService.showSnackbar({
      message: t('warehouse.management.messages.loadError'),
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

const getWarehouseTypeLabel = (type) => {
  const typeOption = typeOptions.value.find(option => option.value === type)
  return typeOption ? typeOption.label : type
}

const formatCoordinates = (latitude, longitude) => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

const openCreateModal = () => {
  selectedWarehouse.value = null
  showModal.value = true
}

const editWarehouse = (warehouse) => {
  selectedWarehouse.value = warehouse
  showModal.value = true
}

const deleteWarehouse = async (warehouse) => {
  const confirmed = await UxService.showConfirmDialog(
    t('warehouse.management.messages.deleteConfirm')
  )
  
  if (!confirmed) return

  try {
    await warehouseService.deleteWarehouse(warehouse.id)
    await loadWarehouses()
    UxService.showSnackbar({
      message: t('warehouse.management.messages.deleteSuccess'),
      type: 'success'
    })
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    UxService.showSnackbar({
      message: t('warehouse.management.messages.deleteError'),
      type: 'error'
    })
  }
}

const closeModal = () => {
  showModal.value = false
  selectedWarehouse.value = null
}

const handleWarehouseSaved = async () => {
  await loadWarehouses()
  closeModal()
  const message = selectedWarehouse.value 
    ? t('warehouse.management.messages.updateSuccess')
    : t('warehouse.management.messages.createSuccess')
  UxService.showSnackbar({
    message: message,
    type: 'success'
  })
}

// Exponer funciones globalmente para los botones del mapa
window.editWarehouse = (id) => {
  const warehouse = warehouses.value.find(w => w.id === id)
  if (warehouse) {
    editWarehouse(warehouse)
  }
}

window.deleteWarehouse = (id) => {
  const warehouse = warehouses.value.find(w => w.id === id)
  if (warehouse) {
    deleteWarehouse(warehouse)
  }
}

// Watchers
watch([filters], () => {
  updateMapMarkers()
})

// Lifecycle
onMounted(() => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  script.async = true
  script.defer = true
  script.onload = () => {
    loadWarehouses()
    initializeMap()
  }
  script.onerror = () => {
    UxService.showSnackbar({
      message: 'Error loading Google Maps',
      type: 'error'
    })
  }
  document.head.appendChild(script)
})

onUnmounted(() => {
  markers.value.forEach(marker => marker.setMap(null))
  delete window.editWarehouse
  delete window.deleteWarehouse
})
</script>

<style scoped>
.warehouse-management {
  padding: v-bind('theme.spacing.lg');
  background-color: v-bind('theme.colors.background');
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: v-bind('theme.spacing.lg');
}

.title {
  color: v-bind('theme.colors.primary');
  font-size: v-bind('theme.fontSize.lg');
  margin: 0;
  font-weight: v-bind('theme.fontWeight.bold');
}

.create-button {
  background-color: v-bind('theme.colors.primary');
  color: v-bind('theme.textColors.inverted');
  border: none;
  padding: v-bind('theme.spacing.sm') v-bind('theme.spacing.md');
  border-radius: v-bind('theme.borderRadius.sm');
  cursor: pointer;
  transition: v-bind('theme.transition');
  display: flex;
  align-items: center;
  gap: v-bind('theme.spacing.xs');

  &:hover {
    background-color: v-bind('theme.colors.primaryDark');
  }

  i {
    font-size: v-bind('theme.fontSize.sm');
  }
}

.filters {
  display: flex;
  gap: v-bind('theme.spacing.lg');
  margin-bottom: v-bind('theme.spacing.lg');
}

.filter-group {
  display: flex;
  align-items: center;
  gap: v-bind('theme.spacing.sm');

  label {
    font-weight: v-bind('theme.fontWeight.medium');
    color: v-bind('theme.textColors.primary');
  }
}

.filter-select {
  padding: v-bind('theme.spacing.sm');
  border: 1px solid v-bind('theme.borderColor');
  border-radius: v-bind('theme.borderRadius.sm');
  background-color: v-bind('theme.colors.surface');
  color: v-bind('theme.textColors.primary');
  transition: v-bind('theme.transition');

  &:focus {
    outline: none;
    border-color: v-bind('theme.colors.primary');
    box-shadow: 0 0 0 2px v-bind('theme.colors.primaryLight');
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: v-bind('theme.spacing.lg');
}

.map-container {
  height: 500px;
  border: 1px solid v-bind('theme.borderColor');
  border-radius: v-bind('theme.borderRadius.base');
  overflow: hidden;
  box-shadow: v-bind('theme.boxShadow');
}

.map {
  width: 100%;
  height: 100%;
}

.table-container {
  border: 1px solid v-bind('theme.borderColor');
  border-radius: v-bind('theme.borderRadius.base');
  overflow: auto;
  background-color: v-bind('theme.colors.surface');
  box-shadow: v-bind('theme.boxShadow');
}

.warehouse-table {
  width: 100%;
  border-collapse: collapse;
}

.warehouse-table th,
.warehouse-table td {
  padding: v-bind('theme.spacing.md');
  text-align: left;
  border-bottom: 1px solid v-bind('theme.borderColor');
  color: v-bind('theme.textColors.primary');
}

.warehouse-table th {
  background-color: v-bind('theme.colors.primary');
  color: v-bind('theme.textColors.inverted');
  font-weight: v-bind('theme.fontWeight.bold');
}

.warehouse-table tr:hover {
  background-color: v-bind('theme.colors.backgroundSecondary');
}

.actions {
  display: flex;
  gap: v-bind('theme.spacing.sm');
}

.action-button {
  padding: v-bind('theme.spacing.xs');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm');
  cursor: pointer;
  transition: v-bind('theme.transition');

  &.edit {
    background-color: v-bind('theme.colors.primary');
    color: v-bind('theme.textColors.inverted');

    &:hover {
      background-color: v-bind('theme.colors.primaryDark');
    }
  }

  &.delete {
    background-color: v-bind('theme.colors.error');
    color: v-bind('theme.textColors.inverted');

    &:hover {
      background-color: darken(v-bind('theme.colors.error'), 10%);
    }
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: v-bind('theme.spacing.md');
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .main-content {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: auto;
  }

  .warehouse-table {
    min-width: 600px;
  }
}

:deep(.marker-info) {
  padding: v-bind('theme.spacing.sm');
  max-width: 200px;

  h3 {
    margin: 0 0 v-bind('theme.spacing.xs') 0;
    color: v-bind('theme.colors.primary');
    font-size: v-bind('theme.fontSize.sm');
    font-weight: v-bind('theme.fontWeight.bold');
  }

  p {
    margin: v-bind('theme.spacing.xs') 0;
    color: v-bind('theme.textColors.secondary');
    font-size: v-bind('theme.fontSize.sm');
  }

  .marker-actions {
    display: flex;
    gap: v-bind('theme.spacing.xs');
    margin-top: v-bind('theme.spacing.xs');

    button {
      padding: v-bind('theme.spacing.xs') v-bind('theme.spacing.sm');
      border: none;
      border-radius: v-bind('theme.borderRadius.sm');
      cursor: pointer;
      font-size: v-bind('theme.fontSize.sm');
      transition: v-bind('theme.transition');

      &:first-child {
        background-color: v-bind('theme.colors.primary');
        color: v-bind('theme.textColors.inverted');

        &:hover {
          background-color: v-bind('theme.colors.primaryDark');
        }
      }

      &:last-child {
        background-color: v-bind('theme.colors.error');
        color: v-bind('theme.textColors.inverted');

        &:hover {
          background-color: darken(v-bind('theme.colors.error'), 10%);
        }
      }
    }
  }
}
</style>
