import { http } from '@/shared/services/http.instance.js'
import { 
  ContainerResource, 
  RouteResource, 
  TrackingEventResource 
} from '../models'

/**
 * Service for tracking operations
 */
export class TrackingService {
  /**
   * Base URL for tracking endpoints
   */
  static baseUrl = '/api/tracking'

  /**
   * Get tracking information for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Complete tracking information
   */
  static async getOrderTracking(orderId) {
    try {
      const response = await http.get(`${this.baseUrl}/orders/${orderId}`)
      return {
        order: response.data.order,
        containers: response.data.containers?.map(container => new ContainerResource(container)),
        routes: response.data.routes?.map(route => new RouteResource(route)),
        events: response.data.events?.map(event => new TrackingEventResource(event))
      }
    } catch (error) {
      console.error('Error fetching order tracking:', error)
      throw error
    }
  }

  /**
   * Get tracking information for a container
   * @param {string} containerId - Container ID
   * @returns {Promise<Object>} - Container tracking information
   */
  static async getContainerTracking(containerId) {
    try {
      const response = await http.get(`${this.baseUrl}/containers/${containerId}`)
      return {
        container: new ContainerResource(response.data.container),
        events: response.data.events?.map(event => new TrackingEventResource(event)),
        route: response.data.route ? new RouteResource(response.data.route) : null
      }
    } catch (error) {
      console.error('Error fetching container tracking:', error)
      throw error
    }
  }

  /**
   * Get tracking information for a route
   * @param {string} routeId - Route ID
   * @returns {Promise<Object>} - Route tracking information
   */
  static async getRouteTracking(routeId) {
    try {
      const response = await http.get(`${this.baseUrl}/routes/${routeId}`)
      return {
        route: new RouteResource(response.data.route),
        containers: response.data.containers?.map(container => new ContainerResource(container)),
        events: response.data.events?.map(event => new TrackingEventResource(event))
      }
    } catch (error) {
      console.error('Error fetching route tracking:', error)
      throw error
    }
  }

  /**
   * Get all tracking events for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<TrackingEventResource[]>}
   */
  static async getOrderEvents(orderId) {
    try {
      const response = await http.get(`${this.baseUrl}/orders/${orderId}/events`)
      return response.data.map(event => new TrackingEventResource(event))
    } catch (error) {
      console.error('Error fetching order events:', error)
      throw error
    }
  }

  /**
   * Create a new tracking event
   * @param {TrackingEventResource} eventResource - Event data
   * @returns {Promise<TrackingEventResource>}
   */
  static async createTrackingEvent(eventResource) {
    try {
      const response = await http.post(`${this.baseUrl}/events`, eventResource)
      return new TrackingEventResource(response.data)
    } catch (error) {
      console.error('Error creating tracking event:', error)
      throw error
    }
  }

  /**
   * Get containers by warehouse
   * @param {string} warehouseId - Warehouse ID
   * @returns {Promise<ContainerResource[]>}
   */
  static async getContainersByWarehouse(warehouseId) {
    try {
      const response = await http.get(`${this.baseUrl}/warehouses/${warehouseId}/containers`)
      return response.data.map(container => new ContainerResource(container))
    } catch (error) {
      console.error('Error fetching containers by warehouse:', error)
      throw error
    }
  }

  /**
   * Get active routes
   * @returns {Promise<RouteResource[]>}
   */
  static async getActiveRoutes() {
    try {
      const response = await http.get(`${this.baseUrl}/routes/active`)
      return response.data.map(route => new RouteResource(route))
    } catch (error) {
      console.error('Error fetching active routes:', error)
      throw error
    }
  }

  /**
   * Update container location
   * @param {string} containerId - Container ID
   * @param {string} warehouseId - New warehouse ID
   * @returns {Promise<ContainerResource>}
   */
  static async updateContainerLocation(containerId, warehouseId) {
    try {
      const response = await http.patch(`${this.baseUrl}/containers/${containerId}/location`, {
        warehouseId
      })
      return new ContainerResource(response.data)
    } catch (error) {
      console.error('Error updating container location:', error)
      throw error
    }
  }

