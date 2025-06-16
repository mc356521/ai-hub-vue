import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

// 创建 Vue 应用实例
const app = createApp(App);

// 创建并使用 Pinia
const pinia = createPinia();
app.use(pinia);

// 使用路由
app.use(router);

// 全局注册 VChart 组件（如果需要在多个组件中使用）
// import VChart from 'vue-echarts';
// app.component('v-chart', VChart);

// 挂载应用
app.mount('#app');
