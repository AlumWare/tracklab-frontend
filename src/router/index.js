import { createRouter, createWebHistory } from 'vue-router'
import StyleGuide from '../shared/components/StyleGuide.vue'
import LoginView from '../core/guards/views/login.component.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
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
    }
  ],
})

export default router
