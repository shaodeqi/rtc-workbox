import Vue from 'vue'
import App from './App.vue'
import { register } from './service-worker'
register();

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app');
