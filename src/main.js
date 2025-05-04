import './shared/styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import {Card, Image, SelectButton} from 'primevue'
import Aura from '@primevue/themes/aura'
import i18n from "./i18n.js";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app
    .use(PrimeVue, { ripple: true, theme: { preset: Aura }})
    .component('pv-card', Card)
    .component('pv-image', Image)
    .component('pv-select-button', SelectButton)
    .use(i18n)
    .mount('#app')
