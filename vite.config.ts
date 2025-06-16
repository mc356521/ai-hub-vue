import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // 当请求路径以 /api 开头时，启用代理
      '/api': {
        // 目标后端服务地址
        target: 'http://your-actual-backend-api.com', 
        // 需要虚拟主机站点，启用该配置后，Vite 会将请求头中的 host 修改为目标地址
        changeOrigin: true,
        // 重写请求路径，去掉 /api 前缀
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
})
