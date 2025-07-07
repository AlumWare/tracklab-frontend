import { http } from '@/shared/services/http.instance';
import { User } from '@/features/iam/models/user.model';
import { CreateUserRequest } from '@/features/iam/models/create-user.request.js';

/**
 * User service for IAM operations
 * Handles all user-related API calls
 */
export class UserService {
  constructor() {
    this.baseUrl = 'v1/Authentication/users';
  }

  /**
   * Get all users
   * @param {Object} params - Query parameters
   * @returns {Promise<Array<User>>} Array of users
   */
  async getUsers(params = {}) {
    try {
      const response = await http.get(this.baseUrl, { params });
      return response.data.map(userData => User.fromAPI(userData));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<User>} User instance
   */
  async getUserById(userId) {
    try {
      const response = await http.get(`${this.baseUrl}/${userId}`);
      return User.fromAPI(response.data);
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {CreateUserRequest} createUserRequest - User creation request
   * @returns {Promise<User>} Created user instance
   */
  async createUser(createUserRequest) {
    try {
      // Validate request
      const validation = createUserRequest.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await http.post(this.baseUrl, createUserRequest.toJSON());
      return User.fromAPI(response.data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<User>} Updated user instance
   */
  async updateUser(userId, userData) {
    try {
      const response = await http.put(`${this.baseUrl}/${userId}`, userData);
      return User.fromAPI(response.data);
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      await http.delete(`${this.baseUrl}/${userId}`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Activate user
   * @param {number} userId - User ID
   * @returns {Promise<User>} Updated user instance
   */
  async activateUser(userId) {
    try {
      const response = await http.patch(`${this.baseUrl}/${userId}/activate`);
      return User.fromAPI(response.data);
    } catch (error) {
      console.error(`Error activating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate user
   * @param {number} userId - User ID
   * @returns {Promise<User>} Updated user instance
   */
  async deactivateUser(userId) {
    try {
      const response = await http.patch(`${this.baseUrl}/${userId}/deactivate`);
      return User.fromAPI(response.data);
    } catch (error) {
      console.error(`Error deactivating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user roles
   * @param {number} userId - User ID
   * @param {Array<string>} roles - New roles
   * @returns {Promise<User>} Updated user instance
   */
  async updateUserRoles(userId, roles) {
    try {
      const response = await http.patch(`${this.baseUrl}/${userId}/roles`, { roles });
      return User.fromAPI(response.data);
    } catch (error) {
      console.error(`Error updating roles for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Search users by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array<User>>} Array of matching users
   */
  async searchUsers(criteria = {}) {
    try {
      const response = await http.get(`${this.baseUrl}/search`, { params: criteria });
      return response.data.map(userData => User.fromAPI(userData));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   * @param {string} role - Role name
   * @returns {Promise<Array<User>>} Array of users with the specified role
   */
  async getUsersByRole(role) {
    try {
      const response = await http.get(`${this.baseUrl}/by-role/${role}`);
      return response.data.map(userData => User.fromAPI(userData));
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();

// Export class for testing or custom instances
export default UserService;
