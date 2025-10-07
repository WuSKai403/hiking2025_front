import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 將 /api 的請求代理到您的後端 API
      '/api': {
        target: 'https://api.hikingweatherguide.com',
        changeOrigin: true,
        // 注意：這裡不需要重寫路徑，因為您的後端路徑本身就包含 /api
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
