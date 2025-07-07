/**
 * Entity for Route business logic
 */
export class RouteEntity {
  /**
   * @param {RouteResource} routeResource - Route resource data
   */
  constructor(routeResource) {
    this.routeId = routeResource.routeId
    this.vehicleId = routeResource.vehicleId
    this.routeName = routeResource.routeName
    this.plannedStartDate = routeResource.plannedStartDate
    this.description = routeResource.description
    this.createdAt = routeResource.createdAt
    this.isActive = routeResource.isActive || false
    this.routeItems = routeResource.routeItems || []
    this.orders = routeResource.orders || []
  }

  /**
   * Verifica si la ruta está activa
   * @returns {boolean}
   */
  isRouteActive() {
    return this.isActive
  }

  /**
   * Obtiene el estado de la ruta en español
   * @returns {string}
   */
  getStatusInSpanish() {
    return this.isActive ? 'Activa' : 'Inactiva'
  }

  /**
   * Obtiene la fecha de inicio planeada formateada
   * @returns {string|null}
   */
  getFormattedPlannedStartDate() {
    if (!this.plannedStartDate) return null
    return new Date(this.plannedStartDate).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Obtiene la fecha de creación formateada
   * @returns {string}
   */
  getFormattedCreatedDate() {
    return new Date(this.createdAt).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Calcula el número total de almacenes en la ruta
   * @returns {number}
   */
  getTotalWarehouses() {
    return this.routeItems.length
  }

  /**
   * Calcula el número de almacenes completados
   * @returns {number}
   */
  getCompletedWarehouses() {
    return this.routeItems.filter(item => item.isCompleted).length
  }

  /**
   * Calcula el porcentaje de progreso
   * @returns {number}
   */
  getProgressPercentage() {
    if (this.routeItems.length === 0) return 0
    return Math.round((this.getCompletedWarehouses() / this.getTotalWarehouses()) * 100)
  }

  /**
   * Verifica si la ruta está completada
   * @returns {boolean}
   */
  isCompleted() {
    return this.routeItems.length > 0 && this.routeItems.every(item => item.isCompleted)
  }

  /**
   * Obtiene el número total de órdenes
   * @returns {number}
   */
  getTotalOrders() {
    return this.orders.length
  }

  /**
   * Obtiene las órdenes pendientes
   * @returns {Array}
   */
  getPendingOrders() {
    return this.orders.filter(order => order.status !== 'COMPLETED')
  }

  /**
   * Obtiene las órdenes completadas
   * @returns {Array}
   */
  getCompletedOrders() {
    return this.orders.filter(order => order.status === 'COMPLETED')
  }

  /**
   * Obtiene el siguiente almacén a visitar
   * @returns {Object|null}
   */
  getNextWarehouse() {
    return this.routeItems.find(item => !item.isCompleted) || null
  }

  /**
   * Verifica si la ruta ha comenzado
   * @returns {boolean}
   */
  hasStarted() {
    return this.routeItems.some(item => item.isCompleted)
  }

  /**
   * Convierte la entidad a objeto plano para APIs
   * @returns {Object}
   */
  toPlainObject() {
    return {
      routeId: this.routeId,
      vehicleId: this.vehicleId,
      routeName: this.routeName,
      plannedStartDate: this.plannedStartDate,
      description: this.description,
      createdAt: this.createdAt,
      isActive: this.isActive,
      routeItems: this.routeItems,
      orders: this.orders
    }
  }
}

/**
 * Entity for RouteItem business logic
 */
export class RouteItemEntity {
  constructor(routeItemResource) {
    this.id = routeItemResource.id
    this.warehouseId = routeItemResource.warehouseId
    this.isCompleted = routeItemResource.isCompleted || false
    this.completedAt = routeItemResource.completedAt
  }

  /**
   * Verifica si el item está completado
   * @returns {boolean}
   */
  isItemCompleted() {
    return this.isCompleted
  }

  /**
   * Obtiene el estado del item en español
   * @returns {string}
   */
  getStatusInSpanish() {
    return this.isCompleted ? 'Completado' : 'Pendiente'
  }

  /**
   * Obtiene la fecha de completado formateada
   * @returns {string|null}
   */
  getFormattedCompletionDate() {
    if (!this.completedAt) return null
    return new Date(this.completedAt).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
