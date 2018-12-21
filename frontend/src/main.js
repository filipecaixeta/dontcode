import Vue from 'vue'
import App from './App'
import router from './router'
import VueSocketIO from 'vue-socket.io'
import { BACKEND_SOCKETIO } from '../config/prod.env'

var VueCodeMirror = require('vue-codemirror-lite')
require('codemirror/theme/monokai.css')
Vue.use(VueCodeMirror)

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  debug: false,
  connection: BACKEND_SOCKETIO
}))

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
