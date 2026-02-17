import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(router)
Vue.use(store)

Vue.component('GlobalButton', {
  template: '<button><slot /></button>'
})

Vue.directive('focus', {
  inserted(el) {
    el.focus()
  }
})

Vue.mixin({
  created() {
    console.log('global mixin')
  }
})

Vue.filter('capitalize', function (value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
})

Vue.prototype.$http = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
