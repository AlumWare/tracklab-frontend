/**
 * Enum class for system roles
 */
export class Role {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  // Predefined roles
  static Admin = new Role('ROLE_ADMIN', 'Administrator with full system access');
  static Operator = new Role('ROLE_OPERATOR', 'Operator with operational access');
  static Supervisor = new Role('ROLE_SUPERVISOR', 'Supervisor with oversight permissions');
  static Client = new Role('ROLE_CLIENT', 'Client with limited access');
  static Provider = new Role('ROLE_PROVIDER', 'Provider with supplier permissions');

  /**
   * Get all available roles
   * @returns {Role[]} Array of role instances
   */
  static getAllRoles() {
    return [Role.Admin, Role.Operator, Role.Supervisor, Role.Client, Role.Provider];
  }

  /**
   * Create role from name (validates against predefined roles)
   * @param {string} name - Role name to find
   * @returns {Role} Role instance
   * @throws {Error} If role name is invalid
   */
  static fromName(name) {
    const role = Role.getAllRoles().find(r => r.name === name);
    if (!role) {
      throw new Error(`Invalid role: ${name}. Must be one of: ${Role.getAllRoles().map(r => r.name).join(', ')}`);
    }
    return role;
  }

  /**
   * Check if role name is valid
   * @param {string} name - Role name to validate
   * @returns {boolean} True if valid role name
   */
  static isValidRole(name) {
    return Role.getAllRoles().some(r => r.name === name);
  }

  // Convenience methods
  isAdmin() {
    return this === Role.Admin;
  }

  isOperator() {
    return this === Role.Operator;
  }

  isSupervisor() {
    return this === Role.Supervisor;
  }

  isClient() {
    return this === Role.Client;
  }

  isProvider() {
    return this === Role.Provider;
  }

  /**
   * Convert role to string representation
   * @returns {string} Role name
   */
  toString() {
    return this.name;
  }
}
