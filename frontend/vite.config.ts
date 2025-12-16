import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vue-vendor': ['vue', 'vue-router'],
          'primevue': ['primevue/config', 'primevue/button', 'primevue/card', 'primevue/dialog', 'primevue/datatable', 'primevue/column', 'primevue/inputtext', 'primevue/password', 'primevue/dropdown', 'primevue/tag', 'primevue/chip', 'primevue/avatar', 'primevue/message', 'primevue/progressspinner', 'primevue/divider', 'primevue/image'],
          'icons': ['lucide-vue-next'],
          'utils': ['axios', 'sweetalert2'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
