import { http } from '@/shared/services/http.instance.js';
import { Vehicle, VehicleImage } from '../models/vehicle.entity.js';
import { VehicleResource, VehicleImageResource, CreateVehicleResource } from '../models/vehicle.resource.js';

/**
 * Service for vehicle management operations
 */
export class VehicleService {
  constructor() {
    this.baseUrl = 'v1/vehicles';
  }

  /**
   * Get all vehicles
   * @returns {Promise<Vehicle[]>} Array of vehicles
   */
  async getAll() {
    try {
      const response = await http.get(this.baseUrl);
      return response.data.map(vehicleData => this.mapToEntity(vehicleData));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Error al obtener los vehículos');
    }
  }

  /**
   * Get vehicle by ID
   * @param {number} id - Vehicle ID
   * @returns {Promise<Vehicle>} Vehicle entity
   */
  async getById(id) {
    try {
      const response = await http.get(`${this.baseUrl}/${id}`);
      return this.mapToEntity(response.data);
    } catch (error) {
      console.error(`Error fetching vehicle ${id}:`, error);
      throw new Error('Error al obtener el vehículo');
    }
  }

  /**
   * Create a new vehicle
   * @param {CreateVehicleResource} vehicleResource - Vehicle creation data
   * @returns {Promise<Vehicle>} Created vehicle entity
   */
  async create(vehicleResource) {
    try {
      const formData = new FormData();
      
      // Add vehicle data
      formData.append('licensePlate', vehicleResource.licensePlate);
      formData.append('loadCapacity', vehicleResource.loadCapacity);
      formData.append('paxCapacity', vehicleResource.paxCapacity);
      formData.append('latitude', vehicleResource.latitude);
      formData.append('longitude', vehicleResource.longitude);
      formData.append('tonnage', vehicleResource.tonnage);
      
      // Add images if present
      if (vehicleResource.images && vehicleResource.images.length > 0) {
        vehicleResource.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await http.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return this.mapToEntity(response.data);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw new Error('Error al crear el vehículo');
    }
  }

  /**
   * Update an existing vehicle
   * @param {number} id - Vehicle ID
   * @param {VehicleResource} vehicleResource - Vehicle update data
   * @returns {Promise<Vehicle>} Updated vehicle entity
   */
  async update(id, vehicleResource) {
    try {
      const response = await http.put(`${this.baseUrl}/${id}`, vehicleResource);
      return this.mapToEntity(response.data);
    } catch (error) {
      console.error(`Error updating vehicle ${id}:`, error);
      throw new Error('Error al actualizar el vehículo');
    }
  }

  /**
   * Delete a vehicle
   * @param {number} id - Vehicle ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await http.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting vehicle ${id}:`, error);
      throw new Error('Error al eliminar el vehículo');
    }
  }

  /**
   * Upload images for a vehicle
   * @param {number} vehicleId - Vehicle ID
   * @param {File[]} images - Array of image files
   * @returns {Promise<VehicleImage[]>} Array of uploaded vehicle images
   */
  async uploadImages(vehicleId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      const response = await http.post(`${this.baseUrl}/${vehicleId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.map(imageData => this.mapImageToEntity(imageData));
    } catch (error) {
      console.error(`Error uploading images for vehicle ${vehicleId}:`, error);
      throw new Error('Error al subir las imágenes');
    }
  }

  /**
   * Delete a vehicle image
   * @param {number} vehicleId - Vehicle ID
   * @param {number} imageId - Image ID
   * @returns {Promise<void>}
   */
  async deleteImage(vehicleId, imageId) {
    try {
      await http.delete(`${this.baseUrl}/${vehicleId}/images/${imageId}`);
    } catch (error) {
      console.error(`Error deleting image ${imageId} for vehicle ${vehicleId}:`, error);
      throw new Error('Error al eliminar la imagen');
    }
  }

  /**
   * Get vehicles by status
   * @param {string} status - Vehicle status
   * @returns {Promise<Vehicle[]>} Array of vehicles with specified status
   */
  async getByStatus(status) {
    try {
      const response = await http.get(`${this.baseUrl}?status=${status}`);
      return response.data.map(vehicleData => this.mapToEntity(vehicleData));
    } catch (error) {
      console.error(`Error fetching vehicles by status ${status}:`, error);
      throw new Error('Error al obtener los vehículos por estado');
    }
  }

  /**
   * Map API response to Vehicle entity
   * @param {Object} data - API response data
   * @returns {Vehicle} Vehicle entity
   */
  mapToEntity(data) {
    const images = data.images ? data.images.map(img => this.mapImageToEntity(img)) : [];
    return new Vehicle(
      data.id,
      data.licensePlate,
      data.loadCapacity,
      data.paxCapacity,
      data.status,
      data.latitude,
      data.longitude,
      images
    );
  }

  /**
   * Map API response to VehicleImage entity
   * @param {Object} data - API response data
   * @returns {VehicleImage} VehicleImage entity
   */
  mapImageToEntity(data) {
    return new VehicleImage(
      data.id,
      data.imageUrl,
      data.publicId,
      data.createdAt
    );
  }
}

// Export singleton instance
export const vehicleService = new VehicleService();
