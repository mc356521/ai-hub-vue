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
      // 使用正则表达式匹配所有API请求路径
      '^/auth|/classes|/courses|/semesters|/users|/test': {
        target: 'http://localhost:8080', // 请确保这是您的后端服务地址
        changeOrigin: true,
        // 无需重写路径，因为前端请求的路径和后端期望的路径一致
      },
    }
  }
})
