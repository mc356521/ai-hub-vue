import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm-bundler.js', // 添加Vue别名，启用运行时编译
    },
  },
  server: {
    proxy: {
      // 使用正则表达式匹配所有API请求路径
      '^/api': {
        target: 'http://localhost:8080', // 请确保这是您的后端服务地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
