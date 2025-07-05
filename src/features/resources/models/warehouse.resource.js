import { WarehouseEntity } from './warehouse.entity.js';
import { WarehouseType } from './warehouse-type.enum.js';

/**
 * Clase para manejar los recursos de almacén
 */
export class WarehouseResource {
  /**
   * Crea un objeto para crear un nuevo almacén
   * @param {Object} params - Parámetros del almacén
   * @param {string} params.name - Nombre del almacén
   * @param {string} params.type - Tipo de almacén
   * @param {number} params.latitude - Latitud
   * @param {number} params.longitude - Longitud
   * @param {string} params.address - Dirección
   * @returns {Object}
   */
  static createWarehouseRequest({ name, type, latitude, longitude, address }) {
    return {
      name,
      type,
      latitude,
      longitude,
      address
    };
  }

  /**
   * Crea un objeto para actualizar un almacén existente
   * @param {Object} params - Parámetros del almacén
   * @param {string} params.name - Nuevo nombre del almacén
   * @param {string} params.type - Nuevo tipo de almacén
   * @param {number} params.latitude - Nueva latitud
   * @param {number} params.longitude - Nueva longitud
   * @param {string} params.address - Nueva dirección
   * @returns {Object}
   */
  static updateWarehouseRequest({ name, type, latitude, longitude, address }) {
    return {
      name,
      type,
      latitude,
      longitude,
      address
    };
  }

  /**
   * Convierte la respuesta del API a una entidad WarehouseEntity
   * @param {Object} apiResponse - Respuesta del API
   * @returns {WarehouseEntity}
   */
  static fromApiResponse(apiResponse) {
    return WarehouseEntity.fromObject({
      id: apiResponse.id,
      name: apiResponse.name,
      type: apiResponse.type,
      latitude: apiResponse.latitude,
      longitude: apiResponse.longitude,
      address: apiResponse.address
    });
  }

  /**
   * Convierte una entidad WarehouseEntity a formato de API
   * @param {WarehouseEntity} entity - Entidad de almacén
   * @returns {Object}
   */
  static toApiFormat(entity) {
    return entity.toObject();
  }

  /**
   * Valida los datos de entrada para crear un almacén
   * @param {Object} data - Datos a validar
   * @returns {{isValid: boolean, errors: string[]}}
   */
  static validateCreateData(data) {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('El nombre del almacén es requerido');
    }

    if (!data.type || !WarehouseType.isValidType(data.type)) {
      errors.push('El tipo de almacén es requerido y debe ser válido');
    }

    if (data.latitude === null || data.latitude === undefined || isNaN(data.latitude)) {
      errors.push('La latitud es requerida y debe ser un número válido');
    }

    if (data.longitude === null || data.longitude === undefined || isNaN(data.longitude)) {
      errors.push('La longitud es requerida y debe ser un número válido');
    }

    if (!data.address || data.address.trim() === '') {
      errors.push('La dirección del almacén es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida los datos de entrada para actualizar un almacén
   * @param {Object} data - Datos a validar
   * @returns {{isValid: boolean, errors: string[]}}
   */
  static validateUpdateData(data) {
    const errors = [];

    if (data.name !== undefined && (data.name.trim() === '')) {
      errors.push('El nombre del almacén no puede estar vacío');
    }

    if (data.type !== undefined && !WarehouseType.isValidType(data.type)) {
      errors.push('El tipo de almacén debe ser válido');
    }

    if (data.latitude !== undefined && (isNaN(data.latitude))) {
      errors.push('La latitud debe ser un número válido');
    }

    if (data.longitude !== undefined && (isNaN(data.longitude))) {
      errors.push('La longitud debe ser un número válido');
    }

    if (data.address !== undefined && (data.address.trim() === '')) {
      errors.push('La dirección del almacén no puede estar vacía');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene las opciones de tipo de almacén para formularios
   * @returns {Array<{value: string, label: string}>}
   */
  static getTypeOptions() {
    return [
      { value: WarehouseType.Client.name, label: 'Cliente' },
      { value: WarehouseType.Provider.name, label: 'Proveedor' },
      { value: WarehouseType.Logistics.name, label: 'Logística' }
    ];
  }
}
