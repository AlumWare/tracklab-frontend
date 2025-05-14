<template>
  <div class="warehouse-management">
    <!-- Encabezado -->
    <div class="header">
      <h1 class="title">{{ t('warehouse.management.title') }}</h1>
      <button class="create-button" @click="openCreateModal">
        <i class="fas fa-plus"></i> {{ t('warehouse.management.create') }}
      </button>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>{{ t('warehouse.management.filters.zone.label') }}</label>
        <select v-model="filters.zone" class="filter-select">
          <option value="">{{ t('warehouse.management.filters.zone.all') }}</option>
          <option value="north">{{ t('warehouse.management.filters.zone.north') }}</option>
          <option value="south">{{ t('warehouse.management.filters.zone.south') }}</option>
          <option value="east">{{ t('warehouse.management.filters.zone.east') }}</option>
          <option value="west">{{ t('warehouse.management.filters.zone.west') }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>{{ t('warehouse.management.filters.type.label') }}</label>
        <select v-model="filters.type" class="filter-select">
          <option value="">{{ t('warehouse.management.filters.type.all') }}</option>
          <option value="own">{{ t('warehouse.types.own') }}</option>
          <option value="provider">{{ t('warehouse.types.provider') }}</option>
          <option value="client">{{ t('warehouse.types.client') }}</option>
        </select>
      </div>
    </div>


    <div class="main-content">
      <!-- Mapa -->
      <div class="map-container">
        <div id="warehouse-map" class="map"></div>
      </div>


      <div class="table-container">
        <table class="warehouse-table">
          <thead>
            <tr>
              <th>{{ t('warehouse.management.table.name') }}</th>
              <th>{{ t('warehouse.management.table.type') }}</th>
              <th>{{ t('warehouse.management.table.zone') }}</th>
              <th>{{ t('warehouse.management.table.occupation') }}</th>
              <th>{{ t('warehouse.management.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="warehouse in filteredWarehouses" :key="warehouse.id">
              <td>{{ warehouse.name }}</td>
              <td>{{ getWarehouseType(warehouse.type) }}</td>
              <td>{{ getZoneName(warehouse.zone) }}</td>
              <td>
                <div class="occupation-bar">
                  <div
                    class="occupation-progress"
                    :style="{ width: warehouse.occupation + '%' }"
                    :class="getOccupationClass(warehouse.occupation)"
                  >
                    <span class="occupation-label" :class="getOccupationTextClass(warehouse.occupation)">
                      {{ warehouse.occupation }}%
                    </span>
                  </div>
                </div>
              </td>
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
                  :disabled="warehouse.occupation > 0"
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

    <warehouse-modal
      v-if="showModal"
      :warehouse="selectedWarehouse"
      @close="closeModal"
      @save="saveWarehouse"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import WarehouseModal from '../components/WarehouseModal.vue'
import { useWarehouseStore } from '../stores/warehouseStore'
import { useTheme } from '@/shared/composables/useTheme'
import { useI18n } from 'vue-i18n'

export default {
  name: 'WarehouseManagementView',
  components: {
    WarehouseModal
  },
  setup() {
    const toast = useToast()
    const warehouseStore = useWarehouseStore()
    const { theme } = useTheme()
    const { t } = useI18n()
    const map = ref(null)
    const markers = ref([])
    const warehouses = ref([])
    const zones = ref([])
    const filters = ref({
      zone: '',
      type: ''
    })
    const showModal = ref(false)
    const selectedWarehouse = ref(null)

    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadWarehouses(),
          loadZones()
        ])
        initializeMap()
      } catch (error) {
        toast.error(t('warehouse.management.messages.loadError'))
        console.error(error)
      }
    }

    const loadWarehouses = async () => {
      try {
        const response = await warehouseStore.fetchWarehouses()
        warehouses.value = response
        updateMapMarkers()
      } catch (error) {
        toast.error(t('warehouse.management.messages.warehousesLoadError'))
        console.error(error)
      }
    }

    // Cargar zonas
    const loadZones = async () => {
      try {
        const response = await warehouseStore.fetchZones()
        zones.value = response
      } catch (error) {
        toast.error(t('warehouse.management.messages.zonesLoadError'))
        console.error(error)
      }
    }
    const initializeMap = () => {
      if (map.value) return


      if (typeof window.google === 'undefined') {
        console.error('Google Maps no está disponible')
        return
      }

      const mapElement = document.getElementById('warehouse-map')
      if (!mapElement) return

      map.value = new window.google.maps.Map(mapElement, {
        center: { lat: -12.0464, lng: -77.0428 },
        zoom: 12
      })

      updateMapMarkers()
    }


    const updateMapMarkers = () => {
      if (!map.value || typeof window.google === 'undefined') return

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
              <p>Tipo: ${getWarehouseType(warehouse.type)}</p>
              <p>Ocupación: ${warehouse.occupation}%</p>
              <div class="marker-actions">
                <button onclick="window.editWarehouse('${warehouse.id}')">Editar</button>
                <button onclick="window.deleteWarehouse('${warehouse.id}')" ${warehouse.occupation > 0 ? 'disabled' : ''}>
                  Eliminar
                </button>
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

    const filteredWarehouses = computed(() => {
      return warehouses.value.filter(warehouse => {
        if (filters.value.zone && warehouse.zone !== filters.value.zone) return false
        if (filters.value.type && warehouse.type !== filters.value.type) return false
        return true
      })
    })

    const getWarehouseType = (type) => {
      return t(`warehouse.types.${type}`) || type
    }

    const getZoneName = (zone) => {
      const zones = {
        norte: 'Norte',
        sur: 'Sur',
        este: 'Este',
        oeste: 'Oeste'
      }
      return zones[zone] || zone
    }

    const getOccupationClass = (occupation) => {
      if (occupation >= 90) return 'high-occupation'
      if (occupation >= 70) return 'medium-occupation'
      return 'low-occupation'
    }

    const getOccupationTextClass = (occupation) => {
      if (occupation >= 70) return 'occupation-label-light'
      return 'occupation-label-dark'
    }

    const openCreateModal = () => {
      selectedWarehouse.value = null
      showModal.value = true
    }

    const editWarehouse = (warehouse) => {
      selectedWarehouse.value = { ...warehouse }
      showModal.value = true
    }

    const deleteWarehouse = async (warehouse) => {
      if (warehouse.occupation > 0) {
        toast.warning(t('warehouse.management.messages.deleteWarning'))
        return
      }

      try {
        await warehouseStore.deleteWarehouse(warehouse.id)
        await loadWarehouses()
        toast.success(t('warehouse.management.messages.deleteSuccess'))
      } catch (error) {
        toast.error(t('warehouse.management.messages.deleteError'))
        console.error(error)
      }
    }

    const closeModal = () => {
      showModal.value = false
      selectedWarehouse.value = null
    }

    const saveWarehouse = async (warehouseData) => {
      try {
        if (selectedWarehouse.value) {
          await warehouseStore.updateWarehouse(warehouseData)
          toast.success(t('warehouse.management.messages.saveSuccess'))
        } else {
          await warehouseStore.createWarehouse(warehouseData)
          toast.success(t('warehouse.management.messages.saveSuccess'))
        }
        await loadWarehouses()
        closeModal()
      } catch (error) {
        toast.error(t('warehouse.management.messages.saveError'))
        console.error(error)
      }
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

    // Observar cambios en los filtros
    watch([filters], () => {
      updateMapMarkers()
    })

    onMounted(() => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      script.async = true
      script.defer = true
      script.onload = loadInitialData
      script.onerror = () => {
        toast.error(t('warehouse.management.messages.mapsLoadError'))
      }
      document.head.appendChild(script)
    })

    onUnmounted(() => {

      markers.value.forEach(marker => marker.setMap(null))
      delete window.editWarehouse
      delete window.deleteWarehouse
    })

    return {
      warehouses,
      zones,
      filters,
      showModal,
      selectedWarehouse,
      filteredWarehouses,
      getWarehouseType,
      getZoneName,
      getOccupationClass,
      getOccupationTextClass,
      openCreateModal,
      editWarehouse,
      deleteWarehouse,
      closeModal,
      saveWarehouse,
      theme,
      t
    }
  }
}
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

.occupation-bar {
  width: 100%;
  height: 24px;
  background-color: v-bind('theme.colors.backgroundSecondary');
  border-radius: v-bind('theme.borderRadius.sm');
  overflow: hidden;
  position: relative;
  border: 1px solid v-bind('theme.borderColor');
  display: flex;
  align-items: center;
}

.occupation-progress {
  height: 100%;
  border-radius: v-bind('theme.borderRadius.sm');
  transition: v-bind('theme.transition');
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: v-bind('theme.spacing.sm');
  min-width: 40px;
}

.occupation-label {
  font-weight: v-bind('theme.fontWeight.bold');
  font-size: v-bind('theme.fontSize.sm');
  transition: v-bind('theme.transition');
}

.occupation-label-dark {
  color: v-bind('theme.textColors.primary');
}

.occupation-label-light {
  color: v-bind('theme.textColors.inverted');
}

.low-occupation {
  background-color: v-bind('theme.colors.success');
}

.medium-occupation {
  background-color: v-bind('theme.colors.warning');
}

.high-occupation {
  background-color: v-bind('theme.colors.error');
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
