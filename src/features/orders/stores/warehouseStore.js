import { defineStore } from 'pinia'
import { LocalStorageService } from '@/core/services/local-storage.service'

const STORAGE_KEY = 'warehouses'

const defaultWarehouses = [

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

export const useWarehouseStore = defineStore('warehouse', {
  state: () => ({
    warehouses: [],
    zones: [
      { id: 'norte', name: 'Norte' },
      { id: 'sur', name: 'Sur' },
      { id: 'este', name: 'Este' },
      { id: 'oeste', name: 'Oeste' }
    ]
  }),

  actions: {
    async fetchWarehouses() {
      const storedWarehouses = LocalStorageService.getItem(STORAGE_KEY)
      if (storedWarehouses) {
        this.warehouses = storedWarehouses
      }
      return this.warehouses
    },

    async fetchZones() {
      return this.zones
    },

    async createWarehouse(warehouse) {
      const newWarehouse = {
        ...warehouse,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      this.warehouses.push(newWarehouse)
      LocalStorageService.setItem(STORAGE_KEY, this.warehouses)
      return newWarehouse
    },

    async updateWarehouse(warehouse) {
      const index = this.warehouses.findIndex(w => w.id === warehouse.id)
      if (index !== -1) {
        this.warehouses[index] = {
          ...this.warehouses[index],
          ...warehouse,
          updatedAt: new Date().toISOString()
        }
        LocalStorageService.setItem(STORAGE_KEY, this.warehouses)
        return this.warehouses[index]
      }
      throw new Error('Warehouse not found')
    },

    async deleteWarehouse(id) {
      const index = this.warehouses.findIndex(w => w.id === id)
      if (index !== -1) {
        this.warehouses.splice(index, 1)
        LocalStorageService.setItem(STORAGE_KEY, this.warehouses)
        return true
      }
      throw new Error('Warehouse not found')
    }
  }
})
