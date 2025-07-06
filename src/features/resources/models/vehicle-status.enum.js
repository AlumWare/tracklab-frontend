/**
 * Enum class for vehicle status types
 */
export class VehicleStatus {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  // Predefined vehicle status types
  static Available = new VehicleStatus('Available', 'Vehicle available');
  static NotAvailable = new VehicleStatus('NotAvailable', 'Vehicle not available');
  static InUse = new VehicleStatus('InUse', 'Vehicle in use');
  static Maintenance = new VehicleStatus('Maintenance', 'Vehicle in maintenance');
  static OutOfService = new VehicleStatus('OutOfService', 'Vehicle out of service');

  /**
   * Get all available vehicle status types
   * @returns {VehicleStatus[]} Array of vehicle status type instances
   */
  static getAllTypes() {
    return [VehicleStatus.Available, VehicleStatus.NotAvailable, VehicleStatus.InUse, VehicleStatus.Maintenance, VehicleStatus.OutOfService];
  }

  /**
   * Create vehicle status from name (validates against predefined types)
   * @param {string} name - Vehicle status name to find
   * @returns {VehicleStatus} Vehicle status type instance
   * @throws {Error} If vehicle status name is invalid
   */
  static fromName(name) {
    const status = VehicleStatus.getAllTypes().find(s => s.name === name);
    if (!status) {
      throw new Error(`Invalid vehicle status: ${name}. Must be one of: ${VehicleStatus.getAllTypes().map(s => s.name).join(', ')}`);
    }
    return status;
  }

  /**
   * Check if vehicle status name is valid
   * @param {string} name - Vehicle status name to validate
   * @returns {boolean} True if valid vehicle status name
   */
  static isValidType(name) {
    return VehicleStatus.getAllTypes().some(s => s.name === name);
  }

  // Convenience methods
  isAvailable() {
    return this === VehicleStatus.Available;
  }

  isNotAvailable() {
    return this === VehicleStatus.NotAvailable;
  }

  isInUse() {
    return this === VehicleStatus.InUse;
  }

  isMaintenance() {
    return this === VehicleStatus.Maintenance;
  }

  isOutOfService() {
    return this === VehicleStatus.OutOfService;
  }

  /**
   * Convert vehicle status to string representation
   * @returns {string} Vehicle status name
   */
  toString() {
    return this.name;
  }
}