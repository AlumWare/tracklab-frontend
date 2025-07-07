import { EventType } from './event-type.enum.js'

/**
 * Entity for TrackingEvent business logic
 */
export class TrackingEventEntity {
  /**
   * @param {TrackingEventResource} trackingEventResource - TrackingEvent resource data
   */
  constructor(trackingEventResource) {
    this.eventId = trackingEventResource.eventId
    this.containerId = trackingEventResource.containerId
    this.warehouseId = trackingEventResource.warehouseId
    this.type = EventType.fromName(trackingEventResource.type)
    this.eventTime = trackingEventResource.eventTime
  }

  /**
   * Obtiene el tipo de evento en español
   * @returns {string}
   */
  getEventTypeInSpanish() {
    return this.type.description
  }

  /**
   * Obtiene la fecha del evento formateada
   * @returns {string}
   */
  getFormattedEventTime() {
    return new Date(this.eventTime).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Obtiene la fecha del evento en formato corto
   * @returns {string}
   */
  getShortFormattedEventTime() {
    return new Date(this.eventTime).toLocaleDateString('es-PE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Verifica si el evento es de tipo entrega
   * @returns {boolean}
   */
  isDeliveryEvent() {
    return this.type.isDelivered()
  }

  /**
   * Verifica si el evento es de tipo creación
   * @returns {boolean}
   */
  isCreationEvent() {
    return this.type.isCreation()
  }

  /**
   * Verifica si el evento es de tipo llegada
   * @returns {boolean}
   */
  isArrivalEvent() {
    return this.type.isArrival()
  }

  /**
   * Verifica si el evento es de tipo salida
   * @returns {boolean}
   */
  isDepartureEvent() {
    return this.type.isDeparture()
  }

  /**
   * Obtiene el color del evento para UI
   * @returns {string}
   */
  getEventColor() {
    const colorMap = {
      'CREATION': '#4CAF50',         // Verde
      'ARRIVAL': '#9C27B0',          // Púrpura
      'DEPARTURE': '#607D8B',        // Azul gris
      'DELIVERED': '#8BC34A',        // Verde claro
    }
    return colorMap[this.type.name] || '#757575'
  }

  /**
   * Obtiene el icono del evento para UI
   * @returns {string}
   */
  getEventIcon() {
    const iconMap = {
      'CREATION': 'add_circle',
      'ARRIVAL': 'warehouse',
      'DEPARTURE': 'exit_to_app',
      'DELIVERED': 'check_circle',
    }
    return iconMap[this.type.name] || 'event'
  }

  /**
   * Calcula el tiempo transcurrido desde el evento
   * @returns {string}
   */
  getTimeAgo() {
    const now = new Date()
    const eventDate = new Date(this.eventTime)
    const diffMs = now - eventDate
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
    }
  }

  /**
   * Convierte la entidad a objeto plano para APIs
   * @returns {Object}
   */
  toPlainObject() {
    return {
      eventId: this.eventId,
      containerId: this.containerId,
      warehouseId: this.warehouseId,
      type: this.type.toString(),
      eventTime: this.eventTime
    }
  }
}
