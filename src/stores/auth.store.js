import { defineStore } from 'pinia'
import { AuthService } from '@/features/iam/services/auth.service'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isUserAuthenticated: (state) => state.isAuthenticated,
    getUserRole: (state) => state.user?.role || null,
    getUserTenantType: (state) => state.user?.tenantType || null,
    isLoading: (state) => state.loading
  },

  actions: {
    initializeAuth() {
      const user = AuthService.getCurrentUser()
      const token = AuthService.getToken()
      
      if (user && token) {
        this.user = user
        this.token = token
        this.isAuthenticated = true
      } else {
        this.clearAuth()
      }
    },

    async login(username, password) {
      this.loading = true
      try {
        const response = await AuthService.signIn(username, password)
        
        this.user = {
          id: response.id,
          username: response.username,
          token: response.token,
          ...AuthService.getCurrentUser()
        }
        this.token = response.token
        this.isAuthenticated = true
        
        // Handle automatic redirection after login
        setTimeout(() => {
          const redirectTo = router.currentRoute.value.query.redirect || '/home'
          router.push(redirectTo)
        }, 1000)
        
        return response
      } catch (error) {
        this.clearAuth()
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(signUpData) {
      this.loading = true
      try {
        const response = await AuthService.signUp(signUpData)
        
        // No guardamos el usuario en el store después del registro
        // Solo retornamos la respuesta para que el componente pueda manejar la redirección
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await AuthService.signOut()
      } catch (error) {
        console.error('Error during logout:', error)
      } finally {
        this.clearAuth()
        this.loading = false
        // Redirect to login after logout
        router.push('/auth/login')
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
    },

    getHomeRoute() {
      if (!this.user?.tenantType) {
        return '/tracklab/client-home'
      }

      switch (this.user.tenantType) {
        case 'CLIENT':
          return '/tracklab/client-home'
        case 'PROVIDER':
          return '/tracklab/provider-home'
        case 'LOGISTIC':
          return '/tracklab/logistics-home'
        default:
          return '/tracklab/client-home'
      }
    }
  }
}) 