  /**
   * Update route progress
   * @param {string} routeId - Route ID
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Promise<RouteResource>}
   */
  static async updateRouteProgress(routeId, progress) {
    try {
      const response = await http.patch(`${this.baseUrl}/routes/${routeId}/progress`, {
        progress
      })
      return new RouteResource(response.data)
    } catch (error) {
      console.error('Error updating route progress:', error)
      throw error
    }
  }

  /**
   * Complete route
   * @param {string} routeId - Route ID
   * @returns {Promise<RouteResource>}
   */
  static async completeRoute(routeId) {
    try {
      const response = await http.patch(`${this.baseUrl}/routes/${routeId}/complete`)
      return new RouteResource(response.data)
    } catch (error) {
      console.error('Error completing route:', error)
      throw error
    }
  }

  /**
   * Get tracking statistics
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.warehouseId] - Warehouse ID
   * @param {string} [filters.routeId] - Route ID
   * @param {Date} [filters.startDate] - Start date
   * @param {Date} [filters.endDate] - End date
   * @returns {Promise<Object>}
   */
  static async getTrackingStatistics(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params.append(key, value.toISOString())
          } else {
            params.append(key, value.toString())
          }
        }
      })

      const response = await http.get(`${this.baseUrl}/statistics?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching tracking statistics:', error)
      throw error
    }
  }

  /**
   * Search tracking events
   * @param {Object} criteria - Search criteria
   * @param {string} [criteria.orderId] - Order ID
   * @param {string} [criteria.containerId] - Container ID
   * @param {string} [criteria.warehouseId] - Warehouse ID
   * @param {string} [criteria.eventType] - Event type
   * @param {Date} [criteria.startDate] - Start date
   * @param {Date} [criteria.endDate] - End date
   * @returns {Promise<TrackingEventResource[]>}
   */
  static async searchTrackingEvents(criteria = {}) {
    try {
      const params = new URLSearchParams()
      
      Object.entries(criteria).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params.append(key, value.toISOString())
          } else {
            params.append(key, value.toString())
          }
        }
      })

      const response = await http.get(`${this.baseUrl}/events/search?${params.toString()}`)
      return response.data.map(event => new TrackingEventResource(event))
    } catch (error) {
      console.error('Error searching tracking events:', error)
      throw error
    }
  }

  /**
   * Get container QR code
   * @param {string} containerId - Container ID
   * @returns {Promise<Blob>} - QR code image
   */
  static async getContainerQRCode(containerId) {
    try {
      const response = await http.get(`${this.baseUrl}/containers/${containerId}/qr-code`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error fetching container QR code:', error)
      throw error
    }
  }

  /**
   * Scan container QR code
   * @param {string} qrData - QR code data
   * @returns {Promise<ContainerResource>}
   */
  static async scanContainerQRCode(qrData) {
    try {
      const response = await http.post(`${this.baseUrl}/containers/scan`, {
        qrData
      })
      return new ContainerResource(response.data)
    } catch (error) {
      console.error('Error scanning container QR code:', error)
      throw error
    }
  }

  /**
   * Get delivery proof
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Delivery proof data
   */
  static async getDeliveryProof(orderId) {
    try {
      const response = await http.get(`${this.baseUrl}/orders/${orderId}/delivery-proof`)
      return response.data
    } catch (error) {
      console.error('Error fetching delivery proof:', error)
      throw error
    }
  }

  /**
   * Upload delivery proof
   * @param {string} orderId - Order ID
   * @param {Object} proofData - Proof data (photos, signature, etc.)
   * @returns {Promise<Object>}
   */
  static async uploadDeliveryProof(orderId, proofData) {
    try {
      const response = await http.post(`${this.baseUrl}/orders/${orderId}/delivery-proof`, proofData)
      return response.data
    } catch (error) {
      console.error('Error uploading delivery proof:', error)
      throw error
    }
  }
} 