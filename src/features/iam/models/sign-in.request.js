/**
 * Resource for sign in request payload
 */
export class SignInRequest {
  /**
   * @param {string} username - Username for authentication
   * @param {string} password - Password for authentication
   */
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
}
