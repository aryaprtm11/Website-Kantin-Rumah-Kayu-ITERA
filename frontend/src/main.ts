import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

const app = createApp(App)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark-mode',
      cssLayer: false
    }
  },
  pt: {
    button: {
      root: {
        style: {
          '--p-button-primary-background': '#22c55e',
          '--p-button-primary-border-color': '#22c55e',
          '--p-button-primary-hover-background': '#16a34a',
          '--p-button-primary-hover-border-color': '#16a34a'
        }
      }
    }
  }
})
app.mount('#app')
