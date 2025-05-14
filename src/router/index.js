import { createRouter, createWebHistory } from 'vue-router'
import StyleGuide from '../shared/components/StyleGuide.vue'
import MainLayout from '../layouts/main-layout.component.vue'
import App from '../App.vue'
import LoginView from '../core/guards/views/login.component.vue'
import VehicleManagementView from '@/features/orders/views/vehicle-management-view.vue'
import AdminUserManagementView from '@/features/orders/views/admin-user-management-view.vue' // Asegúrate que este archivo existe
import OrderDetailsView from '@/features/orders/views/OrderDetailsView.vue'
import ClientOrderCreationView from '@/features/orders/views/ClientOrderCreationView.vue'
import OperationHistoryView from '@/features/orders/views/OperationHistoryView.vue'
import OperationExecutionView from '@/features/orders/views/OperationExecutionView.vue'
import routePlanningView from '@/features/orders/views/route-planning-view.vue'
import ClientHomeView from '@/features/home/views/client-home.view.vue'
import LogisticsHomeView from '@/features/home/views/logistics-home.view.vue'
import ContainerDetailView from '@/features/orders/views/ContainerDetailView.vue'
import RegisterCompanyView from '@/features/security/components/register-company-view.component.vue'
import RegisterUser from '@/core/guards/views/register.component.vue'
import SubscriptionPlanComponent from '@/core/guards/views/subscription-plan.component.vue'
import WareHouseManagementView from '@/features/orders/views/ware-house-management-view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: LoginView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/subscription-plan',
      name: 'subscription-plan',
      component: SubscriptionPlanComponent
    },
    {
      path: '/register-company',
      name: 'register-company',
      component: RegisterCompanyView,
    },
    {
      path: '/register-user',
      name: 'register-user',
      component: RegisterUser,
    },
    {
      path: '/tracklab',
      name: 'mainLayout',
      component: MainLayout,
      children: [
        {
          path: 'client-home',
          name: 'client-home',
          component: ClientHomeView
        },
        {
          path: 'logistics-home',
          name: 'logistics-home',
          component: LogisticsHomeView
        },
        {
          path: 'orders',
          name: 'client-orders',
          component: () => import('@/features/orders/views/ClientOrderListView.vue')
        },
        {
          path: 'orders/create',
          name: 'create-order',
          component: ClientOrderCreationView
        },
        {
          path: 'orders/history',
          name: 'operation-history',
          component: OperationHistoryView
        },
        {
          path: '/admin-usuarios',
          name: 'admin-user-management',
          component: AdminUserManagementView
        },
        {
          path: '/container-detail-view',
          name: 'container-detail-view',
          component: ContainerDetailView
        },
        {
          path: '/operation-execution-view',
          name: 'operation-execution-view',
          component: OperationExecutionView
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
          path: '/ware-house-management-view',
          name: 'ware-house-management-view',
          component: WareHouseManagementView
        },
        {
          path: '/route-planing-view',
          name: 'route-planing-view',
          component: routePlanningView
        },
        {
          path: 'styles',
          name: 'styles',
          component: StyleGuide,
        },
        {
          path: '',
          name: 'caldo',
          component: App,
        },
      ],
      redirect: '/admin-usuarios' // redirección inicial
    },
    {
      path: '/style',
      name: 'style',
      component: StyleGuide,
    }
  ]
})

export default router
