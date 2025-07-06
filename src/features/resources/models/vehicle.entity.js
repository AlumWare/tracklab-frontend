/**
 * Entity for vehicle resource
 */
export class Vehicle {
  /**
   * @param {number} id - Vehicle unique identifier
   * @param {string} licensePlate - Vehicle license plate
   * @param {number} loadCapacity - Vehicle load capacity in tons
   * @param {number} paxCapacity - Vehicle passenger capacity
   * @param {string} status - Vehicle status (Available, InUse, Maintenance, etc.)
   * @param {number} latitude - Vehicle current latitude
   * @param {number} longitude - Vehicle current longitude
   * @param {Array<VehicleImage>} images - Vehicle images array
   */
  constructor(id, licensePlate, loadCapacity, paxCapacity, status, latitude, longitude, images = []) {
    this.id = id;
    this.licensePlate = licensePlate;
    this.loadCapacity = loadCapacity;
    this.paxCapacity = paxCapacity;
    this.status = status;
    this.latitude = latitude;
    this.longitude = longitude;
    this.images = images;
  }
}

/**
 * Entity for vehicle image resource
 */
export class VehicleImage {
  /**
   * @param {number} id - Image unique identifier
   * @param {string} imageUrl - Image URL
   * @param {string} publicId - Cloudinary public ID
   * @param {string} createdAt - Image creation timestamp
   */
  constructor(id, imageUrl, publicId, createdAt) {
    this.id = id;
    this.imageUrl = imageUrl;
    this.publicId = publicId;
    this.createdAt = createdAt;
  }
}