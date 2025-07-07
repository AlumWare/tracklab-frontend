import './shared/styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import router from './router'
import i18n from './i18n'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import SelectButton from 'primevue/selectbutton'

// Estilos
import 'primeicons/primeicons.css'
import 'vue-toastification/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.css'


const app = createApp(App)

app.use(createPinia())
    .use(router)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                prefix: 'p',
                darkModeSelector: '.dark-mode'
            }
        }
    })
    .use(Toast, {
      transition: 'Vue-Toastification__bounce',
      maxToasts: 20,
      newestOnTop: true
    })
    .component('pv-button', Button)
    .component('pv-input-text', InputText)
    .component('pv-password', Password)
    .component('pv-card', Card)
    .component('pv-data-table', DataTable)
    .component('pv-column', Column)
    .component('pv-dialog', Dialog)
    .component('pv-dropdown', Dropdown)
    .component('pv-calendar', Calendar)
    .component('pv-textarea', Textarea)
    .component('pv-file-upload', FileUpload)
    .component('pv-progress-bar', ProgressBar)
    .component('pv-select-button', SelectButton)
    .use(i18n)
    .mount('#app')
