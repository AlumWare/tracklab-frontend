import { AuthService } from '../services/auth.service'

/**
 * Authentication guard for protecting routes
 * @param {Object} to - Route to navigate to
 * @param {Object} from - Route navigating from
 * @param {Function} next - Navigation function
 */
export const authGuard = (to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated()
  
  if (!isAuthenticated) {
    // Store the intended route for redirecting after login
    const redirectQuery = to.fullPath !== '/' ? { redirect: to.fullPath } : {}
    
    next({
      name: 'login',
      query: redirectQuery
    })
  } else {
    next()
  }
}

/**
 * Guest guard for authentication pages (login, register)
 * Redirects authenticated users to home
 */
export const guestGuard = (to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated()
  
  if (isAuthenticated) {
    next('/home')
  } else {
    next()
  }
} 