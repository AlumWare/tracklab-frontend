import { http } from '@/shared/services/http.instance.js'
import { 
  CreateOrderResource, 
  OrderResource, 
  AddOrderItemResource,
  OrderTrackingInfoResource 
} from '../models/order.resource.js'
import { productService } from '@/features/resources/services/product.service.js'

/**
 * Service for order operations
 */
export class OrderService {
  /**
   * Base URL for order endpoints
   */
  static baseUrl = '/orders'

  /**
   * Get orders by customer ID
   * CustomerId is in the token
   * @returns {Promise<{data: OrderResource[]}>}
   */
  static async getOrdersByCustomer() {
    try {
      const response = await http.get(`${this.baseUrl}`)
      const orders = response.data.map(order => new OrderResource(order))
      
      // Enrich orders with product names
      const enrichedOrders = await this.enrichOrdersWithProductNames(orders)
      
      return {
        data: enrichedOrders
      }
    } catch (error) {
      console.error('Error fetching orders by customer:', error)
      throw error
    }
  }

  /**
   * Get orders by logistics provider ID
   * LogisticsId is in the token
   * @returns {Promise<{data: OrderResource[]}>}
   */
  static async getOrdersByLogistics() {
    try {
      const response = await http.get(`${this.baseUrl}`)
      return {
        data: response.data.map(order => new OrderResource(order))
      }
    } catch (error) {
      console.error('Error fetching orders by logistics:', error)
      throw error
    }
  }


  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<OrderResource>}
   */
  static async getOrderById(orderId) {
    try {
      const response = await http.get(`${this.baseUrl}/${orderId}`)
      return new OrderResource(response.data)
    } catch (error) {
      console.error('Error fetching order by ID:', error)
      throw error
    }
  }

  /**
   * Create a new order
   * @param {CreateOrderResource} createOrderResource - Order data
   * @returns {Promise<OrderResource>}
   */
  static async createOrder(createOrderResource) {
    try {
      const response = await http.post(this.baseUrl, createOrderResource)
      return new OrderResource(response.data)
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<OrderResource>}
   */
  static async updateOrderStatus(orderId, status) {
    try {
      const response = await http.patch(`${this.baseUrl}/${orderId}/status`, { status })
      return new OrderResource(response.data)
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @returns {Promise<OrderResource>}
   */
  static async cancelOrder(orderId) {
    try {
      const response = await http.patch(`${this.baseUrl}/${orderId}/cancel`)
      return new OrderResource(response.data)
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw error
    }
  }

  /**
   * Add item to order
   * @param {string} orderId - Order ID
   * @param {AddOrderItemResource} itemResource - Item to add
   * @returns {Promise<OrderResource>}
   */
  static async addItemToOrder(orderId, itemResource) {
    try {
      const response = await http.post(`${this.baseUrl}/${orderId}/items`, itemResource)
      return new OrderResource(response.data)
    } catch (error) {
      console.error('Error adding item to order:', error)
      throw error
    }
  }

  /**
   * Remove item from order
   * @param {string} orderId - Order ID
   * @param {string} itemId - Item ID to remove
   * @returns {Promise<OrderResource>}
   */
  static async removeItemFromOrder(orderId, itemId) {
    try {
      const response = await http.delete(`${this.baseUrl}/${orderId}/items/${itemId}`)
      return new OrderResource(response.data)
    } catch (error) {
      console.error('Error removing item from order:', error)
      throw error
    }
  }

  /**
   * Get order tracking information
   * @param {string} orderId - Order ID
   * @returns {Promise<OrderTrackingInfoResource>}
   */
  static async getOrderTracking(orderId) {
    try {
      const response = await http.get(`${this.baseUrl}/${orderId}/tracking`)
      return new OrderTrackingInfoResource(response.data)
    } catch (error) {
      console.error('Error fetching order tracking:', error)
      throw error
    }
  }

  /**
   * Update order shipping address
   * @param {string} orderId - Order ID
   * @param {string} shippingAddress - New shipping address
   * @returns {Promise<OrderResource>}
   */
  static async updateShippingAddress(orderId, shippingAddress) {
    try {
      const response = await http.patch(`${this.baseUrl}/${orderId}/shipping-address`, { 
        shippingAddress 
      })
      return new OrderResource(response.data)
    } catch (error) {
      console.error('Error updating shipping address:', error)
      throw error
    }
  }

  /**
   * Get orders with filters
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.status] - Order status
   * @param {string} [filters.customerId] - Customer ID
   * @param {string} [filters.logisticsId] - Logistics provider ID
   * @param {Date} [filters.startDate] - Start date filter
   * @param {Date} [filters.endDate] - End date filter
   * @param {number} [filters.page] - Page number (1-based)
   * @param {number} [filters.limit] - Items per page
   * @returns {Promise<{data: OrderResource[], total: number, page: number, limit: number}>}
   */
  static async getOrdersWithFilters(filters = {}) {
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

      const response = await http.get(`${this.baseUrl}?${params.toString()}`)
      
      return {
        data: response.data.orders.map(order => new OrderResource(order)),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit
      }
    } catch (error) {
      console.error('Error fetching orders with filters:', error)
      throw error
    }
  }

  /**
   * Export orders to CSV
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Blob>}
   */
  static async exportOrdersToCSV(filters = {}) {
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

      const response = await http.get(`${this.baseUrl}/export/csv?${params.toString()}`, {
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting orders to CSV:', error)
      throw error
    }
  }

  /**
   * Get order statistics
   * @param {string} [customerId] - Customer ID for customer-specific stats
   * @param {string} [logisticsId] - Logistics ID for logistics-specific stats
   * @returns {Promise<Object>}
   */
  static async getOrderStatistics(customerId = null, logisticsId = null) {
    try {
      const params = new URLSearchParams()
      if (customerId) params.append('customerId', customerId)
      if (logisticsId) params.append('logisticsId', logisticsId)

      const response = await http.get(`${this.baseUrl}/statistics?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching order statistics:', error)
      throw error
    }
  }

  /**
   * Enrich orders with product names
   * @param {OrderResource[]} orders - Array of orders to enrich
   * @returns {Promise<OrderResource[]>}
   */
  static async enrichOrdersWithProductNames(orders) {
    try {
      // Collect all unique product IDs from all orders
      const productIds = new Set()
      orders.forEach(order => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach(item => {
            if (item.productId) {
              productIds.add(item.productId)
            }
          })
        }
      })

      // Fetch product details for all unique product IDs
      const productDetails = {}
      if (productIds.size > 0) {
        try {
          // Si existe getProductsDetails, úsalo; si no, usa getProductById para cada uno
          if (typeof productService.getProductsDetails === 'function') {
            // Intenta usar el batch si existe
            const products = await productService.getProductsDetails(Array.from(productIds))
            products.forEach(product => {
              productDetails[product.id] = product
            })
          } else {
            // Fallback: una llamada por cada id
            for (const id of productIds) {
              try {
                const product = await productService.getProductById(id)
                productDetails[product.id] = product
              } catch (e) {
                // Si falla, ignora ese producto
              }
            }
          }
        } catch (error) {
          console.warn('Error fetching product details:', error)
          // Continue without product names if service fails
        }
      }

      // Enrich orders with product names
      const enrichedOrders = orders.map(order => {
        const enrichedOrder = { ...order }
        
        if (enrichedOrder.orderItems && Array.isArray(enrichedOrder.orderItems)) {
          enrichedOrder.orderItems = enrichedOrder.orderItems.map(item => {
            const product = productDetails[item.productId]
            return {
              ...item,
              productName: product ? product.name : `Product ${item.productId}`,
              productDescription: product ? product.description : ''
            }
          })
        }
        
        return enrichedOrder
      })

      return enrichedOrders
    } catch (error) {
      console.error('Error enriching orders with product names:', error)
      // Return orders without enrichment if process fails
      return orders
    }
  }
} 