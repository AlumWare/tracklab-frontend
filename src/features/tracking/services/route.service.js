import { http } from '@/shared/services/http.instance.js'

/**
 * Servicio para manejar operaciones de rutas
 */
export class RouteService {
  constructor() {
    this.baseUrl = 'routes'
  }

  /**
   * Obtiene todas las rutas guardadas
   * @returns {Promise<Array>}
   */
  async getAllRoutes() {
    try {
      const response = await http.get(this.baseUrl)
      return response.data
    } catch (error) {
      console.error('Error fetching routes:', error)
      throw error
    }
  }

  /**
   * Guarda una nueva ruta
   * @param {Object} routeData - Datos de la ruta
   * @returns {Promise<Object>}
   */
  async saveRoute(routeData) {
    try {
      const response = await http.post(this.baseUrl, routeData)
      return response.data
    } catch (error) {
      console.error('Error saving route:', error)
      throw error
    }
  }

  /**
   * Obtiene una ruta por ID
   * @param {number|string} id - ID de la ruta
   * @returns {Promise<Object>}
   */
  async getRouteById(id) {
    try {
      const response = await http.get(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching route ${id}:`, error)
      throw error
    }
  }
}

export const routeService = new RouteService()

