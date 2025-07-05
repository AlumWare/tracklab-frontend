/**
 * Enum class for tenant types
 */
export class TenantType {
  constructor(value) {
    this.value = value;
  }

  static Client = new TenantType('CLIENT');
  static Provider = new TenantType('PROVIDER');
  static Logistic = new TenantType('LOGISTIC');

  /**
   * Get all tenant type instances
   * @returns {TenantType[]} Array of tenant type instances
   */
  static getAll() {
    return [TenantType.Client, TenantType.Provider, TenantType.Logistic];
  }

  /**
   * Get tenant type by value
   * @param {string} value - Value to find
   * @returns {TenantType|null} Tenant type instance or null if not found
   */
  static fromValue(value) {
    return TenantType.getAll().find(type => type.value === value) || null;
  }

  /**
   * Check if a value is a valid tenant type
   * @param {string} value - Value to validate
   * @returns {boolean} True if valid tenant type
   */
  static isValid(value) {
    return TenantType.fromValue(value) !== null;
  }
}

