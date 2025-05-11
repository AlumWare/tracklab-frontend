import { createRouter, createWebHistory } from 'vue-router'
import StyleGuide from '../shared/components/StyleGuide.vue'
import LoginView from '../core/guards/views/login.component.vue'
import VehicleManagementView from '@/features/orders/views/vehicle-management-view.vue'
import AdminUserManagementView from '@/features/orders/views/admin-user-management-view.vue' // Asegúrate que este archivo existe
import OrderDetailsView from '@/features/orders/views/OrderDetailsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/admin-usuarios' // redirección inicial
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
      path: '/orders/:id',
      name: 'order-details',
      component: OrderDetailsView
    },
    {
      path: '/vehiculos',
      name: 'vehicle-management',
      component: VehicleManagementView
    },
    {
      path: '/admin-usuarios',
      name: 'admin-user-management',
      component: AdminUserManagementView
    }
  ]
})

export default router
