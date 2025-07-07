import { http } from '@/shared/services/http.instance.js'
import { ProductEntity } from '../models/product.entity.js'

/**
 * Servicio para gestionar productos
 */
export class ProductService {
  constructor() {
    this.baseUrl = '/products'
  }

  /**
   * Obtiene todos los productos disponibles
   * @returns {Promise<ProductEntity[]>}
   */
  async getAvailableProducts() {
    try {
      const response = await http.get(`${this.baseUrl}/available`)
      return response.data.map(product => new ProductEntity(product))
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  /**
   * Obtiene un producto por su ID
   * @param {string} productId - ID del producto
   * @returns {Promise<ProductEntity>}
   */
  async getProductById(productId) {
    try {
      const response = await http.get(`${this.baseUrl}/${productId}`)
      return new ProductEntity(response.data)
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error)
      throw error
    }
  }

  /*
   * Obtiene los detalles completos de varios productos
   * @param {string[]} productIds - Array de IDs de productos
   * @returns {Promise<ProductEntity[]>}
   
  async getProductsDetails(productIds) {
    try {
      const response = await http.post(`${this.baseUrl}/details`, { ids: productIds })
      return response.data.map(product => new ProductEntity(product))
    } catch (error) {
      console.error('Error fetching products details:', error)
      throw error
    }
  }*/

  /**
   * Busca productos por término de búsqueda
   * @param {string} query - Término de búsqueda
   * @returns {Promise<ProductEntity[]>}
   */
  async searchProducts(query) {
    try {
      const response = await http.get(`${this.baseUrl}/search`, {
        params: { q: query }
      })
      return response.data.map(product => new ProductEntity(product))
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  }

  /**
   * Actualiza el stock de un producto
   * @param {string} productId - ID del producto
   * @param {number} quantity - Nueva cantidad en stock
   * @returns {Promise<ProductEntity>}
   */
  async updateStock(productId, quantity) {
    try {
      const response = await http.patch(`${this.baseUrl}/${productId}/stock`, { stock: quantity })
      return new ProductEntity(response.data)
    } catch (error) {
      console.error(`Error updating stock for product ${productId}:`, error)
      throw error
    }
  }

  /**
   * Obtiene productos por categoría
   * @param {string} category - Categoría de productos
   * @returns {Promise<ProductEntity[]>}
   */
  async getProductsByCategory(category) {
    try {
      const response = await http.get(`${this.baseUrl}/category/${category}`)
      return response.data.map(product => new ProductEntity(product))
    } catch (error) {
      console.error(`Error fetching products by category ${category}:`, error)
      throw error
    }
  }

  /**
   * Obtiene productos relacionados
   * @param {string} productId - ID del producto
   * @returns {Promise<ProductEntity[]>}
   */
  async getRelatedProducts(productId) {
    try {
      const response = await http.get(`${this.baseUrl}/${productId}/related`)
      return response.data.map(product => new ProductEntity(product))
    } catch (error) {
      console.error(`Error fetching related products for ${productId}:`, error)
      throw error
    }
  }
}

// Exportar una instancia singleton
export const productService = new ProductService()
