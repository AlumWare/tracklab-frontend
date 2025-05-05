import { createRouter, createWebHistory } from 'vue-router'
import StyleGuide from '../shared/components/StyleGuide.vue'
import MainLayout from '../layouts/main-layout.component.vue'
import App from '../App.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainLayout,
      children: [
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
    },
    {
      path: '/style',
      name: 'style',
      component: StyleGuide,
    }
  ],
})

export default router
