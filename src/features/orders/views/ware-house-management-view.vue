<template>
  <div class="warehouse-management">
    <!-- Encabezado -->
    <div class="header">
      <h1 class="title">Gestión de Almacenes</h1>
      <button class="create-button" @click="openCreateModal">
        <i class="fas fa-plus"></i> Crear Almacén
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label>Zona:</label>
        <select v-model="filters.zone" class="filter-select">
          <option value="">Todas las zonas</option>
          <option value="norte">Norte</option>
          <option value="sur">Sur</option>
          <option value="este">Este</option>
          <option value="oeste">Oeste</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Tipo:</label>
        <select v-model="filters.type" class="filter-select">
          <option value="">Todos los tipos</option>
          <option value="own">Propio</option>
          <option value="provider">Proveedor</option>
          <option value="client">Cliente</option>
        </select>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Mapa -->
      <div class="map-container">
        <div id="warehouse-map" class="map"></div>
      </div>

      <!-- Tabla -->
      <div class="table-container">
        <table class="warehouse-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Zona</th>
              <th>Ocupación</th>
              <th>Acciones</th>
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
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="action-button delete"
                  @click="deleteWarehouse(warehouse)"
                  :disabled="warehouse.occupation > 0"
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

export default {
  name: 'WarehouseManagementView',
  components: {
    WarehouseModal
  },
  setup() {
    const toast = useToast()
    const warehouseStore = useWarehouseStore()
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

    // Cargar datos iniciales
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadWarehouses(),
          loadZones()
        ])
        initializeMap()
      } catch (error) {
        toast.error('Error al cargar los datos iniciales')
        console.error(error)
      }
    }

    // Cargar almacenes
    const loadWarehouses = async () => {
      try {
        const response = await warehouseStore.fetchWarehouses()
        warehouses.value = response
        updateMapMarkers()
      } catch (error) {
        toast.error('Error al cargar los almacenes')
        console.error(error)
      }
    }

    // Cargar zonas
    const loadZones = async () => {
      try {
        const response = await warehouseStore.fetchZones()
        zones.value = response
      } catch (error) {
        toast.error('Error al cargar las zonas')
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
      const types = {
        own: 'Propio',
        provider: 'Proveedor',
        client: 'Cliente'
      }
      return types[type] || type
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
        toast.warning('No se puede eliminar un almacén con ocupación')
        return
      }

      try {
        await warehouseStore.deleteWarehouse(warehouse.id)
        await loadWarehouses()
        toast.success('Almacén eliminado correctamente')
      } catch (error) {
        toast.error('Error al eliminar el almacén')
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
          toast.success('Almacén actualizado correctamente')
        } else {
          await warehouseStore.createWarehouse(warehouseData)
          toast.success('Almacén creado correctamente')
        }
        await loadWarehouses()
        closeModal()
      } catch (error) {
        toast.error('Error al guardar el almacén')
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
      // Cargar el script de Google Maps
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      script.async = true
      script.defer = true
      script.onload = loadInitialData
      script.onerror = () => {
        toast.error('Error al cargar Google Maps')
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
      saveWarehouse
    }
  }
}
</script>

<style scoped>
.warehouse-management {
  padding: 20px;
  background-color: #FFFFFF;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  color: #42A5F5;
  font-size: 24px;
  margin: 0;
}

.create-button {
  background-color: #42A5F5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select {
  padding: 8px;
  border: 1px solid #8E8E8E;
  border-radius: 4px;
  background-color: black;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.map-container {
  height: 500px;
  border: 1px solid #8E8E8E;
  border-radius: 4px;
}

.map {
  width: 100%;
  height: 100%;
}

.table-container {
  border: 1px solid #8E8E8E;
  border-radius: 4px;
  overflow: auto;
}

.warehouse-table {
  width: 100%;
  border-collapse: collapse;
}

.warehouse-table th,
.warehouse-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #8E8E8E;
  color: #000000;
}

.warehouse-table th {
  background-color: #42A5F5;
  color: #000000;
  font-weight: 600;
}

.occupation-bar {
  width: 100%;
  height: 24px;
  background-color: #D9D9D9;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid #8E8E8E;
  display: flex;
  align-items: center;
}

.occupation-progress {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  min-width: 40px;
}

.occupation-label {
  font-weight: 600;
  font-size: 14px;
  transition: color 0.3s;
}

.occupation-label-dark {
  color: #000000;
}

.occupation-label-light {
  color: #fff;
}

.low-occupation {
  background-color: #66BB6A;
}

.medium-occupation {
  background-color: #FFF176;
}

.high-occupation {
  background-color: #EF5350;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button.edit {
  background-color: #42A5F5;
  color: white;
}

.action-button.delete {
  background-color: #262828;
  color: red;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estilos para la ventana de información del marcador */
.marker-info {
  padding: 10px;
  max-width: 200px;
}

.marker-info h3 {
  margin: 0 0 8px 0;
  color: #42A5F5;
}

.marker-info p {
  margin: 4px 0;
}

.marker-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.marker-actions button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.marker-actions button:first-child {
  background-color: #42A5F5;
  color: white;
}

.marker-actions button:last-child {
  background-color: #262828;
  color: white;
}

.marker-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

</style>
