/**
 * Enum class for warehouse types
 */
export class WarehouseType {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  // Predefined warehouse types
  static Client = new WarehouseType('Client', 'Cliente warehouse');
  static Provider = new WarehouseType('Provider', 'Proveedor warehouse');
  static Logistics = new WarehouseType('Logistics', 'Logística warehouse');

  /**
   * Get all available warehouse types
   * @returns {WarehouseType[]} Array of warehouse type instances
   */
  static getAllTypes() {
    return [WarehouseType.Client, WarehouseType.Provider, WarehouseType.Logistics];
  }

  /**
   * Create warehouse type from name (validates against predefined types)
   * @param {string} name - Warehouse type name to find
   * @returns {WarehouseType} Warehouse type instance
   * @throws {Error} If warehouse type name is invalid
   */
  static fromName(name) {
    const type = WarehouseType.getAllTypes().find(t => t.name === name);
    if (!type) {
      throw new Error(`Invalid warehouse type: ${name}. Must be one of: ${WarehouseType.getAllTypes().map(t => t.name).join(', ')}`);
    }
    return type;
  }

  /**
   * Check if warehouse type name is valid
   * @param {string} name - Warehouse type name to validate
   * @returns {boolean} True if valid warehouse type name
   */
  static isValidType(name) {
    return WarehouseType.getAllTypes().some(t => t.name === name);
  }

  // Convenience methods
  isClient() {
    return this === WarehouseType.Client;
  }

  isProvider() {
    return this === WarehouseType.Provider;
  }

  isLogistics() {
    return this === WarehouseType.Logistics;
  }

  /**
   * Convert warehouse type to string representation
   * @returns {string} Warehouse type name
   */
  toString() {
    return this.name;
  }
}
