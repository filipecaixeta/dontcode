import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'
import io from 'socket.io-client'

Vue.use(new VueSocketIO({
  debug: true,
  connection: io.connect(process.env.VUE_APP_BACKEND_SOCKETIO, {
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax : 2000,
    reconnectionAttempts: Infinity
  })
}))


Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')
