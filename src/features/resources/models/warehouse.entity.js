import { WarehouseType } from './warehouse-type.enum.js';

/**
 * Clase que representa una entidad de almacén
 */
export class WarehouseEntity {
  /**
   * @param {Object} params - Parámetros para crear la entidad
   * @param {number} params.id - ID único del almacén
   * @param {string} params.name - Nombre del almacén
   * @param {string} params.type - Tipo de almacén (Client, Provider, Logistics)
   * @param {number} params.latitude - Latitud de la ubicación
   * @param {number} params.longitude - Longitud de la ubicación
   * @param {string} params.address - Dirección del almacén
   */
  constructor({ id, name, type, latitude, longitude, address }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.latitude = latitude;
    this.longitude = longitude;
    this.address = address;
  }

  /**
   * Crea una instancia desde un objeto plano
   * @param {Object} data - Datos del almacén
   * @returns {WarehouseEntity}
   */
  static fromObject(data) {
    return new WarehouseEntity({
      id: data.id,
      name: data.name,
      type: data.type,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address
    });
  }

  /**
   * Convierte la entidad a un objeto plano
   * @returns {Object}
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address
    };
  }

  /**
   * Verifica si el tipo de almacén es válido
   * @returns {boolean}
   */
  isValidType() {
    return WarehouseType.isValidType(this.type);
  }

  /**
   * Obtiene las coordenadas como un objeto
   * @returns {{latitude: number, longitude: number}}
   */
  getCoordinates() {
    return {
      latitude: this.latitude,
      longitude: this.longitude
    };
  }

  /**
   * Verifica si el almacén tiene coordenadas válidas
   * @returns {boolean}
   */
  hasValidCoordinates() {
    return this.latitude !== null && 
           this.longitude !== null && 
           !isNaN(this.latitude) && 
           !isNaN(this.longitude);
  }
}
