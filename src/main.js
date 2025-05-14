import './shared/styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.css'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import {Card, Image, SelectButton} from 'primevue'
import Aura from '@primevue/themes/aura'
import i18n from "./i18n.js";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

app
    .use(PrimeVue, { ripple: true, theme: { preset: Aura }})
    .component('pv-card', Card)
    .component('pv-image', Image)
    .component('pv-select-button', SelectButton)
    .use(i18n)
    .mount('#app')
