/**
 * Create User Request model for IAM context
 * This class represents the request payload for creating a new user
 */
export class CreateUserRequest {
  constructor(data = {}) {
    this.username = data.username || '';
    this.password = data.password || '';
    this.email = data.email || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.roles = data.roles || [];
  }

  /**
   * Validates the request data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];

    if (!this.username || this.username.trim().length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (!this.password || this.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('El correo electrónico no es válido');
    }

    if (!this.firstName || this.firstName.trim().length === 0) {
      errors.push('El nombre es requerido');
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      errors.push('El apellido es requerido');
    }

    if (!this.roles || this.roles.length === 0) {
      errors.push('Al menos un rol debe ser asignado');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Adds a role to the request
   * @param {string} role - Role name
   * @returns {CreateUserRequest} Request instance
   */
  addRole(role) {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
    return this;
  }

  /**
   * Adds multiple roles to the request
   * @param {Array<string>} roles - Array of role names
   * @returns {CreateUserRequest} Request instance
   */
  addRoles(roles) {
    roles.forEach(role => this.addRole(role));
    return this;
  }

  /**
   * Removes a role from the request
   * @param {string} role - Role name
   * @returns {CreateUserRequest} Request instance
   */
  removeRole(role) {
    const index = this.roles.indexOf(role);
    if (index > -1) {
      this.roles.splice(index, 1);
    }
    return this;
  }

  /**
   * Clears all roles from the request
   * @returns {CreateUserRequest} Request instance
   */
  clearRoles() {
    this.roles = [];
    return this;
  }

  /**
   * Converts the model to a plain object for API request
   * @returns {Object} Plain object
   */
  toJSON() {
    return {
      username: this.username,
      password: this.password,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      roles: this.roles
    };
  }

  /**
   * Creates an instance from a plain object
   * @param {Object} data - Plain object data
   * @returns {CreateUserRequest} Request instance
   */
  static fromJSON(data) {
    return new CreateUserRequest(data);
  }

  /**
   * Creates an empty instance
   * @returns {CreateUserRequest} Empty request instance
   */
  static createEmpty() {
    return new CreateUserRequest({
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      roles: []
    });
  }
}
