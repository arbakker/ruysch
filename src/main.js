import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import store from './store'

Vue.use(VueRouter)
Vue.config.productionTip = false

// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter
// and then call `Vue.use(VueRouter)`.

// 1. Define route components.
// These can be imported from other files
import Search from './components/Search.vue'
import WMSMap from './components/WMSMap.vue'



// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/home', component: Search },
  { path: '/wms-service/:serviceId', component: WMSMap, name: 'wmsService', },
  { path: '/', redirect: '/home' },
  { path: '*', redirect: 'home'}
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes // short for `routes: routes`
})

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
