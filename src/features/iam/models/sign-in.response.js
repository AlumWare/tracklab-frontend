/**
 * Resource for authenticated user sign-in response
 */
export class SignInResponse {
  /**
   * @param {number} id - User unique identifier
   * @param {string} username - Username
   * @param {string} token - Authentication token
   */
  constructor(id, username, token) {
    this.id = id;
    this.username = username;
    this.token = token;
  }
}


