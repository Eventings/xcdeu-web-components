import XcComponents from '../index'
import App from './App.vue'

window.XcComponents = XcComponents

new window.Vue({
  el: '#app',
  render: h => h(App)
})
