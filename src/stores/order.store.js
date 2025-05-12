import { defineStore } from 'pinia'
import { Order } from '@/features/orders/models/order.entity'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [
      new Order({
        id: 1,
        status: Order.STATUS.PENDING,
        date: '2024-06-01',
        materials: [
          { name: 'Filtros para maquinaria pesada', quantity: 60, unit: 'unidades', delivered: 0 },
          { name: 'Filtros de aire', quantity: 30, unit: 'unidades', delivered: 0 }
        ],
        destination: 'Proyecto Minero Cerro Verde – Arequipa',
        totalItems: 90,
        deliveredItems: 0
      }),
      new Order({
        id: 2,
        status: Order.STATUS.IN_PROCESS,
        date: '2024-06-02',
        materials: [
          { name: 'Paneles de drywall', quantity: 100, unit: 'paneles', delivered: 20 },
          { name: 'Pernos de anclaje', quantity: 200, unit: 'unidades', delivered: 0 }
        ],
        destination: 'Almacén de materiales – San Juan de Lurigancho',
        totalItems: 300,
        deliveredItems: 20
      }),
      new Order({
        id: 3,
        status: Order.STATUS.IN_PROCESS,
        date: '2024-06-03',
        materials: [
          { name: 'Ladrillos King Kong', quantity: 1000, unit: 'unidades', delivered: 150 },
          { name: 'Varillas de acero', quantity: 500, unit: 'varillas', delivered: 500 }
        ],
        destination: 'Obra San Martín – Trujillo',
        totalItems: 1500,
        deliveredItems: 650
      }),
      new Order({
        id: 4,
        status: Order.STATUS.PENDING,
        date: '2024-06-04',
        materials: [
          { name: 'Puertas de madera', quantity: 20, unit: 'puertas', delivered: 0 },
          { name: 'Cajas de clavos', quantity: 50, unit: 'cajas', delivered: 0 }
        ],
        destination: 'Edificio Empresarial – San Isidro',
        totalItems: 70,
        deliveredItems: 0
      }),
      new Order({
        id: 5,
        status: Order.STATUS.IN_PROCESS,
        date: '2024-06-05',
        materials: [
          { name: 'Tuberías de PVC', quantity: 20, unit: 'tubos', delivered: 10 },
          { name: 'Pernos de anclaje', quantity: 100, unit: 'unidades', delivered: 50 }
        ],
        destination: 'Proyecto Residencial – Miraflores',
        totalItems: 120,
        deliveredItems: 60
      }),
      new Order({
        id: 6,
        status: Order.STATUS.PENDING,
        date: '2024-06-06',
        materials: [
          { name: 'Ladrillos King Kong', quantity: 500, unit: 'unidades', delivered: 0 },
          { name: 'Filtros de aire', quantity: 10, unit: 'unidades', delivered: 0 }
        ],
        destination: 'Obra Nueva Esperanza – Lima',
        totalItems: 510,
        deliveredItems: 0
      }),
      new Order({
        id: 7,
        status: Order.STATUS.IN_PROCESS,
        date: '2024-06-07',
        materials: [
          { name: 'Paneles de drywall', quantity: 50, unit: 'paneles', delivered: 0 },
          { name: 'Pernos de anclaje', quantity: 50, unit: 'unidades', delivered: 40 }
        ],
        destination: 'Central de procesamiento – Huancayo',
        totalItems: 100,
        deliveredItems: 40
      }),
      new Order({
        id: 8,
        status: Order.STATUS.DELIVERED,
        date: '2024-06-08',
        materials: [
          { name: 'Filtros para maquinaria pesada', quantity: 10, unit: 'unidades', delivered: 10 },
          { name: 'Tuberías de PVC', quantity: 10, unit: 'tubos', delivered: 10 }
        ],
        destination: 'Almacén principal – Callao',
        totalItems: 20,
        deliveredItems: 20
      }),
      new Order({
        id: 9,
        status: Order.STATUS.DELIVERED,
        date: '2024-06-09',
        materials: [
          { name: 'Varillas de acero', quantity: 100, unit: 'varillas', delivered: 100 },
          { name: 'Cajas de clavos', quantity: 10, unit: 'cajas', delivered: 10 }
        ],
        destination: 'Proyecto Casas del Sol – Arequipa',
        totalItems: 110,
        deliveredItems: 110
      }),
      new Order({
        id: 10,
        status: Order.STATUS.DELIVERED,
        date: '2024-06-10',
        materials: [
          { name: 'Puertas de madera', quantity: 5, unit: 'puertas', delivered: 5 },
          { name: 'Filtros de aire', quantity: 5, unit: 'unidades', delivered: 5 }
        ],
        destination: 'Obra San Martín – Trujillo',
        totalItems: 10,
        deliveredItems: 10
      })
    ],
    selectedOrder: null
  }),

  getters: {
    getOrders: (state) => state.orders,
    getSelectedOrder: (state) => state.selectedOrder,
    getPendingOrders: (state) => state.orders.filter(order => order.status === Order.STATUS.PENDING),
    getInProcessOrders: (state) => state.orders.filter(order => order.status === Order.STATUS.IN_PROCESS),
    getDeliveredOrders: (state) => state.orders.filter(order => order.status === Order.STATUS.DELIVERED)
  },

  actions: {
    setSelectedOrder(order) {
      this.selectedOrder = order
    },

    addOrder(order) {
      this.orders.push(new Order(order))
    },

    updateOrder(orderId, updatedData) {
      const index = this.orders.findIndex(order => order.id === orderId)
      if (index !== -1) {
        this.orders[index] = new Order({ ...this.orders[index], ...updatedData })
      }
    },

    deleteOrder(orderId) {
      this.orders = this.orders.filter(order => order.id !== orderId)
    },

    filterOrders(searchText, status) {
      return this.orders.filter(order => {
        const matchesStatus = status ? order.status === status : true
        const searchLower = searchText.toLowerCase()
        const matchesSearch =
          order.materials.some(material =>
            material.name.toLowerCase().includes(searchLower)
          ) ||
          order.destination.toLowerCase().includes(searchLower)
        return matchesStatus && matchesSearch
      })
    }
  }
})
