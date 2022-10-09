import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import router from './router/index'
import 'amfe-flexible' // rem 适配

// vant 按需引用
import {
  Toast,
  Popup,
  Button,
  Dialog
} from 'vant'
import MessageBoxPlugin from "./components/MessageBoxPlugin"
Vue.use(VueRouter)
    .use(Toast)
    .use(Popup)
    .use(Button)
    .use(Dialog)
    .use(MessageBoxPlugin)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
