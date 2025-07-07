import { OrderStatus } from './order-status.enum.js'

/**
 * Entity for Order business logic
 */
export class OrderEntity {
  /**
   * @param {OrderResource} orderResource - Order resource data
   */
  constructor(orderResource) {
    this.orderId = orderResource.orderId || orderResource.id
    this.customerId = orderResource.customerId
    this.logisticsId = orderResource.logisticsId
    this.shippingAddress = orderResource.shippingAddress
    this.orderDate = orderResource.orderDate || orderResource.date
    this.status = typeof orderResource.status === 'string' 
      ? OrderStatus.fromName(orderResource.status) 
      : orderResource.status
    this.totalPrice = orderResource.totalPrice
    this.orderItems = orderResource.orderItems || orderResource.materials || []
  }

  /**
   * Obtiene el precio total formateado
   * @returns {string} - Precio formateado con moneda
   */
  getFormattedPrice() {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(this.totalPrice)
  }

  /**
   * Calcula el número total de items
   * @returns {number} - Total de items
   */
  getTotalItems() {
    return this.orderItems.reduce((total, item) => total + item.quantity, 0)
  }

  /**
   * Verifica si la orden está pendiente
   * @returns {boolean}
   */
  isPending() {
    return this.status.isPending()
  }

  /**
   * Verifica si la orden está en proceso
   * @returns {boolean}
   */
  isInProgress() {
    return this.status.isInProcess()
  }

  /**
   * Verifica si la orden está enviada
   * @returns {boolean}
   */
  isShipped() {
    return this.status.isShipped()
  }

  /**
   * Verifica si la orden está entregada
   * @returns {boolean}
   */
  isDelivered() {
    return this.status.isDelivered()
  }

  /**
   * Verifica si la orden está cancelada
   * @returns {boolean}
   */
  isCancelled() {
    return this.status.isCancelled()
  }

  /**
   * Obtiene el estado de la orden en español
   * @returns {string}
   */
  getStatusInSpanish() {
    return this.status.description
  }

  /**
   * Obtiene la fecha formateada
   * @returns {string}
   */
  getFormattedDate() {
    return new Date(this.orderDate).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Convierte la entidad a objeto plano para APIs
   * @returns {Object}
   */
  toPlainObject() {
    return {
      orderId: this.orderId,
      customerId: this.customerId,
      logisticsId: this.logisticsId,
      shippingAddress: this.shippingAddress,
      orderDate: this.orderDate,
      status: this.status.toString(),
      totalPrice: this.totalPrice,
      orderItems: this.orderItems
    }
  }
}

/**
 * Entity for OrderItem business logic
 */
export class OrderItemEntity {
  constructor(orderItemResource) {
    this.id = orderItemResource.id
    this.productId = orderItemResource.productId
    this.quantity = orderItemResource.quantity
    this.priceAmount = orderItemResource.priceAmount
    this.priceCurrency = orderItemResource.priceCurrency
  }

  /**
   * Calcula el precio total del item
   * @returns {number}
   */
  getTotalPrice() {
    return this.quantity * this.priceAmount
  }

  /**
   * Obtiene el precio formateado
   * @returns {string}
   */
  getFormattedPrice() {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: this.priceCurrency || 'PEN'
    }).format(this.getTotalPrice())
  }
}
