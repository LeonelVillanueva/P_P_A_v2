import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { inject } from '@vercel/analytics'

const app = createApp(App)
const pinia = createPinia()

// Initialize Vercel Web Analytics
inject()

app.use(pinia)
app.use(router)
app.mount('#app')

