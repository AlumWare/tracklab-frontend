import { http } from '@/shared/services/http.instance';
import { SignInRequest } from '../models/sign-in.request';
import { SignInResponse } from '../models/sign-in.response';
import { SignUpRequest } from '../models/sign-up.request';
import { SignUpResponse } from '../models/sign-up.response';
import { TenantType } from '../models/tenant-type.enum';
import { Role } from '../models/roles.enum';

/**
 * Authentication service for handling user authentication
 */
export class AuthService {
  static API_BASE = '/Authentication';

  /**
   * Sign in user
   * @param {string} username - Username for authentication
   * @param {string} password - Password for authentication
   * @returns {Promise<SignInResponse>} Authentication response
   */
  static async signIn(username, password) {
    try {
      const request = new SignInRequest(username, password);
      const response = await http.post(`${this.API_BASE}/sign-in`, request);
      
      const signInResponse = new SignInResponse(
        response.data.id,
        response.data.username,
        response.data.token
      );

      // Store token and user info in localStorage
      localStorage.setItem('accessToken', signInResponse.token);
      localStorage.setItem('user', JSON.stringify({
        id: signInResponse.id,
        username: signInResponse.username,
        token: signInResponse.token
      }));

      return signInResponse;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  /**
   * Sign up new user and company
   * @param {Object} signUpData - Sign up data
   * @returns {Promise<SignUpResponse>} Registration response
   */
  static async signUp(signUpData) {
    try {
      // Map tenant type to initial role
      const initialRole = this.mapTenantTypeToRole(signUpData.tenantType);
      
      const request = new SignUpRequest(
        signUpData.ruc,
        signUpData.legalName,
        signUpData.commercialName,
        signUpData.address,
        signUpData.city,
        signUpData.country,
        signUpData.tenantPhone,
        signUpData.tenantEmail,
        signUpData.website,
        signUpData.username,
        signUpData.password,
        signUpData.email,
        signUpData.firstName,
        signUpData.lastName,
        signUpData.tenantType
      );

      // Add role to request payload
      const requestPayload = {
        ...request,
        role: initialRole.name
      };

      const response = await http.post(`${this.API_BASE}/sign-up`, requestPayload);
      
      const signUpResponse = new SignUpResponse(
        response.data.id,
        response.data.username,
        response.data.email,
        response.data.firstName,
        response.data.lastName,
        response.data.tenantType,
        response.data.token
      );


      return signUpResponse;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  static async signOut() {
    try {
      await http.post(`${this.API_BASE}/sign-out`);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user from localStorage
   * @returns {Object|null} Current user data or null if not authenticated
   */
  static getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  static isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Get authentication token
   * @returns {string|null} Authentication token or null
   */
  static getToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Map tenant type to initial role
   * @param {string} tenantType - Tenant type value
   * @returns {Role} Initial role for the tenant type
   */
  static mapTenantTypeToRole(tenantType) {
    const tenantTypeObj = TenantType.fromValue(tenantType);
    
    if (!tenantTypeObj) {
      throw new Error(`Invalid tenant type: ${tenantType}`);
    }

    switch (tenantTypeObj.value) {
      case TenantType.Client.value:
        return Role.Client;
      case TenantType.Provider.value:
        return Role.Provider;
      case TenantType.Logistic.value:
        return Role.Admin;
      default:
        throw new Error(`No role mapping found for tenant type: ${tenantType}`);
    }
  }

  /**
   * Refresh token
   * @returns {Promise<string>} New authentication token
   */
  static async refreshToken() {
    try {
      const response = await http.post(`${this.API_BASE}/refresh-token`);
      const newToken = response.data.token;
      
      // Update token in localStorage
      localStorage.setItem('accessToken', newToken);
      
      // Update user data with new token
      const user = this.getCurrentUser();
      if (user) {
        user.token = newToken;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.signOut();
      throw error;
    }
  }
}

// Export singleton instance
export const authService = AuthService;