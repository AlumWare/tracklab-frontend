import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// Almacenes predeterminados
const defaultWarehouses = [
  // Zona Norte
  {
    id: 'n1',
    name: 'Almacén Norte 1',
    type: 'own',
    zone: 'norte',
    address: 'Av. Los Alisos 123, Lima Norte',
    latitude: -11.9464,
    longitude: -77.0428,
    occupation: 45
  },
  {
    id: 'n2',
    name: 'Almacén Norte 2',
    type: 'provider',
    zone: 'norte',
    address: 'Av. Túpac Amaru 456, Lima Norte',
    latitude: -11.9564,
    longitude: -77.0528,
    occupation: 75
  },
  {
    id: 'n3',
    name: 'Almacén Norte 3',
    type: 'client',
    zone: 'norte',
    address: 'Av. Universitaria 789, Lima Norte',
    latitude: -11.9664,
    longitude: -77.0628,
    occupation: 30
  },
  // Zona Sur
  {
    id: 's1',
    name: 'Almacén Sur 1',
    type: 'own',
    zone: 'sur',
    address: 'Av. Primavera 123, Lima Sur',
    latitude: -12.1464,
    longitude: -76.9428,
    occupation: 60
  },
  {
    id: 's2',
    name: 'Almacén Sur 2',
    type: 'provider',
    zone: 'sur',
    address: 'Av. Los Héroes 456, Lima Sur',
    latitude: -12.1564,
    longitude: -76.9528,
    occupation: 85
  },
  {
    id: 's3',
    name: 'Almacén Sur 3',
    type: 'client',
    zone: 'sur',
    address: 'Av. El Sol 789, Lima Sur',
    latitude: -12.1664,
    longitude: -76.9628,
    occupation: 25
  },
  // Zona Este
  {
    id: 'e1',
    name: 'Almacén Este 1',
    type: 'own',
    zone: 'este',
    address: 'Av. La Molina 123, Lima Este',
    latitude: -12.0464,
    longitude: -76.8428,
    occupation: 55
  },
  {
    id: 'e2',
    name: 'Almacén Este 2',
    type: 'provider',
    zone: 'este',
    address: 'Av. Javier Prado 456, Lima Este',
    latitude: -12.0564,
    longitude: -76.8528,
    occupation: 90
  },
  {
    id: 'e3',
    name: 'Almacén Este 3',
    type: 'client',
    zone: 'este',
    address: 'Av. Aviación 789, Lima Este',
    latitude: -12.0664,
    longitude: -76.8628,
    occupation: 40
  },
  // Zona Oeste
  {
    id: 'o1',
    name: 'Almacén Oeste 1',
    type: 'own',
    zone: 'oeste',
    address: 'Av. Marina 123, Lima Oeste',
    latitude: -12.0464,
    longitude: -77.1428,
    occupation: 70
  },
  {
    id: 'o2',
    name: 'Almacén Oeste 2',
    type: 'provider',
    zone: 'oeste',
    address: 'Av. Argentina 456, Lima Oeste',
    latitude: -12.0564,
    longitude: -77.1528,
    occupation: 50
  },
  {
    id: 'o3',
    name: 'Almacén Oeste 3',
    type: 'client',
    zone: 'oeste',
    address: 'Av. Colonial 789, Lima Oeste',
    latitude: -12.0664,
    longitude: -77.1628,
    occupation: 35
  }
]

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref([...defaultWarehouses])
  const zones = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Obtener todos los almacenes
  const fetchWarehouses = async () => {
    loading.value = true
    error.value = null
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await axios.get('/api/warehouses')
      // warehouses.value = response.data
      return warehouses.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener todas las zonas
  const fetchZones = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/zones')
      zones.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Crear un nuevo almacén
  const createWarehouse = async (warehouseData) => {
    loading.value = true
    error.value = null
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await axios.post('/api/warehouses', warehouseData)
      const newWarehouse = {
        ...warehouseData,
        id: Date.now().toString() // Generar un ID temporal
      }
      warehouses.value.push(newWarehouse)
      return newWarehouse
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actualizar un almacén existente
  const updateWarehouse = async (warehouseData) => {
    loading.value = true
    error.value = null
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await axios.put(`/api/warehouses/${warehouseData.id}`, warehouseData)
      const index = warehouses.value.findIndex(w => w.id === warehouseData.id)
      if (index !== -1) {
        warehouses.value[index] = { ...warehouses.value[index], ...warehouseData }
      }
      return warehouses.value[index]
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Eliminar un almacén
  const deleteWarehouse = async (warehouseId) => {
    loading.value = true
    error.value = null
    try {
      // En un entorno real, esto sería una llamada a la API
      // await axios.delete(`/api/warehouses/${warehouseId}`)
      warehouses.value = warehouses.value.filter(w => w.id !== warehouseId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    warehouses,
    zones,
    loading,
    error,
    fetchWarehouses,
    fetchZones,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
  }
})
