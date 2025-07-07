/**
 * Entity for Container business logic
 */
export class ContainerEntity {
  /**
   * @param {ContainerResource} containerResource - Container resource data
   */
  constructor(containerResource) {
    this.containerId = containerResource.containerId
    this.orderId = containerResource.orderId
    this.warehouseId = containerResource.warehouseId
    this.shipItems = containerResource.shipItems || []
    this.totalWeight = containerResource.totalWeight || 0
    this.qrCode = containerResource.qrCode
    this.isCompleted = containerResource.isCompleted || false
    this.completedAt = containerResource.completedAt
    this.completionNotes = containerResource.completionNotes
  }

  /**
   * Verifica si el contenedor está completado
   * @returns {boolean}
   */
  isContainerCompleted() {
    return this.isCompleted
  }

  /**
   * Verifica si el contenedor está pendiente
   * @returns {boolean}
   */
  isPending() {
    return !this.isCompleted
  }

  /**
   * Obtiene el estado del contenedor en español
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

  /**
   * Calcula el número total de items
   * @returns {number}
   */
  getTotalItems() {
    return this.shipItems.reduce((total, item) => total + item.quantity, 0)
  }

  /**
   * Obtiene el peso formateado
   * @returns {string}
   */
  getFormattedWeight() {
    return `${this.totalWeight} kg`
  }

  /**
   * Verifica si el contenedor tiene código QR
   * @returns {boolean}
   */
  hasQRCode() {
    return this.qrCode !== null && this.qrCode !== undefined
  }

  /**
   * Obtiene la URL del código QR
   * @returns {string|null}
   */
  getQRCodeUrl() {
    return this.qrCode ? this.qrCode.url : null
  }

  /**
   * Verifica si el contenedor está listo para envío
   * @returns {boolean}
   */
  isReadyForShipment() {
    return this.shipItems.length > 0 && this.totalWeight > 0
  }

  /**
   * Convierte la entidad a objeto plano para APIs
   * @returns {Object}
   */
  toPlainObject() {
    return {
      containerId: this.containerId,
      orderId: this.orderId,
      warehouseId: this.warehouseId,
      shipItems: this.shipItems,
      totalWeight: this.totalWeight,
      qrCode: this.qrCode,
      isCompleted: this.isCompleted,
      completedAt: this.completedAt,
      completionNotes: this.completionNotes
    }
  }
}

/**
 * Entity for ShipItem business logic
 */
export class ShipItemEntity {
  constructor(shipItemResource) {
    this.productId = shipItemResource.productId
    this.quantity = shipItemResource.quantity
    this.unitWeight = shipItemResource.unitWeight
  }

  /**
   * Calcula el peso total del item
   * @returns {number}
   */
  getTotalWeight() {
    return this.quantity * this.unitWeight
  }

  /**
   * Obtiene el peso total formateado
   * @returns {string}
   */
  getFormattedTotalWeight() {
    return `${this.getTotalWeight()} kg`
  }

  /**
   * Obtiene el peso unitario formateado
   * @returns {string}
   */
  getFormattedUnitWeight() {
    return `${this.unitWeight} kg`
  }
}
