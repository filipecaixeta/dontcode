import Vue from 'vue'
import App from './App'
import router from './router'
import VueSocketIO from 'vue-socket.io'

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  debug: true,
  connection: "http://localhost:8080/"
}))

// export const SocketInstance = socketio(process.env.BACKEND_SOCKETIO)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
