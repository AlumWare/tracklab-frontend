/**
 * Resource for sign up response payload
 */
export class SignUpResponse {
  /**
   * @param {number} id - User unique identifier
   * @param {string} username - Username
   * @param {string} email - User email
   * @param {string} [firstName] - User first name (optional)
   * @param {string} [lastName] - User last name (optional)
   * @param {string} [tenantType] - Tenant type (optional)
   * @param {string} token - Authentication token
   */
  constructor(
    id,
    username,
    email,
    firstName = null,
    lastName = null,
    tenantType = null,
    token
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.tenantType = tenantType;
    this.token = token;
  }
}
