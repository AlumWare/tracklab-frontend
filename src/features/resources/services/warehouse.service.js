import { http } from '@/shared/services/http.instance.js'
import { WarehouseEntity } from '../models/warehouse.entity.js'
import { WarehouseResource } from '../models/warehouse.resource.js'

/**
 * Servicio para manejar operaciones de almacenes
 */
export class WarehouseService {
  constructor() {
    this.baseUrl = 'v1/warehouses'
  }

  /**
   * Obtiene todos los almacenes
   * @returns {Promise<WarehouseEntity[]>}
   */
  async getAllWarehouses() {
    try {
      const response = await http.get(this.baseUrl)
      return response.data.map(warehouse => WarehouseResource.fromApiResponse(warehouse))
    } catch (error) {
      console.error('Error fetching warehouses:', error)
      throw error
    }
  }

  /**
   * Obtiene un almacén por ID
   * @param {number} id - ID del almacén
   * @returns {Promise<WarehouseEntity>}
   */
  async getWarehouseById(id) {
    try {
      const response = await http.get(`${this.baseUrl}/${id}`)
      return WarehouseResource.fromApiResponse(response.data)
    } catch (error) {
      console.error(`Error fetching warehouse ${id}:`, error)
      throw error
    }
  }

  /**
   * Crea un nuevo almacén
   * @param {Object} warehouseData - Datos del almacén
   * @param {string} warehouseData.name - Nombre del almacén
   * @param {string} warehouseData.type - Tipo de almacén
   * @param {number} warehouseData.latitude - Latitud
   * @param {number} warehouseData.longitude - Longitud
   * @param {string} warehouseData.address - Dirección
   * @returns {Promise<WarehouseEntity>}
   */
  async createWarehouse(warehouseData) {
    try {
      // Validar datos antes de enviar
      const validation = WarehouseResource.validateCreateData(warehouseData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const requestData = WarehouseResource.createWarehouseRequest(warehouseData)
      const response = await http.post(this.baseUrl, requestData)
      return WarehouseResource.fromApiResponse(response.data)
    } catch (error) {
      console.error('Error creating warehouse:', error)
      throw error
    }
  }

  /**
   * Actualiza un almacén existente
   * @param {number} id - ID del almacén
   * @param {Object} warehouseData - Datos actualizados del almacén
   * @returns {Promise<WarehouseEntity>}
   */
  async updateWarehouse(id, warehouseData) {
    try {
      // Validar datos antes de enviar
      const validation = WarehouseResource.validateUpdateData(warehouseData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const requestData = WarehouseResource.updateWarehouseRequest(warehouseData)
      const response = await http.put(`${this.baseUrl}/${id}`, requestData)
      return WarehouseResource.fromApiResponse(response.data)
    } catch (error) {
      console.error(`Error updating warehouse ${id}:`, error)
      throw error
    }
  }

  /**
   * Elimina un almacén
   * @param {number} id - ID del almacén
   * @returns {Promise<void>}
   */
  async deleteWarehouse(id) {
    try {
      await http.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error(`Error deleting warehouse ${id}:`, error)
      throw error
    }
  }

  /**
   * Obtiene almacenes por tipo
   * @param {string} type - Tipo de almacén
   * @returns {Promise<WarehouseEntity[]>}
   */
  async getWarehousesByType(type) {
    try {
      const response = await http.get(`${this.baseUrl}/type/${type}`)
      return response.data.map(warehouse => WarehouseResource.fromApiResponse(warehouse))
    } catch (error) {
      console.error(`Error fetching warehouses by type ${type}:`, error)
      throw error
    }
  }

  /**
   * Busca almacenes por nombre
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<WarehouseEntity[]>}
   */
  async searchWarehouses(searchTerm) {
    try {
      const response = await http.get(`${this.baseUrl}/search`, {
        params: { q: searchTerm }
      })
      return response.data.map(warehouse => WarehouseResource.fromApiResponse(warehouse))
    } catch (error) {
      console.error(`Error searching warehouses with term ${searchTerm}:`, error)
      throw error
    }
  }
}

// Exportar una instancia singleton
export const warehouseService = new WarehouseService()
