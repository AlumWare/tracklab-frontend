/**
 * User model for IAM context
 * This class represents the data model for the User entity
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.fullName = data.fullName || '';
    this.active = data.active !== undefined ? data.active : true;
    this.roles = data.roles || [];
  }

  /**
   * Gets the full name of the user
   * @returns {string} Full name
   */
  getFullName() {
    if (this.fullName) {
      return this.fullName;
    }
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Checks if the user is active
   * @returns {boolean} Active status
   */
  isActive() {
    return this.active;
  }

  /**
   * Activates the user
   */
  activate() {
    this.active = true;
  }

  /**
   * Deactivates the user
   */
  deactivate() {
    this.active = false;
  }

  /**
   * Gets the user's email
   * @returns {string} User's email
   */
  getEmail() {
    return this.email;
  }

  /**
   * Sets the user's email
   * @param {string} emailValue - Email value
   */
  setEmail(emailValue) {
    this.email = emailValue || '';
  }

  /**
   * Adds a role to the user
   * @param {string} role - Role name
   * @returns {User} User instance
   */
  addRole(role) {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
    return this;
  }

  /**
   * Adds multiple roles to the user
   * @param {Array<string>} roles - Array of role names
   * @returns {User} User instance
   */
  addRoles(roles) {
    roles.forEach(role => this.addRole(role));
    return this;
  }

  /**
   * Removes a role from the user
   * @param {string} role - Role name
   * @returns {User} User instance
   */
  removeRole(role) {
    const index = this.roles.indexOf(role);
    if (index > -1) {
      this.roles.splice(index, 1);
    }
    return this;
  }

  /**
   * Checks if the user has a specific role
   * @param {string} role - Role name
   * @returns {boolean} True if user has the role
   */
  hasRole(role) {
    return this.roles.includes(role);
  }

  /**
   * Checks if the user is admin
   * @returns {boolean} True if user is admin
   */
  isAdmin() {
    return this.hasRole('ROLE_ADMIN');
  }

  /**
   * Checks if the user is operator
   * @returns {boolean} True if user is operator
   */
  isOperator() {
    return this.hasRole('ROLE_OPERATOR');
  }

  /**
   * Checks if the user is supervisor
   * @returns {boolean} True if user is supervisor
   */
  isSupervisor() {
    return this.hasRole('ROLE_SUPERVISOR');
  }

  /**
   * Checks if the user is client
   * @returns {boolean} True if user is client
   */
  isClient() {
    return this.hasRole('ROLE_CLIENT');
  }

  /**
   * Checks if the user is provider
   * @returns {boolean} True if user is provider
   */
  isProvider() {
    return this.hasRole('ROLE_PROVIDER');
  }

  /**
   * Gets all role names for this user
   * @returns {Array<string>} Array of role names
   */
  getRoleNames() {
    return [...this.roles];
  }

  /**
   * Clears all roles from the user
   */
  clearRoles() {
    this.roles = [];
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      active: this.active,
      roles: this.roles
    };
  }

  /**
   * Creates an instance from a plain object
   * @param {Object} data - Plain object data
   * @returns {User} User instance
   */
  static fromJSON(data) {
    return new User(data);
  }

  /**
   * Creates an instance from API response
   * @param {Object} apiData - API response data
   * @returns {User} User instance
   */
  static fromAPI(apiData) {
    return new User({
      id: apiData.id,
      username: apiData.username,
      email: apiData.email,
      firstName: apiData.firstName,
      lastName: apiData.lastName,
      fullName: apiData.fullName,
      active: apiData.active,
      roles: apiData.roles || []
    });
  }
}


