import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({
  debug: true,
  connection: process.env.VUE_APP_BACKEND_SOCKETIO
}))


Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')
