import { createRouter, createWebHistory } from 'vue-router'
import StyleGuide from '../shared/components/StyleGuide.vue'
import LoginView from '../core/guards/views/login.component.vue'
import AdminUserManagementView from '../features/orders/views/admin-user-management-view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/admin-usuarios' // opcional: redirige al inicio
    },
    {
      path: '/style',
      name: 'style',
      component: StyleGuide,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/orders',
      name: 'client-orders',
      component: () => import('@/features/orders/views/ClientOrderListView.vue')
    },
    {
      path: '/admin-usuarios',
      name: 'admin-user-management',
      component: AdminUserManagementView
    }
  ],
})

export default router
