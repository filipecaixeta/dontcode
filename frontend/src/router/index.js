import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Content from '@/components/Content'

Vue.use(Router)

export default new Router({
  mode: 'history',
  hash: false,
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '*',
      name: 'content',
      component: Content
    }
  ]
})

