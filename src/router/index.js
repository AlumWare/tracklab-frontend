import { createRouter, createWebHistory } from 'vue-router'
import { AuthService } from '@/features/iam/services/auth.service'
import { authGuard, guestGuard } from '@/features/iam/guards/auth.guard'

// Lazy load components to avoid circular dependencies
const StyleGuide = () => import('../shared/components/StyleGuide.vue')
const MainLayout = () => import('../layouts/main-layout.component.vue')
const AuthLayout = () => import('../layouts/auth-layout.component.vue')
const LoginView = () => import('../features/iam/views/login.component.vue')
const RegisterView = () => import('../features/iam/views/register.component.vue')
const VehicleManagementView = () => import('@/features/resources/views/manage-vehicles.component.vue')
const UserManagementView = () => import('../features/iam/views/user-management.component.vue')
const OrderDetailsView = () => import('@/features/orders/views/OrderDetailsView.vue')
const ClientOrderCreationView = () => import('@/features/orders/views/client-create-order.component.vue')
const OperationHistoryView = () => import('@/features/orders/views/OperationHistoryView.vue')
const OperationExecutionView = () => import('@/features/orders/views/OperationExecutionView.vue')
const RoutePlanningView = () => import('@/features/tracking/views/route-planning.component.vue')
const ClientHomeView = () => import('@/features/home/views/client-home.view.vue')
const LogisticsHomeView = () => import('@/features/home/views/logistics-home.view.vue')
const ContainerDetailView = () => import('@/features/orders/views/ContainerDetailView.vue')
const RegisterCompanyView = () => import('@/features/iam/components/register-company-view.component.vue')
const SubscriptionPlanComponent = () => import('@/core/guards/views/subscription-plan.component.vue')
const WarehouseManagementView = () => import('@/features/resources/views/manage-warehouses.component.vue')
const testComponent = () => import('@/features/tracking/views/test.component.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth/login',
    },
    {
      path: '/home',
      redirect: () => {
        const user = AuthService.getCurrentUser()
        if (!user?.tenantType) {
          return '/tracklab/client-home'
        }

        switch (user.tenantType) {
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
    },
    {
      path: '/auth',
      component: AuthLayout,
      beforeEnter: guestGuard,
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView
        },
        {
          path: 'subscription-plan',
          name: 'subscription-plan',
          component: SubscriptionPlanComponent
        },
        {
          path: 'register-company',
          name: 'register-company',
          component: RegisterCompanyView
        },
        {
          path: 'register-user',
          name: 'register-user',
          component: RegisterView
        }
      ]
    },
    {
      path: '/tracklab',
      name: 'mainLayout',
      component: MainLayout,
      beforeEnter: authGuard,
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
          component: () => import('@/features/orders/views/client-order-list.component.vue')
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
          path: 'admin-usuarios',
          name: 'admin-user-management',
          component: UserManagementView
        },
        {
          path: 'container-detail-view',
          name: 'container-detail-view',
          component: testComponent
        },
        {
          path: 'operation-execution-view',
          name: 'operation-execution-view',
          component: OperationExecutionView
        },
        {
          path: 'orders/:id',
          name: 'order-details',
          component: OrderDetailsView
        },
        {
          path: 'orders/:id/tracking',
          name: 'order-tracking',
          component: () => import('@/features/tracking/views/OrderTrackingView.vue')
        },
        {
          path: 'vehiculos',
          name: 'vehicle-management',
          component: VehicleManagementView
        },
        {
          path: 'ware-house-management-view',
          name: 'ware-house-management-view',
          component: WarehouseManagementView
        },
        {
          path: 'route-planing-view',
          name: 'route-planing-view',
          component: RoutePlanningView
        },
        {
          path: 'styles',
          name: 'styles',
          component: StyleGuide
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/auth/login'
    }
  ]
})

export default router
